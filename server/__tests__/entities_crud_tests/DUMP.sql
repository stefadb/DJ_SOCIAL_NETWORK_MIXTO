-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: mixto
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `album`
--

DROP TABLE IF EXISTS `album`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `album` (
  `id` int NOT NULL,
  `titolo` varchar(100) NOT NULL,
  `data_uscita` date DEFAULT NULL,
  `url_immagine` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `album_genere`
--

DROP TABLE IF EXISTS `album_genere`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `album_genere` (
  `id_album` int NOT NULL,
  `id_genere` int NOT NULL,
  PRIMARY KEY (`id_album`,`id_genere`),
  KEY `id_genere_album_genere_idx` (`id_genere`),
  CONSTRAINT `id_album_album_genere` FOREIGN KEY (`id_album`) REFERENCES `album` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `id_genere_album_genere` FOREIGN KEY (`id_genere`) REFERENCES `genere` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `artista`
--

DROP TABLE IF EXISTS `artista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `artista` (
  `id` int NOT NULL,
  `nome` varchar(45) DEFAULT NULL,
  `url_immagine` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `brano`
--

DROP TABLE IF EXISTS `brano`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brano` (
  `id` bigint unsigned NOT NULL,
  `titolo` varchar(100) NOT NULL,
  `durata` time DEFAULT NULL,
  `id_album` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_album` (`id_album`),
  CONSTRAINT `brano_ibfk_1` FOREIGN KEY (`id_album`) REFERENCES `album` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `brano_artista`
--

DROP TABLE IF EXISTS `brano_artista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brano_artista` (
  `id_brano` bigint unsigned NOT NULL,
  `id_artista` int NOT NULL,
  PRIMARY KEY (`id_brano`,`id_artista`),
  KEY `id_artista` (`id_artista`),
  CONSTRAINT `brano_artista_ibfk_1` FOREIGN KEY (`id_brano`) REFERENCES `brano` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `brano_artista_ibfk_2` FOREIGN KEY (`id_artista`) REFERENCES `artista` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `brano_utente`
--

DROP TABLE IF EXISTS `brano_utente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brano_utente` (
  `id_brano` bigint unsigned NOT NULL,
  `id_utente` int NOT NULL,
  PRIMARY KEY (`id_brano`,`id_utente`),
  KEY `id_utente_brano_utente_idx` (`id_utente`),
  CONSTRAINT `id_brano_brano_utente` FOREIGN KEY (`id_brano`) REFERENCES `brano` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `id_utente_brano_utente` FOREIGN KEY (`id_utente`) REFERENCES `utente` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `commento`
--

DROP TABLE IF EXISTS `commento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `testo` text NOT NULL,
  `data_pubblicazione` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_utente` int DEFAULT NULL,
  `id_passaggio` int NOT NULL,
  `id_commento_padre` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_utente` (`id_utente`),
  KEY `id_passaggio` (`id_passaggio`),
  KEY `id_commento_padre` (`id_commento_padre`),
  CONSTRAINT `commento_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utente` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `commento_ibfk_2` FOREIGN KEY (`id_passaggio`) REFERENCES `passaggio` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `commento_ibfk_3` FOREIGN KEY (`id_commento_padre`) REFERENCES `commento` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `genere`
--

DROP TABLE IF EXISTS `genere`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `genere` (
  `id` int NOT NULL,
  `nome` varchar(50) NOT NULL,
  `url_immagine` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `passaggio`
--

DROP TABLE IF EXISTS `passaggio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passaggio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `testo` text NOT NULL,
  `inizio_secondo_brano` time DEFAULT NULL,
  `cue_secondo_brano` time DEFAULT NULL,
  `data_pubblicazione` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_utente` int DEFAULT NULL,
  `id_brano_1` bigint unsigned DEFAULT NULL,
  `id_brano_2` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_utente` (`id_utente`),
  KEY `id_brano_1` (`id_brano_1`),
  KEY `id_brano_2` (`id_brano_2`),
  CONSTRAINT `passaggio_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utente` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `passaggio_ibfk_2` FOREIGN KEY (`id_brano_1`) REFERENCES `brano` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `passaggio_ibfk_3` FOREIGN KEY (`id_brano_2`) REFERENCES `brano` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `scaletta`
--

DROP TABLE IF EXISTS `scaletta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scaletta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descrizione` text,
  `id_utente` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_utente_scaletta_idx` (`id_utente`),
  CONSTRAINT `id_utente_scaletta` FOREIGN KEY (`id_utente`) REFERENCES `utente` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `scaletta_passaggio`
--

DROP TABLE IF EXISTS `scaletta_passaggio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scaletta_passaggio` (
  `id_scaletta` int NOT NULL,
  `id_passaggio` int NOT NULL,
  `ordine` int DEFAULT NULL,
  PRIMARY KEY (`id_scaletta`,`id_passaggio`),
  KEY `id_passaggio` (`id_passaggio`),
  CONSTRAINT `scaletta_passaggio_ibfk_1` FOREIGN KEY (`id_scaletta`) REFERENCES `scaletta` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `scaletta_passaggio_ibfk_2` FOREIGN KEY (`id_passaggio`) REFERENCES `passaggio` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `utente`
--

DROP TABLE IF EXISTS `utente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `utente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `cognome` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `valutazione`
--

DROP TABLE IF EXISTS `valutazione`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `valutazione` (
  `id` int NOT NULL AUTO_INCREMENT,
  `voto` int DEFAULT NULL,
  `id_utente` int DEFAULT NULL,
  `id_passaggio` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_utente_passaggio` (`id_utente`,`id_passaggio`),
  KEY `id_utente` (`id_utente`),
  KEY `id_passaggio` (`id_passaggio`),
  CONSTRAINT `valutazione_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utente` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `valutazione_ibfk_2` FOREIGN KEY (`id_passaggio`) REFERENCES `passaggio` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `valutazione_chk_1` CHECK (((`voto` >= 1) and (`voto` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `visualizzazione`
--

DROP TABLE IF EXISTS `visualizzazione`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visualizzazione` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data_visualizzazione` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_utente` int DEFAULT NULL,
  `id_passaggio` int NOT NULL,
  PRIMARY KEY (`id`,`data_visualizzazione`),
  KEY `id_utente` (`id_utente`),
  KEY `id_passaggio` (`id_passaggio`),
  CONSTRAINT `visualizzazione_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utente` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `visualizzazione_ibfk_2` FOREIGN KEY (`id_passaggio`) REFERENCES `passaggio` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-26 11:08:19
