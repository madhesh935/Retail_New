from __future__ import annotations

import asyncio
import csv
import hashlib
import json
import math
import re
from dataclasses import asdict, dataclass, field
from datetime import date, datetime
from pathlib import Path
from typing import Any, Iterable

from sqlalchemy import inspect as sqlalchemy_inspect
from sqlalchemy.orm import Session

from app.core.config import Settings, settings
from app.db.models import (
    Camera,
    IncidentModel,
    InventoryBatchModel,
    Item,
    MarkdownCandidateModel,
    NavigationEdgeModel,
    NavigationNodeModel,
    ProductModel,
    QueueModel,
    RetailMetricModel,
    ShelfModel,
    StaffModel,
    StaffTaskModel,
    StoreAreaModel,
    StoreLayoutModel,
    StoreModel,
    WasteRecordModel,
    ZoneModel,
)
from app.services.openrouter import OpenRouterClient, OpenRouterError


SUPPORTED_KNOWLEDGE_EXTENSIONS = {".md", ".txt", ".json", ".csv"}
TOKEN_RE = re.compile(r"[a-z0-9]+")
STOP_WORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
    "how", "i", "in", "is", "it", "of", "on", "or", "our", "the",
    "to", "was", "what", "when", "where", "which", "who", "with",
}


@dataclass(slots=True)
class RetailDocument:
    id: str
    title: str
    content: str
    source: str
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def fingerprint(self) -> str:
        payload = json.dumps(
            {
                "title": self.title,
                "content": self.content,
                "source": self.source,
                "metadata": self.metadata,
            },
            sort_keys=True,
            ensure_ascii=False,
            default=str,
        )
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()


@dataclass(slots=True)
class RetrievalResult:
    document: RetailDocument
    score: float
    semantic_score: float
    lexical_score: float

    def to_source(self) -> dict[str, Any]:
        return {
            "id": self.document.id,
            "title": self.document.title,
            "source": self.document.source,
            "score": round(self.score, 4),
            "metadata": self.document.metadata,
            "excerpt": self.document.content[:360],
        }


@dataclass(slots=True)
class IndexEntry:
    document: RetailDocument
    fingerprint: str
    embedding: list[float]


def _stable_id(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:20]


def _json_safe(value: Any) -> Any:
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    if isinstance(value, (dict, list)):
        return json.loads(json.dumps(value, default=str))
    return str(value)


def chunk_text(text: str, chunk_size: int, overlap: int) -> list[str]:
    """Split text on paragraph/word boundaries while retaining small overlaps."""
    normalized = re.sub(r"\r\n?", "\n", text).strip()
    if not normalized:
        return []
    if len(normalized) <= chunk_size:
        return [normalized]

    chunks: list[str] = []
    start = 0
    while start < len(normalized):
        hard_end = min(start + chunk_size, len(normalized))
        end = hard_end
        if hard_end < len(normalized):
            paragraph_break = normalized.rfind("\n\n", start, hard_end)
            sentence_break = normalized.rfind(". ", start, hard_end)
            word_break = normalized.rfind(" ", start, hard_end)
            candidate = max(paragraph_break, sentence_break, word_break)
            if candidate > start + chunk_size // 2:
                end = candidate + (2 if candidate == sentence_break else 0)
        chunks.append(normalized[start:end].strip())
        if end >= len(normalized):
            break
        start = max(end - overlap, start + 1)
    return [chunk for chunk in chunks if chunk]


def _file_documents(path: Path, knowledge_dir: Path, config: Settings) -> list[RetailDocument]:
    relative_source = path.relative_to(knowledge_dir).as_posix()
    source = f"knowledge:{relative_source}"
    title = path.stem.replace("_", " ").replace("-", " ").title()

    if path.suffix.lower() == ".csv":
        documents: list[RetailDocument] = []
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            for row_number, row in enumerate(csv.DictReader(handle), start=2):
                clean_row = {str(key): _json_safe(value) for key, value in row.items()}
                content = "; ".join(
                    f"{key.replace('_', ' ')}: {value}"
                    for key, value in clean_row.items()
                    if value not in (None, "")
                )
                if content:
                    documents.append(
                        RetailDocument(
                            id=f"file:{_stable_id(source)}:row-{row_number}",
                            title=f"{title} row {row_number}",
                            content=content,
                            source=source,
                            metadata={"kind": "knowledge", "row": row_number},
                        )
                    )
        return documents

    text = path.read_text(encoding="utf-8-sig")
    if path.suffix.lower() == ".json":
        try:
            text = json.dumps(json.loads(text), ensure_ascii=False, indent=2)
        except json.JSONDecodeError:
            # Keep malformed JSON retrievable as plain text; status remains observable.
            pass

    chunks = chunk_text(text, config.RAG_CHUNK_SIZE, config.RAG_CHUNK_OVERLAP)
    return [
        RetailDocument(
            id=f"file:{_stable_id(source)}:chunk-{index}",
            title=title if len(chunks) == 1 else f"{title} (part {index + 1})",
            content=chunk,
            source=source,
            metadata={"kind": "knowledge", "chunk": index},
        )
        for index, chunk in enumerate(chunks)
    ]


def load_knowledge_documents(config: Settings = settings) -> list[RetailDocument]:
    knowledge_dir = Path(config.RAG_KNOWLEDGE_DIR)
    if not knowledge_dir.exists():
        return []

    documents: list[RetailDocument] = []
    for path in sorted(knowledge_dir.rglob("*")):
        if path.is_file() and path.suffix.lower() in SUPPORTED_KNOWLEDGE_EXTENSIONS:
            documents.extend(_file_documents(path, knowledge_dir, config))
    return documents


DATABASE_MODELS = (
    StoreModel,
    ZoneModel,
    ShelfModel,
    ProductModel,
    StoreLayoutModel,
    StoreAreaModel,
    NavigationNodeModel,
    NavigationEdgeModel,
    QueueModel,
    StaffModel,
    StaffTaskModel,
    IncidentModel,
    Item,
    Camera,
    InventoryBatchModel,
    MarkdownCandidateModel,
    WasteRecordModel,
    RetailMetricModel,
)


def load_database_documents(db: Session) -> list[RetailDocument]:
    """Turn each live operational database row into one retrievable document."""
    documents: list[RetailDocument] = []
    for model in DATABASE_MODELS:
        mapper = sqlalchemy_inspect(model)
        primary_keys = [column.key for column in mapper.primary_key]
        for record in db.query(model).all():
            values = {
                column.key: _json_safe(getattr(record, column.key))
                for column in mapper.columns
            }
            record_key = ":".join(str(values[key]) for key in primary_keys)
            table = model.__tablename__
            display_name = (
                values.get("name")
                or values.get("title")
                or values.get("code")
                or values.get("lane_code")
                or record_key
            )
            content = "; ".join(
                f"{key.replace('_', ' ')}: {value}"
                for key, value in values.items()
                if value is not None
            )
            documents.append(
                RetailDocument(
                    id=f"db:{table}:{record_key}",
                    title=f"{table.replace('_', ' ').title()}: {display_name}",
                    content=content,
                    source=f"database:{table}/{record_key}",
                    metadata={
                        "kind": "live_database",
                        "table": table,
                        "record_id": record_key,
                    },
                )
            )
    return documents


def _tokens(text: str) -> set[str]:
    return {
        token for token in TOKEN_RE.findall(text.lower())
        if token not in STOP_WORDS and len(token) > 1
    }


def _cosine_similarity(left: list[float], right: list[float]) -> float:
    if not left or not right or len(left) != len(right):
        return 0.0
    dot = sum(a * b for a, b in zip(left, right))
    left_norm = math.sqrt(sum(value * value for value in left))
    right_norm = math.sqrt(sum(value * value for value in right))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return dot / (left_norm * right_norm)


class RAGIndex:
    def __init__(self, path: Path, embedding_model: str):
        self.path = Path(path)
        self.embedding_model = embedding_model
        self.entries: dict[str, IndexEntry] = {}
        self.updated_at: str | None = None
        self.last_embedding_error: str | None = None
        self._load()

    def _load(self) -> None:
        if not self.path.exists():
            return
        try:
            payload = json.loads(self.path.read_text(encoding="utf-8"))
            if payload.get("embedding_model") != self.embedding_model:
                return
            for raw_entry in payload.get("entries", []):
                document = RetailDocument(**raw_entry["document"])
                self.entries[document.id] = IndexEntry(
                    document=document,
                    fingerprint=raw_entry["fingerprint"],
                    embedding=raw_entry.get("embedding", []),
                )
            self.updated_at = payload.get("updated_at")
        except (OSError, ValueError, KeyError, TypeError):
            self.entries = {}

    def _save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "version": 1,
            "embedding_model": self.embedding_model,
            "updated_at": self.updated_at,
            "entries": [
                {
                    "document": asdict(entry.document),
                    "fingerprint": entry.fingerprint,
                    "embedding": entry.embedding,
                }
                for entry in self.entries.values()
            ],
        }
        temporary_path = self.path.with_suffix(f"{self.path.suffix}.tmp")
        temporary_path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2, default=str),
            encoding="utf-8",
        )
        temporary_path.replace(self.path)

    async def refresh(
        self,
        documents: Iterable[RetailDocument],
        client: OpenRouterClient,
        *,
        batch_size: int,
        force: bool = False,
    ) -> dict[str, Any]:
        document_map = {document.id: document for document in documents}
        next_entries: dict[str, IndexEntry] = {}
        pending: list[RetailDocument] = []

        for document in document_map.values():
            existing = self.entries.get(document.id)
            if (
                not force
                and existing
                and existing.fingerprint == document.fingerprint
                and existing.embedding
            ):
                next_entries[document.id] = existing
            else:
                next_entries[document.id] = IndexEntry(
                    document=document,
                    fingerprint=document.fingerprint,
                    embedding=[],
                )
                pending.append(document)

        self.entries = next_entries
        self.last_embedding_error = None
        embedded_count = 0
        if pending and client.config.OPENROUTER_API_KEY:
            try:
                for start in range(0, len(pending), batch_size):
                    batch = pending[start : start + batch_size]
                    vectors = await client.create_embeddings(
                        [f"{doc.title}\n{doc.content}" for doc in batch]
                    )
                    for document, vector in zip(batch, vectors):
                        self.entries[document.id].embedding = vector
                        embedded_count += 1
            except OpenRouterError as exc:
                self.last_embedding_error = str(exc)

        self.updated_at = datetime.now().astimezone().isoformat()
        self._save()
        return {
            "documents": len(self.entries),
            "embedded": sum(bool(entry.embedding) for entry in self.entries.values()),
            "new_embeddings": embedded_count,
            "embedding_error": self.last_embedding_error,
        }

    def search(
        self,
        query: str,
        query_embedding: list[float] | None,
        top_k: int,
    ) -> list[RetrievalResult]:
        query_tokens = _tokens(query)
        normalized_query = query.lower().strip()
        results: list[RetrievalResult] = []

        for entry in self.entries.values():
            searchable = f"{entry.document.title} {entry.document.content}"
            document_tokens = _tokens(searchable)
            overlap = len(query_tokens & document_tokens)
            lexical = overlap / math.sqrt(max(len(query_tokens), 1) * max(len(document_tokens), 1))
            if normalized_query and normalized_query in searchable.lower():
                lexical = min(1.0, lexical + 0.3)

            semantic = _cosine_similarity(query_embedding or [], entry.embedding)
            semantic = max(0.0, semantic)
            score = (0.78 * semantic + 0.22 * lexical) if query_embedding else lexical
            if score > 0:
                results.append(
                    RetrievalResult(
                        document=entry.document,
                        score=score,
                        semantic_score=semantic,
                        lexical_score=lexical,
                    )
                )

        results.sort(key=lambda item: item.score, reverse=True)
        return results[:top_k]

    def status(self) -> dict[str, Any]:
        return {
            "documents": len(self.entries),
            "embedded_documents": sum(
                bool(entry.embedding) for entry in self.entries.values()
            ),
            "embedding_model": self.embedding_model,
            "updated_at": self.updated_at,
            "last_embedding_error": self.last_embedding_error,
        }


class RAGService:
    def __init__(
        self,
        config: Settings = settings,
        client: OpenRouterClient | None = None,
    ):
        self.config = config
        self.client = client or OpenRouterClient(config)
        self.index = RAGIndex(
            Path(config.RAG_INDEX_PATH), config.OPENROUTER_EMBEDDING_MODEL
        )
        self._refresh_lock = asyncio.Lock()

    async def refresh(self, db: Session, *, force: bool = False) -> dict[str, Any]:
        async with self._refresh_lock:
            documents = load_knowledge_documents(self.config)
            documents.extend(load_database_documents(db))
            return await self.index.refresh(
                documents,
                self.client,
                batch_size=self.config.RAG_EMBEDDING_BATCH_SIZE,
                force=force,
            )

    async def retrieve(
        self,
        question: str,
        db: Session,
        *,
        top_k: int | None = None,
    ) -> tuple[list[RetrievalResult], dict[str, Any]]:
        refresh_stats = await self.refresh(db)
        query_embedding: list[float] | None = None
        retrieval_method = "lexical"

        if refresh_stats["embedded"] and self.config.OPENROUTER_API_KEY:
            try:
                query_embedding = (await self.client.create_embeddings([question]))[0]
                retrieval_method = "hybrid"
            except OpenRouterError as exc:
                self.index.last_embedding_error = str(exc)

        results = self.index.search(
            question,
            query_embedding,
            top_k or self.config.RAG_TOP_K,
        )
        diagnostics = {
            **refresh_stats,
            "retrieval_method": retrieval_method,
            "matches": len(results),
        }
        return results, diagnostics

    def build_context(self, results: list[RetrievalResult]) -> str:
        if not results:
            return "No matching company context was retrieved."

        blocks: list[str] = []
        total_length = 0
        for index, result in enumerate(results, start=1):
            freshness = (
                "live database record"
                if result.document.metadata.get("kind") == "live_database"
                else "company knowledge file"
            )
            block = (
                f"[Source {index}] {result.document.source} ({freshness})\n"
                f"Title: {result.document.title}\n"
                f"{result.document.content}"
            )
            if total_length + len(block) > self.config.RAG_MAX_CONTEXT_CHARS:
                remaining = self.config.RAG_MAX_CONTEXT_CHARS - total_length
                if remaining > 200:
                    blocks.append(block[:remaining])
                break
            blocks.append(block)
            total_length += len(block)
        return "\n\n".join(blocks)

    def status(self) -> dict[str, Any]:
        return {
            **self.index.status(),
            "knowledge_directory": str(self.config.RAG_KNOWLEDGE_DIR),
            "index_path": str(self.config.RAG_INDEX_PATH),
            "chat_model": self.config.OPENROUTER_CHAT_MODEL,
            "api_key_configured": bool(self.config.OPENROUTER_API_KEY),
        }


rag_service = RAGService()
