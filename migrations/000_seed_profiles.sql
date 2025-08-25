-- Run after the migrations. Assumes `USE sakina;` has already been done by migration 001.
USE sakina;

-- Profiles (with location for each)
INSERT INTO profiles (
  user_id, display_name, dob, country, city, madhhab, prayer_level, marital_status,
  wali_name, wali_relation, wali_contact_encrypted, bio, photo_url, location
)
VALUES
-- Fatimah (female) – Cairo
((SELECT id FROM users WHERE email='fatimah@example.com'),
  'Fatimah', '1998-06-14', 'Egypt', 'Cairo', 'Hanafi', 4, 'single',
  NULL, NULL, NULL, 'Seeking marriage upon Sunnah.', NULL,
  ST_SRID(POINT(31.2357, 30.0444), 4326)
),

-- Ahmed (male) – Giza
((SELECT id FROM users WHERE email='ahmed@example.com'),
  'Ahmed', '1995-01-22', 'Egypt', 'Giza', 'Shafi\'i', 4, 'single',
  NULL, NULL, NULL, 'Serious about nikah.', NULL,
  ST_SRID(POINT(31.2089, 30.0131), 4326)
),

-- Moderator Ali – Cairo (same coordinates as Fatimah for simplicity)
((SELECT id FROM users WHERE email='mod@example.com'),
  'Moderator Ali', '1990-01-01', 'Egypt', 'Cairo', NULL, NULL, 'single',
  NULL, NULL, NULL, NULL, NULL,
  ST_SRID(POINT(31.2357, 30.0444), 4326)
);
