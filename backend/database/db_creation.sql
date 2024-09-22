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

CREATE TABLE money_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operation VARCHAR(255),
    value FLOAT,
    date DATE,
    category VARCHAR(255),
    account VARCHAR(255)
);

CREATE TABLE money_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    balance FLOAT,
    name VARCHAR(255)
);

CREATE Table money_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);