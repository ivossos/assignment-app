# Oracle FCCS MCP Server - 10 Example Prompts

Here are 10 example prompts you can use to interact with the Oracle FCCS MCP Server.

1.  **List Applications**
    "List all available FCCS applications in the current environment."

2.  **Basic MDX Query**
    "Run an MDX query on 'FCCS_Global' to get Net Income for Jan and Feb."

3.  **Consolidate North America**
    "Run a consolidation for the 'FCCS_Global' application for Period 'Jan', Scenario 'Actual', Year 'FY24', and Entity 'North America'."

4.  **Check Job Status**
    "Check the status of job ID '12345' in 'FCCS_Global'."

5.  **Run Allocation Rule**
    "Execute the 'Allocate_Overhead' business rule in 'FCCS_Global' with parameters: `{\"CostCenter\": \"CC_100\", \"Amount\": 5000}`."

6.  **Get Revenue Data**
    "Query 'FCCS_Global' for Revenue data across all regions for Q1 FY24."

7.  **Consolidate All Regions**
    "Trigger a full consolidation for 'FCCS_Global' for FY24, Actual, Jan. Do not specify an entity to consolidate all."

8.  **Run Currency Conversion**
    "Run the 'Currency_Conversion' rule for 'FCCS_Global' targeting 'EUR' to 'USD' for Jan FY24."

9.  **List Dimensions**
    "List the dimensions for the 'Tax_Reporting_FY24' application."

10. **Generate Financial Report**
    "Generate the 'Balance_Sheet_Summary' report for 'FCCS_Global' with parameters: `{\"Year\": \"FY24\", \"Period\": \"Q1\"}`."

11. **Complex MDX Analysis**
    "Execute an MDX query on 'Plan_Budget_2025' to compare 'Budget' vs 'Actual' for 'Operating Expenses' in 'Jan'."

## Advanced Scenarios

12. **CTA Calculation (Cumulative Translation Adjustment)**
    "Run the 'Calculate_CTA' rule for the 'FCCS_Global' application. Set parameters for Year 'FY24', Period 'Dec', and Entity 'Holding_Europe'. The goal is to verify the cumulative currency translation adjustment."

13. **Intercompany Eliminations Report**
    "Generate the 'IC_Eliminations_Report' for 'FCCS_Global' filtering by the entity pair 'Entity_A' and 'Entity_B' for period 'Q4'. I want to see elimination discrepancies."

14. **Consolidation with Elimination**
    "Run a full consolidation on 'FCCS_Global' for 'FY24', 'Dec', 'Actual'. Ensure the Consolidation dimension includes 'FCCS_Elimination' to process intercompany eliminations correctly."

15. **Currency Revaluation**
    "Run the 'Currency_Revaluation' job for all balance sheet accounts in 'FCCS_Global' for the 'Mar' close period, using the month-end exchange rate."

## M&A Simulations (Mergers & Acquisitions)

16. **Simulate Acquisition**
    "Simulate the acquisition of 'Tech_StartUp_US' for 5 million with 80% stake in 'FCCS_Global'. I want to see the estimated impact on Goodwill and Net Income."

17. **Simulate Divestiture**
    "Simulate the sale of subsidiary 'Legacy_Division' in 'FCCS_Global'. The transaction value is 2 million and we are selling 100% stake."

## Real-Life Scenarios (Storytelling)

18. **Market Expansion (Acquisition & Consolidation)**
    "We are acquiring 'Competitor_X_LATAM' to expand in Latin America.
    2. Then, run a full consolidation for 'FY24', 'Jan' to see the aggregated impact."

19. **Strategic Divestment (Sale & Report)**
    "The board decided to sell the 'Old_Factory' unit.
    1. Simulate the divestiture of this entity for 3 million.
    2. Generate the 'ProForma_Statement' report to visualize our numbers without this unit."

20. **Currency Impact (Currency Crisis)**
    "There was a strong devaluation in the local currency of 'Brazil_Ops'.
    1. Run the 'Currency_Revaluation' rule for 'FCCS_Global' in 'Feb'.
    2. Generate a 'CTA_Analysis' report to understand the impact on Equity."
