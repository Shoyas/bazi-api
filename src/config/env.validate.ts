import { envSchema, Env } from './env.schema';

export const validateEnv = (): Env => {
  const parsed = envSchema.safeParse(process.env);

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
