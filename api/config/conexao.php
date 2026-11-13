<?php
date_default_timezone_set('America/Sao_Paulo');

$host    = 'localhost';
$banco   = 'sobra_solidaria';
$usuario = 'root';
$senha   = '';          // XAMPP vem com senha vazia

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$banco;charset=utf8mb4",
        $usuario,
        $senha,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // erro vira exceção
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // resultados como array com nome das colunas
            PDO::ATTR_EMULATE_PREPARES   => false,                  // prepared statements de verdade
        ]
    );

    // Mesmo fuso no MySQL, para o NOW() bater com o PHP
    $pdo->exec("SET time_zone = '-03:00'");

} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok'   => false,
        'erro' => 'Não foi possível conectar ao banco de dados.'
    ]);
    exit;
}