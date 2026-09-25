"""Add brand_profiles table

Revision ID: 002_brand_profile
Revises: 001_stage1
Create Date: 2026-09-25 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_brand_profile'
down_revision: Union[str, None] = '001_stage1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'brand_profiles',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('workspace_id', sa.Uuid(), nullable=False),
        sa.Column('brand_name', sa.String(length=255), nullable=False),
        sa.Column('industry', sa.String(length=255), nullable=True),
        sa.Column('products_services', sa.Text(), nullable=True),
        sa.Column('target_audience', sa.Text(), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('brand_tone', sa.String(length=255), nullable=True),
        sa.Column('brand_colors', sa.String(length=255), nullable=True),
        sa.Column('website', sa.String(length=255), nullable=True),
        sa.Column('competitors', sa.Text(), nullable=True),
        sa.Column('usp', sa.Text(), nullable=True),
        sa.Column('business_goals', sa.Text(), nullable=True),
        sa.Column('preferred_language', sa.String(length=100), nullable=True, server_default='English'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('workspace_id', name='uq_brand_profile_workspace')
    )
    op.create_index(op.f('ix_brand_profiles_id'), 'brand_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_brand_profiles_workspace_id'), 'brand_profiles', ['workspace_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_brand_profiles_workspace_id'), table_name='brand_profiles')
    op.drop_index(op.f('ix_brand_profiles_id'), table_name='brand_profiles')
    op.drop_table('brand_profiles')
