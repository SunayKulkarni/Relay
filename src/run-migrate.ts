import {migrate} from "./migrate.js";
import { pool } from "./db.js";

await migrate();
await pool.end();