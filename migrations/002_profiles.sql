USE sakina;

CREATE TABLE profiles (
  user_id BIGINT UNSIGNED NOT NULL,
  display_name VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  dob DATE NOT NULL,
  country VARCHAR(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  city VARCHAR(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  madhhab VARCHAR(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  prayer_level TINYINT DEFAULT NULL,
  marital_status ENUM('single','divorced','widowed') COLLATE utf8mb4_unicode_ci NOT NULL,
  wali_name VARCHAR(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  wali_relation VARCHAR(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  wali_contact_encrypted TEXT COLLATE utf8mb4_unicode_ci,
  bio VARCHAR(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  photo_url VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  location POINT SRID 4326 NOT NULL,
  location_visibility ENUM('hidden','approx_city','exact') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'approx_city',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT profiles_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  SPATIAL INDEX idx_profiles_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
