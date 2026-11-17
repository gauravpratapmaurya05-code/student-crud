-- Run this on the DATABASE instance (MySQL).
CREATE DATABASE IF NOT EXISTS studentdb;
USE studentdb;

CREATE TABLE IF NOT EXISTS students (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  name    VARCHAR(100) NOT NULL,
  age     INT          NOT NULL,
  roll_no VARCHAR(50)  NOT NULL UNIQUE
);
