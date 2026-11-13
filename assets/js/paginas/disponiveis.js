iniciarPagina(async () => {
    const formulario = document.getElementById('form-filtros');
    const lista = document.getElementById('lista-doacoes');

    function montarCard(doacao) {
        return criar('article', { classe: 'doacao-card' }, [
            criar('div', { classe: 'doacao-topo' }, [
                criar('h2', { texto: doacao.titulo }),
                seloStatus('disponivel'),
            ]),
            criar('span', { classe: 'categoria', texto: doacao.categoria }),
            criar('div', { classe: 'doacao-informacoes' }, [
                linhaInfo('Comércio', doacao.comercio_nome),
                linhaInfo('Bairro', doacao.bairro),
                linhaInfo('Quantidade', doacao.quantidade),
                linhaInfo('Retirar até', formatarDataHora(doacao.limite_retirada)),
                doacao.descricao ? criar('p', { texto: doacao.descricao }) : null,
            ]),
            criar('div', { classe: 'doacao-acoes' }, [
                criar('button', {
                    classe: 'btn-reservar',
                    texto: 'Reservar',
                    atributos: { type: 'button', 'data-id': doacao.id, 'data-titulo': doacao.titulo },
                }),
            ]),
        ]);
    }

    async function carregar() {
        const filtros = lerFormulario(formulario);
        const filtrando = Boolean(filtros.bairro.trim() || filtros.categoria);

        mostrarListaVazia(lista, 'Carregando doações...');

        try {
            const doacoes = await listarDoacoesDisponiveis({
                bairro: filtros.bairro.trim(),
                categoria: filtros.categoria,
            });
            if (doacoes.length) {
                lista.replaceChildren(...doacoes.map(montarCard));
            } else {
                mostrarListaVazia(lista, filtrando
                    ? 'Nenhuma doação encontrada com esses filtros.'
                    : 'Nenhuma doação disponível agora.');
            }
        } catch (erro) {
            lista.replaceChildren();
            tratarErroApi(erro);
        }
    }

    function mostrarReserva(comercio, titulo) {
        const endereco = [comercio.endereco, comercio.bairro].filter(Boolean).join(', ');

        mostrarMensagem([
            criar('strong', { texto: 'Reserva feita! ' }),
            `Retire em ${comercio.nome}`,
            endereco ? ` (${endereco})` : '',
            comercio.telefone ? ` — ${formatarTelefone(comercio.telefone)}. ` : '. ',
            comercio.telefone
                ? botaoWhatsapp(comercio.telefone, `Olá! Reservei a doação "${titulo}" pelo Sobra Solidária.`, 'link-whatsapp')
                : null,
        ], 'sucesso');
    }

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        mostrarMensagem('');
        carregar();
    });

    lista.addEventListener('click', async (evento) => {
        const botao = evento.target.closest('button[data-id]');
        if (!botao) {
            return;
        }

        if (!confirmar('Deseja reservar esta doação?')) {
            return;
        }

        botao.disabled = true;

        try {
            const resultado = await reservarDoacao(Number(botao.dataset.id));
            mostrarReserva(resultado.comercio || {}, botao.dataset.titulo);
            await carregar();
        } catch (erro) {
            tratarErroApi(erro);
            if (erro.status === 409) {
                await carregar();
            } else {
                botao.disabled = false;
            }
        }
    });

    try {
        preencherCategorias(formulario.elements.categoria, await listarCategorias());
    } catch (erro) {
        tratarErroApi(erro);
    }

    carregar();
});
