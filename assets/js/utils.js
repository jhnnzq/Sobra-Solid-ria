const STATUS = {
    disponivel: { rotulo: 'Disponível', classe: 'disponivel' },
    reservada: { rotulo: 'Reservada', classe: 'reservada' },
    retirada: { rotulo: 'Retirada', classe: 'retirada' },
    cancelada: { rotulo: 'Cancelada', classe: 'cancelada' },
    expirada: { rotulo: 'Expirada', classe: 'expirada' },
    ativa: { rotulo: 'Aguardando retirada', classe: 'reservada' },
    concluida: { rotulo: 'Retirada', classe: 'retirada' },
};

function criar(tag, opcoes = {}, filhos = []) {
    const elemento = document.createElement(tag);
    if (opcoes.classe) {
        elemento.className = opcoes.classe;
    }
    if (opcoes.texto !== undefined && opcoes.texto !== null) {
        elemento.textContent = String(opcoes.texto);
    }
    if (opcoes.atributos) {
        Object.entries(opcoes.atributos).forEach(([nome, valor]) => {
            elemento.setAttribute(nome, valor);
        });
    }
    filhos.filter((filho) => filho !== null && filho !== undefined && filho !== '').forEach((filho) => {
        elemento.append(filho);
    });
    return elemento;
}

function linhaInfo(rotulo, valor) {
    return criar('p', {}, [criar('strong', { texto: `${rotulo}: ` }), String(valor ?? '')]);
}

function converterData(valor) {
    if (!valor) {
        return null;
    }
    if (valor instanceof Date) {
        return valor;
    }
    const data = new Date(String(valor).replace(' ', 'T'));
    return isNaN(data.getTime()) ? null : data;
}

function formatarDataHora(valor) {
    const data = converterData(valor);
    if (!data) {
        return '';
    }
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function paraDatetimeLocal(valor) {
    const data = converterData(valor);
    if (!data) {
        return '';
    }
    const doisDigitos = (numero) => String(numero).padStart(2, '0');
    return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`
        + `T${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

function somenteNumeros(valor) {
    return String(valor ?? '').replace(/\D/g, '');
}

function formatarTelefone(telefone) {
    const numeros = somenteNumeros(telefone);
    if (numeros.length === 11) {
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }
    if (numeros.length === 10) {
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }
    return numeros;
}

function linkWhatsapp(telefone, texto) {
    const url = `https://wa.me/55${somenteNumeros(telefone)}`;
    return texto ? `${url}?text=${encodeURIComponent(texto)}` : url;
}

function botaoWhatsapp(telefone, texto, classe) {
    return criar('a', {
        classe,
        texto: 'Chamar no WhatsApp',
        atributos: { href: linkWhatsapp(telefone, texto), target: '_blank', rel: 'noopener' },
    });
}

function mostrarMensagem(conteudo, tipo = 'erro') {
    const elemento = document.getElementById('mensagem');
    if (!elemento) {
        return;
    }
    const partes = Array.isArray(conteudo) ? conteudo : [conteudo];
    const temConteudo = partes.some((parte) => parte);
    elemento.replaceChildren(...partes.filter(Boolean));
    elemento.className = temConteudo ? `mensagem ${tipo}` : 'mensagem';
    if (temConteudo) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function lerFormulario(formulario) {
    return Object.fromEntries(new FormData(formulario).entries());
}

function bloquearFormulario(formulario) {
    formulario.querySelectorAll('input, select, textarea, button').forEach((campo) => {
        campo.disabled = true;
    });
}

function seloStatus(situacao) {
    const status = STATUS[situacao] || { rotulo: situacao, classe: '' };
    return criar('span', { classe: `status ${status.classe}`, texto: status.rotulo });
}

function mostrarListaVazia(lista, texto) {
    lista.replaceChildren(criar('p', { classe: 'lista-vazia', texto }));
}

function preencherCategorias(select, categorias) {
    categorias.forEach((categoria) => {
        select.append(criar('option', { texto: categoria.nome, atributos: { value: categoria.id } }));
    });
}

function confirmar(pergunta) {
    return window.confirm(pergunta);
}
