iniciarPagina(() => {
    const formulario = document.getElementById('form-cadastro');
    const botao = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        mostrarMensagem('');

        const dados = lerFormulario(formulario);

        if (dados.senha !== dados.confirmar_senha) {
            mostrarMensagem('As senhas não conferem.', 'erro');
            formulario.elements.confirmar_senha.focus();
            return;
        }

        const telefone = somenteNumeros(dados.telefone);
        if (telefone.length < 10 || telefone.length > 11) {
            mostrarMensagem('Informe o telefone com DDD (10 ou 11 números).', 'erro');
            formulario.elements.telefone.focus();
            return;
        }

        botao.disabled = true;

        try {
            await cadastrarUsuario({
                perfil: dados.perfil,
                nome: dados.nome,
                email: dados.email,
                senha: dados.senha,
                telefone,
                endereco: dados.endereco,
                bairro: dados.bairro,
            });
        } catch (erro) {
            mostrarMensagem(erro.message, 'erro');
            botao.disabled = false;
            return;
        }

        try {
            const usuario = await entrar(dados.email, dados.senha);
            irParaInicio(usuario.perfil);
        } catch (erro) {
            irPara('index.html');
        }
    });
});
