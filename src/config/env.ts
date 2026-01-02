import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  BMP_API_BASE_URL: z.string().url(),
  BMP_ACCESS_TOKEN: z.string().min(1, 'BMP_ACCESS_TOKEN is required'),
  BMP_SENDER_MSISDN: z.string().min(5, 'BMP_SENDER_MSISDN is required'),
  BMP_PLATFORM: z.string().min(1, 'BMP_PLATFORM is required'),
  BMP_CHANNEL: z.string().min(1, 'BMP_CHANNEL is required').optional(),
  REQUEST_TIMEOUT_MS: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 15000))
    .pipe(z.number().int().positive()),
  RETRY_MAX_ATTEMPTS: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 3))
    .pipe(z.number().int().min(0)),
  LOG_LEVEL: z.string().optional(),
  PORT: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 3000))
    .pipe(z.number().int().positive()),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
