"""Add social_connections table

Revision ID: 003_social_connections
Revises: 002_brand_profile
Create Date: 2026-10-04 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '003_social_connections'
down_revision: Union[str, None] = '002_brand_profile'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'social_connections',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('workspace_id', sa.Uuid(), nullable=False),
        sa.Column('provider', sa.String(length=50), nullable=False),
        sa.Column('provider_account_id', sa.String(length=255), nullable=True),
        sa.Column('account_name', sa.String(length=255), nullable=True),
        sa.Column('username', sa.String(length=255), nullable=True),
        sa.Column('encrypted_access_token', sa.Text(), nullable=False),
        sa.Column('encrypted_refresh_token', sa.Text(), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('scopes', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='connected'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('workspace_id', 'provider', name='uq_workspace_provider')
    )
    op.create_index(op.f('ix_social_connections_id'), 'social_connections', ['id'], unique=False)
    op.create_index(op.f('ix_social_connections_workspace_id'), 'social_connections', ['workspace_id'], unique=False)
    op.create_index('ix_social_connections_workspace_provider', 'social_connections', ['workspace_id', 'provider'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_social_connections_workspace_provider', table_name='social_connections')
    op.drop_index(op.f('ix_social_connections_workspace_id'), table_name='social_connections')
    op.drop_index(op.f('ix_social_connections_id'), table_name='social_connections')
    op.drop_table('social_connections')
