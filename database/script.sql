CREATE DATABASE IF NOT EXISTS sobra_solidaria
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
 
USE sobra_solidaria;
 
CREATE TABLE usuarios (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	perfil ENUM('comercio', 'ong') NOT NULL,
	nome VARCHAR(150) NOT NULL,
	email VARCHAR(150) NOT NULL UNIQUE,
	senha VARCHAR(255) NOT NULL,
	telefone VARCHAR(20) NOT NULL,
	endereco VARCHAR(200),
	bairro VARCHAR(80) NOT NULL,
	criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);
 
CREATE TABLE categorias (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	nome VARCHAR(50) NOT NULL UNIQUE
);
 
INSERT INTO categorias (nome) VALUES
	('Pães e massas'),
	('Frutas e verduras'),
	('Refeições prontas'),
	('Laticínios'),
	('Mercearia'),
	('Outros');
 
CREATE TABLE doacoes (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	comercio_id INT NOT NULL,
	categoria_id INT NOT NULL,
	titulo VARCHAR(100) NOT NULL,
	descricao TEXT,
	quantidade VARCHAR(50) NOT NULL,
	limite_retirada DATETIME NOT NULL,
	status ENUM('disponivel', 'reservada', 'retirada', 'cancelada') NOT NULL DEFAULT 'disponivel',
	criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (comercio_id) REFERENCES usuarios(id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);
 
CREATE TABLE reservas (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	doacao_id INT NOT NULL,
	ong_id INT NOT NULL,
	status ENUM('ativa', 'cancelada', 'concluida') NOT NULL DEFAULT 'ativa',
	reservado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
	retirado_em DATETIME,
	FOREIGN KEY (doacao_id) REFERENCES doacoes(id),
	FOREIGN KEY (ong_id) REFERENCES usuarios(id)
);