-- Run after the migrations. Assumes `USE sakina;` has already been done by migration 001.
USE sakina;

-- Users (password = password123 for all three)
INSERT INTO users (email, password_hash, role, gender, is_verified) VALUES
('fatimah@example.com', '$2b$12$WICCNcgH0z4RboaQ/DXdkuHZ0zS2rwc/1Xlg5/zahBEOhfZiUocnO', 'user', 'female', 1),
('ahmed@example.com',   '$2b$12$L105H08TN80rH4ywqgBbpeetruDBFtOLOPGCd15nbuS0rrbZD7D5.', 'user', 'male',   1),
('mod@example.com',     '$2b$12$8O7HNa6CysaZE1KQZJdNDeKbF.kQ1lOrxG7iboU2CsB1xi0P30.aC', 'moderator', 'male', 1);

-- Profiles
INSERT INTO profiles (user_id, display_name, dob, country, city, madhhab, prayer_level, marital_status, wali_name, wali_relation, wali_contact_encrypted, bio, photo_url)
VALUES
-- Fatimah (female) with wali contact filled later via app (encrypted). For seed, leave NULL.
((SELECT id FROM users WHERE email='fatimah@example.com'), 'Fatimah', '1998-06-14', 'Egypt', 'Cairo', 'Hanafi', 4, 'single', NULL, NULL, NULL, 'Seeking marriage upon Sunnah.', NULL),
-- Ahmed (male)
((SELECT id FROM users WHERE email='ahmed@example.com'), 'Ahmed', '1995-01-22', 'Egypt', 'Giza', 'Shafi\'i', 4, 'single', NULL, NULL, NULL, 'Serious about nikah.', NULL),
-- Moderator (profile optional)
((SELECT id FROM users WHERE email='mod@example.com'), 'Moderator Ali', '1990-01-01', 'Egypt', 'Cairo', NULL, NULL, 'single', NULL, NULL, NULL, NULL, NULL);

-- Likes to create a mutual match between Ahmed and Fatimah
INSERT INTO likes (liker_id, liked_id)
VALUES
((SELECT id FROM users WHERE email='ahmed@example.com'),   (SELECT id FROM users WHERE email='fatimah@example.com')),
((SELECT id FROM users WHERE email='fatimah@example.com'), (SELECT id FROM users WHERE email='ahmed@example.com'))
ON DUPLICATE KEY UPDATE liked_id=VALUES(liked_id);

-- Create a match record (ensure order via LEAST/GREATEST)
INSERT IGNORE INTO matches (user_a, user_b)
SELECT LEAST(u1.id, u2.id), GREATEST(u1.id, u2.id)
FROM (SELECT id FROM users WHERE email='ahmed@example.com') u1,
     (SELECT id FROM users WHERE email='fatimah@example.com') u2;

-- Open a chat session for 72h starting now
INSERT INTO chat_sessions (match_id, opens_at, closes_at, daily_msg_limit)
SELECT m.id, NOW(), DATE_ADD(NOW(), INTERVAL 72 HOUR), 20
FROM matches m
JOIN users a ON a.id = m.user_a
JOIN users b ON b.id = m.user_b
WHERE (a.id = (SELECT id FROM users WHERE email='ahmed@example.com') AND b.id = (SELECT id FROM users WHERE email='fatimah@example.com'))
   OR (b.id = (SELECT id FROM users WHERE email='ahmed@example.com') AND a.id = (SELECT id FROM users WHERE email='fatimah@example.com'));

-- Sample messages
INSERT INTO messages (chat_id, sender_id, body)
SELECT cs.id, (SELECT id FROM users WHERE email='ahmed@example.com'), 'Assalamu alaikum. I hope you are well.'
FROM chat_sessions cs
JOIN matches m ON m.id = cs.match_id
LIMIT 1;

INSERT INTO messages (chat_id, sender_id, body)
SELECT cs.id, (SELECT id FROM users WHERE email='fatimah@example.com'), 'Wa alaikum assalam. Alhamdulillah, I am well. JazakAllahu khairan.'
FROM chat_sessions cs
JOIN matches m ON m.id = cs.match_id
LIMIT 1;

-- Tip: Set AES_SECRET_BASE64 in your .env to something like:
-- AES_SECRET_BASE64=T8WJ1/3EoP5IATZ2e4p6QuclS3FX1oTkGan9Jrc+XBM=
