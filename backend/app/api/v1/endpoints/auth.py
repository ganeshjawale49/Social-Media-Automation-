from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserRegister, UserResponse
from app.schemas.token import Token
from app.services.auth_service import AuthService
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user, automatically create default workspace, and return access token.
    """
    user, token = AuthService.register_user(db, user_in)
    return Token(access_token=token, token_type="bearer", user=user)


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Authenticate user with OAuth2 Form-data (username & password) or JSON payload and return access token.
    """
    username = None
    password = None

    content_type = request.headers.get("content-type", "").lower()
    if "application/json" in content_type:
        try:
            json_body = await request.json()
            if isinstance(json_body, dict):
                username = json_body.get("email") or json_body.get("username")
                password = json_body.get("password")
        except Exception:
            pass
    else:
        try:
            form_data = await request.form()
            username = form_data.get("username") or form_data.get("email")
            password = form_data.get("password")
        except Exception:
            pass

    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email/username and password are required",
        )

    user, token = AuthService.authenticate_credentials(db, str(username), str(password))
    return Token(access_token=token, token_type="bearer", user=user)


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(current_user: User = Depends(get_current_user)):
    """
    Logout current user session.
    """
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current logged in user details.
    """
    return current_user
