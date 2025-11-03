/************** SkillSwap – Eletrônicos (PRO UX) **************
 * Arquivo único — substitua seu js/electronicPage.js por este.
 * Requisitos no HTML já atendidos pelo seu markup enviado.
 **************************************************************/
/* SkillSwap – Eletrônicos (PRO UX) – build 2025-10-31
   Recursos:
   - Drawer + overlay/blur com camadas seguras (z-index alto)
   - Grid de produtos com descontos, preço riscado, rating, parcelas, frete grátis
   - Carrinho com localStorage (CART_KEY)
   - Toast PRO (canto inferior direito, CTA Ver carrinho)
   - Cupom PRO (validação, feedback, chip-remover)
   - Frete: aparece somente após "Calcular"; permite ocultar opções
   - Nenhuma variável global (exceto window.SS para debug)
*/
(function () {
  "use strict";

  // ========= Namespace =========
  const SS = (window.SS = window.SS || {});

  // ========= CSS injetado (apenas 1x) =========
  (function injectCSS() {
    if (document.getElementById("ss-electronics-style")) return;
    const css = `
    /* Camadas */
    #cart-overlay{position:fixed;inset:0;background:rgba(17,24,39,.45);
      -webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);
      z-index:2147483600;opacity:0;transition:opacity .25s ease; }
    #cart-overlay.active{opacity:1}
    #cart-drawer{position:fixed;top:0;right:0;height:100vh;width:min(420px,92vw);
      background:#fff;box-shadow:0 10px 30px rgba(0,0,0,.18);
      z-index:2147483606;transform:translateX(100%);transition:transform .28s cubic-bezier(.2,.7,.2,1);
      display:flex;flex-direction:column;}
    #cart-drawer.open{transform:translateX(0)}
    body.cart-open{overflow:hidden}
    /* Blur só no wrapper se existir (não mata cliques do drawer) */
    body.cart-open #app-root{filter:blur(3px) saturate(.96)}

    /* Toast */
    #toast-container{position:fixed;right:16px;bottom:16px;display:flex;flex-direction:column;gap:12px;z-index:2147483647}
    .toast{display:flex;gap:12px;align-items:center;width:min(380px,92vw);padding:10px 12px;border-radius:14px;color:#fff;
      background:rgba(17,24,39,.88);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);animation:toastIn .18s ease-out;
      box-shadow:0 10px 30px rgba(0,0,0,.25);}
    .toast img{width:56px;height:56px;border-radius:10px;object-fit:cover}
    .toast-info{flex:1;min-width:0}
    .toast-info strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .toast-sub{font-size:.9rem;opacity:.9;margin-top:2px}
    .toast-cta{display:flex;gap:8px}
    .toast-cta button{border:0;padding:8px 10px;border-radius:10px;cursor:pointer}
    .toast-cta .see{background:#fff;color:#111827}
    .toast-cta .cont{background:#111827;color:#fff;border:1px solid #374151}
    @keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

    /* Cards */
    .products-card{position:relative;border:1px solid #eee;border-radius:14px;overflow:hidden;background:#fff;transition:transform .2s,box-shadow .2s}
    .products-card:hover{transform:translateY(-2.5px);box-shadow: rgba(0,0,0,.16) 0px 3px 6px, rgba(0,0,0,.23) 0px 3px 6px;}
    .badge-off{position:absolute;left:12px;top:12px;padding:6px 10px;font-weight:700;font-size:.82rem;background:#ef4444;color:#fff;border-radius:999px}
    .products-img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}
    .price-row{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin:.35rem 0 .55rem}
    .price-now{font-size:1.18rem;font-weight:800;color:#111827;line-height:1}
    .price-old{font-size:.95rem;color:#9ca3af;text-decoration:line-through;line-height:1}
    .price-off{font-size:.85rem;font-weight:700;color:#ef4444;line-height:1}
    .stars{display:flex;align-items:center;gap:4px;margin:.25rem 0 .25rem}
    .stars i{font-size:.95rem;color:#fbbf24}
    .stars small{color:#6b7280}
    .parcelas{color:#374151;font-size:.9rem;margin:.2rem 0}
    .chip-frete{display:inline-flex;gap:6px;align-items:center;background:#10b9811a;border:1px solid #10b98133;color:#065f46;font-weight:600;border-radius:999px;padding:4px 8px;font-size:.82rem;margin:.25rem 0}

    /* Carrinho itens */
    .cart-item{display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid #f3f4f6}
    .cart-item img{width:64px;height:64px;border-radius:10px;object-fit:cover}
    .cart-item .title{font-weight:700}
    .cart-item .meta{color:#6b7280;font-size:.9rem;margin-top:2px}
    .cart-item .actions{margin-left:auto;display:flex;gap:6px}
    .cart-item .actions button{padding:6px 8px;border-radius:8px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer}

    /* Cupom estados */
    .cart-coupon.is-loading input{opacity:.6}
    .cart-coupon.is-valid .coupon-field{outline:2px solid #10b98144;border-radius:10px}
    .cart-coupon.is-invalid .coupon-field{outline:2px solid #ef444444;border-radius:10px}

    /* Frete */
    .ship-opt{display:flex;align-items:flex-start;gap:10px;border:1px solid #e5e7eb;border-radius:10px;padding:10px;margin-bottom:8px}
    .ship-opt label{display:flex;gap:10px;align-items:center;cursor:pointer;width:100%}
    .ship-meta{display:flex;gap:10px;color:#6b7280;font-size:.9rem}
    .ship-price{margin-left:auto;font-weight:700}
    .ship-actions{display:flex;gap:8px;margin-top:8px}
    .ship-actions button{padding:6px 10px;border-radius:8px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer}
    `;
    const s = document.createElement("style");
    s.id = "ss-electronics-style";
    s.textContent = css;
    document.head.appendChild(s);
  })();

  // ========= Helpers & Estado =========
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const $id = (s) => document.getElementById(s);
  const BRL = (n) =>
    Number(n || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  // DOM
  const elGrid = $(".products-container");
  const elSearch = $(".search-input");
  const elCatBtns = $$(".category-btn");

  // Carrinho
  const elCartBtn = $id("cart-button");
  const elBadge = $id("cart-count");
  const elOverlay = $id("cart-overlay");
  const elDrawer = $id("cart-drawer");
  const elClose = $id("cart-close");
  const elItems = $id("cart-items");
  const elSubtotal = $id("cart-subtotal");
  const elReview = $id("cart-review");

  // Frete
  const elShipCep = $id("ship-cep");
  const elShipCalc = $id("ship-calc");
  const elShipOpts = $id("ship-options");
  const elShipRow = $id("cart-shipping");
  const elShipAmt = $id("cart-shipping-amount");

  // Cupom
  const elCupomWrap = $id("cart-coupon");
  const elCupomIn = $id("cart-coupon-input");
  const elCupomBtn = $id("cart-coupon-apply");
  const elCupomFeed = $id("coupon-feedback");
  const elChip = $id("coupon-chip");
  const elChipCode = $id("coupon-code");
  const elChipRem = $id("coupon-remove");

  // Toast container (garantido 1x, no body)
  function ensureToastContainer() {
    let c = $id("toast-container");
    if (!c) {
      c = document.createElement("div");
      c.id = "toast-container";
      document.body.appendChild(c);
    }
    if (c.parentNode !== document.body) {
      c.remove();
      document.body.appendChild(c);
    }
    return c;
  }

  // Estado
  let textoPesquisa = "";
  let categoriaAtual = "all";
  let shipCalculated = false;

  const CART_KEY = "ss_cart";
  const COUPON_KEY = "ss_coupon";
  const SHIP_KEY = "ss_ship";

  const COUPONS = {
    BEMVINDO10: { type: "percent", value: 10, min: 0, label: "Bem-vindo 10%" },
    SKILLSWAP20: {
      type: "percent",
      value: 20,
      min: 800,
      label: "20% acima de R$ 1.000",
    },
    DESCONTO50: {
      type: "fixed",
      value: 50,
      min: 200,
      label: "R$ 50 off acima de R$ 200",
    },
  };

  // Catálogo demo (troque pelos seus dados se quiser)
  const produtos = [
    {
      id: 1,
      nome: "iPhone 16 Pro Max",
      categoria: "smartphones",
      preco: 5759.9,
      precoOriginal: 8999.99,
      desconto: 36,
      imagem:
        "https://www.notebookcheck.info/fileadmin/Notebooks/News/_nc4/rohan-4Ti0LfaqQZY-unsplash.jpg",
      descricao: "Smartphone Apple com câmera avançada",
    },
    {
      id: 2,
      nome: "MacBook Air M3",
      categoria: "laptops",
      preco: 10499.9,
      precoOriginal: 11999.9,
      desconto: 12,
      imagem:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
      descricao: "Notebook Apple ultrafino e potente",
    },
    {
      id: 3,
      nome: "AirPods Pro",
      categoria: "headphones",
      preco: 1099.9,
      precoOriginal: 2299.0,
      desconto: 52,
      imagem:
        "https://preview.redd.it/should-i-buy-airpods-pro-2-v0-vzrxrswuf4se1.jpg?width=640&crop=smart&auto=webp&s=6385cd1c678e5f3d76bb07a2e9af4f1130fd05d7",
      descricao: "Fones sem fio com cancelamento de ruído",
    },
    {
      id: 4,
      nome: "Samsung Galaxy S24",
      categoria: "smartphones",
      preco: 4699.9,
      precoOriginal: 6299.0,
      desconto: 25,
      imagem:
        "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
      descricao: "Smartphone Samsung com tela AMOLED",
    },
    {
      id: 5,
      nome: "PlayStation 5 PRO",
      categoria: "Consoles",
      preco: 5389.9,
      precoOriginal: 7799.9,
      desconto: 37,
      imagem:
        "https://mestredasmilhas.com/wp-content/uploads/2023/04/ps5.webp",
      descricao: "Black Edition 1tb",
    },
    {
      id: 6,
      nome: "Teclado Mecânico",
      categoria: "accessories",
      preco: 599.9,
      precoOriginal: 799.0,
      desconto: 25,
      imagem:
        "https://pcdiga-prod.eu.saleor.cloud/media/thumbnails/products/p052625_1_862513ae_thumbnail_1024.jpg",
      descricao: "Teclado mecânico RGB gamer",
    },
    {
      id: 7,
      nome: "Sony WH-1000XM5",
      categoria: "headphones",
      preco: 2199.9,
      precoOriginal: 2999.0,
      desconto: 27,
      imagem:
        "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400",
      descricao: "Fone com cancelamento de ruído impecável",
    },
    {
      id: 8,
      nome: "Dell XPS 13",
      categoria: "laptops",
      preco: 7999.9,
      precoOriginal: 8999.0,
      desconto: 11,
      imagem:
        "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400",
      descricao: "Notebook i7, 16GB RAM",
    },
    {
      id: 9,
      nome: "iPad Pro",
      categoria: "tablets",
      preco: 4499.9,
      precoOriginal: 5199.0,
      desconto: 13,
      imagem:
        "https://www.techenet.com/wp-content/uploads/2021/06/iPadPro2021-2.jpg",
      descricao: "Toque, desenhe e digite como mágica",
    },
    {
      id: 10,
      nome: "Magic Keyboard para iPad Pro",
      categoria: "tablets",
      preco: 949.9,
      precoOriginal: 1199.0,
      desconto: 21,
      imagem:
        "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f26a8683-305d-4b62-89dd-b597d84f521f.__CR0,0,800,600_PT0_SX600_V1___.jpg",
      descricao: "Teclado oficial para iPad Pro (13”)",
    },
    {
      id: 11,
      nome: "Apple Watch Series 9",
      categoria: "accessories",
      preco: 2389.9,
      precoOriginal: 3799.9,
      desconto: 37,
      imagem:
        "https://noticias.r7.com/resizer/H7AZPL7xNg12h8QLzb2tSc49Wvw=/arc-photo-newr7/arc2-prod/public/RRB4RLTJMRNHTLBNBSJVXNMGBY.jpg",
      descricao: "Relógio inteligente com monitoramento",
    },
    {
      id: 12,
      nome: "MacBook Air M4",
      categoria: "laptops",
      preco: 15919.9,
      precoOriginal: 16999.9,
      desconto: 6,
      imagem:
        "https://webp.br.cdn.pxr.nl/news/2025/03/05/8499ab2fed92cf05e00302aa39450fb7bfee733e.jpg?width=1200",
      descricao: "Superleve, ~1 cm espessura",
    },
  ];
  SS.produtos = produtos;

  // ========= Utils =========
  const resolveImageFor = (id, fb) => {
    if (fb) return fb;
    const p = produtos.find((x) => x.id === id);
    if (p?.imagem) return p.imagem;
    const card = document.querySelector(`.products-card[data-id="${id}"]`);
    if (card) {
      const src = card.querySelector(".products-img")?.src;
      if (src) return src;
    }
    return "img/placeholder.png";
  };
  const BRStars = (seed) => {
    const base = 37 * (seed || 1);
    const frac = (Math.sin(base) + 1) / 2;
    const val = 4.2 + 0.7 * frac;
    const cnt = 50 + Math.floor(frac * 450);
    return { rating: Math.round(val * 10) / 10, count: cnt };
  };
  const starsHTML = (r) => {
    const full = Math.floor(r);
    const half = r - full >= 0.5;
    let h = "";
    for (let i = 0; i < full; i++) h += '<i class="fa-solid fa-star"></i>';
    if (half) h += '<i class="fa-regular fa-star-half-stroke"></i>';
    while ((h.match(/fa-star/g) || []).length < 5)
      h += '<i class="fa-regular fa-star"></i>';
    return h;
  };
  const parcelaHTML = (preco) => {
    if (preco < 300) return "";
    const v = preco / 10;
    return `<div class="parcelas">em 10x de <b>${BRL(v)}</b> sem juros</div>`;
  };
  const freeShipChipHTML = (preco) =>
    preco >= 299
      ? `<div class="chip-frete"><i class="fa-solid fa-truck-fast"></i> Frete GRÁTIS</div>`
      : "";

  // ========= Grid =========
  function renderGrid() {
    if (!elGrid) return;
    const list = produtos.filter((p) => {
      const okCat = categoriaAtual === "all" || p.categoria === categoriaAtual;
      const okTxt = p.nome
        .toLowerCase()
        .includes((textoPesquisa || "").toLowerCase());
      return okCat && okTxt;
    });
    elGrid.innerHTML = list
      .map((prd) => {
        const hasOff = !!(prd.precoOriginal && prd.desconto);
        const { rating, count } = BRStars(prd.id);
        return `
        <div class="products-card" data-id="${prd.id}">
          ${hasOff ? `<span class="badge-off">-${prd.desconto}%</span>` : ""}
          <img class="products-img" src="${prd.imagem}" alt="${prd.nome}">
          <div class="products-info">
            <h3 class="products-name">${prd.nome}</h3>
            <div class="stars">${starsHTML(
              rating
            )} <small>(${rating} • ${count})</small></div>
            <p class="products-description">${prd.descricao}</p>
            ${freeShipChipHTML(prd.preco)}
            <div class="price-row">
              <span class="price-now">${BRL(prd.preco)}</span>
              ${
                hasOff
                  ? `<span class="price-old">${BRL(prd.precoOriginal)}</span>`
                  : ""
              }
              ${
                hasOff ? `<span class="price-off">-${prd.desconto}%</span>` : ""
              }
            </div>
            ${parcelaHTML(prd.preco)}
            <button class="products-button" type="button">Adicionar ao carrinho!</button>
          </div>
        </div>
      `;
      })
      .join("");
  }

  // ========= Busca/Categoria =========
  function pesquisar() {
    textoPesquisa = elSearch?.value || "";
    renderGrid();
  }
  function trocarCategoria(cat) {
    categoriaAtual = cat;
    elCatBtns.forEach((b) =>
      b.classList.toggle("active", b.getAttribute("data-category") === cat)
    );
    renderGrid();
  }

  // ========= Carrinho (estado) =========
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  }
  function setCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    renderCart();
    updateTotals();
  }
  function addToCart(prod) {
    const cart = getCart();
    const i = cart.findIndex((x) => x.id === prod.id);
    const img = resolveImageFor(prod.id, prod.image);
    if (i >= 0) {
      cart[i].qty += 1;
      if (!cart[i].image) cart[i].image = img;
    } else {
      cart.push({
        id: prod.id,
        name: prod.name,
        price: prod.price,
        image: img,
        qty: 1,
      });
    }
    setCart(cart);
    showToast({ id: prod.id, name: prod.name, image: img });
  }
  SS.addToCart = addToCart;
  SS.getCart = getCart;

  function removeItem(id) {
    setCart(getCart().filter((x) => x.id !== id));
  }
  function changeQty(id, d) {
    setCart(
      getCart().map((x) =>
        x.id === id ? { ...x, qty: Math.max(1, x.qty + d) } : x
      )
    );
  }
  function subtotal() {
    return getCart().reduce(
      (a, b) => a + (Number(b.price) || 0) * (Number(b.qty) || 0),
      0
    );
  }

  // ========= Carrinho (UI) =========
  let _lastFocus = null;
  function openCart() {
    _lastFocus = document.activeElement;
    elDrawer?.classList.add("open");
    elOverlay?.classList.add("active");
    if (elOverlay) elOverlay.hidden = false;
    document.body.classList.add("cart-open");
    elCartBtn?.setAttribute("aria-expanded", "true");
    setTimeout(() => elClose?.focus(), 10);
  }
  function closeCart() {
    elDrawer?.classList.remove("open");
    elOverlay?.classList.remove("active");
    if (elOverlay) setTimeout(() => (elOverlay.hidden = true), 280);
    document.body.classList.remove("cart-open");
    elCartBtn?.setAttribute("aria-expanded", "false");
    if (_lastFocus?.focus) _lastFocus.focus();
  }
  function renderCart() {
    const cart = getCart();
    const count = cart.reduce((a, b) => a + b.qty, 0);
    if (elBadge) elBadge.textContent = String(count);

    if (!elItems) return;
    elItems.innerHTML = cart.length
      ? cart
          .map((it) => {
            const img = resolveImageFor(it.id, it.image);
            return `
        <div class="cart-item">
          <img src="${img}" alt="${it.name}">
          <div>
            <div class="title">${it.name}</div>
            <div class="meta">${BRL(it.price)} • qtd <strong>${
              it.qty
            }</strong></div>
          </div>
          <div class="actions">
            <button class="btn-dec" data-id="${
              it.id
            }" aria-label="Diminuir">−</button>
            <button class="btn-inc" data-id="${
              it.id
            }" aria-label="Aumentar">＋</button>
            <button class="btn-rem" data-id="${
              it.id
            }" aria-label="Remover">🗑</button>
          </div>
        </div>
      `;
          })
          .join("")
      : `<p>Seu carrinho está vazio.</p>`;
  }

  // ========= Cupom =========
  const getAppliedCoupon = () => {
    try {
      return JSON.parse(localStorage.getItem(COUPON_KEY) || "null");
    } catch {
      return null;
    }
  };
  const setAppliedCoupon = (obj) => {
    if (!obj) localStorage.removeItem(COUPON_KEY);
    else localStorage.setItem(COUPON_KEY, JSON.stringify(obj));
  };
  function calcDiscount(sub, c) {
    if (!c) return 0;
    if (sub < (c.min || 0)) return 0;
    if (c.type === "percent") return Math.max(0, sub * (c.value / 100));
    if (c.type === "fixed") return Math.min(sub, c.value);
    return 0;
  }
  function validateCouponInput(code) {
    const up = (code || "").trim().toUpperCase();
    if (!/^[A-Z0-9]{5,14}$/.test(up))
      return { ok: false, msg: "Cupom inválido. Use letras/números (5–14)." };
    const rule = COUPONS[up];
    if (!rule) return { ok: false, msg: "Cupom não encontrado ou expirado." };
    const sub = subtotal();
    if (sub < (rule.min || 0))
      return {
        ok: false,
        msg: `Mínimo para este cupom: ${BRL(rule.min || 0)}.`,
      };
    return { ok: true, up, rule };
  }
  function updateCouponUI() {
    const applied = getAppliedCoupon();
    const has = !!applied;
    if (elChip) elChip.hidden = !has;
    if (elCupomIn) {
      elCupomIn.readOnly = has;
      if (has) elCupomIn.value = applied.code;
    }
    if (elCupomBtn) elCupomBtn.disabled = has || !elCupomIn?.value?.trim();
    if (elChipCode && has) elChipCode.textContent = applied.code;
    elCupomFeed && (elCupomFeed.textContent = "");
    elCupomWrap?.classList.remove("is-valid", "is-invalid", "is-loading");
  }

  // ========= Frete =========
  const getShipState = () => {
    try {
      return JSON.parse(localStorage.getItem(SHIP_KEY) || "null");
    } catch {
      return null;
    }
  };
  const setShipState = (v) => {
    if (!v) localStorage.removeItem(SHIP_KEY);
    else localStorage.setItem(SHIP_KEY, JSON.stringify(v));
  };
  const maskCEP = (v) =>
    (v || "")
      .replace(/\D/g, "")
      .slice(0, 8)
      .replace(/(\d{5})(\d{0,3})/, "$1-$2");
  const addDaysStr = (d) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + d);
    return dt.toLocaleDateString("pt-BR");
  };
  function calcShipOptions(sub) {
    if (sub >= 999) {
      return [
        {
          id: "free",
          name: "Frete Grátis",
          price: 0,
          eta: `chega até ${addDaysStr(7)}`,
        },
      ];
    }
    const base = Math.min(0.05 * sub, 49.9);
    const econ = Math.max(14.9, 0.6 * base);
    const pad = Math.max(19.9, 0.85 * base);
    const exp = Math.max(29.9, base);
    return [
      {
        id: "econ",
        name: "Econômico",
        price: econ,
        eta: `${addDaysStr(18)} a ${addDaysStr(25)}`,
      },

      {
        id: "exp",
        name: "Expresso",
        price: exp,
        eta: `${addDaysStr(7)} a ${addDaysStr(10)}`,
      },
    ];
  }
  function renderShipOptions(opts, selectedId) {
    if (!elShipOpts) return;
    elShipOpts.innerHTML =
      opts
        .map(
          (o) => `
        <div class="ship-opt">
          <label>
            <input type="radio" name="shipopt" value="${o.id}" ${
            o.id === selectedId ? "checked" : ""
          }>
            <div>
              <div><strong>${o.name}</strong></div>
              <div class="ship-meta"><span>${o.eta}</span></div>
            </div>
            <div class="ship-price">${BRL(o.price)}</div>
          </label>
        </div>
      `
        )
        .join("") +
      `
      <div class="ship-actions">
        <button type="button" id="ship-hide">Ocultar opções</button>
      </div>
    `;
    elShipOpts.querySelectorAll('input[name="shipopt"]').forEach((r) => {
      r.addEventListener("change", () => {
        const pick = opts.find((x) => x.id === r.value);
        setShipState({ cep: elShipCep.value, pick, calc: true });
        shipCalculated = true;
        updateTotals();
      });
    });
    elShipOpts
      .querySelector("#ship-hide")
      ?.addEventListener("click", () => (elShipOpts.innerHTML = ""));
  }
  const currentShippingPrice = () => {
    if (!shipCalculated) return 0;
    const st = getShipState();
    return st?.pick?.price || 0;
  };

  // ========= Totais =========
  function updateTotals() {
    const sub = subtotal();
    // cupom
    const applied = getAppliedCoupon();
    const off = calcDiscount(sub, applied);
    const partial = Math.max(0, sub - off);
    // frete
    const ship = currentShippingPrice();
    if (elShipRow) {
      if (shipCalculated) {
        elShipRow.hidden = false;
        if (elShipAmt) elShipAmt.textContent = BRL(ship);
      } else {
        elShipRow.hidden = true;
        if (elShipAmt) elShipAmt.textContent = "—";
      }
    }
    const final = Math.max(0, partial + (shipCalculated ? ship : 0));
    const elSavingsRow = $id("cart-savings");
    const elSavingsAmt = $id("cart-savings-amount");
    if (elSavingsRow) elSavingsRow.hidden = !(off > 0);
    if (elSavingsAmt) elSavingsAmt.textContent = BRL(off);
    if (elSubtotal) elSubtotal.textContent = BRL(final);
    localStorage.setItem("ss_cart_subtotal", String(final));
  }

  // ========= Toast =========
  function showToast(prod) {
    ensureToastContainer();
    const cont = $id("toast-container");
    const img = prod.image || resolveImageFor(prod.id) || "img/placeholder.png";
    const sub = subtotal();
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `
      <img src="${img}" alt="${prod.name || "Produto"}">
      <div class="toast-info">
        <strong>${prod.name || "Produto adicionado"}</strong>
        <div class="toast-sub">Adicionado ao carrinho • Subtotal: <b>${BRL(
          sub
        )}</b></div>
      </div>
      <div class="toast-cta">
        <button class="cont" type="button">Continuar</button>
        <button class="see" type="button">Ver carrinho</button>
      </div>
    `;
    cont.appendChild(t);
    t.querySelector(".cont")?.addEventListener("click", () => t.remove());
    t.querySelector(".see")?.addEventListener("click", () => {
      t.remove();
      openCart();
    });
    setTimeout(() => t.remove(), 3500);
  }
  SS.showToast = showToast;

  // ========= Eventos =========
  // Add to cart (delegação)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".products-button");
    if (!btn) return;
    const card = btn.closest(".products-card");
    if (!card) return;
    const id = Number(card.dataset.id);
    const p = produtos.find((x) => x.id === id);
    if (!p) return;
    addToCart({ id: p.id, name: p.nome, price: p.preco, image: p.imagem });
  });

  // Drawer
  elCartBtn?.addEventListener("click", openCart);
  elClose?.addEventListener("click", closeCart);
  elOverlay?.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });

  // Itens do carrinho (delegação)
  elItems?.addEventListener("click", (e) => {
    const t = e.target;
    const id = Number(t.dataset.id);
    if (!id) return;
    if (t.classList.contains("btn-inc")) changeQty(id, +1);
    if (t.classList.contains("btn-dec")) changeQty(id, -1);
    if (t.classList.contains("btn-rem")) removeItem(id);
  });

  // Revisar pedido
  elReview?.addEventListener("click", () => {
    localStorage.setItem("ss_cart_subtotal", String(subtotal()));
    window.location.href = "pagina-resumo.html";
  });

  // Cupom
  if (elCupomIn && elCupomBtn) {
    elCupomIn.addEventListener("input", () => {
      const up = (elCupomIn.value || "").trim().toUpperCase();
      elCupomBtn.disabled = !/^[A-Z0-9]{5,14}$/.test(up);
      elCupomWrap?.classList.remove("is-valid", "is-invalid");
      elCupomFeed && (elCupomFeed.textContent = "");
    });
    elCupomBtn.addEventListener("click", async () => {
      if (!elCupomIn.value.trim()) return;
      elCupomWrap?.classList.add("is-loading");
      await new Promise((r) => setTimeout(r, 300));
      const v = validateCouponInput(elCupomIn.value);
      elCupomWrap?.classList.remove("is-loading");
      if (!v.ok) {
        elCupomWrap?.classList.add("is-invalid");
        elCupomFeed && (elCupomFeed.textContent = v.msg);
        return;
      }
      setAppliedCoupon({ code: v.up, ...v.rule });
      elCupomWrap?.classList.remove("is-invalid");
      elCupomWrap?.classList.add("is-valid");
      elCupomFeed && (elCupomFeed.textContent = "Cupom aplicado com sucesso!");
      updateCouponUI();
      updateTotals();
    });
  }
  elChipRem?.addEventListener("click", () => {
    setAppliedCoupon(null);
    elCupomFeed && (elCupomFeed.textContent = "Cupom removido.");
    updateCouponUI();
    updateTotals();
  });

  // CEP máscara + calcular frete (só mostra opções DEPOIS de clicar)
  if (elShipCep) {
    elShipCep.addEventListener("input", () => {
      const cur = elShipCep.selectionStart;
      elShipCep.value = maskCEP(elShipCep.value);
      elShipCep.setSelectionRange(cur, cur);
    });
  }
  if (elShipCalc) {
    elShipCalc.addEventListener("click", () => {
      const cep = (elShipCep?.value || "").replace(/\D/g, "");
      const hint = document.querySelector(".ship-hint");
      if (cep.length !== 8) {
        if (hint) hint.textContent = "CEP inválido. Ex: 01311-000";
        return;
      }
      const opts = calcShipOptions(subtotal());
      const selected = opts[0].id;
      setShipState({
        cep: elShipCep.value,
        pick: opts.find((o) => o.id === selected),
        calc: true,
      });
      shipCalculated = true;
      renderShipOptions(opts, selected);
      updateTotals();
      if (hint) hint.textContent = `Opções para ${elShipCep.value}:`;
    });
  }

  // ========= Boot =========
  window.addEventListener("DOMContentLoaded", () => {
    ensureToastContainer();
    elSearch?.addEventListener("input", pesquisar);
    elCatBtns.forEach((btn) =>
      btn.addEventListener("click", () =>
        trocarCategoria(btn.getAttribute("data-category"))
      )
    );
    renderGrid();
    renderCart();
    updateCouponUI();
    // Frete começa escondido
    shipCalculated = false;
    if (elShipRow) {
      elShipRow.hidden = true;
      if (elShipAmt) elShipAmt.textContent = "—";
    }
    updateTotals();
    // Corrige imagens antigas do carrinho (compat)
    const fixed = getCart().map((it) => ({
      ...it,
      image: resolveImageFor(it.id, it.image),
    }));
    setCart(fixed);
  });
})();
// === FIX TOAST VISUAL / Z-INDEX / BLUR ===
(function fixToast() {
  let c = document.getElementById("toast-container");
  if (!c) {
    c = document.createElement("div");
    c.id = "toast-container";
    document.body.appendChild(c);
  }
  // garante que esteja no <body>
  if (c.parentNode !== document.body) {
    c.remove();
    document.body.appendChild(c);
  }

  // força camada e cliques
  Object.assign(c.style, {
    position: "fixed",
    right: "16px",
    bottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    zIndex: "2147483647",
    pointerEvents: "auto",
  });

  console.log("✅ Toast container reposicionado no topo (fora do blur)");
})();

// === SkillSwap SAFE PATCH v10 — blur, camadas e toast visível ===
(function SAFE_PATCH() {
  // 0) GARANTE IDs/elementos
  function byId(id) {
    return document.getElementById(id);
  }
  const ensure = (id) => {
    let el = byId(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
    }
    if (el.parentNode !== document.body) {
      try {
        el.parentNode?.removeChild(el);
      } catch {}
      document.body.appendChild(el);
    }
    return el;
  };

  const overlay = ensure("cart-overlay");
  const drawer = ensure("cart-drawer");
  const toastCt = ensure("toast-container");

  // 1) CSS ÚNICO (z-index + blur só no #app-root)
  if (!byId("ss-safe-style")) {
    const css = `
      /* Camadas máximas e cliques corretos */
      #cart-overlay{position:fixed!important;inset:0!important;background:rgba(17,24,39,.45)!important;
        -webkit-backdrop-filter:blur(3px)!important;backdrop-filter:blur(3px)!important;
        z-index:2147483600!important;opacity:0;transition:opacity .25s ease;}
      #cart-overlay.active{opacity:1;}
      #cart-drawer{position:fixed!important;top:0!important;right:0!important;height:100vh!important;width:min(420px,92vw)!important;
        background:#fff!important;box-shadow:0 10px 30px rgba(0,0,0,.18)!important;
        z-index:2147483606!important;transform:translateX(100%)!important;transition:transform .28s cubic-bezier(.2,.7,.2,1)!important;
        display:flex!important;flex-direction:column!important;pointer-events:auto!important;}
      #cart-drawer.open{transform:translateX(0)!important;}
      #toast-container{position:fixed!important;right:16px!important;bottom:16px!important;display:flex!important;
        flex-direction:column!important;gap:12px!important;z-index:2147483647!important;pointer-events:auto!important;}

      /* Blur SOMENTE no wrapper, se existir */
      body.cart-open #app-root{filter:blur(3px) saturate(.96); pointer-events:none;}
      /* …mas o drawer e o toast continuam clicáveis */
      body.cart-open #cart-drawer, body.cart-open #cart-drawer *{pointer-events:auto!important;}
      body.cart-open #toast-container, body.cart-open #toast-container *{pointer-events:auto!important;}
    `;
    const st = document.createElement("style");
    st.id = "ss-safe-style";
    st.textContent = css;
    document.head.appendChild(st);
  }

  // 2) ABRIR/FECHAR — robusto (não depende de outros handlers)
  const btnOpen = byId("cart-button");
  const btnClose = byId("cart-close");
  function openCart() {
    document.body.classList.add("cart-open");
    overlay.hidden = false;
    overlay.classList.add("active");
    drawer.classList.add("open");
    setTimeout(() => {
      try {
        btnClose?.focus();
      } catch {}
    }, 10);
  }
  function closeCart() {
    drawer.classList.remove("open");
    overlay.classList.remove("active");
    setTimeout(() => (overlay.hidden = true), 250);
    document.body.classList.remove("cart-open");
  }
  btnOpen?.addEventListener("click", openCart);
  btnClose?.addEventListener("click", closeCart);
  overlay?.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });

  // 3) TOAST À PROVA DE CSS — sobrescreve SS.showToast
  function BRL(n) {
    return Number(n || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }
  function safeSubtotal() {
    try {
      const cart = JSON.parse(localStorage.getItem("ss_cart") || "[]");
      return cart.reduce(
        (a, b) => a + (Number(b.price) || 0) * (Number(b.qty) || 0),
        0
      );
    } catch {
      return 0;
    }
  }
  function resolveImageFor(id, fallback) {
    if (fallback) return fallback;
    const card = document.querySelector(
      '.products-card[data-id="' + id + '"] .products-img'
    );
    return card?.src || "img/placeholder.png";
  }
  function SHOW_TOAST({ id, name, image } = {}) {
    const t = document.createElement("div");
    // INLINE styles (ignora qualquer .toast do seu CSS antigo)
    t.setAttribute("role", "status");
    t.style.cssText = [
      "display:flex",
      "align-items:center",
      "gap:12px",
      "width:min(380px,92vw)",
      "padding:10px 12px",
      "border-radius:14px",
      "color:#fff",
      "background:rgba(17,24,39,.9)",
      "backdrop-filter:blur(8px)",
      "border:1px solid rgba(255,255,255,.15)",
      "box-shadow:0 10px 30px rgba(0,0,0,.25)",
      "animation: none",
    ].join(";");

    const img = document.createElement("img");
    img.src = resolveImageFor(id, image);
    img.alt = "";
    img.style.width = "56px";
    img.style.height = "56px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "10px";

    const info = document.createElement("div");
    info.style.flex = "1";
    info.style.minWidth = "0";
    info.innerHTML = `
      <strong style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${
        name || "Produto adicionado"
      }</strong>
      <div style="opacity:.9;margin-top:2px">Subtotal: <b>${BRL(
        safeSubtotal()
      )}</b></div>
    `;

    const ctas = document.createElement("div");
    const btnCont = document.createElement("button");
    const btnSee = document.createElement("button");
    [btnCont, btnSee].forEach((b) => {
      b.style.border = "0";
      b.style.padding = "8px 10px";
      b.style.borderRadius = "10px";
      b.style.cursor = "pointer";
      b.style.marginLeft = "8px";
    });
    btnCont.textContent = "Continuar";
    btnCont.style.background = "#111827";
    btnCont.style.color = "#fff";
    btnCont.style.border = "1px solid #374151";
    btnSee.textContent = "Ver carrinho";
    btnSee.style.background = "#fff";
    btnSee.style.color = "#111827";

    ctas.appendChild(btnCont);
    ctas.appendChild(btnSee);
    t.appendChild(img);
    t.appendChild(info);
    t.appendChild(ctas);
    toastCt.appendChild(t);

    btnCont.onclick = () => t.remove();
    btnSee.onclick = () => {
      t.remove();
      openCart();
    };
    setTimeout(() => {
      try {
        t.remove();
      } catch {}
    }, 3500);
  }

  // expõe e PRIORIZA o nosso toast
  window.SS = window.SS || {};
  window.SS.showToast = SHOW_TOAST;

  // 4) REBIND do botão "Adicionar ao carrinho" (não mexe no seu addToCart)
  document.addEventListener(
    "click",
    (e) => {
      const btn = e.target.closest(".products-button");
      if (!btn) return;
      const card = btn.closest(".products-card");
      if (!card) return;
      const id = Number(card.dataset.id) || 0;
      const name =
        card.querySelector(".products-name")?.textContent?.trim() || "Produto";
      // chama o toast SEM depender das classes/estilos antigos
      SHOW_TOAST({ id, name });
    },
    { capture: true }
  );

  console.log(
    "✅ SAFE PATCH v10 aplicado (camadas + blur isolado + toast inline)."
  );
})();
/* ========================= SkillSwap PRO Patch v2 =========================
 * Cola este bloco no FIM do seu pagina-eletronico.js (ou inclui como script).
 * O que faz:
 * - Garante desc e variantes no carrinho (ss_cart)
 * - Intercepta "Adicionar ao carrinho" sem quebrar seu fluxo
 * - Toast PRO (7s, pausa no hover, CTAs, z-index alto)
 * - CSS injetado para toasts/labels sem conflitar com seu tema
 * - Idempotente (não duplica handlers)
 * ======================================================================== */
(function(){
  "use strict";

  /* ---------- Config “big-tech” ---------- */
  const THEME = {
    brand:    "#8cc63f",
    ink:      "#111827",
    line:     "#e6eaf0",
    ok:       "#10b981",
    danger:   "#ef4444",
    toastSec: 7_000,   // duração padrão do toast (ms)
    toastSecAfterHover: 2600
  };

  const CART_KEY = "ss_cart";

  /* ---------- Utils ---------- */
  const $   = (s, p=document) => p.querySelector(s);
  const $$  = (s, p=document) => [...p.querySelectorAll(s)];
  const BRL = n => Number(n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

  const once = (el, type, handler, opts) => {
    const key = "__once__" + type + (handler.name||"");
    if (el[key]) return;
    el.addEventListener(type, handler, opts);
    el[key] = true;
  };

  function ensureToastContainer(){
    let c = document.getElementById("toast-container");
    if (!c){
      c = document.createElement("div");
      c.id = "toast-container";
      Object.assign(c.style, {
        position:"fixed", right:"16px", bottom:"16px",
        display:"flex", flexDirection:"column", gap:"12px",
        zIndex: 2147483647, pointerEvents:"auto"
      });
      document.body.appendChild(c);
    } else if (c.parentNode !== document.body){
      c.remove(); document.body.appendChild(c);
    }
    return c;
  }

  function injectCSS(){
    if (document.getElementById("ss-pro-styles")) return;
    const css = `
      /* Toast PRO */
      #toast-container .ss-toast{
        display:flex; gap:12px; align-items:center;
        width:min(420px, 92vw);
        padding:12px 14px; border-radius:14px;
        color:#fff; background:rgba(17,24,39,.92);
        backdrop-filter:blur(8px);
        border:1px solid rgba(255,255,255,.15);
        box-shadow:0 10px 30px rgba(0,0,0,.25);
        animation:ssToastIn .18s ease-out;
      }
      #toast-container .ss-toast img{
        width:56px; height:56px; border-radius:10px; object-fit:cover;
      }
      #toast-container .ss-toast .ss-info{ flex:1; min-width:0 }
      #toast-container .ss-toast .ss-info strong{
        display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
      }
      #toast-container .ss-toast .ss-sub{
        font-size:.9rem; opacity:.9; margin-top:2px;
      }
      #toast-container .ss-toast .ss-cta{ display:flex; gap:8px; }
      #toast-container .ss-toast .ss-cta button{
        border:0; padding:8px 10px; border-radius:10px; cursor:pointer;
      }
      #toast-container .ss-toast .see{ background:#fff; color:${THEME.ink} }
      #toast-container .ss-toast .cont{ background:${THEME.ink}; color:#fff; border:1px solid #374151 }

      @keyframes ssToastIn{ from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

      /* Badge/labels pequenos (se precisar em cards) */
      .ss-chip-free{
        display:inline-flex; align-items:center; gap:6px;
        background:${THEME.ok}1a; border:1px solid ${THEME.ok}33; color:#065f46;
        font-weight:600; border-radius:999px; padding:4px 8px; font-size:.82rem;
      }
    `;
    const s = document.createElement("style");
    s.id = "ss-pro-styles";
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---------- Carrinho ---------- */
  function getCart(){
    try{ return JSON.parse(localStorage.getItem(CART_KEY) || "[]") }catch{ return [] }
  }
  function setCart(arr){
    localStorage.setItem(CART_KEY, JSON.stringify(arr));
    // atualiza badge comum
    const count = arr.reduce((a,b)=> a + (Number(b.qty)||0), 0);
    const badge = document.getElementById("cart-count") || document.getElementById("header-badge");
    if (badge) badge.textContent = String(count);
  }

  function safeImageFromCard(card){
    return card?.querySelector?.(".products-img")?.getAttribute("src")
           || card?.querySelector?.("img")?.getAttribute("src")
           || "img/placeholder.png";
  }
  function safeDescFromCard(card){
    return card?.querySelector?.(".products-description")?.textContent?.trim()
           || card?.querySelector?.(".desc")?.textContent?.trim()
           || card?.getAttribute?.("data-desc")
           || "—";
  }

  function getSelectedVariantFrom(card){
    // 1) selects comuns
    const selCor   = card.querySelector("select[name='cor'], select[name='color'], select[name='variantColor']");
    const selTam   = card.querySelector("select[name='tamanho'], select[name='size'], select[name='variantSize']");

    // 2) botões/bolinhas de cor/tamanho com seleção
    const btnCor   = card.querySelector("[data-variant='cor'].selected, [data-variant='color'].selected, [data-variant='cor'][aria-pressed='true'], .swatch-color.selected");
    const btnTam   = card.querySelector("[data-variant='tamanho'].selected, [data-variant='size'].selected, [data-variant='tamanho'][aria-pressed='true'], .swatch-size.selected");

    // 3) data attributes diretos no card
    const dataCor  = card.getAttribute("data-cor") || card.getAttribute("data-color");
    const dataTam  = card.getAttribute("data-tamanho") || card.getAttribute("data-size");

    const cor = (selCor?.value || selCor?.selectedOptions?.[0]?.text || btnCor?.dataset?.value || btnCor?.textContent || dataCor || "").trim() || undefined;
    const tamanho = (selTam?.value || selTam?.selectedOptions?.[0]?.text || btnTam?.dataset?.value || btnTam?.textContent || dataTam || "").trim() || undefined;

    return (cor || tamanho) ? { cor, tamanho } : null;
  }

  function normalizeProductFromCard(card){
    // ID
    const id = Number(card?.dataset?.id) || Number(card?.getAttribute?.("data-product-id")) || Date.now();

    // Nome
    const name =
      card?.querySelector?.(".products-name")?.textContent?.trim() ||
      card?.querySelector?.(".title, h3, h2")?.textContent?.trim() ||
      "Produto";

    // Preço atual
    let price = 0;
    const priceText =
      card?.querySelector?.(".price-now")?.textContent ||
      card?.querySelector?.("[data-price]")?.getAttribute?.("data-price") ||
      card?.querySelector?.(".price, .valor, .preco")?.textContent || "0";
    price = Number(
      (priceText||"0").replace(/[^\d,.-]/g,"").replace(/\.(?=\d{3})/g,"").replace(",",".")
    ) || 0;

    // Imagem e descrição
    const image = safeImageFromCard(card);
    const desc  = safeDescFromCard(card);

    // Variantes
    const variant = getSelectedVariantFrom(card);

    return { id, name, price, image, desc, variant };
  }

  function upsertCartItem(payload){
    const cart = getCart();
    // “Mesma variante” = mesmo id + JSON de variant igual (ou ambos nulos)
    const sameVariant = (a,b) => JSON.stringify(a?.variant||null) === JSON.stringify(b?.variant||null);
    const idx = cart.findIndex(x => x.id===payload.id && sameVariant(x, payload));

    if (idx>=0){
      cart[idx].qty = Math.max(1, Number(cart[idx].qty||1) + 1);
      // completa campos faltantes (desc, image, variant)
      cart[idx].image   = cart[idx].image   || payload.image;
      cart[idx].desc    = cart[idx].desc    || payload.desc;
      cart[idx].variant = cart[idx].variant || payload.variant || null;
    } else {
      cart.push({
        id: payload.id,
        name: payload.name,
        price: Number(payload.price)||0,
        qty: 1,
        image: payload.image || "img/placeholder.png",
        desc: payload.desc || "—",
        variant: payload.variant || null
      });
    }
    setCart(cart);
    return cart;
  }

  /* ---------- Toast PRO (sobrepõe qualquer toast antigo) ---------- */
  function showToastPRO({ id, name, image }){
    const cont = ensureToastContainer();
    const t = document.createElement("div");
    t.className = "ss-toast";
    t.innerHTML = `
      <img src="${image||"img/placeholder.png"}" alt="">
      <div class="ss-info">
        <strong>${name||"Produto adicionado"}</strong>
        <div class="ss-sub">Adicionado ao carrinho • Subtotal: <b>${BRL(
          getCart().reduce((a,b)=>a+(+b.price||0)*(+b.qty||0),0)
        )}</b></div>
      </div>
      <div class="ss-cta">
        <button class="cont" type="button">Continuar</button>
        <button class="see"  type="button">Ver carrinho</button>
      </div>
    `;
    cont.appendChild(t);

    // Fechamento com pausa no hover
    let timer = setTimeout(()=> t.remove(), THEME.toastSec);
    t.addEventListener("mouseenter", ()=> clearTimeout(timer));
    t.addEventListener("mouseleave", ()=> timer = setTimeout(()=> t.remove(), THEME.toastSecAfterHover));

    t.querySelector(".cont")?.addEventListener("click", ()=> t.remove());
    t.querySelector(".see")?.addEventListener("click", ()=>{
      t.remove();
      // tenta abrir seu drawer se existir
      const openBtn = document.getElementById("cart-button") || document.querySelector("[data-open-cart]");
      if (openBtn){ openBtn.click(); }
      else {
        // fallback: redireciona para resumo
        try{ window.location.href = "pagina-resumo.html"; }catch{}
      }
    });
  }

  // expõe como SS.showToast para substituir toasts antigos
  window.SS = window.SS || {};
  window.SS.showToast = showToastPRO;

  /* ---------- Intercepta “Adicionar ao carrinho” ---------- */
  function bindAddToCartButtons(root=document){
    $$("[data-ss-bound!='1'] .products-button, .products-button", root).forEach(btn=>{
      const host = btn.closest("[data-ss-bound='1']");
      if (host) return; // já tratado via wrapper de container
      const card = btn.closest(".products-card") || btn.closest("[data-product-id]") || btn.closest("article, .card, .produto");
      if (!card) return;

      // marca o card para não duplicar
      card.setAttribute("data-ss-bound", "1");

      once(btn, "click", (e)=>{
        try{
          const prod = normalizeProductFromCard(card);
          const cart = upsertCartItem(prod);
          showToastPRO({ id: prod.id, name: prod.name, image: prod.image });
        }catch(err){ console.error("SS PRO Patch addToCart error:", err); }
      });
    });
  }

  // Observa DOM para cards carregados depois
  let mo = null;
  function startObserver(){
    if (mo) return;
    mo = new MutationObserver((muts)=>{
      for (const m of muts){
        if (m.type === "childList" && (m.addedNodes?.length||0)){
          bindAddToCartButtons(document);
        }
      }
    });
    mo.observe(document.documentElement, {childList:true, subtree:true});
  }

  // Caso exista uma função global antiga, embrulha para forçar desc/variant
  if (typeof window.addToCart === "function"){
    const _oldAdd = window.addToCart;
    window.addToCart = function(payload){
      try{
        // completa payload se veio sem desc/variant
        if (!payload || typeof payload !== "object"){
          return _oldAdd.apply(this, arguments);
        }
        const card = document.querySelector(`.products-card[data-id="${payload.id}"]`);
        const extra = card ? { desc: safeDescFromCard(card), variant: getSelectedVariantFrom(card) } : {};
        const full = { ...payload, ...extra };
        // upsert no nosso formato também (garantindo no storage)
        upsertCartItem(full);
        showToastPRO({ id: full.id, name: full.name, image: full.image });
      }catch(e){
        console.warn("SS PRO Patch wrapper fallback:", e);
      }
      return _oldAdd.apply(this, arguments);
    };
  }

  /* ---------- Boot ---------- */
  injectCSS();
  bindAddToCartButtons(document);
  startObserver();

  console.log("✅ SkillSwap PRO Patch v2 ativo — variantes/desc garantidos + toast PRO.");
})();
