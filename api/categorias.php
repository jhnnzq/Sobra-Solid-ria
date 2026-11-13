<?php
 
require_once __DIR__ . '/helpers/resposta.php';
require_once __DIR__ . '/config/conexao.php';

permitirMetodos(['GET']);

$categorias = $pdo->query('SELECT id, nome FROM categorias ORDER BY id')->fetchAll();

responder($categorias);
