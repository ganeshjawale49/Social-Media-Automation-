from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate, WorkspaceResponse
from app.services.workspace_service import WorkspaceService
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[WorkspaceResponse])
def list_workspaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all workspaces accessible by current user.
    """
    return WorkspaceService.get_user_workspaces(db, current_user.id)


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
def create_workspace(
    ws_in: WorkspaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new workspace for the current user.
    """
    return WorkspaceService.create_workspace(db, current_user, ws_in)


@router.get("/current", response_model=WorkspaceResponse)
def get_current_workspace(
    workspace_id: Optional[UUID] = Query(None, description="Optional active workspace UUID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current active workspace details.
    """
    return WorkspaceService.get_current_workspace(db, current_user.id, workspace_id)


@router.patch("/{workspace_id}", response_model=WorkspaceResponse)
def update_workspace(
    workspace_id: UUID,
    ws_in: WorkspaceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update workspace name or description (Requires Owner or Admin role).
    """
    return WorkspaceService.update_workspace(db, current_user.id, workspace_id, ws_in)


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workspace(
    workspace_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a workspace (Requires Owner or Admin role).
    """
    WorkspaceService.delete_workspace(db, current_user.id, workspace_id)
    return None

