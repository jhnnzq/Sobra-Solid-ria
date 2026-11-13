const BASE_PROJETO = new URL('../../', document.currentScript.src).href;

class ErroApi extends Error {
    constructor(mensagem, status) {
        super(mensagem);
        this.status = status;
    }
}

async function chamarApi(arquivo, { metodo = 'GET', corpo, parametros } = {}) {
    const url = new URL(BASE_PROJETO + 'api/' + arquivo);

    if (parametros) {
        Object.entries(parametros).forEach(([chave, valor]) => {
            if (valor !== undefined && valor !== null && valor !== '') {
                url.searchParams.set(chave, valor);
            }
        });
    }

    const opcoes = {
        method: metodo,
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
    };

    if (corpo !== undefined) {
        opcoes.headers['Content-Type'] = 'application/json';
        opcoes.body = JSON.stringify(corpo);
    }

    let resposta;
    try {
        resposta = await fetch(url, opcoes);
    } catch (erro) {
        throw new ErroApi('Não foi possível conectar ao servidor.', 0);
    }

    let json = null;
    try {
        json = await resposta.json();
    } catch (erro) {
        json = null;
    }

    if (!resposta.ok || !json || !json.ok) {
        const mensagem = json && json.erro ? json.erro : 'Erro inesperado no servidor.';
        throw new ErroApi(mensagem, resposta.status);
    }

    return json.dados;
}

function buscarSessao() {
    return chamarApi('sessao.php');
}

function entrar(email, senha) {
    return chamarApi('login.php', { metodo: 'POST', corpo: { email, senha } });
}

function sair() {
    return chamarApi('logout.php', { metodo: 'POST' });
}

function cadastrarUsuario(dados) {
    return chamarApi('cadastro.php', { metodo: 'POST', corpo: dados });
}

function listarCategorias() {
    return chamarApi('categorias.php');
}

function listarMinhasDoacoes() {
    return chamarApi('doacoes.php', { parametros: { minhas: 1 } });
}

function buscarDoacao(id) {
    return chamarApi('doacoes.php', { parametros: { id } });
}

function criarDoacao(dados) {
    return chamarApi('doacoes.php', { metodo: 'POST', corpo: dados });
}

function editarDoacao(id, dados) {
    return chamarApi('doacoes.php', { metodo: 'PUT', corpo: { ...dados, id } });
}

function cancelarDoacao(id) {
    return chamarApi('doacoes.php', { metodo: 'DELETE', parametros: { id } });
}

function confirmarRetirada(doacaoId) {
    return chamarApi('reservas.php', {
        metodo: 'PUT',
        corpo: { doacao_id: doacaoId, acao: 'retirada' },
    });
}

function listarDoacoesDisponiveis(filtros = {}) {
    return chamarApi('doacoes.php', {
        parametros: { bairro: filtros.bairro, categoria: filtros.categoria },
    });
}

function reservarDoacao(doacaoId) {
    return chamarApi('reservas.php', { metodo: 'POST', corpo: { doacao_id: doacaoId } });
}

function listarMinhasReservas() {
    return chamarApi('reservas.php');
}

function cancelarReserva(id) {
    return chamarApi('reservas.php', { metodo: 'DELETE', parametros: { id } });
}
