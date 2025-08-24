USE sakina;
CREATE TABLE IF NOT EXISTS wali_requests (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  match_id BIGINT UNSIGNED NOT NULL,
  requester_male_id BIGINT UNSIGNED NOT NULL,
  target_female_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  moderator_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  decided_at TIMESTAMP NULL,
  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (requester_male_id) REFERENCES users(id),
  FOREIGN KEY (target_female_id) REFERENCES users(id),
  FOREIGN KEY (moderator_id) REFERENCES users(id)
) ENGINE=InnoDB;
