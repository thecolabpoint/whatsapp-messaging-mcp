import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import nock from 'nock';
import { env } from '../src/config/env.js';
import { adaClient } from '../src/lib/adaClient.js';

describe('adaClient', () => {
  const scope = nock(env.BMP_API_BASE_URL)
    .post('/message')
    .reply(200, { status: 'ok', messageId: '123' })
    .persist();

  afterAll(() => {
    scope.persist(false);
    nock.cleanAll();
  });

  it('sends text', async () => {
    const res = await adaClient.sendText({
      to: '628116823073',
      text: 'hello',
      from: '6287854171391',
      accessToken: 'TEST_TOKEN',
    });
    expect(res.status).toBe('ok');
  });
});


