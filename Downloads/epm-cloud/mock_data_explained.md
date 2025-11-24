z# Oracle FCCS MCP Server - Mock Data Explained

This document explains the structure of the mock data returned by the server for key scenarios. This helps in understanding what the AI agent (ChatGPT/Claude) "sees" when interacting with the tools.

## 1. MDX Query (Financial Data)

**Prompt:** "Run an MDX query on 'FCCS_Global' to get Net Income for Jan and Feb."

**Tool Call:** `run_mdx_query`

**Mock JSON Response:**
```json
{
  "headers": ["Account", "Entity", "Period", "Data"],
  "rows": [
    ["Net Income", "North America", "Jan", "150000"],
    ["Net Income", "North America", "Feb", "160000"],
    ["Net Income", "EMEA", "Jan", "120000"],
    ["Net Income", "EMEA", "Feb", "125000"],
    ["Operating Exp", "North America", "Jan", "50000"],
    ["Operating Exp", "North America", "Feb", "52000"],
    ["Operating Exp", "EMEA", "Jan", "40000"],
    ["Operating Exp", "EMEA", "Feb", "41000"],
    ["Revenue", "North America", "Jan", "200000"],
    ["Revenue", "EMEA", "Jan", "160000"]
  ]
}
```

**Explanation:**
-   **headers**: Defines the columns of the dataset. Standard MDX result structure.
-   **rows**: Array of arrays, where each inner array represents a row of data matching the headers.
    -   *Example Row 1*: Account="Net Income", Entity="North America", Period="Jan", Data="150000".

---

## 2. Job Status Check

**Prompt:** "Check the status of job ID '12345'."

**Tool Call:** `get_job_status`

**Mock JSON Response:**
```json
{
  "jobId": "12345",
  "status": 0,
  "descriptiveStatus": "Success",
  "details": "Mock job status for ID 12345"
}
```

**Explanation:**
-   **jobId**: The ID of the job being checked.
-   **status**: Numeric status code (0 usually means success, non-zero implies error/processing).
-   **descriptiveStatus**: Human-readable status (e.g., "Success", "Processing", "Failed").
-   **details**: Additional context or error messages.

---

## 3. M&A Simulation (Acquisition)

**Prompt:** "Simulate acquiring TechCorp for 10M with 100% stake."

**Tool Call:** `simulate_transaction`

**Mock JSON Response:**
```json
{
  "simulationId": "84921",
  "type": "ACQUISITION",
  "entity": "TechCorp",
  "status": "Simulation Completed",
  "financialImpact": {
    "revenueImpact": "+5,000,000 (Estimated)",
    "netIncomeImpact": "+1,500,000",
    "goodwill": "2,000,000",
    "minorityInterest": "0%"
  },
  "message": "Simulation of acquisition of entity TechCorp (100%) processed successfully."
}
```

**Explanation:**
-   **simulationId**: Unique ID for this simulation run.
-   **financialImpact**: Object containing key financial metrics affected by the deal.
    -   *revenueImpact*: Estimated increase in revenue (Mock logic: 50% of deal amount).
    -   *netIncomeImpact*: Estimated effect on bottom line (Mock logic: 15% of deal amount).
    -   *goodwill*: Calculated Goodwill (Mock logic: 20% of deal amount).
    -   *minorityInterest*: Percentage of the company NOT owned by the parent (100% - stake).
-   **message**: Summary of the action taken.

---

## 4. Consolidation Job

**Prompt:** "Run consolidation for Jan FY24."

**Tool Call:** `run_consolidation`

**Mock JSON Response:**
```json
{
  "jobId": "55921",
  "jobName": "Consolidate",
  "status": -1,
  "descriptiveStatus": "Processing",
  "details": "Mock job Consolidate started with params: {\"Entity\":\"Total Geography\",\"Period\":\"Jan\",\"Scenario\":\"Actual\",\"Year\":\"FY24\"}"
}
```

**Explanation:**
-   **status**: -1 indicates the job has just been submitted and is currently processing.
-   **details**: Confirms the parameters used for the consolidation (Entity, Period, Scenario, Year).
