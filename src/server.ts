import Fastify from 'fastify';
import { requireTenant } from './auth.js';

const app = Fastify({logger: true});

app.get('/health', async () => {
    return {status: 'ok'};
});

app.get("/v1/whoami", { preHandler: requireTenant }, async (req) => {
  return req.tenant;
});

await app.listen({port: 3000, host: '0.0.0.0'});