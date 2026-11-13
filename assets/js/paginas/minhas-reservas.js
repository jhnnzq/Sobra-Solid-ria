iniciarPagina(() => {
    const listaAtivas = document.getElementById('reservas-ativas');
    const listaHistorico = document.getElementById('reservas-historico');

    function montarAcoes(reserva) {
        if (reserva.situacao !== 'ativa') {
            return null;
        }

        return criar('div', { classe: 'doacao-acoes' }, [
            reserva.comercio_telefone
                ? botaoWhatsapp(
                    reserva.comercio_telefone,
                    `Olá! Reservei a doação "${reserva.titulo}" pelo Sobra Solidária.`,
                    'btn-whatsapp'
                )
                : null,
            criar('button', {
                classe: 'btn-cancelar',
                texto: 'Cancelar reserva',
                atributos: { type: 'button', 'data-id': reserva.reserva_id },
            }),
        ]);
    }

    function montarCard(reserva) {
        const endereco = [reserva.comercio_endereco, reserva.comercio_bairro].filter(Boolean).join(', ');

        return criar('article', { classe: 'doacao-card' }, [
            criar('div', { classe: 'doacao-topo' }, [
                criar('h2', { texto: reserva.titulo }),
                seloStatus(reserva.situacao),
            ]),
            criar('span', { classe: 'categoria', texto: reserva.categoria }),
            criar('div', { classe: 'doacao-informacoes' }, [
                linhaInfo('Quantidade', reserva.quantidade),
                linhaInfo('Retirar até', formatarDataHora(reserva.limite_retirada)),
                linhaInfo('Reservado em', formatarDataHora(reserva.reservado_em)),
                reserva.retirado_em ? linhaInfo('Retirado em', formatarDataHora(reserva.retirado_em)) : null,
                reserva.descricao ? criar('p', { texto: reserva.descricao }) : null,
            ]),
            criar('div', { classe: 'doacao-contato' }, [
                criar('p', {}, [criar('strong', { texto: reserva.comercio_nome })]),
                endereco ? criar('p', { texto: endereco }) : null,
                reserva.comercio_telefone ? criar('p', { texto: formatarTelefone(reserva.comercio_telefone) }) : null,
            ]),
            montarAcoes(reserva),
        ]);
    }

    function preencher(lista, reservas, textoVazio) {
        if (reservas.length) {
            lista.replaceChildren(...reservas.map(montarCard));
        } else {
            mostrarListaVazia(lista, textoVazio);
        }
    }

    async function carregar() {
        mostrarListaVazia(listaAtivas, 'Carregando reservas...');
        listaHistorico.replaceChildren();

        try {
            const reservas = await listarMinhasReservas();
            preencher(
                listaAtivas,
                reservas.filter((reserva) => reserva.situacao === 'ativa'),
                'Nenhuma reserva aguardando retirada.'
            );
            preencher(
                listaHistorico,
                reservas.filter((reserva) => reserva.situacao !== 'ativa'),
                'Nenhuma reserva no histórico.'
            );
        } catch (erro) {
            listaAtivas.replaceChildren();
            tratarErroApi(erro);
        }
    }

    listaAtivas.addEventListener('click', async (evento) => {
        const botao = evento.target.closest('button[data-id]');
        if (!botao) {
            return;
        }

        if (!confirmar('Deseja cancelar esta reserva? A doação volta a ficar disponível para outras ONGs.')) {
            return;
        }

        botao.disabled = true;

        try {
            await cancelarReserva(botao.dataset.id);
            mostrarMensagem('Reserva cancelada.', 'sucesso');
            await carregar();
        } catch (erro) {
            botao.disabled = false;
            tratarErroApi(erro);
        }
    });

    carregar();
});
