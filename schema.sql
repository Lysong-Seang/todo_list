CREATE TABLE todo (
    id INT NOT NULL AUTO_INCREMENT,
    text VARCHAR(255) NOT NULL,
    disabled TINYINT(1) DEFAULT 0,
    deadline DATE ,
    PRIMARY KEY (id)
);
