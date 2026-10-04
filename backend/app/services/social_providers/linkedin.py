from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.services.social_providers.base import SocialProvider


class LinkedInProvider(SocialProvider):
    provider_name = "linkedin"
    required_env_vars = ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"]

    def is_configured(self) -> bool:
        return bool(settings.LINKEDIN_CLIENT_ID and settings.LINKEDIN_CLIENT_SECRET)

    def get_authorization_url(self, state: str, redirect_uri: str) -> str:
        client_id = settings.LINKEDIN_CLIENT_ID or "MISSING_LINKEDIN_CLIENT_ID"
        scope = "openid profile email"
        return (
            f"https://www.linkedin.com/oauth/v2/authorization"
            f"?response_type=code"
            f"&client_id={client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&state={state}"
            f"&scope={scope}"
        )

    def exchange_code_for_token(self, code: str, redirect_uri: str, **kwargs) -> Dict[str, Any]:
        if not self.is_configured():
            raise ValueError("LinkedIn OAuth client credentials are not configured in environment variables.")

        url = "https://www.linkedin.com/oauth/v2/accessToken"
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": settings.LINKEDIN_CLIENT_ID,
            "client_secret": settings.LINKEDIN_CLIENT_SECRET,
        }
        with httpx.Client(timeout=10.0) as client:
            response = client.post(url, headers=headers, data=data)
            response.raise_for_status()
            res_json = response.json()
            return {
                "access_token": res_json.get("access_token"),
                "refresh_token": res_json.get("refresh_token"),
                "expires_in": res_json.get("expires_in"),
                "scope": res_json.get("scope"),
            }

    def get_user_profile(self, access_token: str, **kwargs) -> Dict[str, Any]:
        url = "https://api.linkedin.com/v2/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, headers=headers)
            response.raise_for_status()
            res_json = response.json()
            name = res_json.get("name") or f"{res_json.get('given_name', '')} {res_json.get('family_name', '')}".strip()
            sub = res_json.get("sub", "")
            return {
                "provider_account_id": str(sub),
                "account_name": name or "LinkedIn User",
                "username": name.lower().replace(" ", "_") if name else None,
            }
