# AI Social Media Automation Platform - STAGE 1

Stage 1 Foundation layer providing Authentication, User Management, PostgreSQL Database ORM with Alembic Migrations, Multi-Workspace Management, Password Visibility Toggles, Workspace Deletion, and a Premium Minimal Dark Next.js / Tailwind CSS SaaS UI.

---

## Features Implemented (Stage 1 Core)

- **Authentication & User Management**:
  - Secure user registration (`POST /api/v1/auth/register`) with automatic default workspace provisioning.
  - User login (`POST /api/v1/auth/login`) returning JWT bearer token.
  - User profile & session validation (`GET /api/v1/auth/me`).
  - Session logout (`POST /api/v1/auth/logout`) with client token cleanup.
  - Direct `bcrypt` password hashing and PyJWT token generation.
  - **Password Visibility Toggle**: Interactive Eye / EyeOff toggle inside password fields on both Login and Register pages.

- **Workspace Management**:
  - Auto-provisioning of owner's workspace upon registration.
  - Create custom workspaces with unique slugs (`POST /api/v1/workspaces`).
  - Active workspace resolution & switching (`GET /api/v1/workspaces/current`).
  - List user workspaces (`GET /api/v1/workspaces`).
  - Update workspace name & description (`PATCH /api/v1/workspaces/{id}`).
  - **Delete Workspace**: Complete workspace deletion (`DELETE /api/v1/workspaces/{id}`) with permission checks (Owner/Admin required), danger confirmation modal, cascading removal of workspace members, and automatic workspace switching fallback.

- **Frontend UI & Visual Identity**:
  - **Theme**: Premium Minimal Dark aesthetic (`#050505` background, `#0d0d0d` cards, `#242424` borders, high-contrast typography).
  - **Primary Action Buttons**: Clean white background with black text (`bg-white text-black font-semibold`).
  - **Secondary Action Buttons**: Dark background with subtle gray border (`bg-[#0d0d0d] text-white border border-[#242424]`).
  - **Protected Routes**: Navigation guards redirecting unauthenticated users to `/login`.
  - Responsive Top Navbar, Sidebar navigation, and Modal dialogs.

---

## Technical Architecture

### Backend Stack
- **Language & Engine**: Python 3.12 + FastAPI
- **Database**: PostgreSQL
- **ORM & Models**: SQLAlchemy 2.0 (UUID primary keys, explicit relationships, foreign key constraints)
- **Database Migrations**: Alembic
- **Password Security**: Passlib with Bcrypt
- **Session Tokens**: PyJWT (`HS256`)
- **Validation**: Pydantic v2 schemas
- **Testing**: Pytest & FastAPI TestClient

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Minimal dark mode configuration)
- **Icons**: Lucide React icons
- **HTTP Client**: Axios with request interceptors for JWT bearer authentication

---

## API Endpoints (`/api/v1`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/register` | Register new user & auto-create default workspace | No |
| `POST` | `/api/v1/auth/login` | Authenticate user & return JWT token | No |
| `POST` | `/api/v1/auth/logout` | Invalidate user session | Yes |
| `GET` | `/api/v1/auth/me` | Fetch current authenticated user profile | Yes |
| `GET` | `/api/v1/workspaces` | List all workspaces accessible by current user | Yes |
| `POST` | `/api/v1/workspaces` | Create a new workspace for current user | Yes |
| `GET` | `/api/v1/workspaces/current` | Get current active workspace details | Yes |
| `PATCH` | `/api/v1/workspaces/{id}` | Update workspace settings (Owner/Admin) | Yes |
| `DELETE` | `/api/v1/workspaces/{id}` | Permanently delete workspace & members (Owner/Admin) | Yes |

---

## Project Structure

```text
Social Media Automation/
├── backend/
│   ├── alembic/              # Database migration scripts & environment
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py       # Auth dependencies (get_current_user)
│   │   │   └── v1/
│   │   │       ├── router.py # API v1 router
│   │   │       └── endpoints/
│   │   │           ├── auth.py       # Login, Register, Logout, Me
│   │   │           └── workspaces.py # Workspace CRUD routes
│   │   ├── core/
│   │   │   ├── config.py    # Environment settings
│   │   │   ├── database.py  # SQLAlchemy engine & session maker
│   │   │   └── security.py  # Password hashing & JWT token logic
│   │   ├── models/
│   │   │   ├── user.py             # User DB model
│   │   │   ├── workspace.py        # Workspace DB model
│   │   │   └── workspace_member.py # Workspace Member DB model
│   │   ├── schemas/         # Pydantic validation schemas
│   │   ├── services/        # Business logic layer
│   │   └── main.py          # FastAPI application entrypoint
│   ├── tests/               # Pytest integration & unit test suite
│   ├── alembic.ini          # Alembic configuration
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/
    │   │   │   ├── login/      # Login page
    │   │   │   └── register/   # Register page
    │   │   ├── (dashboard)/
    │   │   │   └── dashboard/  # Protected dashboard page
    │   │   ├── globals.css     # Dark mode CSS & scrollbars
    │   │   └── layout.tsx      # Root layout & AuthProvider wrapper
    │   ├── components/
    │   │   ├── layout/         # Navbar & Sidebar components
    │   │   ├── ui/             # Button, Card, Input, Badge, Spinner
    │   │   └── workspace/      # Create & Delete Workspace Modals
    │   ├── lib/
    │   │   ├── api.ts          # Axios API instance
    │   │   └── auth.tsx        # React AuthContext & AuthProvider
    │   └── types/              # TypeScript interface definitions
    ├── tailwind.config.ts      # Dark theme configuration
    └── package.json            # Node.js dependencies & scripts
```

---

## Local Setup & Quickstart

### 1. Prerequisites
- Python 3.12+
- Node.js 18+ & npm
- PostgreSQL database server running on `localhost:5432`

### 2. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
```

### 3. Environment & Database Configuration
Create a `.env` file inside `/backend`:
```env
DATABASE_URL=postgresql://YOUR_POSTGRES_USER:YOUR_POSTGRES_PASSWORD@localhost:5432/social_media_db
SECRET_KEY=YOUR_SECURE_RANDOM_SECRET_KEY
```

Run database migrations with Alembic:
```bash
python -m alembic upgrade head
```

### 4. Run Backend Server
```bash
python -m uvicorn app.main:app --reload --port 8000
```
Interactive OpenAPI documentation available at: `http://localhost:8000/api/v1/docs`

### 5. Run Backend Tests
```bash
python -m pytest -v
```

### 6. Frontend Setup & Run
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## End-to-End Verification Flow

1. Open `http://localhost:3000` -> Automatically redirects to `/login`.
2. Click **Create Workspace Account** -> Navigates to `/register`.
3. Test Password Visibility: Click Eye icon in password inputs to toggle text visibility.
4. Register a user -> Account & initial workspace auto-created -> Redirected to `/dashboard`.
5. Dashboard loads active workspace details in Premium Minimal Dark theme.
6. Click **Create Workspace** -> Fill in new workspace details -> Adds new workspace.
7. Click workspace dropdown in Navbar -> Switch active workspace.
8. Click **Delete Workspace** -> Confirm in modal -> Workspace & members deleted, UI updates to remaining workspace.
9. Click **Logout** -> Session cleared and returned to `/login`.

