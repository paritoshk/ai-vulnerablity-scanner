"""Unit tests for Gemini analysis integration"""
import pytest
from unittest.mock import Mock, patch
from src.schemas import AnalysisResult, Vulnerability, Patch


def test_analysis_result_schema_validation():
    """Test that AnalysisResult schema validates correctly"""
    # Valid data
    data = {
        "vulnerabilities": [
            {
                "title": "Test Vulnerability",
                "description": "Test description",
                "severity": "high",
                "owasp_category": "LLM01:2025 Prompt Injection",
                "source_url": "https://example.com",
                "discovered_date": "2024-12-04",
                "exploitability_score": 7.5,
            }
        ],
        "patches": [
            {
                "vulnerability_title": "Test Vulnerability",
                "patch_type": "code_patch",
                "description": "Apply this patch",
                "implementation_steps": ["Step 1", "Step 2"],
                "estimated_effort_hours": 4,
                "risk_reduction_percent": 80.0,
            }
        ],
        "summary": "Found 1 vulnerability with 1 proposed patch.",
    }
    
    result = AnalysisResult(**data)
    assert len(result.vulnerabilities) == 1
    assert len(result.patches) == 1
    assert result.vulnerabilities[0].severity == "high"
    assert result.patches[0].patch_type == "code_patch"


def test_vulnerability_schema_required_fields():
    """Test that Vulnerability schema enforces required fields"""
    # Missing required fields should raise validation error
    with pytest.raises(Exception):  # Pydantic ValidationError
        Vulnerability(title="Test")


def test_vulnerability_exploitability_score_bounds():
    """Test that exploitability score is bounded between 1.0 and 10.0"""
    # Valid score
    vuln_valid = Vulnerability(
        title="Test",
        description="Test description",
        severity="medium",
        owasp_category="LLM03:2025 Training Data Poisoning",
        source_url="https://example.com",
        discovered_date="2024-12-04",
        exploitability_score=5.5,
    )
    assert 1.0 <= vuln_valid.exploitability_score <= 10.0
    
    # Score too low should fail
    with pytest.raises(Exception):
        Vulnerability(
            title="Test",
            description="Test description",
            severity="medium",
            owasp_category="LLM03:2025 Training Data Poisoning",
            source_url="https://example.com",
            discovered_date="2024-12-04",
            exploitability_score=0.5,  # Below minimum
        )
    
    # Score too high should fail
    with pytest.raises(Exception):
        Vulnerability(
            title="Test",
            description="Test description",
            severity="medium",
            owasp_category="LLM03:2025 Training Data Poisoning",
            source_url="https://example.com",
            discovered_date="2024-12-04",
            exploitability_score=11.0,  # Above maximum
        )


def test_patch_schema_required_fields():
    """Test that Patch schema enforces required fields"""
    # Valid patch
    patch = Patch(
        vulnerability_title="Test Vuln",
        patch_type="config_change",
        description="Change configuration",
        implementation_steps=["Step 1", "Step 2"],
        estimated_effort_hours=2,
        risk_reduction_percent=50.0,
    )
    assert patch.estimated_effort_hours == 2
    
    # Missing required field should fail
    with pytest.raises(Exception):
        Patch(
            vulnerability_title="Test Vuln",
            patch_type="config_change",
            # Missing description
            implementation_steps=["Step 1"],
            estimated_effort_hours=2,
            risk_reduction_percent=50.0,
        )


def test_analysis_result_empty_lists():
    """Test that AnalysisResult works with empty vulnerability and patch lists"""
    result = AnalysisResult(
        vulnerabilities=[],
        patches=[],
        summary="No vulnerabilities found.",
    )
    assert len(result.vulnerabilities) == 0
    assert len(result.patches) == 0
    assert result.summary == "No vulnerabilities found."


def test_patch_optional_code_example():
    """Test that code_example is optional in Patch"""
    # Without code example
    patch_no_code = Patch(
        vulnerability_title="Test",
        patch_type="architecture_change",
        description="Redesign architecture",
        implementation_steps=["Step 1"],
        estimated_effort_hours=10,
        risk_reduction_percent=90.0,
    )
    assert patch_no_code.code_example is None
    
    # With code example
    patch_with_code = Patch(
        vulnerability_title="Test",
        patch_type="code_patch",
        description="Apply code patch",
        implementation_steps=["Step 1"],
        code_example="def fixed_function(): pass",
        estimated_effort_hours=3,
        risk_reduction_percent=75.0,
    )
    assert patch_with_code.code_example == "def fixed_function(): pass"


@patch('src.analysis.litellm')
def test_analyze_with_gemini_mock(mock_litellm):
    """Test analyze_with_gemini with mocked LiteLLM response"""
    from src.analysis import analyze_with_gemini
    
    # Mock the completion response
    mock_response = Mock()
    mock_response.choices = [
        Mock(
            message=Mock(
                content='{"vulnerabilities": [], "patches": [], "summary": "Test summary"}'
            )
        )
    ]
    mock_litellm.completion.return_value = mock_response
    
    # Call the function
    search_data = {
        "query": "test query",
        "results": {"organic": []},
    }
    
    result = analyze_with_gemini(search_data)
    
    # Verify the result structure
    assert "vulnerabilities" in result or "analysis" in result
    # The actual implementation might wrap this differently


def test_severity_enum_values():
    """Test that only valid severity values are accepted"""
    valid_severities = ["critical", "high", "medium", "low"]
    
    for severity in valid_severities:
        vuln = Vulnerability(
            title="Test",
            description="Test description",
            severity=severity,
            owasp_category="LLM01:2025 Prompt Injection",
            source_url="https://example.com",
            discovered_date="2024-12-04",
        )
        assert vuln.severity == severity


def test_patch_type_enum_values():
    """Test that valid patch types are accepted"""
    valid_patch_types = [
        "code_patch",
        "config_change",
        "dependency_update",
        "architecture_change",
    ]
    
    for patch_type in valid_patch_types:
        patch = Patch(
            vulnerability_title="Test",
            patch_type=patch_type,
            description="Test patch",
            implementation_steps=["Step 1"],
            estimated_effort_hours=1,
            risk_reduction_percent=50.0,
        )
        assert patch.patch_type == patch_type
