# Architecture & Design

## System Overview

The **Oracle FCCS MCP Server** acts as a middleware bridge between AI assistants (Claude, ChatGPT) and the Oracle EPM Cloud FCCS platform. It abstracts complex FCCS REST API calls into semantic "Tools" that LLMs can understand and execute safely.

## High-Level Architecture

```mermaid
graph TD
    subgraph "AI Clients"
        Claude[Claude Desktop]
        GPT[ChatGPT (Custom GPT)]
        N8N[n8n Workflow]
    end

    subgraph "MCP Server (Node.js)"
        Server[MCP Server Instance]
        Router[Tool Router]
        
        subgraph "Middleware"
            Auth[Authentication]
            Guard[Guardrails / Read-Only]
        end
        
        Client[FCCS Client (Axios)]
        Mock[Mock Engine]
    end

    subgraph "External Systems"
        Oracle[Oracle FCCS Cloud]
    end

    Claude -- SSE / Stdio --> Server
    GPT -- HTTPS / OpenAPI --> Server
    N8N -- HTTP --> Server

    Server --> Auth
    Auth --> Router
    Router --> Guard
    Guard --> Client
    
    Client -- REST API --> Oracle
    Client -.-> Mock
```

## Core Components

### 1. Interface Layer (MCP Protocol)
-   **Server**: Built on `@modelcontextprotocol/sdk`. Handles protocol negotiation, capability advertising, and message transport.
-   **Transports**:
    -   **Stdio**: For local usage (e.g., Claude Desktop running the process directly).
    -   **SSE (Server-Sent Events)**: For remote usage or connecting multiple clients (e.g., n8n, remote Claude).
    -   **HTTP/REST**: Exposes tools as standard POST endpoints for ChatGPT Actions.

### 2. Application Layer
-   **Tool Definitions**: Zod schemas define the contract for each tool (`run_consolidation`, `run_mdx_query`, etc.).
-   **Guardrails**:
    -   **Read-Only Mode**: Prevents write operations (`FCCS_READ_ONLY=true`) at the router level.
    -   **Critical Action Confirmation**: Middleware that requires explicit user approval for high-impact actions (implemented in the prompt/client logic).

### 3. Integration Layer (`FCCSClient`)
-   **Authentication**: Handles Basic Auth and potential future OAuth flows.
-   **REST Wrapper**: Encapsulates Axios calls to Oracle FCCS endpoints (e.g., `/HyperionPlanning/rest/v3/applications`).
-   **Mock Engine**: A robust simulation layer that intercepts calls when `FCCS_MOCK_MODE=true`, returning realistic JSON responses for demos and testing.

## Data Flow

1.  **Request**: User asks "Run consolidation for Jan 2024".
2.  **Translation**: LLM converts this intent into a tool call: `run_consolidation({ period: "Jan", year: "FY24", ... })`.
3.  **Validation**: MCP Server validates the arguments against the Zod schema.
4.  **Guardrail Check**: Server checks if `run_consolidation` is allowed (not read-only).
5.  **Execution**: `FCCSClient` constructs the REST payload and calls Oracle FCCS (or Mock).
6.  **Response**: Oracle returns a Job ID.
7.  **Feedback**: Server returns the Job ID to the LLM, which communicates it to the user.

## Security Design

-   **Environment Variables**: All credentials (`FCCS_USERNAME`, `FCCS_PASSWORD`) are stored in `.env` and never exposed in code.
-   **Least Privilege**: The MCP server only exposes specific, pre-defined actions, limiting the surface area compared to raw API access.
-   **Input Validation**: Strict typing ensures only valid parameters are sent to Oracle.
