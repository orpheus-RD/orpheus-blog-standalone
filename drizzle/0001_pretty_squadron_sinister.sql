CREATE TABLE `essays` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` varchar(500),
	`excerpt` text,
	`content` text NOT NULL,
	`coverImageUrl` text,
	`coverImageKey` varchar(500),
	`category` varchar(100),
	`tags` text,
	`readTime` int,
	`featured` boolean DEFAULT false,
	`published` boolean DEFAULT false,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `essays_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `papers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`authors` text NOT NULL,
	`abstract` text,
	`journal` varchar(255),
	`year` int,
	`volume` varchar(50),
	`issue` varchar(50),
	`pages` varchar(50),
	`doi` varchar(255),
	`pdfUrl` text,
	`pdfKey` varchar(500),
	`category` varchar(100),
	`tags` text,
	`citations` int DEFAULT 0,
	`featured` boolean DEFAULT false,
	`published` boolean DEFAULT false,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `papers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`location` varchar(255),
	`camera` varchar(100),
	`lens` varchar(100),
	`settings` varchar(100),
	`imageUrl` text NOT NULL,
	`imageKey` varchar(500),
	`category` varchar(100),
	`tags` text,
	`featured` boolean DEFAULT false,
	`sortOrder` int DEFAULT 0,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_settings_key_unique` UNIQUE(`key`)
);
