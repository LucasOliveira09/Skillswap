// public/js/perfil.js

const API_USUARIOS_URL = 'http://localhost:3000/api/usuarios/';
const API_SERVICOS_USUARIO_URL = 'http://localhost:3000/api/servicos/usuario/';
let perfilId = null; 
let loggedInUserId = localStorage.getItem('usuarioId');


// --- 1. Funções de Utilidade (Logout e Toast) ---

function fazerLogout() {
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioNome');
    
    exibirToast("Sessão encerrada. Até logo!", 'orange');
    
    setTimeout(() => { window.location.href = 'index.html'; }, 1500);
}

function exibirToast(text, type) {
    let backgroundStyle;
    if (type === 'green') {
        backgroundStyle = "linear-gradient(to right, #00b09b, #96c93d)";
    } else if (type === 'red') {
        backgroundStyle = "linear-gradient(to right, #ff5f6d, #ffc371)";
    } else { // orange/info
        backgroundStyle = "linear-gradient(to right, #ff9900, #ffcc66)";
    }

    if (typeof Toastify === 'undefined') {
        console.warn("Toastify não carregado, exibindo alerta em console.");
        return;
    }

    Toastify({
        text: text,
        duration: 4000,
        gravity: "top", 
        position: "right", 
        stopOnFocus: true,
        style: { background: backgroundStyle, opacity: 0.9 },
    }).showToast();
}

// --- 2. Gerenciamento da Navbar (Menu Interativo) ---

function gerenciarNavbar() {
    const usuarioNome = localStorage.getItem('usuarioNome');
    const navUserName = document.getElementById('navUserName');
    const menuTrigger = document.getElementById('userMenuTrigger');
    const menuContent = document.getElementById('userMenuContent');
    const dropdown = document.getElementById('userMenuDropdown');
    
    if (usuarioNome && navUserName) {
        const primeiroNome = usuarioNome.split(' ')[0];
        navUserName.textContent = `Olá, ${primeiroNome}`;
        
        // Conteúdo do Dropdown
        menuContent.innerHTML = `
            <a href="pagina_editarPerfil.html" class="menu-item">
                Editar Perfil
            </a>
            <hr class="menu-divider">
            <button onclick="fazerLogout()" class="menu-item menu-logout-btn">
                Sair
            </button>
        `;
        
        // Event listeners para o dropdown
        menuTrigger.addEventListener('click', () => {
            menuContent.classList.toggle('is-open');
            dropdown.classList.toggle('is-active');
        });

        document.addEventListener('click', (event) => {
            if (dropdown && !dropdown.contains(event.target)) {
                menuContent.classList.remove('is-open');
                dropdown.classList.remove('is-active');
            }
        });

    } else {
        // Se não estiver logado, redireciona
        window.location.href = 'index.html';
    }
}


// --- 3. Carregamento e Renderização de Dados ---

async function carregarDadosPerfil(userId) {
    try {
        // 1. Carregar dados básicos do usuário
        const userResponse = await fetch(API_USUARIOS_URL + userId);
        if (!userResponse.ok) throw new Error('Falha ao carregar dados do usuário.');
        const userData = await userResponse.json();

        popularColunaEsquerda(userData);

        // 2. Carregar serviços do usuário
        const servicosResponse = await fetch(API_SERVICOS_USUARIO_URL + userId);
        if (!servicosResponse.ok) throw new Error('Falha ao carregar serviços.');
        const servicosData = await servicosResponse.json();
        
        popularColunaCentral(userData, servicosData);


    } catch (error) {
        console.error("Erro no carregamento completo do perfil:", error);
        exibirToast("Erro ao carregar o perfil. " + error.message, 'red');
    }
}

function popularColunaEsquerda(user) {
    // Coluna esquerda (dados principais)
    const colunaEsquerda = document.querySelector('.coluna-esquerda > div:first-child');
    if (!colunaEsquerda) return;

    const nomeCompleto = `${user.primeiro_nome} ${user.sobrenome}`; 
    const isOwner = (user.id == loggedInUserId);
    
    // Atualiza nome principal e trilha
    colunaEsquerda.querySelector('h2').textContent = nomeCompleto;
    document.getElementById('perfilTrilha').textContent = nomeCompleto;
    
    // Simulação de Data de Cadastro (Não temos o campo no DB, então usamos uma data estática)
    // Se o DB tivesse, usaríamos: new Date(user.data_cadastro).toLocaleDateString('pt-BR');
    document.getElementById('membroDesde').textContent = '14 de JAN, 2018'; 
    document.getElementById('perfilLocal').textContent = 'Ourinhos/SP';
    
    // Lógica do botão
    const btnPerfilAcao = document.getElementById('btnPerfilAcao');
    if (isOwner) {
        btnPerfilAcao.textContent = 'Editar Meu Perfil';
        btnPerfilAcao.onclick = () => { window.location.href = 'pagina_editarPerfil.html'; };
    } else {
         btnPerfilAcao.textContent = 'Seguir';
         // Lógica para seguir outro usuário aqui
    }
    
    // Se o seu HTML tivesse campos como 'profissao', 'avatar', etc. eles seriam preenchidos aqui.
}

function popularColunaCentral(user, servicos) {
    const colunaCentral = document.getElementById('colunaCentralServicos');
    if (!colunaCentral) return;
    colunaCentral.innerHTML = ''; // Limpa o conteúdo estático

    if (servicos.length === 0) {
        colunaCentral.innerHTML = `
            <article style="text-align: center; padding: 40px;">
                <p style="color: #666;">Nenhum serviço/postagem publicada por ${user.primeiro_nome} ainda.</p>
            </article>
        `;
        return;
    }

    servicos.forEach(servico => {
        const article = document.createElement('article');
        
        const primeiroNome = user.primeiro_nome;
        const nomeCompleto = `${user.primeiro_nome} ${user.sobrenome}`;

        let detalhesTrocaVenda = '';
        if (servico.tipo === 'Venda') {
            const valorFormatado = servico.valor ? `R$${servico.valor.toFixed(2)}` : 'A Combinar';
            detalhesTrocaVenda = `<p style="font-weight: 700;">${valorFormatado}/hora</p>`;
        } else if (servico.tipo === 'Troca') {
            detalhesTrocaVenda = `<p><strong>Troca por:</strong> ${servico.habilidade_desejada || 'A Combinar'}</p>`;
        }

        article.innerHTML = `
            <header class="perfil-display">
                <img src="img/foto-perfil-postagem.png" alt="Foto de perfil do ${primeiroNome}">
                <h3>${nomeCompleto}</h3>
                <p>13 seguidores</p>
            </header>
            <div>
                <!-- Imagem de placeholder: substitua por uma imagem real do serviço se tiver -->
                <img src="https://placehold.co/600x400/8cc63f/255188?text=SERVI%C3%C3%87O+DE+${servico.categoria || 'SKILL'}" alt="Imagem do serviço">
            </div>
            <footer>
                ${detalhesTrocaVenda}
                <p>${servico.titulo}</p>
                <p style="font-size: 0.9em; color: #555;">${servico.descricao}</p>
            </footer>
        `;
        colunaCentral.appendChild(article);
    });
}


// --- 4. Inicialização ---

document.addEventListener('DOMContentLoaded', () => {
    
    // Redireciona se não houver ID logado
    if (!loggedInUserId) {
        window.location.href = 'index.html'; 
        return;
    }
    
    // Por enquanto, o perfil visualizado é sempre o perfil do usuário logado
    perfilId = loggedInUserId; 
    
    gerenciarNavbar();
    carregarDadosPerfil(perfilId);
});
