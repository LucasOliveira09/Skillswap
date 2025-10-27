// js/servicePage.js
"use strict";


const API_SERVICOS_URL = 'http://localhost:3000/api/servicos'; 
const API_PRODUTOS_URL = 'http://localhost:3000/api/produtos'; 
const AUTH_KEY_NOVO = 'ss_auth_user'; // Sistema de login da pág. anúncio (JSON)
const AUTH_KEY_ANTIGO_ID = 'usuarioId';   // Sistema de login antigo (string)
const AUTH_KEY_ANTIGO_NOME = 'usuarioNome'

// ----------------------------------------------------
// NOVO: Função Global de Logout
// ----------------------------------------------------
function fazerLogout() {
    // 1. Remove os itens que definem a sessão
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioNome');
    
    Toastify({
        text: "Sessão encerrada. Até logo!",
        duration: 2000,
        style: { 
            background: "linear-gradient(to right, #ff5f6d, #ffc371)", // Cor de encerramento
            opacity: 0.9 
        },
    }).showToast();
    
    // 2. Redireciona para a página de login
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}


// ----------------------------------------------------
// NOVO: Gerencia a UI (Barra de Navegação)
// ----------------------------------------------------
function gerenciarUI() {
    const navAuthArea = document.getElementById('navAuthArea');
    const usuarioNome = localStorage.getItem('usuarioNome');
    const usuarioId = localStorage.getItem('usuarioId');
    
    // Verifica se o usuário está logado
    if (usuarioNome && usuarioId && navAuthArea) {
        // Usuário logado: mostra nome e botão Sair
        const primeiroNome = usuarioNome.split(' ')[0];
        
        // Substitui o conteúdo da div navAuthArea
        navAuthArea.innerHTML = `
            <a href="pagina_editarPerfil.html" id="navAuthArea">
            <img src="img/man.png" alt="Ícone perfil" height="15" />
            Olá, ${primeiroNome}!
          </a>

          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>

            <button onclick="fazerLogout()" class="btn-logout">
                Sair
            </button>
        `;
        
        // Opcional: Adicionar estilo ao botão Sair
        const btnLogout = navAuthArea.querySelector('.btn-logout');
        if(btnLogout) {
            Object.assign(btnLogout.style, {
                background: 'none',
                border: 'none',
                color: '#ff5f6d',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'underline'
            });
        }
    } 
    // Se não estiver logado, o HTML estático já garante o link "Entrar / Registrar-se"
}

function isUserLoggedIn() {
    const usuarioNome = localStorage.getItem('usuarioNome');
    const usuarioId = localStorage.getItem('usuarioId');
    return !!(usuarioNome && usuarioId); // Retorna true se ambos existirem
}

// Lógica do Menu Lateral (sem alteração)
const navLateral = document.getElementById("menuLateral")
const buttonMenu = document.getElementById("menu-button")

function abrirMenu(){
  if (navLateral) {
    navLateral.style.display = "flex";
  }
}
if (buttonMenu && !buttonMenu.hasAttribute('onclick')) {
    buttonMenu.addEventListener('click', abrirMenu);
}


// ----------------------------------------------------
// LÓGICA DO FEED DE PRODUTOS (Sem alterações)
// ----------------------------------------------------

let todosOsProdutos = [];
let textoPesquisa = "";
let categoriaAtual = "all";

const containerProdutos = document.querySelector(".products-container");
const inputPesquisa =
  document.querySelector("#search-main") ||
  document.querySelector("header nav input[type='text']"); 

// (Funções timeAgo, money, renderStars - sem alterações)
function timeAgo(input) {
  const d = typeof input === "number" ? new Date(input) : new Date(input);
  if (isNaN(+d)) return "";
  const now = new Date();
  const diff = (now - d) / 1000;
  const min = Math.floor(diff / 60);
  const h = Math.floor(diff / 3600);
  const day = Math.floor(diff / 86400);
  if (diff < 45) return "agora há pouco";
  if (min < 60) return `há ${min} ${min === 1 ? "min" : "mins"}`;
  if (h < 24) return `há ${h} ${h === 1 ? "hora" : "horas"}`;
  if (day === 1) return "ontem";
  if (day < 7) return `há ${day} ${day === 1 ? "dia" : "dias"}`;
  const sameYear = d.getFullYear() === now.getFullYear();
  const opts = { day: "2-digit", month: "short", ...(sameYear ? {} : { year: "numeric" }) };
  return d.toLocaleDateString("pt-BR", opts);
}

const money = (n) =>
  Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const renderStars = (n = 5) =>
  Array.from(
    { length: 5 },
    (_, i) => `<i class="fa-solid fa-star${i < n ? "" : " opacity-40"}"></i>`
  ).join("");


// (Template do Card - sem alterações)
const card = (p) => `
 <article class="product-card" data-id="${p.id}">
   <div class="img-wrap">
     <img class="products-img" src="${p.imagem}" alt="${p.nome}" onerror="this.src='./img/placeholder.jpg';">
     <span class="chip chip-category">${p.categoria || "Serviço"}</span>
   </div>
   <div class="products-info">
     <div class="product-head">
       <h3 class="products-name">${p.nome}</h3>
       <div class="price-stack">
         <span class="products-price">${money(p.preco)}<small>/${Array.isArray(p.period) ? p.period.join(', ') : p.period}</small></span>
       </div>
     </div>
     <div class="meta-bar">
       <span class="meta-title"><i class="fa-solid fa-right-left"></i> Troco por:</span>
       <div class="needs">
         ${(p.needs || []).map((tag) => `<span class="chip chip-need">${tag}</span>`).join("")}
       </div>
     </div>
 <ul class="specs">
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
     <div class="product-footer">
       <a href="pagina_perfil.html?id=${p.authorId}" class="link_format">
         <img class="author-avatar" src="${p.authorAvatar}" alt="${p.authorName}" onerror="this.src='./img/man.png';">
       </a>
       <a href="pagina_perfil.html?id=${p.authorId}" class="link_format">
         <div class="author-meta">
           <span class="author-name">${p.authorName}</span>
           <div class="author-stars" aria-label="${p.stars} de 5">
             ${"★".repeat(Math.round(p.stars || 0))}${"☆".repeat(5 - Math.round(p.stars || 0))}
           </div>
         </div>
       </a>
       <div class="post-meta"
         title="${new Date(p.postedAtMs ?? p.postedAt).toLocaleString("pt-BR")}">
         <i class="fa-regular fa-clock"></i>
         <span>${timeAgo(p.postedAtMs ?? p.postedAt)}</span>
         ${p.location ? `
           <span class="dot">•</span>
           <span class="location"><i class="fa-solid fa-location-dot"></i> ${p.location}</span>
         ` : ""}
       </div>
     </div>
   </div>
 </article>
`;


// (Função de Renderização - sem alterações)
function renderProdutos() {
  if (!containerProdutos) {
    console.error("'.products-container' não encontrado no HTML.");
    return;
  }
  const list = todosOsProdutos.filter(
    (p) =>
      (categoriaAtual === "all" || p.categoria.toLowerCase() === categoriaAtual.toLowerCase()) &&
      (p.nome.toLowerCase().includes(textoPesquisa.toLowerCase()) ||
       (p.authorName && p.authorName.toLowerCase().includes(textoPesquisa.toLowerCase())) ||
       p.categoria.toLowerCase().includes(textoPesquisa.toLowerCase()))
  );

  containerProdutos.innerHTML = list.length
    ? list.map(card).join("")
    : `<p style="color:#666; padding: 20px;">Nenhum resultado encontrado.</p>`;
}

// (Função para Carregar Produtos da API - sem alterações)
async function carregarProdutos() {
  if (!containerProdutos) return;
  containerProdutos.innerHTML = "<p>Carregando produtos...</p>"; 
  
  try {
    const response = await fetch(API_PRODUTOS_URL);
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    const produtosDaAPI = await response.json();
    todosOsProdutos = produtosDaAPI;
    renderProdutos();
    checarHighlight();

  } catch (error) {
    console.error("Falha ao carregar produtos:", error);
    containerProdutos.innerHTML = `<p style="color:red;">Não foi possível carregar os produtos. Verifique se o servidor está rodando.</p>`;
  }
}

// (Função para destacar card - sem alterações)
function checarHighlight() {
  const params = new URLSearchParams(window.location.search);
  const highlightId = params.get('highlight');
  
  if (highlightId) {
    const card = document.querySelector(`.product-card[data-id="${highlightId}"]`);
    if (card) {
      card.classList.add('is-highlighted'); // (Lembre-se de criar .is-highlighted no seu CSS)
      card.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      history.replaceState(null, '', window.location.pathname);
    }
  }
}

// ----------------------------------------------------
// Início do Script
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // 1. Gerencia a UI de login/logout (agora consistente com sua lógica)
  gerenciarUI(); 
  
  // 2. Carrega os produtos da API
  carregarProdutos();

  // 3. Adiciona listener para a barra de pesquisa
  if (inputPesquisa) {
    inputPesquisa.addEventListener('input', (e) => {
      textoPesquisa = e.target.value;
      renderProdutos(); 
    });
  }

  // 4. Adiciona listeners para os filtros de categoria
  document.querySelectorAll('.categories-icons div, .service-icon div').forEach(btn => {
    btn.addEventListener('click', () => {
      const categoria = btn.querySelector('p')?.textContent.trim() || 'all';
      
      document.querySelectorAll('.categories-icons div, .service-icon div').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      categoriaAtual = categoria;
      textoPesquisa = ""; 
      if(inputPesquisa) inputPesquisa.value = "";
      
      renderProdutos();
    });
  });
});

// ----------------------------------------------------
// NOVA LÓGICA DO BOTÃO "Anunciar" (Substitui o Modal)
// ----------------------------------------------------
(function(){
  const btn = document.getElementById('btnAnunciar');
  if(!btn) return;

  btn.addEventListener('click', () => {
    
    if (isUserLoggedIn()) {
        // 1. Logado: Vai direto para a página de anúncio
        window.location.href = 'pagina-anuncio.html';
    } else {
        // 2. Não logado: Mostra um aviso (Toastify)
        if (typeof Toastify === "function") {
            Toastify({
                text: "Você precisa estar logado para anunciar. Clique para entrar.",
                duration: 3500,
                destination: "index.html", // Redireciona para o login ao clicar
                newWindow: false,
                close: true,
                gravity: "top", 
                position: "center", 
                style: {
                    background: "linear-gradient(to right, #f59e0b, #ef4444)", // Gradiente de aviso
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600"
                }
            }).showToast();
        } else {
            // Fallback se o Toastify não carregar
            alert("Você precisa estar logado para anunciar.");
        }
        
        // Salva a intenção de anunciar, para que o login possa te redirecionar
        localStorage.setItem('ss_continue_to', 'pagina-anuncio.html');
    }
  });
})();