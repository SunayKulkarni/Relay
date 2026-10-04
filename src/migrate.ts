import { readdir, readFile } from "node:fs/promises";
import { pool } from "./db.js";

export async function migrate() {
  // 1. the "notebook" table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  // 2. list migration files in order
  const files = (await readdir("migrations")).filter(file => file.endsWith(".sql")).sort();

  for (const file of files) {
    // 3. skip if already applied
    const done = await pool.query("SELECT 1 FROM schema_migrations WHERE name = $1", [file]);
    if (done.rowCount) continue;

    // 4. run the file and record it, together in one transaction
    const sql = await readFile(`migrations/${file}`, "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`applied ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}