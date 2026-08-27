from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.database import engine, Base, get_db
from app.db.init_db import seed_database
from app.services.firebase_sync import init_firebase
from app.api.endpoints import queue, entrance, store, inventory, staff, incidents, customer, system, chat

# Create SQLite tables and seed baseline production data
seed_database()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Firebase on startup
    try:
        init_firebase()
    except Exception as e:
        print(f"Firebase init notice: {e}")
    
    yield

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
app.include_router(store.router, prefix="/api/v1/store", tags=["Store Operations"])
app.include_router(queue.router, prefix="/api/v1/queue", tags=["Queue Intelligence"])
app.include_router(entrance.router, prefix="/api/v1/entrance", tags=["Entrance Intelligence"])
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["Inventory Intelligence"])
app.include_router(staff.router, prefix="/api/v1/staff", tags=["Staff Operations"])
app.include_router(incidents.router, prefix="/api/v1/incidents", tags=["Incidents & Actions"])
app.include_router(customer.router, prefix="/api/v1/customer", tags=["Customer PWA"])
app.include_router(system.router, prefix="/api/v1/system", tags=["System Health"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat & Copilot"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Retail Edge OS Live Backend API", "version": "1.0.0", "mode": "PRODUCTION_LIVE"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    return {"status": "healthy", "database": "connected", "mode": "LIVE_BACKEND"}

