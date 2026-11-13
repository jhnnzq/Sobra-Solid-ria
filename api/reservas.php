<?php

require_once __DIR__ . '/helpers/auth.php';
require_once __DIR__ . '/config/conexao.php';

$metodo = permitirMetodos(['GET', 'POST', 'PUT', 'DELETE']);


if ($metodo === 'GET') {
    $usuario = exigirPerfil('ong');


    $sql = "SELECT r.id AS reserva_id, r.status AS reserva_status, r.reservado_em, r.retirado_em,
                   d.id AS doacao_id, d.titulo, d.quantidade, d.descricao, d.limite_retirada,
                   c.nome AS categoria,
                   u.nome AS comercio_nome, u.telefone AS comercio_telefone,
                   u.endereco AS comercio_endereco, u.bairro AS comercio_bairro,
                   CASE
                       WHEN r.status = 'ativa' AND d.limite_retirada < NOW() THEN 'expirada'
                       ELSE r.status
                   END AS situacao
            FROM reservas r
            JOIN doacoes d ON d.id = r.doacao_id
            JOIN categorias c ON c.id = d.categoria_id
            JOIN usuarios u ON u.id = d.comercio_id
            WHERE r.ong_id = ?
            ORDER BY r.reservado_em DESC";
    $busca = $pdo->prepare($sql);
    $busca->execute([$usuario['id']]);
    responder($busca->fetchAll());
}


if ($metodo === 'POST') {
    $usuario = exigirPerfil('ong');
    $dados = lerCorpo();
    $doacaoId = (int) ($dados['doacao_id'] ?? 0);

    if ($doacaoId <= 0) {
        erro('Informe qual doação quer reservar.');
    }

    $pdo->beginTransaction();
    try {

        $sql = "UPDATE doacoes SET status = 'reservada'
                WHERE id = ? AND status = 'disponivel' AND limite_retirada > NOW()";
        $atualiza = $pdo->prepare($sql);
        $atualiza->execute([$doacaoId]);

        if ($atualiza->rowCount() === 0) {
            $pdo->rollBack();

            $existe = $pdo->prepare('SELECT id FROM doacoes WHERE id = ?');
            $existe->execute([$doacaoId]);
            if (!$existe->fetch()) {
                erro('Doação não encontrada.', 404);
            }
            erro('Essa doação acabou de ser reservada por outra ONG ou não está mais disponível.', 409);
        }

        $insere = $pdo->prepare('INSERT INTO reservas (doacao_id, ong_id) VALUES (?, ?)');
        $insere->execute([$doacaoId, $usuario['id']]);
        $reservaId = (int) $pdo->lastInsertId();

        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        erro('Não foi possível fazer a reserva.', 500);
    }


    $sql = 'SELECT u.nome, u.telefone, u.endereco, u.bairro
            FROM doacoes d JOIN usuarios u ON u.id = d.comercio_id
            WHERE d.id = ?';
    $busca = $pdo->prepare($sql);
    $busca->execute([$doacaoId]);

    responder([
        'reserva_id' => $reservaId,
        'comercio'   => $busca->fetch(),
    ], 201);
}

if ($metodo === 'DELETE') {
    $usuario = exigirPerfil('ong');
    $dados = lerCorpo();
    $reservaId = (int) ($_GET['id'] ?? $dados['id'] ?? 0);

    if ($reservaId <= 0) {
        erro('Informe qual reserva.');
    }

    $pdo->beginTransaction();
    try {
        $busca = $pdo->prepare("SELECT doacao_id FROM reservas
                                WHERE id = ? AND ong_id = ? AND status = 'ativa'");
        $busca->execute([$reservaId, $usuario['id']]);
        $reserva = $busca->fetch();

        if (!$reserva) {
            $pdo->rollBack();
            erro('Reserva não encontrada ou já finalizada.', 404);
        }

        $pdo->prepare("UPDATE reservas SET status = 'cancelada' WHERE id = ?")
            ->execute([$reservaId]);


        $pdo->prepare("UPDATE doacoes SET status = 'disponivel' WHERE id = ? AND status = 'reservada'")
            ->execute([$reserva['doacao_id']]);

        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        erro('Não foi possível cancelar a reserva.', 500);
    }

    responder(['reserva_id' => $reservaId]);
}


if ($metodo === 'PUT') {
    $usuario = exigirPerfil('comercio');
    $dados = lerCorpo();
    $doacaoId = (int) ($dados['doacao_id'] ?? $_GET['doacao_id'] ?? 0);

    if (texto($dados, 'acao') !== 'retirada') {
        erro('Ação inválida.');
    }
    if ($doacaoId <= 0) {
        erro('Informe qual doação foi retirada.');
    }

    $pdo->beginTransaction();
    try {

        $sql = "UPDATE doacoes SET status = 'retirada'
                WHERE id = ? AND comercio_id = ? AND status = 'reservada'";
        $atualiza = $pdo->prepare($sql);
        $atualiza->execute([$doacaoId, $usuario['id']]);

        if ($atualiza->rowCount() === 0) {
            $pdo->rollBack();
            erro('Doação não encontrada ou não está reservada.', 404);
        }

        $pdo->prepare("UPDATE reservas SET status = 'concluida', retirado_em = NOW()
                       WHERE doacao_id = ? AND status = 'ativa'")
            ->execute([$doacaoId]);

        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        erro('Não foi possível confirmar a retirada.', 500);
    }

    responder(['doacao_id' => $doacaoId]);
}
