import { createHash } from "node:crypto";
import type { FastifyRequest, FastifyReply } from "fastify";
import { pool } from "./db.js";

declare module "fastify" {
  interface FastifyRequest {
    tenant?: { id: string; name: string };
  }
}

export async function requireTenant(req: FastifyRequest, reply: FastifyReply) {
  const header = req.headers.authorization ?? "";
  const key = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!key) return reply.code(401).send({ error: "missing api key" });

  const hash = createHash("sha256").update(key).digest("hex");
  const result = await pool.query(
    "SELECT id, name FROM tenants WHERE api_key_hash = $1",
    [hash]
  );
  if (!result.rowCount) return reply.code(401).send({ error: "invalid api key" });

  req.tenant = result.rows[0];
}