-- 투표, 선택지, 표. 용어는 CONTEXT.md, 투표자 식별은 ADR-0001 참고.

CREATE TABLE polls (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question   text NOT NULL CHECK (char_length(question) BETWEEN 1 AND 200),
  deadline   timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE options (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id  uuid NOT NULL REFERENCES polls (id) ON DELETE CASCADE,
  position integer NOT NULL,
  label    text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 100),
  UNIQUE (poll_id, position),
  UNIQUE (poll_id, label),
  -- votes가 (poll_id, option_id)로 참조해 선택지가 그 투표의 것임을 보장한다.
  UNIQUE (poll_id, id)
);

CREATE TABLE votes (
  poll_id    uuid NOT NULL REFERENCES polls (id) ON DELETE CASCADE,
  option_id  uuid NOT NULL,
  voter_id   uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- 투표자는 한 투표에 최대 한 표.
  PRIMARY KEY (poll_id, voter_id),
  FOREIGN KEY (poll_id, option_id) REFERENCES options (poll_id, id) ON DELETE CASCADE
);
