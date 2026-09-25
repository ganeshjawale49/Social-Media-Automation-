import uuid


def test_create_brand_profile_success(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "brand_creator@example.com",
            "password": "Password123!",
            "full_name": "Brand Creator",
        },
    ).json()

    headers = {"Authorization": f"Bearer {reg_res['access_token']}"}

    profile_payload = {
        "brand_name": "Acme Innovations",
        "industry": "Software & Technology",
        "products_services": "Cloud SaaS Platform, Analytics API",
        "target_audience": "Tech startups and enterprise developers",
        "location": "San Francisco, CA",
        "brand_tone": "Professional, Innovative, Empowering",
        "brand_colors": "#0052FF, #111827",
        "website": "https://acmeinnovations.io",
        "competitors": "CompetitorA, CompetitorB",
        "usp": "AI-native automated workflows with 99.9% uptime",
        "business_goals": "Scale MRR by 50% in Q4",
        "preferred_language": "English",
    }

    create_res = client.post("/api/v1/brand-profile", headers=headers, json=profile_payload)
    assert create_res.status_code == 201
    data = create_res.json()
    assert data["brand_name"] == "Acme Innovations"
    assert data["industry"] == "Software & Technology"
    assert data["preferred_language"] == "English"
    assert "id" in data
    assert "workspace_id" in data


def test_get_brand_profile_success(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "brand_getter@example.com",
            "password": "Password123!",
            "full_name": "Brand Getter",
        },
    ).json()

    headers = {"Authorization": f"Bearer {reg_res['access_token']}"}

    client.post(
        "/api/v1/brand-profile",
        headers=headers,
        json={"brand_name": "Getter Corp", "industry": "Retail"},
    )

    get_res = client.get("/api/v1/brand-profile", headers=headers)
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["brand_name"] == "Getter Corp"
    assert data["industry"] == "Retail"


def test_get_brand_profile_not_found(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "no_brand@example.com",
            "password": "Password123!",
            "full_name": "No Brand User",
        },
    ).json()

    headers = {"Authorization": f"Bearer {reg_res['access_token']}"}

    get_res = client.get("/api/v1/brand-profile", headers=headers)
    assert get_res.status_code == 404
    assert get_res.json()["detail"] == "Brand profile not found for this workspace"


def test_update_brand_profile_success(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "brand_updater@example.com",
            "password": "Password123!",
            "full_name": "Brand Updater",
        },
    ).json()

    headers = {"Authorization": f"Bearer {reg_res['access_token']}"}

    client.post(
        "/api/v1/brand-profile",
        headers=headers,
        json={"brand_name": "Initial Name", "industry": "Initial Industry"},
    )

    update_res = client.put(
        "/api/v1/brand-profile",
        headers=headers,
        json={"brand_name": "Updated Brand Name", "industry": "Updated Industry"},
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["brand_name"] == "Updated Brand Name"
    assert updated_data["industry"] == "Updated Industry"


def test_delete_brand_profile_success(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "brand_deleter@example.com",
            "password": "Password123!",
            "full_name": "Brand Deleter",
        },
    ).json()

    headers = {"Authorization": f"Bearer {reg_res['access_token']}"}

    client.post(
        "/api/v1/brand-profile",
        headers=headers,
        json={"brand_name": "Disposable Brand"},
    )

    del_res = client.delete("/api/v1/brand-profile", headers=headers)
    assert del_res.status_code == 204

    # Verification: GET returns 404
    get_res = client.get("/api/v1/brand-profile", headers=headers)
    assert get_res.status_code == 404


def test_one_profile_per_workspace_constraint(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate_tester@example.com",
            "password": "Password123!",
            "full_name": "Duplicate Tester",
        },
    ).json()

    headers = {"Authorization": f"Bearer {reg_res['access_token']}"}

    # First creation succeeds
    res1 = client.post("/api/v1/brand-profile", headers=headers, json={"brand_name": "Brand One"})
    assert res1.status_code == 201

    # Second creation fails with 400 Bad Request
    res2 = client.post("/api/v1/brand-profile", headers=headers, json={"brand_name": "Brand Two"})
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


def test_brand_profile_validation_errors(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "validator@example.com",
            "password": "Password123!",
            "full_name": "Validator User",
        },
    ).json()

    headers = {"Authorization": f"Bearer {reg_res['access_token']}"}

    # Empty brand_name string
    res = client.post("/api/v1/brand-profile", headers=headers, json={"brand_name": ""})
    assert res.status_code == 422


def test_brand_profile_unauthenticated_access(client):
    assert client.get("/api/v1/brand-profile").status_code == 401
    assert client.post("/api/v1/brand-profile", json={"brand_name": "Test"}).status_code == 401
    assert client.put("/api/v1/brand-profile", json={"brand_name": "Test"}).status_code == 401
    assert client.delete("/api/v1/brand-profile").status_code == 401


def test_brand_profile_unauthorized_workspace_access(client):
    # User A creates workspace A & profile
    u1_reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": "userA@example.com",
            "password": "Password123!",
            "full_name": "User A",
        },
    ).json()
    u1_headers = {"Authorization": f"Bearer {u1_reg['access_token']}"}
    u1_ws = client.get("/api/v1/workspaces/current", headers=u1_headers).json()

    client.post("/api/v1/brand-profile", headers=u1_headers, json={"brand_name": "User A Brand"})

    # User B tries to query User A's workspace brand profile
    u2_reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": "userB@example.com",
            "password": "Password123!",
            "full_name": "User B",
        },
    ).json()
    u2_headers = {"Authorization": f"Bearer {u2_reg['access_token']}"}

    res = client.get(f"/api/v1/brand-profile?workspace_id={u1_ws['id']}", headers=u2_headers)
    assert res.status_code == 403
    assert "Not authorized to access this workspace" in res.json()["detail"]


def test_brand_brain_context_foundation(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "brain_tester@example.com",
            "password": "Password123!",
            "full_name": "Brain Tester",
        },
    ).json()

    headers = {"Authorization": f"Bearer {reg_res['access_token']}"}

    # Before setup: is_ready is False
    ctx_res_before = client.get("/api/v1/brand-profile/context", headers=headers)
    assert ctx_res_before.status_code == 200
    assert ctx_res_before.json()["is_ready"] is False

    # After setting profile
    client.post(
        "/api/v1/brand-profile",
        headers=headers,
        json={
            "brand_name": "Brain Brand",
            "industry": "AI & Automation",
            "brand_tone": "Visionary",
        },
    )

    ctx_res_after = client.get("/api/v1/brand-profile/context", headers=headers)
    assert ctx_res_after.status_code == 200
    ctx = ctx_res_after.json()
    assert ctx["is_ready"] is True
    assert ctx["brand_name"] == "Brain Brand"
    assert ctx["industry"] == "AI & Automation"
    assert "=== BRAND CONTEXT ===" in ctx["formatted_context_prompt"]
