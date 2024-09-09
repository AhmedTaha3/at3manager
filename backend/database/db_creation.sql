CREATE DATABASE at3manager;

USE at3manager;

CREATE TABLE timeManager (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity VARCHAR(255) ,
    category VARCHAR(255) ,
    startTime DATETIME,
    endTime DATETIME,
    duration TIME,
    day VARCHAR(255),
    date DATE
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);