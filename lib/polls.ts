import "server-only";
import { db } from "./db";
import type { OptionCount, PollInput } from "./poll-rules";

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

/** 이 투표자가 이 투표에서 고른 선택지. 아직 표를 던지지 않았으면 null. */
export async function getVoterOptionId(pollId: string, voterId: string): Promise<string | null> {
  const rows = (await db()`
    SELECT option_id FROM votes WHERE poll_id = ${pollId} AND voter_id = ${voterId}
  `) as { option_id: string }[];
  return rows[0]?.option_id ?? null;
}

/** 선택지 순서대로 표 수 */
export async function getOptionCounts(pollId: string): Promise<OptionCount[]> {
  const rows = (await db()`
    SELECT o.id, o.label, count(v.voter_id)::int AS count
    FROM options o LEFT JOIN votes v ON v.option_id = o.id
    WHERE o.poll_id = ${pollId}
    GROUP BY o.id, o.label, o.position
    ORDER BY o.position
  `) as OptionCount[];
  return rows;
}

export type CastVoteOutcome = "saved" | "already-voted" | "poll-gone";

/** 표 저장. 동시에 들어온 두 번째 표는 DB 유일 제약이 막는다. */
export async function castVote(pollId: string, optionId: string, voterId: string): Promise<CastVoteOutcome> {
  try {
    await db()`
      INSERT INTO votes (poll_id, option_id, voter_id) VALUES (${pollId}, ${optionId}, ${voterId})
    `;
    return "saved";
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "23505") return "already-voted"; // unique_violation
    if (code === "23503") return "poll-gone"; // foreign_key_violation: 그 사이 삭제됨
    throw error;
  }
}

/** 모든 투표의 선택지별 표 수(운영자 화면용). 투표 ID → 선택지 순서대로의 표 수 */
export async function getAllOptionCounts(): Promise<Map<string, OptionCount[]>> {
  const rows = (await db()`
    SELECT o.poll_id, o.id, o.label, count(v.voter_id)::int AS count
    FROM options o LEFT JOIN votes v ON v.option_id = o.id
    GROUP BY o.poll_id, o.id, o.label, o.position
    ORDER BY o.poll_id, o.position
  `) as (OptionCount & { poll_id: string })[];
  const byPoll = new Map<string, OptionCount[]>();
  for (const { poll_id, ...count } of rows) {
    byPoll.set(poll_id, [...(byPoll.get(poll_id) ?? []), count]);
  }
  return byPoll;
}

export async function setDeadline(pollId: string, deadline: Date): Promise<void> {
  await db()`UPDATE polls SET deadline = ${deadline} WHERE id = ${pollId}`;
}

/** 선택지와 표도 함께 지워진다(ON DELETE CASCADE). */
export async function deletePoll(pollId: string): Promise<void> {
  await db()`DELETE FROM polls WHERE id = ${pollId}`;
}
