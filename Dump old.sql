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
  `id` int NOT NULL AUTO_INCREMENT,
  `titolo` varchar(100) NOT NULL,
  `data_uscita` date DEFAULT NULL,
  `id_genere` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_album_genere` (`id_genere`),
  CONSTRAINT `fk_album_genere` FOREIGN KEY (`id_genere`) REFERENCES `genere` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=811732412 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `album`
--

LOCK TABLES `album` WRITE;
/*!40000 ALTER TABLE `album` DISABLE KEYS */;
INSERT INTO `album` VALUES (13416519,'The Heat EP','2016-07-22',NULL),(14785213,'Soul Patrol EP','2017-01-13',NULL),(15167063,'Music On EP','2017-02-27',NULL),(48178472,'A Glimmer of Hope',NULL,NULL),(62482862,'Ladies Night EP','2017-03-03',NULL),(62547552,'Nighdriver EP','2017-09-29',NULL),(62551572,'Boogie Trippin EP','2018-06-08',NULL),(78526252,'Possitive Mind EP','2018-11-19',NULL),(84196522,'A Glimmer of Hope',NULL,NULL),(100261742,'Reminders, Vol. 5','2019-07-12',NULL),(101574862,'Shades of Grey EP','2019-07-19',NULL),(110449612,'Electro City Moving EP','2019-09-16',NULL),(125089552,'ENDZ032','2020-01-31',NULL),(199007422,'Take A Leap Of Faith','2021-01-25',NULL),(221700932,'Get Together','2021-06-04',NULL),(226310982,'A Glimmer of Hope',NULL,NULL),(249350442,'A Glimmer of Hope EP','2021-09-03',NULL),(275664372,'A Shimmer Of Hope',NULL,NULL),(288989182,'A False Glimmer of Hope',NULL,NULL),(298097512,'Mysteries of the Universe','2022-06-03',NULL),(388853177,'A Glimmer of Hope',NULL,NULL),(412232537,'Sense of Future','2023-08-11',NULL),(418717817,'A Glimmer of Hope',NULL,NULL),(419584427,'Timewriter EP','2020-07-10',NULL),(454433915,'A Glimmer of Hope',NULL,NULL),(465945475,'The Way It Goes (Track 1) (Chris Stussy Remix)','2020-06-19',NULL),(482261455,'A Glimmer Of Hope (For The Small Guy)',NULL,NULL),(486048505,'Midtown Playground EP','2023-10-06',NULL),(499518621,'Creativity EP','2016-02-15',NULL),(499519561,'Brooklyn Tears EP','2017-08-25',NULL),(499519641,'Wanna Dance EP','2017-01-13',NULL),(504321061,'Across Ocean','2020-10-12',NULL),(509679041,'A Glimmer of Hope',NULL,NULL),(535525962,'A Glimmer of Hope',NULL,NULL),(555300392,'A Glimmer Of Hope',NULL,NULL),(558742112,'Synergy','2024-06-07',NULL),(607832002,'A Glimmer Of Hope',NULL,NULL),(614335032,'A Glimmer of Hope',NULL,NULL),(644191151,'A Glimmer of Hope',NULL,NULL),(679310801,'A Glimmer of Hope',NULL,NULL),(697314211,'Cosmic Echoes',NULL,NULL),(707362551,'A glimmer of hope',NULL,NULL),(715400731,'What U Do EP','2019-07-05',NULL),(733645281,'A Glimmer of Hope',NULL,NULL),(782854421,'A Glimmer of Hope',NULL,NULL),(794135621,'A Glimmer of Hope',NULL,NULL),(798272211,'A Glimmer of Hope',NULL,NULL),(808219761,'A glimmer of hope',NULL,NULL),(811732411,'Harmonies Spun from a Glimmer of Hope',NULL,NULL);
/*!40000 ALTER TABLE `album` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `artista`
--

DROP TABLE IF EXISTS `artista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `artista` (
  `id` int NOT NULL,
  `nome` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artista`
--

LOCK TABLES `artista` WRITE;
/*!40000 ALTER TABLE `artista` DISABLE KEYS */;
INSERT INTO `artista` VALUES (3,'Snoop Dogg'),(13,'Eminem'),(35,'Avril Lavigne'),(38,'Akon'),(48,'IAM'),(66,'50 Cent'),(73,'Nas'),(99,'Coolio'),(143,'Dido'),(379,'Trick Trick'),(397,'Obie Trice'),(564,'Rihanna'),(763,'Dr. Dre'),(1222,'Cypress Hill'),(1309,'JAY Z'),(1995,'Sage Francis'),(2353,'Ice Cube'),(3340,'SAIKO'),(13835,'Audion'),(57145,'Ego'),(72660,'Logic'),(74309,'Lil Wayne'),(78998,'Steven Tyler'),(193910,'NKD'),(300395,'SNO'),(358162,'Phil Jay'),(391121,'Aron'),(417645,'D12'),(497273,'Kon'),(984919,'KLAN'),(1425072,'Emin'),(1448773,'2 Face Idibia'),(2816501,'Enmity'),(4395920,'Empire Street'),(4495513,'Travis Scott'),(4691995,'Chris Lorenzo'),(5418689,'Unlike Pluto'),(5478540,'Emine\'m'),(5687128,'Syc'),(5942214,'Joyner Lucas'),(6285126,'Eminem & Xzibit'),(6314986,'Eminem & Skylar Grey'),(7087293,'Potter Payper'),(7211338,'Sakage'),(7699412,'Jonna Fraser'),(8409650,'JID'),(8958166,'Eminem & Adam Levine'),(9822974,'XXXTentacion'),(10100614,'King Iso'),(10182750,'Nehuda'),(10537257,'R3SPAWN'),(11064002,'Enisa'),(13198295,'namesbliss'),(14826773,'Zeamsone'),(51851552,'Sleepy Fish'),(53927042,'Nerveless'),(65626052,'Illegal Zarba'),(113496262,'Seb Wery'),(139882662,'THEUZ ZL'),(165541367,'Tankeflukt'),(173598747,'Eminem & CeeLo Green'),(184875227,'Techno Tazzy'),(212277557,'HARD DEMON'),(216060385,'Elina'),(238676321,'Emily Dawn'),(258560842,'nisuu'),(259202562,'KA$E'),(268175402,'Jelly Roll'),(300936351,'lyam'),(335647671,'Eminem-Gospel');
/*!40000 ALTER TABLE `artista` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brano`
--

DROP TABLE IF EXISTS `brano`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brano` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `titolo` varchar(100) NOT NULL,
  `durata` time DEFAULT NULL,
  `id_album` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_album` (`id_album`),
  CONSTRAINT `brano_ibfk_1` FOREIGN KEY (`id_album`) REFERENCES `album` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1454607363 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brano`
--

LOCK TABLES `brano` WRITE;
/*!40000 ALTER TABLE `brano` DISABLE KEYS */;
INSERT INTO `brano` VALUES (1454607362,'Central Frenzy','00:06:28',249350442);
/*!40000 ALTER TABLE `brano` ENABLE KEYS */;
UNLOCK TABLES;

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
  CONSTRAINT `brano_artista_ibfk_1` FOREIGN KEY (`id_brano`) REFERENCES `brano` (`id`),
  CONSTRAINT `brano_artista_ibfk_2` FOREIGN KEY (`id_artista`) REFERENCES `artista` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brano_artista`
--

LOCK TABLES `brano_artista` WRITE;
/*!40000 ALTER TABLE `brano_artista` DISABLE KEYS */;
/*!40000 ALTER TABLE `brano_artista` ENABLE KEYS */;
UNLOCK TABLES;

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
  `id_passaggio` int DEFAULT NULL,
  `id_commento_padre` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_utente` (`id_utente`),
  KEY `id_passaggio` (`id_passaggio`),
  KEY `id_commento_padre` (`id_commento_padre`),
  CONSTRAINT `commento_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utente` (`id`),
  CONSTRAINT `commento_ibfk_2` FOREIGN KEY (`id_passaggio`) REFERENCES `passaggio` (`id`),
  CONSTRAINT `commento_ibfk_3` FOREIGN KEY (`id_commento_padre`) REFERENCES `commento` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commento`
--

LOCK TABLES `commento` WRITE;
/*!40000 ALTER TABLE `commento` DISABLE KEYS */;
/*!40000 ALTER TABLE `commento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `genere`
--

DROP TABLE IF EXISTS `genere`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `genere` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=476 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genere`
--

LOCK TABLES `genere` WRITE;
/*!40000 ALTER TABLE `genere` DISABLE KEYS */;
INSERT INTO `genere` VALUES (2,'Musica Africana'),(16,'Musica Asiatica'),(67,'Salsa'),(71,'Cumbia'),(75,'Musica Brasiliana'),(81,'Musica Indiana'),(84,'Country'),(85,'Alternative'),(95,'Bambini'),(98,'Classica'),(106,'Electro'),(113,'Dance'),(116,'Rap/Hip Hop'),(122,'Reggaeton'),(129,'Jazz'),(132,'Pop'),(144,'Reggae'),(152,'Rock'),(153,'Blues'),(165,'R&B'),(169,'Soul & Funk'),(173,'Film/Videogiochi'),(197,'Musica latina'),(464,'Metal'),(466,'Folk'),(475,'Tutti');
/*!40000 ALTER TABLE `genere` ENABLE KEYS */;
UNLOCK TABLES;

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
  CONSTRAINT `passaggio_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utente` (`id`),
  CONSTRAINT `passaggio_ibfk_2` FOREIGN KEY (`id_brano_1`) REFERENCES `brano` (`id`),
  CONSTRAINT `passaggio_ibfk_3` FOREIGN KEY (`id_brano_2`) REFERENCES `brano` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passaggio`
--

LOCK TABLES `passaggio` WRITE;
/*!40000 ALTER TABLE `passaggio` DISABLE KEYS */;
/*!40000 ALTER TABLE `passaggio` ENABLE KEYS */;
UNLOCK TABLES;

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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scaletta`
--

LOCK TABLES `scaletta` WRITE;
/*!40000 ALTER TABLE `scaletta` DISABLE KEYS */;
/*!40000 ALTER TABLE `scaletta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scaletta_passaggio`
--

DROP TABLE IF EXISTS `scaletta_passaggio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scaletta_passaggio` (
  `id_scaletta` int NOT NULL,
  `id_passaggio` int NOT NULL,
  PRIMARY KEY (`id_scaletta`,`id_passaggio`),
  KEY `id_passaggio` (`id_passaggio`),
  CONSTRAINT `scaletta_passaggio_ibfk_1` FOREIGN KEY (`id_scaletta`) REFERENCES `scaletta` (`id`) ON DELETE CASCADE,
  CONSTRAINT `scaletta_passaggio_ibfk_2` FOREIGN KEY (`id_passaggio`) REFERENCES `passaggio` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scaletta_passaggio`
--

LOCK TABLES `scaletta_passaggio` WRITE;
/*!40000 ALTER TABLE `scaletta_passaggio` DISABLE KEYS */;
/*!40000 ALTER TABLE `scaletta_passaggio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `utente`
--

DROP TABLE IF EXISTS `utente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `utente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `surname` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utente`
--

LOCK TABLES `utente` WRITE;
/*!40000 ALTER TABLE `utente` DISABLE KEYS */;
/*!40000 ALTER TABLE `utente` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `id_utente` (`id_utente`),
  KEY `id_passaggio` (`id_passaggio`),
  CONSTRAINT `valutazione_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utente` (`id`),
  CONSTRAINT `valutazione_ibfk_2` FOREIGN KEY (`id_passaggio`) REFERENCES `passaggio` (`id`),
  CONSTRAINT `valutazione_chk_1` CHECK (((`voto` >= 1) and (`voto` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `valutazione`
--

LOCK TABLES `valutazione` WRITE;
/*!40000 ALTER TABLE `valutazione` DISABLE KEYS */;
/*!40000 ALTER TABLE `valutazione` ENABLE KEYS */;
UNLOCK TABLES;

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
  `id_passaggio` int DEFAULT NULL,
  PRIMARY KEY (`id`,`data_visualizzazione`),
  KEY `id_utente` (`id_utente`),
  KEY `id_passaggio` (`id_passaggio`),
  CONSTRAINT `visualizzazione_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utente` (`id`),
  CONSTRAINT `visualizzazione_ibfk_2` FOREIGN KEY (`id_passaggio`) REFERENCES `passaggio` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visualizzazione`
--

LOCK TABLES `visualizzazione` WRITE;
/*!40000 ALTER TABLE `visualizzazione` DISABLE KEYS */;
/*!40000 ALTER TABLE `visualizzazione` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-04 11:46:49
