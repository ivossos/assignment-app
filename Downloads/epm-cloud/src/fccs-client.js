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
exports.fccsClient = exports.FccsClient = void 0;
var axios_1 = require("axios");
var config_js_1 = require("./config.js");
var FccsClient = /** @class */ (function () {
    function FccsClient() {
        this.baseUrl = config_js_1.default.FCCS_URL.endsWith('/') ? config_js_1.default.FCCS_URL.slice(0, -1) : config_js_1.default.FCCS_URL;
        // Basic Auth Header
        var authHeader = "Basic ".concat(Buffer.from("".concat(config_js_1.default.FCCS_DOMAIN ? config_js_1.default.FCCS_DOMAIN + '.' : '').concat(config_js_1.default.FCCS_USERNAME, ":").concat(config_js_1.default.FCCS_PASSWORD)).toString('base64'));
        this.client = axios_1.default.create({
            baseURL: "".concat(this.baseUrl, "/HyperionPlanning/rest/").concat(config_js_1.default.FCCS_API_VERSION),
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });
    }
    FccsClient.prototype.getApplications = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (config_js_1.default.FCCS_MOCK_MODE) {
                            if (config_js_1.default.FCCS_LANGUAGE === 'pt') {
                                return [2 /*return*/, {
                                        items: [
                                            { name: 'FCCS_Global', type: 'FCCS', description: 'Consolidação Financeira Global' },
                                            { name: 'Relatorios_Fiscais_FY24', type: 'Tax', description: 'Aplicação de Relatórios Fiscais' },
                                            { name: 'Plan_Orcamento_2025', type: 'EPBCS', description: 'Planejamento Empresarial' },
                                            { name: 'Planejamento_Vendas', type: 'EPBCS', description: 'Previsão de Vendas' },
                                            { name: 'RH_ForcaTrabalho', type: 'EPBCS', description: 'Planejamento de Força de Trabalho' },
                                            { name: 'Planejamento_CapEx', type: 'EPBCS', description: 'Despesas de Capital' },
                                            { name: 'Modelagem_Estrategica', type: 'FCCS', description: 'Estratégia de Longo Prazo' },
                                            { name: 'Gerenciador_Fechamento', type: 'FCCS', description: 'Gerenciamento de Tarefas' },
                                            { name: 'Gerenciamento_Dados', type: 'FDMEE', description: 'Integração de Dados' },
                                            { name: 'Relatorios_Narrativos', type: 'NPR', description: 'Gerenciamento de Divulgação' }
                                        ]
                                    }];
                            }
                            return [2 /*return*/, {
                                    items: [
                                        { name: 'FCCS_Global', type: 'FCCS', description: 'Global Financial Consolidation' },
                                        { name: 'Tax_Reporting_FY24', type: 'Tax', description: 'Tax Reporting Application' },
                                        { name: 'Plan_Budget_2025', type: 'EPBCS', description: 'Enterprise Planning' },
                                        { name: 'Sales_Planning', type: 'EPBCS', description: 'Sales Forecasting' },
                                        { name: 'HR_Workforce', type: 'EPBCS', description: 'Workforce Planning' },
                                        { name: 'CapEx_Planning', type: 'EPBCS', description: 'Capital Expenditure' },
                                        { name: 'Strategic_Modeling', type: 'FCCS', description: 'Long-term Strategy' },
                                        { name: 'Close_Manager', type: 'FCCS', description: 'Task Management' },
                                        { name: 'Data_Management', type: 'FDMEE', description: 'Data Integration' },
                                        { name: 'Narrative_Reporting', type: 'NPR', description: 'Disclosure Management' }
                                    ]
                                }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.get('/applications')];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_1 = _a.sent();
                        throw new Error("Failed to get applications: ".concat(error_1.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    FccsClient.prototype.runMdx = function (application, query) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (config_js_1.default.FCCS_MOCK_MODE) {
                            if (config_js_1.default.FCCS_LANGUAGE === 'pt') {
                                return [2 /*return*/, {
                                        headers: ['Conta', 'Entidade', 'Periodo', 'Dados'],
                                        rows: [
                                            ['Lucro Liquido', 'America do Norte', 'Jan', '150000'],
                                            ['Lucro Liquido', 'America do Norte', 'Fev', '160000'],
                                            ['Lucro Liquido', 'EMEA', 'Jan', '120000'],
                                            ['Lucro Liquido', 'EMEA', 'Fev', '125000'],
                                            ['Desp Operacionais', 'America do Norte', 'Jan', '50000'],
                                            ['Desp Operacionais', 'America do Norte', 'Fev', '52000'],
                                            ['Desp Operacionais', 'EMEA', 'Jan', '40000'],
                                            ['Desp Operacionais', 'EMEA', 'Fev', '41000'],
                                            ['Receita', 'America do Norte', 'Jan', '200000'],
                                            ['Receita', 'EMEA', 'Jan', '160000']
                                        ]
                                    }];
                            }
                            return [2 /*return*/, {
                                    headers: ['Account', 'Entity', 'Period', 'Data'],
                                    rows: [
                                        ['Net Income', 'North America', 'Jan', '150000'],
                                        ['Net Income', 'North America', 'Feb', '160000'],
                                        ['Net Income', 'EMEA', 'Jan', '120000'],
                                        ['Net Income', 'EMEA', 'Feb', '125000'],
                                        ['Operating Exp', 'North America', 'Jan', '50000'],
                                        ['Operating Exp', 'North America', 'Feb', '52000'],
                                        ['Operating Exp', 'EMEA', 'Jan', '40000'],
                                        ['Operating Exp', 'EMEA', 'Feb', '41000'],
                                        ['Revenue', 'North America', 'Jan', '200000'],
                                        ['Revenue', 'EMEA', 'Jan', '160000']
                                    ]
                                }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.post("/applications/".concat(application, "/jobs"), {
                                jobType: 'MDX',
                                jobName: 'AdHoc_MDX',
                                parameters: {
                                    script: query
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_2 = _a.sent();
                        throw new Error("Failed to execute MDX: ".concat(error_2.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    FccsClient.prototype.runJob = function (application_1, jobType_1, jobName_1) {
        return __awaiter(this, arguments, void 0, function (application, jobType, jobName, parameters) {
            var isPt, response, error_3;
            if (parameters === void 0) { parameters = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (config_js_1.default.FCCS_MOCK_MODE) {
                            isPt = config_js_1.default.FCCS_LANGUAGE === 'pt';
                            return [2 /*return*/, {
                                    jobId: Math.floor(Math.random() * 100000).toString(),
                                    jobName: jobName,
                                    status: -1,
                                    descriptiveStatus: isPt ? 'Processando' : 'Processing',
                                    details: isPt
                                        ? "Job simulado ".concat(jobName, " iniciado com parametros: ").concat(JSON.stringify(parameters))
                                        : "Mock job ".concat(jobName, " started with params: ").concat(JSON.stringify(parameters))
                                }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.post("/applications/".concat(application, "/jobs"), {
                                jobType: jobType,
                                jobName: jobName,
                                parameters: parameters
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_3 = _a.sent();
                        throw new Error("Failed to run job ".concat(jobName, ": ").concat(error_3.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    FccsClient.prototype.getJobStatus = function (application, jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var isPt, statuses, status_1, response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (config_js_1.default.FCCS_MOCK_MODE) {
                            isPt = config_js_1.default.FCCS_LANGUAGE === 'pt';
                            statuses = isPt
                                ? ['Sucesso', 'Processando', 'Falha', 'Concluido com Erros']
                                : ['Success', 'Processing', 'Failed', 'Completed with Errors'];
                            status_1 = statuses[Math.floor(Math.random() * statuses.length)];
                            return [2 /*return*/, {
                                    jobId: jobId,
                                    status: (status_1 === 'Success' || status_1 === 'Sucesso') ? 0 : 1,
                                    descriptiveStatus: status_1,
                                    details: isPt ? "Status do job simulado para ID ".concat(jobId) : "Mock job status for ID ".concat(jobId)
                                }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.get("/applications/".concat(application, "/jobs/").concat(jobId))];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_4 = _a.sent();
                        throw new Error("Failed to get job status: ".concat(error_4.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    FccsClient.prototype.getDimensions = function (application) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (config_js_1.default.FCCS_MOCK_MODE) {
                            if (config_js_1.default.FCCS_LANGUAGE === 'pt') {
                                return [2 /*return*/, {
                                        items: [
                                            { name: 'Conta', type: 'Account', hierarchyType: 'Dynamic' },
                                            { name: 'Periodo', type: 'Time', hierarchyType: 'Stored' },
                                            { name: 'Fonte de Dados', type: 'Generic', hierarchyType: 'Stored' },
                                            { name: 'Consolidacao', type: 'Generic', hierarchyType: 'Stored' },
                                            { name: 'Entidade', type: 'Entity', hierarchyType: 'Stored' },
                                            { name: 'Cenario', type: 'Scenario', hierarchyType: 'Stored' },
                                            { name: 'Visao', type: 'View', hierarchyType: 'Stored' },
                                            { name: 'Anos', type: 'Year', hierarchyType: 'Stored' },
                                            { name: 'Moeda', type: 'Currency', hierarchyType: 'Stored' },
                                            { name: 'Intercompany', type: 'Generic', hierarchyType: 'Stored' },
                                            { name: 'Movimento', type: 'Generic', hierarchyType: 'Stored' },
                                            { name: 'Multi-GAAP', type: 'Generic', hierarchyType: 'Stored' }
                                        ]
                                    }];
                            }
                            return [2 /*return*/, {
                                    items: [
                                        { name: 'Account', type: 'Account', hierarchyType: 'Dynamic' },
                                        { name: 'Period', type: 'Time', hierarchyType: 'Stored' },
                                        { name: 'Data Source', type: 'Generic', hierarchyType: 'Stored' },
                                        { name: 'Consolidation', type: 'Generic', hierarchyType: 'Stored' },
                                        { name: 'Entity', type: 'Entity', hierarchyType: 'Stored' },
                                        { name: 'Scenario', type: 'Scenario', hierarchyType: 'Stored' },
                                        { name: 'View', type: 'View', hierarchyType: 'Stored' },
                                        { name: 'Years', type: 'Year', hierarchyType: 'Stored' },
                                        { name: 'Currency', type: 'Currency', hierarchyType: 'Stored' },
                                        { name: 'Intercompany', type: 'Generic', hierarchyType: 'Stored' },
                                        { name: 'Movement', type: 'Generic', hierarchyType: 'Stored' },
                                        { name: 'Multi-GAAP', type: 'Generic', hierarchyType: 'Stored' }
                                    ]
                                }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.get("/applications/".concat(application, "/dimensions"))];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_5 = _a.sent();
                        throw new Error("Failed to get dimensions: ".concat(error_5.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    FccsClient.prototype.generateReport = function (application_1, reportName_1) {
        return __awaiter(this, arguments, void 0, function (application, reportName, parameters) {
            var isPt, response, error_6;
            if (parameters === void 0) { parameters = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (config_js_1.default.FCCS_MOCK_MODE) {
                            isPt = config_js_1.default.FCCS_LANGUAGE === 'pt';
                            return [2 /*return*/, {
                                    reportName: reportName,
                                    format: 'HTML',
                                    content: "\n          <html>\n            <body>\n              <h1>".concat(reportName, "</h1>\n              <p>").concat(isPt ? 'Gerado para' : 'Generated for', " ").concat(application, "</p>\n              <table border=\"1\">\n                <tr><th>").concat(isPt ? 'Conta' : 'Account', "</th><th>").concat(isPt ? 'Valor' : 'Amount', "</th></tr>\n                <tr><td>").concat(isPt ? 'Lucro Liquido' : 'Net Income', "</td><td>$1,250,000</td></tr>\n                <tr><td>").concat(isPt ? 'Total de Ativos' : 'Total Assets', "</td><td>$5,000,000</td></tr>\n                <tr><td>").concat(isPt ? 'Total de Passivos' : 'Total Liabilities', "</td><td>$2,500,000</td></tr>\n              </table>\n              <p>").concat(isPt ? 'Parametros' : 'Parameters', ": ").concat(JSON.stringify(parameters), "</p>\n            </body>\n          </html>\n        ")
                                }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.post("/applications/".concat(application, "/reports/").concat(reportName, "/run"), parameters)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_6 = _a.sent();
                        throw new Error("Failed to generate report: ".concat(error_6.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    FccsClient.prototype.simulateTransaction = function (application, type, entity, percentage, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var isPt, isAcq, impact, goodwill, response, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (config_js_1.default.FCCS_MOCK_MODE) {
                            isPt = config_js_1.default.FCCS_LANGUAGE === 'pt';
                            isAcq = type === 'ACQUISITION';
                            impact = isAcq ? amount * 0.15 : -amount * 0.10;
                            goodwill = isAcq ? amount * 0.20 : 0;
                            return [2 /*return*/, {
                                    simulationId: Math.floor(Math.random() * 100000).toString(),
                                    type: type,
                                    entity: entity,
                                    status: isPt ? 'Simulação Concluída' : 'Simulation Completed',
                                    financialImpact: {
                                        revenueImpact: isPt ? "+".concat((amount * 0.5).toLocaleString(), " (Estimado)") : "+".concat((amount * 0.5).toLocaleString(), " (Estimated)"),
                                        netIncomeImpact: isPt ? "".concat(impact > 0 ? '+' : '').concat(impact.toLocaleString()) : "".concat(impact > 0 ? '+' : '').concat(impact.toLocaleString()),
                                        goodwill: isPt ? goodwill.toLocaleString() : goodwill.toLocaleString(),
                                        minorityInterest: isPt ? "".concat((100 - percentage), "%") : "".concat((100 - percentage), "%")
                                    },
                                    message: isPt
                                        ? "Simula\u00E7\u00E3o de ".concat(isAcq ? 'aquisição' : 'venda', " da entidade ").concat(entity, " (").concat(percentage, "%) processada com sucesso.")
                                        : "Simulation of ".concat(isAcq ? 'acquisition' : 'divestiture', " of entity ").concat(entity, " (").concat(percentage, "%) processed successfully.")
                                }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.post("/applications/".concat(application, "/simulations"), {
                                type: type,
                                entity: entity,
                                percentage: percentage,
                                amount: amount
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_7 = _a.sent();
                        throw new Error("Failed to simulate transaction: ".concat(error_7.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Helper to check connection
    FccsClient.prototype.validateConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getApplications()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        e_1 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return FccsClient;
}());
exports.FccsClient = FccsClient;
exports.fccsClient = new FccsClient();
