<?php

require_once __DIR__ . '/helpers/auth.php';

permitirMetodos(['GET']);

$usuario = usuarioLogado();

responder([
    'logado'  => $usuario !== null,
    'usuario' => $usuario,
]);
