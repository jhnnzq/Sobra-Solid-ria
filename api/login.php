<?php

require_once __DIR__ . '/helpers/auth.php';
require_once __DIR__ . '/config/conexao.php';

permitirMetodos(['POST']);
$dados = lerCorpo();

$email = strtolower(texto($dados, 'email'));
$senha = (string) ($dados['senha'] ?? '');

if ($email === '' || $senha === '') {
    erro('Informe e-mail e senha.');
}

$busca = $pdo->prepare('SELECT id, nome, perfil, senha FROM usuarios WHERE email = ?');
$busca->execute([$email]);
$usuario = $busca->fetch();


if (!$usuario || !password_verify($senha, $usuario['senha'])) {
    erro('E-mail ou senha inválidos.', 401);
}


session_regenerate_id(true);

$_SESSION['usuario'] = [
    'id'     => (int) $usuario['id'],
    'nome'   => $usuario['nome'],
    'perfil' => $usuario['perfil'],
];

responder($_SESSION['usuario']);
