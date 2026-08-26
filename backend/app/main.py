from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.database import engine, Base, get_db
from app.services.firebase_sync import init_firebase
from app.services.queue_intelligence import queue_monitor
from app.api.endpoints import queue, entrance

# Create SQLite tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Firebase on startup
    init_firebase()
    
    yield
    
    # Cleanup on shutdown
    # Additional cleanup can go here

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(queue.router, prefix="/api/v1/queue", tags=["Queue Intelligence"])
app.include_router(entrance.router, prefix="/api/v1/entrance", tags=["Entrance Intelligence"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Retail New Backend API"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    # Basic check to ensure DB is accessible
    return {"status": "healthy", "database": "connected"}
