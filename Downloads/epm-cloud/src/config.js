"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var zod_1 = require("zod");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var configSchema = zod_1.z.object({
    FCCS_URL: zod_1.z.string().url().optional(),
    FCCS_USERNAME: zod_1.z.string().min(1).optional(),
    FCCS_PASSWORD: zod_1.z.string().min(1).optional(),
    FCCS_DOMAIN: zod_1.z.string().optional(),
    FCCS_API_VERSION: zod_1.z.string().default('v3'),
    FCCS_MOCK_MODE: zod_1.z.string().optional(),
    FCCS_LANGUAGE: zod_1.z.enum(['en', 'pt']).default('en'),
}).superRefine(function (data, ctx) {
    var isMock = data.FCCS_MOCK_MODE === 'true';
    if (!isMock) {
        if (!data.FCCS_URL) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "FCCS_URL is required when not in mock mode",
                path: ["FCCS_URL"]
            });
        }
        if (!data.FCCS_USERNAME) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "FCCS_USERNAME is required when not in mock mode",
                path: ["FCCS_USERNAME"]
            });
        }
        if (!data.FCCS_PASSWORD) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "FCCS_PASSWORD is required when not in mock mode",
                path: ["FCCS_PASSWORD"]
            });
        }
    }
}).transform(function (data) { return (__assign(__assign({}, data), { FCCS_MOCK_MODE: data.FCCS_MOCK_MODE === 'true', FCCS_URL: data.FCCS_URL || 'http://mock.local', FCCS_USERNAME: data.FCCS_USERNAME || 'mock', FCCS_PASSWORD: data.FCCS_PASSWORD || 'mock' })); });
var config;
try {
    config = configSchema.parse(process.env);
}
catch (error) {
    if (error instanceof zod_1.z.ZodError) {
        console.error('❌ Invalid configuration:', error.issues);
        process.exit(1);
    }
    throw error;
}
exports.default = config;
