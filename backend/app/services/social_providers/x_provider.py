from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.services.social_providers.base import SocialProvider


class XProvider(SocialProvider):
    provider_name = "x"
    required_env_vars = ["X_CLIENT_ID", "X_CLIENT_SECRET"]

    def is_configured(self) -> bool:
        return bool(settings.X_CLIENT_ID and settings.X_CLIENT_SECRET)

    def get_authorization_url(self, state: str, redirect_uri: str) -> str:
        client_id = settings.X_CLIENT_ID or "MISSING_X_CLIENT_ID"
        scope = "tweet.read users.read tweet.write offline.access"
        return (
            f"https://twitter.com/i/oauth2/authorize"
            f"?response_type=code"
            f"&client_id={client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&scope={scope}"
            f"&state={state}"
            f"&code_challenge=challenge"
            f"&code_challenge_method=plain"
        )

    def exchange_code_for_token(self, code: str, redirect_uri: str, **kwargs) -> Dict[str, Any]:
        if not self.is_configured():
            raise ValueError("X (Twitter) OAuth client credentials are not configured in environment variables.")

        url = "https://api.twitter.com/2/oauth2/token"
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": settings.X_CLIENT_ID,
            "code_verifier": "challenge",
        }
        auth = (settings.X_CLIENT_ID, settings.X_CLIENT_SECRET) if settings.X_CLIENT_SECRET else None
        with httpx.Client(timeout=10.0) as client:
            response = client.post(url, headers=headers, data=data, auth=auth)
            response.raise_for_status()
            res_json = response.json()
            return {
                "access_token": res_json.get("access_token"),
                "refresh_token": res_json.get("refresh_token"),
                "expires_in": res_json.get("expires_in"),
                "scope": res_json.get("scope"),
            }

    def get_user_profile(self, access_token: str, **kwargs) -> Dict[str, Any]:
        url = "https://api.twitter.com/2/users/me"
        headers = {"Authorization": f"Bearer {access_token}"}
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, headers=headers)
            response.raise_for_status()
            res_json = response.json()
            data = res_json.get("data", {})
            username = data.get("username", "")
            return {
                "provider_account_id": str(data.get("id", "")),
                "account_name": data.get("name") or username or "X Account",
                "username": f"@{username}" if username else None,
            }
