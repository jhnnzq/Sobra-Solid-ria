<?php

require_once __DIR__ . '/helpers/resposta.php';
require_once __DIR__ . '/config/conexao.php';

permitirMetodos(['POST']);
$dados = lerCorpo();

$perfil   = texto($dados, 'perfil');
$nome     = texto($dados, 'nome');
$email    = strtolower(texto($dados, 'email'));
$senha    = (string) ($dados['senha'] ?? '');
$telefone = preg_replace('/\D/', '', texto($dados, 'telefone')); // só os números
$endereco = texto($dados, 'endereco');
$bairro   = texto($dados, 'bairro');

// ---------- Validação ----------
if (!in_array($perfil, ['comercio', 'ong'], true)) {
    erro('Escolha se a conta é de comércio ou de ONG.');
}
if ($nome === '' || mb_strlen($nome) > 150) {
    erro('Informe o nome (até 150 caracteres).');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150) {
    erro('Informe um e-mail válido.');
}
if (strlen($senha) < 8) {
    erro('A senha precisa ter pelo menos 8 caracteres.');
}
if (strlen($telefone) < 10 || strlen($telefone) > 11) {
    erro('Informe o telefone com DDD (10 ou 11 números).');
}
if (mb_strlen($endereco) > 200) {
    erro('O endereço pode ter no máximo 200 caracteres.');
}
if ($bairro === '' || mb_strlen($bairro) > 80) {
    erro('Informe o bairro.');
}

$busca = $pdo->prepare('SELECT id FROM usuarios WHERE email = ?');
$busca->execute([$email]);
if ($busca->fetch()) {
    erro('Este e-mail já está cadastrado.', 409);
}

$sql = 'INSERT INTO usuarios (perfil, nome, email, senha, telefone, endereco, bairro)
        VALUES (?, ?, ?, ?, ?, ?, ?)';
$insere = $pdo->prepare($sql);
$insere->execute([
    $perfil,
    $nome,
    $email,
    password_hash($senha, PASSWORD_DEFAULT), // nunca salvar a senha pura
    $telefone,
    $endereco === '' ? null : $endereco,
    $bairro,
]);

responder(['id' => (int) $pdo->lastInsertId()], 201);
