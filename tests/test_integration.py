"""Integration test for the FastAPI scanner endpoint"""
import requests
import json
import sys

API_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("Testing /health endpoint...")
    response = requests.get(f"{API_URL}/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    print("✅ Health check passed")

def test_scan_endpoint():
    """Test scan endpoint with SSE stream"""
    print("\nTesting /api/scan endpoint...")
    
    payload = {
        "company": "TestCorp",
        "llmProvider": "OpenAI",
        "modelVersion": "GPT-4",
        "contextWindow": "128k",
        "ragImplementation": "LangChain",
        "vectorDb": "Pinecone",
        "deploymentEnv": "Production"
    }
    
    response = requests.post(
        f"{API_URL}/api/scan",
        json=payload,
        stream=True,
        timeout=60
    )
    
    assert response.status_code == 200
    content_type = response.headers.get("content-type", "")
    assert "text/event-stream" in content_type, f"Expected text/event-stream, got {content_type}"
    
    steps_seen = set()
    final_result = None
    
    print("Streaming SSE events:")
    for line in response.iter_lines():
        if line:
            line_str = line.decode('utf-8')
            if line_str.startswith('data: '):
                try:
                    data = json.loads(line_str[6:])
                    step = data.get('step')
                    status = data.get('status')
                    
                    steps_seen.add(step)
                    print(f"  {step}: {status}")
                    
                    if step == 'done' and status == 'complete':
                        final_result = data.get('result')
                        break
                    elif step == 'error':
                        print(f"❌ Error: {data.get('error')}")
                        return False
                except json.JSONDecodeError as e:
                    print(f"Failed to parse: {line_str}")
    
    # Verify all expected steps were seen
    expected_steps = {'init', 'search', 'analyze', 'score', 'report', 'done'}
    assert expected_steps.issubset(steps_seen), f"Missing steps: {expected_steps - steps_seen}"
    
    # Verify final result structure
    assert final_result is not None, "No final result received"
    assert final_result["success"] is True
    assert final_result["company"] == "TestCorp"
    assert "analysis" in final_result
    assert "risk" in final_result
    
    risk = final_result["risk"]
    assert "ai_rq_score" in risk
    assert 0 <= risk["ai_rq_score"] <= 1000
    assert "rating" in risk
    assert "investment_grade" in risk
    
    print(f"\n✅ Scan completed successfully!")
    print(f"   AI-RQ Score: {risk['ai_rq_score']}")
    print(f"   Rating: {risk['rating']}")
    print(f"   Investment Grade: {risk['investment_grade']}")
    print(f"   Vulnerabilities: {risk['vuln_count']}")
    
    return True

def test_invalid_input():
    """Test validation with invalid input"""
    print("\nTesting input validation...")
    
    # Missing required field
    payload = {
        "company": "TestCorp",
        # Missing other required fields
    }
    
    response = requests.post(f"{API_URL}/api/scan", json=payload)
    assert response.status_code == 422  # Validation error
    print("✅ Input validation passed")

if __name__ == "__main__":
    try:
        print("=" * 60)
        print("API Integration Tests")
        print("=" * 60)
        
        test_health()
        test_invalid_input()
        test_scan_endpoint()
        
        print("\n" + "=" * 60)
        print("✅ All tests passed!")
        print("=" * 60)
        sys.exit(0)
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
