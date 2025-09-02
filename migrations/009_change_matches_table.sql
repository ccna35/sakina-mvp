USE sakina;

START TRANSACTION;

-- 1) Drop old uniqueness keys that block history
--    (We’ll replace them with an "open-only" unique key)
ALTER TABLE matches
  DROP INDEX `uniq_pair`,
  DROP INDEX `uq_pair`;

-- 2) Make sure initiated_by is set and NOT NULL (needed for the initiator constraint)
UPDATE matches SET initiated_by = user_a WHERE initiated_by IS NULL;

ALTER TABLE matches
  MODIFY COLUMN initiated_by BIGINT UNSIGNED NOT NULL;

-- 3) Lifecycle columns for your flow
ALTER TABLE matches
  MODIFY COLUMN status ENUM('pending','active','declined','ended','blocked')
    COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  ADD COLUMN approved_at DATETIME NULL AFTER status,
  ADD COLUMN ended_at DATETIME NULL AFTER approved_at,
  ADD COLUMN ended_by BIGINT UNSIGNED NULL AFTER ended_at,
  ADD COLUMN chat_session_id BIGINT UNSIGNED NULL AFTER ended_by,

  -- "Open" flag (rows stay in history when closed)
  ADD COLUMN is_open TINYINT(1) NOT NULL DEFAULT 1 AFTER chat_session_id,

  -- Generated flag: an initiator is considered to have an "open" invite if the row is open AND pending/active
  ADD COLUMN initiator_open TINYINT(1)
    AS (IF(is_open = 1 AND status IN ('pending','active'), 1, 0)) STORED
    AFTER is_open;

-- 4) Constraints and indexes
ALTER TABLE matches
  -- Only one open relation per pair, but allow multiple historical rows
  ADD UNIQUE KEY `uq_open_pair` (pair_left, pair_right, is_open),

  -- Only one open invite per initiator (your requirement)
  ADD UNIQUE KEY `uq_initiator_single_open` (initiated_by, initiator_open),

  -- FKs for ender and chat session
  ADD CONSTRAINT `fk_matches_ended_by` FOREIGN KEY (ended_by) REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_matches_chat_session` FOREIGN KEY (chat_session_id) REFERENCES chat_sessions(id) ON DELETE SET NULL,

  -- Helpful index
  ADD KEY `ix_chat_session` (chat_session_id);

COMMIT;
