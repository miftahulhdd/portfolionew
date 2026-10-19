-- Struktur tabel (MySQL/MariaDB). Impor lewat phpMyAdmin > tab Import.
-- Opsional: aplikasi membuat tabel ini otomatis saat pertama kali dijalankan.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `settings` (
  `key` VARCHAR(64) NOT NULL PRIMARY KEY,
  `value` LONGTEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `projects` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(60) NOT NULL DEFAULT 'Web',
  `image_url` VARCHAR(500) NULL,
  `link` VARCHAR(500) NULL,
  `repo` VARCHAR(500) NULL,
  `tags` LONGTEXT NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `timeline` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `role` VARCHAR(255) NOT NULL,
  `organization` VARCHAR(255) NOT NULL,
  `type` ENUM('organisasi','kepanitiaan','lainnya') NOT NULL DEFAULT 'organisasi',
  `period` VARCHAR(100) NOT NULL,
  `start_key` INT NOT NULL DEFAULT 0,
  `description` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reports` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `slug` VARCHAR(191) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `course` VARCHAR(120) NOT NULL,
  `number` INT NULL,
  `summary` TEXT NOT NULL,
  `intro` TEXT NOT NULL,
  `objective` TEXT NOT NULL,
  `conclusion` TEXT NOT NULL,
  `cover_url` VARCHAR(500) NULL,
  `status` ENUM('draft','published') NOT NULL DEFAULT 'draft',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  UNIQUE KEY `reports_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `report_steps` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `report_id` VARCHAR(36) NOT NULL,
  `kind` ENUM('step','exercise') NOT NULL DEFAULT 'step',
  `position` INT NOT NULL DEFAULT 0,
  `title` VARCHAR(255) NOT NULL,
  `body` TEXT NOT NULL,
  `images` LONGTEXT NOT NULL,
  `codes` LONGTEXT NOT NULL,
  KEY `report_steps_report_idx` (`report_id`),
  CONSTRAINT `report_steps_report_fk` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gallery` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `url` VARCHAR(500) NOT NULL,
  `caption` VARCHAR(255) NOT NULL DEFAULT '',
  `width` INT NOT NULL DEFAULT 1200,
  `height` INT NOT NULL DEFAULT 800,
  `created_at` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `messages` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `phone` VARCHAR(40) NULL,
  `subject` VARCHAR(190) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `login_attempts` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `ip` VARCHAR(64) NOT NULL,
  `created_at` DATETIME NOT NULL,
  KEY `login_attempts_time_idx` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `media_files` (
  `name` VARCHAR(120) NOT NULL PRIMARY KEY,
  `data` MEDIUMBLOB NOT NULL,
  `created_at` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
