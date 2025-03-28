-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema taxtracker
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema taxtracker
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `taxtracker` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `taxtracker` ;

-- -----------------------------------------------------
-- Table `taxtracker`.`employment_sector`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `taxtracker`.`employment_sector` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employment_sector_name` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `employment_sector_name_UNIQUE` (`employment_sector_name` ASC) VISIBLE,
  UNIQUE INDEX `unique_employment_sector` (`employment_sector_name` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 75
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `taxtracker`.`client`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `taxtracker`.`client` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(45) NULL DEFAULT NULL,
  `last_name` VARCHAR(45) NULL DEFAULT NULL,
  `ssn` VARCHAR(9) NULL DEFAULT NULL,
  `dob` DATE NULL DEFAULT NULL,
  `phone` VARCHAR(15) NULL DEFAULT NULL,
  `email` VARCHAR(100) NULL DEFAULT NULL,
  `address1` VARCHAR(100) NULL DEFAULT NULL,
  `address2` VARCHAR(100) NULL DEFAULT NULL,
  `city` VARCHAR(100) NULL DEFAULT NULL,
  `state` VARCHAR(2) NULL DEFAULT NULL,
  `zip` VARCHAR(5) NULL DEFAULT NULL,
  `employment_sector_id` INT NULL DEFAULT NULL,
  `hashed_ssn` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `hashed_ssn` (`hashed_ssn` ASC) VISIBLE,
  UNIQUE INDEX `ssn` (`ssn` ASC) VISIBLE,
  INDEX `FK_client_employment_idx` (`employment_sector_id` ASC) VISIBLE,
  CONSTRAINT `FK_client_employment`
    FOREIGN KEY (`employment_sector_id`)
    REFERENCES `taxtracker`.`employment_sector` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 42
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `taxtracker`.`cpa`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `taxtracker`.`cpa` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  `license` VARCHAR(45) NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `email` VARCHAR(100) NULL DEFAULT NULL,
  `address1` VARCHAR(100) NOT NULL,
  `address2` VARCHAR(100) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(2) NOT NULL,
  `zip` VARCHAR(5) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 17
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `taxtracker`.`tax_return`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `taxtracker`.`tax_return` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `client_id` INT NULL DEFAULT NULL,
  `cpa_id` INT NULL DEFAULT NULL,
  `year` INT NOT NULL,
  `status` VARCHAR(45) NULL DEFAULT NULL,
  `amount_paid` DECIMAL(10,2) NULL DEFAULT NULL,
  `amount_owed` DECIMAL(10,2) NULL DEFAULT NULL,
  `cost` DECIMAL(10,2) NULL DEFAULT '200.00',
  `creation_date` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `update_date` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `employment_sector_id` INT NULL DEFAULT NULL,
  `total_income` DECIMAL(10,2) NOT NULL,
  `adjustments` DECIMAL(10,2) NULL DEFAULT '0.00',
  `filing_status` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `FK_return_cpa_idx` (`cpa_id` ASC) VISIBLE,
  INDEX `FK_return_client_idx` (`client_id` ASC) VISIBLE,
  INDEX `FK_return_sector_idx` (`employment_sector_id` ASC) VISIBLE,
  CONSTRAINT `FK_return_client`
    FOREIGN KEY (`client_id`)
    REFERENCES `taxtracker`.`client` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `FK_return_cpa`
    FOREIGN KEY (`cpa_id`)
    REFERENCES `taxtracker`.`cpa` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `FK_return_sector`
    FOREIGN KEY (`employment_sector_id`)
    REFERENCES `taxtracker`.`employment_sector` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 44
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `taxtracker`.`payment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `taxtracker`.`payment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `amount` DECIMAL(10,2) NOT NULL,
  `date` DATE NOT NULL,
  `return_id` INT NULL DEFAULT NULL,
  `method` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `FK_payment_return_idx` (`return_id` ASC) VISIBLE,
  CONSTRAINT `FK_payment_return`
    FOREIGN KEY (`return_id`)
    REFERENCES `taxtracker`.`tax_return` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 7
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
