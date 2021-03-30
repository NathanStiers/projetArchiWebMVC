-- MySQL Workbench Forward Engineering
-- LAST UPDATE 22/03/2021

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema ProjetArchiWeb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema ProjetArchiWeb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ProjetArchiWeb` DEFAULT CHARACTER SET utf8 ;
USE `ProjetArchiWeb` ;

-- -----------------------------------------------------
-- Table `ProjetArchiWeb`.`Roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ProjetArchiWeb`.`Roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(75) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `label_UNIQUE` (`label` ASC) VISIBLE);


-- -----------------------------------------------------
-- Table `ProjetArchiWeb`.`Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ProjetArchiWeb`.`Users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `role` INT NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `surname` VARCHAR(50) NOT NULL,
  `mail` VARCHAR(75) NOT NULL,
  `password` CHAR(60) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `mail_UNIQUE` (`mail` ASC) VISIBLE,
  INDEX `role_idx` (`role` ASC) VISIBLE,
  CONSTRAINT `role`
    FOREIGN KEY (`role`)
    REFERENCES `ProjetArchiWeb`.`Roles` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE);


-- -----------------------------------------------------
-- Table `ProjetArchiWeb`.`Types`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ProjetArchiWeb`.`Types` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(75) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `label_UNIQUE` (`label` ASC) VISIBLE);


-- -----------------------------------------------------
-- Table `ProjetArchiWeb`.`Wallets`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ProjetArchiWeb`.`Wallets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type` INT NOT NULL,
  `user_id` INT NOT NULL,
  `label` VARCHAR(50) NOT NULL,
  `creation_date` DATE NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `type_idx` (`type` ASC) VISIBLE,
  INDEX `user_id_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `type_w`
    FOREIGN KEY (`type`)
    REFERENCES `ProjetArchiWeb`.`Types` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `user_id_w`
    FOREIGN KEY (`user_id`)
    REFERENCES `ProjetArchiWeb`.`Users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ProjetArchiWeb`.`Assets`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ProjetArchiWeb`.`Assets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type` INT NOT NULL,
  `label` VARCHAR(50) NOT NULL,
  `ticker` VARCHAR(25) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `type_idx` (`type` ASC) VISIBLE,
  CONSTRAINT `type_a`
    FOREIGN KEY (`type`)
    REFERENCES `ProjetArchiWeb`.`Types` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ProjetArchiWeb`.`Assets_wallets`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ProjetArchiWeb`.`Assets_wallets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_wallet` INT NOT NULL,
  `id_asset` INT NOT NULL,
  `quantity` DOUBLE NOT NULL,
  `invested_amount` DOUBLE NOT NULL,
  `price_alert` DOUBLE NULL,
  PRIMARY KEY (`id`),
  INDEX `id_wallet_idx` (`id_wallet` ASC) VISIBLE,
  UNIQUE INDEX `ids_wallet_asset_UNIQUE` (`id_wallet` ASC, `id_asset` ASC) VISIBLE,
  INDEX `id_asset_idx` (`id_asset` ASC) VISIBLE,
  CONSTRAINT `id_wallet`
    FOREIGN KEY (`id_wallet`)
    REFERENCES `ProjetArchiWeb`.`Wallets` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `id_asset`
    FOREIGN KEY (`id_asset`)
    REFERENCES `ProjetArchiWeb`.`Assets` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- INSERTS `ProjetArchiWeb`.`Roles`
-- -----------------------------------------------------
INSERT INTO `ProjetArchiWeb`.`Roles` (id, label) VALUES (1, 'basic');
INSERT INTO `ProjetArchiWeb`.`Roles` (id, label) VALUES (2, 'premium');

-- -----------------------------------------------------
-- INSERTS `ProjetArchiWeb`.`Types`
-- -----------------------------------------------------
INSERT INTO `ProjetArchiWeb`.`Types` (id, label) VALUES (1, 'Actions');
INSERT INTO `ProjetArchiWeb`.`Types` (id, label) VALUES (2, 'Crypto-actifs');
INSERT INTO `ProjetArchiWeb`.`Types` (id, label) VALUES (3, 'ETF');
INSERT INTO `ProjetArchiWeb`.`Types` (id, label) VALUES (4, 'Obligations');
INSERT INTO `ProjetArchiWeb`.`Types` (id, label) VALUES (5, 'Métaux');
INSERT INTO `ProjetArchiWeb`.`Types` (id, label) VALUES (6, 'Crowdlending');

-- -----------------------------------------------------
-- INSERTS `ProjetArchiWeb`.`Users`
-- -----------------------------------------------------
-- Passwords = cMX0xhyJit
-- -----------------------------------------------------
INSERT INTO `ProjetArchiWeb`.`Users` (id, role, name, surname, mail, password) VALUES (1, 2, 'Stiers', 'Nathan', 'nathan.stiers@gmail.com', '$2b$12$tkkjspr51dAaPZ7/2idFgOkZMw1/owSAAucVWoX.XrITq7Cx869Ey');
INSERT INTO `ProjetArchiWeb`.`Users` (id, role, name, surname, mail, password) VALUES (2, 1, 'Thewissen', 'Aurélie', 'aurelie.thewissen@outlook.be', '$2b$12$tkkjspr51dAaPZ7/2idFgOkZMw1/owSAAucVWoX.XrITq7Cx869Ey');

-- -----------------------------------------------------
-- INSERTS `ProjetArchiWeb`.`Wallets`
-- -----------------------------------------------------
INSERT INTO `ProjetArchiWeb`.`Wallets` (id, type, user_id, label, creation_date) VALUES (1, 2, 1, 'Binance', DATE( NOW() ));
INSERT INTO `ProjetArchiWeb`.`Wallets` (id, type, user_id, label, creation_date) VALUES (2, 1, 1, 'Degiro', DATE( NOW() ));
INSERT INTO `ProjetArchiWeb`.`Wallets` (id, type, user_id, label, creation_date) VALUES (3, 1, 2, 'Boursorama', DATE( NOW() ));

-- -----------------------------------------------------
-- INSERTS `ProjetArchiWeb`.`Assets`
-- -----------------------------------------------------

-- -----------------------------------------------------
-- BEL20
-- -----------------------------------------------------
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (1, 1, 'ACKERMANS V.HAAREN', 'ACKB');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (2, 1, 'AEDIFICA', 'AED');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (3, 1, 'AGEAS NV', 'AGS');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (4, 1, 'ANHEUS-BUSCH INBEV', 'ABI');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (5, 1, 'APERAM', 'APAM');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (6, 1, 'ARGENX SE', 'ARGX');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (7, 1, 'BARCO', 'BAR');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (8, 1, 'COFINIMMO SICAFI', 'COFB');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (9, 1, 'COLRUYT', 'COLR');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (10, 1, 'GALAPAGOS', 'GLPG');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (11, 1, 'GRP BRUX LAMBERT', 'GBLB');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (12, 1, 'ING GROEP', 'INGA');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (13, 1, 'KBC GROUPE', 'KBC');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (14, 1, 'PROXIMUS', 'PROX');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (15, 1, 'SOFINA', 'SOF');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (16, 1, 'SOLVAY', 'SOLB');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (17, 1, 'TELENET GROUP HLDG', 'TNET');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (18, 1, 'UCB', 'UCB');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (19, 1, 'UMICORE', 'UMI');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (20, 1, 'WAREHOUSES DE PAUW', 'WDP');
-- -----------------------------------------------------
-- CoinMarketCap TOP 10
-- -----------------------------------------------------
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (21, 2, 'BITCOIN', 'BTC');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (22, 2, 'ETHEREUM', 'ETH');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (23, 2, 'BINANCE COIN', 'BNB');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (24, 2, 'CARDANO', 'ADA');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (25, 2, 'TETHER', 'USDT');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (26, 2, 'POLKADOT', 'DOT');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (27, 2, 'RIPPLE', 'XRP');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (28, 2, 'UNISWAP', 'UNI');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (29, 2, 'LITECOIN', 'LTC');
INSERT INTO `ProjetArchiWeb`.`Assets` (id, type, label, ticker) VALUES (30, 2, 'CHAINLINK', 'LINK');

-- -----------------------------------------------------
-- INSERTS `ProjetArchiWeb`.`Assets_wallets`
-- -----------------------------------------------------
INSERT INTO `ProjetArchiWeb`.`Assets_wallets` (id, id_wallet, id_asset, quantity, invested_amount) VALUES (1, 1, 21, 0.25, 9125);
INSERT INTO `ProjetArchiWeb`.`Assets_wallets` (id, id_wallet, id_asset, quantity, invested_amount) VALUES (2, 1, 25, 250, 205);
INSERT INTO `ProjetArchiWeb`.`Assets_wallets` (id, id_wallet, id_asset, quantity, invested_amount) VALUES (3, 2, 4, 15, 678.3);
INSERT INTO `ProjetArchiWeb`.`Assets_wallets` (id, id_wallet, id_asset, quantity, invested_amount) VALUES (4, 2, 10, 5, 325.05);
INSERT INTO `ProjetArchiWeb`.`Assets_wallets` (id, id_wallet, id_asset, quantity, invested_amount) VALUES (5, 2, 16, 30, 2860.5);
INSERT INTO `ProjetArchiWeb`.`Assets_wallets` (id, id_wallet, id_asset, quantity, invested_amount) VALUES (6, 3, 9, 105, 2683.8);