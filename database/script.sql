SHOW DATABASES;

CREATE DATABASE DB;

SELECT HOST,USER FROM USER;

CREATE USER 'user'@'%' IDENTIFIED BY 'password';

GRANT ALL PRIVILEGES ON DB.* TO 'user'@'%';

# DROP USER 'user'@'%';