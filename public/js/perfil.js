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

// --- 2. Gerenciamento da Navbar ---
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
        document.getElementById('btnLogout').addEventListener('click', fazerLogout);
    } else {
        window.location.href = 'index.html';
    }
}


// --- 3. Carregamento de Dados ---

async function carregarDadosPerfil(userId) {
    try {
        // 1. Carregar dados básicos do usuário (Isso sempre vem da API)
        const userResponse = await fetch(API_USUARIOS_URL + userId);

        if (!userResponse.ok) {
            if (userResponse.status === 404 || userResponse.status === 401 || userResponse.status === 403) {
                console.warn("Usuário não encontrado ou sessão inválida. Forçando logout.");
                exibirToast("Sua sessão expirou. Faça o login novamente.", 'orange');
                setTimeout(fazerLogout, 1500);
                return;
            }
            throw new Error('Falha ao carregar dados do usuário.');
        }

        const userData = await userResponse.json();
        console.log("Dados do usuário carregados:", userData);

        popularColunaEsquerda(userData);
        popularColunaDireita(userData);

        let servicosData;

        // 2. Carregar serviços do usuário
        // *** LÓGICA DE DEMONSTRAÇÃO ESTATICA PARA ID 4 ***
        
        // Usamos '==' para comparar string da URL (userId) com número
        if (userId == 5) {
            
            console.log("Carregando dados ESTÁTICOS para o perfil ID 5 (Matheus).");

            servicosData = [
                {
                    id: 5,
                    titulo: "Carona Unifio",
                    categoria: "Corrida",
                    valor: 2.00,
                    imagem_url: "./img/hb-servico.webp", // Caminho da imagem
                    stars: 4,
                    habilidade_desejada: "Corrida", 
                    data_publicacao: Date.now() - 1500 * 80 * 90, // Data de postagem (simulada)
                    horarios_disponiveis: "Seg/Qui • 19h",
                    detalhes_grupo: "Maximo 3 pessoas",
                    unidade_medida: "Km", 
                    includes: "Ar condicionado",
                    includes: "Carro de luxo"
                }
                // Você pode adicionar mais posts estáticos aqui se quiser
            ];

        } else {
            // Se não for o Matheus, busca da API normalmente
            console.log(`Carregando dados da API para o perfil ID ${userId}.`);
            const servicosResponse = await fetch(API_SERVICOS_USUARIO_URL + userId);
            if (!servicosResponse.ok) throw new Error('Falha ao carregar serviços.');
            servicosData = await servicosResponse.json();
        }
        // *** FIM DA LÓGICA DE DEMONSTRAÇÃO ***

        // 3. Popular a coluna central
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
        let formatado = new Intl.DateTimeFormat('pt-BR', opcoes).format(data);
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
    document.getElementById('membroDesde').textContent = formatarData(user.data_cadastro);
    const profissaoEl = document.getElementById('perfilProfissao');
    if (user.profissao) {
        profissaoEl.textContent = user.profissao;
    } else {
        profissaoEl.classList.add('d-none');
    }
    if (user.avatar_url) {
        colunaEsquerda.querySelector('img').src = user.avatar_url;
    }
    const btnPerfilAcao = document.getElementById('btnPerfilAcao');
    if (isOwner) {
        btnPerfilAcao.textContent = 'Editar Meu Perfil';
        btnPerfilAcao.onclick = () => { window.location.href = 'pagina_editarPerfil.html'; };
        btnPerfilAcao.classList.remove('btn-primary');
        btnPerfilAcao.classList.add('btn-outline-secondary');
    } else {
        btnPerfilAcao.textContent = 'Seguir';
        btnPerfilAcao.classList.add('btn-primary');
    }
    const hashtagsEl = document.getElementById('perfilHashtags');
    if (user.hashtags) {
        const container = document.getElementById('perfilHashtagsContainer');
        container.innerHTML = '';
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

function popularColunaDireita(user) {
    document.getElementById('avaliacaoGeral').textContent = user.avaliacao_geral || 'N/A';
    document.getElementById('vendasTrocas').textContent = user.vendas_trocas || 0;
    document.getElementById('perfilLocal').textContent = user.local || 'Não informado';
}


// --- 4. Funções HELPER (money e timeAgo) ---

function money(value) {
    if (isNaN(value) || value === null) {
        // Se for troca ou não tiver preço, não mostra R$ 0,00
        // A lógica no card trata isso, mas é bom garantir.
        return ""; 
    }
    return Number(value).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function timeAgo(input) {
    const d = typeof input === "number" ? new Date(input) : new Date(input);
    if (isNaN(+d)) return "";
    const now = new Date();
    const diff = (now - d) / 1000; // seg
    const min = Math.floor(diff / 60);
    const h = Math.floor(diff / 3600);
    const day = Math.floor(diff / 86400);
    if (diff < 45) return "agora há pouco";
    if (min < 60) return `há ${min} ${min === 1 ? "min" : "mins"}`;
    if (h < 24) return `há ${h} ${h === 1 ? "hora" : "horas"}`;
    if (day === 1) return "ontem";
    if (day < 7) return `há ${day} ${day === 1 ? "dia" : "dias"}`;
    const sameYear = d.getFullYear() === now.getFullYear();
    const opts = {
        day: "2-digit",
        month: "short",
        ...(sameYear ? {} : { year: "numeric" }),
    };
    return d.toLocaleDateString("pt-BR", opts);
}


// --- 5. TEMPLATE DO CARD ---

const card = (p) => {
    
    // Lógica para Preço (não mostrar R$ 0,00 se for troca)
    let precoHtml = '';
    if (p.preco > 0) {
        precoHtml = `<span class="products-price">${money(p.preco)}<small>/${p.period || 'un'}</small></span>`;
    } else if (!p.needs || p.needs.length === 0) {
        // Se não tem preço E não tem 'needs', é "A combinar"
        precoHtml = `<span class="products-price" style="font-size: 1rem; color: var(--bs-secondary);">A combinar</span>`;
    }

    // Lógica para 'Troco por:' (só mostrar se houver 'needs')
    let metaBarHtml = '';
    if (p.needs && p.needs.length > 0) {
        metaBarHtml = `
            <div class="meta-bar">
              <span class="meta-title"><i class="fa-solid fa-right-left"></i> Troco por:</span>
              <div class="needs">
                ${(p.needs)
                  .map((tag) => `<span class="chip chip-need">${tag}</span>`)
                  .join("")}
              </div>
            </div>
        `;
    }

    return `
      <article class="product-card" data-id="${p.id}">
        <div>
          <a class="linkFormat" href="pagina_${p.id}.html"> <div class="img-wrap">
            <img class="products-img" src="${p.imagem}" alt="${p.nome}">
            <span class="chip chip-category">${p.categoria || "Serviço"}</span>
          </div>

          <div class="products-info">
            <div class="product-head">
              <h3 class="products-name">${p.nome}</h3>
              <div class="price-stack">
                ${precoHtml}
              </div>
            </div>

            ${metaBarHtml} <ul class="specs">
              ${p.schedule ? `
                <li class="spec spec--schedule">
                  <i class="fa-regular fa-clock"></i><span>${p.schedule}</span>
                </li>` : ''}

              ${p.group ? `
                <li class="spec spec--group">
                  <i class="fa-solid fa-user-group"></i><span>${p.group}</span>
                </li>` : ''}
            </ul>

            ${p.include?.length ? `
              <ul class="includes">
                ${p.include.map(x => `
                  <li><i class="fa-solid fa-circle-check" aria-hidden="true"></i>${x}</li>
                `).join('')}
              </ul>
            ` : ''}

          </a>
        </div>
        
        <div class="product-footer">
          <img class="author-avatar" src="${p.authorAvatar}" alt="${p.authorName}">

          <div class="author-meta">
            <span class="author-name">${p.authorName}</span>
            <<div class="author-stars" aria-label="${p.stars} de 5">
            ${"★".repeat(p.stars || 0)}${"☆".repeat(5 - (p.stars || 0))}
          </div>
          </div>

          <div class="post-meta"
            title="${new Date(p.postedAtMs ?? p.postedAt).toLocaleString("pt-BR")}">
            <i class="fa-regular fa-clock"></i>
            <span>${timeAgo(p.postedAtMs ?? p.postedAt)}</span>
            ${
              p.location
                ? `
              <span class="dot">•</span>
              <span class="location"><i class="fa-solid fa-location-dot"></i> ${p.location}</span>
            `
                : ""
            }
          </div>
        </div>
      </article>
    `;
};


// --- 6. FUNÇÃO POPULARCOLUNACENTRAL (O ADAPTADOR) ---

function popularColunaCentral(user, servicos) {
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

    // Renderiza cada serviço usando o novo template
    servicos.forEach(servico => {
        
        // --- ADAPTADOR (Converte dados da API 'servico' para o formato 'p' do template) ---
        const p = {
            id: servico.id,
            nome: servico.titulo,                 
            categoria: servico.categoria,
            preco: servico.valor,                  
            imagem: servico.imagem_url || `https://placehold.co/600x300/eee/aaa?text=${servico.categoria || 'Sem Foto'}`,
            authorAvatar: user.avatar_url || 'img/man.png',
            authorName: `${user.primeiro_nome} ${user.sobrenome}`,
            authorId: user.id,
            stars: user.stars || 0,
            location: user.local, 
            needs: servico.habilidade_desejada ? servico.habilidade_desejada.split(',').map(s => s.trim()) : [],
            postedAtMs: servico.data_publicacao || servico.data_cadastro, 
            schedule: servico.horarios_disponiveis, 
            group: servico.detalhes_grupo,          
            period: servico.unidade_medida || (servico.tipo === 'Venda' ? 'un' : ''),
            include: servico.includes ? servico.includes.split(',').map(s => s.trim()) : [] 
        };
        // --- FIM DO ADAPTADOR ---

        colunaCentral.innerHTML += card(p);
    });
}


// --- 7. Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    if (!loggedInUserId) {
        window.location.href = 'index.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    perfilId = urlParams.get('id') || loggedInUserId;

    gerenciarNavbar();
    carregarDadosPerfil(perfilId);
});