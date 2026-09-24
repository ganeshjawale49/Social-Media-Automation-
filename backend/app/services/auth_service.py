import re
import uuid
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.schemas.user import UserRegister, UserLogin
from app.core.security import hash_password, verify_password, create_access_token


def generate_slug(text: str) -> str:
    slug = text.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug)
    slug = re.sub(r"^-+|-+$", "", slug)
    return f"{slug}-{uuid.uuid4().hex[:6]}"


class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserRegister) -> tuple[User, str]:
        existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # 1. Create User
        db_user = User(
            email=user_in.email.lower(),
            password_hash=hash_password(user_in.password),
            full_name=user_in.full_name,
            is_active=True
        )
        db.add(db_user)
        db.flush()

        # 2. Create Default Workspace
        ws_name = f"{user_in.full_name}'s Workspace"
        slug = generate_slug(user_in.full_name)
        db_workspace = Workspace(
            name=ws_name,
            slug=slug,
            owner_id=db_user.id,
            description=f"Default workspace for {user_in.full_name}"
        )
        db.add(db_workspace)
        db.flush()

        # 3. Add Workspace Member as Owner
        db_member = WorkspaceMember(
            workspace_id=db_workspace.id,
            user_id=db_user.id,
            role="owner"
        )
        db.add(db_member)
        
        db.commit()
        db.refresh(db_user)

        token = create_access_token(subject=str(db_user.id))
        return db_user, token

    @staticmethod
    def authenticate_user(db: Session, user_in: UserLogin) -> tuple[User, str]:
        user = db.query(User).filter(User.email == user_in.email.lower()).first()
        if not user or not verify_password(user_in.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account"
            )
        
        token = create_access_token(subject=str(user.id))
        return user, token
