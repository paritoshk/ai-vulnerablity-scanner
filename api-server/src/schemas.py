"""Pydantic schemas for vulnerability data and response_schema validation"""
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class Severity(str, Enum):
    """Severity levels for vulnerabilities"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class PatchType(str, Enum):
    """Types of patches that can be applied"""
    CODE_PATCH = "code_patch"
    CONFIG_CHANGE = "config_change"
    DEPENDENCY_UPDATE = "dependency_update"
    ARCHITECTURE_CHANGE = "architecture_change"

class Vulnerability(BaseModel):
    """Structured vulnerability information"""
    title: str = Field(..., description="Vulnerability title")
    description: str = Field(..., description="Detailed description of the vulnerability")
    severity: str = Field(..., description="Severity level: critical, high, medium, or low")
    owasp_category: str = Field(..., description="OWASP LLM Top 10 (2025) category")
    mitre_technique: Optional[str] = Field(None, description="MITRE ATLAS technique ID")
    affected_systems: list[str] = Field(default_factory=list, description="List of affected systems or components")
    cve_id: Optional[str] = Field(None, description="CVE identifier if available")
    source_url: str = Field(..., description="Source URL where vulnerability was found")
    discovered_date: str = Field(..., description="Discovery date in YYYY-MM-DD format")
    exploitability_score: float = Field(default=5.0, ge=1.0, le=10.0, description="Exploitability score from 1.0 to 10.0")

class Patch(BaseModel):
    """Proposed patch for a vulnerability"""
    vulnerability_title: str = Field(..., description="Title of the vulnerability this patch addresses")
    patch_type: str = Field(..., description="Type of patch: code_patch, config_change, dependency_update, or architecture_change")
    description: str = Field(..., description="Description of the patch and how it mitigates the vulnerability")
    implementation_steps: list[str] = Field(..., description="Step-by-step implementation instructions")
    code_example: Optional[str] = Field(None, description="Python code example if applicable")
    estimated_effort_hours: int = Field(..., description="Estimated effort in hours")
    risk_reduction_percent: float = Field(..., description="Percentage of risk reduction")

class AnalysisResult(BaseModel):
    """Complete analysis result from Gemini"""
    vulnerabilities: list[Vulnerability] = Field(default_factory=list, description="List of discovered vulnerabilities")
    patches: list[Patch] = Field(default_factory=list, description="List of proposed patches")
    summary: str = Field(default="", description="2-3 sentence summary of findings")

class RiskScore(BaseModel):
    """AI-RQ risk score calculation result"""
    ai_rq_score: int = Field(..., description="AI-RQ score from 0-1000")
    rating: str = Field(..., description="Rating from AAA to D")
    investment_grade: bool = Field(..., description="Whether the score is investment grade")
    vuln_count: int = Field(..., description="Number of vulnerabilities found")
