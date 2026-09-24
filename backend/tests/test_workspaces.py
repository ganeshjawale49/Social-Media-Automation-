def test_auto_created_default_workspace(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "workspace_owner@example.com",
            "password": "Password123!",
            "full_name": "Jane Owner"
        }
    ).json()

    token = reg_res["access_token"]
    user_id = reg_res["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch user workspaces
    response = client.get("/api/v1/workspaces", headers=headers)
    assert response.status_code == 200
    workspaces = response.json()
    assert len(workspaces) == 1
    assert workspaces[0]["name"] == "Jane Owner's Workspace"
    assert workspaces[0]["owner_id"] == user_id


def test_get_current_workspace(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "current_ws@example.com",
            "password": "Password123!",
            "full_name": "Active User"
        }
    ).json()

    token = reg_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/v1/workspaces/current", headers=headers)
    assert response.status_code == 200
    current_ws = response.json()
    assert current_ws["name"] == "Active User's Workspace"


def test_create_custom_workspace(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "custom_ws@example.com",
            "password": "Password123!",
            "full_name": "Agency Admin"
        }
    ).json()

    token = reg_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create new workspace
    create_res = client.post(
        "/api/v1/workspaces",
        headers=headers,
        json={
            "name": "Social Growth Agency",
            "description": "Primary client management workspace"
        }
    )
    assert create_res.status_code == 201
    new_ws = create_res.json()
    assert new_ws["name"] == "Social Growth Agency"
    assert new_ws["description"] == "Primary client management workspace"

    # Verify user now has 2 workspaces
    list_res = client.get("/api/v1/workspaces", headers=headers)
    assert len(list_res.json()) == 2


def test_update_workspace_settings(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "update_ws@example.com",
            "password": "Password123!",
            "full_name": "Update User"
        }
    ).json()

    token = reg_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    ws_res = client.get("/api/v1/workspaces/current", headers=headers).json()
    ws_id = ws_res["id"]

    # Update workspace details
    patch_res = client.patch(
        f"/api/v1/workspaces/{ws_id}",
        headers=headers,
        json={
            "name": "Updated Brand Workspace",
            "description": "New updated description"
        }
    )
    assert patch_res.status_code == 200
    updated_ws = patch_res.json()
    assert updated_ws["name"] == "Updated Brand Workspace"
    assert updated_ws["description"] == "New updated description"


def test_delete_workspace_owner_success(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "delete_ws_owner@example.com",
            "password": "Password123!",
            "full_name": "Delete Owner"
        }
    ).json()

    token = reg_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create a secondary workspace to delete
    create_res = client.post(
        "/api/v1/workspaces",
        headers=headers,
        json={"name": "Temporary Workspace"}
    )
    assert create_res.status_code == 201
    ws_to_delete = create_res.json()
    ws_id = ws_to_delete["id"]

    # Delete workspace
    del_res = client.delete(f"/api/v1/workspaces/{ws_id}", headers=headers)
    assert del_res.status_code == 204

    # Verify workspace is removed from user's list
    list_res = client.get("/api/v1/workspaces", headers=headers)
    workspaces = list_res.json()
    assert not any(w["id"] == ws_id for w in workspaces)


def test_delete_workspace_unauthorized_user(client):
    # User 1 creates a workspace
    u1_reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": "user1_owner@example.com",
            "password": "Password123!",
            "full_name": "User One"
        }
    ).json()
    u1_headers = {"Authorization": f"Bearer {u1_reg['access_token']}"}
    u1_ws = client.get("/api/v1/workspaces/current", headers=u1_headers).json()

    # User 2 tries to delete User 1's workspace
    u2_reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": "user2_attacker@example.com",
            "password": "Password123!",
            "full_name": "User Two"
        }
    ).json()
    u2_headers = {"Authorization": f"Bearer {u2_reg['access_token']}"}

    del_res = client.delete(f"/api/v1/workspaces/{u1_ws['id']}", headers=u2_headers)
    assert del_res.status_code == 403


def test_delete_workspace_non_existent(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "non_existent_ws_tester@example.com",
            "password": "Password123!",
            "full_name": "Tester"
        }
    ).json()
    headers = {"Authorization": f"Bearer {reg_res['access_token']}"}

    import uuid
    random_id = str(uuid.uuid4())
    del_res = client.delete(f"/api/v1/workspaces/{random_id}", headers=headers)
    assert del_res.status_code == 404
    assert del_res.json()["detail"] == "Workspace not found"


def test_delete_workspace_membership_cleanup(client):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "cleanup_ws_owner@example.com",
            "password": "Password123!",
            "full_name": "Cleanup Owner"
        }
    ).json()
    headers = {"Authorization": f"Bearer {reg_res['access_token']}"}

    # Fetch initial workspace created during registration
    initial_ws = client.get("/api/v1/workspaces/current", headers=headers).json()
    ws_id = initial_ws["id"]

    # Delete the workspace
    del_res = client.delete(f"/api/v1/workspaces/{ws_id}", headers=headers)
    assert del_res.status_code == 204

    # Fetch workspaces list - should be empty now
    list_res = client.get("/api/v1/workspaces", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 0

    # Fetch current workspace - should return 404
    current_res = client.get("/api/v1/workspaces/current", headers=headers)
    assert current_res.status_code == 404


