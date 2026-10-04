from fastapi import APIRouter
from app.api.v1.endpoints import auth, workspaces, brand_profile, social_connections

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["workspaces"])
api_router.include_router(brand_profile.router, prefix="/brand-profile", tags=["brand-profile"])
api_router.include_router(social_connections.router, prefix="/social-connections", tags=["social-connections"])

