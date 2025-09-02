USE sakina;

ALTER TABLE matches
  DROP COLUMN a_liked,
  DROP COLUMN a_liked_at,
  DROP COLUMN b_liked,
  DROP COLUMN b_liked_at,
  DROP COLUMN matched_at,
  DROP COLUMN is_active;
