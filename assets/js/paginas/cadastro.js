iniciarPagina(() => {
    const formulario = document.getElementById('form-cadastro');
    const campos = formulario.elements;
    const botao = formulario.querySelector('button[type="submit"]');

    function validar(dados) {
        if (dados.perfil !== 'comercio' && dados.perfil !== 'ong') {
            return ['perfil', 'Escolha se a conta é de comércio ou de ONG.'];
        }
        if (!dados.nome.trim()) {
            return ['nome', 'Informe o nome.'];
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) {
            return ['email', 'Informe um e-mail válido.'];
        }
        const telefone = somenteNumeros(dados.telefone);
        if (telefone.length < 10 || telefone.length > 11) {
            return ['telefone', 'Informe o telefone com DDD (10 ou 11 números).'];
        }
        if (!dados.bairro.trim()) {
            return ['bairro', 'Informe o bairro.'];
        }
        if (dados.senha.length < 8) {
            return ['senha', 'A senha precisa ter pelo menos 8 caracteres.'];
        }
        if (dados.senha !== dados.confirmar_senha) {
            return ['confirmar_senha', 'As senhas não conferem.'];
        }
        return null;
    }

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        mostrarMensagem('');

        const dados = lerFormulario(formulario);
        const problema = validar(dados);

        if (problema) {
            mostrarMensagem(problema[1], 'erro');
            campos[problema[0]].focus();
            return;
        }

        botao.disabled = true;

        try {
            await cadastrarUsuario({
                perfil: dados.perfil,
                nome: dados.nome.trim(),
                email: dados.email.trim(),
                senha: dados.senha,
                telefone: somenteNumeros(dados.telefone),
                endereco: dados.endereco.trim(),
                bairro: dados.bairro.trim(),
            });
        } catch (erro) {
            mostrarMensagem(erro.message, 'erro');
            botao.disabled = false;
            return;
        }

        try {
            const usuario = await entrar(dados.email.trim(), dados.senha);
            irParaInicio(usuario.perfil);
        } catch (erro) {
            irPara('index.html');
        }
    });
});
