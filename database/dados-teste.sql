USE sobra_solidaria;
 
INSERT INTO usuarios (perfil, nome, email, senha, telefone, endereco, bairro) VALUES
	('comercio', 'Padaria Pão Quente', 'padaria@teste.com',
	 '$2y$10$z0I3mPBB3Ylp4.7JBmMdIOEm2OPXyBzioDia7EBtFbRIKrAwzFkDq',
	 '13999990001', 'Rua Frei Gaspar, 100', 'Centro'),
	('comercio', 'Hortifruti Bom Preço', 'hortifruti@teste.com',
	 '$2y$10$z0I3mPBB3Ylp4.7JBmMdIOEm2OPXyBzioDia7EBtFbRIKrAwzFkDq',
	 '13999990002', 'Avenida Capitão-Mor Aguiar, 250', 'Itararé'),
	('ong', 'Cozinha Solidária Esperança', 'cozinha@teste.com',
	 '$2y$10$z0I3mPBB3Ylp4.7JBmMdIOEm2OPXyBzioDia7EBtFbRIKrAwzFkDq',
	 '13999990003', 'Rua Jacob Emmerich, 45', 'Gonzaguinha'),
	('ong', 'ONG Mãos Dadas', 'maosdadas@teste.com',
	 '$2y$10$z0I3mPBB3Ylp4.7JBmMdIOEm2OPXyBzioDia7EBtFbRIKrAwzFkDq',
	 '13999990004', 'Rua Ipiranga, 300', 'Vila Margarida');
 
INSERT INTO doacoes (comercio_id, categoria_id, titulo, descricao, quantidade, limite_retirada, status) VALUES
	(1, 1, 'Pães franceses do dia', 'Sobra da fornada da tarde, embalados em sacos.',
	 '30 unidades', DATE_ADD(NOW(), INTERVAL 3 HOUR), 'disponivel'),
	(1, 1, 'Bolos e roscas', 'Bolos de fubá e roscas doces inteiras.',
	 '6 unidades', DATE_ADD(NOW(), INTERVAL 5 HOUR), 'disponivel'),
	(2, 2, 'Frutas maduras (banana e mamão)', 'Boas para consumo hoje ou amanhã.',
	 '8 kg', DATE_ADD(NOW(), INTERVAL 2 HOUR), 'disponivel'),
	(2, 2, 'Verduras do dia', 'Alface, couve e cheiro-verde.',
	 '3 caixas', DATE_ADD(NOW(), INTERVAL 4 HOUR), 'reservada'),
	(1, 3, 'Salgados assados', 'Esfirras e enroladinhos.',
	 '20 unidades', DATE_SUB(NOW(), INTERVAL 1 HOUR), 'disponivel'),
	(2, 5, 'Arroz e feijão (embalagem danificada)', 'Pacotes com a embalagem rasgada, produto intacto.',
	 '10 kg', DATE_SUB(NOW(), INTERVAL 1 DAY), 'retirada');
 
INSERT INTO reservas (doacao_id, ong_id, status, reservado_em, retirado_em) VALUES
	(4, 3, 'ativa', NOW(), NULL),
	(6, 4, 'concluida', DATE_SUB(NOW(), INTERVAL 26 HOUR), DATE_SUB(NOW(), INTERVAL 25 HOUR));