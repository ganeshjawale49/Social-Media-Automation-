def test_register_user_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "testuser@example.com",
            "password": "SecurePassword123!",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "testuser@example.com"
    assert data["user"]["full_name"] == "Test User"
    assert "id" in data["user"]


def test_register_duplicate_email(client):
    user_payload = {
        "email": "duplicate@example.com",
        "password": "Password123!",
        "full_name": "Duplicate User"
    }
    res1 = client.post("/api/v1/auth/register", json=user_payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=user_payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


def test_login_success(client):
    # Register first
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "password": "MyPassword123",
            "full_name": "Login User"
        }
    )

    # Login with valid credentials
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "login@example.com",
            "password": "MyPassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "login@example.com"


def test_login_invalid_password(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrongpass@example.com",
            "password": "CorrectPassword123",
            "full_name": "User"
        }
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "wrongpass@example.com",
            "password": "WrongPassword999"
        }
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_get_me_authenticated(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "me@example.com",
            "password": "Password123!",
            "full_name": "Me User"
        }
    ).json()

    token = reg_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"
    assert data["full_name"] == "Me User"


def test_unauthenticated_protected_route(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_logout(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "logout@example.com",
            "password": "Password123!",
            "full_name": "Logout User"
        }
    ).json()

    token = reg_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post("/api/v1/auth/logout", headers=headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully logged out"
