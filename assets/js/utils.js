const STATUS = {
    disponivel: { rotulo: 'Disponível', classe: 'disponivel' },
    reservada: { rotulo: 'Reservada', classe: 'reservada' },
    ativa: { rotulo: 'Reservada', classe: 'reservada' },
    retirada: { rotulo: 'Retirada', classe: 'retirada' },
    concluida: { rotulo: 'Retirada', classe: 'retirada' },
    cancelada: { rotulo: 'Cancelada', classe: 'cancelada' },
    expirada: { rotulo: 'Expirada', classe: 'expirada' },
};

function escaparHtml(valor) {
    const trocas = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(valor ?? '').replace(/[&<>"']/g, (caractere) => trocas[caractere]);
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

function mostrarMensagem(texto, tipo = 'erro') {
    const elemento = document.getElementById('mensagem');
    if (!elemento) {
        return;
    }
    elemento.textContent = texto || '';
    elemento.className = texto ? `mensagem ${tipo}` : 'mensagem';
    if (texto) {
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
    return `<span class="status ${status.classe}">${escaparHtml(status.rotulo)}</span>`;
}

function listaVazia(texto) {
    return `<p class="lista-vazia">${escaparHtml(texto)}</p>`;
}

function preencherCategorias(select, categorias) {
    categorias.forEach((categoria) => {
        const opcao = document.createElement('option');
        opcao.value = categoria.id;
        opcao.textContent = categoria.nome;
        select.appendChild(opcao);
    });
}
