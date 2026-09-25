from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class BrandProfileBase(BaseModel):
    brand_name: str = Field(..., min_length=1, max_length=255, description="Brand or company name")
    industry: Optional[str] = Field(None, max_length=255)
    products_services: Optional[str] = Field(None)
    target_audience: Optional[str] = Field(None)
    location: Optional[str] = Field(None, max_length=255)
    brand_tone: Optional[str] = Field(None, max_length=255)
    brand_colors: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=255)
    competitors: Optional[str] = Field(None)
    usp: Optional[str] = Field(None, description="Unique Selling Proposition")
    business_goals: Optional[str] = Field(None)
    preferred_language: Optional[str] = Field("English", max_length=100)


class BrandProfileCreate(BrandProfileBase):
    pass


class BrandProfileUpdate(BaseModel):
    brand_name: Optional[str] = Field(None, min_length=1, max_length=255)
    industry: Optional[str] = Field(None, max_length=255)
    products_services: Optional[str] = Field(None)
    target_audience: Optional[str] = Field(None)
    location: Optional[str] = Field(None, max_length=255)
    brand_tone: Optional[str] = Field(None, max_length=255)
    brand_colors: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=255)
    competitors: Optional[str] = Field(None)
    usp: Optional[str] = Field(None)
    business_goals: Optional[str] = Field(None)
    preferred_language: Optional[str] = Field(None, max_length=100)


class BrandProfileResponse(BrandProfileBase):
    id: UUID
    workspace_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BrandContextResponse(BaseModel):
    workspace_id: UUID
    brand_name: str
    industry: str
    products_services: str
    target_audience: str
    location: str
    brand_tone: str
    brand_colors: str
    website: str
    competitors: str
    usp: str
    business_goals: str
    preferred_language: str
    is_ready: bool
    formatted_context_prompt: str

    model_config = ConfigDict(from_attributes=True)
