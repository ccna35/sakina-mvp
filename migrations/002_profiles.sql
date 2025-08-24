USE sakina;
CREATE TABLE IF NOT EXISTS profiles (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  dob DATE NOT NULL,
  country VARCHAR(80), city VARCHAR(80),
  madhhab VARCHAR(40), prayer_level TINYINT,
  marital_status ENUM('single','divorced','widowed') NOT NULL,
  wali_name VARCHAR(120), wali_relation VARCHAR(60),
  wali_contact_encrypted TEXT,
  bio VARCHAR(500),
  photo_url VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
