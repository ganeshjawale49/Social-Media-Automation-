import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.types import Uuid
from app.core.database import Base


class SocialConnection(Base):
    __tablename__ = "social_connections"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    workspace_id = Column(Uuid(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    provider = Column(String(50), nullable=False)  # instagram, linkedin, x
    provider_account_id = Column(String(255), nullable=True)
    account_name = Column(String(255), nullable=True)
    username = Column(String(255), nullable=True)
    encrypted_access_token = Column(Text, nullable=False)
    encrypted_refresh_token = Column(Text, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    scopes = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="connected")  # connected, expired, error, disconnected
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    workspace = relationship("Workspace", back_populates="social_connections")

    __table_args__ = (
        UniqueConstraint("workspace_id", "provider", name="uq_workspace_provider"),
        Index("ix_social_connections_workspace_provider", "workspace_id", "provider"),
    )
