import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
    FCCS_URL: z.string().url().optional(),
    FCCS_USERNAME: z.string().min(1).optional(),
    FCCS_PASSWORD: z.string().min(1).optional(),
    FCCS_DOMAIN: z.string().optional(),
    FCCS_API_VERSION: z.string().default('v3'),
    FCCS_MOCK_MODE: z.string().optional(),
    FCCS_LANGUAGE: z.enum(['en', 'pt']).default('en'),
    FCCS_READ_ONLY: z.string().optional().default('false'),
}).superRefine((data, ctx) => {
    const isMock = data.FCCS_MOCK_MODE === 'true';
    if (!isMock) {
        if (!data.FCCS_URL) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "FCCS_URL is required when not in mock mode",
                path: ["FCCS_URL"]
            });
        }
        if (!data.FCCS_USERNAME) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "FCCS_USERNAME is required when not in mock mode",
                path: ["FCCS_USERNAME"]
            });
        }
        if (!data.FCCS_PASSWORD) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "FCCS_PASSWORD is required when not in mock mode",
                path: ["FCCS_PASSWORD"]
            });
        }
    }
}).transform((data) => ({
    ...data,
    FCCS_MOCK_MODE: data.FCCS_MOCK_MODE === 'true',
    FCCS_URL: data.FCCS_URL || 'http://mock.local',
    FCCS_USERNAME: data.FCCS_USERNAME || 'mock',
    FCCS_PASSWORD: data.FCCS_PASSWORD || 'mock',
    FCCS_READ_ONLY: data.FCCS_READ_ONLY === 'true',
}));

export type Config = z.infer<typeof configSchema>;

let config: Config;

try {
    config = configSchema.parse(process.env);
} catch (error) {
    if (error instanceof z.ZodError) {
        console.error('❌ Invalid configuration:', error.issues);
        process.exit(1);
    }
    throw error;
}

export default config;
