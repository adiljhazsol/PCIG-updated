-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: pcig_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accounts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('asset','liability','equity','revenue','expense') NOT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,'1000','Cash','asset',1200.00,'2026-01-27 05:18:09','2026-01-27 05:19:49'),(2,'1100','Accounts Receivable','asset',0.00,'2026-01-27 05:18:09','2026-01-27 05:18:09'),(3,'2000','Accounts Payable','liability',0.00,'2026-01-27 05:18:09','2026-01-27 05:18:09'),(4,'3000','Owner Equity','equity',0.00,'2026-01-27 05:18:09','2026-01-27 05:18:09'),(5,'4000','Rental Income','revenue',1200.00,'2026-01-27 05:18:09','2026-01-27 05:19:49'),(6,'5000','Maintenance Expense','expense',0.00,'2026-01-27 05:18:09','2026-01-27 05:19:49');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_log`
--

DROP TABLE IF EXISTS `activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_log` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `log_name` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `subject_type` varchar(255) DEFAULT NULL,
  `subject_id` bigint(20) unsigned DEFAULT NULL,
  `causer_type` varchar(255) DEFAULT NULL,
  `causer_id` bigint(20) unsigned DEFAULT NULL,
  `properties` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`properties`)),
  `event` varchar(255) DEFAULT NULL,
  `batch_uuid` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_log_log_name_index` (`log_name`),
  KEY `activity_log_subject_type_subject_id_index` (`subject_type`,`subject_id`),
  KEY `activity_log_causer_type_causer_id_index` (`causer_type`,`causer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_log`
--

LOCK TABLES `activity_log` WRITE;
/*!40000 ALTER TABLE `activity_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `action` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(255) NOT NULL DEFAULT 'Activity',
  `icon_color` varchar(255) NOT NULL DEFAULT '#64748B',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,'Payment Received','Payment received from Investor #889 ($25,000)','DollarSign','#1E40AF','2026-01-26 07:22:05','2026-01-26 12:22:05'),(2,'Property Listed','New property \"1240 Oak St\" added to inventory','Home','#10B981','2026-01-25 12:22:05','2026-01-26 12:22:05'),(3,'User Login','Admin user logged in','User','#64748B','2026-01-26 11:52:05','2026-01-26 12:22:05');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_transactions`
--

DROP TABLE IF EXISTS `asset_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asset_transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `transaction_code` varchar(255) NOT NULL,
  `property_id` varchar(255) DEFAULT NULL,
  `property_address` varchar(255) NOT NULL,
  `counterparty` varchar(255) NOT NULL,
  `counterparty_role` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `stage` varchar(255) NOT NULL DEFAULT 'DRAFT',
  `terms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`terms`)),
  `history` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`history`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `asset_transactions_transaction_code_unique` (`transaction_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_transactions`
--

LOCK TABLES `asset_transactions` WRITE;
/*!40000 ALTER TABLE `asset_transactions` DISABLE KEYS */;
INSERT INTO `asset_transactions` VALUES (1,'TRX-2024-001','PCIG-2023-089','1240 Oak Street, Atlanta GA','Opendoor Labs Inc.','Buyer','SELL','DRAFT','{\"price\":250000,\"closingDate\":\"2024-02-28\",\"inspectionPeriodDays\":10,\"earnestMoney\":2500,\"contingencies\":[\"Inspection\",\"Financing\"]}','[{\"date\":\"2024-01-20\",\"action\":\"Created Draft\",\"user\":\"Admin User\"}]','2026-01-26 13:10:25','2026-01-26 13:10:25'),(2,'TRX-2023-112','PCIG-2023-005','456 Pine Lane, Roswell GA','John Smith LLC','Seller','BUY','SENT','{\"price\":185000,\"closingDate\":\"2024-02-15\",\"inspectionPeriodDays\":7,\"earnestMoney\":5000,\"contingencies\":[\"Title Clear\"]}','[{\"date\":\"2024-01-18\",\"action\":\"Offer Sent\",\"user\":\"System Automation\"},{\"date\":\"2024-01-17\",\"action\":\"Draft Created\",\"user\":\"Admin User\"}]','2026-01-26 13:10:25','2026-01-26 13:10:25'),(3,'TRX-2023-099','PCIG-2023-099','789 Maple Ave, Marietta GA','Global REIT','Lessor','LEASE','UNDER_CONTRACT','{\"price\":2500,\"closingDate\":\"2024-03-01\",\"inspectionPeriodDays\":0,\"earnestMoney\":2500,\"contingencies\":[]}','[{\"date\":\"2024-01-10\",\"action\":\"Contract Signed\",\"user\":\"Legal Dept\"},{\"date\":\"2024-01-05\",\"action\":\"Offer Accepted\",\"user\":\"Legal Dept\"},{\"date\":\"2023-12-28\",\"action\":\"Offer Sent\",\"user\":\"Admin User\"}]','2026-01-26 13:10:25','2026-01-26 13:10:25');
/*!40000 ALTER TABLE `asset_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auctions`
--

DROP TABLE IF EXISTS `auctions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auctions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `auction_date` datetime DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `starting_bid` decimal(10,2) DEFAULT NULL,
  `winning_bid` decimal(10,2) DEFAULT NULL,
  `winner_info` text DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled','failed') NOT NULL DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `auctions_property_id_status_index` (`property_id`,`status`),
  KEY `auctions_status_index` (`status`),
  CONSTRAINT `auctions_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auctions`
--

LOCK TABLES `auctions` WRITE;
/*!40000 ALTER TABLE `auctions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auctions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `barment_cases`
--

DROP TABLE IF EXISTS `barment_cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `barment_cases` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `filed_date` date DEFAULT NULL,
  `status` enum('pending','filed','in_court','decided','dismissed') NOT NULL DEFAULT 'pending',
  `court_date` date DEFAULT NULL,
  `court_outcome` varchar(255) DEFAULT NULL,
  `attorney_id` bigint(20) unsigned DEFAULT NULL,
  `filing_fee` decimal(8,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `barment_cases_attorney_id_foreign` (`attorney_id`),
  KEY `barment_cases_property_id_status_index` (`property_id`,`status`),
  KEY `barment_cases_court_date_index` (`court_date`),
  KEY `barment_cases_status_index` (`status`),
  CONSTRAINT `barment_cases_attorney_id_foreign` FOREIGN KEY (`attorney_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `barment_cases_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `barment_cases`
--

LOCK TABLES `barment_cases` WRITE;
/*!40000 ALTER TABLE `barment_cases` DISABLE KEYS */;
/*!40000 ALTER TABLE `barment_cases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deadlines`
--

DROP TABLE IF EXISTS `deadlines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `deadlines` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `deadline_date` date NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('pending','completed','overdue') NOT NULL DEFAULT 'pending',
  `notified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `deadlines_property_id_foreign` (`property_id`),
  CONSTRAINT `deadlines_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deadlines`
--

LOCK TABLES `deadlines` WRITE;
/*!40000 ALTER TABLE `deadlines` DISABLE KEYS */;
INSERT INTO `deadlines` VALUES (1,NULL,'filing','2026-01-28','hh','pending',NULL,'2026-01-28 04:30:09','2026-01-28 04:30:17','2026-01-28 04:30:17');
/*!40000 ALTER TABLE `deadlines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `depreciations`
--

DROP TABLE IF EXISTS `depreciations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `depreciations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `tax_year` int(11) NOT NULL,
  `asset_basis` decimal(15,2) NOT NULL,
  `depreciation_amount` decimal(15,2) NOT NULL,
  `method` enum('straight_line','double_declining','sum_of_years') NOT NULL DEFAULT 'straight_line',
  `useful_life_years` int(11) NOT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `depreciations_property_id_foreign` (`property_id`),
  KEY `depreciations_created_by_foreign` (`created_by`),
  CONSTRAINT `depreciations_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `depreciations_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `depreciations`
--

LOCK TABLES `depreciations` WRITE;
/*!40000 ALTER TABLE `depreciations` DISABLE KEYS */;
INSERT INTO `depreciations` VALUES (1,1,2023,100000.00,3636.36,'straight_line',27,5,'2026-01-28 10:00:05','2026-01-28 10:00:05',NULL),(2,1,2024,100000.00,3636.36,'straight_line',27,5,'2026-01-28 10:00:05','2026-01-28 10:00:05',NULL),(3,1,2025,100000.00,3636.36,'straight_line',27,5,'2026-01-28 10:00:05','2026-01-28 10:00:05',NULL),(4,2,2023,100000.00,3636.36,'straight_line',27,5,'2026-01-28 10:00:05','2026-01-28 10:00:05',NULL),(5,2,2024,100000.00,3636.36,'straight_line',27,5,'2026-01-28 10:00:05','2026-01-28 10:00:05',NULL),(6,2,2025,100000.00,3636.36,'straight_line',27,5,'2026-01-28 10:00:05','2026-01-28 10:00:05',NULL),(7,3,2023,100000.00,3636.36,'straight_line',27,5,'2026-01-28 10:00:05','2026-01-28 10:00:05',NULL),(8,3,2024,100000.00,3636.36,'straight_line',27,5,'2026-01-28 10:00:05','2026-01-28 10:00:05',NULL),(9,3,2025,100000.00,3636.36,'straight_line',27,5,'2026-01-28 10:00:05','2026-01-28 10:00:05',NULL),(10,4,2023,100000.00,3636.36,'straight_line',27,5,'2026-01-28 10:00:05','2026-01-28 10:00:05',NULL),(11,4,2024,100000.00,3636.36,'straight_line',27,5,'2026-01-28 10:00:05','2026-01-28 10:00:05',NULL),(12,4,2025,100000.00,3636.36,'straight_line',27,5,'2026-01-28 10:00:05','2026-01-28 10:00:05',NULL),(13,5,2023,100000.00,3636.36,'straight_line',27,5,'2026-01-28 10:00:05','2026-01-28 10:00:05',NULL),(14,5,2024,100000.00,3636.36,'straight_line',27,5,'2026-01-28 10:00:05','2026-01-28 10:00:05',NULL),(15,5,2025,100000.00,3636.36,'straight_line',27,5,'2026-01-28 10:00:05','2026-01-28 10:00:05',NULL);
/*!40000 ALTER TABLE `depreciations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `distributions`
--

DROP TABLE IF EXISTS `distributions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `distributions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `investment_id` bigint(20) unsigned DEFAULT NULL,
  `fund_investment_id` bigint(20) unsigned DEFAULT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `property_id` bigint(20) unsigned DEFAULT NULL,
  `fund_id` bigint(20) unsigned DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `distribution_date` date NOT NULL,
  `status` enum('pending','processed','failed') NOT NULL DEFAULT 'pending',
  `description` varchar(255) DEFAULT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `distributions_reference_number_unique` (`reference_number`),
  KEY `distributions_investment_id_foreign` (`investment_id`),
  KEY `distributions_fund_investment_id_foreign` (`fund_investment_id`),
  KEY `distributions_property_id_foreign` (`property_id`),
  KEY `distributions_fund_id_foreign` (`fund_id`),
  KEY `distributions_user_id_distribution_date_index` (`user_id`,`distribution_date`),
  KEY `distributions_status_distribution_date_index` (`status`,`distribution_date`),
  KEY `distributions_status_index` (`status`),
  CONSTRAINT `distributions_fund_id_foreign` FOREIGN KEY (`fund_id`) REFERENCES `funds` (`id`) ON DELETE SET NULL,
  CONSTRAINT `distributions_fund_investment_id_foreign` FOREIGN KEY (`fund_investment_id`) REFERENCES `fund_investments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `distributions_investment_id_foreign` FOREIGN KEY (`investment_id`) REFERENCES `investments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `distributions_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL,
  CONSTRAINT `distributions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `distributions`
--

LOCK TABLES `distributions` WRITE;
/*!40000 ALTER TABLE `distributions` DISABLE KEYS */;
INSERT INTO `distributions` VALUES (1,NULL,NULL,1,NULL,NULL,5000.00,'2025-06-15','processed','Q2 Distribution',NULL,'2026-01-27 05:18:53','2026-01-27 05:18:53'),(2,NULL,NULL,1,NULL,1,5000.00,'2025-06-15','processed','Q2 Distribution',NULL,'2026-01-27 05:19:27','2026-01-27 05:19:27'),(3,NULL,NULL,1,NULL,1,5000.00,'2025-06-15','processed','Q2 Distribution',NULL,'2026-01-27 05:19:49','2026-01-27 05:19:49');
/*!40000 ALTER TABLE `distributions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `documents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `document_code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `tag` varchar(255) DEFAULT NULL,
  `tag_color` varchar(255) DEFAULT NULL,
  `tag_bg_color` varchar(255) DEFAULT NULL,
  `format` varchar(255) NOT NULL,
  `format_color` varchar(255) DEFAULT NULL,
  `format_bg_color` varchar(255) DEFAULT NULL,
  `icon` varchar(255) NOT NULL DEFAULT 'FileText',
  `icon_color` varchar(255) DEFAULT NULL,
  `generated_date` date NOT NULL,
  `size` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `documents_document_code_unique` (`document_code`),
  KEY `documents_user_id_foreign` (`user_id`),
  CONSTRAINT `documents_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (1,1,'DOC-2023-001','Monthly Statement - Oct 2023','Monthly Statement','Statements','NEW','#10B981','#ECFDF5','PDF','#64748B','#F1F5F9','FileText','#EF4444','2023-10-31','2.4 MB','Generated: Oct 31, 2023','2026-01-26 10:57:53','2026-01-26 10:57:53'),(2,1,'DOC-2023-002','K-1 Tax Form - 2023','Tax Document','Tax Documents','Tax Doc','#10B981','#ECFDF5','PDF','#64748B','#F1F5F9','FileCheck','#10B981','2023-10-15','2023 Tax Year','Generated: Oct 15, 2023','2026-01-26 10:57:53','2026-01-26 10:57:53'),(3,1,'DOC-2023-003','Investment Summary - Q3','Summary','Investment Summaries',NULL,NULL,NULL,'PDF','#64748B','#F1F5F9','PieChart','#3B82F6','2023-10-05','1.8 MB','Q3 Performance Report','2026-01-26 10:57:53','2026-01-26 10:57:53');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `efile_cancellations`
--

DROP TABLE IF EXISTS `efile_cancellations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `efile_cancellations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `filing_id` varchar(255) DEFAULT NULL,
  `reason` varchar(255) NOT NULL,
  `requested_at` date NOT NULL,
  `status` enum('pending','processing','cancelled','failed') NOT NULL DEFAULT 'pending',
  `requested_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `efile_cancellations_property_id_foreign` (`property_id`),
  KEY `efile_cancellations_requested_by_foreign` (`requested_by`),
  CONSTRAINT `efile_cancellations_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `efile_cancellations_requested_by_foreign` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `efile_cancellations`
--

LOCK TABLES `efile_cancellations` WRITE;
/*!40000 ALTER TABLE `efile_cancellations` DISABLE KEYS */;
INSERT INTO `efile_cancellations` VALUES (1,1,'FILE-999','Duplicate filing','2026-01-27','pending',1,'2026-01-27 05:30:45','2026-01-27 05:30:45',NULL);
/*!40000 ALTER TABLE `efile_cancellations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `escalation_rules`
--

DROP TABLE IF EXISTS `escalation_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `escalation_rules` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `trigger_type` varchar(255) NOT NULL,
  `delay_hours` int(11) NOT NULL DEFAULT 24,
  `escalate_to_user_id` bigint(20) unsigned NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `escalation_rules_escalate_to_user_id_foreign` (`escalate_to_user_id`),
  CONSTRAINT `escalation_rules_escalate_to_user_id_foreign` FOREIGN KEY (`escalate_to_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `escalation_rules`
--

LOCK TABLES `escalation_rules` WRITE;
/*!40000 ALTER TABLE `escalation_rules` DISABLE KEYS */;
/*!40000 ALTER TABLE `escalation_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_allocations`
--

DROP TABLE IF EXISTS `expense_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `expense_allocations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `expense_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `percentage` decimal(5,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `expense_allocations_expense_id_foreign` (`expense_id`),
  KEY `expense_allocations_user_id_foreign` (`user_id`),
  CONSTRAINT `expense_allocations_expense_id_foreign` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `expense_allocations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_allocations`
--

LOCK TABLES `expense_allocations` WRITE;
/*!40000 ALTER TABLE `expense_allocations` DISABLE KEYS */;
/*!40000 ALTER TABLE `expense_allocations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `expenses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `date` date NOT NULL,
  `description` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `allocation_method` enum('equal','ownership_percentage') NOT NULL DEFAULT 'ownership_percentage',
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `expenses_property_id_foreign` (`property_id`),
  KEY `expenses_created_by_foreign` (`created_by`),
  CONSTRAINT `expenses_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `expenses_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES (1,1,150.00,'2026-01-25','Lawn Mowing','Maintenance','equal',1,'2026-01-27 05:30:45','2026-01-27 05:30:45',NULL);
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fifa_import_errors`
--

DROP TABLE IF EXISTS `fifa_import_errors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fifa_import_errors` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `import_id` bigint(20) unsigned NOT NULL,
  `row_number` int(11) NOT NULL,
  `error_message` text NOT NULL,
  `row_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`row_data`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fifa_import_errors_import_id_row_number_index` (`import_id`,`row_number`),
  CONSTRAINT `fifa_import_errors_import_id_foreign` FOREIGN KEY (`import_id`) REFERENCES `fifa_imports` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fifa_import_errors`
--

LOCK TABLES `fifa_import_errors` WRITE;
/*!40000 ALTER TABLE `fifa_import_errors` DISABLE KEYS */;
INSERT INTO `fifa_import_errors` VALUES (1,3,2,'The parcel id field is required., The address field is required.','{\"id\":1,\"type\":\"K-1\",\"title\":\"2025 K-1 Form\",\"year\":2025,\"generated_at\":\"2026-01-22 18:21:31\",\"created_at\":\"2026-01-27 18:21:31\"}','2026-01-29 13:15:38','2026-01-29 13:15:38'),(2,3,3,'The parcel id field is required., The address field is required.','{\"id\":2,\"type\":\"Statement\",\"title\":\"Q4 2025 Statement\",\"year\":2025,\"generated_at\":\"2026-01-17 18:21:31\",\"created_at\":\"2026-01-27 18:21:31\"}','2026-01-29 13:15:38','2026-01-29 13:15:38'),(3,5,2,'SQLSTATE[HY000]: General error: 1364 Field \'property_code\' doesn\'t have a default value (Connection: mysql, Host: 127.0.0.1, Port: 3306, Database: pcig_db, SQL: insert into `properties` (`parcel_id`, `address`, `city`, `county`, `state`, `zip_code`, `status`, `workflow_stage`, `purchase_price`, `current_value`, `roi`, `total_shares`, `available_shares`, `price_per_share`, `updated_at`, `created_at`) values (11-222-33, 101 Pine St, Atlanta, Fulton, GA, 30303, pending_review, fifa_processing, 100000, 150000, 0, 0, 0, 0, 2026-01-29 18:41:45, 2026-01-29 18:41:45))','{\"parcel_id\":\"11-222-33\",\"address\":\"101 Pine St\",\"city\":\"Atlanta\",\"county\":\"Fulton\",\"state\":\"GA\",\"zip_code\":30303,\"purchase_price\":100000,\"current_value\":150000}','2026-01-29 13:41:45','2026-01-29 13:41:45'),(4,5,3,'SQLSTATE[HY000]: General error: 1364 Field \'property_code\' doesn\'t have a default value (Connection: mysql, Host: 127.0.0.1, Port: 3306, Database: pcig_db, SQL: insert into `properties` (`parcel_id`, `address`, `city`, `county`, `state`, `zip_code`, `status`, `workflow_stage`, `purchase_price`, `current_value`, `roi`, `total_shares`, `available_shares`, `price_per_share`, `updated_at`, `created_at`) values (44-555-66, 202 Cedar Ln, Decatur, DeKalb, GA, 30030, pending_review, fifa_processing, 125000, 175000, 0, 0, 0, 0, 2026-01-29 18:41:45, 2026-01-29 18:41:45))','{\"parcel_id\":\"44-555-66\",\"address\":\"202 Cedar Ln\",\"city\":\"Decatur\",\"county\":\"DeKalb\",\"state\":\"GA\",\"zip_code\":30030,\"purchase_price\":125000,\"current_value\":175000}','2026-01-29 13:41:45','2026-01-29 13:41:45'),(5,5,4,'SQLSTATE[HY000]: General error: 1364 Field \'property_code\' doesn\'t have a default value (Connection: mysql, Host: 127.0.0.1, Port: 3306, Database: pcig_db, SQL: insert into `properties` (`parcel_id`, `address`, `city`, `county`, `state`, `zip_code`, `status`, `workflow_stage`, `purchase_price`, `current_value`, `roi`, `total_shares`, `available_shares`, `price_per_share`, `updated_at`, `created_at`) values (77-888-99, 303 Birch Blvd, Marietta, Cobb, GA, 30060, pending_review, fifa_processing, 140000, 190000, 0, 0, 0, 0, 2026-01-29 18:41:45, 2026-01-29 18:41:45))','{\"parcel_id\":\"77-888-99\",\"address\":\"303 Birch Blvd\",\"city\":\"Marietta\",\"county\":\"Cobb\",\"state\":\"GA\",\"zip_code\":30060,\"purchase_price\":140000,\"current_value\":190000}','2026-01-29 13:41:45','2026-01-29 13:41:45'),(6,5,5,'SQLSTATE[HY000]: General error: 1364 Field \'property_code\' doesn\'t have a default value (Connection: mysql, Host: 127.0.0.1, Port: 3306, Database: pcig_db, SQL: insert into `properties` (`parcel_id`, `address`, `city`, `county`, `state`, `zip_code`, `status`, `workflow_stage`, `purchase_price`, `current_value`, `roi`, `total_shares`, `available_shares`, `price_per_share`, `updated_at`, `created_at`) values (AA-BBB-CC, 404 Elm Way, Alpharetta, Fulton, GA, 30009, pending_review, fifa_processing, 250000, 320000, 0, 0, 0, 0, 2026-01-29 18:41:45, 2026-01-29 18:41:45))','{\"parcel_id\":\"AA-BBB-CC\",\"address\":\"404 Elm Way\",\"city\":\"Alpharetta\",\"county\":\"Fulton\",\"state\":\"GA\",\"zip_code\":30009,\"purchase_price\":250000,\"current_value\":320000}','2026-01-29 13:41:45','2026-01-29 13:41:45'),(7,5,6,'SQLSTATE[HY000]: General error: 1364 Field \'property_code\' doesn\'t have a default value (Connection: mysql, Host: 127.0.0.1, Port: 3306, Database: pcig_db, SQL: insert into `properties` (`parcel_id`, `address`, `city`, `county`, `state`, `zip_code`, `status`, `workflow_stage`, `purchase_price`, `current_value`, `roi`, `total_shares`, `available_shares`, `price_per_share`, `updated_at`, `created_at`) values (XX-YYY-ZZ, 505 Oak Dr, Roswell, Fulton, GA, 30075, pending_review, fifa_processing, 210000, 280000, 0, 0, 0, 0, 2026-01-29 18:41:45, 2026-01-29 18:41:45))','{\"parcel_id\":\"XX-YYY-ZZ\",\"address\":\"505 Oak Dr\",\"city\":\"Roswell\",\"county\":\"Fulton\",\"state\":\"GA\",\"zip_code\":30075,\"purchase_price\":210000,\"current_value\":280000}','2026-01-29 13:41:45','2026-01-29 13:41:45'),(8,6,2,'SQLSTATE[HY000]: General error: 1364 Field \'location\' doesn\'t have a default value (Connection: mysql, Host: 127.0.0.1, Port: 3306, Database: pcig_db, SQL: insert into `properties` (`parcel_id`, `property_code`, `address`, `city`, `county`, `state`, `zip_code`, `status`, `workflow_stage`, `purchase_price`, `current_value`, `roi`, `total_shares`, `available_shares`, `price_per_share`, `updated_at`, `created_at`) values (11-222-33, 11-222-33, 101 Pine St, Atlanta, Fulton, GA, 30303, pending_review, fifa_processing, 100000, 150000, 0, 0, 0, 0, 2026-01-29 18:48:30, 2026-01-29 18:48:30))','{\"parcel_id\":\"11-222-33\",\"address\":\"101 Pine St\",\"city\":\"Atlanta\",\"county\":\"Fulton\",\"state\":\"GA\",\"zip_code\":30303,\"purchase_price\":100000,\"current_value\":150000}','2026-01-29 13:48:30','2026-01-29 13:48:30'),(9,6,3,'SQLSTATE[HY000]: General error: 1364 Field \'location\' doesn\'t have a default value (Connection: mysql, Host: 127.0.0.1, Port: 3306, Database: pcig_db, SQL: insert into `properties` (`parcel_id`, `property_code`, `address`, `city`, `county`, `state`, `zip_code`, `status`, `workflow_stage`, `purchase_price`, `current_value`, `roi`, `total_shares`, `available_shares`, `price_per_share`, `updated_at`, `created_at`) values (44-555-66, 44-555-66, 202 Cedar Ln, Decatur, DeKalb, GA, 30030, pending_review, fifa_processing, 125000, 175000, 0, 0, 0, 0, 2026-01-29 18:48:30, 2026-01-29 18:48:30))','{\"parcel_id\":\"44-555-66\",\"address\":\"202 Cedar Ln\",\"city\":\"Decatur\",\"county\":\"DeKalb\",\"state\":\"GA\",\"zip_code\":30030,\"purchase_price\":125000,\"current_value\":175000}','2026-01-29 13:48:30','2026-01-29 13:48:30'),(10,6,4,'SQLSTATE[HY000]: General error: 1364 Field \'location\' doesn\'t have a default value (Connection: mysql, Host: 127.0.0.1, Port: 3306, Database: pcig_db, SQL: insert into `properties` (`parcel_id`, `property_code`, `address`, `city`, `county`, `state`, `zip_code`, `status`, `workflow_stage`, `purchase_price`, `current_value`, `roi`, `total_shares`, `available_shares`, `price_per_share`, `updated_at`, `created_at`) values (77-888-99, 77-888-99, 303 Birch Blvd, Marietta, Cobb, GA, 30060, pending_review, fifa_processing, 140000, 190000, 0, 0, 0, 0, 2026-01-29 18:48:30, 2026-01-29 18:48:30))','{\"parcel_id\":\"77-888-99\",\"address\":\"303 Birch Blvd\",\"city\":\"Marietta\",\"county\":\"Cobb\",\"state\":\"GA\",\"zip_code\":30060,\"purchase_price\":140000,\"current_value\":190000}','2026-01-29 13:48:30','2026-01-29 13:48:30'),(11,6,5,'SQLSTATE[HY000]: General error: 1364 Field \'location\' doesn\'t have a default value (Connection: mysql, Host: 127.0.0.1, Port: 3306, Database: pcig_db, SQL: insert into `properties` (`parcel_id`, `property_code`, `address`, `city`, `county`, `state`, `zip_code`, `status`, `workflow_stage`, `purchase_price`, `current_value`, `roi`, `total_shares`, `available_shares`, `price_per_share`, `updated_at`, `created_at`) values (AA-BBB-CC, AA-BBB-CC, 404 Elm Way, Alpharetta, Fulton, GA, 30009, pending_review, fifa_processing, 250000, 320000, 0, 0, 0, 0, 2026-01-29 18:48:30, 2026-01-29 18:48:30))','{\"parcel_id\":\"AA-BBB-CC\",\"address\":\"404 Elm Way\",\"city\":\"Alpharetta\",\"county\":\"Fulton\",\"state\":\"GA\",\"zip_code\":30009,\"purchase_price\":250000,\"current_value\":320000}','2026-01-29 13:48:30','2026-01-29 13:48:30'),(12,6,6,'SQLSTATE[HY000]: General error: 1364 Field \'location\' doesn\'t have a default value (Connection: mysql, Host: 127.0.0.1, Port: 3306, Database: pcig_db, SQL: insert into `properties` (`parcel_id`, `property_code`, `address`, `city`, `county`, `state`, `zip_code`, `status`, `workflow_stage`, `purchase_price`, `current_value`, `roi`, `total_shares`, `available_shares`, `price_per_share`, `updated_at`, `created_at`) values (XX-YYY-ZZ, XX-YYY-ZZ, 505 Oak Dr, Roswell, Fulton, GA, 30075, pending_review, fifa_processing, 210000, 280000, 0, 0, 0, 0, 2026-01-29 18:48:30, 2026-01-29 18:48:30))','{\"parcel_id\":\"XX-YYY-ZZ\",\"address\":\"505 Oak Dr\",\"city\":\"Roswell\",\"county\":\"Fulton\",\"state\":\"GA\",\"zip_code\":30075,\"purchase_price\":210000,\"current_value\":280000}','2026-01-29 13:48:30','2026-01-29 13:48:30');
/*!40000 ALTER TABLE `fifa_import_errors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fifa_imports`
--

DROP TABLE IF EXISTS `fifa_imports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fifa_imports` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
  `total_rows` int(11) NOT NULL DEFAULT 0,
  `processed_rows` int(11) NOT NULL DEFAULT 0,
  `success_count` int(11) NOT NULL DEFAULT 0,
  `error_count` int(11) NOT NULL DEFAULT 0,
  `imported_by` bigint(20) unsigned DEFAULT NULL,
  `errors` text DEFAULT NULL COMMENT 'JSON array of errors',
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fifa_imports_imported_by_foreign` (`imported_by`),
  KEY `fifa_imports_status_created_at_index` (`status`,`created_at`),
  KEY `fifa_imports_status_index` (`status`),
  CONSTRAINT `fifa_imports_imported_by_foreign` FOREIGN KEY (`imported_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fifa_imports`
--

LOCK TABLES `fifa_imports` WRITE;
/*!40000 ALTER TABLE `fifa_imports` DISABLE KEYS */;
INSERT INTO `fifa_imports` VALUES (1,'fifa-imports/9asjpjbl78OCyinJRw9GYj6b2FnhGImmIDpJPpkb.csv','new','failed',0,0,0,1,5,NULL,'2026-01-29 13:07:33',NULL,'2026-01-29 13:07:33','2026-01-29 13:07:33'),(2,'fifa-imports/QAjxLsn22Ig4cRprk9T2okL8143kfe4TOsYhFDwM.csv','new','failed',0,0,0,1,5,NULL,'2026-01-29 13:14:11',NULL,'2026-01-29 13:14:11','2026-01-29 13:14:11'),(3,'fifa-imports/2YrZkYdPPJpL0v8hkK8yMZr7bPUPyUyuYdDE6S2f.csv','new','failed',2,2,0,2,5,NULL,'2026-01-29 13:15:38','2026-01-29 13:15:38','2026-01-29 13:15:38','2026-01-29 13:15:38'),(4,'fifa-imports/LBMuoTaVfae1MHe3rWoAuL3AjzKeGRyZ4QxTvphG.txt','new','completed',0,0,0,0,5,NULL,'2026-01-29 13:26:04','2026-01-29 13:26:04','2026-01-29 13:26:04','2026-01-29 13:26:04'),(5,'fifa-imports/8JNhQWauJQqERApPQXrMGEAh4TiHmoSfb4RkqC7g.csv','test','failed',5,5,0,5,5,NULL,'2026-01-29 13:41:45','2026-01-29 13:41:45','2026-01-29 13:41:45','2026-01-29 13:41:45'),(6,'fifa-imports/rQXuiESO9thGCg9miM0kyd8li7gGXyc10kN5fudd.csv','new test','failed',5,5,0,5,5,NULL,'2026-01-29 13:48:30','2026-01-29 13:48:30','2026-01-29 13:48:30','2026-01-29 13:48:30'),(7,'fifa-imports/xzyRpnNkp1idZvTmdo4b6XRby7q9wxFUIbRXsW4g.csv','new test','completed',5,5,5,0,5,NULL,'2026-01-29 13:50:41','2026-01-29 13:50:41','2026-01-29 13:50:41','2026-01-29 13:50:41'),(9,'fifa-imports/TBTRCSqyXfzW0vNw0b4H8uSoozhW4s9NlK3UpRzr.csv','testing','completed',5,5,5,0,5,NULL,'2026-01-29 14:08:09','2026-01-29 14:08:09','2026-01-29 14:08:09','2026-01-29 14:08:09'),(10,'fifa-imports/zSDB0Ay0pgs68lkWfXFH3XWKsGZUO3eOqesdioVP.csv','t','completed',5,5,5,0,5,NULL,'2026-01-29 14:12:42','2026-01-29 14:12:42','2026-01-29 14:12:42','2026-01-29 14:12:42'),(11,'fifa-imports/w7aEDrDWAbFpvjmLPVIOoAiBDGgRRPDeT3TTSWh9.csv','n','completed',5,5,5,0,5,NULL,'2026-01-29 14:36:36','2026-01-29 14:36:36','2026-01-29 14:36:36','2026-01-29 14:36:36'),(12,'fifa-imports/4IEdWUd9fvAmfPIYNQhwVcyqZTSShiKJXIN2cp4K.xlsx','bb','completed',3,3,3,0,5,NULL,'2026-01-29 14:37:05','2026-01-29 14:37:05','2026-01-29 14:37:05','2026-01-29 14:37:05'),(13,'fifa-imports/VrxAdddxhrrCkVzmMQeg7Rd8ww9oUksP9RSr39zq.csv','new te4st','completed',5,5,5,0,5,NULL,'2026-01-30 01:35:45','2026-01-30 01:35:45','2026-01-30 01:35:45','2026-01-30 01:35:45');
/*!40000 ALTER TABLE `fifa_imports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fund_investments`
--

DROP TABLE IF EXISTS `fund_investments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fund_investments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `fund_id` bigint(20) unsigned NOT NULL,
  `shares` int(11) NOT NULL DEFAULT 0,
  `amount` decimal(15,2) NOT NULL,
  `price_per_share` decimal(10,2) NOT NULL,
  `purchase_date` date NOT NULL,
  `status` enum('active','redeemed') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fund_investments_fund_id_foreign` (`fund_id`),
  KEY `fund_investments_user_id_fund_id_index` (`user_id`,`fund_id`),
  KEY `fund_investments_status_index` (`status`),
  CONSTRAINT `fund_investments_fund_id_foreign` FOREIGN KEY (`fund_id`) REFERENCES `funds` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fund_investments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fund_investments`
--

LOCK TABLES `fund_investments` WRITE;
/*!40000 ALTER TABLE `fund_investments` DISABLE KEYS */;
/*!40000 ALTER TABLE `fund_investments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `funds`
--

DROP TABLE IF EXISTS `funds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `funds` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `fund_code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `tag` varchar(255) DEFAULT NULL,
  `tag_color` varchar(255) NOT NULL DEFAULT '#10B981',
  `tag_bg_color` varchar(255) NOT NULL DEFAULT '#E6F6F2',
  `target_irr` varchar(255) DEFAULT NULL,
  `realized_irr` varchar(255) DEFAULT NULL,
  `return_type` varchar(255) NOT NULL DEFAULT 'Annualized Net Return',
  `lock_up_period` varchar(255) DEFAULT NULL,
  `min_investment` decimal(15,2) DEFAULT NULL,
  `total_assets` decimal(15,2) NOT NULL DEFAULT 0.00,
  `current_nav` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_shares` int(11) NOT NULL DEFAULT 0,
  `available_shares` int(11) NOT NULL DEFAULT 0,
  `price_per_share` decimal(10,2) NOT NULL DEFAULT 0.00,
  `fund_size` varchar(255) DEFAULT NULL,
  `remaining_capacity` varchar(255) DEFAULT NULL,
  `capacity_percent` int(11) NOT NULL DEFAULT 100,
  `capacity_color` varchar(255) NOT NULL DEFAULT '#10B981',
  `risk_profile` varchar(255) NOT NULL DEFAULT 'Low',
  `risk_level` int(11) NOT NULL DEFAULT 3,
  `risk_max_level` int(11) NOT NULL DEFAULT 5,
  `risk_color` varchar(255) NOT NULL DEFAULT '#10B981',
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `launch_date` date DEFAULT NULL,
  `button` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`button`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `performance_metric` decimal(5,2) DEFAULT NULL,
  `management_fee` decimal(4,2) DEFAULT NULL,
  `cap` decimal(15,2) DEFAULT NULL,
  `strategy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `funds_fund_code_unique` (`fund_code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funds`
--

LOCK TABLES `funds` WRITE;
/*!40000 ALTER TABLE `funds` DISABLE KEYS */;
INSERT INTO `funds` VALUES (1,'TDRF-2024-001','Tax Deed Redemption Fund I','tax-deed-redemption-fund-i',NULL,'Redemption','#10B981','#E6F6F2','12-14%',NULL,'Annualized Net Return','18 months',25000.00,10000000.00,0.00,0,0,0.00,'$10,000,000','$4.2M',42,'#10B981','Low',3,5,'#10B981','active',NULL,'{\"text\":\"Invest in Fund\",\"type\":\"primary\"}','2026-01-26 10:40:10','2026-01-26 10:40:10',NULL,NULL,NULL,NULL,NULL),(2,'AOF-2024-002','Auction Opportunity Fund II','auction-opportunity-fund-ii',NULL,'Auction','#F59E0B','#FFF7ED','15-18%',NULL,'Annualized Net Return','24 months',50000.00,15000000.00,0.00,0,0,0.00,'$15,000,000','$1.5M',10,'#F59E0B','Moderate',3,5,'#F59E0B','active',NULL,'{\"text\":\"Invest in Fund\",\"type\":\"primary\"}','2026-01-26 10:40:10','2026-01-26 10:40:10',NULL,NULL,NULL,NULL,NULL),(3,'REO-2023-005','Strategic REO Growth Fund','strategic-reo-growth-fund',NULL,'REO','#1E3A5F','#EFF6FF','18-22%',NULL,'Annualized Net Return','36 months',100000.00,25000000.00,0.00,0,0,0.00,'$25,000,000','$12.5M',50,'#10B981','Aggressive',5,5,'#DC2626','active',NULL,'{\"text\":\"Invest in Fund\",\"type\":\"primary\"}','2026-01-26 10:40:10','2026-01-26 10:40:10',NULL,NULL,NULL,NULL,NULL),(4,'DYF-2024-004','Diversified Yield Fund IV','diversified-yield-fund-iv',NULL,'Blended','#7C3AED','#F5F3FF','10-12%',NULL,'Annualized Net Return','12 months',10000.00,5000000.00,0.00,0,0,0.00,'$5,000,000','$500k',10,'#F59E0B','Low',3,5,'#10B981','active',NULL,'{\"text\":\"Invest in Fund\",\"type\":\"primary\"}','2026-01-26 10:40:10','2026-01-26 10:40:10',NULL,NULL,NULL,NULL,NULL),(5,'TDRF-2023-002','Tax Deed Redemption Fund II','tax-deed-redemption-fund-ii',NULL,'Redemption','#10B981','#E6F6F2',NULL,'13.5%','Annualized Net Return','18 months',25000.00,8000000.00,0.00,0,0,0.00,'$8,000,000','$0',0,'#64748B','Low',2,5,'#10B981','closed',NULL,'{\"text\":\"Closed\",\"type\":\"disabled\"}','2026-01-26 10:40:10','2026-01-26 10:40:10',NULL,NULL,NULL,NULL,NULL),(6,'AOF-2023-001','Auction Opportunity Fund I','auction-opportunity-fund-i',NULL,'Auction','#F59E0B','#FFF7ED',NULL,'16.2%','Annualized Net Return','24 months',50000.00,12000000.00,0.00,0,0,0.00,'$12,000,000','$0',0,'#64748B','Moderate',3,5,'#F59E0B','closed',NULL,'{\"text\":\"Closed\",\"type\":\"disabled\"}','2026-01-26 10:40:10','2026-01-26 10:40:10',NULL,NULL,NULL,NULL,NULL),(7,'PGF1','PCIG Growth Fund I','pcig-growth-fund-i','A high-growth fund focused on distressed assets.',NULL,'#10B981','#E6F6F2','15',NULL,'Annualized Net Return',NULL,25000.00,1000000.00,1000000.00,10000,10000,100.00,NULL,NULL,100,'#10B981','Low',3,5,'#10B981','open','2026-01-27',NULL,'2026-01-27 13:05:36','2026-01-27 13:05:36',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `funds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `investments`
--

DROP TABLE IF EXISTS `investments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `investments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `investment_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `details` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Active',
  `status_color` varchar(255) DEFAULT NULL,
  `status_bg_color` varchar(255) DEFAULT NULL,
  `current_value` varchar(255) NOT NULL,
  `interest` varchar(255) DEFAULT NULL,
  `interest_color` varchar(255) DEFAULT NULL,
  `depreciation` varchar(255) DEFAULT NULL,
  `depreciation_color` varchar(255) DEFAULT NULL,
  `returns` varchar(255) DEFAULT NULL,
  `returns_color` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `property_id` bigint(20) unsigned DEFAULT NULL,
  `shares` int(11) NOT NULL DEFAULT 0,
  `price_per_share` decimal(10,2) NOT NULL DEFAULT 0.00,
  `purchase_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `investments_user_id_foreign` (`user_id`),
  CONSTRAINT `investments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `investments`
--

LOCK TABLES `investments` WRITE;
/*!40000 ALTER TABLE `investments` DISABLE KEYS */;
INSERT INTO `investments` VALUES (1,1,'PCIG-2024-001','1240 Oakwood Ave','Property','Miami-Dade County, FL • FIFA','Active','#10B981','#ECFDF5','$27,500','+12.5%','#10B981',NULL,NULL,NULL,NULL,'2026-01-26 10:40:10','2026-01-26 10:40:10',27500.00,1,0,0.00,NULL),(2,1,'TDRF-2024-001','Tax Deed Redemption Fund I','Fund','Redemption • Target IRR 12-14%','Active','#10B981','#ECFDF5','$52,100',NULL,NULL,NULL,NULL,'+13.2%','#10B981','2026-01-26 10:40:10','2026-01-26 10:40:10',52100.00,NULL,0,0.00,NULL),(3,1,'PCIG-2023-088','782 Maple Drive','Property','Cook County, IL • Barment','Legal','#6366F1','#EEF2FF','$15,000',NULL,NULL,'-2.1%','#EF4444',NULL,NULL,'2026-01-26 10:40:10','2026-01-26 10:40:10',15000.00,4,0,0.00,NULL),(4,7,'INV-QfFF2d32','1240 Oakwood Ave','Equity','Sponsor Investment','active',NULL,NULL,'100000',NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-27 12:41:49','2026-01-27 12:41:49',100000.00,1,1000,100.00,'2025-07-27'),(5,8,'INV-hSMAHEVP','1240 Oakwood Ave','Equity','Initial Investment','active',NULL,NULL,'50000',NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-27 12:41:49','2026-01-27 12:41:49',50000.00,1,500,100.00,'2025-08-27'),(6,7,'INV-soZcEnLX','852 Pine Street','Equity','Sponsor Investment','active',NULL,NULL,'100000',NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-27 12:41:49','2026-01-27 12:41:49',100000.00,2,1000,100.00,'2025-07-27'),(7,8,'INV-1jkV0S4s','852 Pine Street','Equity','Initial Investment','active',NULL,NULL,'50000',NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-27 12:41:49','2026-01-27 12:41:49',50000.00,2,500,100.00,'2025-08-27'),(8,7,'INV-hLaUQgHq','4509 Sunset Blvd','Equity','Sponsor Investment','active',NULL,NULL,'100000',NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-27 12:41:49','2026-01-27 12:41:49',100000.00,3,1000,100.00,'2025-07-27'),(9,8,'INV-Vc5lPSef','4509 Sunset Blvd','Equity','Initial Investment','active',NULL,NULL,'50000',NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-27 12:41:49','2026-01-27 12:41:49',50000.00,3,500,100.00,'2025-08-27'),(10,7,'INV-dP1wUoh5','782 Maple Drive','Equity','Sponsor Investment','active',NULL,NULL,'100000',NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-27 12:41:49','2026-01-27 12:41:49',100000.00,4,1000,100.00,'2025-07-27'),(11,8,'INV-klKfOOZr','782 Maple Drive','Equity','Initial Investment','active',NULL,NULL,'50000',NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-27 12:41:49','2026-01-27 12:41:49',50000.00,4,500,100.00,'2025-08-27'),(12,7,'INV-vapEX1A3','901 Ocean Drive','Equity','Sponsor Investment','active',NULL,NULL,'100000',NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-27 12:41:49','2026-01-27 12:41:49',100000.00,5,1000,100.00,'2025-07-27'),(13,8,'INV-hrShbeKt','901 Ocean Drive','Equity','Initial Investment','active',NULL,NULL,'50000',NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-27 12:41:49','2026-01-27 12:41:49',50000.00,5,500,100.00,'2025-08-27'),(14,1,'INV-69790A2DBF341','Seed Investment','equity',NULL,'active',NULL,NULL,'5000','0',NULL,'0',NULL,'0',NULL,'2026-01-27 13:55:41','2026-01-27 13:55:41',5000.00,2,100,50.00,'2026-01-27'),(15,1,'INV-69790A2DC1EED','Seed Investment','equity',NULL,'active',NULL,NULL,'5000','0',NULL,'0',NULL,'0',NULL,'2026-01-27 13:55:41','2026-01-27 13:55:41',5000.00,3,100,50.00,'2026-01-27'),(16,1,'INV-69790A2DC3CB8','Seed Investment','equity',NULL,'active',NULL,NULL,'5000','0',NULL,'0',NULL,'0',NULL,'2026-01-27 13:55:41','2026-01-27 13:55:41',5000.00,4,100,50.00,'2026-01-27'),(17,1,'INV-69790A2DC7889','Seed Investment','equity',NULL,'active',NULL,NULL,'5000','0',NULL,'0',NULL,'0',NULL,'2026-01-27 13:55:41','2026-01-27 13:55:41',5000.00,5,100,50.00,'2026-01-27');
/*!40000 ALTER TABLE `investments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `investor_documents`
--

DROP TABLE IF EXISTS `investor_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `investor_documents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `type` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `year` int(11) DEFAULT NULL,
  `generated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `investor_documents_user_id_type_index` (`user_id`,`type`),
  KEY `investor_documents_user_id_year_index` (`user_id`,`year`),
  KEY `investor_documents_type_index` (`type`),
  CONSTRAINT `investor_documents_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `investor_documents`
--

LOCK TABLES `investor_documents` WRITE;
/*!40000 ALTER TABLE `investor_documents` DISABLE KEYS */;
INSERT INTO `investor_documents` VALUES (1,1,'K-1','2025 K-1 Form','documents/k1_2025.pdf',2025,'2026-01-22 13:21:31','2026-01-27 13:21:31','2026-01-27 13:21:31'),(2,1,'Statement','Q4 2025 Statement','documents/q4_2025.pdf',2025,'2026-01-17 13:21:31','2026-01-27 13:21:31','2026-01-27 13:21:31'),(3,1,'Contract','Subscription Agreement','documents/sub_agreement.pdf',2025,'2025-12-27 13:21:31','2026-01-27 13:21:31','2026-01-27 13:21:31');
/*!40000 ALTER TABLE `investor_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `investor_invitations`
--

DROP TABLE IF EXISTS `investor_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `investor_invitations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `invited_by` bigint(20) unsigned NOT NULL,
  `invited_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `accepted_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','accepted','expired') NOT NULL DEFAULT 'pending',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `investor_invitations_email_unique` (`email`),
  UNIQUE KEY `investor_invitations_token_unique` (`token`),
  KEY `investor_invitations_invited_by_foreign` (`invited_by`),
  CONSTRAINT `investor_invitations_invited_by_foreign` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `investor_invitations`
--

LOCK TABLES `investor_invitations` WRITE;
/*!40000 ALTER TABLE `investor_invitations` DISABLE KEYS */;
/*!40000 ALTER TABLE `investor_invitations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `investor_profiles`
--

DROP TABLE IF EXISTS `investor_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `investor_profiles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `is_accredited` tinyint(1) NOT NULL DEFAULT 0,
  `dob` date DEFAULT NULL,
  `citizenship` varchar(255) DEFAULT NULL,
  `employment_status` varchar(255) DEFAULT NULL,
  `annual_income` varchar(255) DEFAULT NULL,
  `source_of_funds` varchar(255) DEFAULT NULL,
  `routing_number` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `ssn_encrypted` text DEFAULT NULL,
  `bank_account_encrypted` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `investor_profiles_user_id_index` (`user_id`),
  CONSTRAINT `investor_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `investor_profiles`
--

LOCK TABLES `investor_profiles` WRITE;
/*!40000 ALTER TABLE `investor_profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `investor_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `k1_forms`
--

DROP TABLE IF EXISTS `k1_forms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `k1_forms` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `fund_id` bigint(20) unsigned NOT NULL,
  `tax_year` int(11) NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `status` enum('pending','generated','published') NOT NULL DEFAULT 'pending',
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `generated_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `k1_forms_user_id_foreign` (`user_id`),
  KEY `k1_forms_fund_id_foreign` (`fund_id`),
  KEY `k1_forms_generated_by_foreign` (`generated_by`),
  CONSTRAINT `k1_forms_fund_id_foreign` FOREIGN KEY (`fund_id`) REFERENCES `funds` (`id`) ON DELETE CASCADE,
  CONSTRAINT `k1_forms_generated_by_foreign` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `k1_forms_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `k1_forms`
--

LOCK TABLES `k1_forms` WRITE;
/*!40000 ALTER TABLE `k1_forms` DISABLE KEYS */;
INSERT INTO `k1_forms` VALUES (1,1,1,2025,'/storage/k1s/test.pdf','generated',NULL,1,'2026-01-27 05:19:49','2026-01-27 05:19:49',NULL);
/*!40000 ALTER TABLE `k1_forms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kyc_documents`
--

DROP TABLE IF EXISTS `kyc_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kyc_documents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `verification_id` bigint(20) unsigned NOT NULL,
  `type` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `kyc_documents_verification_id_foreign` (`verification_id`),
  CONSTRAINT `kyc_documents_verification_id_foreign` FOREIGN KEY (`verification_id`) REFERENCES `kyc_verifications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kyc_documents`
--

LOCK TABLES `kyc_documents` WRITE;
/*!40000 ALTER TABLE `kyc_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `kyc_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kyc_verifications`
--

DROP TABLE IF EXISTS `kyc_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kyc_verifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `submitted_at` timestamp NULL DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `kyc_verifications_user_id_foreign` (`user_id`),
  CONSTRAINT `kyc_verifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kyc_verifications`
--

LOCK TABLES `kyc_verifications` WRITE;
/*!40000 ALTER TABLE `kyc_verifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `kyc_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lawyer_payoff_requests`
--

DROP TABLE IF EXISTS `lawyer_payoff_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lawyer_payoff_requests` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `lawyer_name` varchar(255) NOT NULL,
  `lawyer_email` varchar(255) NOT NULL,
  `firm_name` varchar(255) DEFAULT NULL,
  `client_name` varchar(255) NOT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `status` enum('pending','quote_generated','approved','rejected') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lawyer_payoff_requests_property_id_foreign` (`property_id`),
  CONSTRAINT `lawyer_payoff_requests_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lawyer_payoff_requests`
--

LOCK TABLES `lawyer_payoff_requests` WRITE;
/*!40000 ALTER TABLE `lawyer_payoff_requests` DISABLE KEYS */;
INSERT INTO `lawyer_payoff_requests` VALUES (1,1,'Robert Law','robert@lawfirm.com','Law Firm LLC','Big Bank',25000.00,'quote_generated',NULL,'2026-01-27 05:37:06','2026-01-27 05:37:06',NULL);
/*!40000 ALTER TABLE `lawyer_payoff_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ledger_entries`
--

DROP TABLE IF EXISTS `ledger_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ledger_entries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `account_id` bigint(20) unsigned NOT NULL,
  `transaction_id` bigint(20) unsigned DEFAULT NULL,
  `debit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `credit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `description` varchar(255) DEFAULT NULL,
  `entry_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ledger_entries_account_id_foreign` (`account_id`),
  KEY `ledger_entries_transaction_id_foreign` (`transaction_id`),
  CONSTRAINT `ledger_entries_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ledger_entries_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ledger_entries`
--

LOCK TABLES `ledger_entries` WRITE;
/*!40000 ALTER TABLE `ledger_entries` DISABLE KEYS */;
INSERT INTO `ledger_entries` VALUES (1,1,NULL,1200.00,0.00,'Rent Payment Received','2026-01-27','2026-01-27 05:19:49','2026-01-27 05:19:49'),(2,5,NULL,0.00,1200.00,'Rent Payment Received','2026-01-27','2026-01-27 05:19:49','2026-01-27 05:19:49');
/*!40000 ALTER TABLE `ledger_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `locations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `state` varchar(255) NOT NULL,
  `county` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `rules` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rules`)),
  `fees` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fees`)),
  `contact_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`contact_info`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'Georgia','Fulton','Fulton','{\"barment_period\":\"365 days\"}','{\"redemption_rate\":\"20%\"}','{\"fips_code\":null,\"time_zone\":\"Eastern Time (US & Canada)\"}','2026-01-27 14:29:53','2026-01-28 07:39:04',NULL),(2,'Georgia','DeKalb','Decatur','{\"barment_period\":\"365 days\"}','{\"redemption_rate\":\"20%\"}','{\"phone\":\"555-0102\"}','2026-01-27 14:29:53','2026-01-27 14:29:53',NULL);
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_01_22_075116_create_personal_access_tokens_table',1),(5,'2026_01_26_153700_create_properties_table',1),(6,'2026_01_26_153701_create_funds_table',1),(7,'2026_01_26_153701_create_transactions_table',1),(8,'2026_01_26_153702_create_investments_table',1),(9,'2026_01_26_155517_create_documents_table',2),(10,'2026_01_26_164102_add_role_type_to_users_table',3),(11,'2026_01_26_171558_create_activity_logs_table',4),(12,'2026_01_26_171558_create_tasks_table',4),(13,'2026_01_26_180656_create_asset_transactions_table',5),(14,'2026_01_26_181900_create_permission_tables',6),(15,'2026_01_26_182125_add_last_login_at_to_users_table',7),(16,'2026_01_27_100939_change_min_investment_to_decimal_in_funds_table',8),(17,'2026_01_24_102000_create_payments_tables',9),(18,'2026_01_24_124000_create_k1_forms_table',10),(19,'2026_01_24_104000_create_ledger_tables',11),(20,'2026_01_24_132000_create_surplus_funds_table',12),(21,'2026_01_24_112000_create_tax_appeals_table',13),(22,'2026_01_24_114000_create_time_entries_table',13),(23,'2026_01_24_130000_create_expenses_tables',13),(24,'2026_01_24_134000_create_notices_tables',13),(25,'2026_01_24_140000_create_efile_cancellations_table',13),(26,'2026_01_25_143222_add_tracking_number_to_notices_table',13),(27,'2026_01_25_145147_add_hearing_date_to_tax_appeals_table',13),(28,'2026_01_25_150029_add_status_to_time_entries_table',13),(29,'2026_01_24_110000_create_payoff_tables',14),(30,'2026_01_27_143056_add_metadata_to_investor_invitations_table',15),(31,'2026_01_27_152745_add_is_accredited_to_investor_profiles_table',16),(32,'2026_01_27_154054_update_investor_profiles_table',17),(33,'2026_01_23_134157_create_share_listings_table',18),(34,'2026_01_23_134157_create_share_transactions_table',19),(35,'2026_01_27_174752_fix_properties_roi_column_type',20),(36,'2026_01_23_112123_create_property_images_table',21),(37,'2026_01_23_150927_create_investor_documents_table',22),(38,'2026_01_23_112136_create_property_documents_table',23),(39,'2026_01_24_170000_create_locations_table',24),(40,'2026_01_24_154000_create_settings_table',25),(42,'2026_01_24_142000_create_templates_table',26),(43,'2026_01_24_122000_create_depreciations_table',27),(44,'2026_01_29_145507_add_photo_path_to_investor_profiles_table',28),(45,'2026_01_23_103118_create_telescope_entries_table',29),(46,'2026_01_29_135728_create_system_notifications_table',30),(47,'2026_01_23_142423_create_f_i_f_a_import_errors_table',31),(48,'2026_01_29_185149_add_fifa_import_id_to_properties_table',32);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model_has_permissions`
--

DROP TABLE IF EXISTS `model_has_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) unsigned NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_has_permissions`
--

LOCK TABLES `model_has_permissions` WRITE;
/*!40000 ALTER TABLE `model_has_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `model_has_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model_has_roles`
--

DROP TABLE IF EXISTS `model_has_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) unsigned NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_has_roles`
--

LOCK TABLES `model_has_roles` WRITE;
/*!40000 ALTER TABLE `model_has_roles` DISABLE KEYS */;
INSERT INTO `model_has_roles` VALUES (1,'App\\Models\\User',5),(1,'App\\Models\\User',7),(2,'App\\Models\\User',1),(2,'App\\Models\\User',8),(2,'App\\Models\\User',9),(2,'App\\Models\\User',10),(2,'App\\Models\\User',11),(2,'App\\Models\\User',12),(2,'App\\Models\\User',13),(2,'App\\Models\\User',14),(2,'App\\Models\\User',15);
/*!40000 ALTER TABLE `model_has_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notice_templates`
--

DROP TABLE IF EXISTS `notice_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notice_templates` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notice_templates`
--

LOCK TABLES `notice_templates` WRITE;
/*!40000 ALTER TABLE `notice_templates` DISABLE KEYS */;
INSERT INTO `notice_templates` VALUES (1,'Default Notice','Dear {{recipient_name}}, this is a notice regarding {{property_address}}.','2026-01-27 05:30:45','2026-01-27 05:30:45',NULL);
/*!40000 ALTER TABLE `notice_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notices`
--

DROP TABLE IF EXISTS `notices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notices` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `template_id` bigint(20) unsigned NOT NULL,
  `recipient_name` varchar(255) NOT NULL,
  `recipient_address` varchar(255) NOT NULL,
  `sent_date` date DEFAULT NULL,
  `status` enum('draft','generated','sent','delivered','failed') NOT NULL DEFAULT 'draft',
  `tracking_number` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notices_property_id_foreign` (`property_id`),
  KEY `notices_template_id_foreign` (`template_id`),
  KEY `notices_created_by_foreign` (`created_by`),
  CONSTRAINT `notices_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `notices_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notices_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `notice_templates` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notices`
--

LOCK TABLES `notices` WRITE;
/*!40000 ALTER TABLE `notices` DISABLE KEYS */;
INSERT INTO `notices` VALUES (1,1,1,'John Doe','456 Elm St','2026-01-26','sent','TRACK123',NULL,1,'2026-01-27 05:30:45','2026-01-27 05:30:45',NULL);
/*!40000 ALTER TABLE `notices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_preferences`
--

DROP TABLE IF EXISTS `notification_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_preferences` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `channel` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `notification_preferences_user_id_channel_type_unique` (`user_id`,`channel`,`type`),
  CONSTRAINT `notification_preferences_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_preferences`
--

LOCK TABLES `notification_preferences` WRITE;
/*!40000 ALTER TABLE `notification_preferences` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) unsigned NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parcel_documents`
--

DROP TABLE IF EXISTS `parcel_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parcel_documents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `parcel_research_id` bigint(20) unsigned NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `uploaded_by` bigint(20) unsigned NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parcel_documents_parcel_research_id_foreign` (`parcel_research_id`),
  KEY `parcel_documents_uploaded_by_foreign` (`uploaded_by`),
  CONSTRAINT `parcel_documents_parcel_research_id_foreign` FOREIGN KEY (`parcel_research_id`) REFERENCES `parcel_research` (`id`) ON DELETE CASCADE,
  CONSTRAINT `parcel_documents_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parcel_documents`
--

LOCK TABLES `parcel_documents` WRITE;
/*!40000 ALTER TABLE `parcel_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `parcel_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parcel_interactions`
--

DROP TABLE IF EXISTS `parcel_interactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parcel_interactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `parcel_research_id` bigint(20) unsigned NOT NULL,
  `type` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parcel_interactions_parcel_research_id_foreign` (`parcel_research_id`),
  KEY `parcel_interactions_user_id_foreign` (`user_id`),
  CONSTRAINT `parcel_interactions_parcel_research_id_foreign` FOREIGN KEY (`parcel_research_id`) REFERENCES `parcel_research` (`id`) ON DELETE CASCADE,
  CONSTRAINT `parcel_interactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parcel_interactions`
--

LOCK TABLES `parcel_interactions` WRITE;
/*!40000 ALTER TABLE `parcel_interactions` DISABLE KEYS */;
INSERT INTO `parcel_interactions` VALUES (1,1,'Test Call','Test interaction',1,'2026-01-29 15:03:28','2026-01-29 15:03:28');
/*!40000 ALTER TABLE `parcel_interactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parcel_research`
--

DROP TABLE IF EXISTS `parcel_research`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parcel_research` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `parcel_id` varchar(255) NOT NULL,
  `county` varchar(255) DEFAULT NULL,
  `research_notes` text DEFAULT NULL,
  `researched_by` bigint(20) unsigned NOT NULL,
  `researched_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `owner_phone` varchar(255) DEFAULT NULL,
  `owner_email` varchar(255) DEFAULT NULL,
  `mailing_address` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'New',
  PRIMARY KEY (`id`),
  KEY `parcel_research_researched_by_foreign` (`researched_by`),
  KEY `parcel_research_parcel_id_index` (`parcel_id`),
  CONSTRAINT `parcel_research_researched_by_foreign` FOREIGN KEY (`researched_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parcel_research`
--

LOCK TABLES `parcel_research` WRITE;
/*!40000 ALTER TABLE `parcel_research` DISABLE KEYS */;
INSERT INTO `parcel_research` VALUES (1,'TEST-001','Test County',NULL,1,'2026-01-29 20:03:28','2026-01-29 15:03:28','2026-01-29 15:03:28','Test Owner',NULL,NULL,NULL,'New');
/*!40000 ALTER TABLE `parcel_research` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_batches`
--

DROP TABLE IF EXISTS `payment_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_batches` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `total_amount` decimal(15,2) NOT NULL,
  `payment_count` int(11) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_batches`
--

LOCK TABLES `payment_batches` WRITE;
/*!40000 ALTER TABLE `payment_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `batch_id` bigint(20) unsigned DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `type` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `payment_method` varchar(255) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_user_id_foreign` (`user_id`),
  KEY `payments_batch_id_foreign` (`batch_id`),
  CONSTRAINT `payments_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `payment_batches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,NULL,1000.00,'incoming','completed','wire','2026-01-27 05:15:04','2026-01-27 05:15:04','2026-01-27 05:15:04'),(2,1,NULL,500.50,'outgoing','pending','ach',NULL,'2026-01-27 05:15:05','2026-01-27 05:15:05'),(3,1,NULL,250.00,'incoming','failed','check',NULL,'2026-01-27 05:15:05','2026-01-27 05:15:05');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payoff_requests`
--

DROP TABLE IF EXISTS `payoff_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payoff_requests` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `requester_name` varchar(255) NOT NULL,
  `requester_email` varchar(255) NOT NULL,
  `requester_phone` varchar(255) DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `status` enum('pending','processing','approved','rejected','completed') NOT NULL DEFAULT 'pending',
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payoff_requests_property_id_foreign` (`property_id`),
  CONSTRAINT `payoff_requests_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payoff_requests`
--

LOCK TABLES `payoff_requests` WRITE;
/*!40000 ALTER TABLE `payoff_requests` DISABLE KEYS */;
INSERT INTO `payoff_requests` VALUES (1,1,'Jane Smith','jane@example.com','555-1234',15000.00,'pending','2026-01-27 05:37:06',NULL,'2026-01-27 05:37:06','2026-01-27 05:37:06',NULL);
/*!40000 ALTER TABLE `payoff_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',5,'api_token','0d2d4e95957db99964c4d8fd46bfa7a9c1f43f9890e936f05798950a1c3fd6f1','[\"*\"]',NULL,NULL,'2026-01-26 13:20:42','2026-01-26 13:20:42'),(2,'App\\Models\\User',5,'api_token','6d26d379df7b87dfb1a662890358b9faef60a7b83d552b743e637d55c678af30','[\"*\"]','2026-01-26 13:37:46',NULL,'2026-01-26 13:23:27','2026-01-26 13:37:46'),(3,'App\\Models\\User',6,'auth-token','c7708ef998023c6951190364f839bff92d78d4d6cfa1e61766debf4587bf5ee5','[\"*\"]',NULL,NULL,'2026-01-26 13:50:11','2026-01-26 13:50:11'),(4,'App\\Models\\User',6,'auth-token','ff5a4822674bb93500edb428008f3f904f37c01c5d15a9ae4290f58af2c4cf82','[\"*\"]',NULL,NULL,'2026-01-26 13:53:36','2026-01-26 13:53:36'),(5,'App\\Models\\User',6,'auth-token','702de5eae4a12f12b0f9ae31b2b4d8d0c12e15fd835839877fce6000841a19aa','[\"*\"]',NULL,NULL,'2026-01-26 13:54:06','2026-01-26 13:54:06'),(6,'App\\Models\\User',6,'auth-token','52591130764b5bd2ab35a231ed5e7d5ac10a52c5686a47ccd9c668ae33f7cb33','[\"*\"]',NULL,NULL,'2026-01-26 13:59:50','2026-01-26 13:59:50'),(7,'App\\Models\\User',6,'auth-token','874498da91f2486723e6df9509b35c11e002bcbb6734ce64eb4eddcb5bee3830','[\"*\"]',NULL,NULL,'2026-01-26 14:00:10','2026-01-26 14:00:10'),(8,'App\\Models\\User',6,'auth-token','a0c71777155de4f6553fc384d8519542d760d9ba4eb6e5f147b7df68a58c751b','[\"*\"]',NULL,NULL,'2026-01-26 14:32:14','2026-01-26 14:32:14'),(9,'App\\Models\\User',1,'auth_token','bf5e862e97c8c4e58578453b4ced55d4ae445c44b823cd14ce4ac25ffe89c571','[\"*\"]',NULL,NULL,'2026-01-27 01:03:49','2026-01-27 01:03:49'),(10,'App\\Models\\User',5,'admin_auth_token','63a53b3b4cebf4257335ffdce59683ebf8b3cb43b1c4de56b21954a79e8e43ad','[\"*\"]',NULL,NULL,'2026-01-27 01:03:51','2026-01-27 01:03:51'),(11,'App\\Models\\User',5,'admin_auth_token','7f4cb320b25e34b6984656f702556724ef03ece999835c5165fff95f37b8c90e','[\"*\"]','2026-01-27 01:06:44',NULL,'2026-01-27 01:06:40','2026-01-27 01:06:44'),(12,'App\\Models\\User',1,'auth_token','e4753041edd52ba108d6a36299aba1de80ba6956a4a829131299c559ea1e7bc0','[\"*\"]','2026-01-27 01:21:44',NULL,'2026-01-27 01:07:19','2026-01-27 01:21:44'),(13,'App\\Models\\User',5,'admin_auth_token','6cb434c53d8fed5f53f7d8c7b1e420a8e726829574bf91c2a79546fd67968f74','[\"*\"]','2026-01-27 01:12:04',NULL,'2026-01-27 01:12:03','2026-01-27 01:12:04'),(14,'App\\Models\\User',1,'auth_token','72feeda17c4667758a9667a8ee550049e1ebc57d82782dcc0c8f6037a4f3cfe5','[\"*\"]','2026-01-27 01:12:05',NULL,'2026-01-27 01:12:05','2026-01-27 01:12:05'),(15,'App\\Models\\User',5,'admin_auth_token','cac5966bcb2aa49995023af3b81da500f227442dc654a87401b8f3a873643c24','[\"*\"]','2026-01-27 01:12:36',NULL,'2026-01-27 01:12:35','2026-01-27 01:12:36'),(16,'App\\Models\\User',1,'auth_token','0c55ddac330cae7ee82d3a58ea06316a0ae35ba041e1164ed5288bac19428e47','[\"*\"]','2026-01-27 01:12:38',NULL,'2026-01-27 01:12:37','2026-01-27 01:12:38'),(17,'App\\Models\\User',5,'admin_auth_token','a7f0fb3ce98398a0949ecda5ea3c37ca46690715667c8f2e82ba57a7d5a5d258','[\"*\"]','2026-01-27 01:14:40',NULL,'2026-01-27 01:14:39','2026-01-27 01:14:40'),(18,'App\\Models\\User',1,'auth_token','c4da30a5d6933f0e83421b0a5fe79d25e5df5d0678a2737b01d14b5f84854abe','[\"*\"]','2026-01-27 01:14:42',NULL,'2026-01-27 01:14:41','2026-01-27 01:14:42'),(19,'App\\Models\\User',5,'admin_auth_token','57e74ec1dff814b1e30ea0472cb5d86208b9f9c12fa7eb46d8d1197009639470','[\"*\"]','2026-01-27 01:15:16',NULL,'2026-01-27 01:15:15','2026-01-27 01:15:16'),(20,'App\\Models\\User',1,'auth_token','659864ac267d17c3b6dbe5beac6407f35797c071eb6436f34842ca1aa151f58b','[\"*\"]','2026-01-27 01:15:18',NULL,'2026-01-27 01:15:17','2026-01-27 01:15:18'),(21,'App\\Models\\User',5,'admin_auth_token','55eca8c582daa25d3f12f8014958d296c5c88d272a1eeb12819adb3dc5aba94c','[\"*\"]','2026-01-27 01:16:46',NULL,'2026-01-27 01:16:46','2026-01-27 01:16:46'),(22,'App\\Models\\User',1,'auth_token','f9cd4429bd48aaec6a83f8f3be39678bb939bd443eb93f25f0a6804c59b25fa6','[\"*\"]','2026-01-27 01:16:48',NULL,'2026-01-27 01:16:47','2026-01-27 01:16:48'),(23,'App\\Models\\User',5,'admin_auth_token','031271ac6ce3a041d1516eb41046469cccc7396eb1fc0000176c1d1f6c983e34','[\"*\"]','2026-01-27 01:17:57',NULL,'2026-01-27 01:17:56','2026-01-27 01:17:57'),(24,'App\\Models\\User',1,'auth_token','c5068115b292d54aefd159895a4faa532fd1ff601eb5738e25bc9d6b60612662','[\"*\"]','2026-01-27 01:17:58',NULL,'2026-01-27 01:17:58','2026-01-27 01:17:58'),(25,'App\\Models\\User',5,'admin_auth_token','eeb9f626803f8fe557ef49a28c9df59b1b9beb6b129df43597996f58fa71851c','[\"*\"]','2026-01-27 01:20:16',NULL,'2026-01-27 01:20:15','2026-01-27 01:20:16'),(26,'App\\Models\\User',1,'auth_token','7ec69455797586bede4c40419976a5fe789dc2a56f60c1ba5e176fd2d8980661','[\"*\"]','2026-01-27 01:20:18',NULL,'2026-01-27 01:20:17','2026-01-27 01:20:18'),(27,'App\\Models\\User',1,'auth_token','4c59ef77e915cb4c12739d388af62e93790bf71ab677bc1a93def149a04a8187','[\"*\"]','2026-01-27 01:24:16',NULL,'2026-01-27 01:23:50','2026-01-27 01:24:16'),(28,'App\\Models\\User',5,'admin_auth_token','c915fee96e224ab2f8a99dc22a93f2e4b1a7402cbb29dd84edfd2a1c35a184f7','[\"*\"]','2026-01-27 03:32:55',NULL,'2026-01-27 01:24:37','2026-01-27 03:32:55'),(29,'App\\Models\\User',5,'admin_auth_token','745ec6ec0d90573c19ce2e5b22784148d1bbac9887a188eb1070fd1fb2e84ee4','[\"*\"]','2026-01-27 01:26:41',NULL,'2026-01-27 01:26:34','2026-01-27 01:26:41'),(30,'App\\Models\\User',5,'admin_auth_token','a2121afacfdabdd39253b7a64aaf79e93e5892953ed5e58d8b549738b8afddfb','[\"*\"]','2026-01-27 01:28:22',NULL,'2026-01-27 01:28:16','2026-01-27 01:28:22'),(31,'App\\Models\\User',5,'admin_auth_token','e934a2ba50e410e116c8b408c780efbe2fe035f44dec1b3d5bf18b335e1e8c78','[\"*\"]','2026-01-27 01:29:25',NULL,'2026-01-27 01:29:16','2026-01-27 01:29:25'),(32,'App\\Models\\User',1,'auth_token','d3e384f7179204c4718a2eef1fec5b1bf04cd319133a272f4f268f768031a179','[\"*\"]','2026-01-27 04:54:26',NULL,'2026-01-27 04:54:24','2026-01-27 04:54:26'),(33,'App\\Models\\User',5,'admin_auth_token','77f085e6d579511cd7f382ca54449f17f1b39d96d3bcde01329eacea1bf67426','[\"*\"]','2026-01-27 06:31:46',NULL,'2026-01-27 04:54:49','2026-01-27 06:31:46'),(34,'App\\Models\\User',1,'auth_token','8ae24d46987497d4ecb8f65763f0a34559350b08f1a21a55f366030328c8bd7d','[\"*\"]','2026-01-27 06:32:50',NULL,'2026-01-27 06:32:03','2026-01-27 06:32:50'),(35,'App\\Models\\User',5,'admin_auth_token','3de8f2942a4f37b7a97610790845fdf9d0f249a66dc4593e357b5ad09314a011','[\"*\"]','2026-01-27 11:48:47',NULL,'2026-01-27 08:16:46','2026-01-27 11:48:47'),(37,'App\\Models\\User',5,'admin_auth_token','21c137c241c09c05827010a29202fc5ebbe37bd39914e0ffb3eb36e091a70ae1','[\"*\"]','2026-01-28 01:30:14',NULL,'2026-01-27 13:28:29','2026-01-28 01:30:14'),(38,'App\\Models\\User',5,'test','d4431830b5bd2b3e15c130c18f2c0f4ea802e12b344bf7d61691b2687687d949','[\"*\"]','2026-01-27 14:44:57',NULL,'2026-01-27 14:44:57','2026-01-27 14:44:57'),(39,'App\\Models\\User',16,'auth_token','24ed41e36b11c8f1ce0376ddca76742c1e5a90063c72c1588a63ffdbfe7f3ed8','[\"*\"]',NULL,NULL,'2026-01-28 01:07:38','2026-01-28 01:07:38'),(40,'App\\Models\\User',17,'auth_token','6bcbb3a3ba078c22c43ea005e5cd0ad8c19885ad5d92fce5056a1a26bb10a3a6','[\"*\"]',NULL,NULL,'2026-01-28 01:10:51','2026-01-28 01:10:51'),(41,'App\\Models\\User',18,'auth_token','8a896a02877a0dc6f3555d6d53cfce73880bf5ef759dca657796ad2539b824fe','[\"*\"]',NULL,NULL,'2026-01-28 01:12:16','2026-01-28 01:12:16'),(42,'App\\Models\\User',19,'auth_token','869e742ce32142f555405701cdde2e848e6828a8fb5e0172208e5324b691e171','[\"*\"]','2026-01-28 01:13:05',NULL,'2026-01-28 01:13:04','2026-01-28 01:13:05'),(43,'App\\Models\\User',20,'auth_token','06e7d6bda35fde0a4752c9e15e024a44576d3a747dc438b11a9c9124d1716ea9','[\"*\"]','2026-01-28 01:13:39',NULL,'2026-01-28 01:13:38','2026-01-28 01:13:39'),(44,'App\\Models\\User',21,'auth_token','6d4eb6d8b6ea51e9ecf7a2797e6e577362121d4e30831cf2a4d53f3f715d257d','[\"*\"]','2026-01-28 01:25:29',NULL,'2026-01-28 01:25:28','2026-01-28 01:25:29'),(45,'App\\Models\\User',5,'admin_auth_token','7f107066f88387366145718694ba32d68be29b717b67bd020a420647f3d4d31f','[\"*\"]','2026-01-28 01:29:06',NULL,'2026-01-28 01:29:05','2026-01-28 01:29:06'),(46,'App\\Models\\User',5,'admin_auth_token','b770dcbb5dc8cc79654fe0fccf67d57f07b608f6665799b4c49c72acb185021a','[\"*\"]','2026-01-28 01:34:27',NULL,'2026-01-28 01:34:24','2026-01-28 01:34:27'),(47,'App\\Models\\User',5,'admin_auth_token','59db57d7f0985c2a84cfc0fccfcaff0da231336ddbb2ac5bd3f5b0901c448370','[\"*\"]','2026-01-28 01:35:44',NULL,'2026-01-28 01:35:40','2026-01-28 01:35:44'),(48,'App\\Models\\User',5,'admin_auth_token','60c8c3953503827bf0e10f080257d3f8e00af6c9cf32214202d7350fa4dfbcf9','[\"*\"]','2026-01-28 01:36:23',NULL,'2026-01-28 01:36:20','2026-01-28 01:36:23'),(49,'App\\Models\\User',22,'auth_token','5456034f59587e895eb798bcc11f43397dc9d991e2d6f06294167fd89926936a','[\"*\"]','2026-01-28 02:20:01',NULL,'2026-01-28 02:20:01','2026-01-28 02:20:01'),(50,'App\\Models\\User',5,'admin_auth_token','95f05d48b4b5254eb54077c1c9ac3c8a859e051021e19a118496559fcb1a0ffc','[\"*\"]','2026-01-28 02:42:21',NULL,'2026-01-28 02:31:09','2026-01-28 02:42:21'),(52,'App\\Models\\User',7,'admin_auth_token','392538e5dd186118f41785d527fce80e5978c38e1d6fa8996ccf9c3f1299dba3','[\"*\"]',NULL,NULL,'2026-01-28 03:19:40','2026-01-28 03:19:40'),(53,'App\\Models\\User',7,'admin_auth_token','2e4e999f4568c696f204aaf7a12ff308bc27b0cf410bc20c6c420395341a56aa','[\"*\"]','2026-01-28 03:20:50',NULL,'2026-01-28 03:20:50','2026-01-28 03:20:50'),(54,'App\\Models\\User',7,'admin_auth_token','3aeedfb7f2cc2b3dfb24fb04f51029875aabc2256013d8fc12eece945e3d99ab','[\"*\"]','2026-01-28 03:21:41',NULL,'2026-01-28 03:21:41','2026-01-28 03:21:41'),(55,'App\\Models\\User',7,'admin_auth_token','4767debd0460f4fd0e49141e82888b678cc2172e79e486735774d2988f3ee4df','[\"*\"]','2026-01-28 03:23:54',NULL,'2026-01-28 03:23:54','2026-01-28 03:23:54'),(56,'App\\Models\\User',7,'admin_auth_token','64b89a458a3ed87c9295f49742e2e5c6e198a6d76836c4a6ad3a9ace4abebe74','[\"*\"]','2026-01-28 03:24:25',NULL,'2026-01-28 03:24:24','2026-01-28 03:24:25'),(57,'App\\Models\\User',7,'admin_auth_token','afa1fbf80b305fc3a12309304612c1ab98b97cee30ec38abe111c7ae46fc8e61','[\"*\"]','2026-01-28 03:25:06',NULL,'2026-01-28 03:25:06','2026-01-28 03:25:06'),(58,'App\\Models\\User',7,'admin_auth_token','3b23ab2fd2dfd76cf25772bc5781f0c0ca34872052f19473b6e348d8a54493f9','[\"*\"]','2026-01-28 03:25:50',NULL,'2026-01-28 03:25:50','2026-01-28 03:25:50'),(59,'App\\Models\\User',7,'admin_auth_token','bcc8f4920bc90892316e4d9b90912339e249c5e71b9d3ef7899a6607f2e53a46','[\"*\"]','2026-01-28 03:26:22',NULL,'2026-01-28 03:26:22','2026-01-28 03:26:22'),(60,'App\\Models\\User',7,'admin_auth_token','89045a34ad53c49bba322f3be992b6c4bce19d859382878e9f314fccb7df476b','[\"*\"]','2026-01-28 03:29:17',NULL,'2026-01-28 03:29:17','2026-01-28 03:29:17'),(61,'App\\Models\\User',7,'admin_auth_token','1c37664348eb0f0f72771c6e3a882ae53ad8a932d951cf2c819032f55cbdcba8','[\"*\"]','2026-01-28 03:34:01',NULL,'2026-01-28 03:34:01','2026-01-28 03:34:01'),(62,'App\\Models\\User',7,'admin_auth_token','87cffb21994de25c4bdf392ed25d36a5d2bd5b5ee8db2f2f113002692d31c680','[\"*\"]','2026-01-28 03:36:14',NULL,'2026-01-28 03:36:14','2026-01-28 03:36:14'),(63,'App\\Models\\User',7,'auth_token','5c6ceda1d0e64f498f923d6bc810a58da91f97cc50a428c6e2a324a6caa29a80','[\"*\"]','2026-01-28 03:47:03',NULL,'2026-01-28 03:47:02','2026-01-28 03:47:03'),(64,'App\\Models\\User',7,'auth_token','22b5cce99602f86ea52bdb9a653adbaed4b6b44592b5821646adefb2ebdb1518','[\"*\"]','2026-01-28 03:47:44',NULL,'2026-01-28 03:47:43','2026-01-28 03:47:44'),(65,'App\\Models\\User',1,'auth_token','647120b82b5a7c41dc6f3c184956e16907b57b7567fdfa255e4626c8bb1c7687','[\"*\"]','2026-01-29 04:52:06',NULL,'2026-01-28 09:48:24','2026-01-29 04:52:06'),(66,'App\\Models\\User',1,'auth_token','bb5dd3a817de6d9335a0cae7f0b49d8d5dd284f9ce268adbcfe0e2732f69ea94','[\"*\"]','2026-01-29 10:11:53',NULL,'2026-01-29 04:54:02','2026-01-29 10:11:53'),(67,'App\\Models\\User',1,'auth_token','30e6a85c5f019b4f822cdd17dead0355c6b8a0216438fbed719cdbaefd6daf94','[\"*\"]','2026-01-29 05:08:51',NULL,'2026-01-29 05:08:51','2026-01-29 05:08:51'),(68,'App\\Models\\User',1,'auth_token','5cdb4dae04ed31b985f1183d635b99a78e632d2fced13c964835937388fd5dab','[\"*\"]',NULL,NULL,'2026-01-29 12:32:38','2026-01-29 12:32:38'),(69,'App\\Models\\User',1,'auth_token','3cb524d1b19f78dc5e846960b84349972391dfc0883942a9e232da936bf1674e','[\"*\"]','2026-01-29 12:45:55',NULL,'2026-01-29 12:33:37','2026-01-29 12:45:55'),(71,'App\\Models\\User',5,'admin_auth_token','6f37364cf40257a52e24ddbd89b80c0a043116f5012ddad50cfcc98227fe306b','[\"*\"]','2026-01-29 16:41:43',NULL,'2026-01-29 12:49:16','2026-01-29 16:41:43'),(72,'App\\Models\\User',5,'admin_auth_token','28102c79f181f422fc4e09e3688e9f22608a1e7cbfa98d55a287a61bb6adf623','[\"*\"]','2026-01-30 01:36:01',NULL,'2026-01-30 01:34:51','2026-01-30 01:36:01');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `properties` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `fifa_import_id` bigint(20) unsigned DEFAULT NULL,
  `property_code` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `tag` varchar(255) DEFAULT NULL,
  `tag_color` varchar(255) NOT NULL DEFAULT '#1E3A5F',
  `deadline` varchar(255) DEFAULT NULL,
  `deadline_color` varchar(255) NOT NULL DEFAULT '#10B981',
  `interest_rate` varchar(255) DEFAULT NULL,
  `payoff_today` varchar(255) DEFAULT NULL,
  `min_invest` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `status_label` varchar(255) DEFAULT NULL,
  `process_stage` varchar(255) DEFAULT NULL,
  `legal_cost` varchar(255) DEFAULT NULL,
  `est_value` varchar(255) DEFAULT NULL,
  `hold_value` varchar(255) DEFAULT NULL,
  `resolution` varchar(255) DEFAULT NULL,
  `redeemed_on` varchar(255) DEFAULT NULL,
  `roi` decimal(5,2) DEFAULT NULL,
  `final_payoff` varchar(255) DEFAULT NULL,
  `duration` varchar(255) DEFAULT NULL,
  `buttons` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`buttons`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `current_value` decimal(15,2) NOT NULL DEFAULT 0.00,
  `purchase_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `workflow_stage` varchar(255) DEFAULT NULL,
  `parcel_id` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `county` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `zip_code` varchar(255) DEFAULT NULL,
  `total_shares` int(11) NOT NULL DEFAULT 100,
  `available_shares` int(11) NOT NULL DEFAULT 0,
  `price_per_share` decimal(10,2) NOT NULL DEFAULT 0.00,
  `purchase_date` date DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `owner` varchar(255) DEFAULT NULL,
  `assigned_user_id` bigint(20) unsigned DEFAULT NULL,
  `tax_year` year(4) DEFAULT NULL,
  `sheriff_file_number` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `properties_property_code_unique` (`property_code`),
  KEY `properties_fifa_import_id_foreign` (`fifa_import_id`),
  CONSTRAINT `properties_fifa_import_id_foreign` FOREIGN KEY (`fifa_import_id`) REFERENCES `fifa_imports` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES (1,NULL,'PCIG-2024-001','1240 Oakwood Ave','Miami-Dade County, FL','FIFA','#1E3A5F','45 days','#10B981','12.5%','$125,000','$5,000','active',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[{\"text\":\"Details\",\"type\":\"outline\"},{\"text\":\"Invest\",\"type\":\"primary\"}]','2026-01-26 10:40:10','2026-01-29 16:13:43',0.00,0.00,'sheriff','PCIG-2024-001','Miami-Dade County',NULL,'FL','',1000,100,0.00,NULL,NULL,NULL,NULL,NULL,NULL),(2,NULL,'PCIG-2024-045','852 Pine Street','Harris County, TX','Auction','#F59E0B','12 days','#DC2626','10.5%','$82,400','$2,500','active',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[{\"text\":\"Details\",\"type\":\"outline\"},{\"text\":\"Invest\",\"type\":\"primary\"}]','2026-01-26 10:40:10','2026-01-29 16:13:43',0.00,0.00,'sheriff','PCIG-2024-045','Harris County',NULL,'TX','',1000,100,0.00,NULL,NULL,NULL,NULL,NULL,NULL),(3,NULL,'PCIG-2023-112','4509 Sunset Blvd','Los Angeles County, CA','Redeemed','#10B981',NULL,'#10B981',NULL,NULL,NULL,'redeemed',NULL,NULL,NULL,NULL,NULL,NULL,'Oct 20, 2024',18.40,'$142,500','14 mos','[{\"text\":\"View ROI\",\"type\":\"outline\"},{\"text\":\"Re-Invest\",\"type\":\"primary\"}]','2026-01-26 10:40:10','2026-01-29 16:13:43',0.00,0.00,'sheriff','PCIG-2023-112','Los Angeles County',NULL,'CA','',1000,100,0.00,NULL,NULL,NULL,NULL,NULL,NULL),(4,NULL,'PCIG-2023-088','782 Maple Drive','Cook County, IL','Barment','#6366F1',NULL,'#10B981',NULL,NULL,NULL,'barment','Legal Process','Stage 2/4','$1,200','$210,000',NULL,NULL,NULL,NULL,NULL,NULL,'[{\"text\":\"Legal Updates\",\"type\":\"outline\"},{\"text\":\"Documents\",\"type\":\"secondary\"}]','2026-01-26 10:40:10','2026-01-29 16:13:43',210000.00,0.00,'sheriff','PCIG-2023-088','Cook County',NULL,'IL','',100,0,0.00,NULL,NULL,NULL,NULL,NULL,NULL),(5,NULL,'PCIG-2022-015','901 Ocean Drive','Broward County, FL','REO','#8B5CF6',NULL,'#10B981',NULL,NULL,NULL,'reo','Asset Mgmt',NULL,NULL,'$485,000','$450,000','For Sale',NULL,NULL,NULL,NULL,'[{\"text\":\"Listing\",\"type\":\"outline\"},{\"text\":\"Photos\",\"type\":\"secondary\"}]','2026-01-26 10:40:10','2026-01-29 16:13:43',485000.00,0.00,'sheriff','PCIG-2022-015','Broward County',NULL,'FL','',100,0,0.00,NULL,NULL,NULL,NULL,NULL,NULL),(6,13,'11-222-33','101 Pine St','Atlanta, GA',NULL,'#1E3A5F',NULL,'#10B981',NULL,NULL,NULL,'pending_review',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'2026-01-29 13:50:41','2026-01-30 01:35:45',150000.00,100000.00,'fifa_processing','11-222-33','Atlanta','Fulton','GA','30303',0,0,0.00,NULL,NULL,NULL,NULL,NULL,NULL),(7,13,'44-555-66','202 Cedar Ln','Decatur, GA',NULL,'#1E3A5F',NULL,'#10B981',NULL,NULL,NULL,'pending_review',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'2026-01-29 13:50:41','2026-01-30 01:35:45',175000.00,125000.00,'fifa_processing','44-555-66','Decatur','DeKalb','GA','30030',0,0,0.00,NULL,NULL,NULL,NULL,NULL,NULL),(8,13,'77-888-99','303 Birch Blvd','Marietta, GA',NULL,'#1E3A5F',NULL,'#10B981',NULL,NULL,NULL,'pending_review',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'2026-01-29 13:50:41','2026-01-30 01:35:45',190000.00,140000.00,'fifa_processing','77-888-99','Marietta','Cobb','GA','30060',0,0,0.00,NULL,NULL,NULL,NULL,NULL,NULL),(9,13,'AA-BBB-CC','404 Elm Way','Alpharetta, GA',NULL,'#1E3A5F',NULL,'#10B981',NULL,NULL,NULL,'pending_review',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'2026-01-29 13:50:41','2026-01-30 01:35:45',320000.00,250000.00,'fifa_processing','AA-BBB-CC','Alpharetta','Fulton','GA','30009',0,0,0.00,NULL,NULL,NULL,NULL,NULL,NULL),(10,13,'XX-YYY-ZZ','505 Oak Dr','Roswell, GA',NULL,'#1E3A5F',NULL,'#10B981',NULL,NULL,NULL,'pending_review',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'2026-01-29 13:50:41','2026-01-30 01:35:45',280000.00,210000.00,'fifa_processing','XX-YYY-ZZ','Roswell','Fulton','GA','30075',0,0,0.00,NULL,NULL,NULL,NULL,NULL,NULL),(12,12,'123-456-789','123 Main St','Atlanta, GA',NULL,'#1E3A5F',NULL,'#10B981',NULL,NULL,NULL,'pending_review',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'2026-01-29 14:37:05','2026-01-29 14:37:05',250000.00,15000.00,'fifa_processing','123-456-789','Atlanta','Fulton','GA','30301',0,0,0.00,NULL,NULL,NULL,NULL,NULL,NULL),(13,12,'987-654-321','456 Oak Ave','Decatur, GA',NULL,'#1E3A5F',NULL,'#10B981',NULL,NULL,NULL,'pending_review',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'2026-01-29 14:37:05','2026-01-29 14:37:05',180000.00,12000.00,'fifa_processing','987-654-321','Decatur','DeKalb','GA','30030',0,0,0.00,NULL,NULL,NULL,NULL,NULL,NULL),(14,12,'456-789-123','789 Pine Rd','Marietta, GA',NULL,'#1E3A5F',NULL,'#10B981',NULL,NULL,NULL,'pending_review',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'2026-01-29 14:37:05','2026-01-29 14:37:05',300000.00,20000.00,'fifa_processing','456-789-123','Marietta','Cobb','GA','30060',0,0,0.00,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_documents`
--

DROP TABLE IF EXISTS `property_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `property_documents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `type` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `uploaded_by` bigint(20) unsigned DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `property_documents_uploaded_by_foreign` (`uploaded_by`),
  KEY `property_documents_property_id_type_index` (`property_id`,`type`),
  KEY `property_documents_type_index` (`type`),
  CONSTRAINT `property_documents_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `property_documents_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_documents`
--

LOCK TABLES `property_documents` WRITE;
/*!40000 ALTER TABLE `property_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `property_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_images`
--

DROP TABLE IF EXISTS `property_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `property_images` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `property_images_property_id_order_index` (`property_id`,`order`),
  CONSTRAINT `property_images_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_images`
--

LOCK TABLES `property_images` WRITE;
/*!40000 ALTER TABLE `property_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `property_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiet_title_cases`
--

DROP TABLE IF EXISTS `quiet_title_cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quiet_title_cases` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `filed_date` date DEFAULT NULL,
  `status` enum('pending','filed','in_court','decided','dismissed') NOT NULL DEFAULT 'pending',
  `court_date` date DEFAULT NULL,
  `court_outcome` varchar(255) DEFAULT NULL,
  `attorney_id` bigint(20) unsigned DEFAULT NULL,
  `filing_fee` decimal(8,2) DEFAULT NULL,
  `title_issues` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `quiet_title_cases_attorney_id_foreign` (`attorney_id`),
  KEY `quiet_title_cases_property_id_status_index` (`property_id`,`status`),
  KEY `quiet_title_cases_court_date_index` (`court_date`),
  KEY `quiet_title_cases_status_index` (`status`),
  CONSTRAINT `quiet_title_cases_attorney_id_foreign` FOREIGN KEY (`attorney_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `quiet_title_cases_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiet_title_cases`
--

LOCK TABLES `quiet_title_cases` WRITE;
/*!40000 ALTER TABLE `quiet_title_cases` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiet_title_cases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `redemption_trackings`
--

DROP TABLE IF EXISTS `redemption_trackings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `redemption_trackings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `redemption_deadline` date NOT NULL,
  `status` enum('pending','redeemed','expired') NOT NULL DEFAULT 'pending',
  `redeemed_at` date DEFAULT NULL,
  `redemption_amount` decimal(15,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `redemption_trackings_property_id_status_index` (`property_id`,`status`),
  KEY `redemption_trackings_redemption_deadline_index` (`redemption_deadline`),
  KEY `redemption_trackings_status_index` (`status`),
  CONSTRAINT `redemption_trackings_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `redemption_trackings`
--

LOCK TABLES `redemption_trackings` WRITE;
/*!40000 ALTER TABLE `redemption_trackings` DISABLE KEYS */;
/*!40000 ALTER TABLE `redemption_trackings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rent_payments`
--

DROP TABLE IF EXISTS `rent_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rent_payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `lease_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `paid_date` date DEFAULT NULL,
  `status` enum('paid','pending','late','partial') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rent_payments_lease_id_foreign` (`lease_id`),
  CONSTRAINT `rent_payments_lease_id_foreign` FOREIGN KEY (`lease_id`) REFERENCES `reo_leases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rent_payments`
--

LOCK TABLES `rent_payments` WRITE;
/*!40000 ALTER TABLE `rent_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `rent_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reo_leases`
--

DROP TABLE IF EXISTS `reo_leases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reo_leases` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `tenant_name` varchar(255) NOT NULL,
  `monthly_rent` decimal(10,2) NOT NULL,
  `security_deposit` decimal(10,2) DEFAULT NULL,
  `lease_start` date NOT NULL,
  `lease_end` date NOT NULL,
  `status` enum('active','terminated','expired') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reo_leases_property_id_foreign` (`property_id`),
  CONSTRAINT `reo_leases_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reo_leases`
--

LOCK TABLES `reo_leases` WRITE;
/*!40000 ALTER TABLE `reo_leases` DISABLE KEYS */;
/*!40000 ALTER TABLE `reo_leases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reo_offers`
--

DROP TABLE IF EXISTS `reo_offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reo_offers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `reo_property_id` bigint(20) unsigned NOT NULL,
  `offer_amount` decimal(10,2) NOT NULL,
  `buyer_info` varchar(255) NOT NULL,
  `offer_date` date DEFAULT NULL,
  `status` enum('pending','accepted','rejected','counter') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reo_offers_reo_property_id_foreign` (`reo_property_id`),
  KEY `reo_offers_status_index` (`status`),
  CONSTRAINT `reo_offers_reo_property_id_foreign` FOREIGN KEY (`reo_property_id`) REFERENCES `reo_properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reo_offers`
--

LOCK TABLES `reo_offers` WRITE;
/*!40000 ALTER TABLE `reo_offers` DISABLE KEYS */;
/*!40000 ALTER TABLE `reo_offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reo_properties`
--

DROP TABLE IF EXISTS `reo_properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reo_properties` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `acquisition_date` date DEFAULT NULL,
  `disposition_strategy` enum('sale','lease','hold') NOT NULL DEFAULT 'sale',
  `listed_price` decimal(10,2) DEFAULT NULL,
  `status` enum('marketing','offer_accepted','sold','leased') NOT NULL DEFAULT 'marketing',
  `listing_agent` varchar(255) DEFAULT NULL,
  `listing_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reo_properties_property_id_status_index` (`property_id`,`status`),
  KEY `reo_properties_disposition_strategy_index` (`disposition_strategy`),
  KEY `reo_properties_status_index` (`status`),
  CONSTRAINT `reo_properties_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reo_properties`
--

LOCK TABLES `reo_properties` WRITE;
/*!40000 ALTER TABLE `reo_properties` DISABLE KEYS */;
/*!40000 ALTER TABLE `reo_properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reports` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `parameters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parameters`)),
  `file_path` varchar(255) DEFAULT NULL,
  `generated_by` bigint(20) unsigned NOT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reports_generated_by_foreign` (`generated_by`),
  CONSTRAINT `reports_generated_by_foreign` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_has_permissions`
--

DROP TABLE IF EXISTS `role_has_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) unsigned NOT NULL,
  `role_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`role_id`),
  KEY `role_has_permissions_role_id_foreign` (`role_id`),
  CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_has_permissions`
--

LOCK TABLES `role_has_permissions` WRITE;
/*!40000 ALTER TABLE `role_has_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_has_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','web','2026-01-26 13:19:39','2026-01-26 13:19:39'),(2,'investor','web','2026-01-26 13:19:39','2026-01-26 13:19:39'),(3,'lawyer','web','2026-01-30 01:16:23','2026-01-30 01:16:23'),(4,'property_owner','web','2026-01-30 01:16:23','2026-01-30 01:16:23');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('0r0UURiXw9gHe35pzHDCwQNbXlPIsjMXSKXQRNPh',NULL,NULL,'','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVHNPMlpmNkJiQ3l6WUhlQmpKM3dPek9KUW1BMEpBc05YMmlhSlE1cCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6ODoiaHR0cDovLzoiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1769502632),('5BZPHPFjfpMEWfm8JqL7vhiqlILTofbPMHgqogzj',NULL,NULL,'','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMDVrRHlrZU00ZFBaa1ZYUVpYMHhyWkViOUVSa2tHYUVLQ2JNRU1oZiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6ODoiaHR0cDovLzoiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1769502508),('j1ahKLmgPZDP9uX2kDukE5ljiADguePaoc2JNYmZ',NULL,NULL,'','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVzJMWnd1cDdXVjhUVHJQT0RDRjRHdUJ0MzhsWUtIazZvajlYYldkNCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6ODoiaHR0cDovLzoiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1769502680),('MxxWsuMZ8GLq79Q0j44yOXGP5uE4UwU0hJpUM0pZ',NULL,NULL,'','YTozOntzOjY6Il90b2tlbiI7czo0MDoiWnJhTFFwdEtHZW5qdVllbzU0Y0VWTHVZUEtWdXdxSHNvdHpiakhQSyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6ODoiaHR0cDovLzoiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1769502652),('Wne2emmYJJwNRchdE4ddviTUBsK0osy3DtHRxs27',NULL,NULL,'','YTozOntzOjY6Il90b2tlbiI7czo0MDoibzJuUFJxMkVuOTNZUjNYeFM4d0JOOGFlU3RDOTJwWW5qZ3FuUnA3ayI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6ODoiaHR0cDovLzoiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1769502693);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'string',
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'system_maintenance_mode','0','boolean','Maintenance Mode','2026-01-27 14:29:53','2026-01-27 14:29:53'),(2,'interest_rate_global','12.5','string','Global Interest Rate','2026-01-27 14:29:53','2026-01-27 14:29:53'),(3,'company_name','PCIG','string','Company Name','2026-01-27 14:29:53','2026-01-27 14:29:53');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `share_listings`
--

DROP TABLE IF EXISTS `share_listings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `share_listings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `seller_id` bigint(20) unsigned NOT NULL,
  `property_id` bigint(20) unsigned NOT NULL,
  `shares` int(11) NOT NULL DEFAULT 0,
  `price_per_share` decimal(10,2) NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  `status` enum('active','pending','sold','cancelled') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `share_listings_seller_id_status_index` (`seller_id`,`status`),
  KEY `share_listings_property_id_status_index` (`property_id`,`status`),
  KEY `share_listings_status_index` (`status`),
  CONSTRAINT `share_listings_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `share_listings_seller_id_foreign` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `share_listings`
--

LOCK TABLES `share_listings` WRITE;
/*!40000 ALTER TABLE `share_listings` DISABLE KEYS */;
INSERT INTO `share_listings` VALUES (1,8,1,50,110.00,5500.00,'active','Great investment opportunity!','2026-01-27 12:42:54','2026-01-27 12:42:54'),(2,8,2,50,110.00,5500.00,'active','Great investment opportunity!','2026-01-27 12:42:54','2026-01-27 12:42:54'),(3,8,3,50,110.00,5500.00,'active','Great investment opportunity!','2026-01-27 12:42:54','2026-01-27 12:42:54'),(4,8,1,20,105.00,2100.00,'sold',NULL,'2026-01-27 12:42:55','2026-01-27 12:42:55'),(5,1,1,43,48.00,2064.00,'active','Great investment opportunity!','2026-01-27 13:51:39','2026-01-27 13:55:41'),(6,1,1,7,54.00,378.00,'active','Great investment opportunity!','2026-01-27 13:54:59','2026-01-27 13:55:41'),(7,1,1,50,50.00,2500.00,'active','Great investment opportunity!','2026-01-27 13:55:21','2026-01-27 13:55:41'),(8,1,1,32,57.00,1824.00,'active','Great investment opportunity!','2026-01-27 13:55:41','2026-01-27 13:55:41'),(9,1,2,44,46.00,2024.00,'active','Great investment opportunity!','2026-01-27 13:55:41','2026-01-27 13:55:41'),(10,1,3,10,59.00,590.00,'active','Great investment opportunity!','2026-01-27 13:55:41','2026-01-27 13:55:41'),(11,1,4,21,49.00,1029.00,'active','Great investment opportunity!','2026-01-27 13:55:41','2026-01-27 13:55:41'),(12,1,5,8,51.00,408.00,'active','Great investment opportunity!','2026-01-27 13:55:41','2026-01-27 13:55:41'),(13,1,1,31,54.00,1674.00,'active','Great investment opportunity!','2026-01-27 14:12:07','2026-01-27 14:12:07'),(14,1,2,36,47.00,1692.00,'active','Great investment opportunity!','2026-01-27 14:12:07','2026-01-27 14:12:07'),(15,1,3,22,57.00,1254.00,'active','Great investment opportunity!','2026-01-27 14:12:07','2026-01-27 14:12:07'),(16,1,4,48,55.00,2640.00,'active','Great investment opportunity!','2026-01-27 14:12:07','2026-01-27 14:12:07'),(17,1,5,31,55.00,1705.00,'active','Great investment opportunity!','2026-01-27 14:12:07','2026-01-27 14:12:07'),(18,1,1,13,60.00,780.00,'active','Great investment opportunity!','2026-01-27 14:19:21','2026-01-27 14:19:21'),(19,1,2,8,60.00,480.00,'active','Great investment opportunity!','2026-01-27 14:19:21','2026-01-27 14:19:21'),(20,1,3,12,54.00,648.00,'active','Great investment opportunity!','2026-01-27 14:19:21','2026-01-27 14:19:21'),(21,1,4,6,57.00,342.00,'active','Great investment opportunity!','2026-01-27 14:19:21','2026-01-27 14:19:21'),(22,1,5,20,47.00,940.00,'active','Great investment opportunity!','2026-01-27 14:19:21','2026-01-27 14:19:21'),(23,1,1,39,49.00,1911.00,'active','Great investment opportunity!','2026-01-27 23:57:18','2026-01-27 23:57:19'),(24,1,2,20,55.00,1100.00,'active','Great investment opportunity!','2026-01-27 23:57:18','2026-01-27 23:57:19'),(25,1,3,23,56.00,1288.00,'active','Great investment opportunity!','2026-01-27 23:57:18','2026-01-27 23:57:19'),(26,1,4,49,60.00,2940.00,'active','Great investment opportunity!','2026-01-27 23:57:18','2026-01-27 23:57:19'),(27,1,5,20,54.00,1080.00,'active','Great investment opportunity!','2026-01-27 23:57:18','2026-01-27 23:57:19'),(28,1,1,45,50.00,2250.00,'active','Great investment opportunity!','2026-01-28 00:07:19','2026-01-28 00:07:19'),(29,1,2,27,58.00,1566.00,'active','Great investment opportunity!','2026-01-28 00:07:19','2026-01-28 00:07:19'),(30,1,3,21,57.00,1197.00,'active','Great investment opportunity!','2026-01-28 00:07:19','2026-01-28 00:07:19'),(31,1,4,43,57.00,2451.00,'active','Great investment opportunity!','2026-01-28 00:07:19','2026-01-28 00:07:19'),(32,1,5,18,56.00,1008.00,'active','Great investment opportunity!','2026-01-28 00:07:19','2026-01-28 00:07:19'),(33,1,1,9,53.00,477.00,'active','Great investment opportunity!','2026-01-28 00:20:08','2026-01-28 00:20:08'),(34,1,2,31,54.00,1674.00,'active','Great investment opportunity!','2026-01-28 00:20:08','2026-01-28 00:20:08'),(35,1,3,24,50.00,1200.00,'active','Great investment opportunity!','2026-01-28 00:20:08','2026-01-28 00:20:08'),(36,1,4,10,55.00,550.00,'active','Great investment opportunity!','2026-01-28 00:20:08','2026-01-28 00:20:08'),(37,1,5,9,52.00,468.00,'active','Great investment opportunity!','2026-01-28 00:20:08','2026-01-28 00:20:08'),(38,1,1,15,50.00,750.00,'active','Great investment opportunity!','2026-01-28 01:17:38','2026-01-28 01:17:38'),(39,1,2,36,47.00,1692.00,'active','Great investment opportunity!','2026-01-28 01:17:38','2026-01-28 01:17:38'),(40,1,3,45,45.00,2025.00,'active','Great investment opportunity!','2026-01-28 01:17:38','2026-01-28 01:17:38'),(41,1,4,7,56.00,392.00,'active','Great investment opportunity!','2026-01-28 01:17:38','2026-01-28 01:17:38'),(42,1,5,33,46.00,1518.00,'active','Great investment opportunity!','2026-01-28 01:17:38','2026-01-28 01:17:38'),(43,1,1,50,50.00,2500.00,'active','Great investment opportunity!','2026-01-28 01:23:42','2026-01-28 01:23:42'),(44,1,2,46,48.00,2208.00,'active','Great investment opportunity!','2026-01-28 01:23:42','2026-01-28 01:23:42'),(45,1,3,30,54.00,1620.00,'active','Great investment opportunity!','2026-01-28 01:23:42','2026-01-28 01:23:42'),(46,1,4,29,47.00,1363.00,'active','Great investment opportunity!','2026-01-28 01:23:42','2026-01-28 01:23:42'),(47,1,5,37,54.00,1998.00,'active','Great investment opportunity!','2026-01-28 01:23:42','2026-01-28 01:23:42');
/*!40000 ALTER TABLE `share_listings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `share_transactions`
--

DROP TABLE IF EXISTS `share_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `share_transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `listing_id` bigint(20) unsigned NOT NULL,
  `buyer_id` bigint(20) unsigned NOT NULL,
  `seller_id` bigint(20) unsigned NOT NULL,
  `shares` int(11) NOT NULL DEFAULT 0,
  `total_price` decimal(15,2) NOT NULL,
  `transaction_date` date NOT NULL,
  `status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `share_transactions_listing_id_foreign` (`listing_id`),
  KEY `share_transactions_buyer_id_transaction_date_index` (`buyer_id`,`transaction_date`),
  KEY `share_transactions_seller_id_transaction_date_index` (`seller_id`,`transaction_date`),
  KEY `share_transactions_status_index` (`status`),
  CONSTRAINT `share_transactions_buyer_id_foreign` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `share_transactions_listing_id_foreign` FOREIGN KEY (`listing_id`) REFERENCES `share_listings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `share_transactions_seller_id_foreign` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `share_transactions`
--

LOCK TABLES `share_transactions` WRITE;
/*!40000 ALTER TABLE `share_transactions` DISABLE KEYS */;
INSERT INTO `share_transactions` VALUES (1,4,1,8,20,2100.00,'2026-01-22','completed','2026-01-27 12:42:55','2026-01-27 12:42:55');
/*!40000 ALTER TABLE `share_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sheriff_sales`
--

DROP TABLE IF EXISTS `sheriff_sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sheriff_sales` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `sale_date` date DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled','postponed') NOT NULL DEFAULT 'scheduled',
  `winning_bid` decimal(15,2) DEFAULT NULL,
  `winner_info` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sheriff_sales_property_id_status_index` (`property_id`,`status`),
  KEY `sheriff_sales_sale_date_index` (`sale_date`),
  KEY `sheriff_sales_status_index` (`status`),
  CONSTRAINT `sheriff_sales_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sheriff_sales`
--

LOCK TABLES `sheriff_sales` WRITE;
/*!40000 ALTER TABLE `sheriff_sales` DISABLE KEYS */;
INSERT INTO `sheriff_sales` VALUES (1,1,'2026-02-05','scheduled',NULL,NULL,'Test pickup','2026-01-29 16:13:43','2026-01-29 16:13:43'),(2,2,'2026-01-22','completed',5000.00,NULL,NULL,'2026-01-29 16:13:43','2026-01-29 16:13:43');
/*!40000 ALTER TABLE `sheriff_sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `surplus_funds`
--

DROP TABLE IF EXISTS `surplus_funds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `surplus_funds` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `claim_filed_date` date DEFAULT NULL,
  `status` enum('identified','claim_filed','approved','received','denied') NOT NULL DEFAULT 'identified',
  `received_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `surplus_funds_property_id_foreign` (`property_id`),
  KEY `surplus_funds_created_by_foreign` (`created_by`),
  CONSTRAINT `surplus_funds_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `surplus_funds_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `surplus_funds`
--

LOCK TABLES `surplus_funds` WRITE;
/*!40000 ALTER TABLE `surplus_funds` DISABLE KEYS */;
INSERT INTO `surplus_funds` VALUES (1,1,23021.00,NULL,'identified',NULL,'Test surplus fund with status identified',1,'2026-01-27 05:23:41','2026-01-27 05:23:41',NULL),(2,1,2762.00,'2026-01-18','claim_filed',NULL,'Test surplus fund with status claim_filed',1,'2026-01-27 05:23:41','2026-01-27 05:23:41',NULL),(3,1,44388.00,'2026-01-02','approved',NULL,'Test surplus fund with status approved',1,'2026-01-27 05:23:41','2026-01-27 05:23:41',NULL),(4,1,1089.00,'2026-01-19','received','2026-01-27','Test surplus fund with status received',1,'2026-01-27 05:23:41','2026-01-27 05:23:41',NULL),(5,1,36077.00,'2026-01-05','denied',NULL,'Test surplus fund with status denied',1,'2026-01-27 05:23:41','2026-01-27 05:23:41',NULL);
/*!40000 ALTER TABLE `surplus_funds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_notifications`
--

DROP TABLE IF EXISTS `system_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_notifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') NOT NULL DEFAULT 'info',
  `is_public` tinyint(1) NOT NULL DEFAULT 0,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `system_notifications_user_id_foreign` (`user_id`),
  CONSTRAINT `system_notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_notifications`
--

LOCK TABLES `system_notifications` WRITE;
/*!40000 ALTER TABLE `system_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tasks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'General',
  `priority` enum('Urgent','High','Normal') NOT NULL DEFAULT 'Normal',
  `status` varchar(255) NOT NULL DEFAULT 'Pending',
  `due_date` date DEFAULT NULL,
  `assigned_to` varchar(255) DEFAULT NULL,
  `property_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1,'Confirm final payoff amount','Redemption','Urgent','Pending','2026-01-28','Sarah M.',1,'2026-01-26 12:22:05','2026-01-26 12:22:05',NULL),(2,'Schedule physical pickup','Sheriff','High','In Progress','2026-01-29','John D.',2,'2026-01-26 12:22:05','2026-01-26 12:22:05',NULL),(3,'Verify insurance documents','Compliance','Normal','Pending','2026-01-31','Admin',NULL,'2026-01-26 12:22:05','2026-01-26 12:22:05',NULL);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax_appeals`
--

DROP TABLE IF EXISTS `tax_appeals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tax_appeals` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `filed_date` date NOT NULL,
  `hearing_date` date DEFAULT NULL,
  `current_assessment` decimal(15,2) DEFAULT NULL,
  `proposed_assessment` decimal(15,2) DEFAULT NULL,
  `status` enum('pending','filed','in_review','hearing_scheduled','won','lost','settled') NOT NULL DEFAULT 'pending',
  `outcome` varchar(255) DEFAULT NULL,
  `savings` decimal(15,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tax_appeals_property_id_foreign` (`property_id`),
  CONSTRAINT `tax_appeals_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_appeals`
--

LOCK TABLES `tax_appeals` WRITE;
/*!40000 ALTER TABLE `tax_appeals` DISABLE KEYS */;
INSERT INTO `tax_appeals` VALUES (1,1,'2026-01-17','2026-02-16',500000.00,450000.00,'filed',NULL,NULL,NULL,'2026-01-27 05:30:45','2026-01-27 05:30:45',NULL),(2,1,'2026-01-27',NULL,100000.00,80000.00,'hearing_scheduled','Pending Hearing',0.00,'Updated notes','2026-01-27 07:30:44','2026-01-27 07:30:44',NULL);
/*!40000 ALTER TABLE `tax_appeals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telescope_entries`
--

DROP TABLE IF EXISTS `telescope_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `telescope_entries` (
  `sequence` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `batch_id` char(36) NOT NULL,
  `family_hash` varchar(255) DEFAULT NULL,
  `should_display_on_index` tinyint(1) NOT NULL DEFAULT 1,
  `type` varchar(20) NOT NULL,
  `content` longtext NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`sequence`),
  UNIQUE KEY `telescope_entries_uuid_unique` (`uuid`),
  KEY `telescope_entries_batch_id_index` (`batch_id`),
  KEY `telescope_entries_family_hash_index` (`family_hash`),
  KEY `telescope_entries_created_at_index` (`created_at`),
  KEY `telescope_entries_type_should_display_on_index_index` (`type`,`should_display_on_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telescope_entries`
--

LOCK TABLES `telescope_entries` WRITE;
/*!40000 ALTER TABLE `telescope_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `telescope_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telescope_entries_tags`
--

DROP TABLE IF EXISTS `telescope_entries_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `telescope_entries_tags` (
  `entry_uuid` char(36) NOT NULL,
  `tag` varchar(255) NOT NULL,
  PRIMARY KEY (`entry_uuid`,`tag`),
  KEY `telescope_entries_tags_tag_index` (`tag`),
  CONSTRAINT `telescope_entries_tags_entry_uuid_foreign` FOREIGN KEY (`entry_uuid`) REFERENCES `telescope_entries` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telescope_entries_tags`
--

LOCK TABLES `telescope_entries_tags` WRITE;
/*!40000 ALTER TABLE `telescope_entries_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `telescope_entries_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telescope_monitoring`
--

DROP TABLE IF EXISTS `telescope_monitoring`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `telescope_monitoring` (
  `tag` varchar(255) NOT NULL,
  PRIMARY KEY (`tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telescope_monitoring`
--

LOCK TABLES `telescope_monitoring` WRITE;
/*!40000 ALTER TABLE `telescope_monitoring` DISABLE KEYS */;
/*!40000 ALTER TABLE `telescope_monitoring` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `templates`
--

DROP TABLE IF EXISTS `templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `templates` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('notice','contract','letter','email','export','document') NOT NULL DEFAULT 'notice',
  `content` text NOT NULL,
  `variables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variables`)),
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `templates_created_by_foreign` (`created_by`),
  CONSTRAINT `templates_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `templates`
--

LOCK TABLES `templates` WRITE;
/*!40000 ALTER TABLE `templates` DISABLE KEYS */;
INSERT INTO `templates` VALUES (1,'Standard Barment Notice','letter','Dear Owner...','[\"name\",\"address\"]',1,'2026-01-27 14:30:36','2026-01-27 14:30:36',NULL),(2,'Sheriff Sale Export','export','column1,column2','[]',1,'2026-01-27 14:30:36','2026-01-27 14:30:36',NULL);
/*!40000 ALTER TABLE `templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `time_entries`
--

DROP TABLE IF EXISTS `time_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `time_entries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `property_id` bigint(20) unsigned DEFAULT NULL,
  `date` date NOT NULL,
  `hours` decimal(5,2) NOT NULL,
  `description` text DEFAULT NULL,
  `billable` tinyint(1) NOT NULL DEFAULT 1,
  `status` varchar(255) NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `time_entries_user_id_foreign` (`user_id`),
  KEY `time_entries_property_id_foreign` (`property_id`),
  CONSTRAINT `time_entries_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL,
  CONSTRAINT `time_entries_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `time_entries`
--

LOCK TABLES `time_entries` WRITE;
/*!40000 ALTER TABLE `time_entries` DISABLE KEYS */;
INSERT INTO `time_entries` VALUES (1,1,1,'2026-01-27',2.50,'Legal research',1,'Pending','2026-01-27 05:30:45','2026-01-27 05:30:45',NULL);
/*!40000 ALTER TABLE `time_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `transaction_code` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `type` varchar(255) NOT NULL,
  `date` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Completed',
  `description` varchar(255) DEFAULT NULL,
  `property_fund` varchar(255) DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `type_icon` varchar(255) DEFAULT NULL,
  `type_icon_color` varchar(255) DEFAULT NULL,
  `type_icon_bg_color` varchar(255) DEFAULT NULL,
  `amount_color` varchar(255) DEFAULT NULL,
  `status_bg_color` varchar(255) DEFAULT NULL,
  `status_color` varchar(255) DEFAULT NULL,
  `action` varchar(255) NOT NULL DEFAULT 'View',
  `action_color` varchar(255) NOT NULL DEFAULT '#2563EB',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transactions_transaction_code_unique` (`transaction_code`),
  KEY `transactions_user_id_foreign` (`user_id`),
  CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,'TXN-84920',1,'Distribution','Jan 15, 2024, 09:30 AM','1250.00','Completed','Quarterly Distribution - Q4 2023','Tax Deed Redemption Fund I','ACH Transfer','ArrowDownLeft','#10B981','#ECFDF5','#10B981','#ECFDF5','#10B981','View','#2563EB','2026-01-26 10:40:10','2026-01-26 10:40:10'),(2,'TXN-84915',1,'Deposit','Jan 02, 2024, 02:15 PM','25000.00','Completed','Initial Investment Deposit','Wallet Deposit','Wire Transfer','Wallet','#6366F1','#EEF2FF','#10B981','#ECFDF5','#10B981','View','#2563EB','2026-01-26 10:40:10','2026-01-26 10:40:10'),(3,'TXN-84882',1,'Withdrawal','Dec 20, 2023, 11:45 AM','-5000.00','Processing','Withdrawal to Bank Account ending 4452','Wallet Withdrawal','ACH Transfer','ArrowUpRight','#F59E0B','#FFFBEB','#1F2937','#FFF7ED','#C2410C','Track','#F59E0B','2026-01-26 10:40:10','2026-01-26 10:40:10'),(4,'TXN-84850',1,'Reinvestment','Nov 15, 2023, 10:00 AM','12500.00','Completed','Reinvestment into Auction Opportunity Fund II','Auction Opportunity Fund II','Internal Transfer','RefreshCw','#3B82F6','#EFF6FF','#1F2937','#ECFDF5','#10B981','View','#2563EB','2026-01-26 10:40:10','2026-01-26 10:40:10');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `role_type` varchar(255) NOT NULL DEFAULT 'investor',
  `last_login_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Investor User','investor@pcig.com',NULL,'$2y$12$Wcv0KGjopqpl//d./fNdI.smUrzhKn4lJvDcszPXmgvECQ8UYW4ZG',NULL,'2026-01-26 10:40:10','2026-01-29 12:46:22','investor','2026-01-29 12:46:22'),(2,'Michael Ross','michael.r@example.com',NULL,'$2y$12$njpRebcoPbC96kifl8xCsOxaBkZ3haApr3NgaJXxTk.ljogRomXOC',NULL,'2026-01-26 12:19:12','2026-01-26 12:19:12','investor',NULL),(3,'Sarah Johnson','sarah.j@example.com',NULL,'$2y$12$4URGD9ryV.Li2il0D5jvyOFGvcONh.chJEKIi14moACmsge5bYXFy',NULL,'2026-01-26 12:19:12','2026-01-26 12:19:12','investor',NULL),(4,'David Kim','david.k@example.com',NULL,'$2y$12$FD92DYLl824gfd4vPnC4JODRS.gdMIiW5CM5o4wOW2u1zLNo2G9bS',NULL,'2026-01-26 12:19:12','2026-01-26 12:19:12','investor',NULL),(5,'Admin Example','admin@example.com',NULL,'$2y$12$XKjLcV9h/rO.Rg84nu.Bqu/SsvP4VY7MuHe0rN/OLgilizndhmD8S',NULL,'2026-01-26 13:16:27','2026-01-30 01:34:51','admin','2026-01-30 01:34:51'),(6,'Investor User','investor@example.com',NULL,'$2y$12$ddr1stxenA84KKM3NVrdcOHUFZIeCIVCy8e16.JT4mIb.O4egkZ56',NULL,'2026-01-26 13:41:52','2026-01-26 15:02:38','investor',NULL),(7,'Admin User','admin@pcig.com',NULL,'$2y$12$Q/7v/2xQRwgfQkU8GfLnn.USFLf5n7EZSn5WVhxLEwOezy9dpwQM2',NULL,'2026-01-27 12:39:57','2026-01-30 01:18:23','admin','2026-01-28 03:47:43'),(8,'Jane Doe Investor','investor2@pcig.com',NULL,'$2y$12$nlZDyOgd76qH/feMBrFcduRA1HL57iI7hlvt7sy6f2enGwq.9pydi',NULL,'2026-01-27 12:39:58','2026-01-27 12:39:58','investor',NULL),(9,'Test Investor','investor_test_6979a1283f3ec@example.com',NULL,'$2y$12$CFWd/KN7F8hfDBvXZ6WEDeCEEpNoo/qiUOLRm/bhztUp6sj025tde',NULL,'2026-01-28 00:39:52','2026-01-28 00:39:52','investor',NULL),(10,'Test Investor','investor_test_6979a15b19bd0@example.com',NULL,'$2y$12$vpzg3.D8SE.tk2PosPV//uCJ4l61kS7NzoG3ZoS9ZF8DIaDkCwDLC',NULL,'2026-01-28 00:40:43','2026-01-28 00:40:43','investor',NULL),(11,'Test Investor','investor_test_6979a180a4537@example.com',NULL,'$2y$12$yF1J4xiwmPrvLYcwffCgdu78ettnv0ZSAFsjLl8VteP48F1Ch2oUS',NULL,'2026-01-28 00:41:20','2026-01-28 00:41:20','investor',NULL),(12,'Test Investor','investor_test_6979a2674202a@example.com',NULL,'$2y$12$UcjPyD4jE7PMXYunL44Ew.oLDVcaTf6K8KO.ZmFd3U0jQu71gP/fm',NULL,'2026-01-28 00:45:11','2026-01-28 00:45:11','investor',NULL),(13,'Test Investor','investor_test_6979a291cf60e@example.com',NULL,'$2y$12$9j.sb6wSexQ2xYC/yrTpqOuBbN2MEeQKnL75xZDt7soaMsfQCQhPG',NULL,'2026-01-28 00:45:54','2026-01-28 00:45:54','investor',NULL),(14,'Test Investor','investor_test_6979a2aace34f@example.com',NULL,'$2y$12$tK7JLow5WFlOOR1ErcV5Auh3s1PmCQTOFMy0U/L9P8dgkKnJn4eiu',NULL,'2026-01-28 00:46:19','2026-01-28 00:46:19','investor',NULL),(15,'Test Investor','investor_test_6979a2d1b7c0d@example.com',NULL,'$2y$12$4rFJjF8Q9MMz13Ev8FT8deMHqxkf/cg0vROyRKdxIkf1t/6G2Ekxq',NULL,'2026-01-28 00:46:57','2026-01-28 00:46:57','investor',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-30 11:39:07
