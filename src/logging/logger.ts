import pino from 'pino';

const level = process.env.LOG_LEVEL || 'info';
const usePretty = process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1';

export const logger = pino({
  level,
  redact: {
    paths: ['headers.authorization', 'authorization', 'config.headers.Authorization'],
    remove: true,
  },
  transport: usePretty ? { target: 'pino-pretty' } : undefined,
});

export function maskRecipient(recipient: string): string {
  if (!recipient) return recipient;
  const trimmed = recipient.toString();
  if (trimmed.length <= 4) return '****';
  return `${'*'.repeat(Math.max(0, trimmed.length - 4))}${trimmed.slice(-4)}`;
}
