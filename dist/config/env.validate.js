"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = void 0;
const env_schema_1 = require("./env.schema");
const validateEnv = () => {
    const parsed = env_schema_1.envSchema.safeParse(process.env);
    if (!parsed.success) {
        console.error('❌ Invalid environment variables:\n');
        const errors = parsed.error.flatten().fieldErrors;
        Object.entries(errors).forEach(([key, messages]) => {
            console.error(`  ${key}: ${messages?.join(', ')}`);
        });
        console.error('\n🛑 Fix the above variables in your .env file.');
        process.exit(1);
    }
    return parsed.data;
};
exports.validateEnv = validateEnv;
