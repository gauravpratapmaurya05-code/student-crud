-- Run this on the DATABASE instance (MySQL).
-- (The backend also creates/updates this table automatically on start.)
CREATE DATABASE IF NOT EXISTS studentdb;
USE studentdb;

CREATE TABLE IF NOT EXISTS students (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  age       INT          NOT NULL,
  roll_no   VARCHAR(50)  NOT NULL UNIQUE,
  file_key  VARCHAR(512) NULL,   -- S3 object key
  file_name VARCHAR(255) NULL    -- original file name
);
