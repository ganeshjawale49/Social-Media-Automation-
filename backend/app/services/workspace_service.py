from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.models.user import User
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate
from app.services.auth_service import generate_slug


class WorkspaceService:
    @staticmethod
    def get_user_workspaces(db: Session, user_id: UUID) -> List[Workspace]:
        return (
            db.query(Workspace)
            .join(WorkspaceMember, Workspace.id == WorkspaceMember.workspace_id)
            .filter(WorkspaceMember.user_id == user_id)
            .all()
        )

    @staticmethod
    def create_workspace(db: Session, user: User, ws_in: WorkspaceCreate) -> Workspace:
        slug = generate_slug(ws_in.name)
        db_workspace = Workspace(
            name=ws_in.name,
            slug=slug,
            owner_id=user.id,
            description=ws_in.description
        )
        db.add(db_workspace)
        db.flush()

        db_member = WorkspaceMember(
            workspace_id=db_workspace.id,
            user_id=user.id,
            role="owner"
        )
        db.add(db_member)
        db.commit()
        db.refresh(db_workspace)
        return db_workspace

    @staticmethod
    def get_current_workspace(db: Session, user_id: UUID, workspace_id: Optional[UUID] = None) -> Workspace:
        if workspace_id:
            member = (
                db.query(WorkspaceMember)
                .filter(WorkspaceMember.workspace_id == workspace_id, WorkspaceMember.user_id == user_id)
                .first()
            )
            if not member:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Workspace not found or access denied"
                )
            return member.workspace
        
        # Default: return first workspace user belongs to (or owned workspace)
        first_member = (
            db.query(WorkspaceMember)
            .filter(WorkspaceMember.user_id == user_id)
            .first()
        )
        if not first_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No workspace found for user"
            )
        return first_member.workspace

    @staticmethod
    def update_workspace(db: Session, user_id: UUID, workspace_id: UUID, ws_in: WorkspaceUpdate) -> Workspace:
        member = (
            db.query(WorkspaceMember)
            .filter(WorkspaceMember.workspace_id == workspace_id, WorkspaceMember.user_id == user_id)
            .first()
        )
        if not member or member.role not in ["owner", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to update workspace settings"
            )
        
        workspace = member.workspace
        if ws_in.name is not None:
            workspace.name = ws_in.name
        if ws_in.description is not None:
            workspace.description = ws_in.description
        
        db.commit()
        db.refresh(workspace)
        return workspace

    @staticmethod
    def delete_workspace(db: Session, user_id: UUID, workspace_id: UUID) -> None:
        member = (
            db.query(WorkspaceMember)
            .filter(WorkspaceMember.workspace_id == workspace_id, WorkspaceMember.user_id == user_id)
            .first()
        )
        if not member or member.role not in ["owner", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to delete this workspace"
            )
        
        workspace = member.workspace
        db.delete(workspace)
        db.commit()

