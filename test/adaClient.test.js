import { describe, it, expect, afterAll } from 'vitest';
import nock from 'nock';
import { env } from '../src/config/env.js';
import { adaClient } from '../src/lib/adaClient.js';
describe('adaClient', () => {
    const scope = nock(env.BMP_API_BASE_URL)
        .post('/usermgt/message')
        .reply(200, { status: 'ok', messageId: '123' })
        .persist();
    afterAll(() => {
        scope.persist(false);
        nock.cleanAll();
    });
    it('sends text', async () => {
        const res = await adaClient.sendText({ to: '628116823073', text: 'hello' });
        expect(res.status).toBe('ok');
    });
});
//# sourceMappingURL=adaClient.test.js.map