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
            return '';
        }

        const whatsapp = doacao.situacao === 'reservada'
            ? `<p><a href="${linkWhatsapp(doacao.ong_telefone, `Olá! Sobre a doação "${doacao.titulo}"`)}" target="_blank" rel="noopener">Chamar no WhatsApp</a></p>`
            : '';

        return `
            <div class="doacao-contato">
                <p><strong>Reservada por:</strong> ${escaparHtml(doacao.ong_nome)}</p>
                <p><strong>Telefone:</strong> ${escaparHtml(formatarTelefone(doacao.ong_telefone))}</p>
                ${whatsapp}
            </div>
        `;
    }

    function montarAcoes(doacao) {
        const acoes = [];

        if (doacao.situacao === 'disponivel') {
            acoes.push(`<a href="nova-doacao.html?id=${encodeURIComponent(doacao.id)}" class="btn-secundario">Editar</a>`);
        }

        if (doacao.situacao === 'reservada') {
            acoes.push(`<button type="button" class="btn-confirmar" data-acao="retirada" data-id="${escaparHtml(doacao.id)}">Confirmar retirada</button>`);
        }

        if (doacao.situacao === 'disponivel' || doacao.situacao === 'reservada') {
            acoes.push(`<button type="button" class="btn-cancelar" data-acao="cancelar" data-id="${escaparHtml(doacao.id)}">Cancelar</button>`);
        }

        return acoes.length ? `<div class="doacao-acoes">${acoes.join('')}</div>` : '';
    }

    function montarCard(doacao) {
        const descricao = doacao.descricao
            ? `<p>${escaparHtml(doacao.descricao)}</p>`
            : '';

        return `
            <article class="doacao-card">
                <div class="doacao-topo">
                    <h3>${escaparHtml(doacao.titulo)}</h3>
                    ${seloStatus(doacao.situacao)}
                </div>

                <p class="categoria">${escaparHtml(doacao.categoria)}</p>

                <div class="doacao-informacoes">
                    <p><strong>Quantidade:</strong> ${escaparHtml(doacao.quantidade)}</p>
                    <p><strong>Retirar até:</strong> ${escaparHtml(formatarDataHora(doacao.limite_retirada))}</p>
                    ${descricao}
                </div>

                ${montarContato(doacao)}
                ${montarAcoes(doacao)}
            </article>
        `;
    }

    async function carregar() {
        lista.innerHTML = listaVazia('Carregando doações...');

        try {
            const doacoes = await listarMinhasDoacoes();
            lista.innerHTML = doacoes.length
                ? doacoes.map(montarCard).join('')
                : listaVazia('Você ainda não cadastrou nenhuma doação.');
        } catch (erro) {
            lista.innerHTML = '';
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
            ? 'Deseja cancelar esta doação?'
            : 'Confirmar que a ONG retirou esta doação?';

        if (!window.confirm(pergunta)) {
            return;
        }

        botao.disabled = true;

        try {
            if (acao === 'cancelar') {
                await cancelarDoacao(id);
                mostrarMensagem('Doação cancelada.', 'sucesso');
            } else {
                await confirmarRetirada(id);
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
