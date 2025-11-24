# Hallucination Prevention & System Integrity

To ensure the AI (ChatGPT/Claude) does not "hallucinate" functionality or invent actions that don't exist, this MCP server implements a **Multi-Layered Defense Strategy**.

## 1. The "Contract" Layer (OpenAPI & MCP)
The strongest defense is the strict definition of available tools.
-   **OpenAPI Specification (`/openapi.json`)**: This file tells ChatGPT *exactly* what endpoints exist (e.g., `/api/run_consolidation`). If an action isn't in this file, ChatGPT literally cannot call it. It's a hard constraint.
-   **MCP Tool Registration**: Similarly, for Claude Desktop, only tools registered in `src/index.ts` are visible.

## 2. Claude Desktop Specifics (MCP Protocol)
For Claude Desktop, the **Model Context Protocol (MCP)** itself provides the guardrails:
-   **Discovery (`ListTools`)**: When Claude connects, it asks "What tools do you have?". The server replies with a fixed list (e.g., `list_applications`, `run_consolidation`). Claude **cannot** call a tool that wasn't in this list. It's technically impossible via the protocol.
-   **Schema Enforcement**: Each tool has a JSON Schema defined in `src/index.ts`. Claude uses this to understand exactly what arguments are required (e.g., `application` is a string).
-   **Server-Side Rejection**: If Claude *does* try to send a "hallucinated" argument (like `force=true` where none exists), our `zod` validation inside the tool handler will reject it with an error, forcing Claude to correct itself.

## 3. The Validation Layer (Zod Schemas)
Even if the AI tries to call a valid tool with invalid data (e.g., a made-up parameter "force_mode=true" that doesn't exist), our server rejects it.
-   **Input Validation**: We use `zod` schemas to validate every request.
    -   *Example*: If `run_consolidation` expects `year`, `period`, `scenario`, and the AI sends `date="2024"`, the server throws an error immediately: `Invalid inputs`.

## 3. The Instruction Layer (System Prompt)
We explicitly instruct the AI on its behavioral boundaries in `chatgpt_system_prompt.md`.
-   **"Strict Tool Usage"**: We tell it: "ONLY use the tools explicitly defined. Do NOT invent new tools."
-   **"No Fake Data"**: We instruct it never to make up numbers if a query fails.

## 4. The Runtime Layer (Server Code)
-   **Unknown Tool Handling**: In `src/index.ts`, the `default` case in our switch statements throws an error: `Unknown tool: ${name}`. If the AI somehow tries to call `run_magic_fix`, the server catches it and returns an error message, which corrects the AI's behavior.

## Summary
You don't need to "hope" the AI doesn't hallucinate functionality. The **Server Code + OpenAPI Definition** acts as a hard wall. The AI can *say* it wants to do something impossible, but it cannot *execute* it.
