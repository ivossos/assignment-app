"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
var sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
var zod_1 = require("zod");
var express_1 = require("express");
var fccs_client_js_1 = require("./fccs-client.js");
var config_js_1 = require("./config.js");
var server = new mcp_js_1.McpServer({
    name: 'oracle-fccs-mcp',
    version: '1.0.0',
});
// Tool: List Applications
var listAppsSchema = zod_1.z.object({});
server.registerTool('list_applications', {
    description: 'List available FCCS applications',
    inputSchema: listAppsSchema.shape
}, function () { return __awaiter(void 0, void 0, void 0, function () {
    var apps, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, fccs_client_js_1.fccsClient.getApplications()];
            case 1:
                apps = _a.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(apps, null, 2),
                            },
                        ],
                    }];
            case 2:
                error_1 = _a.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: "Error listing applications: ".concat(error_1.message),
                            },
                        ],
                        isError: true,
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Tool: Get Dimensions
var getDimensionsSchema = zod_1.z.object({
    application: zod_1.z.string().describe('The name of the application'),
});
server.registerTool('get_dimensions', {
    description: 'List dimensions for an application',
    inputSchema: getDimensionsSchema.shape
}, function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, fccs_client_js_1.fccsClient.getDimensions(args.application)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    }];
            case 2:
                error_2 = _a.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: "Error getting dimensions: ".concat(error_2.message),
                            },
                        ],
                        isError: true,
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Tool: Run MDX Query
var runMdxSchema = zod_1.z.object({
    application: zod_1.z.string().describe('The name of the application'),
    query: zod_1.z.string().describe('The MDX query script'),
});
server.registerTool('run_mdx_query', {
    description: 'Execute an MDX query against an FCCS application',
    inputSchema: runMdxSchema.shape
}, function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, fccs_client_js_1.fccsClient.runMdx(args.application, args.query)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    }];
            case 2:
                error_3 = _a.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: "Error executing MDX: ".concat(error_3.message),
                            },
                        ],
                        isError: true,
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Tool: Run Consolidation
var runConsolidationSchema = zod_1.z.object({
    application: zod_1.z.string().describe('The name of the application'),
    period: zod_1.z.string().describe('The period to consolidate (e.g., "Jan")'),
    scenario: zod_1.z.string().describe('The scenario (e.g., "Actual")'),
    year: zod_1.z.string().describe('The year (e.g., "FY24")'),
    entity: zod_1.z.string().optional().describe('Optional entity to consolidate'),
});
server.registerTool('run_consolidation', {
    description: 'Run a consolidation job',
    inputSchema: runConsolidationSchema.shape
}, function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var params, result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                params = {
                    "Entity": args.entity || "Total Geography",
                    "Period": args.period,
                    "Scenario": args.scenario,
                    "Year": args.year
                };
                return [4 /*yield*/, fccs_client_js_1.fccsClient.runJob(args.application, 'Rules', 'Consolidate', params)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    }];
            case 2:
                error_4 = _a.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: "Error running consolidation: ".concat(error_4.message),
                            },
                        ],
                        isError: true,
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Tool: Run Business Rule
var runBusinessRuleSchema = zod_1.z.object({
    application: zod_1.z.string().describe('The name of the application'),
    ruleName: zod_1.z.string().describe('The name of the business rule'),
    parameters: zod_1.z.string().optional().describe('JSON string of parameters'),
});
server.registerTool('run_business_rule', {
    description: 'Run a specific business rule',
    inputSchema: runBusinessRuleSchema.shape
}, function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedParams, result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                parsedParams = {};
                if (args.parameters) {
                    try {
                        parsedParams = JSON.parse(args.parameters);
                    }
                    catch (e) {
                        return [2 /*return*/, {
                                content: [{ type: 'text', text: 'Invalid JSON parameters' }],
                                isError: true
                            }];
                    }
                }
                return [4 /*yield*/, fccs_client_js_1.fccsClient.runJob(args.application, 'Rules', args.ruleName, parsedParams)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    }];
            case 2:
                error_5 = _a.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: "Error running business rule: ".concat(error_5.message),
                            },
                        ],
                        isError: true,
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Tool: Generate Report
var generateReportSchema = zod_1.z.object({
    application: zod_1.z.string().describe('The name of the application'),
    reportName: zod_1.z.string().describe('The name of the report'),
    parameters: zod_1.z.string().optional().describe('JSON string of parameters'),
});
server.registerTool('generate_report', {
    description: 'Generate a financial report',
    inputSchema: generateReportSchema.shape
}, function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedParams, result, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                parsedParams = {};
                if (args.parameters) {
                    try {
                        parsedParams = JSON.parse(args.parameters);
                    }
                    catch (e) {
                        return [2 /*return*/, {
                                content: [{ type: 'text', text: 'Invalid JSON parameters' }],
                                isError: true
                            }];
                    }
                }
                return [4 /*yield*/, fccs_client_js_1.fccsClient.generateReport(args.application, args.reportName, parsedParams)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
                            },
                        ],
                    }];
            case 2:
                error_6 = _a.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: "Error generating report: ".concat(error_6.message),
                            },
                        ],
                        isError: true,
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Tool: Get Job Status
var getJobStatusSchema = zod_1.z.object({
    application: zod_1.z.string().describe('The name of the application'),
    jobId: zod_1.z.string().describe('The ID of the job'),
});
server.registerTool('get_job_status', {
    description: 'Check the status of a job',
    inputSchema: getJobStatusSchema.shape
}, function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, fccs_client_js_1.fccsClient.getJobStatus(args.application, args.jobId)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    }];
            case 2:
                error_7 = _a.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: "Error getting job status: ".concat(error_7.message),
                            },
                        ],
                        isError: true,
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Tool: Simulate Transaction
var simulateTransactionSchema = zod_1.z.object({
    application: zod_1.z.string().describe('The name of the application'),
    type: zod_1.z.enum(['ACQUISITION', 'DIVESTITURE']).describe('Type of transaction'),
    entity: zod_1.z.string().describe('Target entity name'),
    percentage: zod_1.z.number().min(0).max(100).describe('Ownership percentage'),
    amount: zod_1.z.number().describe('Transaction amount'),
});
server.registerTool('simulate_transaction', {
    description: 'Simulate financial impact of M&A transactions',
    inputSchema: simulateTransactionSchema.shape
}, function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, fccs_client_js_1.fccsClient.simulateTransaction(args.application, args.type, args.entity, args.percentage, args.amount)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    }];
            case 2:
                error_8 = _a.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: "Error simulating transaction: ".concat(error_8.message),
                            },
                        ],
                        isError: true,
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var isConnected, error_9, app, transport, PORT;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.error('Starting Oracle FCCS MCP Server...');
                    if (config_js_1.default.FCCS_MOCK_MODE) {
                        console.error('⚠️  Running in MOCK MODE');
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fccs_client_js_1.fccsClient.validateConnection()];
                case 2:
                    isConnected = _a.sent();
                    if (!isConnected) {
                        console.error('❌ Failed to connect to FCCS instance. Check configuration.');
                        if (!config_js_1.default.FCCS_MOCK_MODE)
                            process.exit(1);
                    }
                    else {
                        console.error('✅ Connected to FCCS instance');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_9 = _a.sent();
                    console.error('❌ Connection check failed:', error_9);
                    if (!config_js_1.default.FCCS_MOCK_MODE)
                        process.exit(1);
                    return [3 /*break*/, 4];
                case 4:
                    app = (0, express_1.default)();
                    transport = new sse_js_1.SSEServerTransport('/messages', '/sse');
                    app.get('/sse', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, transport.handlePostMessage(req, res)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post('/messages', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, transport.handlePostMessage(req, res)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    PORT = process.env.PORT || 3000;
                    app.listen(PORT, function () {
                        console.error("\uD83D\uDE80 Server running on http://localhost:".concat(PORT, "/sse"));
                    });
                    return [4 /*yield*/, server.connect(transport)];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error('Fatal error:', error);
    process.exit(1);
});
