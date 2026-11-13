iniciarPagina(() => {
    const lista = document.getElementById('lista-reservas');

    function montarCard(reserva) {
        const descricao = reserva.descricao
            ? `<p>${escaparHtml(reserva.descricao)}</p>`
            : '';

        const retirada = reserva.retirado_em
            ? `<p><strong>Retirado em:</strong> ${escaparHtml(formatarDataHora(reserva.retirado_em))}</p>`
            : '';

        const endereco = [reserva.comercio_endereco, reserva.comercio_bairro].filter(Boolean).join(', ');

        const acoes = reserva.situacao === 'ativa'
            ? `
                <div class="doacao-acoes">
                    <a href="${linkWhatsapp(reserva.comercio_telefone, `Olá! Reservei a doação "${reserva.titulo}" pelo Sobra Solidária.`)}" class="btn-whatsapp" target="_blank" rel="noopener">
                        Chamar no WhatsApp
                    </a>
                    <button type="button" class="btn-cancelar" data-id="${escaparHtml(reserva.reserva_id)}">
                        Cancelar reserva
                    </button>
                </div>
            `
            : '';

        return `
            <article class="doacao-card">
                <div class="doacao-topo">
                    <h2>${escaparHtml(reserva.titulo)}</h2>
                    ${seloStatus(reserva.situacao)}
                </div>

                <span class="categoria">${escaparHtml(reserva.categoria)}</span>

                <div class="doacao-informacoes">
                    <p><strong>Quantidade:</strong> ${escaparHtml(reserva.quantidade)}</p>
                    <p><strong>Retirar até:</strong> ${escaparHtml(formatarDataHora(reserva.limite_retirada))}</p>
                    <p><strong>Reservado em:</strong> ${escaparHtml(formatarDataHora(reserva.reservado_em))}</p>
                    ${retirada}
                    ${descricao}
                </div>

                <div class="doacao-contato">
                    <p><strong>${escaparHtml(reserva.comercio_nome)}</strong></p>
                    <p>${escaparHtml(endereco)}</p>
                    <p>${escaparHtml(formatarTelefone(reserva.comercio_telefone))}</p>
                </div>

                ${acoes}
            </article>
        `;
    }

    async function carregar() {
        lista.innerHTML = listaVazia('Carregando reservas...');

        try {
            const reservas = await listarMinhasReservas();
            lista.innerHTML = reservas.length
                ? reservas.map(montarCard).join('')
                : listaVazia('Você ainda não reservou nenhuma doação.');
        } catch (erro) {
            lista.innerHTML = '';
            tratarErroApi(erro);
        }
    }

    lista.addEventListener('click', async (evento) => {
        const botao = evento.target.closest('button[data-id]');
        if (!botao) {
            return;
        }

        if (!window.confirm('Deseja cancelar esta reserva? A doação volta a ficar disponível.')) {
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
