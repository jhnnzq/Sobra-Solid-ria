<?php
 
require_once __DIR__ . '/helpers/auth.php';
require_once __DIR__ . '/config/conexao.php';

$metodo = permitirMetodos(['GET', 'POST', 'PUT', 'DELETE']);


const SQL_SITUACAO = "CASE
        WHEN d.status IN ('disponivel', 'reservada') AND d.limite_retirada < NOW() THEN 'expirada'
        ELSE d.status
    END";
 
function validarDoacao(PDO $pdo, array $dados): array
{
    $titulo      = texto($dados, 'titulo');
    $quantidade  = texto($dados, 'quantidade');
    $descricao   = texto($dados, 'descricao');
    $categoriaId = (int) ($dados['categoria_id'] ?? 0);
    $limiteTexto = texto($dados, 'limite_retirada');

    if ($titulo === '' || mb_strlen($titulo) > 100) {
        erro('Informe o título (até 100 caracteres).');
    }
    if ($quantidade === '' || mb_strlen($quantidade) > 50) {
        erro('Informe a quantidade (ex.: 30 unidades, 5 kg).');
    }
    if (mb_strlen($descricao) > 1000) {
        erro('A descrição pode ter no máximo 1000 caracteres.');
    }
 
    $busca = $pdo->prepare('SELECT id FROM categorias WHERE id = ?');
    $busca->execute([$categoriaId]);
    if (!$busca->fetch()) {
        erro('Escolha uma categoria válida.');
    }
 
    $limite = false;
    foreach (['Y-m-d\TH:i', 'Y-m-d\TH:i:s', 'Y-m-d H:i', 'Y-m-d H:i:s'] as $formato) {
        $limite = DateTime::createFromFormat($formato, $limiteTexto);
        if ($limite !== false) {
            break;
        }
    }
    if ($limite === false) {
        erro('Informe o horário limite de retirada.');
    }

    $agora = new DateTime();
    $maximo = (new DateTime())->modify('+48 hours');
    if ($limite <= $agora) {
        erro('O horário limite precisa ser no futuro.');
    }
    if ($limite > $maximo) {
        erro('O horário limite pode ser de no máximo 48 horas a partir de agora.');
    }

    return [
        'titulo'          => $titulo,
        'categoria_id'    => $categoriaId,
        'quantidade'      => $quantidade,
        'descricao'       => $descricao === '' ? null : $descricao,
        'limite_retirada' => $limite->format('Y-m-d H:i:s'),
    ];
}

 
function idDaDoacao(array $dados = []): int
{
    $id = (int) ($_GET['id'] ?? $dados['id'] ?? 0);
    if ($id <= 0) {
        erro('Informe qual doação.');
    }
    return $id;
}

 
if ($metodo === 'GET') {

 
    if (isset($_GET['id'])) {
        $usuario = exigirPerfil('comercio');

        $sql = 'SELECT d.id, d.titulo, d.categoria_id, d.quantidade, d.descricao,
                       d.limite_retirada, d.status, ' . SQL_SITUACAO . ' AS situacao
                FROM doacoes d
                WHERE d.id = ? AND d.comercio_id = ?';
        $busca = $pdo->prepare($sql);
        $busca->execute([idDaDoacao(), $usuario['id']]);
        $doacao = $busca->fetch();

        if (!$doacao) {
            erro('Doação não encontrada.', 404);
        }
        responder($doacao);
    }

 
    if (isset($_GET['minhas'])) {
        $usuario = exigirPerfil('comercio');

 
        $sql = 'SELECT d.id, d.titulo, d.quantidade, d.descricao, d.limite_retirada,
                       d.criado_em, c.nome AS categoria,
                       ' . SQL_SITUACAO . ' AS situacao,
                       r.id AS reserva_id, o.nome AS ong_nome, o.telefone AS ong_telefone
                FROM doacoes d
                JOIN categorias c ON c.id = d.categoria_id
                LEFT JOIN reservas r ON r.doacao_id = d.id AND r.status IN (\'ativa\', \'concluida\')
                LEFT JOIN usuarios o ON o.id = r.ong_id
                WHERE d.comercio_id = ?
                ORDER BY d.criado_em DESC';
        $busca = $pdo->prepare($sql);
        $busca->execute([$usuario['id']]);
        responder($busca->fetchAll());
    }
 
    exigirPerfil('ong');

    $sql = 'SELECT d.id, d.titulo, d.quantidade, d.descricao, d.limite_retirada,
                   c.id AS categoria_id, c.nome AS categoria,
                   u.nome AS comercio_nome, u.bairro
            FROM doacoes d
            JOIN categorias c ON c.id = d.categoria_id
            JOIN usuarios u ON u.id = d.comercio_id
            WHERE d.status = \'disponivel\' AND d.limite_retirada > NOW()';
    $parametros = [];

 
    $bairro = trim((string) ($_GET['bairro'] ?? ''));
    if ($bairro !== '') {
        $sql .= ' AND u.bairro = ?';
        $parametros[] = $bairro;
    }
    $categoria = (int) ($_GET['categoria'] ?? 0);
    if ($categoria > 0) {
        $sql .= ' AND c.id = ?';
        $parametros[] = $categoria;
    }

    $sql .= ' ORDER BY d.limite_retirada ASC';  

    $busca = $pdo->prepare($sql);
    $busca->execute($parametros);
    responder($busca->fetchAll());
}

 
if ($metodo === 'POST') {
    $usuario = exigirPerfil('comercio');
    $d = validarDoacao($pdo, lerCorpo());

    $sql = 'INSERT INTO doacoes (comercio_id, categoria_id, titulo, descricao, quantidade, limite_retirada)
            VALUES (?, ?, ?, ?, ?, ?)';
    $insere = $pdo->prepare($sql);
    $insere->execute([
        $usuario['id'], $d['categoria_id'], $d['titulo'],
        $d['descricao'], $d['quantidade'], $d['limite_retirada'],
    ]);

    responder(['id' => (int) $pdo->lastInsertId()], 201);
}

 
if ($metodo === 'PUT') {
    $usuario = exigirPerfil('comercio');
    $dados = lerCorpo();
    $id = idDaDoacao($dados);
    $d = validarDoacao($pdo, $dados);
 
    $sql = 'UPDATE doacoes
            SET titulo = ?, categoria_id = ?, quantidade = ?, descricao = ?, limite_retirada = ?
            WHERE id = ? AND comercio_id = ? AND status = \'disponivel\' AND limite_retirada > NOW()';
    $atualiza = $pdo->prepare($sql);
    $atualiza->execute([
        $d['titulo'], $d['categoria_id'], $d['quantidade'],
        $d['descricao'], $d['limite_retirada'], $id, $usuario['id'],
    ]);

    if ($atualiza->rowCount() === 0) {
 
        $busca = $pdo->prepare('SELECT status, limite_retirada < NOW() AS vencida
                                FROM doacoes WHERE id = ? AND comercio_id = ?');
        $busca->execute([$id, $usuario['id']]);
        $atual = $busca->fetch();

        if (!$atual) {
            erro('Doação não encontrada.', 404);
        }
        if ($atual['status'] !== 'disponivel') {
            erro('Só é possível editar doações disponíveis. Esta já foi reservada, retirada ou cancelada.', 409);
        }
        if ($atual['vencida']) {
            erro('Esta doação já passou do horário limite e não pode mais ser editada.', 409);
        }
 
    }

    responder(['id' => $id]);
}
 
if ($metodo === 'DELETE') {
    $usuario = exigirPerfil('comercio');
    $id = idDaDoacao(lerCorpo());
 
    $pdo->beginTransaction();
    try {
        $sql = 'UPDATE doacoes SET status = \'cancelada\'
                WHERE id = ? AND comercio_id = ? AND status IN (\'disponivel\', \'reservada\')';
        $atualiza = $pdo->prepare($sql);
        $atualiza->execute([$id, $usuario['id']]);

        if ($atualiza->rowCount() === 0) {
            $pdo->rollBack();
            erro('Doação não encontrada ou já finalizada.', 404);
        }

        $cancelaReserva = $pdo->prepare('UPDATE reservas SET status = \'cancelada\'
                                         WHERE doacao_id = ? AND status = \'ativa\'');
        $cancelaReserva->execute([$id]);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        erro('Não foi possível cancelar a doação.', 500);
    }

    responder(['id' => $id]);
}
