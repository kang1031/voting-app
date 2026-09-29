// 아직 적용하지 않은 db/migrations/*.sql 파일을 번호 순서대로 적용한다(ADR-0002).
// 사용법: npm run db:migrate  (DATABASE_URL은 .env.local 또는 환경변수에서 읽는다)
import { readdir, readFile } from "node:fs/promises";
import { Pool } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL이 설정되지 않았습니다.");
  process.exit(1);
}

const dir = new URL("./migrations/", import.meta.url);
const pool = new Pool({ connectionString: url });
const client = await pool.connect();

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
  const { rows } = await client.query("SELECT name FROM schema_migrations");
  const applied = new Set(rows.map((r) => r.name));

  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  const pending = files.filter((f) => !applied.has(f));
  if (pending.length === 0) console.log("적용할 마이그레이션이 없습니다.");

  for (const file of pending) {
    const text = await readFile(new URL(file, dir), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(text);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`적용: ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw new Error(`${file} 적용 실패: ${err.message}`, { cause: err });
    }
  }
} finally {
  client.release();
  await pool.end();
}
