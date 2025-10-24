/*// ====== CONFIG ======
const FEED_KEY = 'ss_feed';
const PAGE_SIZE = 12; // ajuste se quiser mais/menos cards por página

// ====== Helpers básicos ======
const qs  = (s, p=document)=> p.querySelector(s);
const qsa = (s, p=document)=> [...p.querySelectorAll(s)];

function getParam(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

function toBRLFromCents(c){
  return (Number(c||0)/100).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
}
function relTime(iso){
  try{
    const d = new Date(iso);
    const diff = Math.max(0, Date.now() - d.getTime());
    const m = Math.floor(diff/60000);
    if (m < 1) return "agora";
    if (m < 60) return `há ${m} min`;
    const h = Math.floor(m/60);
    if (h < 24) return `há ${h} hora${h>1?'s':''}`;
    const dd = Math.floor(h/24);
    return `há ${dd} dia${dd>1?'s':''}`;
  }catch{ return "agora"; }
}
function starsSVG(rating=0){
  const full = Math.floor(rating);
  const half = rating - full >= 0.25 && rating - full < 0.75;
  const parts = [];
  for(let i=0;i<5;i++){
    if(i<full){
      parts.push('<svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" aria-hidden="true"><path d="M12 .587l3.668 7.568L24 9.75l-6 5.84 1.417 8.26L12 19.771l-7.417 4.079L6 15.59 0 9.75l8.332-1.595z"/></svg>');
    }else if(i===full && half){
      parts.push('<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="half"><stop offset="50%" stop-color="#f59e0b"/><stop offset="50%" stop-color="#e5e7eb"/></linearGradient></defs><path d="M12 .587l3.668 7.568L24 9.75l-6 5.84 1.417 8.26L12 19.771l-7.417 4.079L6 15.59 0 9.75l8.332-1.595z" fill="url(#half)"/></svg>');
    }else{
      parts.push('<svg width="14" height="14" viewBox="0 0 24 24" fill="#e5e7eb" aria-hidden="true"><path d="M12 .587l3.668 7.568L24 9.75l-6 5.84 1.417 8.26L12 19.771l-7.417 4.079L6 15.59 0 9.75l8.332-1.595z"/></svg>');
    }
  }
  return parts.join('');
}

// ====== Card HTML (mesmo estilo PRO que te mandei) ======
function renderCardHTML(it){
  const price = toBRLFromCents(it.precoCentavos);
  const local = it?.local?.cidade && it?.local?.uf ? `${it.local.cidade} / ${it.local.uf}` : "—";
  const sellerPlace = (it?.seller?.cidade && it?.seller?.uf) ? `${it.seller.cidade} / ${it.seller.uf}` : local;
  const lastSeen = relTime(it?.seller?.lastSeenISO || new Date().toISOString());
  const thumb = (it.imagens && it.imagens[0]) || "img/placeholder.png";
  const chip = it.tipo === 'troca'
    ? `<div class="card-pro__chip"><i class="fa-solid fa-right-left"></i> Troco por${it.trocaPor?': '+it.trocaPor:''}</div>`
    : '';

  return `
  <article class="card-pro" data-id="${it.id}">
    <div class="card-pro__media">
      <img src="${thumb}" alt="${it.titulo}">
      ${it.tipo!=='produto' ? `<span class="card-pro__badge">${it.tipo}</span>` : ``}
    </div>

    <div class="card-pro__body">
      ${chip}
      <h3 class="card-pro__title">${it.titulo}</h3>
      ${it.descricao ? `<p class="card-pro__desc">${it.descricao}</p>` : ``}
      <div class="card-pro__meta">
        <span class="price">${price}</span>
        <span class="place"><i class="fa-solid fa-location-dot" style="opacity:.6"></i> ${local}</span>
      </div>
    </div>

    <div class="seller-mini">
      <img class="seller-mini__avatar" src="${it?.seller?.avatarUrl || 'img/avatar-default.png'}" alt="Avatar de ${it?.seller?.nome || 'Usuário'}">
      <div class="seller-mini__info">
        <div class="seller-mini__top">
          <span>${it?.seller?.nome || 'Usuário'}</span>
          <span class="seller-mini__dot">•</span>
          <span><i class="fa-regular fa-clock" style="opacity:.7"></i> ${lastSeen}</span>
        </div>
        <div class="seller-mini__sub">
          <span class="seller-mini__stars" title="${(it?.seller?.estrelas||4.7).toFixed(1)} ★">${starsSVG(it?.seller?.estrelas||4.7)}</span>
          <span class="seller-mini__dot">•</span>
          <span><i class="fa-solid fa-location-dot" style="opacity:.7"></i> ${sellerPlace}</span>
        </div>
      </div>
    </div>
  </article>`;
}

// ====== Dados: base (demo) + localStorage ======
function getFeedData(){
  const base = window.demoAnuncios || []; // se existir (mock base)
  let local = [];
  try{ local = JSON.parse(localStorage.getItem(FEED_KEY) || "[]"); }catch{}
  // recém-publicados primeiro:
  return [...local, ...base];
}

function paginate(arr, size){
  const out=[]; for(let i=0;i<arr.length;i+=size){ out.push(arr.slice(i, i+size)); } return out;
}

// ====== Carrossel para a seção "Últimos postados..." ======
let FEED = [];
let PAGES = [];
let currentPage = 0;

function initLatestPostedCarousel(){
  // 1) localizar a seção correta (a que tem "Últimos postados...")
  const latestSection = qsa('main.products').find(sec => /Últimos postados/i.test(sec?.querySelector('h2')?.textContent||""));
  if(!latestSection) return;

  const container = latestSection.querySelector('.products-container');
  const pager     = latestSection.querySelector('.section-pager');
  const prevBtn   = pager?.querySelector('.pager-prev');
  const nextBtn   = pager?.querySelector('.pager-next');
  const dotsWrap  = pager?.querySelector('.pager-dots');

  // 2) dados + paginação
  FEED = getFeedData();
  PAGES = paginate(FEED, PAGE_SIZE);

  if(!PAGES.length){
    container.innerHTML = `<p style="padding:12px;color:#64748b">Nenhum anúncio ainda.</p>`;
    if(prevBtn) prevBtn.disabled = true;
    if(nextBtn) nextBtn.disabled = true;
    return;
  }

  // 3) dots dinâmicos (ignorando os estáticos do HTML)
  if(dotsWrap){
    dotsWrap.innerHTML = "";
    PAGES.forEach((_, i)=>{
      const b = document.createElement('button');
      b.className = `pager-dot${i===0?' is-active':''}`;
      b.setAttribute('aria-label', `Página ${i+1}`);
      b.addEventListener('click', ()=> goToPage(i, { container, prevBtn, nextBtn, dotsWrap }));
      dotsWrap.appendChild(b);
    });
  }

  // 4) navegação
  prevBtn?.addEventListener('click', ()=> goToPage(currentPage-1, { container, prevBtn, nextBtn, dotsWrap }));
  nextBtn?.addEventListener('click', ()=> goToPage(currentPage+1, { container, prevBtn, nextBtn, dotsWrap }));

  // 5) highlight por query
  const highlightId = getParam('highlight');
  if (highlightId){
    const idx = FEED.findIndex(it => String(it.id) === String(highlightId));
    const pageFromId = idx >= 0 ? Math.floor(idx / PAGE_SIZE) : 0;
    currentPage = Math.max(0, Math.min(PAGES.length-1, pageFromId));
  }else{
    currentPage = 0;
  }

  // 6) render inicial
  renderPage(currentPage, container);
  updatePager(prevBtn, nextBtn, dotsWrap);
  if (highlightId) applyHighlight(container, highlightId);
}

function renderPage(pageIdx, mountEl){
  const chunk = PAGES[pageIdx] || [];
  mountEl.innerHTML = chunk.map(renderCardHTML).join('');
}

function updatePager(prevBtn, nextBtn, dotsWrap){
  prevBtn && (prevBtn.disabled = currentPage <= 0);
  nextBtn && (nextBtn.disabled = currentPage >= PAGES.length-1);
  if(dotsWrap){
    qsa('.pager-dot', dotsWrap).forEach((d,i)=> d.classList.toggle('is-active', i===currentPage));
  }
}

function goToPage(n, ctx){
  const { container, prevBtn, nextBtn, dotsWrap } = ctx;
  currentPage = Math.max(0, Math.min(PAGES.length-1, n));
  renderPage(currentPage, container);
  updatePager(prevBtn, nextBtn, dotsWrap);
  container.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function applyHighlight(container, id){
  // aguarda um tick para o DOM assentar
  requestAnimationFrame(()=>{
    const card = container.querySelector(`.card-pro[data-id="${CSS.escape(String(id))}"]`);
    if(card){
      card.classList.add('highlight');
      setTimeout(()=> card.classList.remove('highlight'), 2600);
      card.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }
  });
}

// ====== init
document.addEventListener('DOMContentLoaded', initLatestPostedCarousel);
*/