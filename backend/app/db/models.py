from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    price = Column(Integer)
    is_synced = Column(Boolean, default=False) # Important for firebase sync logic
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    lane_code = Column(String, unique=True, index=True) # e.g. "C1", "C2"
    stream_url = Column(String, nullable=True) # e.g. "http://192.168.1.5:8080/video"
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
