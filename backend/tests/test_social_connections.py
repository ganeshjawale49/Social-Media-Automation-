from uuid import UUID
import pytest
from unittest.mock import patch
from app.core.config import settings
from app.core.security import create_oauth_state, decrypt_token
from app.models.social_connection import SocialConnection


def register_user_helper(client, email: str, name: str):
    res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123!", "full_name": name},
    ).json()
    token = res["access_token"]
    user_id = UUID(res["user"]["id"])
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch default workspace
    ws_res = client.get("/api/v1/workspaces/current", headers=headers).json()
    return token, headers, user_id, UUID(ws_res["id"])



def test_unauthorized_access(client):
    res = client.get("/api/v1/social-connections")
    assert res.status_code == 401

    res = client.get("/api/v1/social-connections/instagram/connect")
    assert res.status_code == 401

    res = client.delete("/api/v1/social-connections/instagram")
    assert res.status_code == 401


def test_list_social_connections(client):
    _, headers, _, ws_id = register_user_helper(client, "list_user@example.com", "List User")

    res = client.get("/api/v1/social-connections", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["workspace_id"] == str(ws_id)

    assert len(data["connections"]) == 3

    providers = {c["provider"]: c for c in data["connections"]}
    assert "instagram" in providers
    assert "linkedin" in providers
    assert "x" in providers

    for provider, conn in providers.items():
        assert conn["is_connected"] is False
        assert conn["connection"] is None
        assert isinstance(conn["required_env_vars"], list)


def test_connect_unconfigured_provider(client, monkeypatch):
    monkeypatch.setattr(settings, "INSTAGRAM_CLIENT_ID", None)
    monkeypatch.setattr(settings, "INSTAGRAM_CLIENT_SECRET", None)

    _, headers, _, _ = register_user_helper(client, "unconfig@example.com", "Unconfig User")

    res = client.get("/api/v1/social-connections/instagram/connect", headers=headers)
    assert res.status_code == 400
    detail = res.json()["detail"]
    assert detail["is_configured"] is False
    assert "INSTAGRAM_CLIENT_ID" in detail["required_env_vars"]


def test_connect_configured_provider_url(client, monkeypatch):
    monkeypatch.setattr(settings, "LINKEDIN_CLIENT_ID", "dummy_linkedin_id")
    monkeypatch.setattr(settings, "LINKEDIN_CLIENT_SECRET", "dummy_linkedin_secret")

    _, headers, _, _ = register_user_helper(client, "config_user@example.com", "Config User")

    res = client.get("/api/v1/social-connections/linkedin/connect", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["is_configured"] is True
    assert data["provider"] == "linkedin"
    assert "dummy_linkedin_id" in data["authorization_url"]
    assert "state=" in data["authorization_url"]


def test_oauth_state_security(client, monkeypatch):
    monkeypatch.setattr(settings, "X_CLIENT_ID", "dummy_x_id")
    monkeypatch.setattr(settings, "X_CLIENT_SECRET", "dummy_x_secret")

    _, headers, _, _ = register_user_helper(client, "state_user@example.com", "State User")

    # Invalid state token
    res = client.get("/api/v1/social-connections/x/callback?code=some_code&state=invalid_token", follow_redirects=False)
    assert res.status_code == 400
    assert "Invalid or expired OAuth state" in res.json()["detail"]


def test_oauth_callback_provider_error(client):
    res = client.get(
        "/api/v1/social-connections/instagram/callback?error=access_denied&error_description=User+cancelled",
        follow_redirects=False,
    )
    assert res.status_code in [302, 307]
    assert "status=error" in res.headers["location"]
    assert "User" in res.headers["location"] or "error" in res.headers["location"]



def test_successful_oauth_callback_and_token_encryption(client, db_session, monkeypatch):
    monkeypatch.setattr(settings, "INSTAGRAM_CLIENT_ID", "real_insta_id")
    monkeypatch.setattr(settings, "INSTAGRAM_CLIENT_SECRET", "real_insta_secret")

    _, headers, user_id, ws_id = register_user_helper(client, "oauth_owner@example.com", "OAuth Owner")

    # Create valid signed state
    valid_state = create_oauth_state(workspace_id=ws_id, user_id=user_id, provider="instagram")

    # Mock exchange_code_for_token and get_user_profile
    mock_tokens = {
        "access_token": "secret_access_token_12345",
        "refresh_token": "secret_refresh_token_67890",
        "expires_in": 3600,
        "scope": "user_profile,user_media",
    }
    mock_profile = {
        "provider_account_id": "insta_998877",
        "account_name": "Test Brand Insta",
        "username": "@testbrand_official",
    }

    with patch(
        "app.services.social_providers.instagram.InstagramProvider.exchange_code_for_token",
        return_value=mock_tokens,
    ), patch(
        "app.services.social_providers.instagram.InstagramProvider.get_user_profile",
        return_value=mock_profile,
    ):
        res = client.get(
            f"/api/v1/social-connections/instagram/callback?code=valid_code_abc&state={valid_state}",
            follow_redirects=False,
        )
        assert res.status_code in [302, 307]
        assert "status=success" in res.headers["location"]
        assert "provider=instagram" in res.headers["location"]

    # Verify DB record & token encryption security
    conn = db_session.query(SocialConnection).filter(SocialConnection.workspace_id == ws_id).first()
    assert conn is not None
    assert conn.provider == "instagram"
    assert conn.provider_account_id == "insta_998877"
    assert conn.account_name == "Test Brand Insta"
    assert conn.username == "@testbrand_official"
    assert conn.status == "connected"

    # Security boundary check: tokens MUST NOT be stored in plaintext
    assert conn.encrypted_access_token != "secret_access_token_12345"
    assert conn.encrypted_refresh_token != "secret_refresh_token_67890"

    # Verify decryption produces original token
    assert decrypt_token(conn.encrypted_access_token) == "secret_access_token_12345"
    assert decrypt_token(conn.encrypted_refresh_token) == "secret_refresh_token_67890"

    # API Security boundary check: list connections MUST NOT return encrypted or decrypted tokens
    list_res = client.get("/api/v1/social-connections", headers=headers).json()
    insta_item = [c for c in list_res["connections"] if c["provider"] == "instagram"][0]
    assert insta_item["is_connected"] is True
    conn_dict = insta_item["connection"]
    assert "encrypted_access_token" not in conn_dict
    assert "encrypted_refresh_token" not in conn_dict
    assert "access_token" not in conn_dict


def test_workspace_isolation_and_disconnect(client, db_session, monkeypatch):
    monkeypatch.setattr(settings, "LINKEDIN_CLIENT_ID", "link_id")
    monkeypatch.setattr(settings, "LINKEDIN_CLIENT_SECRET", "link_sec")

    # User 1 & Workspace 1
    _, headers1, user1_id, ws1_id = register_user_helper(client, "user1@example.com", "User One")
    state1 = create_oauth_state(workspace_id=ws1_id, user_id=user1_id, provider="linkedin")

    with patch(
        "app.services.social_providers.linkedin.LinkedInProvider.exchange_code_for_token",
        return_value={"access_token": "token_ws1"},
    ), patch(
        "app.services.social_providers.linkedin.LinkedInProvider.get_user_profile",
        return_value={"provider_account_id": "link_111", "account_name": "WS1 LinkedIn", "username": "ws1_link"},
    ):
        client.get(f"/api/v1/social-connections/linkedin/callback?code=code1&state={state1}", follow_redirects=False)

    # User 2 & Workspace 2
    _, headers2, _, ws2_id = register_user_helper(client, "user2@example.com", "User Two")

    # User 2 tries to list connections -> User 2 should NOT see Workspace 1's LinkedIn connection
    res2 = client.get("/api/v1/social-connections", headers=headers2).json()
    link2_item = [c for c in res2["connections"] if c["provider"] == "linkedin"][0]
    assert link2_item["is_connected"] is False

    # User 2 tries to disconnect LinkedIn in User 2's workspace -> 404
    del_res2 = client.delete("/api/v1/social-connections/linkedin", headers=headers2)
    assert del_res2.status_code == 404

    # User 1 disconnects LinkedIn -> 200 Success
    del_res1 = client.delete("/api/v1/social-connections/linkedin", headers=headers1)
    assert del_res1.status_code == 200
    assert del_res1.json()["provider"] == "linkedin"

    # Verify DB record deleted
    res1_after = client.get("/api/v1/social-connections", headers=headers1).json()
    link1_after = [c for c in res1_after["connections"] if c["provider"] == "linkedin"][0]
    assert link1_after["is_connected"] is False
