iniciarPagina(() => {
    const lista = document.getElementById('lista-doacoes');

    const avisos = {
        criada: 'Doação cadastrada com sucesso.',
        editada: 'Doação atualizada com sucesso.',
    };
    const aviso = new URLSearchParams(window.location.search).get('aviso');
    if (avisos[aviso]) {
        mostrarMensagem(avisos[aviso], 'sucesso');
    }

    function montarContato(doacao) {
        if (!doacao.ong_nome) {
            return null;
        }

        return criar('div', { classe: 'doacao-contato' }, [
            linhaInfo('Reservada por', doacao.ong_nome),
            doacao.ong_telefone ? linhaInfo('Telefone', formatarTelefone(doacao.ong_telefone)) : null,
            doacao.ong_telefone
                ? criar('p', {}, [botaoWhatsapp(doacao.ong_telefone, `Olá! Sobre a doação "${doacao.titulo}"`, 'link-whatsapp')])
                : null,
        ]);
    }

    function botaoAcao(texto, classe, acao, id) {
        return criar('button', {
            classe,
            texto,
            atributos: { type: 'button', 'data-acao': acao, 'data-id': id },
        });
    }

    function montarAcoes(doacao) {
        const acoes = [];

        if (doacao.situacao === 'disponivel') {
            acoes.push(criar('a', {
                classe: 'btn-secundario',
                texto: 'Editar',
                atributos: { href: `nova-doacao.html?id=${encodeURIComponent(doacao.id)}` },
            }));
            acoes.push(botaoAcao('Cancelar', 'btn-cancelar', 'cancelar', doacao.id));
        }

        if (doacao.situacao === 'reservada') {
            acoes.push(botaoAcao('Confirmar retirada', 'btn-confirmar', 'retirada', doacao.id));
            acoes.push(botaoAcao('Cancelar', 'btn-cancelar', 'cancelar', doacao.id));
        }

        return acoes.length ? criar('div', { classe: 'doacao-acoes' }, acoes) : null;
    }

    function montarCard(doacao) {
        return criar('article', { classe: 'doacao-card' }, [
            criar('div', { classe: 'doacao-topo' }, [
                criar('h3', { texto: doacao.titulo }),
                seloStatus(doacao.situacao),
            ]),
            criar('p', { classe: 'categoria', texto: doacao.categoria }),
            criar('div', { classe: 'doacao-informacoes' }, [
                linhaInfo('Quantidade', doacao.quantidade),
                linhaInfo('Retirar até', formatarDataHora(doacao.limite_retirada)),
                doacao.descricao ? criar('p', { texto: doacao.descricao }) : null,
            ]),
            montarContato(doacao),
            montarAcoes(doacao),
        ]);
    }

    async function carregar() {
        mostrarListaVazia(lista, 'Carregando doações...');

        try {
            const doacoes = await listarMinhasDoacoes();
            if (doacoes.length) {
                lista.replaceChildren(...doacoes.map(montarCard));
            } else {
                mostrarListaVazia(lista, 'Você ainda não cadastrou nenhuma doação.');
            }
        } catch (erro) {
            lista.replaceChildren();
            tratarErroApi(erro);
        }
    }

    lista.addEventListener('click', async (evento) => {
        const botao = evento.target.closest('button[data-acao]');
        if (!botao) {
            return;
        }

        const { acao, id } = botao.dataset;
        const pergunta = acao === 'cancelar'
            ? 'Deseja cancelar esta doação? Se houver reserva, ela também será cancelada.'
            : 'Confirmar que a ONG retirou esta doação?';

        if (!confirmar(pergunta)) {
            return;
        }

        botao.disabled = true;

        try {
            if (acao === 'cancelar') {
                await cancelarDoacao(id);
                mostrarMensagem('Doação cancelada.', 'sucesso');
            } else {
                await confirmarRetirada(Number(id));
                mostrarMensagem('Retirada confirmada.', 'sucesso');
            }
            await carregar();
        } catch (erro) {
            botao.disabled = false;
            tratarErroApi(erro);
        }
    });

    carregar();
});
