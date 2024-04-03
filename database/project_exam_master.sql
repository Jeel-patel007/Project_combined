-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: project
-- ------------------------------------------------------
-- Server version	8.0.36-0ubuntu0.20.04.1

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
-- Table structure for table `exam_master`
--

DROP TABLE IF EXISTS `exam_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_master` (
  `exam_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int DEFAULT NULL,
  `sub_id` int DEFAULT NULL,
  `exam_type` int DEFAULT NULL,
  `total_theorymarks` float DEFAULT NULL,
  `obtain_theorymarks` float DEFAULT NULL,
  `total_practicalmarks` float DEFAULT NULL,
  `obtain_practicalmarks` float DEFAULT NULL,
  PRIMARY KEY (`exam_id`),
  KEY `student_id` (`student_id`),
  KEY `sub_id` (`sub_id`),
  KEY `exam_type` (`exam_type`),
  CONSTRAINT `exam_master_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student_master` (`id`),
  CONSTRAINT `exam_master_ibfk_2` FOREIGN KEY (`sub_id`) REFERENCES `subject_master` (`sub_id`),
  CONSTRAINT `exam_master_ibfk_3` FOREIGN KEY (`exam_type`) REFERENCES `exam_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3601 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-03-28  9:17:03
