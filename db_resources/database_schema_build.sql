SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';


-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `users` ;

CREATE  TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `username` VARCHAR(50) NOT NULL ,
  `password` VARCHAR(50) NOT NULL ,
  `role` VARCHAR(30) NOT NULL DEFAULT 'STUDENT' COMMENT 'Role can be among the following:\nSTUDENT\nTEACHER\nADMIN\nEXTERNAL' ,
  `created` DATETIME NULL ,
  `modified` DATETIME NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;

CREATE UNIQUE INDEX `username_UNIQUE` ON `users` (`username` ASC) ;


-- -----------------------------------------------------
-- Table `profiles`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `profiles` ;

CREATE  TABLE IF NOT EXISTS `profiles` (
  `user_id` INT UNSIGNED NOT NULL ,
  `created` DATETIME NULL COMMENT '\n' ,
  `modified` DATETIME NULL ,
  PRIMARY KEY (`user_id`) ,
  CONSTRAINT `profiles_users_fk`
    FOREIGN KEY (`user_id` )
    REFERENCES `users` (`id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `projects`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `projects` ;

CREATE  TABLE IF NOT EXISTS `projects` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(50) NOT NULL ,
  `description` TEXT NULL ,
  `created` DATETIME NULL ,
  `modified` DATETIME NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;

CREATE UNIQUE INDEX `name_UNIQUE` ON `projects` (`name` ASC) ;


-- -----------------------------------------------------
-- Table `teams`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `teams` ;

CREATE  TABLE IF NOT EXISTS `teams` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(50) NULL ,
  `project_id` INT UNSIGNED NOT NULL ,
  `created` DATETIME NULL ,
  `modified` DATETIME NULL ,
  PRIMARY KEY (`id`) ,
  CONSTRAINT `fk_teams_projects1`
    FOREIGN KEY (`project_id` )
    REFERENCES `projects` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_teams_projects1_idx` ON `teams` (`project_id` ASC) ;


-- -----------------------------------------------------
-- Table `teams_users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `teams_users` ;

CREATE  TABLE IF NOT EXISTS `teams_users` (
  `team_id` INT UNSIGNED NOT NULL ,
  `user_id` INT UNSIGNED NOT NULL ,
  `team_leader` TINYINT(1) NULL DEFAULT false ,
  PRIMARY KEY (`team_id`, `user_id`) ,
  CONSTRAINT `fk_teams_has_users_teams1`
    FOREIGN KEY (`team_id` )
    REFERENCES `teams` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_teams_has_users_users1`
    FOREIGN KEY (`user_id` )
    REFERENCES `users` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_teams_has_users_users1_idx` ON `teams_users` (`user_id` ASC) ;

CREATE INDEX `fk_teams_has_users_teams1_idx` ON `teams_users` (`team_id` ASC) ;


-- -----------------------------------------------------
-- Table `media`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `media` ;

CREATE  TABLE IF NOT EXISTS `media` (
  `id` CHAR(36) NOT NULL ,
  `filename` TEXT NULL ,
  `content-type` VARCHAR(45) NULL ,
  `content-size` INT NULL ,
  `meta` TEXT NULL ,
  `has_thumb` TINYINT(1) NULL DEFAULT false ,
  `status` VARCHAR(45) NOT NULL DEFAULT 'DRAFT' COMMENT 'Status can be among:\nDRAFT\nUPLOADING\nAVAILABLE\nERROR' ,
  `visibility_level` VARCHAR(50) NOT NULL DEFAULT 'PRIVATE' COMMENT 'Visibility_level can be among:\nPRIVATE\nSUPERVISOR\nTEAM\nPUBLIC' ,
  `user_id` INT UNSIGNED NOT NULL ,
  `created` DATETIME NULL ,
  `modified` DATETIME NULL ,
  PRIMARY KEY (`id`) ,
  CONSTRAINT `fk_media_users1`
    FOREIGN KEY (`user_id` )
    REFERENCES `users` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_media_users1_idx` ON `media` (`user_id` ASC) ;


-- -----------------------------------------------------
-- Table `activity_logs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `activity_logs` ;

CREATE  TABLE IF NOT EXISTS `activity_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `title` TEXT NOT NULL ,
  `content` TEXT NULL ,
  `visibility_level` VARCHAR(50) NOT NULL DEFAULT 'PRIVATE' COMMENT 'Visibility_level can be among:\nPRIVATE\nSUPERVISOR\nTEAM\nPUBLIC' ,
  `question` TINYINT(1) NULL DEFAULT false ,
  `draft` TINYINT(1) NULL DEFAULT true ,
  `user_id` INT UNSIGNED NOT NULL ,
  `created` DATETIME NULL ,
  `modified` DATETIME NULL ,
  PRIMARY KEY (`id`) ,
  CONSTRAINT `fk_ativity_logs_users1`
    FOREIGN KEY (`user_id` )
    REFERENCES `users` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_ativity_logs_users1_idx` ON `activity_logs` (`user_id` ASC) ;


-- -----------------------------------------------------
-- Table `comments`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `comments` ;

CREATE  TABLE IF NOT EXISTS `comments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `title` TEXT NULL ,
  `content` TEXT NOT NULL ,
  `visibility_level` VARCHAR(50) NOT NULL DEFAULT 'PRIVATE' COMMENT 'Visibility_level can be among:\nPRIVATE\nSUPERVISOR\nTEAM\nPUBLIC' ,
  `user_id` INT UNSIGNED NOT NULL ,
  `created` DATETIME NULL ,
  `modified` DATETIME NULL ,
  PRIMARY KEY (`id`) ,
  CONSTRAINT `fk_comment_users1`
    FOREIGN KEY (`user_id` )
    REFERENCES `users` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_comment_users1_idx` ON `comments` (`user_id` ASC) ;


-- -----------------------------------------------------
-- Table `activity_logs_comments`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `activity_logs_comments` ;

CREATE  TABLE IF NOT EXISTS `activity_logs_comments` (
  `activity_log_id` INT UNSIGNED NOT NULL ,
  `comment_id` INT UNSIGNED NOT NULL ,
  PRIMARY KEY (`activity_log_id`, `comment_id`) ,
  CONSTRAINT `fk_ativity_logs_has_comment_ativity_logs1`
    FOREIGN KEY (`activity_log_id` )
    REFERENCES `activity_logs` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ativity_logs_has_comment_comment1`
    FOREIGN KEY (`comment_id` )
    REFERENCES `comments` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_ativity_logs_has_comment_comment1_idx` ON `activity_logs_comments` (`comment_id` ASC) ;

CREATE INDEX `fk_ativity_logs_has_comment_ativity_logs1_idx` ON `activity_logs_comments` (`activity_log_id` ASC) ;


-- -----------------------------------------------------
-- Table `messages`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `messages` ;

CREATE  TABLE IF NOT EXISTS `messages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `title` TEXT NOT NULL ,
  `content` TEXT NULL ,
  `answers_to` INT UNSIGNED NOT NULL ,
  `author` INT UNSIGNED NOT NULL ,
  `created` DATETIME NULL ,
  `modified` DATETIME NULL ,
  PRIMARY KEY (`id`) ,
  CONSTRAINT `fk_messages_messages1`
    FOREIGN KEY (`answers_to` )
    REFERENCES `messages` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_messages_users1`
    FOREIGN KEY (`author` )
    REFERENCES `users` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_messages_messages1_idx` ON `messages` (`answers_to` ASC) ;

CREATE INDEX `fk_messages_users1_idx` ON `messages` (`author` ASC) ;


-- -----------------------------------------------------
-- Table `messages_recipients`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `messages_recipients` ;

CREATE  TABLE IF NOT EXISTS `messages_recipients` (
  `message_id` INT UNSIGNED NOT NULL ,
  `user_id` INT UNSIGNED NOT NULL ,
  PRIMARY KEY (`message_id`, `user_id`) ,
  CONSTRAINT `fk_messages_has_users_messages1`
    FOREIGN KEY (`message_id` )
    REFERENCES `messages` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_messages_has_users_users1`
    FOREIGN KEY (`user_id` )
    REFERENCES `users` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_messages_has_users_users1_idx` ON `messages_recipients` (`user_id` ASC) ;

CREATE INDEX `fk_messages_has_users_messages1_idx` ON `messages_recipients` (`message_id` ASC) ;


-- -----------------------------------------------------
-- Table `activity_logs_media`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `activity_logs_media` ;

CREATE  TABLE IF NOT EXISTS `activity_logs_media` (
  `media_id` CHAR(36) NOT NULL ,
  `activity_log_id` INT UNSIGNED NOT NULL ,
  PRIMARY KEY (`media_id`, `activity_log_id`) ,
  CONSTRAINT `fk_media_has_ativity_logs_media1`
    FOREIGN KEY (`media_id` )
    REFERENCES `media` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_media_has_ativity_logs_ativity_logs1`
    FOREIGN KEY (`activity_log_id` )
    REFERENCES `activity_logs` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_media_has_ativity_logs_ativity_logs1_idx` ON `activity_logs_media` (`activity_log_id` ASC) ;

CREATE INDEX `fk_media_has_ativity_logs_media1_idx` ON `activity_logs_media` (`media_id` ASC) ;


-- -----------------------------------------------------
-- Table `media_messages`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `media_messages` ;

CREATE  TABLE IF NOT EXISTS `media_messages` (
  `media_id` CHAR(36) NOT NULL ,
  `message_id` INT UNSIGNED NOT NULL ,
  PRIMARY KEY (`media_id`, `message_id`) ,
  CONSTRAINT `fk_media_has_messages_media1`
    FOREIGN KEY (`media_id` )
    REFERENCES `media` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_media_has_messages_messages1`
    FOREIGN KEY (`message_id` )
    REFERENCES `messages` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_media_has_messages_messages1_idx` ON `media_messages` (`message_id` ASC) ;

CREATE INDEX `fk_media_has_messages_media1_idx` ON `media_messages` (`media_id` ASC) ;


-- -----------------------------------------------------
-- Table `comments_media`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `comments_media` ;

CREATE  TABLE IF NOT EXISTS `comments_media` (
  `media_id` CHAR(36) NOT NULL ,
  `comment_id` INT UNSIGNED NOT NULL ,
  PRIMARY KEY (`media_id`, `comment_id`) ,
  CONSTRAINT `fk_media_has_comments_media1`
    FOREIGN KEY (`media_id` )
    REFERENCES `media` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_media_has_comments_comments1`
    FOREIGN KEY (`comment_id` )
    REFERENCES `comments` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_media_has_comments_comments1_idx` ON `comments_media` (`comment_id` ASC) ;

CREATE INDEX `fk_media_has_comments_media1_idx` ON `comments_media` (`media_id` ASC) ;



SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Data for table `users`
-- -----------------------------------------------------
START TRANSACTION;
INSERT INTO `users` (`id`, `username`, `password`, `role`, `created`, `modified`) VALUES (1, 's.susini', 'cb0c3cd38102fd0d0e0aec305f56fcb96ec9a640', 'STUDENT', '2013-03-23 13:14:51', '2013-03-23 13:14:51');
INSERT INTO `users` (`id`, `username`, `password`, `role`, `created`, `modified`) VALUES (2, 'y.jing', 'cb0c3cd38102fd0d0e0aec305f56fcb96ec9a640', 'ADMIN', '2013-03-23 13:14:51', '2013-03-23 13:15:51');
INSERT INTO `users` (`id`, `username`, `password`, `role`, `created`, `modified`) VALUES (3, 'q.dang', 'cb0c3cd38102fd0d0e0aec305f56fcb96ec9a640', 'SUPERVISOR', '2013-03-23 13:14:51', '2013-03-23 13:14:51');
INSERT INTO `users` (`id`, `username`, `password`, `role`, `created`, `modified`) VALUES (4, 'student1', 'cb0c3cd38102fd0d0e0aec305f56fcb96ec9a640', 'STUDENT', NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `role`, `created`, `modified`) VALUES (5, 'student2', 'cb0c3cd38102fd0d0e0aec305f56fcb96ec9a640', 'STUDENT', NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `role`, `created`, `modified`) VALUES (6, 'student3', 'cb0c3cd38102fd0d0e0aec305f56fcb96ec9a640', 'STUDENT', NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `role`, `created`, `modified`) VALUES (7, 'student4', 'cb0c3cd38102fd0d0e0aec305f56fcb96ec9a640', 'STUDENT', NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `role`, `created`, `modified`) VALUES (8, 'student5', 'cb0c3cd38102fd0d0e0aec305f56fcb96ec9a640', 'STUDENT', NULL, NULL);
INSERT INTO `users` (`id`, `username`, `password`, `role`, `created`, `modified`) VALUES (9, 'student6', 'cb0c3cd38102fd0d0e0aec305f56fcb96ec9a640', 'STUDENT', NULL, NULL);

COMMIT;

-- -----------------------------------------------------
-- Data for table `projects`
-- -----------------------------------------------------
START TRANSACTION;
INSERT INTO `projects` (`id`, `name`, `description`, `created`, `modified`) VALUES (1, 'Project 1', NULL, NULL, NULL);
INSERT INTO `projects` (`id`, `name`, `description`, `created`, `modified`) VALUES (2, 'Project 2', NULL, NULL, NULL);

COMMIT;

-- -----------------------------------------------------
-- Data for table `teams`
-- -----------------------------------------------------
START TRANSACTION;
INSERT INTO `teams` (`id`, `name`, `project_id`, `created`, `modified`) VALUES (1, 'Team 1', 1, NULL, NULL);
INSERT INTO `teams` (`id`, `name`, `project_id`, `created`, `modified`) VALUES (2, 'Team 2', 1, NULL, NULL);
INSERT INTO `teams` (`id`, `name`, `project_id`, `created`, `modified`) VALUES (3, 'Team 3', 2, NULL, NULL);

COMMIT;

-- -----------------------------------------------------
-- Data for table `teams_users`
-- -----------------------------------------------------
START TRANSACTION;
INSERT INTO `teams_users` (`team_id`, `user_id`, `team_leader`) VALUES (1, 4, NULL);
INSERT INTO `teams_users` (`team_id`, `user_id`, `team_leader`) VALUES (1, 5, NULL);
INSERT INTO `teams_users` (`team_id`, `user_id`, `team_leader`) VALUES (2, 6, NULL);
INSERT INTO `teams_users` (`team_id`, `user_id`, `team_leader`) VALUES (2, 7, NULL);
INSERT INTO `teams_users` (`team_id`, `user_id`, `team_leader`) VALUES (3, 8, NULL);
INSERT INTO `teams_users` (`team_id`, `user_id`, `team_leader`) VALUES (3, 9, NULL);

COMMIT;
