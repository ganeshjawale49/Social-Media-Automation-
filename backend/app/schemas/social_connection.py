from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from uuid import UUID


class SocialConnectionRead(BaseModel):
    id: UUID
    workspace_id: UUID
    provider: str
    provider_account_id: Optional[str] = None
    account_name: Optional[str] = None
    username: Optional[str] = None
    expires_at: Optional[datetime] = None
    scopes: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SocialConnectionStatusItem(BaseModel):
    provider: str
    is_connected: bool
    is_configured: bool
    connection: Optional[SocialConnectionRead] = None
    required_env_vars: List[str]


class SocialConnectionListResponse(BaseModel):
    workspace_id: UUID
    connections: List[SocialConnectionStatusItem]


class ConnectUrlResponse(BaseModel):
    authorization_url: str
    state: str
    provider: str
    is_configured: bool
