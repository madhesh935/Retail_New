from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]

class Settings(BaseSettings):
    APP_NAME: str = "FastAPI Backend"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = True
    
    # SQLite local DB
    DATABASE_URL: str = "sqlite:///./backend.db"
    
    # Firebase settings
    FIREBASE_CREDENTIALS_PATH: str = "./firebase-service-account.json"
    
    # OpenRouter API Key
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_CHAT_MODEL: str = "openai/gpt-4o-mini"
    OPENROUTER_EMBEDDING_MODEL: str = "openai/text-embedding-3-small"
    OPENROUTER_SITE_URL: str = "http://localhost:5173"
    OPENROUTER_APP_NAME: str = "Retail Edge OS"
    OPENROUTER_TIMEOUT_SECONDS: float = 45.0

    # Retrieval-augmented generation settings
    RAG_KNOWLEDGE_DIR: Path = BACKEND_DIR / "data" / "knowledge"
    RAG_INDEX_PATH: Path = BACKEND_DIR / "data" / "rag_index.json"
    RAG_TOP_K: int = 5
    RAG_CHUNK_SIZE: int = 1200
    RAG_CHUNK_OVERLAP: int = 180
    RAG_MAX_CONTEXT_CHARS: int = 7000
    RAG_EMBEDDING_BATCH_SIZE: int = 32

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug_mode(cls, value):
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "production", "prod"}:
                return False
            if normalized in {"development", "dev"}:
                return True
        return value

    # Works whether uvicorn is launched from the repository root or /backend.
    model_config = SettingsConfigDict(
        env_file=("backend/.env", ".env"),
        extra="ignore",
    )

settings = Settings()
