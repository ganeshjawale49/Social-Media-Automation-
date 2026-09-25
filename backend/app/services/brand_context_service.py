from typing import Dict, Any, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.services.brand_profile_service import BrandProfileService


class BrandContextService:
    @staticmethod
    def get_normalized_brand_context(db: Session, workspace_id: UUID) -> Dict[str, Any]:
        """
        Builds a normalized brand context object from the workspace's Brand Profile.
        This provides the structured brand memory/context layer that future AI content
        generation modules can consume.
        """
        profile = BrandProfileService.get_brand_profile(db, workspace_id)

        if not profile:
            return {
                "workspace_id": workspace_id,
                "brand_name": "",
                "industry": "",
                "products_services": "",
                "target_audience": "",
                "location": "",
                "brand_tone": "",
                "brand_colors": "",
                "website": "",
                "competitors": "",
                "usp": "",
                "business_goals": "",
                "preferred_language": "English",
                "is_ready": False,
                "formatted_context_prompt": "No brand profile configured for this workspace.",
            }

        brand_name = profile.brand_name or ""
        industry = profile.industry or ""
        products_services = profile.products_services or ""
        target_audience = profile.target_audience or ""
        location = profile.location or ""
        brand_tone = profile.brand_tone or ""
        brand_colors = profile.brand_colors or ""
        website = profile.website or ""
        competitors = profile.competitors or ""
        usp = profile.usp or ""
        business_goals = profile.business_goals or ""
        preferred_language = profile.preferred_language or "English"

        prompt_lines = [
            f"=== BRAND CONTEXT ===",
            f"Brand Name: {brand_name}",
            f"Industry: {industry}",
            f"Products/Services: {products_services}",
            f"Target Audience: {target_audience}",
            f"Location: {location}",
            f"Brand Tone: {brand_tone}",
            f"Brand Colors: {brand_colors}",
            f"Website: {website}",
            f"Competitors: {competitors}",
            f"USP: {usp}",
            f"Business Goals: {business_goals}",
            f"Preferred Language: {preferred_language}",
            f"=====================",
        ]
        formatted_prompt = "\n".join(prompt_lines)

        return {
            "workspace_id": workspace_id,
            "brand_name": brand_name,
            "industry": industry,
            "products_services": products_services,
            "target_audience": target_audience,
            "location": location,
            "brand_tone": brand_tone,
            "brand_colors": brand_colors,
            "website": website,
            "competitors": competitors,
            "usp": usp,
            "business_goals": business_goals,
            "preferred_language": preferred_language,
            "is_ready": True,
            "formatted_context_prompt": formatted_prompt,
        }
