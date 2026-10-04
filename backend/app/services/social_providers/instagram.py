from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.services.social_providers.base import SocialProvider


class InstagramProvider(SocialProvider):
    provider_name = "instagram"
    required_env_vars = ["INSTAGRAM_CLIENT_ID", "INSTAGRAM_CLIENT_SECRET"]

    def is_configured(self) -> bool:
        return bool(settings.INSTAGRAM_CLIENT_ID and settings.INSTAGRAM_CLIENT_SECRET)

    def get_authorization_url(self, state: str, redirect_uri: str) -> str:
        client_id = settings.INSTAGRAM_CLIENT_ID or "MISSING_INSTAGRAM_CLIENT_ID"
        scope = "user_profile,user_media"
        return (
            f"https://api.instagram.com/oauth/authorize"
            f"?client_id={client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&scope={scope}"
            f"&response_type=code"
            f"&state={state}"
        )

    def exchange_code_for_token(self, code: str, redirect_uri: str, **kwargs) -> Dict[str, Any]:
        if not self.is_configured():
            raise ValueError("Instagram OAuth client credentials are not configured in environment variables.")

        url = "https://api.instagram.com/oauth/access_token"
        data = {
            "client_id": settings.INSTAGRAM_CLIENT_ID,
            "client_secret": settings.INSTAGRAM_CLIENT_SECRET,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri,
            "code": code,
        }
        with httpx.Client(timeout=10.0) as client:
            response = client.post(url, data=data)
            response.raise_for_status()
            res_json = response.json()
            return {
                "access_token": res_json.get("access_token"),
                "refresh_token": res_json.get("refresh_token"),
                "expires_in": res_json.get("expires_in"),
                "user_id": str(res_json.get("user_id", "")),
            }

    def get_user_profile(self, access_token: str, **kwargs) -> Dict[str, Any]:
        url = f"https://graph.instagram.com/me?fields=id,username,account_type&access_token={access_token}"
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)
            response.raise_for_status()
            res_json = response.json()
            username = res_json.get("username", "")
            return {
                "provider_account_id": str(res_json.get("id", "")),
                "account_name": username or "Instagram Account",
                "username": f"@{username}" if username else None,
            }
