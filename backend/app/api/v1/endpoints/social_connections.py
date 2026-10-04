from datetime import datetime, timedelta, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_oauth_state, verify_oauth_state, encrypt_token
from app.api.deps import get_current_user, get_current_workspace_for_user
from app.models.user import User
from app.models.workspace import Workspace
from app.models.social_connection import SocialConnection
from app.schemas.social_connection import (
    SocialConnectionRead,
    SocialConnectionStatusItem,
    SocialConnectionListResponse,
    ConnectUrlResponse,
)
from app.services.social_providers import get_social_provider, SocialProvider

router = APIRouter()

SUPPORTED_PROVIDERS = ["instagram", "linkedin", "x"]


@router.get("", response_model=SocialConnectionListResponse)
def list_social_connections(
    current_workspace: Workspace = Depends(get_current_workspace_for_user),
    db: Session = Depends(get_db),
):
    """
    Get all social connections status for the active workspace.
    Includes connected accounts and provider configuration status.
    """
    db_connections = (
        db.query(SocialConnection)
        .filter(SocialConnection.workspace_id == current_workspace.id)
        .all()
    )
    connection_map = {conn.provider: conn for conn in db_connections}

    status_items: List[SocialConnectionStatusItem] = []
    for provider in SUPPORTED_PROVIDERS:
        try:
            provider_instance = get_social_provider(provider)
            is_configured = provider_instance.is_configured()
            required_env_vars = provider_instance.required_env_vars
        except ValueError:
            is_configured = False
            required_env_vars = []

        conn = connection_map.get(provider)
        is_connected = bool(conn and conn.status == "connected")

        status_items.append(
            SocialConnectionStatusItem(
                provider=provider,
                is_connected=is_connected,
                is_configured=is_configured,
                connection=SocialConnectionRead.model_validate(conn) if conn else None,
                required_env_vars=required_env_vars,
            )
        )

    return SocialConnectionListResponse(
        workspace_id=current_workspace.id,
        connections=status_items,
    )


@router.get("/{provider}/connect", response_model=ConnectUrlResponse)
def connect_social_provider(
    provider: str,
    current_user: User = Depends(get_current_user),
    current_workspace: Workspace = Depends(get_current_workspace_for_user),
):
    """
    Initiates OAuth connect flow for specified provider.
    Returns authorization URL and signed CSRF state.
    """
    norm_provider = "x" if provider.lower() == "twitter" else provider.lower()
    if norm_provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported social provider '{provider}'. Supported: {', '.join(SUPPORTED_PROVIDERS)}",
        )

    try:
        provider_instance = get_social_provider(norm_provider)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if not provider_instance.is_configured():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": f"OAuth credentials for {norm_provider.capitalize()} are not configured.",
                "provider": norm_provider,
                "is_configured": False,
                "required_env_vars": provider_instance.required_env_vars,
            },
        )

    state = create_oauth_state(
        workspace_id=current_workspace.id,
        user_id=current_user.id,
        provider=norm_provider,
    )
    redirect_uri = f"{settings.OAUTH_REDIRECT_BASE_URL}/{norm_provider}/callback"
    auth_url = provider_instance.get_authorization_url(state=state, redirect_uri=redirect_uri)

    return ConnectUrlResponse(
        authorization_url=auth_url,
        state=state,
        provider=norm_provider,
        is_configured=True,
    )


@router.get("/{provider}/callback")
def social_provider_callback(
    provider: str,
    state: Optional[str] = Query(None),
    code: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    OAuth callback endpoint. Validates CSRF state, exchanges authorization code for tokens,
    fetches account profile, encrypts tokens, and upserts social connection record.
    """
    norm_provider = "x" if provider.lower() == "twitter" else provider.lower()
    if norm_provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported social provider '{provider}'",
        )

    if error:
        err_msg = error_description or error
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/connections?status=error&provider={norm_provider}&message={err_msg}"
        )

    if not state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing OAuth state parameter",
        )

    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing authorization code parameter",
        )


    # Validate CSRF State
    state_payload = verify_oauth_state(state)
    if not state_payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OAuth state parameter (CSRF protection failure)",
        )

    state_provider = state_payload.get("provider")
    if state_provider != norm_provider:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="State provider mismatch",
        )

    workspace_id_str = state_payload.get("workspace_id")
    try:
        workspace_id = UUID(workspace_id_str)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid workspace ID in state",
        )

    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace specified in state not found",
        )

    try:
        provider_instance = get_social_provider(norm_provider)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    redirect_uri = f"{settings.OAUTH_REDIRECT_BASE_URL}/{norm_provider}/callback"
    try:
        token_data = provider_instance.exchange_code_for_token(code=code, redirect_uri=redirect_uri)
        profile_data = provider_instance.get_user_profile(access_token=token_data["access_token"])
    except Exception as e:
        err_str = str(e)
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/connections?status=error&provider={norm_provider}&message={err_str}"
        )

    # Encrypt tokens for secure storage
    enc_access = encrypt_token(token_data["access_token"])
    enc_refresh = encrypt_token(token_data.get("refresh_token")) if token_data.get("refresh_token") else None

    expires_in = token_data.get("expires_in")
    expires_at = None
    if expires_in and isinstance(expires_in, (int, float)):
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

    existing_conn = (
        db.query(SocialConnection)
        .filter(
            SocialConnection.workspace_id == workspace_id,
            SocialConnection.provider == norm_provider,
        )
        .first()
    )

    if existing_conn:
        existing_conn.provider_account_id = profile_data.get("provider_account_id")
        existing_conn.account_name = profile_data.get("account_name")
        existing_conn.username = profile_data.get("username")
        existing_conn.encrypted_access_token = enc_access
        existing_conn.encrypted_refresh_token = enc_refresh
        existing_conn.expires_at = expires_at
        existing_conn.scopes = token_data.get("scope")
        existing_conn.status = "connected"
        existing_conn.updated_at = datetime.now(timezone.utc)
    else:
        new_conn = SocialConnection(
            workspace_id=workspace_id,
            provider=norm_provider,
            provider_account_id=profile_data.get("provider_account_id"),
            account_name=profile_data.get("account_name"),
            username=profile_data.get("username"),
            encrypted_access_token=enc_access,
            encrypted_refresh_token=enc_refresh,
            expires_at=expires_at,
            scopes=token_data.get("scope"),
            status="connected",
        )
        db.add(new_conn)

    db.commit()

    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/connections?status=success&provider={norm_provider}"
    )


@router.delete("/{provider}")
def disconnect_social_provider(
    provider: str,
    current_workspace: Workspace = Depends(get_current_workspace_for_user),
    db: Session = Depends(get_db),
):
    """
    Disconnects social provider account for current workspace.
    """
    norm_provider = "x" if provider.lower() == "twitter" else provider.lower()
    if norm_provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported social provider '{provider}'",
        )

    conn = (
        db.query(SocialConnection)
        .filter(
            SocialConnection.workspace_id == current_workspace.id,
            SocialConnection.provider == norm_provider,
        )
        .first()
    )

    if not conn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active {norm_provider.capitalize()} connection found for this workspace",
        )

    db.delete(conn)
    db.commit()

    return {
        "message": f"Successfully disconnected {norm_provider.capitalize()} account",
        "provider": norm_provider,
        "workspace_id": current_workspace.id,
    }
