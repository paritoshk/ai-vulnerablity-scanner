"""Pydantic models for API requests and responses"""
from pydantic import BaseModel, Field
from typing import Optional


class ScanRequest(BaseModel):
    """Request model for vulnerability scan"""
    company: str = Field(..., min_length=1, max_length=200, description="Company or product name")
    llmProvider: str = Field(..., min_length=1, max_length=200, description="LLM provider (e.g., OpenAI, Anthropic)")
    modelVersion: str = Field(..., min_length=1, max_length=500, description="Sensitive data exposure details")
    contextWindow: str = Field(..., min_length=1, max_length=500, description="External content injection details")
    ragImplementation: str = Field(..., min_length=1, max_length=200, description="RAG implementation framework")
    vectorDb: str = Field(..., min_length=1, max_length=500, description="Document validation details")
    deploymentEnv: str = Field(..., min_length=1, max_length=500, description="Security controls details")


class ProgressUpdate(BaseModel):
    """SSE progress update model"""
    step: str = Field(..., description="Current step: init, search, analyze, score, report, done, error")
    status: str = Field(..., description="Status: running, complete, error")
    error: Optional[str] = Field(None, description="Error message if status is error")


class VulnerabilityResult(BaseModel):
    """Individual vulnerability result"""
    title: str
    description: str
    severity: str
    owasp_category: str
    mitre_technique: Optional[str] = None
    affected_systems: list[str] = []
    cve_id: Optional[str] = None
    source_url: str
    discovered_date: str
    exploitability_score: float


class PatchResult(BaseModel):
    """Individual patch result"""
    vulnerability_title: str
    patch_type: str
    description: str
    implementation_steps: list[str]
    code_example: Optional[str] = None
    estimated_effort_hours: int
    risk_reduction_percent: float


class RiskScoreResult(BaseModel):
    """Risk score calculation result"""
    ai_rq_score: int
    rating: str
    investment_grade: bool
    vuln_count: int


class ScanResult(BaseModel):
    """Final scan result"""
    success: bool
    company: str
    llmProvider: str
    modelVersion: str
    contextWindow: str
    ragImplementation: str
    vectorDb: str
    deploymentEnv: str
    analysis: dict
    risk: RiskScoreResult
    error: Optional[str] = None
