-- MySQL dump 10.13  Distrib 5.7.19, for macos10.12 (x86_64)
--
-- Host: 127.0.0.1    Database: game
-- ------------------------------------------------------
-- Server version	5.7.19

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `room` (
  `uuid` varchar(32) NOT NULL DEFAULT '' COMMENT '房间唯一ID',
  `roomid` varchar(8) NOT NULL DEFAULT '' COMMENT '房间的数字id, 短时间内唯一, 可以用于加入房间操作',
  `create_time` int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
  `finish_time` int(11) NOT NULL DEFAULT '0' COMMENT '结束时间',
  `config` varchar(512) NOT NULL DEFAULT '' COMMENT '房间的游戏设置',
  `data` varchar(4096) NOT NULL DEFAULT '' COMMENT '房间的玩家信息(id,name,icon等),玩家在房间内的一些小节结算数据',
  `turns` int(11) NOT NULL DEFAULT '0' COMMENT '回合制游戏的当前回合数,关卡游戏的当前关卡,分局模式的当前局数等进度标记',
  `next` int(11) NOT NULL DEFAULT '0' COMMENT '当前回合、局、关卡中,标记轮到谁进行游戏操作',
  `ip` varchar(16) DEFAULT '127.0.0.1' COMMENT '当前房间所在服务器ip地址',
  `port` int(11) NOT NULL DEFAULT '0' COMMENT '当前房间所在游戏服务器端口',
  PRIMARY KEY (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='游戏房间表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-02-05 21:05:04
