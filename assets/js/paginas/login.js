iniciarPagina(() => {
    const formulario = document.getElementById('form-login');
    const botao = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        mostrarMensagem('');

        const dados = lerFormulario(formulario);
        botao.disabled = true;

        try {
            const usuario = await entrar(dados.email, dados.senha);
            irParaInicio(usuario.perfil);
        } catch (erro) {
            mostrarMensagem(erro.message, 'erro');
            botao.disabled = false;
        }
    });
});
