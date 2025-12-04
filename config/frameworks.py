"""OWASP LLM Top 10 (2025) and MITRE ATLAS constants"""

OWASP_LLM_TOP_10 = {
    "LLM01:2025 Prompt Injection": 95,
    "LLM02:2025 Sensitive Information Disclosure": 90,
    "LLM03:2025 Supply Chain": 85,
    "LLM04:2025 Data and Model Poisoning": 80,
    "LLM05:2025 Improper Output Handling": 80,
    "LLM06:2025 Excessive Agency": 75,
    "LLM07:2025 System Prompt Leakage": 70,
    "LLM08:2025 Vector and Embedding Weaknesses": 65,
    "LLM09:2025 Misinformation": 60,
    "LLM10:2025 Unbounded Consumption": 55,
}

MITRE_ATLAS = {
    "AML.T0051": ("LLM Prompt Injection", 95),
    "AML.T0054": ("LLM Jailbreaking", 80),
    "AML.T0020": ("Poison Training Data", 95),
    "AML.T0024": ("Exfiltration via ML Inference API", 90),
    "AML.T0040": ("ML Model Inference API Access", 85),
    "AML.T0043": ("Craft Adversarial Data", 90),
    "AML.T0056": ("Model Inversion", 75),
    "AML.T0018": ("Backdoor ML Model", 100),
    "AML.T0057": ("LLM Meta Prompt Extraction", 70),
}
