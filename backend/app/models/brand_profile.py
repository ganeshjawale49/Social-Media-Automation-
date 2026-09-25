import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.types import Uuid
from app.core.database import Base


class BrandProfile(Base):
    __tablename__ = "brand_profiles"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    workspace_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )

    brand_name = Column(String(255), nullable=False)
    industry = Column(String(255), nullable=True)
    products_services = Column(Text, nullable=True)
    target_audience = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    brand_tone = Column(String(255), nullable=True)
    brand_colors = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    competitors = Column(Text, nullable=True)
    usp = Column(Text, nullable=True)
    business_goals = Column(Text, nullable=True)
    preferred_language = Column(String(100), nullable=True, default="English")

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    workspace = relationship("Workspace", back_populates="brand_profile")
