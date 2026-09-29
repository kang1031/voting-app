import type { VoteRejection } from "@/lib/poll-rules";

export type VoteNotice = VoteRejection;

const MESSAGES: Record<VoteNotice, string> = {
  closed: "마감된 투표입니다.",
  "already-voted": "이미 투표했습니다.",
  "unknown-option": "선택지를 다시 골라 주세요.",
};

export function voteNoticeMessage(value: unknown): string | null {
  return typeof value === "string" && value in MESSAGES ? MESSAGES[value as VoteNotice] : null;
}
