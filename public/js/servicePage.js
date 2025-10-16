// js/servicePage.js
"use strict";


const API_SERVICOS_URL = 'http://localhost:3000/api/servicos'; 


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

const navLateral = document.getElementById("menuLateral")
const buttonMenu = document.getElementById("menu-button")

function abrirMenu(){
  navLateral.style.display = "flex";
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


// ----------------------------------------------------
// Início do Script
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Garante que a UI de login/logout está correta
    gerenciarUI(); 
    
    // Aqui você deve chamar as funções para carregar os serviços
    // Se você estiver usando o código que eu sugeri anteriormente para carregar serviços:
    // carregarServicos(); 
});
// util: "há 5 min", "há 3 h", "ontem", "12 fev"
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

const needs = [
  "Esportes",
  "Música",
  "Semi-novos",
  "Usado",
  "Aprendizagem",
  "Limpeza",
  "Outros",
];
const period = ["mês", "VIP", "pacote 10 aulas", "12x", "UN"];
const produtos = [
  {
    id: 1,
    nome: "Aula de Futebol",
    categoria: "Esportes",
    preco: 100.0,
    imagem: "./img/viniAulaFutebol.jpg",
    descricao: "Ter/Qui • 18h–19h • Turma reduzida",
    authorAvatar: "./img/perfil-viniJR.png",
    authorName: "Vini Jr.",
    stars: 5,
    needs: ["Esportes"],
    postedAtMs: Date.now() - 1000 * 60 * 90, // ex.: há 5 minutos
    location: "Madrid / ES", 
    schedule: "Ter/Qui • 18h–19h",
    group: "Turma reduzida",
    period: ["mês"],
  },
  
  {
    id: 2,
    nome: "Aula de Jiu-jitsu",
    categoria: "Esportes",
    preco: 80.0,
    imagem: "./img/jiu-jitsuPerfil.jpg",
    descricao: "Seg/Qua • 14h–15h • Aula individual",
    authorAvatar: "./img/perfil-charles.jpg",
    authorName: "Charles Oliveira.",
    stars: 5,
    needs: ["Esportes"],
    postedAtMs: Date.now() - 50 * 60 * 90, // ex.: há 5 minutos
    location: "Guarulhos /SP", 
    schedule: "Seg/Sex • 14h–16h",
    group: "Aula individual",
    period: ["VIP"],
  },
  {
    id: 3,
    nome: "Faxina Completa",
    categoria: "Limpeza",
    preco: 210.00, 
    imagem: "./img/banheiro-servico.jpg",
    descricao: "Seg/Qua • 14h–15h • Aula individual",
    authorAvatar: "./img/avatar-lucas.jpg",
    authorName: "Lucas Leite.",
    stars: 3,
    needs: ["Limpeza"],
    postedAtMs: Date.now() - 2000 * 80 * 90, // ex.: há 5 minutos
    location: "Fartura / PR", // <-- opcional
    include: ["Limpeza de janelas", "Limpeza de carpetes"],
   
    period: ["Dia"]
  },
    {
    id: 4,
    nome: "Canivette Suíço",
    categoria: "Semi-novos",
    preco: 50.00, 
    imagem: "./img/faca-canivete.jpg",
    descricao: "Seg/Qua • 14h–15h • Aula individual",
    authorAvatar: "./img/avatar-emerson.jpg",
    authorName: "Emerson Vinicius.",
    stars: 1,
    needs: ["Semi-novos"],
    postedAtMs: Date.now() - 1000 * 800 * 40, 
    location: "Ribeirão do Sul / SP",          // ex.: há 5 minutos
    include: ["Capa protetora", "Lâmina extra"],
    period: ["UN"],
  },
      {
    id: 5,
    nome: "Carona Unifio",
    categoria: "Corrida",
    preco: 20.00 , 
    imagem: "./img/hb-servico.webp",
    descricao: "Seg/Qua • 14h–15h • Aula individual",
    authorAvatar: "./img/avatar-matheus.jpg",
    authorName: "Matheus Souza.",
    stars: 4,
    needs: ["Corrida"],
    postedAtMs: Date.now() - 1500 * 80 * 90, // ex.: há 5 minutos
    location: "Ourinhos / SP", // <-- opcional
    schedule: "Seg/Qui • 19h",
    group: "Maximo 3 pessoas",
    period: [ " Km " ]
  },

];


let textoPesquisa = "";
let categoriaAtual = "all";


const containerProdutos = document.querySelector(".products-container");
const inputPesquisa =
  document.querySelector("#search-main") ||
  document.querySelector(".search-input");

// --- UTIL ---
const money = (n) =>
  Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// helper opcional: estrelas Font Awesome
const renderStars = (n = 5) =>
  Array.from(
    { length: 5 },
    (_, i) => `<i class="fa-solid fa-star${i < n ? "" : " opacity-40"}"></i>`
  ).join("");
  


const card = (p) => `

  <article class="product-card" data-id="${p.id}">
    <div class="img-wrap">
      <img class="products-img" src="${p.imagem}" alt="${p.nome}">
      <span class="chip chip-category">${p.categoria || "Serviço"}</span>
    </div>

    <div class="products-info">
      <div class="product-head">
        <h3 class="products-name">${p.nome}</h3>
        <div class="price-stack">
          
          <span class="products-price">${money(
            p.preco
    )}<small>/${p.period}</small></span>
        </div>
      </div>

      <div class="meta-bar">
        <span class="meta-title"><i class="fa-solid fa-right-left"></i> Troco por:</span>
        <div class="needs">
          ${(p.needs || [])
            .map((tag) => `<span class="chip chip-need">${tag}</span>`)
            .join("")}
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
${p.includes? `
  <div class="includes-bar">
    <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
    <span>Acompanha: ${p.includes}</span>
  </div>
` : ''}
${p.include?.length ? `
  <ul class="includes">
    ${p.include.map(x => `
      <li><i class="fa-solid fa-circle-check" aria-hidden="true"></i>${x}</li>
    `).join('')}
  </ul>
` : ''}


      <div class="product-footer">
        <img class="author-avatar" src="${p.authorAvatar}" alt="${
  p.authorName
}">
        <div class="author-meta">
          <span class="author-name">${p.authorName}</span>
          <div class="author-stars" aria-label="${p.stars} de 5">
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
    </div>
  </article>
`;


// --- RENDER ---
function renderProdutos() {
  if (!containerProdutos) {
    console.error("'.products-container' não encontrado no HTML.");
    return;
  }

  const list = produtos.filter(
    (p) =>
      (categoriaAtual === "all" || p.categoria === categoriaAtual) &&
      p.nome.toLowerCase().includes(textoPesquisa.toLowerCase())
  );

  containerProdutos.innerHTML = list.length
    ? list.map(card).join("")
    : `<p style="color:#666">Nenhum resultado encontrado.</p>`;
}


// mapa de overrides (carrega do localStorage se existir)
const descOverrides = JSON.parse(localStorage.getItem('descOverrides') || '{}');

function getDesc(p) {
  return (descOverrides[p.id] ?? p.descricao ?? '');
}
function setDescricao(id, texto) {
  if (!texto || !texto.trim()) {
    delete descOverrides[id];                 // remove override (volta ao padrão do array)
  } else {
    descOverrides[id] = texto.trim();
  }
  localStorage.setItem('descOverrides', JSON.stringify(descOverrides));
  renderProdutos();
}

renderProdutos();

