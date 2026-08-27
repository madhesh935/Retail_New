from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.rag import rag_service


router = APIRouter()


class SearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=2_000)
    top_k: int = Field(default=5, ge=1, le=10)


@router.get("/status")
def rag_status():
    return rag_service.status()


@router.post("/reindex")
async def reindex(force: bool = False, db: Session = Depends(get_db)):
    stats = await rag_service.refresh(db, force=force)
    return {"status": "ready", **stats}


@router.post("/search")
async def search(request: SearchRequest, db: Session = Depends(get_db)):
    results, diagnostics = await rag_service.retrieve(
        request.query,
        db,
        top_k=request.top_k,
    )
    return {
        "query": request.query,
        "results": [result.to_source() for result in results],
        "retrieval": diagnostics,
    }
