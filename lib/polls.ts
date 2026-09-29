import "server-only";
import { db } from "./db";
import type { PollInput } from "./poll-rules";

// 투표·선택지·표 데이터 접근. 규칙 판단은 poll-rules.ts가 하고, 여기서는 읽고 쓰기만 한다.

export type PollSummary = { id: string; question: string; deadline: Date | null; createdAt: Date };
export type PollOption = { id: string; label: string };
export type Poll = PollSummary & { options: PollOption[] };

type PollRow = { id: string; question: string; deadline: Date | null; created_at: Date };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toSummary(row: PollRow): PollSummary {
  return { id: row.id, question: row.question, deadline: row.deadline, createdAt: row.created_at };
}

export async function createPoll(input: PollInput): Promise<string> {
  const sql = db();
  const id = crypto.randomUUID();
  await sql.transaction([
    sql`INSERT INTO polls (id, question, deadline) VALUES (${id}, ${input.question}, ${input.deadline})`,
    ...input.options.map(
      (label, position) =>
        sql`INSERT INTO options (poll_id, position, label) VALUES (${id}, ${position}, ${label})`,
    ),
  ]);
  return id;
}

/** 최신순 */
export async function listPolls(): Promise<PollSummary[]> {
  const rows = (await db()`
    SELECT id, question, deadline, created_at FROM polls ORDER BY created_at DESC
  `) as PollRow[];
  return rows.map(toSummary);
}

export async function getPoll(id: string): Promise<Poll | null> {
  if (!UUID.test(id)) return null;
  const sql = db();
  const [polls, options] = (await sql.transaction([
    sql`SELECT id, question, deadline, created_at FROM polls WHERE id = ${id}`,
    sql`SELECT id, label FROM options WHERE poll_id = ${id} ORDER BY position`,
  ])) as [PollRow[], PollOption[]];
  const row = polls[0];
  return row ? { ...toSummary(row), options } : null;
}
