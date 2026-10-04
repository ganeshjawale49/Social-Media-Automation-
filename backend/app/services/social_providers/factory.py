from typing import Dict
from app.services.social_providers.base import SocialProvider
from app.services.social_providers.instagram import InstagramProvider
from app.services.social_providers.linkedin import LinkedInProvider
from app.services.social_providers.x_provider import XProvider

_PROVIDERS: Dict[str, SocialProvider] = {
    "instagram": InstagramProvider(),
    "linkedin": LinkedInProvider(),
    "x": XProvider(),
    "twitter": XProvider(),
}


def get_social_provider(provider_name: str) -> SocialProvider:
    normalized = provider_name.lower().strip()
    if normalized not in _PROVIDERS:
        raise ValueError(f"Unsupported social provider '{provider_name}'. Supported providers: instagram, linkedin, x.")
    return _PROVIDERS[normalized]
