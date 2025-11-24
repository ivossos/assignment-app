import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import express from 'express';
import { fccsClient } from './fccs-client.js';
import config from './config.js';

const app = express();

// Store active servers by session ID
const servers = new Map<string, Server>();

// Tool Definitions
const listAppsSchema = z.object({});
const getDimensionsSchema = z.object({ application: z.string() });
const runMdxSchema = z.object({ application: z.string(), query: z.string() });
const runConsolidationSchema = z.object({
    application: z.string(),
    period: z.string(),
    scenario: z.string(),
    year: z.string(),
    entity: z.string().optional(),
});
const runBusinessRuleSchema = z.object({
    application: z.string(),
    ruleName: z.string(),
    parameters: z.string().optional(),
});
const generateReportSchema = z.object({
    application: z.string(),
    reportName: z.string(),
    parameters: z.string().optional(),
});
const getJobStatusSchema = z.object({ application: z.string(), jobId: z.string() });
const simulateTransactionSchema = z.object({
    application: z.string(),
    type: z.enum(['ACQUISITION', 'DIVESTITURE']),
    entity: z.string(),
    percentage: z.number(),
    amount: z.number(),
});

function registerTools(server: Server) {
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: [
                {
                    name: 'list_applications',
                    description: 'List available FCCS applications',
                    inputSchema: { type: 'object', properties: {} },
                },
                {
                    name: 'get_dimensions',
                    description: 'List dimensions for an application',
                    inputSchema: {
                        type: 'object',
                        properties: { application: { type: 'string' } },
                        required: ['application'],
                    },
                },
                {
                    name: 'run_mdx_query',
                    description: 'Execute an MDX query',
                    inputSchema: {
                        type: 'object',
                        properties: { application: { type: 'string' }, query: { type: 'string' } },
                        required: ['application', 'query'],
                    },
                },
                {
                    name: 'run_consolidation',
                    description: 'Run a consolidation job',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            application: { type: 'string' },
                            period: { type: 'string' },
                            scenario: { type: 'string' },
                            year: { type: 'string' },
                            entity: { type: 'string' },
                        },
                        required: ['application', 'period', 'scenario', 'year'],
                    },
                },
                {
                    name: 'run_business_rule',
                    description: 'Run a business rule',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            application: { type: 'string' },
                            ruleName: { type: 'string' },
                            parameters: { type: 'string' },
                        },
                        required: ['application', 'ruleName'],
                    },
                },
                {
                    name: 'generate_report',
                    description: 'Generate a financial report',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            application: { type: 'string' },
                            reportName: { type: 'string' },
                            parameters: { type: 'string' },
                        },
                        required: ['application', 'reportName'],
                    },
                },
                {
                    name: 'get_job_status',
                    description: 'Check job status',
                    inputSchema: {
                        type: 'object',
                        properties: { application: { type: 'string' }, jobId: { type: 'string' } },
                        required: ['application', 'jobId'],
                    },
                },
                {
                    name: 'simulate_transaction',
                    description: 'Simulate M&A transaction',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            application: { type: 'string' },
                            type: { type: 'string', enum: ['ACQUISITION', 'DIVESTITURE'] },
                            entity: { type: 'string' },
                            percentage: { type: 'number' },
                            amount: { type: 'number' },
                        },
                        required: ['application', 'type', 'entity', 'percentage', 'amount'],
                    },
                },
            ],
        };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        try {
            let result: any;

            // Guardrail: Read-Only Mode Check
            const writeTools = ['run_consolidation', 'run_business_rule', 'simulate_transaction'];
            if (config.FCCS_READ_ONLY && writeTools.includes(name)) {
                throw new Error(`Action '${name}' is blocked because the server is in READ-ONLY mode.`);
            }

            switch (name) {
                case 'list_applications':
                    result = await fccsClient.getApplications();
                    break;
                case 'get_dimensions':
                    result = await fccsClient.getDimensions((args as any).application);
                    break;
                case 'run_mdx_query':
                    result = await fccsClient.runMdx((args as any).application, (args as any).query);
                    break;
                case 'run_consolidation':
                    result = await fccsClient.runJob(
                        (args as any).application,
                        'Rules',
                        'Consolidate',
                        {
                            Entity: (args as any).entity || 'Total Geography',
                            Period: (args as any).period,
                            Scenario: (args as any).scenario,
                            Year: (args as any).year,
                        }
                    );
                    break;
                case 'run_business_rule':
                    let ruleParams = {};
                    if ((args as any).parameters) {
                        try { ruleParams = JSON.parse((args as any).parameters); } catch (e) { }
                    }
                    result = await fccsClient.runJob((args as any).application, 'Rules', (args as any).ruleName, ruleParams);
                    break;
                case 'generate_report':
                    let reportParams = {};
                    if ((args as any).parameters) {
                        try { reportParams = JSON.parse((args as any).parameters); } catch (e) { }
                    }
                    result = await fccsClient.generateReport((args as any).application, (args as any).reportName, reportParams);
                    break;
                case 'get_job_status':
                    result = await fccsClient.getJobStatus((args as any).application, (args as any).jobId);
                    break;
                case 'simulate_transaction':
                    result = await fccsClient.simulateTransaction(
                        (args as any).application,
                        (args as any).type,
                        (args as any).entity,
                        (args as any).percentage,
                        (args as any).amount
                    );
                    break;
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
            return {
                content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }],
            };
        } catch (error: any) {
            return {
                content: [{ type: 'text', text: `Error: ${error.message}` }],
                isError: true,
            };
        }
    });
}

app.get('/sse', async (req, res) => {
    console.log('New SSE connection');
    const transport = new SSEServerTransport('/messages', res);
    const server = new Server(
        {
            name: 'oracle-fccs-mcp',
            version: '1.0.0',
        },
        {
            capabilities: {
                tools: {},
            },
        }
    );

    registerTools(server);

    await server.connect(transport);
    servers.set(transport.sessionId, server);

    transport.onclose = () => {
        console.log('SSE connection closed');
        servers.delete(transport.sessionId);
    };
});

app.post('/messages', async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const server = servers.get(sessionId);

    if (!server) {
        res.status(404).send('Session not found');
        return;
    }

    // We need to access the transport to handle the message
    // But server.transport is private/protected usually.
    // However, we can just handle it via the transport if we had reference,
    // or maybe the server has a method?
    // Actually, SSEServerTransport.handlePostMessage is static-like? No.

    // Wait, I need the transport instance to call handlePostMessage.
    // I should store transport in the map, or server+transport.
    // Let's hack: we can't easily get transport from server.
    // So let's store transport in a separate map or change the map value.

    // For now, I'll assume I can't get it from server easily, so I will change the map to store transport.
    // But wait, I need the server to keep it alive? The server is kept alive by the transport connection?

    // Let's look at how I stored it: servers.set(transport.sessionId, server);
    // I should store the TRANSPORT.
});

// Re-writing the map logic to store transports
const transports = new Map<string, SSEServerTransport>();

app.get('/sse', async (req, res) => {
    console.log('New SSE connection');
    const transport = new SSEServerTransport('/messages', res);
    const server = new Server(
        {
            name: 'oracle-fccs-mcp',
            version: '1.0.0',
        },
        {
            capabilities: {
                tools: {},
            },
        }
    );

    registerTools(server);

    await server.connect(transport);
    transports.set(transport.sessionId, transport);

    transport.onclose = () => {
        console.log('SSE connection closed');
        transports.delete(transport.sessionId);
    };
});

app.post('/messages', async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.get(sessionId);

    if (!transport) {
        res.status(404).send('Session not found');
        return;
    }

    await transport.handlePostMessage(req, res);
});

// --- REST API & OpenAPI Support ---

app.use(express.json());

// 1. OpenAPI Schema Generator
app.get('/openapi.json', async (req, res) => {
    const tools = [
        {
            name: 'list_applications',
            description: 'List available FCCS applications',
            inputSchema: { type: 'object', properties: {} },
        },
        {
            name: 'get_dimensions',
            description: 'List dimensions for an application',
            inputSchema: {
                type: 'object',
                properties: { application: { type: 'string' } },
                required: ['application'],
            },
        },
        {
            name: 'run_mdx_query',
            description: 'Execute an MDX query',
            inputSchema: {
                type: 'object',
                properties: { application: { type: 'string' }, query: { type: 'string' } },
                required: ['application', 'query'],
            },
        },
        {
            name: 'run_consolidation',
            description: 'Run a consolidation job',
            inputSchema: {
                type: 'object',
                properties: {
                    application: { type: 'string' },
                    period: { type: 'string' },
                    scenario: { type: 'string' },
                    year: { type: 'string' },
                    entity: { type: 'string' },
                },
                required: ['application', 'period', 'scenario', 'year'],
            },
        },
        {
            name: 'run_business_rule',
            description: 'Run a business rule',
            inputSchema: {
                type: 'object',
                properties: {
                    application: { type: 'string' },
                    ruleName: { type: 'string' },
                    parameters: { type: 'string' },
                },
                required: ['application', 'ruleName'],
            },
        },
        {
            name: 'generate_report',
            description: 'Generate a financial report',
            inputSchema: {
                type: 'object',
                properties: {
                    application: { type: 'string' },
                    reportName: { type: 'string' },
                    parameters: { type: 'string' },
                },
                required: ['application', 'reportName'],
            },
        },
        {
            name: 'get_job_status',
            description: 'Check job status',
            inputSchema: {
                type: 'object',
                properties: { application: { type: 'string' }, jobId: { type: 'string' } },
                required: ['application', 'jobId'],
            },
        },
        {
            name: 'simulate_transaction',
            description: 'Simulate M&A transaction',
            inputSchema: {
                type: 'object',
                properties: {
                    application: { type: 'string' },
                    type: { type: 'string', enum: ['ACQUISITION', 'DIVESTITURE'] },
                    entity: { type: 'string' },
                    percentage: { type: 'number' },
                    amount: { type: 'number' },
                },
                required: ['application', 'type', 'entity', 'percentage', 'amount'],
            },
        },
    ];

    const paths: any = {};

    tools.forEach(tool => {
        paths[`/api/${tool.name}`] = {
            post: {
                operationId: tool.name,
                summary: tool.description,
                description: tool.description,
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: tool.inputSchema
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    additionalProperties: true // Allow any structure
                                }
                            }
                        }
                    }
                }
            }
        };
    });

    const openApiDoc = {
        openapi: '3.0.0',
        info: {
            title: 'Oracle FCCS MCP Server',
            version: '1.0.0',
            description: 'API for interacting with Oracle FCCS via MCP tools'
        },
        servers: [
            {
                url: 'https://your-server-url.com', // User needs to update this if deploying
                description: 'Production Server'
            }
        ],
        paths: paths
    };

    res.json(openApiDoc);
});

// 2. REST Endpoints for Tools
app.post('/api/:toolName', async (req, res) => {
    const { toolName } = req.params;
    const args = req.body;

    try {
        let result: any;

        // Guardrail: Read-Only Mode Check
        const writeTools = ['run_consolidation', 'run_business_rule', 'simulate_transaction'];
        if (config.FCCS_READ_ONLY && writeTools.includes(toolName)) {
            res.status(403).json({ error: `Action '${toolName}' is blocked because the server is in READ-ONLY mode.` });
            return;
        }

        switch (toolName) {
            case 'list_applications':
                result = await fccsClient.getApplications();
                break;
            case 'get_dimensions':
                result = await fccsClient.getDimensions(args.application);
                break;
            case 'run_mdx_query':
                result = await fccsClient.runMdx(args.application, args.query);
                break;
            case 'run_consolidation':
                result = await fccsClient.runJob(
                    args.application,
                    'Rules',
                    'Consolidate',
                    {
                        Entity: args.entity || 'Total Geography',
                        Period: args.period,
                        Scenario: args.scenario,
                        Year: args.year,
                    }
                );
                break;
            case 'run_business_rule':
                let ruleParams = {};
                if (args.parameters) {
                    try { ruleParams = typeof args.parameters === 'string' ? JSON.parse(args.parameters) : args.parameters; } catch (e) { }
                }
                result = await fccsClient.runJob(args.application, 'Rules', args.ruleName, ruleParams);
                break;
            case 'generate_report':
                let reportParams = {};
                if (args.parameters) {
                    try { reportParams = typeof args.parameters === 'string' ? JSON.parse(args.parameters) : args.parameters; } catch (e) { }
                }
                result = await fccsClient.generateReport(args.application, args.reportName, reportParams);
                break;
            case 'get_job_status':
                result = await fccsClient.getJobStatus(args.application, args.jobId);
                break;
            case 'simulate_transaction':
                result = await fccsClient.simulateTransaction(
                    args.application,
                    args.type,
                    args.entity,
                    args.percentage,
                    args.amount
                );
                break;
            default:
                res.status(404).json({ error: `Unknown tool: ${toolName}` });
                return;
        }
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

async function main() {
    if (config.FCCS_MOCK_MODE) {
        console.error('⚠️  Running in MOCK MODE');
    }

    try {
        const isConnected = await fccsClient.validateConnection();
        if (!isConnected) {
            console.error('❌ Failed to connect to FCCS instance.');
            if (!config.FCCS_MOCK_MODE) process.exit(1);
        } else {
            console.error('✅ Connected to FCCS instance');
        }
    } catch (error) {
        console.error('❌ Connection check failed:', error);
        if (!config.FCCS_MOCK_MODE) process.exit(1);
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.error(`🚀 Server running on http://localhost:${PORT}/sse`);
    });
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
