from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.brand_profile import BrandProfile
from app.schemas.brand_profile import BrandProfileCreate, BrandProfileUpdate


class BrandProfileService:
    @staticmethod
    def get_brand_profile(db: Session, workspace_id: UUID) -> Optional[BrandProfile]:
        return db.query(BrandProfile).filter(BrandProfile.workspace_id == workspace_id).first()

    @staticmethod
    def get_brand_profile_or_404(db: Session, workspace_id: UUID) -> BrandProfile:
        profile = BrandProfileService.get_brand_profile(db, workspace_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Brand profile not found for this workspace",
            )
        return profile

    @staticmethod
    def create_brand_profile(
        db: Session, workspace_id: UUID, profile_in: BrandProfileCreate
    ) -> BrandProfile:
        existing = BrandProfileService.get_brand_profile(db, workspace_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Brand profile already exists for this workspace. Use PUT to update.",
            )

        db_profile = BrandProfile(
            workspace_id=workspace_id,
            brand_name=profile_in.brand_name,
            industry=profile_in.industry,
            products_services=profile_in.products_services,
            target_audience=profile_in.target_audience,
            location=profile_in.location,
            brand_tone=profile_in.brand_tone,
            brand_colors=profile_in.brand_colors,
            website=profile_in.website,
            competitors=profile_in.competitors,
            usp=profile_in.usp,
            business_goals=profile_in.business_goals,
            preferred_language=profile_in.preferred_language or "English",
        )
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
        return db_profile

    @staticmethod
    def update_brand_profile(
        db: Session, workspace_id: UUID, profile_in: BrandProfileUpdate
    ) -> BrandProfile:
        profile = BrandProfileService.get_brand_profile_or_404(db, workspace_id)

        update_data = profile_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(profile, field, value)

        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def delete_brand_profile(db: Session, workspace_id: UUID) -> None:
        profile = BrandProfileService.get_brand_profile_or_404(db, workspace_id)
        db.delete(profile)
        db.commit()
