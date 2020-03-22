CREATE TABLE user (
    pseudo VARCHAR(50),
    code_ami VARCHAR(50),
    password text,
    status VARCHAR(20),
    CONSTRAINT PK_user PRIMARY KEY(code_ami)
);

CREATE TABLE sell (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    code_ami VARCHAR(50),
    picture VARCHAR(100),
    value INT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_sell_user FOREIGN KEY (code_ami) references user(code_ami)
);

CREATE TABLE buy (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    code_ami VARCHAR(50),
    picture VARCHAR(100),
    value INT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_buy_user FOREIGN KEY (code_ami) references user(code_ami)
);

CREATE TABLE trade (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    traveler VARCHAR(50),
    host VARCHAR(50),
    message text,
    state VARCHAR(20),
    CONSTRAINT FK_traveler FOREIGN KEY (traveler) references user(code_ami),
    CONSTRAINT FK_host FOREIGN KEY (host) references user(code_ami)
);