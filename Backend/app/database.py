from sqlalchemy import Column, Integer, String, Boolean, DateTime, create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set!")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://") and "+psycopg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class Reminder(Base):
    __tablename__ = 'reminders'
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    time = Column(String, nullable=True)
    context = Column(String, default='Work')
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)