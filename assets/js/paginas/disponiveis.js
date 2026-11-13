iniciarPagina(async () => {
    const formulario = document.getElementById('form-filtros');
    const lista = document.getElementById('lista-doacoes');

    function montarCard(doacao) {
        const descricao = doacao.descricao
            ? `<p>${escaparHtml(doacao.descricao)}</p>`
            : '';

        return `
            <article class="doacao-card">
                <div class="doacao-topo">
                    <h2>${escaparHtml(doacao.titulo)}</h2>
                    ${seloStatus('disponivel')}
                </div>

                <span class="categoria">${escaparHtml(doacao.categoria)}</span>

                <div class="doacao-informacoes">
                    <p><strong>Comércio:</strong> ${escaparHtml(doacao.comercio_nome)}</p>
                    <p><strong>Bairro:</strong> ${escaparHtml(doacao.bairro)}</p>
                    <p><strong>Quantidade:</strong> ${escaparHtml(doacao.quantidade)}</p>
                    <p><strong>Retirar até:</strong> ${escaparHtml(formatarDataHora(doacao.limite_retirada))}</p>
                    ${descricao}
                </div>

                <div class="doacao-acoes">
                    <button type="button" class="btn-reservar" data-id="${escaparHtml(doacao.id)}">
                        Reservar
                    </button>
                </div>
            </article>
        `;
    }

    async function carregar() {
        const filtros = lerFormulario(formulario);
        const filtrando = Boolean(filtros.bairro || filtros.categoria);

        lista.innerHTML = listaVazia('Carregando doações...');

        try {
            const doacoes = await listarDoacoesDisponiveis(filtros);
            lista.innerHTML = doacoes.length
                ? doacoes.map(montarCard).join('')
                : listaVazia(filtrando
                    ? 'Nenhuma doação encontrada com esses filtros.'
                    : 'Nenhuma doação disponível no momento.');
        } catch (erro) {
            lista.innerHTML = '';
            tratarErroApi(erro);
        }
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

        if (!window.confirm('Deseja reservar esta doação?')) {
            return;
        }

        botao.disabled = true;

        try {
            const resultado = await reservarDoacao(Number(botao.dataset.id));
            const comercio = resultado.comercio || {};
            const endereco = [comercio.endereco, comercio.bairro].filter(Boolean).join(', ');

            mostrarMensagem(
                `Reserva feita! Retire com ${comercio.nome}`
                + (endereco ? ` (${endereco})` : '')
                + ` — telefone ${formatarTelefone(comercio.telefone)}. Veja os detalhes em Minhas reservas.`,
                'sucesso'
            );
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
