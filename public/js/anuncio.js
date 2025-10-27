// js/anuncio.js (CORRIGIDO E CONSISTENTE)

// API URLs (sem alteração)
const API_SERVICOS_URL = 'http://localhost:3000/api/servicos'; 
const API_PRODUTOS_URL = 'http://localhost:3000/api/produtos'; 

// Chaves de Auth (sem alteração)
const AUTH_KEY_NOVO = 'ss_auth_user';
const AUTH_KEY_ANTIGO_ID = 'usuarioId'; 
const AUTH_KEY_ANTIGO_NOME = 'usuarioNome';

// ----------------------------------------------------
// LÓGICA DE LOGIN E UI (HEADER)
// (Funções que você forneceu)
// ----------------------------------------------------
function fazerLogout() {
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioNome');
    
    // Limpa ambos os sistemas de login para garantir
    localStorage.removeItem(AUTH_KEY_NOVO); 
    localStorage.removeItem(AUTH_KEY_ANTIGO_ID);
    localStorage.removeItem(AUTH_KEY_ANTIGO_NOME);
    localStorage.removeItem('ss_draft');

    if (typeof Toastify === "function") {
        Toastify({
            text: "Sessão encerrada. Até logo!",
            duration: 2000,
            style: { 
                background: "linear-gradient(to right, #ff5f6d, #ffc371)",
                opacity: 0.9 
            },
        }).showToast();
    } else {
        alert("Sessão encerrada.");
    }
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function gerenciarUI() {
    // Esta função mira no HEADER. O HTML do header de 'anuncio.html'
    // é igual ao de 'servicos.html', então deve funcionar.
    const userMenuTrigger = document.getElementById('userMenuTrigger');
    const navUserName = document.getElementById('navUserName');
    const userMenuContent = document.getElementById('userMenuContent');
    const dropdown = document.getElementById('userMenuDropdown');

    const usuarioNome = localStorage.getItem('usuarioNome');
    const usuarioId = localStorage.getItem('usuarioId');
    
    if (usuarioNome && usuarioId && userMenuTrigger && navUserName && userMenuContent && dropdown) {
        // --- Usuário LOGADO ---
        const primeiroNome = usuarioNome.split(' ')[0];
        navUserName.textContent = `Olá, ${primeiroNome}!`;

        userMenuContent.innerHTML = `
            <a href="pagina_editarPerfil.html?id=${usuarioId}">Meu Perfil</a>
            <a href="pagina-servicos.html">Ver Feed</a>
            <a href="#" id="btnLogout">Sair</a>
        `;

        const btnLogout = userMenuContent.querySelector('#btnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', (e) => {
                e.preventDefault();
                fazerLogout();
            });
        }

        userMenuTrigger.addEventListener('click', (e) => {
            e.preventDefault(); 
            dropdown.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });

    } else if (navUserName && userMenuContent && userMenuTrigger) {
        // --- Usuário DESLOGADO ---
        navUserName.textContent = 'Entrar';
        userMenuContent.innerHTML = `
            <a href="index.html">Fazer Login</a>
            <a href="index.html?mode=register">Registrar-se</a>
        `;
         userMenuTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }
}

// Roda a verificação de UI assim que a página carrega
document.addEventListener('DOMContentLoaded', () => {
  gerenciarUI();
});

// ----------------------------------------------------
// INÍCIO DA LÓGICA DO FORMULÁRIO DE ANÚNCIO
// ----------------------------------------------------
(() => {
  // ===== Utils
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  // ===== Estado
  let step = 1;
  let mode = "produto";
  let images = [];

  const DRAFT_KEY = 'ss_draft';
  const MIN_STARS = 3;
  const ENABLE_GATES = true;
  const user = { stars: 4.7 }; // Mock (não mais usado para o gate)

  // ===== Toast PRO (compacto)
  initToastPRO();
  function toast(msg, variant = "info", title) {
    window.anToast ? anToast(msg, variant, title) : alert(title ? `${title}\n${msg}` : msg);
  }

  // ==========================================================
  // ===== Auth (CORRIGIDO) =====
  // ==========================================================

  /**
   * CORRIGIDO: Esta função agora usa a sua lógica de login
   */
  function isAuth() {
    const usuarioId = localStorage.getItem('usuarioId');
    const usuarioNome = localStorage.getItem('usuarioNome');
    return !!(usuarioId && usuarioNome); // Retorna true se ambos existirem
  }

  /**
   * CORRIGIDO: Esta função agora usa a sua lógica de login
   * e retorna o objeto no formato que a API precisa.
   */
  function getAuthProfile() {
    const id = localStorage.getItem('usuarioId');
    const nome = localStorage.getItem('usuarioNome');
    
    if (id && nome) {
      // Retorna o perfil no formato esperado pelo resto do script
      return {
        id: id,
        nome: nome
        // Note: A sua lógica de login não salva as estrelas (avaliacao_geral)
        // no localStorage, por isso o "Gate de Reputação" foi removido.
      };
    }
    
    // Se não encontrou, tenta o outro sistema (fallback, mas o seu é prioridade)
    try {
      const raw = localStorage.getItem('ss_auth_user');
      if (raw && raw !== 'null' && raw !== 'undefined') {
           const u = JSON.parse(raw);
           if (u && u.id) return u;
      }
    } catch {}

    return null; // Não está logado
  }

  function goLogin() {
    localStorage.setItem('ss_continue_to', 'pagina-anuncio.html?resume=1');
    window.location.href = 'index.html';
  }

  // ===== Passos / UI (Sem alterações)
  const stepsOl = $("#steps");
  const cards = $$("section.card");
  const modeBtns = $$(".mode-btn");

  function gotoStep(n) {
    step = clamp(n, 1, 5);
    cards.forEach(c => c.hidden = Number(c.dataset.step) !== step);
    if (stepsOl) [...stepsOl.children].forEach((li, i) => li.classList.toggle("is-active", i + 1 === step));
    saveDraft();
    if (step === 5) buildReviewList();
    refreshPublishGuard();
    updateProgress();
    smoothToTop();
  }
  function updateProgress() {
    const pct = Math.round(((step - 1) / 4) * 100);
    const fill = document.getElementById('anProgressFill');
    const txt = document.getElementById('anProgressText');
    const hint = document.getElementById('anProgressHint');
    if (fill) fill.style.width = `${pct}%`;
    if (txt) txt.textContent = `${pct}%`;
    if (hint) hint.textContent = `Passo ${step} de 5`;
  }

  function smoothToTop() {
    const anchor = document.querySelector('#announce');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }


  $$("[data-next]").forEach(b => b.addEventListener("click", () => {
    if (validateStep(step, { reveal: true })) gotoStep(step + 1);
  }));
  $$("[data-prev]").forEach(b => b.addEventListener("click", () => gotoStep(step - 1)));

  modeBtns.forEach(btn => {
    btn.addEventListener("click", () => switchMode(btn.dataset.mode));
  });
  function switchMode(m) {
    mode = (m || "").toLowerCase();
    modeBtns.forEach(b => b.classList.toggle("is-current", b.dataset.mode === mode));
    document.querySelectorAll("[data-show]").forEach(el => {
      const show = (el.dataset.show || "").split(/\s+/).includes(mode);
      el.hidden = !show;
      el.setAttribute("aria-hidden", show ? "false" : "true");
      el.querySelectorAll("input,select,textarea,button").forEach(f => f.disabled = !show);
    });
    $("#prevTipo") && ($("#prevTipo").textContent = mode);
    saveDraft();
  }

  // ===== Preview (Sem alterações)
  const prevTitulo = $("#prevTitulo");
  const prevTipo = $("#prevTipo");
  const prevDesc = $("#prevDesc");
  const prevPreco = $("#prevPreco");
  const prevLocal = $("#prevLocal");
  const prevImg = $("#prevImg");

  const toBRL = (v) => {
    const digits = (v || "").replace(/[^\d]/g, "");
    if (!digits) return "";
    const n = (parseInt(digits, 10) / 100).toFixed(2);
    return n.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const bindMap = {
    fldTitulo: v => { prevTitulo && (prevTitulo.textContent = v || "Título do anúncio"); saveDraft(); maybeUpdateReview(); },
    fldCategoria: () => { saveDraft(); maybeUpdateReview(); },
    fldEstado: () => { saveDraft(); maybeUpdateReview(); },
    fldUnidade: () => { saveDraft(); maybeUpdateReview(); },
    fldCobrarPor: () => { saveDraft(); maybeUpdateReview(); },
    fldPreco: v => {
      const el = $("#fldPreco");
      const m = toBRL(v);
      if (el && el.value !== m) el.value = m;
      prevPreco && (prevPreco.textContent = m ? `R$ ${m}` : "R$ —");
      saveDraft(); maybeUpdateReview();
    },
    fldTroca: () => { saveDraft(); maybeUpdateReview(); },
    fldDisp: () => { saveDraft(); maybeUpdateReview(); },
    fldLocal: v => { prevLocal && (prevLocal.textContent = v || "Cidade, UF"); saveDraft(); maybeUpdateReview(); },
    fldEntrega: () => { saveDraft(); maybeUpdateReview(); },
  };

  Object.keys(bindMap).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const h = e => bindMap[id](e.target.value);
    (el.tagName === "SELECT" ? el.addEventListener("change", h) : el.addEventListener("input", h));
  });

  $("#fldPreco")?.addEventListener("input", (e) => {
    const caret = e.target.selectionStart;
    const before = e.target.value.length;
    const digits = (e.target.value || "").replace(/[^\d]/g, "");
    const brl = (digits ? (Number(digits) / 100).toFixed(2) : "0.00")
      .replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    e.target.value = brl;
    const after = e.target.value.length;
    const delta = after - before;
    const pos = Math.max(0, (caret || 0) + delta);
    e.target.setSelectionRange(pos, pos);
    bindMap.fldPreco(e.target.value);
  });

  // ===== Uploader (Sem alterações)
  const fileInput = $("#fileInput");
  const dropBtn = $("#dropBtn");
  const thumbs = $("#thumbs");
  const objectURLs = [];

  function setCover(url) {
    if (!prevImg) return;
    prevImg.style.backgroundImage = `url('${url}')`;
    prevImg.style.backgroundSize = "cover";
    prevImg.style.backgroundPosition = "center";
    prevImg.innerHTML = "";
  }
  function resetCover() {
    if (!prevImg) return;
    prevImg.style.backgroundImage = "";
    prevImg.innerHTML = "<span>capa</span>";
  }
  function cleanupURLs() { objectURLs.splice(0).forEach(URL.revokeObjectURL); }

  function renderThumbs() {
    if (!thumbs) return;
    thumbs.innerHTML = "";
    cleanupURLs();
    images.forEach((f, idx) => {
      const url = URL.createObjectURL(f);
      objectURLs.push(url);
      const div = document.createElement("div");
      div.className = "thumb";
      div.innerHTML = `
        <img src="${url}" alt="">
        <button type="button" aria-label="Remover"><i class="fa-solid fa-xmark"></i></button>`;
      div.querySelector("button").onclick = () => {
        images.splice(idx, 1);
        renderThumbs();
        if (idx === 0) resetCover();
        refreshPublishGuard();
      };
      thumbs.appendChild(div);
      if (idx === 0) setCover(url);
    });
  }

  function addFiles(files) {
    const imgs = files.filter(f => f && f.type && f.type.startsWith("image/"));
    const room = Math.max(0, 8 - images.length);
    imgs.slice(0, room).forEach(f => images.push(f));
    if (files.length > room) toast("Limite de 8 imagens. Algumas foram ignoradas.", "warn");
    renderThumbs();
    refreshPublishGuard();
  }

  if (dropBtn && fileInput) {
    dropBtn.addEventListener("click", () => fileInput.click());
    ["dragenter", "dragover"].forEach(evt => dropBtn.addEventListener(evt, e => { e.preventDefault(); dropBtn.style.borderColor = "#0e5aa7"; }));
    ["dragleave", "drop"].forEach(evt => dropBtn.addEventListener(evt, e => { e.preventDefault(); dropBtn.style.borderColor = "#d7deea"; }));
    dropBtn.addEventListener("drop", e => addFiles([...e.dataTransfer.files]));
    fileInput.addEventListener("change", e => addFiles([...e.target.files]));
    window.addEventListener("beforeunload", cleanupURLs);
  }

  // ===== Validação (Sem alterações)
  markRequiredUI();

  function markRequiredUI() {
    document.querySelectorAll(".fld").forEach(lbl => {
      const ctrl = lbl.querySelector("input[required], select[required], textarea[required]");
      if (!ctrl) return;
      lbl.classList.add("--required");
      ctrl.setAttribute("aria-required", "true");

      ctrl.addEventListener("input", () => {
        clearError(ctrl);
        refreshPublishGuard();
      });
      ctrl.addEventListener("change", () => {
        clearError(ctrl);
        refreshPublishGuard();
      });
    });
  }

  function fieldError(ctrl, message = "Campo obrigatório") {
    if (!ctrl) return;
    ctrl.classList.add("has-error");
    ctrl.setAttribute("aria-invalid", "true");
    let help = ctrl.parentElement?.querySelector(".an-field-msg");
    if (!help) {
      help = document.createElement("small");
      help.className = "an-field-msg";
      ctrl.parentElement?.appendChild(help);
    }
    help.textContent = message;
    if (typeof ctrl.focus === "function") ctrl.focus({ preventScroll: true });
    const rect = ctrl.getBoundingClientRect();
    window.scrollBy({ top: rect.top - 120, behavior: "smooth" });
  }
  function clearError(ctrl) {
    if (!ctrl) return;
    ctrl.classList.remove("has-error");
    ctrl.removeAttribute("aria-invalid");
    const help = ctrl.parentElement?.querySelector(".an-field-msg");
    if (help) help.textContent = "";
  }

  function controlIsValid(ctrl) {
    if (ctrl.disabled) return true;
    if (ctrl.tagName === "SELECT") { return (ctrl.value || "").trim() !== ""; }
    if (ctrl.type === "checkbox" || ctrl.type === "radio") { return !!ctrl.checked; }
    return (ctrl.value || "").trim() !== "";
  }

  function firstInvalidInStep(s) {
    const card = document.querySelector(`section.card[data-step="${s}"]`);
    if (!card || card.hidden) return null;
    const reqs = [...card.querySelectorAll("[required]:not([disabled])")].filter(el => {
      const hidden = el.closest('[hidden],[aria-hidden="true"]');
      return !hidden;
    });

    if (s === 2 && !images.length) return { ctrl: null, msg: "Adicione pelo menos uma imagem." };
    if (s === 3) {
      const preco = $("#fldPreco");
      const raw = (preco?.value || "").replace(/\./g, "").replace(",", ".");
      const valor = Number(raw);
      if (!(valor > 0)) return { ctrl: preco, msg: "Informe um preço maior que zero." };
    }
    if (s === 4) {
      const local = $("#fldLocal");
      if (!local?.value.trim()) return { ctrl: local, msg: "Informe cidade e UF." };
    }

    for (const el of reqs) {
      if (!controlIsValid(el)) {
        const msg = el.dataset.requiredMessage || "Campo obrigatório";
        return { ctrl: el, msg };
      }
    }
    return null;
  }

  function validateStep(s, { reveal = false } = {}) {
    const card = document.querySelector(`section.card[data-step="${s}"]`);
    card?.querySelectorAll(".has-error").forEach(el => clearError(el));

    const err = firstInvalidInStep(s);
    if (!err) return true;

    if (reveal) {
      if (err.ctrl) fieldError(err.ctrl, err.msg);
      else toast(err.msg, "warn", "Imagens necessárias");
    }
    return false;
  }

  // ===== Review list (Sem alterações)
  function buildReviewList() {
    const ul = $("#reviewList"); if (!ul) return;
    const get = id => document.getElementById(id)?.value || "";
    const preco = $("#fldPreco")?.value || "";
    const items = [
      { step: 1, label: "Título", value: get("fldTitulo") },
      { step: 1, label: "Categoria", value: get("fldCategoria") },
      { step: 1, label: "Estado", value: get("fldEstado") },
      { step: 1, label: "Unidade", value: get("fldUnidade") },
      ...(mode === "servico" ? [{ step: 1, label: "Cobrar por", value: get("fldCobrarPor") }] : []),
      { step: 2, label: "Imagens", value: `${images.length} selecionada(s)` },
      { step: 3, label: "Preço", value: preco ? `R$ ${preco}` : "" },
      { step: 4, label: "Localização", value: get("fldLocal") },
      { step: 4, label: "Entrega/Execução", value: get("fldEntrega") },
    ];

    ul.innerHTML = "";
    for (const it of items) {
      const li = document.createElement("li");
      li.className = "review-item";
      li.setAttribute("data-go-step", String(it.step));
      li.innerHTML = `<span class="label">${it.label}</span><span class="value">${it.value || "—"}</span>`;
      ul.appendChild(li);
    }
  }
  function maybeUpdateReview() { if (step === 5) buildReviewList(); }

  $("#reviewList")?.addEventListener("click", (e) => {
    const li = e.target.closest(".review-item");
    if (!li) return;
    const n = Number(li.getAttribute("data-go-step")) || 1;
    gotoStep(n);
  });

  // ===== Guard (Sem alterações)
  const btnPublish = $("#btnPublicar");

  function allStepsOk() {
    for (let s = 1; s <= 4; s++) { if (!validateStep(s)) return false; }
    return true;
  }
  function refreshPublishGuard() {
    if (!btnPublish) return;
    const onStep5 = Number(document.querySelector('section.card:not([hidden])')?.dataset.step) === 5;
    const enabled = onStep5 && allStepsOk();
    btnPublish.disabled = !enabled;
  }

  document.addEventListener("input", refreshPublishGuard, true);
  document.addEventListener("change", refreshPublishGuard, true);

  // ===== Modais PRO (Sem alterações)
  const publishModal = $("#publishModal");
  const editModal = $("#editModal");
  const reputationModal = $("#reputationModal");
  const modalAgree = $("#modalAgree");
  const pmConfirm = $("#pmConfirm");

  function trapFocus(modal) {
    const FOCUSABLE = 'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
    const nodes = [...modal.querySelectorAll(FOCUSABLE)].filter(el => !el.hasAttribute('disabled') && getComputedStyle(el).display !== 'none');
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    function onKey(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    modal.addEventListener('keydown', onKey);
    modal.__trap = onKey;
  }
  function releaseTrap(modal) {
    if (modal?.__trap) { modal.removeEventListener('keydown', modal.__trap); delete modal.__trap; }
  }

  function openModal(modal, focusSel) {
    if (!modal) return;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.__previousFocus = document.activeElement;
    const focusEl = focusSel ? modal.querySelector(focusSel) : modal.querySelector('h3, [role="heading"]');
    setTimeout(() => focusEl?.focus?.(), 0);
    trapFocus(modal);
    modal.addEventListener('click', onBackdropClose);
    window.addEventListener('keydown', onEscClose);
    function onBackdropClose(e) { if (e.target.matches('[data-close]')) closeModal(modal); }
    function onEscClose(e) { if (e.key === 'Escape') closeModal(modal); }
    modal.__cleanup = () => { modal.removeEventListener('click', onBackdropClose); window.removeEventListener('keydown', onEscClose); };
  }
  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    releaseTrap(modal);
    modal.__cleanup?.(); delete modal.__cleanup;
    (modal.__previousFocus)?.focus?.();
  }

  // ==== Botões principais (Sem alterações)
  $("#btnPublicar")?.addEventListener("click", () => {
    let firstInvalid = 0;
    for (let s = 1; s <= 4; s++) { if (!validateStep(s, { reveal: true })) { firstInvalid = s; break; } }
    if (firstInvalid) { gotoStep(firstInvalid); return; }
    modalAgree.checked = false;
    pmConfirm.disabled = true;
    openModal(publishModal, '#pmTitle');
  });

  modalAgree?.addEventListener('change', () => {
    if (pmConfirm) pmConfirm.disabled = !modalAgree.checked;
  });


  // ==========================================================
  // FUNÇÃO PARA PUBLICAR NA API (CORRIGIDA)
  // ==========================================================
  async function publishAdToFeed() {
    // 1. Obter o ID do usuário (AGORA USA A FUNÇÃO CORRIGIDA)
    const user = getAuthProfile();
    
    // A checagem de 'isAuth()' no passo 2 (pmConfirm) já garante
    // que 'user' não é nulo, mas verificamos o ID por segurança.
    if (!user || !user.id) { 
      throw new Error("Usuário não está logado ou ID não encontrado.");
    }

    // 2. Coletar todos os dados do formulário
    const get = id => document.getElementById(id)?.value || "";
    const precoRaw = (get("fldPreco") || "").replace(/\./g, "").replace(",", ".");

    // 3. Mapear os campos do formulário para o schema da tabela 'produtos'
    const productData = {
      usuario_id: user.id, // <-- CORRIGIDO
      nome: get("fldTitulo"),
      categoria: get("fldCategoria"),
      preco: parseFloat(precoRaw) || 0,
      
      // Simulação de upload (sem alteração)
      imagem: images.length > 0 ? `./img/uploads/${images[0].name}` : './img/placeholder.jpg',
      
      descricao: `Estado: ${get("fldEstado")}`,
      needs: [get("fldEstado")],
      location: get("fldLocal"),
      schedule: get("fldDisp"),
      group: get("fldUnidade"), 
      period: [get("fldCobrarPor") || get("fldUnidade")],
      tradeCheck: get("fldTroca") === "sim" ? "Yes" : "No",
      include: [],
    };

    // 4. Enviar para a API
    const response = await fetch(API_PRODUTOS_URL, { // Usa a const correta
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("Erro da API:", errData);
      throw new Error(errData.error || "Falha ao enviar dados para a API.");
    }

    // 5. Retornar o resultado
    const result = await response.json();

    // 6. Limpar o rascunho após o sucesso
    localStorage.removeItem(DRAFT_KEY);

    return result.id;
  }


  // ==========================================================
  // LÓGICA DE PUBLICAÇÃO (CORRIGIDA)
  // ==========================================================
  pmConfirm?.addEventListener("click", async () => {
    // 1. Fecha o modal de confirmação
    closeModal(publishModal);

    // 2. GATE: Usuário não está logado? (AGORA USA A FUNÇÃO CORRIGIDA)
    if (!isAuth()) { // <-- CORRIGIDO
      try { saveDraft?.(); } catch (e) { console.warn("Falha ao salvar rascunho antes do login", e); }

      toastAction({
        title: "Login necessário",
        msg: "Você precisa estar logado para publicar seu anúncio.",
        variant: "warn",
        ctaLabel: "Fazer login",
        ghostLabel: "Agora não",
        duration: 9000,
        onAction: () => {
          try { localStorage.setItem('ss_continue_to', 'pagina-anuncio.html?resume=publish'); } catch { }
          window.location.href = 'index.html'; 
        },
        onGhost: () => { /* Não faz nada */ }
      });
      return; 
    }

    // 3. GATE: Reputação insuficiente? (REMOVIDO/DESATIVADO)
    //
    // Explicação: O seu sistema de login (usuarioId/usuarioNome) não
    // salva as estrelas do usuário no localStorage. Por isso,
    // este bloqueio da tela (client-side) não funciona.
    // O ideal é o *servidor* fazer essa checagem.
    // Por enquanto, vamos desativar para permitir a publicação.
    /*
    const perfilLogado = getAuthProfile(); // <-- Traz {id, nome}
    const userStars = perfilLogado?.avaliacao_geral || perfilLogado?.stars || 0;

    if (ENABLE_GATES) {
      // userStars aqui seria 0, e o bloqueio falharia
      const starsOk = userStars >= MIN_STARS; 
      if (!starsOk) {
        openModal(reputationModal, '#rmTitle');
        toast(`Reputação (${userStars}★) abaixo do mínimo (${MIN_STARS}★).`, "bad", "Publicação bloqueada");
        return;
      }
    }
    */

    // 4. TENTATIVA DE PUBLICAR
    try {
      toast("Publicando seu anúncio, aguarde...", "info", "Enviando");

      const newId = await publishAdToFeed(); // <-- Agora funciona

      toast("Seu anúncio foi publicado com sucesso!", "ok", "Publicado");

      gotoStep(1);
      document.getElementById("form")?.reset();
      images = []; 
      renderThumbs(); 

      setTimeout(() => {
        window.location.href = `pagina-servicos.html?highlight=${encodeURIComponent(newId)}`;
      }, 1200);

    } catch (err) {
      console.error('[publish] erro:', err);
      // O erro "Usuário não está logado" vinha daqui
      toast(err.message || "Erro ao publicar. Tente novamente.", "bad", "Falha");
    }
  });


  // Editar anúncio (passo 5)
  $("#btnEditar")?.addEventListener("click", () => openModal(editModal, '#emTitle'));
  $("#editModal")?.addEventListener("click", (e) => {
    const btn = e.target.closest('[data-go-step]');
    if (!btn) return;
    const n = Number(btn.getAttribute('data-go-step')) || 1;
    closeModal(editModal);
    gotoStep(n);
  });

  // Reputação: CTA de dicas (mock)
  $("#rmTips")?.addEventListener("click", () => {
    toast("Dica: finalize atendimentos e solicite avaliações para subir sua reputação. 😉", "info");
  });

  // (Função renderSuccessInsideStep5 - sem alteração)
  function renderSuccessInsideStep5() {
    const step5 = document.querySelector('section.card[data-step="5"]');
    if (!step5) return;
    step5.hidden = false;
    step5.querySelector(".review")?.classList.add("is-hidden");
    step5.querySelector(".actions")?.classList.add("is-hidden");

    let panel = step5.querySelector("#publishSuccessStep5");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "publishSuccessStep5";
      panel.className = "success-panel";
      panel.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        <h3>Seu anúncio foi publicado!</h3>
        <p>Ele já está visível no feed do <strong>Skill Swap</strong>. Boa sorte nas trocas! 🎉</p>
        <div class="success-actions">
          <a class="btn primary" href="pagina-servicos.html">Ver meu anúncio</a>
          <button class="btn ghost" id="btnNovoAnuncio" type="button">Criar outro anúncio</button>
        </div>`;
      step5.appendChild(panel);

      panel.querySelector("#btnNovoAnuncio")?.addEventListener("click", () => {
        gotoStep(1);
        panel.remove();
        step5.querySelector(".review")?.classList.remove("is-hidden");
        step5.querySelector(".actions")?.classList.remove("is-hidden");
        toast("Vamos criar outro anúncio. ✨", "ok", "Novo anúncio");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ===== Rascunho (sem imagens)
  function saveDraft() {
    const data = {
      step,
      mode,
      titulo: $('#fldTitulo')?.value || '',
      categoria: $('#fldCategoria')?.value || '',
      estado: $('#fldEstado')?.value || '',
      unidade: $('#fldUnidade')?.value || '',
      cobrarPor: $('#fldCobrarPor')?.value || '',
      preco: $('#fldPreco')?.value || '',
      troca: $('#fldTroca')?.value || 'sim',
      disp: $('#fldDisp')?.value || 'agenda',
      local: $('#fldLocal')?.value || '',
      entrega: $('#fldEntrega')?.value || 'retirada',
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.mode) switchMode(d.mode);
      const map = {
        fldTitulo: d.titulo, fldCategoria: d.categoria, fldEstado: d.estado, fldUnidade: d.unidade,
        fldCobrarPor: d.cobrarPor, fldPreco: d.preco, fldTroca: d.troca, fldDisp: d.disp,
        fldLocal: d.local, fldEntrega: d.entrega,
      };
      Object.entries(map).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el != null && val != null) {
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      if (d.step) gotoStep(d.step);
    } catch {/* ignore */}
  }

  // retomar após login (?resume=1)
  (function resumeIfNeeded() {
    const params = new URLSearchParams(location.search);
    const resume = params.get('resume');
    if (resume) {
      loadDraft();
      if(resume === 'publish' && allStepsOk()){
        gotoStep(5);
        toast("Rascunho carregado. Reenvie as imagens e revise para publicar.", "info", "Rascunho carregado");
      } else {
        toast("Retomamos seu anúncio. Reenvie as imagens para concluir.", "info", "Rascunho carregado");
      }
      const clean = location.origin + location.pathname;
      history.replaceState({}, document.title, clean);
    }
  })();

  // descrição no preview (sutil)
  $("#fldTitulo")?.addEventListener("blur", () => {
    const t = $("#fldTitulo")?.value?.trim() || "";
    $("#prevDesc") && ($("#prevDesc").textContent = t ? `• ${t}` : "—");
  });

  // start
  switchMode("produto");
  gotoStep(1);
  loadDraft(); 
  renderThumbs(); 

  // ===== Toast PRO mínimo (Sem alterações)
  function initToastPRO() {
    if (document.getElementById("toast-pro-styles")) return;
    const css = `
    :root{
      --tp-card: rgba(22,28,36,.78);
      --tp-border: rgba(255,255,255,.06);
      --tp-ink: #e5e7eb; --tp-ink-dim:#aeb6c2;
      --tp-ok:#22c55e; --tp-warn:#f59e0b; --tp-bad:#ef4444; --tp-info:#60a5fa;
    }
    .tp-wrap{position:fixed;z-index:9999;display:grid;gap:12px;pointer-events:none}
    .tp--top-right{top:18px;right:18px;justify-items:end}
    .tp{pointer-events:auto;min-width:280px;max-width:min(92vw,420px);display:grid;grid-template-columns:auto 1fr auto;gap:8px 12px;padding:14px 14px 12px;color:var(--tp-ink);background:linear-gradient( to bottom right, var(--tp-card), rgba(20,24,30,.6));border:1px solid var(--tp-border);border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.03);backdrop-filter:blur(10px) saturate(120%);opacity:0;transform:translateY(8px) scale(.98);animation:tp-in .22s ease forwards}
    @keyframes tp-in{to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes tp-out{to{opacity:0;transform:translateY(8px) scale(.98)}}
    .tp__icon{width:26px;height:26px;border-radius:8px;display:grid;place-items:center;font-size:14px;font-weight:900;color:#0b0f14;box-shadow:inset 0 -1px 0 rgba(0,0,0,.25);align-self:start;margin-top:2px;background:var(--tp-info)}
    .tp--ok .tp__icon{background:var(--tp-ok)} .tp--warn .tp__icon{background:var(--tp-warn)} .tp--bad .tp__icon{background:var(--tp-bad)} .tp--info .tp__icon{background:var(--tp-info)}
    .tp__body{display:grid;gap:4px}
    .tp__title{font:800 14px/1 "Poppins",sans-serif;letter-spacing:.2px}
    .tp__msg{font:600 12.5px/1.45 "Poppins",sans-serif;color:var(--tp-ink-dim)}
    .tp__close{background:none;border:0;color:var(--tp-ink-dim);font-size:18px;line-height:1;cursor:pointer;padding:0 4px;border-radius:8px}
    .tp__close:hover{color:#fff;background:rgba(255,255,255,.06)}
    .tp__bar{grid-column:1/-1;height:3px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.06)}
    .tp__bar i{display:block;height:100%;background:var(--tp-ink);transform-origin:left;transform:scaleX(1)}
    
    /* Estilos para o toastAction */
    .tp__actions{grid-column:1/-1;display:flex;gap:8px;margin-top:8px}
    .tp__btn{flex:1;font:800 12px/1 "Poppins",sans-serif;letter-spacing:.5px;text-transform:uppercase;padding:9px 12px;border:0;border-radius:9px;cursor:pointer;background:rgba(255,255,255,.9);color:#0b0f14;transition:all .15s ease}
    .tp__btn:hover{background:#fff;transform:translateY(-1px)}
    .tp__btn--ghost{background:rgba(255,255,255,.08);color:#fff}
    .tp__btn--ghost:hover{background:rgba(255,255,255,.12)}
    `;
    const style = document.createElement("style");
    style.id = "toast-pro-styles"; style.textContent = css; document.head.appendChild(style);
    const wrap = document.createElement("div"); wrap.id = "tp-wrap"; wrap.className = "tp-wrap tp--top-right"; document.body.appendChild(wrap);

    window.anToast = function (msg, variant = 'info', title, opts = {}) {
      const vmap = { ok: "ok", warn: "warn", bad: "bad", info: "info" };
      const v = vmap[variant] ? variant : "info";
      const el = document.createElement("div"); el.className = `tp tp--${v}`;
      const icon = document.createElement("div"); icon.className = "tp__icon";
      icon.textContent = v === "ok" ? "✓" : (v === "bad" ? "!" : (v === "warn" ? "⚠" : "i"));
      const body = document.createElement("div"); body.className = "tp__body";
      if (title) { const t = document.createElement("div"); t.className = "tp__title"; t.textContent = title; body.appendChild(t); }
      const p = document.createElement("div"); p.className = "tp__msg"; p.textContent = msg; body.appendChild(p);
      const btnClose = document.createElement("button"); btnClose.className = "tp__close"; btnClose.setAttribute("aria-label", "Fechar aviso"); btnClose.textContent = "×";
      btnClose.addEventListener("click", () => { el.style.animation = "tp-out .18s ease forwards"; setTimeout(() => el.remove(), 180); });
      const bar = document.createElement("div"); bar.className = "tp__bar"; const fill = document.createElement("i"); bar.appendChild(fill);

      el.appendChild(icon); el.appendChild(body); el.appendChild(btnClose); el.appendChild(bar);
      document.getElementById("tp-wrap").appendChild(el);

      const duration = Math.max(1800, Number(opts.duration || 3200));
      let start = performance.now();
      const step = (ts) => { const prog = Math.min(1, (ts - start) / duration); fill.style.transform = `scaleX(${1 - prog})`; if (prog >= 1) { el.style.animation = "tp-out .18s ease forwards"; setTimeout(() => el.remove(), 180); return; } requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
  }
  // Toast com CTA (vidro + botão de ação)
  window.toastAction = function ({ title = "Login necessário", msg = "Você precisa estar logado para publicar seu anúncio.", variant = "warn", ctaLabel = "Fazer login", ghostLabel = null, duration = 7000, onAction = () => { }, onGhost = null } = {}) {
    const wrap = document.getElementById("tp-wrap");
    const el = document.createElement("div");
    el.className = `tp tp--glass tp--${({ ok: "ok", warn: "warn", bad: "bad", info: "info" }[variant] || "info")}`;
    el.innerHTML = `
    <div class="tp__icon">${variant === "ok" ? "✓" : (variant === "bad" ? "!" : (variant === "warn" ? "⚠" : "i"))}</div>
    <div class="tp__body">
      <div class="tp__title">${title}</div>
      <div class="tp__msg">${msg}</div>
    </div>
    <button class="tp__close" aria-label="Fechar aviso">×</button>
    <div class="tp__bar"><i></i></div>
    <div class="tp__actions">
      <button class="tp__btn" id="tpCtaBtn">${ctaLabel}</button>
      ${ghostLabel ? `<button class="tp__btn tp__btn--ghost" id="tpGhostBtn">${ghostLabel}</button>` : ``}
    </div>
  `;
    wrap.appendChild(el);

    // fechar
    const close = () => { el.style.animation = "tp-out .18s ease forwards"; setTimeout(() => el.remove(), 180); };
    el.querySelector(".tp__close").addEventListener("click", close);

    // barra tempo
    const barFill = el.querySelector(".tp__bar i");
    const t0 = performance.now();
    const dur = duration;
    (function tick(ts) {
      const p = Math.min(1, (ts - t0) / dur);
      barFill.style.transform = `scaleX(${1 - p})`;
      if (p < 1) requestAnimationFrame(tick); else close();
    })(t0);

    // ações
    el.querySelector("#tpCtaBtn").addEventListener("click", () => { try { onAction(); } finally { close(); } });
    if (onGhost && el.querySelector("#tpGhostBtn")) {
      el.querySelector("#tpGhostBtn").addEventListener("click", () => { try { onGhost(); } finally { close(); } });
    }
  };

})();