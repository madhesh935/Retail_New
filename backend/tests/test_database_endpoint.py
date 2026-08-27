import unittest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.endpoints.database import get_all_database_data
from app.db.database import Base
from app.db.init_db import seed_database


class DatabaseEndpointTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        self.factory = sessionmaker(bind=self.engine)
        seed_database(self.engine, self.factory)

    def tearDown(self):
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def test_all_route_returns_every_registered_table(self):
        session = self.factory()
        try:
            response = get_all_database_data(session)
            expected_tables = set(Base.metadata.tables)

            self.assertEqual(set(response["data"]), expected_tables)
            self.assertEqual(response["summary"]["tableCount"], len(expected_tables))
            self.assertEqual(response["summary"]["rowCountByTable"]["items"], 54)
            self.assertEqual(response["summary"]["rowCountByTable"]["products"], 54)
            self.assertEqual(response["summary"]["rowCountByTable"]["navigation_nodes"], 49)
            self.assertEqual(response["data"]["store_layouts"][0]["entrance_node_id"], "nav-entry-main")
            self.assertIsInstance(response["data"]["store_info"][0]["updated_at"], str)
        finally:
            session.close()


if __name__ == "__main__":
    unittest.main()
