<?php

header('Content-Type: application/json; charset=utf-8');


function responder($dados = null, int $codigo = 200): void
{
    http_response_code($codigo);
    echo json_encode(['ok' => true, 'dados' => $dados], JSON_UNESCAPED_UNICODE);
    exit;
}


function erro(string $mensagem, int $codigo = 400): void
{
    http_response_code($codigo);
    echo json_encode(['ok' => false, 'erro' => $mensagem], JSON_UNESCAPED_UNICODE);
    exit;
}


function lerCorpo(): array
{
    $json = json_decode(file_get_contents('php://input'), true);
    if (is_array($json)) {
        return $json;
    }
    return $_POST;
}


function texto(array $dados, string $campo): string
{
    return trim((string) ($dados[$campo] ?? ''));
}


function permitirMetodos(array $metodos): string
{
    $metodo = $_SERVER['REQUEST_METHOD'];
    if (!in_array($metodo, $metodos, true)) {
        erro('Método não permitido.', 405);
    }
    return $metodo;
}
