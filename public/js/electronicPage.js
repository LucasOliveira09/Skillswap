

const produtos = [
    {
        id: 1,
        nome: "iPhone 16 Pro Max",
        categoria: "smartphones",
        preco: 5759.90,
        precoOriginal: 8999.99,
        desconto: 11,
        imagem: "https://www.notebookcheck.info/fileadmin/Notebooks/News/_nc4/rohan-4Ti0LfaqQZY-unsplash.jpg",
        descricao: "Smartphone Apple com câmera avançada"
    },
    {
        id: 2,
        nome: "MacBook Air M3",
        categoria: "laptops",
        preco: 10499.90,
        precoOriginal: 10999.90,
        desconto: 18,
        imagem: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        descricao: "Notebook Apple ultrafino e potente"
    },
    {
        id: 3,
        nome: "AirPods Pro",
        categoria: "headphones",
        preco: 1099.90,
        precoOriginal: 2299,
        desconto: 17,
        imagem: "https://preview.redd.it/should-i-buy-airpods-pro-2-v0-vzrxrswuf4se1.jpg?width=640&crop=smart&auto=webp&s=6385cd1c678e5f3d76bb07a2e9af4f1130fd05d7",
        descricao: "Fones sem fio com cancelamento de ruído"
    },
    {
        id: 4,
        nome: "Samsung Galaxy S24",
        categoria: "smartphones",
        preco: 4699.90,
        precoOriginal: 6299,
        desconto: 13,
        imagem: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
        descricao: "Smartphone Samsung com tela AMOLED"
    },
    {
        id: 5,
        nome: "Apple Watch Series 9",
        categoria: "smartwatch",
        preco: 2389.90,
        precoOriginal: 3799.90,
        desconto: 13,
        imagem: "https://noticias.r7.com/resizer/H7AZPL7xNg12h8QLzb2tSc49Wvw=/arc-photo-newr7/arc2-prod/public/RRB4RLTJMRNHTLBNBSJVXNMGBY.jpg",
        descricao: "Relógio inteligente com monitoramento"
    },
    {
        id: 6,
        nome: "Teclado Mecânico",
        categoria: "accessories",
        preco: 599.90,
        precoOriginal: null,
        desconto: null,
        imagem: "https://pcdiga-prod.eu.saleor.cloud/media/thumbnails/products/p052625_1_862513ae_thumbnail_1024.jpg",
        descricao: "Teclado mecânico RGB para gamers"
    },
    {
        id: 7,
        nome: "Sony WH-1000XM5",
        categoria: "headphones",
        preco: 2199.90,
        precoOriginal: 2999,
        desconto: 17,
        imagem: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400",
        descricao: "Fone com cancelamento de ruído impecável e fácil acesso para transporte"
    },
    {
        id: 8,
        nome: "Dell XPS 13",
        categoria: "laptops",
        preco: 7999.90,
        precoOriginal: null,
        desconto: null,
        imagem: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400",
        descricao: "Notebook Windows premium, i710th, 16gb ram, placa integrada GTX750"
    },
    {
        id: 9,
        nome: "iPad Pro",
        categoria: "tablets",
        preco: 4499.90,
        precoOriginal: null,
        desconto: null,
        imagem: "https://www.techenet.com/wp-content/uploads/2021/06/iPadPro2021-2.jpg",
        descricao: "Toque, desenhe e digite como mágica em um único aparelho."
    },
     {
        id: 10,
        nome: "Magic Keyboard para iPad Pro",
        categoria: "tablets",
        preco: 949.90,
        precoOriginal: null,
        desconto: null,
        imagem: "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f26a8683-305d-4b62-89dd-b597d84f521f.__CR0,0,800,600_PT0_SX600_V1___.jpg",
        descricao: "Magic Keyboard para iPad Pro de 13 polegadas, super acessível para transporte, última tecnologia para seu iPad Pro"
    },
    {
        id: 11,
        nome: "Mouse Sem Fio Gamer",
        categoria: "accessories",
        preco: 319.90,
        precoOriginal: null,
        desconto: null,
        imagem: "https://techminuto.com.br/wp-content/uploads/2022/01/Melhores-Mouses-da-Razer.jpg",
        descricao: "Mouse Gamer Razer Mamba Chroma, sem fio, 7 Botões, 16000DPI, conforto e qualidade para jogar seu RPG"
    },
    {
        id: 12,
        nome: "MacBook Air M4",
        categoria: "laptops",
        preco: 15919.90,
        precoOriginal: null,
        desconto: null,
        imagem: "https://webp.br.cdn.pxr.nl/news/2025/03/05/8499ab2fed92cf05e00302aa39450fb7bfee733e.jpg?width=1200",
        descricao: "Superleve e com pouco mais de 1 cm de espessura, o MacBook Air se encaixa facilmente na correria da sua rotina",


    },

];
window.produtos = produtos;
let textoPesquisa = ""
let categoriaAtual = "all"


let containerProdutos = document.querySelector(".products-container")
let input = document.querySelector(".search-input")
let botoesMenu = document.querySelectorAll(".category-btn")
// selectorAll chama todos os botôes em vez de 1 

// function formatarPreco(preco) {
     // console.log(preco);
   // return ` ${preco.toFixed(2).replace('.', ',')}`;
// }


// ================== INTEGRAÇÃO COM O CARRINHO ==================
function integrarCarrinho() {
  document.querySelectorAll(".products-card").forEach(card => {
    const btn = card.querySelector(".products-button");
    btn.addEventListener("click", () => {
      const productId = parseInt(card.dataset.id);
      const produto = produtos.find(p => p.id === productId);
      if (produto) addToCart({
        id: produto.id,
        name: produto.nome,
        price: produto.preco,
        image: card.dataset.image || produto.imagem // <— AQUI
      });
    });
  });
}


// ================== FORMATAR PREÇO ==================
function formatarPreco(preco) {
    return preco.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ================== MOSTRAR PRODUTOS ==================
function mostrarProduto() {
    let htmlProdutos = "";

    let produtosFiltrados = produtos.filter(prd => {
        let passouCategoria = (categoriaAtual === "all" || prd.categoria === categoriaAtual);
        let passouPesquisa = prd.nome.toLowerCase().includes(textoPesquisa.toLowerCase());
        return passouCategoria && passouPesquisa;
    });

    produtosFiltrados.forEach(prd => {
        htmlProdutos += `
            <div class="products-card" data-id="${prd.id}">
                <img class="products-img" src="${prd.imagem}" alt="${prd.nome}">
                <div class="products-info">
                    <h3 class="products-name">${prd.nome}</h3>
                    <p class="products-description">${prd.descricao}</p>
                    <p class="products-price">${formatarPreco(prd.preco)}</p>
                    <button class="products-button">Adicionar ao carrinho!</button>
                </div>
            </div>
        `;
    });

    containerProdutos.innerHTML = htmlProdutos;

    // Integrar carrinho aos produtos renderizados
    integrarCarrinho();
}

// ================== PESQUISA ==================
function pesquisar() {
    textoPesquisa = input.value;
    mostrarProduto();
}

// ================== TROCAR CATEGORIA ==================
function trocarCategoria(categoria) {
    categoriaAtual = categoria;
    botoesMenu.forEach(botaoMenu => {
        botaoMenu.classList.remove('active');
        if (botaoMenu.getAttribute("data-category") === categoria) {
            botaoMenu.classList.add("active");
        }
    });
    mostrarProduto();
}
// ===== Carrinho PRO UX =====
const CART_KEY = 'ss_cart';
const $id = (s) => document.getElementById(s);
const elCartBtn  = $id('cart-button');
const elBadge    = $id('cart-count');
const elOverlay  = $id('cart-overlay');
const elDrawer   = $id('cart-drawer');
const elClose    = $id('cart-close');
const elItems    = $id('cart-items');
const elSubtotal = $id('cart-subtotal');
const elReview   = $id('cart-review');
let _lastFocusEl = null;
// ===== Cupom (refs + config) =====
const COUPON_KEY = 'ss_coupon';
const elCupomIn   = document.getElementById('cart-coupon-input');
const elCupomBtn  = document.getElementById('cart-coupon-apply');
const elCupomFeed = document.getElementById('coupon-feedback');
const elChip      = document.getElementById('coupon-chip');
const elChipCode  = document.getElementById('coupon-code');
const elChipRem   = document.getElementById('coupon-remove');
const elSavingsRow = document.getElementById('cart-savings');
const elSavingsAmt = document.getElementById('cart-savings-amount');

// catálago de cupons (exemplo — ajuste conforme seu negócio)
const COUPONS = {
  BEMVINDO10:  { type:'percent', value:10,  min:0,    label:'Bem-vindo 10%' },
  SKILLSWAP20: { type:'percent', value:20,  min:1000, label:'20% acima de R$ 1.000' },
  DESCONTO50:  { type:'fixed',   value:50,  min:200,  label:'R$ 50 off acima de R$ 200' },
};


const BRL = (n)=> n.toLocaleString('pt-BR',{style:'currency', currency:'BRL'});

// Estado
function getCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }catch{ return []; } }
function setCart(items){
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  renderCart();             // re-render itens
  updateTotalsWithCoupon(); // re-totaliza considerando cupom
}
function ensureToastContainer(){
  let c = document.getElementById('toast-container');
  if (!c){
    c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
}
function closeAllToasts(){
  document.querySelectorAll('.toast').forEach(t => t.remove());
}
function showToastSafe(prod){
  const cont = ensureToastContainer();
  const imgSrc = prod.image || resolveImageFor(prod.id) || 'img/placeholder.png';

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <img src="${imgSrc}" alt="${prod.name || 'Produto'}">
    <div class="toast-info">
      <strong>${prod.name || 'Produto adicionado'}</strong>
      <small>Adicionado ao carrinho</small>
    </div>
    <button type="button">Ver</button>
  `;
  cont.appendChild(toast);

  toast.querySelector('button').addEventListener('click', () => {
    closeAllToasts();
    openCart();
  });

  setTimeout(() => toast.remove(), 3000);
}


// Ações
function addToCart(prod){ // {id, name, price, image?}
  const cart = getCart();
  const i = cart.findIndex(x => x.id === prod.id);
  const safeImg = resolveImageFor(prod.id, prod.image);

  if (i >= 0){
    cart[i].qty += 1;
    if (!cart[i].image) cart[i].image = safeImg;
  } else {
    cart.push({ id: prod.id, name: prod.name, price: prod.price, image: safeImg, qty: 1 });
  }
  setCart(cart);

  // Feedback moderno: badge + toast (não abre drawer à força)
  try { bumpBadge?.(); } catch {}
  showToastSafe({ ...prod, image: safeImg });
}

function showToast(prod){
  const cont = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <img src="${prod.image}" alt="${prod.name}">
    <div class="toast-info">
      <strong>${prod.name}</strong>
      <small>Adicionado ao carrinho</small>
    </div>
    <button>Ver</button>
  `;
  cont.appendChild(toast);

  const btn = toast.querySelector('button');
  btn.addEventListener('click', () => {
    closeAllToasts();
    openCart();
  });

  setTimeout(()=> toast.remove(), 3000);
}

function closeAllToasts(){
  document.querySelectorAll('.toast').forEach(t=>t.remove());
}

function removeItem(id){ setCart(getCart().filter(x=>x.id!==id)); }
function changeQty(id, d){ setCart(getCart().map(x=> x.id===id ? {...x, qty: Math.max(1, x.qty + d)} : x)); }
function subtotal(){ return getCart().reduce((a,b)=>a + b.price*b.qty, 0); }

// UI
function openCart(){
  _lastFocusEl = document.activeElement;
  elDrawer.classList.add('open');
  elOverlay.classList.add('active');
  elOverlay.hidden = false;
  elCartBtn?.setAttribute('aria-expanded','true');
  document.body.classList.add('cart-open');       // <— ADICIONE ESTA LINHA
  setTimeout(()=> elClose?.focus(), 10);
}

function closeCart(){
  elDrawer.classList.remove('open');
  elOverlay.classList.remove('active');
  setTimeout(()=>{ elOverlay.hidden = true; }, 320);
  elCartBtn?.setAttribute('aria-expanded','false');
  document.body.classList.remove('cart-open');    // <— E ESTA
  if (_lastFocusEl && typeof _lastFocusEl.focus === 'function') _lastFocusEl.focus();
}

function renderCart(){
  const cart = getCart();
  const count = cart.reduce((a,b)=>a+b.qty,0);
  if (elBadge) elBadge.textContent = count;

  elItems.innerHTML = cart.length ? cart.map(it=>{
    const img = resolveImageFor(it.id, it.image); // <— garante src
    return `
      <div class="cart-item">
        <img src="${img}" alt="${it.name}">
        <div>
          <div class="title">${it.name}</div>
          <div class="meta">${BRL(it.price)} • qtd <strong>${it.qty}</strong></div>
        </div>
        <div class="actions">
          <button class="btn-dec" data-id="${it.id}" aria-label="Diminuir">−</button>
          <button class="btn-inc" data-id="${it.id}" aria-label="Aumentar">＋</button>
          <button class="btn-rem" data-id="${it.id}" aria-label="Remover">🗑</button>
        </div>
      </div>
    `;
  }).join('') : `<p>Seu carrinho está vazio.</p>`;

 updateTotalsWithCoupon();

}
renderCart();
updateCouponUI();
updateTotalsWithCoupon();



// ===== Cupom: estado e cálculo =====
function getAppliedCoupon(){
  try{ return JSON.parse(localStorage.getItem(COUPON_KEY) || 'null'); }catch{ return null; }
}
function setAppliedCoupon(obj){
  if (!obj) localStorage.removeItem(COUPON_KEY);
  else localStorage.setItem(COUPON_KEY, JSON.stringify(obj));
}

function calcDiscount(sub, coupon){
  if (!coupon) return 0;
  if (sub < (coupon.min || 0)) return 0;
  if (coupon.type === 'percent') return Math.max(0, sub * (coupon.value/100));
  if (coupon.type === 'fixed')   return Math.min(sub, coupon.value);
  return 0;
}

function updateCouponUI(){
  const applied = getAppliedCoupon();
  const has = !!applied;

  if (elChip)      elChip.hidden = !has;
  if (elCupomIn)   elCupomIn.readOnly = has;
  if (elCupomBtn)  elCupomBtn.disabled = has || !elCupomIn?.value?.trim();

  elCupomFeed && (elCupomFeed.textContent = "");
  elCupomIn  && (elCupomIn.value = has ? applied.code : elCupomIn.value);
  elChipCode && has && (elChipCode.textContent = applied.code);

  // remove classes de estado
  document.getElementById('cart-coupon')?.classList.remove('is-valid','is-invalid','is-loading');
}

function updateTotalsWithCoupon(){
  const sub = subtotal();
  const applied = getAppliedCoupon();
  const off = calcDiscount(sub, applied);
  const final = Math.max(0, sub - off);

  if (elSavingsRow) elSavingsRow.hidden = !(off > 0);
  if (elSavingsAmt) elSavingsAmt.textContent = BRL(off);
  if (elSubtotal)   elSubtotal.textContent = BRL(final);

  // opcional: manda total final para a página de pagamento
  localStorage.setItem('ss_cart_subtotal', String(final));
}

function validateCouponInput(code){
  const up = (code||"").trim().toUpperCase();
  if (!/^[A-Z0-9]{5,14}$/.test(up)) return { ok:false, msg:"Cupom inválido. Use apenas letras/números (5–14)." };
  const rule = COUPONS[up];
  if (!rule) return { ok:false, msg:"Cupom não encontrado ou expirado." };
  const sub = subtotal();
  if (sub < (rule.min||0)) return { ok:false, msg:`Este cupom exige mínimo de ${BRL(rule.min||0)}.` };
  return { ok:true, up, rule };
}

// Eventos principais
elCartBtn?.addEventListener('click', openCart);
elClose?.addEventListener('click', closeCart);
elOverlay?.addEventListener('click', closeCart);
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeCart(); });

// ===== Eventos do Cupom =====
if (elCupomIn && elCupomBtn){
  elCupomIn.addEventListener('input', () => {
    elCupomBtn.disabled = !elCupomIn.value.trim();
  });

  elCupomBtn.addEventListener('click', async () => {
    const wrap = document.getElementById('cart-coupon');
    if (!elCupomIn.value.trim()) return;

    wrap?.classList.add('is-loading');
    await new Promise(r=>setTimeout(r, 450));

    const v = validateCouponInput(elCupomIn.value);
    wrap?.classList.remove('is-loading');

    if (!v.ok){
      wrap?.classList.add('is-invalid');
      elCupomFeed && (elCupomFeed.textContent = v.msg);
      return;
    }

    setAppliedCoupon({ code:v.up, ...v.rule });
    wrap?.classList.remove('is-invalid');
    wrap?.classList.add('is-valid');
    elCupomFeed && (elCupomFeed.textContent = "Cupom aplicado com sucesso!");

    updateCouponUI();
    updateTotalsWithCoupon();
  });
}

if (elChipRem){
  elChipRem.addEventListener('click', ()=>{
    setAppliedCoupon(null);
    elCupomFeed && (elCupomFeed.textContent = "Cupom removido.");
    updateCouponUI();
    updateTotalsWithCoupon();
  });
}



// === Toast Glass PRO ===
function ensureToastContainer(){
  let c = document.getElementById('toast-container');
  if (!c){
    c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
}

function showToast(prod) {
  // Garante que o container exista
  let cont = document.getElementById('toast-container');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'toast-container';
    document.body.appendChild(cont);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <img src="${prod.image || resolveImageFor(prod.id)}" alt="${prod.name}">
    <div class="toast-info">
      <strong>${prod.name}</strong>
      <small>Adicionado ao carrinho</small>
    </div>
    <button type="button" class="toast-btn">Ver</button>
  `;

  cont.appendChild(toast);

  const btn = toast.querySelector('.toast-btn');
  btn.addEventListener('click', () => {
    closeAllToasts();
    openCart();
  });

  // Animação e remoção
  setTimeout(() => toast.remove(), 3000);
}


// opcional: expõe no escopo global (facilita testar no console)
window.showToast = showToast;


// Delegação itens
elItems.addEventListener('click', (e)=>{
  const t = e.target;
  const id = Number(t.dataset.id);
  if (!id) return;
  if (t.classList.contains('btn-inc')) changeQty(id, +1);
  if (t.classList.contains('btn-dec')) changeQty(id, -1);
  if (t.classList.contains('btn-rem')) removeItem(id);
});
function resolveImageFor(id, fallback){
  if (fallback) return fallback;

  // 1) tenta o array local (mesmo em script type="module")
  try {
    if (typeof produtos !== 'undefined') {
      const p = produtos.find(x => x.id === id);
      if (p?.imagem) return p.imagem;
    }
  } catch {}

  // 2) tenta o window (se não for módulo)
  const arr = (window.produtos || []);
  const p2 = arr.find(x => x.id === id);
  if (p2?.imagem) return p2.imagem;

  // 3) tenta achar um card no DOM com data-image
  const card = document.querySelector(`.products-card[data-id="${id}"]`);
  if (card?.dataset?.image) return card.dataset.image;

  // 4) fallback local
  return 'img/placeholder.png'; // garanta que esse arquivo exista
}


// Revisar pedido -> pagamentos
elReview?.addEventListener('click', ()=>{
  localStorage.setItem('ss_cart_subtotal', String(subtotal()));
  window.location.href = 'pagina_pagamentos.html';
});

// Integra com seus cards existentes
function integrarBotoesProduto(){
  document.querySelectorAll('.products-card').forEach(card=>{
    const btn = card.querySelector('.products-button');
    btn?.addEventListener('click', ()=>{
      const id = Number(card.dataset.id);
      const p = (window.produtos || []).find(x=>x.id===id);
      if (!p) return;
      addToCart({ id: p.id, name: p.nome, price: p.preco, image: p.imagem });
    });
  });
}

// rode após render de produtos
integrarBotoesProduto();
// Hidrata imagens ausentes no carrinho legado
(function hydrateCartImagesOnce(){
  const cart = getCart();
  const fixed = cart.map(it => ({
    ...it,
    image: resolveImageFor(it.id, it.image)
  }));
  setCart(fixed);
})();

// Caso você re-renderize a grade após busca/filtro, chame integrarBotoesProduto() novamente.

/*
// ===== Estado base do carrinho =====
const CART_KEY = 'ss_cart';
const MONEY = (n) => n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

function getCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; } }
function setCart(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)); updateCartUI(); }

function addItem(prod){ // {id, name, price, image}
  const cart = getCart();
  const i = cart.findIndex(x => x.id === prod.id);
  if (i >= 0) cart[i].qty += 1;
  else cart.push({...prod, qty: 1});
  setCart(cart);
  openCart(); // UX: abre o carrinho ao adicionar
}

function removeItem(id){
  const cart = getCart().filter(x => x.id !== id);
  setCart(cart);
}

function changeQty(id, delta){
  const cart = getCart().map(x => x.id === id ? {...x, qty: Math.max(1, x.qty + delta)} : x);
  setCart(cart);
}

function getSubtotal(){
  return getCart().reduce((acc, it) => acc + it.price * it.qty, 0);
}

// ===== UI =====
const elDrawer = document.getElementById('cart-drawer');
const elOverlay = document.getElementById('cart-overlay');
const elItems   = document.getElementById('cart-items');
const elSubtotal= document.getElementById('cart-subtotal');
const elCount   = document.getElementById('cart-count');

function openCart(){
  elDrawer.classList.add('open');
  elOverlay.classList.add('active');
  elOverlay.hidden = false;
  document.querySelector('.cart-toggle')?.setAttribute('aria-expanded','true');
}
function closeCart(){
  elDrawer.classList.remove('open');
  elOverlay.classList.remove('active');
  setTimeout(()=>{ elOverlay.hidden = true; }, 300);
  document.querySelector('.cart-toggle')?.setAttribute('aria-expanded','false');
}

function updateCartUI(){
  const cart = getCart();
  // badge
  const count = cart.reduce((a,b)=>a+b.qty,0);
  if (elCount) elCount.textContent = count;

  // itens
  elItems.innerHTML = cart.length ? cart.map(it => `
    <div class="cart-item">
      <img src="${it.image || ''}" alt="${it.name}">
      <div>
        <div class="title">${it.name}</div>
        <div class="meta">${MONEY(it.price)} • qtd <strong>${it.qty}</strong></div>
      </div>
      <div class="actions">
        <button class="btn-dec" data-id="${it.id}">−</button>
        <button class="btn-inc" data-id="${it.id}">＋</button>
        <button class="btn-rem" data-id="${it.id}" title="Remover">🗑</button>
      </div>
    </div>
  `).join('') : `<p>Seu carrinho está vazio.</p>`;

  // subtotal
  elSubtotal.textContent = MONEY(getSubtotal());
}
updateCartUI();

// Eventos globais
document.querySelector('.cart-toggle')?.addEventListener('click', openCart);
document.querySelector('.cart-close')?.addEventListener('click', closeCart);
elOverlay.addEventListener('click', closeCart);
document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeCart(); });

// Delegação dos botões de item
elItems.addEventListener('click', (e)=>{
  const id = Number(e.target.dataset.id);
  if (!id) return;
  if (e.target.classList.contains('btn-inc')) changeQty(id, +1);
  if (e.target.classList.contains('btn-dec')) changeQty(id, -1);
  if (e.target.classList.contains('btn-rem')) removeItem(id);
});

// ===== Integração "Revisar pedido" -> página de pagamentos =====
document.getElementById('cart-review')?.addEventListener('click', ()=>{
  // Armazenar subtotal para conferir na outra página (além do carrinho completo)
  localStorage.setItem('ss_cart_subtotal', String(getSubtotal()));
  window.location.href = 'pagina_pagamentos.html'; // ajuste seu caminho se necessário
});

// ===== Exemplo de "adicionar ao carrinho" com seus produtos existentes =====
// Chame isso quando clicar em "Compre Agora!"
function hookProductButtons(){
  document.querySelectorAll('.products-card').forEach(card=>{
    const btn = card.querySelector('.products-button');
    btn?.addEventListener('click', ()=>{
      const id = Number(card.dataset.id);
      const p = produtos.find(x=>x.id===id);
      if (!p) return;
      addItem({ id: p.id, name: p.nome, price: p.preco, image: p.imagem });
    });
  });
}
hookProductButtons();
*/
// ================== EVENTOS DOM ==================
// ================== EVENTOS DOM ==================
window.addEventListener('DOMContentLoaded', function () {
    mostrarProduto(); // Mostrar produtos inicialmente

    input.addEventListener('input', pesquisar);

    botoesMenu.forEach(botaoMenu => {
        botaoMenu.addEventListener('click', () => {
            let categoria = botaoMenu.getAttribute("data-category");
            trocarCategoria(categoria);
        });
    });


});
