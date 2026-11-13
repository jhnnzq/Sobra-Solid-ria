const PAGINA_INICIAL = {
    comercio: 'comercio/minhas-doacoes.html',
    ong: 'ong/disponiveis.html',
};

let usuarioLogado = null;

function obterUsuarioLogado() {
    return usuarioLogado;
}

function irPara(caminho) {
    window.location.replace(BASE_PROJETO + caminho);
}

function irParaInicio(perfil) {
    irPara(PAGINA_INICIAL[perfil] || 'index.html');
}

function mostrarUsuarioNoMenu(usuario) {
    document.querySelectorAll('[data-usuario-nome]').forEach((elemento) => {
        elemento.textContent = usuario.nome;
    });
}

function ativarBotaoSair() {
    document.querySelectorAll('[data-sair]').forEach((botao) => {
        botao.addEventListener('click', async (evento) => {
            evento.preventDefault();
            try {
                await sair();
            } catch (erro) {
                console.error(erro);
            }
            irPara('index.html');
        });
    });
}

async function verificarAcesso() {
    const area = document.body.dataset.area || 'publica';

    let sessao;
    try {
        sessao = await buscarSessao();
    } catch (erro) {
        if (area === 'publica') {
            return true;
        }
        irPara('index.html');
        return false;
    }

    const usuario = sessao.logado ? sessao.usuario : null;

    if (area === 'publica') {
        if (usuario) {
            irParaInicio(usuario.perfil);
            return false;
        }
        return true;
    }

    if (!usuario) {
        irPara('index.html');
        return false;
    }

    if (usuario.perfil !== area) {
        irParaInicio(usuario.perfil);
        return false;
    }

    usuarioLogado = usuario;
    mostrarUsuarioNoMenu(usuario);
    document.body.classList.add('liberado');
    return true;
}

function tratarErroApi(erro) {
    if (erro.status === 401) {
        irPara('index.html');
        return;
    }
    mostrarMensagem(erro.message, 'erro');
}

function iniciarPagina(iniciar) {
    ativarBotaoSair();
    verificarAcesso().then((liberado) => {
        if (liberado) {
            iniciar(usuarioLogado);
        }
    });
}
