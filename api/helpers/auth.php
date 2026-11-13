<?php

require_once __DIR__ . '/resposta.php';

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function usuarioLogado(): ?array
{
    return $_SESSION['usuario'] ?? null;
}

function exigirLogin(): array
{
    $usuario = usuarioLogado();
    if ($usuario === null) {
        erro('Você precisa estar logado.', 401);
    }
    return $usuario;
}

function exigirPerfil(string $perfil): array
{
    $usuario = exigirLogin();
    if ($usuario['perfil'] !== $perfil) {
        erro('Seu perfil não tem permissão para isso.', 403);
    }
    return $usuario;
}
