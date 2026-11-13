<?php

date_default_timezone_set('America/Sao_Paulo');

$host    = 'ble';
$banco   = 'bla';
$usuario = 'blu';
$senha   = 'bli';         

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$banco;charset=utf8mb4",
        $usuario,
        $senha,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, 
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,      
            PDO::ATTR_EMULATE_PREPARES   => false,                 
        ]
    );

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