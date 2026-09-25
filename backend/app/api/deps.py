from typing import Generator, Optional
from fastapi import Depends, HTTPException, Header, Query, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception
    
    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    return user


def get_current_workspace_for_user(
    workspace_id: Optional[UUID] = Query(None, description="Optional target workspace ID"),
    x_workspace_id: Optional[UUID] = Header(None, alias="X-Workspace-ID", description="Optional active workspace header"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Workspace:
    target_id = workspace_id or x_workspace_id
    if target_id:
        workspace = db.query(Workspace).filter(Workspace.id == target_id).first()
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found"
            )
        member = (
            db.query(WorkspaceMember)
            .filter(WorkspaceMember.workspace_id == target_id, WorkspaceMember.user_id == current_user.id)
            .first()
        )
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this workspace"
            )
        return workspace
    else:
        # Default workspace for user
        first_member = (
            db.query(WorkspaceMember)
            .filter(WorkspaceMember.user_id == current_user.id)
            .first()
        )
        if not first_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No workspace found for user"
            )
        return first_member.workspace
