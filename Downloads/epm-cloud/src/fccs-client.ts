import axios, { AxiosInstance } from 'axios';
import config from './config.js';

export class FccsClient {
    private client: AxiosInstance;
    private baseUrl: string;

    constructor() {
        this.baseUrl = config.FCCS_URL.endsWith('/') ? config.FCCS_URL.slice(0, -1) : config.FCCS_URL;

        // Basic Auth Header
        const authHeader = `Basic ${Buffer.from(`${config.FCCS_DOMAIN ? config.FCCS_DOMAIN + '.' : ''}${config.FCCS_USERNAME}:${config.FCCS_PASSWORD}`).toString('base64')}`;

        this.client = axios.create({
            baseURL: `${this.baseUrl}/HyperionPlanning/rest/${config.FCCS_API_VERSION}`,
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });
    }

    async getApplications() {
        if (config.FCCS_MOCK_MODE) {
            if (config.FCCS_LANGUAGE === 'pt') {
                return {
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
                };
            }
            return {
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
            };
        }
        try {
            const response = await this.client.get('/applications');
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to get applications: ${error.message}`);
        }
    }

    async runMdx(application: string, query: string) {
        if (config.FCCS_MOCK_MODE) {
            if (config.FCCS_LANGUAGE === 'pt') {
                return {
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
                };
            }
            return {
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
            };
        }
        try {
            const response = await this.client.post(`/applications/${application}/jobs`, {
                jobType: 'MDX',
                jobName: 'AdHoc_MDX',
                parameters: {
                    script: query
                }
            });
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to execute MDX: ${error.message}`);
        }
    }

    async runJob(application: string, jobType: string, jobName: string, parameters: any = {}) {
        if (config.FCCS_MOCK_MODE) {
            const isPt = config.FCCS_LANGUAGE === 'pt';
            return {
                jobId: Math.floor(Math.random() * 100000).toString(),
                jobName: jobName,
                status: -1,
                descriptiveStatus: isPt ? 'Processando' : 'Processing',
                details: isPt
                    ? `Job simulado ${jobName} iniciado com parametros: ${JSON.stringify(parameters)}`
                    : `Mock job ${jobName} started with params: ${JSON.stringify(parameters)}`
            };
        }
        try {
            const response = await this.client.post(`/applications/${application}/jobs`, {
                jobType,
                jobName,
                parameters
            });
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to run job ${jobName}: ${error.message}`);
        }
    }

    async getJobStatus(application: string, jobId: string) {
        if (config.FCCS_MOCK_MODE) {
            const isPt = config.FCCS_LANGUAGE === 'pt';
            const statuses = isPt
                ? ['Sucesso', 'Processando', 'Falha', 'Concluido com Erros']
                : ['Success', 'Processing', 'Failed', 'Completed with Errors'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            return {
                jobId: jobId,
                status: (status === 'Success' || status === 'Sucesso') ? 0 : 1,
                descriptiveStatus: status,
                details: isPt ? `Status do job simulado para ID ${jobId}` : `Mock job status for ID ${jobId}`
            };
        }
        try {
            const response = await this.client.get(`/applications/${application}/jobs/${jobId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to get job status: ${error.message}`);
        }
    }

    async getDimensions(application: string) {
        if (config.FCCS_MOCK_MODE) {
            if (config.FCCS_LANGUAGE === 'pt') {
                return {
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
                };
            }
            return {
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
            };
        }
        try {
            const response = await this.client.get(`/applications/${application}/dimensions`);
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to get dimensions: ${error.message}`);
        }
    }

    async generateReport(application: string, reportName: string, parameters: any = {}) {
        if (config.FCCS_MOCK_MODE) {
            const isPt = config.FCCS_LANGUAGE === 'pt';
            return {
                reportName: reportName,
                format: 'HTML',
                content: `
          <html>
            <body>
              <h1>${reportName}</h1>
              <p>${isPt ? 'Gerado para' : 'Generated for'} ${application}</p>
              <table border="1">
                <tr><th>${isPt ? 'Conta' : 'Account'}</th><th>${isPt ? 'Valor' : 'Amount'}</th></tr>
                <tr><td>${isPt ? 'Lucro Liquido' : 'Net Income'}</td><td>$1,250,000</td></tr>
                <tr><td>${isPt ? 'Total de Ativos' : 'Total Assets'}</td><td>$5,000,000</td></tr>
                <tr><td>${isPt ? 'Total de Passivos' : 'Total Liabilities'}</td><td>$2,500,000</td></tr>
              </table>
              <p>${isPt ? 'Parametros' : 'Parameters'}: ${JSON.stringify(parameters)}</p>
            </body>
          </html>
        `
            };
        }
        try {
            // This is a hypothetical endpoint for reporting, as FCCS reporting API varies.
            // Often it involves the Reporting Web Studio API or FR API.
            const response = await this.client.post(`/applications/${application}/reports/${reportName}/run`, parameters);
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to generate report: ${error.message}`);
        }
    }

    async simulateTransaction(application: string, type: 'ACQUISITION' | 'DIVESTITURE', entity: string, percentage: number, amount: number) {
        if (config.FCCS_MOCK_MODE) {
            const isPt = config.FCCS_LANGUAGE === 'pt';
            const isAcq = type === 'ACQUISITION';

            const impact = isAcq ? amount * 0.15 : -amount * 0.10; // Mock impact logic
            const goodwill = isAcq ? amount * 0.20 : 0;

            return {
                simulationId: Math.floor(Math.random() * 100000).toString(),
                type: type,
                entity: entity,
                status: isPt ? 'Simulação Concluída' : 'Simulation Completed',
                financialImpact: {
                    revenueImpact: isPt ? `+${(amount * 0.5).toLocaleString()} (Estimado)` : `+${(amount * 0.5).toLocaleString()} (Estimated)`,
                    netIncomeImpact: isPt ? `${impact > 0 ? '+' : ''}${impact.toLocaleString()}` : `${impact > 0 ? '+' : ''}${impact.toLocaleString()}`,
                    goodwill: isPt ? goodwill.toLocaleString() : goodwill.toLocaleString(),
                    minorityInterest: isPt ? `${(100 - percentage)}%` : `${(100 - percentage)}%`
                },
                message: isPt
                    ? `Simulação de ${isAcq ? 'aquisição' : 'venda'} da entidade ${entity} (${percentage}%) processada com sucesso.`
                    : `Simulation of ${isAcq ? 'acquisition' : 'divestiture'} of entity ${entity} (${percentage}%) processed successfully.`
            };
        }
        try {
            // Hypothetical endpoint for Strategic Modeling or Scenario Management
            const response = await this.client.post(`/applications/${application}/simulations`, {
                type,
                entity,
                percentage,
                amount
            });
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to simulate transaction: ${error.message}`);
        }
    }

    // Helper to check connection
    async validateConnection() {
        try {
            await this.getApplications();
            return true;
        } catch (e) {
            return false;
        }
    }
}

export const fccsClient = new FccsClient();
