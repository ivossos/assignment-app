# Implementation Plan - Oracle FCCS MCP Server

This plan outlines the steps to build an MCP server for Oracle EPM Cloud FCCS.

## User Review Required
> [!IMPORTANT]
> I will assume Basic Authentication (User/Password) for the initial implementation as it is the most straightforward for FCCS REST APIs, but OAuth2 is mentioned as a requirement. I will structure the auth module to be extensible.
> I will use `axios` for HTTP requests.

## Proposed Changes

### Project Structure
#### [NEW] [package.json](file:///Users/ioannisvossos/Downloads/epm-cloud/package.json)
- Dependencies: `@modelcontextprotocol/sdk`, `axios`, `dotenv`, `zod`
- DevDependencies: `typescript`, `@types/node`, `ts-node`

#### [NEW] [tsconfig.json](file:///Users/ioannisvossos/Downloads/epm-cloud/tsconfig.json)
- Standard Node.js TypeScript configuration.

### Source Code (`src/`)

#### [NEW] [src/index.ts](file:///Users/ioannisvossos/Downloads/epm-cloud/src/index.ts)
- Entry point for the MCP server.
- Setup `McpServer` and tool registration.

#### [NEW] [src/config.ts](file:///Users/ioannisvossos/Downloads/epm-cloud/src/config.ts)
- Environment variable loading and validation using `zod`.
- `FCCS_URL`, `FCCS_USERNAME`, `FCCS_PASSWORD`, `FCCS_DOMAIN` (if needed).

#### [NEW] [src/fccs-client.ts](file:///Users/ioannisvossos/Downloads/epm-cloud/src/fccs-client.ts)
- Class `FccsClient` to handle REST API communication.
- Methods:
    - `login()` / `getSession()`
    - `getApplications()`
    - `runMdx(query)`
    - `runJob(jobType, jobName, parameters)`
    - `getJobStatus(jobId)`

#### [NEW] [src/tools/](file:///Users/ioannisvossos/Downloads/epm-cloud/src/tools/)
- Separate files for tool definitions if the file grows too large, otherwise keep in `index.ts` or `tools.ts`.
- Tools to implement:
    - `list_applications`
    - `get_dimensions`
    - `execute_mdx`
    - `run_consolidation`
    - `run_business_rule`

## Verification Plan

### Automated Tests
- I will create a simple test script `test-connection.ts` to verify connectivity if credentials are provided.
- Since I don't have a real FCCS instance, I will implement a "Mock Mode" in the client if `FCCS_MOCK_MODE=true` is set, returning sample JSON responses for verification of the MCP flow.

### Manual Verification
- The user can run the server and connect via an MCP client (like Claude Desktop or Inspector).
