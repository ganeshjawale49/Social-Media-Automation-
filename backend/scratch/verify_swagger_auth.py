import requests
import uuid

BASE_URL = "http://127.0.0.1:8000/api/v1"
FRONTEND_URL = "http://localhost:3000"

def verify_all():
    print("=== SWAGGER OAUTH2 & AUTHENTICATION VERIFICATION ===\n")

    # 1. Register test user
    uid = uuid.uuid4().hex[:6]
    email = f"swagger_user_{uid}@example.com"
    password = "SecurePassword123!"
    reg_res = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Swagger Tester"
    })
    print(f"[1] User registration status: {reg_res.status_code}")
    assert reg_res.status_code in (200, 201)

    # 2. Test Swagger OAuth2 Form-Data Login (application/x-www-form-urlencoded with username & password)
    print("\n[2] Testing Swagger OAuth2 Form-Data Login (application/x-www-form-urlencoded)...")
    form_data = {
        "username": email,
        "password": password
    }
    swagger_login_res = requests.post(
        f"{BASE_URL}/auth/login",
        data=form_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    print(f"Swagger OAuth2 Login Status: {swagger_login_res.status_code}")
    assert swagger_login_res.status_code == 200, f"Swagger login failed: {swagger_login_res.text}"
    token_data = swagger_login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    token = token_data["access_token"]
    print("SUCCESS: Swagger OAuth2 login succeeded without 422 error!")

    # 3. Test JSON Payload Login (application/json)
    print("\n[3] Testing JSON Payload Login (application/json)...")
    json_login_res = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password}
    )
    print(f"JSON Login Status: {json_login_res.status_code}")
    assert json_login_res.status_code == 200, f"JSON login failed: {json_login_res.text}"
    print("SUCCESS: JSON login succeeded!")

    # 4. Test Invalid Credentials Rejection
    print("\n[4] Testing Invalid Credentials Rejection...")
    invalid_res = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": email, "password": "WrongPassword!999"}
    )
    print(f"Invalid login status: {invalid_res.status_code}")
    assert invalid_res.status_code == 401
    assert "Incorrect email or password" in invalid_res.json()["detail"]
    print("SUCCESS: Invalid credentials correctly rejected with 401!")

    # 5. Test Unauthenticated Access to Protected Endpoints
    print("\n[5] Testing Unauthenticated Access to Protected Endpoints...")
    assert requests.get(f"{BASE_URL}/auth/me").status_code == 401
    assert requests.get(f"{BASE_URL}/workspaces").status_code == 401
    assert requests.get(f"{BASE_URL}/brand-profile").status_code == 401
    print("SUCCESS: Protected endpoints correctly return 401 without authentication!")

    # 6. Test Authenticated Calls with Swagger 'Authorization: Bearer <token>' Header
    headers = {"Authorization": f"Bearer {token}"}

    print("\n[6] Testing GET /api/v1/auth/me with Bearer Token...")
    me_res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email
    print(f"SUCCESS: GET /auth/me successful for {me_res.json()['full_name']}!")

    print("\n[7] Testing GET /api/v1/workspaces with Bearer Token...")
    ws_res = requests.get(f"{BASE_URL}/workspaces", headers=headers)
    assert ws_res.status_code == 200
    print(f"SUCCESS: GET /workspaces successful! Found {len(ws_res.json())} workspace(s).")

    print("\n[8] Testing GET /api/v1/brand-profile with Bearer Token...")
    bp_res = requests.get(f"{BASE_URL}/brand-profile", headers=headers)
    print(f"GET /brand-profile status: {bp_res.status_code}")
    assert bp_res.status_code in (200, 404)
    print("SUCCESS: GET /brand-profile authorization verified!")

    print("\n==============================================")
    print("ALL SWAGGER AUTHORIZATION CHECKS PASSED 100%!")
    print("==============================================")

if __name__ == "__main__":
    verify_all()
