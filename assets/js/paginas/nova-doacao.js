iniciarPagina(async () => {
    const formulario = document.getElementById('form-doacao');
    const campos = formulario.elements;
    const botao = document.getElementById('btn-salvar');
    const titulo = document.getElementById('titulo-pagina');

    const id = new URLSearchParams(window.location.search).get('id');
    const editando = id !== null;

    const agora = new Date();
    campos.limite_retirada.min = paraDatetimeLocal(agora);
    campos.limite_retirada.max = paraDatetimeLocal(new Date(agora.getTime() + 48 * 60 * 60 * 1000));

    if (editando) {
        titulo.textContent = 'Editar doação';
        document.title = 'Editar Doação | Alimento Para Todos';
        botao.textContent = 'Salvar alterações';
    }

    try {
        preencherCategorias(campos.categoria_id, await listarCategorias());
    } catch (erro) {
        tratarErroApi(erro);
    }

    if (editando) {
        try {
            const doacao = await buscarDoacao(id);

            campos.titulo.value = doacao.titulo;
            campos.categoria_id.value = doacao.categoria_id;
            campos.quantidade.value = doacao.quantidade;
            campos.limite_retirada.value = paraDatetimeLocal(doacao.limite_retirada);
            campos.descricao.value = doacao.descricao || '';

            if (doacao.situacao !== 'disponivel') {
                bloquearFormulario(formulario);
                mostrarMensagem('Só é possível editar doações disponíveis.', 'erro');
            }
        } catch (erro) {
            bloquearFormulario(formulario);
            tratarErroApi(erro);
        }
    }

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        mostrarMensagem('');

        const dados = lerFormulario(formulario);
        const limite = converterData(dados.limite_retirada);

        if (!limite || limite <= new Date()) {
            mostrarMensagem('Escolha um prazo de retirada no futuro.', 'erro');
            campos.limite_retirada.focus();
            return;
        }

        botao.disabled = true;

        try {
            if (editando) {
                await editarDoacao(id, dados);
                irPara('comercio/minhas-doacoes.html?aviso=editada');
            } else {
                await criarDoacao(dados);
                irPara('comercio/minhas-doacoes.html?aviso=criada');
            }
        } catch (erro) {
            botao.disabled = false;
            tratarErroApi(erro);
        }
    });
});
