USE sakina;
CREATE TABLE IF NOT EXISTS moderation_flags (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  message_id BIGINT UNSIGNED,
  reporter_id BIGINT UNSIGNED,
  reason VARCHAR(255),
  status ENUM('open','reviewed','actioned') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id),
  FOREIGN KEY (reporter_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  actor_id BIGINT UNSIGNED,
  action VARCHAR(64),
  entity VARCHAR(64),
  entity_id BIGINT UNSIGNED,
  meta JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (actor_id, action, created_at)
) ENGINE=InnoDB;
