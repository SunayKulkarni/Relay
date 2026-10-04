import {randomBytes, createHash} from "node:crypto";

import {pool} from "./db";

import {migrate} from "./migrate";

await migrate();

const apiKey = "sk_live_" + randomBytes(24).toString("hex");
const hash = createHash("sha256").update(apiKey).digest("hex");

await pool.query(
    "INSERT INTO tenants (name, api_key_hash) VALUES ($1, $2)",
    ["Demo",hash]
);

console.log("Your API key is: " + apiKey);
await pool.end();

