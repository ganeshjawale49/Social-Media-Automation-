# AI Social Media Automation Platform - STAGE 3

Stage 3 layer providing Social Media Connections UI, Provider Adaptor OAuth Architecture (Instagram, LinkedIn, X/Twitter), AES-256 Token Encryption, CSRF State Security, Versioned API Endpoints, and Database persistence with Alembic migrations.

---

## Features Implemented

### Stage 1: Auth & Workspace Foundation
- **Authentication & User Management**: Registration (`POST /api/v1/auth/register`), Login (`POST /api/v1/auth/login`), Session validation (`GET /api/v1/auth/me`), Logout (`POST /api/v1/auth/logout`), Password Visibility Toggle.
- **Workspace Management**: Auto-provisioning, Custom workspace creation (`POST /api/v1/workspaces`), Active workspace switching (`GET /api/v1/workspaces/current`), Workspace deletion with danger modal and permissions checks (`DELETE /api/v1/workspaces/{id}`).

### Stage 2: AI Brand Profile Engine
- **Brand Profile Store**: Workspace brand profile schema (`brand_profiles` table).
- **AI Brand Brain Context Generator**: Generates formatted context prompt injections from workspace brand parameters.

### Stage 3: Social Connections & OAuth Architecture
- **Social Connections UI (`/connections`)**:
  - Workspace-scoped Connections page in dashboard.
  - Interactive platform cards for **Instagram**, **LinkedIn**, and **X (Twitter)**.
  - Live **Connected / Not Connected** status badges.
  - Account name / handle display (`@username` or Account Name).
  - Actions for **Connect**, **Reconnect**, and **Disconnect**.
  - Interactive OAuth Setup & Configuration modal when credentials are unconfigured.
  - Loading skeletons, success & error toast notifications upon OAuth callback return.
- **Clean Provider / Adaptor Architecture (`SocialProvider`)**:
  - Abstract base class `SocialProvider` (`backend/app/services/social_providers/base.py`).
  - Isolated provider implementations: `InstagramProvider`, `LinkedInProvider`, `XProvider`.
  - Factory helper `get_social_provider(provider_name)` with validation and credential check (`is_configured()`).
- **AES-256 Fernet Token Encryption**:
  - `encrypt_token` and `decrypt_token` security functions in `backend/app/core/security.py`.
  - OAuth access tokens and refresh tokens are encrypted before saving to PostgreSQL/SQLite database.
  - Security boundary: Encrypted tokens are **never** exposed to the frontend or API response schemas.
- **CSRF State Security**:
  - Cryptographically signed state token with 10-minute expiration containing `workspace_id`, `user_id`, `provider`, and random nonce.
  - Prevents OAuth CSRF attacks and enforces workspace authorization.

---

## Required Environment Variables

Add the following variables to `backend/.env`:

```env
# Stage 1 & 2 Core Settings
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/social_media_db
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
FRONTEND_URL=http://localhost:3000

# Stage 3 Security & OAuth Settings
ENCRYPTION_KEY=your_optional_32_byte_base64_fernet_key
OAUTH_REDIRECT_BASE_URL=http://localhost:8000/api/v1/social-connections

# Instagram OAuth (Meta for Developers)
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# LinkedIn OAuth (LinkedIn Developer Portal)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# X / Twitter OAuth (X Developer Portal - OAuth 2.0 PKCE)
X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret
```

---

## OAuth Provider Configuration & Callback URLs

Configure your developer portal applications with the exact local redirect callback URLs below:

| Provider | Developer Portal | Local Callback URL | Required Scopes |
| :--- | :--- | :--- | :--- |
| **Instagram** | [Meta Developer Portal](https://developers.facebook.com/) | `http://localhost:8000/api/v1/social-connections/instagram/callback` | `user_profile,user_media` |
| **LinkedIn** | [LinkedIn Developer Portal](https://www.linkedin.com/developers/) | `http://localhost:8000/api/v1/social-connections/linkedin/callback` | `openid,profile,email` |
| **X (Twitter)** | [X Developer Portal](https://developer.x.com/) | `http://localhost:8000/api/v1/social-connections/x/callback` | `tweet.read,users.read,tweet.write,offline.access` |

### Provider Setup Steps
1. **Instagram / Meta**:
   - Register a Meta Developer app under "Business" type.
   - Add Instagram Graph API / Instagram Basic Display product.
   - Add `http://localhost:8000/api/v1/social-connections/instagram/callback` to Valid OAuth Redirect URIs.
   - Copy App ID and App Secret into `INSTAGRAM_CLIENT_ID` and `INSTAGRAM_CLIENT_SECRET`.

2. **LinkedIn**:
   - Create an app in LinkedIn Developer Portal.
   - Under Auth settings, add `http://localhost:8000/api/v1/social-connections/linkedin/callback` to Authorized redirect URLs.
   - Request `Sign In with LinkedIn using OpenID Connect` permissions.
   - Copy Client ID and Client Secret into `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`.

3. **X (Twitter)**:
   - Create a project & app in X Developer Portal.
   - Set App permissions to `Read and Write`.
   - Set Type of App to `Web App, Automated App or Bot` (OAuth 2.0).
   - Add `http://localhost:8000/api/v1/social-connections/x/callback` under Callback URLs.
   - Copy Client ID and Client Secret into `X_CLIENT_ID` and `X_CLIENT_SECRET`.

---

## API Endpoints (`/api/v1/social-connections`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/social-connections` | List connection status & accounts for active workspace | Yes |
| `GET` | `/api/v1/social-connections/{provider}/connect` | Initiate OAuth flow (returns auth URL & signed CSRF state) | Yes |
| `GET` | `/api/v1/social-connections/{provider}/callback` | Process OAuth callback code, exchange & encrypt tokens, save connection | No (Valid State Required) |
| `DELETE` | `/api/v1/social-connections/{provider}` | Disconnect social media account for active workspace | Yes |

---

## Testing Social Connections

### 1. Run Backend Test Suite
Run the full pytest suite (includes auth, workspace, brand profile, and social connection security tests):
```bash
cd backend
..\.venv\Scripts\python -m pytest -v
```
All 33 tests should pass cleanly!

### 2. Verify Database Migrations
Apply Alembic migrations to upgrade database schema to `003_social_connections`:
```bash
cd backend
..\.venv\Scripts\python -m alembic upgrade head
```

### 3. Verify Frontend Build
Run Next.js build verification:
```bash
cd frontend
npm run build
```

### 4. Interactive Testing in Browser
1. Start backend: `python -m uvicorn app.main:app --reload --port 8000`
2. Start frontend: `npm run dev` in `/frontend`
3. Navigate to `http://localhost:3000/connections`.
4. If provider credentials are not configured, click **Connect** on any card to view the **OAuth Setup Guide** modal.
5. With configured credentials, click **Connect** to perform live OAuth authorization. Upon return, a success toast appears and the card updates to **Connected** showing account details and **Reconnect** / **Disconnect** buttons.
