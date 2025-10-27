// public/js/perfil.js

const API_USUARIOS_URL = 'http://localhost:3000/api/usuarios/';
const API_SERVICOS_USUARIO_URL = 'http://localhost:3000/api/servicos/usuario/';
let perfilId = null; 
let loggedInUserId = localStorage.getItem('usuarioId');


// --- 1. Funções de Utilidade (Logout e Toast) ---
// (Sem alterações, já está ótimo)
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

// --- 2. Gerenciamento da Navbar (ATUALIZADO PARA BOOTSTRAP) ---

function gerenciarNavbar() {
    const usuarioNome = localStorage.getItem('usuarioNome');
    const navUserName = document.getElementById('navUserName');
    const menuContent = document.getElementById('userMenuContent');
    
    if (!navUserName || !menuContent) {
        console.error("Elementos da navbar não encontrados.");
        return;
    }

    if (usuarioNome) {
        const primeiroNome = usuarioNome.split(' ')[0];
        navUserName.textContent = `Olá, ${primeiroNome}`;
        
        // Conteúdo do Dropdown (Bootstrap)
        // Usamos <li> e <a class="dropdown-item">
        menuContent.innerHTML = `
            <li>
                <a class="dropdown-item" href="pagina_editarPerfil.html">
                    Editar Perfil
                </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
                <button id="btnLogout" class="dropdown-item text-danger">
                    Sair
                </button>
            </li>
        `;
        
        // Adiciona listener ao botão Sair
        document.getElementById('btnLogout').addEventListener('click', fazerLogout);

    } else {
        // Se não estiver logado, redireciona (Sua lógica original)
        window.location.href = 'index.html';
    }
    
    // NOTA: A lógica de abrir/fechar o dropdown agora é 100% controlada
    // pelo Bootstrap (data-bs-toggle="dropdown") e seu JS (bootstrap.bundle.min.js).
    // Não precisamos mais de addEventListeners para 'click' no menu.
}


// --- 3. Carregamento e Renderização de Dados ---
// (Função carregarDadosPerfil e popularColunaEsquerda/Direita 
// NÃO PRECISAM MUDAR, pois os IDs foram mantidos no HTML)

// Em /js/perfil.js

async function carregarDadosPerfil(userId) {
    try {
        // 1. Carregar dados básicos do usuário
        const userResponse = await fetch(API_USUARIOS_URL + userId);
        
        // --- MELHORIA DE CÓDIGO AQUI ---
        if (!userResponse.ok) {
            // Se o usuário não foi encontrado (404) ou não está autorizado (401, 403)
            if (userResponse.status === 404 || userResponse.status === 401 || userResponse.status === 403) {
                console.warn("Usuário não encontrado ou sessão inválida. Forçando logout.");
                exibirToast("Sua sessão expirou. Faça o login novamente.", 'orange');
                
                // Chama a função de logout que já existe no seu código
                setTimeout(fazerLogout, 1500); 
                return; // Para a execução da função aqui
            }
            // Se for outro erro (como 500), lança o erro genérico
            throw new Error('Falha ao carregar dados do usuário.');
        }
        // --- FIM DA MELHORIA ---

        const userData = await userResponse.json();
        console.log(userData);

        popularColunaEsquerda(userData);
        popularColunaDireita(userData); 

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

function formatarData(dataISO) {
    if (!dataISO) return '...';
    try {
        const data = new Date(dataISO);
        const opcoes = { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        };
        // Converte para "26 de out. de 2025"
        let formatado = new Intl.DateTimeFormat('pt-BR', opcoes).format(data);
        // Ajusta para "26 de OUT, 2025"
        formatado = formatado.replace('de ', '').replace('.', ',');
        return formatado.toUpperCase();
    } catch (e) {
        console.warn("Data em formato inválido:", dataISO);
        return '...';
    }
}

function popularColunaEsquerda(user) {
   
    const colunaEsquerda = document.getElementById('perfilInfoCard');
    if (!colunaEsquerda) return;

    const nomeCompleto = `${user.primeiro_nome} ${user.sobrenome}`; 
    const isOwner = (user.id == loggedInUserId);
    
    colunaEsquerda.querySelector('h2').textContent = nomeCompleto;
    document.getElementById('perfilTrilha').textContent = nomeCompleto;
    
    // (Simulação de dados, como antes)
    document.getElementById('membroDesde').textContent = formatarData(user.data_cadastro);
    
    // Preenche os campos que vêm da API (se vierem)
    const profissaoEl = document.getElementById('perfilProfissao');
    if (user.profissao) {
        profissaoEl.textContent = user.profissao;
    } else {
        profissaoEl.classList.add('d-none'); // Esconde se não tiver profissão
    }

    if (user.avatar_url) {
        colunaEsquerda.querySelector('img').src = user.avatar_url;
    }
    
    const btnPerfilAcao = document.getElementById('btnPerfilAcao');
    if (isOwner) {
        btnPerfilAcao.textContent = 'Editar Meu Perfil';
        btnPerfilAcao.onclick = () => { window.location.href = 'pagina_editarPerfil.html'; };
        // Estilo Bootstrap para "Editar"
        btnPerfilAcao.classList.remove('btn-primary');
        btnPerfilAcao.classList.add('btn-outline-secondary');
    } else {
        btnPerfilAcao.textContent = 'Seguir';
        // Estilo Bootstrap para "Seguir" (padrão)
        btnPerfilAcao.classList.add('btn-primary');
    }
    
    // (O ideal é refatorar o HTML de hashtags, mas por enquanto isso funciona)
    const hashtagsEl = document.getElementById('perfilHashtags');
    if(user.hashtags) {
        // Limpa o container
        const container = document.getElementById('perfilHashtagsContainer');
        container.innerHTML = '';
        // Cria badges Bootstrap
        user.hashtags.split(' ').forEach(tag => {
            if (tag.trim() === '') return;
            const badge = document.createElement('span');
            badge.className = 'badge bg-primary-subtle text-primary-emphasis border border-primary-subtle';
            badge.textContent = tag;
            container.appendChild(badge);
        });
    } else {
         hashtagsEl.textContent = 'Sem tags definidas.';
    }
}

// (Função que você adicionou na pergunta anterior)
function popularColunaDireita(user) {
    // ESTA FUNÇÃO TAMBÉM NÃO MUDA.
    // Ela busca por IDs (avaliacaoGeral, vendasTrocas, etc.)
    // que foram mantidos no novo HTML.
    document.getElementById('avaliacaoGeral').textContent = user.avaliacao_geral || 'N/A';
    document.getElementById('vendasTrocas').textContent = user.vendas_trocas || 0;
    document.getElementById('perfilLocal').textContent = user.local || 'Não informado';
}


function popularColunaCentral(user, servicos) {
    // ESTA FUNÇÃO FOI ATUALIZADA PARA CRIAR CARDS BOOTSTRAP
    
    const colunaCentral = document.getElementById('colunaCentralServicos');
    if (!colunaCentral) return;
    colunaCentral.innerHTML = ''; // Limpa o "Carregando..."

    if (servicos.length === 0) {
        colunaCentral.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body text-center p-5">
                    <h5 class="text-body-secondary">Nenhum serviço publicado</h5>
                    <p class="text-body-secondary small">
                        ${user.primeiro_nome} ainda não publicou nenhum serviço ou troca.
                    </p>
                </div>
            </div>
        `;
        return;
    }

    servicos.forEach(servico => {
        // Cria um card Bootstrap para cada serviço
        const card = document.createElement('article');
        card.className = 'card shadow-sm mb-4'; // mb-4 = margin-bottom
        
        const nomeCompleto = `${user.primeiro_nome} ${user.sobrenome}`;

        let detalhesTrocaVenda = '';
        if (servico.tipo === 'Venda') {
            const valorFormatado = servico.valor ? `R$${servico.valor.toFixed(2)}` : 'A Combinar';
            detalhesTrocaVenda = `<span class="h5 text-success fw-bold">${valorFormatado}/hora</span>`; // text-success é verde
        } else if (servico.tipo === 'Troca') {
            detalhesTrocaVenda = `
                <span class="text-body-secondary small">Troca por:</span>
                <p class="fw-medium mb-0">${servico.habilidade_desejada || 'A Combinar'}</p>
            `;
        }

        // URL da imagem (placeholder)
        const imgUrl = `https://placehold.co/600x300/8cc63f/255188?text=${servico.categoria || 'SKILL'}`;

        card.innerHTML = `
            <div class="card-header bg-white d-flex align-items-center gap-2 p-3">
                <img src="${user.avatar_url || 'img/man.png'}" alt="Foto de ${nomeCompleto}" class="rounded-circle" width="40" height="40">
                <div>
                    <h3 class="h6 mb-0">${nomeCompleto}</h3>
                    <p class="small text-body-secondary mb-0">13 seguidores (estático)</p>
                </div>
            </div>

            <img src="${imgUrl}" class="card-img-top" alt="Imagem do serviço ${servico.titulo}">

            <div class="card-body p-4">
                <div>${detalhesTrocaVenda}</div>
                <h4 class="h5 mt-2">${servico.titulo}</h4>
                <p class="card-text text-body-secondary">${servico.descricao}</p>
            </div>
        `;
        colunaCentral.appendChild(card);
    });
}


// --- 4. Inicialização ---

document.addEventListener('DOMContentLoaded', () => {
    
    // Redireciona se não houver ID logado
    if (!loggedInUserId) {
        window.location.href = 'index.html'; 
        return;
    }
    
    // (Lógica para pegar ID da URL ou do usuário logado - sem alterações)
    const urlParams = new URLSearchParams(window.location.search);
    perfilId = urlParams.get('id') || loggedInUserId; 
    
    gerenciarNavbar();
    carregarDadosPerfil(perfilId);
});