from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.workspace import Workspace
from app.schemas.brand_profile import (
    BrandProfileCreate,
    BrandProfileUpdate,
    BrandProfileResponse,
    BrandContextResponse,
)
from app.services.brand_profile_service import BrandProfileService
from app.services.brand_context_service import BrandContextService
from app.api.deps import get_current_workspace_for_user

router = APIRouter()


@router.get("", response_model=BrandProfileResponse)
def get_brand_profile(
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace_for_user),
):
    """
    Fetch the brand profile for the current workspace.
    """
    return BrandProfileService.get_brand_profile_or_404(db, workspace.id)


@router.post("", response_model=BrandProfileResponse, status_code=status.HTTP_201_CREATED)
def create_brand_profile(
    profile_in: BrandProfileCreate,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace_for_user),
):
    """
    Create a new brand profile for the current workspace.
    """
    return BrandProfileService.create_brand_profile(db, workspace.id, profile_in)


@router.put("", response_model=BrandProfileResponse)
def update_brand_profile(
    profile_in: BrandProfileUpdate,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace_for_user),
):
    """
    Update existing brand profile for the current workspace.
    """
    return BrandProfileService.update_brand_profile(db, workspace.id, profile_in)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_brand_profile(
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace_for_user),
):
    """
    Delete brand profile for the current workspace.
    """
    BrandProfileService.delete_brand_profile(db, workspace.id)
    return None


@router.get("/context", response_model=BrandContextResponse)
def get_brand_context(
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace_for_user),
):
    """
    Fetch normalized brand context object for AI Brand Brain foundation.
    """
    return BrandContextService.get_normalized_brand_context(db, workspace.id)
