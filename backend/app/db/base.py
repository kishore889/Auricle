"""
SQLAlchemy declarative base and shared column helpers.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """All ORM models inherit from this base."""
    pass
