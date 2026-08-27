import tempfile
import unittest
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import Settings
from app.db.database import Base
from app.db.models import ProductModel
from app.services.rag import (
    RAGIndex,
    RetailDocument,
    load_database_documents,
    load_knowledge_documents,
)


class FakeOpenRouterClient:
    class Config:
        OPENROUTER_API_KEY = "test-key"

    config = Config()

    async def create_embeddings(self, texts):
        vectors = []
        for text in texts:
            lowered = text.lower()
            vectors.append([
                1.0 if "milk" in lowered else 0.0,
                1.0 if "queue" in lowered else 0.0,
            ])
        return vectors


class RAGIndexTests(unittest.IsolatedAsyncioTestCase):
    async def test_refresh_caches_embeddings_and_retrieves_relevant_document(self):
        with tempfile.TemporaryDirectory() as directory:
            index = RAGIndex(Path(directory) / "index.json", "test-embedding")
            documents = [
                RetailDocument("milk", "Milk stock", "Milk is on shelf C2", "test:milk"),
                RetailDocument("queue", "Queue policy", "Open a lane for queue congestion", "test:queue"),
            ]

            stats = await index.refresh(
                documents, FakeOpenRouterClient(), batch_size=10
            )
            results = index.search("Where is milk?", [1.0, 0.0], top_k=1)

            self.assertEqual(stats["embedded"], 2)
            self.assertEqual(results[0].document.id, "milk")
            self.assertTrue((Path(directory) / "index.json").exists())


class DocumentLoaderTests(unittest.TestCase):
    def test_loads_markdown_and_csv_knowledge(self):
        with tempfile.TemporaryDirectory() as directory:
            knowledge_dir = Path(directory) / "knowledge"
            knowledge_dir.mkdir()
            (knowledge_dir / "policy.md").write_text(
                "Milk returns require a receipt.", encoding="utf-8"
            )
            (knowledge_dir / "suppliers.csv").write_text(
                "supplier,category\nDairyCo,milk\n", encoding="utf-8"
            )
            config = Settings(
                _env_file=None,
                RAG_KNOWLEDGE_DIR=knowledge_dir,
                RAG_INDEX_PATH=Path(directory) / "index.json",
            )

            documents = load_knowledge_documents(config)

            self.assertEqual(len(documents), 2)
            self.assertTrue(any("DairyCo" in document.content for document in documents))

    def test_converts_live_database_rows_to_documents(self):
        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(engine)
        session = sessionmaker(bind=engine)()
        try:
            session.add(
                ProductModel(
                    id="prod-test",
                    name="Test Milk",
                    brand="DairyCo",
                    category="Dairy",
                    price="₹50",
                    price_num=50.0,
                    aisle="Aisle 2",
                    shelf="C2",
                    stock_count=7,
                )
            )
            session.commit()

            documents = load_database_documents(session)
            product = next(doc for doc in documents if doc.id == "db:products:prod-test")

            self.assertIn("Test Milk", product.content)
            self.assertEqual(product.metadata["kind"], "live_database")
        finally:
            session.close()


if __name__ == "__main__":
    unittest.main()
