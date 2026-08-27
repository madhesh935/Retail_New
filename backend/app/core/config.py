from pydantic_settings import BaseSettings, SettingsConfigDict

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
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
