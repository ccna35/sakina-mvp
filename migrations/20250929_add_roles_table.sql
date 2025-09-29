-- 20250929_add_roles_table.sql

USE `sakina`;

-- Create roles table
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default roles
INSERT INTO `roles` (`name`, `description`) VALUES
('user', 'Regular user'),
('moderator', 'Moderator with limited permissions'),
('admin', 'Administrator with full access');

-- Alter users table: remove ENUM and add role_id as FK
ALTER TABLE `users`
  DROP COLUMN `role`,
  ADD COLUMN `role_id` bigint unsigned NOT NULL DEFAULT 1 AFTER `password_hash`,
  ADD CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`);
