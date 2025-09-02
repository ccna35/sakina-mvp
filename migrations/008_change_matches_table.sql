USE sakina;

-- 2. Adjust matches table
ALTER TABLE matches
  -- normalize pairs to enforce order-independence
  ADD COLUMN pair_left BIGINT UNSIGNED AS (LEAST(user_a, user_b)) STORED AFTER user_b,
  ADD COLUMN pair_right BIGINT UNSIGNED AS (GREATEST(user_a, user_b)) STORED AFTER pair_left,

  -- track who initiated
  ADD COLUMN initiated_by BIGINT UNSIGNED NULL AFTER pair_right,

  -- per-side decisions
  ADD COLUMN a_liked TINYINT(1) NOT NULL DEFAULT 0 AFTER initiated_by,
  ADD COLUMN a_liked_at DATETIME NULL AFTER a_liked,
  ADD COLUMN b_liked TINYINT(1) NOT NULL DEFAULT 0 AFTER a_liked_at,
  ADD COLUMN b_liked_at DATETIME NULL AFTER b_liked,

  -- status and timestamps
  ADD COLUMN status ENUM('pending','matched','rejected','blocked') NOT NULL DEFAULT 'pending' AFTER b_liked_at,
  ADD COLUMN matched_at DATETIME NULL AFTER status,

  -- housekeeping
  MODIFY COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at,

  -- constraints
  ADD CONSTRAINT chk_not_self CHECK (user_a <> user_b),
  ADD UNIQUE KEY uq_pair (pair_left, pair_right),
  ADD KEY ix_status (status),
  ADD KEY ix_initiated_by (initiated_by),
  ADD KEY ix_updated_at (updated_at),
  ADD CONSTRAINT fk_matches_initiated_by FOREIGN KEY (initiated_by) REFERENCES users(id) ON DELETE CASCADE;
