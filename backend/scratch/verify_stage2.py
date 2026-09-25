import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"
FRONTEND_URL = "http://localhost:3000"

def verify_stage2():
    print("--- 1. Testing Frontend Accessibility ---")
    fe_res = requests.get(FRONTEND_URL)
    print(f"Frontend status: {fe_res.status_code}")
    assert fe_res.status_code == 200, "Frontend is not accessible"

    print("--- 2. Testing Backend Health & Swagger Docs ---")
    health_res = requests.get("http://127.0.0.1:8000/health")
    print(f"Backend health: {health_res.json()}")
    assert health_res.status_code == 200, "Backend health check failed"

    docs_res = requests.get("http://127.0.0.1:8000/docs")
    print(f"Swagger docs status: {docs_res.status_code}")
    assert docs_res.status_code == 200, "Swagger docs failed"

    print("--- 3. Registering / Authenticating Test User ---")
    email = "verification_test_v2@example.com"
    password = "Password123!"
    reg_payload = {
        "email": email,
        "password": password,
        "full_name": "Stage2 Verifier"
    }
    reg_res = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
    if reg_res.status_code in (200, 201):
        token = reg_res.json()["access_token"]
    else:
        login_res = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": password})
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    print("Authentication successful!")

    print("--- 4. Fetching Current Workspace ---")
    ws_res = requests.get(f"{BASE_URL}/workspaces/current", headers=headers)
    assert ws_res.status_code == 200, f"Get current workspace failed: {ws_res.text}"
    ws = ws_res.json()
    print(f"Active Workspace: {ws['name']} (ID: {ws['id']})")

    print("--- 5. Checking Brand Profile (Empty State) ---")
    get_profile_res = requests.get(f"{BASE_URL}/brand-profile", headers=headers)
    assert get_profile_res.status_code == 404, "Brand profile should return 404 before creation"
    print("Unconfigured Brand Profile returns 404 as expected!")

    print("--- 6. Creating Brand Profile ---")
    profile_data = {
        "brand_name": "Apex AI Studio",
        "industry": "AI & Automation SaaS",
        "products_services": "Autonomous Social Agents, Content Studio Engine",
        "target_audience": "Growth Marketers, SaaS Founders, Agencies",
        "location": "San Francisco, CA",
        "brand_tone": "Innovative, Authoritative, Premium",
        "brand_colors": "#0052FF, #0D0D0D",
        "website": "https://apexai.studio",
        "competitors": "Competitor Alpha, Competitor Beta",
        "usp": "Multi-agent self-learning platform for organic social growth",
        "business_goals": "Achieve $1M ARR in 2026",
        "preferred_language": "English"
    }
    create_profile_res = requests.post(f"{BASE_URL}/brand-profile", headers=headers, json=profile_data)
    assert create_profile_res.status_code == 201, f"Create brand profile failed: {create_profile_res.text}"
    created_profile = create_profile_res.json()
    print(f"Brand Profile Created Successfully! ID: {created_profile['id']}")
    assert created_profile["brand_name"] == "Apex AI Studio"

    print("--- 7. Fetching AI Brand Brain Context ---")
    ctx_res = requests.get(f"{BASE_URL}/brand-profile/context", headers=headers)
    assert ctx_res.status_code == 200, f"Get context failed: {ctx_res.text}"
    ctx = ctx_res.json()
    assert ctx["is_ready"] is True
    assert "=== BRAND CONTEXT ===" in ctx["formatted_context_prompt"]
    print("AI Brand Brain Context successfully generated and normalized!")
    print(f"Normalized Prompt Snippet:\n{ctx['formatted_context_prompt'][:250]}...\n")

    print("--- 8. Updating Brand Profile ---")
    update_data = {
        "brand_name": "Apex AI Studio Global",
        "business_goals": "Achieve $2M ARR in 2026"
    }
    update_res = requests.put(f"{BASE_URL}/brand-profile", headers=headers, json=update_data)
    assert update_res.status_code == 200, f"Update profile failed: {update_res.text}"
    updated_profile = update_res.json()
    assert updated_profile["brand_name"] == "Apex AI Studio Global"
    assert updated_profile["business_goals"] == "Achieve $2M ARR in 2026"
    print("Brand Profile Updated and Persisted cleanly!")

    print("--- 9. Verifying Persistence via GET ---")
    persisted_res = requests.get(f"{BASE_URL}/brand-profile", headers=headers)
    assert persisted_res.status_code == 200
    assert persisted_res.json()["brand_name"] == "Apex AI Studio Global"
    print("Brand Profile data loads correctly and matches updated state!")

    print("\n==============================================")
    print("ALL VERIFICATION CHECKS PASSED PERFECTLY!")
    print("==============================================")

if __name__ == "__main__":
    verify_stage2()
