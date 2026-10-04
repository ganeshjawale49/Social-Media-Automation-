from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List


class SocialProvider(ABC):
    provider_name: str
    required_env_vars: List[str]

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if required OAuth client credentials are configured in settings."""
        pass

    @abstractmethod
    def get_authorization_url(self, state: str, redirect_uri: str) -> str:
        """Generates the OAuth authorization URL."""
        pass

    @abstractmethod
    def exchange_code_for_token(self, code: str, redirect_uri: str, **kwargs) -> Dict[str, Any]:
        """
        Exchanges authorization code for token data.
        Returns dict with keys: access_token, refresh_token (optional), expires_in (optional), scope (optional).
        """
        pass

    @abstractmethod
    def get_user_profile(self, access_token: str, **kwargs) -> Dict[str, Any]:
        """
        Fetches user/account profile from provider API using access_token.
        Returns dict with keys: provider_account_id, account_name, username.
        """
        pass

    def refresh_access_token(self, refresh_token: str) -> Optional[Dict[str, Any]]:
        """Refreshes access token if supported by provider."""
        return None
