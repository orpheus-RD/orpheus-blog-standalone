-- Add backgrounds table for homepage background images
CREATE TABLE IF NOT EXISTS `backgrounds` (
  `id` int AUTO_INCREMENT NOT NULL,
  `title` varchar(255),
  `imageUrl` text NOT NULL,
  `imageKey` varchar(500),
  `active` boolean DEFAULT true,
  `sortOrder` int DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `backgrounds_id` PRIMARY KEY(`id`)
);
