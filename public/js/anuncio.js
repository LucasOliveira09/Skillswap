(() => {
  // ==================== Utils ====================
  const $  = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  // ==================== Estado ====================
  let step = 1;
  let mode = "produto"; // "produto" | "servico" | "troca"

  const form = {
    titulo: "", categoria: "", sub: "", estado: "Novo", unidade: "unidade",
    descricao: "", preco: "", troca: "sim", cobrarPor: "hora", disp: "agenda",
    tags: "", local: "", entrega: "retirada", imagens: []
  };

  // ==================== Refs fixas ====================
  const stepsOl = $("#steps");
  const cards   = $$("section.card");
  const modeBtns = $$(".mode-btn");
  const agree = $("#agree");
  const btnPublicar = $("#btnPublicar");

  // Preview
  const prevTitulo = $("#prevTitulo");
  const prevTipo   = $("#prevTipo");
  const prevDesc   = $("#prevDesc");
  const prevPreco  = $("#prevPreco");
  const prevLocal  = $("#prevLocal");
  const prevImg    = $("#prevImg");

  // ==================== NAV: dropdown (único handler) ====================
  const trig = $("#userTrig");
  const menu = $("#userMenu");
  if (trig && menu) {
    const close = () => {
      menu.classList.remove("is-open");
      trig.setAttribute("aria-expanded","false");
      menu.setAttribute("aria-hidden","true");
    };
    trig.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", open);
      trig.setAttribute("aria-expanded", open ? "true" : "false");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
    });
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !trig.contains(e.target)) close();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  // ==================== Helpers UI ====================
  const onlyServico = () => {
    $$(".only-servico").forEach(el => {
      el.style.display = (mode === "servico") ? "" : "none";
    });
  };

  function gotoStep(n) {
    step = clamp(n, 1, 5);
    cards.forEach(c => c.hidden = Number(c.dataset.step) !== step);
    if (stepsOl) {
      [...stepsOl.children].forEach((li, i) => {
        li.classList.toggle("is-active", i + 1 === step);
      });
    }
  }

  $$("[data-next]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); gotoStep(step + 1); }));
  $$("[data-prev]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); gotoStep(step - 1); }));
  $("#prevAvancar")?.addEventListener("click", () => gotoStep(step + 1));
  $("#prevVoltar")?.addEventListener("click",  () => gotoStep(step - 1));

  // Modo (produto/serviço/troca)
  modeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      modeBtns.forEach(b => b.classList.toggle("is-current", b === btn));
      if (prevTipo) prevTipo.textContent = mode;
      onlyServico();
    });
  });
  onlyServico();

  // ==================== Data binding + preview ====================
  const summarize = (txt, n=140) => txt.length > n ? txt.slice(0, n-1).trimEnd() + "…" : txt;

  // máscara BRL leve (sem Intl para manter simples aqui)
  const toBRL = (v) => {
    const digits = (v || "").replace(/[^\d]/g, "");
    if (!digits) return "";
    const n = (parseInt(digits, 10) / 100).toFixed(2);
    return n.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const bindMap = {
    fldTitulo: v => { form.titulo = v;  if (prevTitulo) prevTitulo.textContent = v ||  "Título do anúncio"; },
    fldCategoria: v => form.categoria = v,
    fldSub: v => form.sub = v,
    fldEstado: v => form.estado = v,
    fldUnidade: v => form.unidade = v,
    fldDesc: v => { form.descricao = v; if (prevDesc) prevDesc.textContent = v ? summarize(v) : "Descrição resumida aparecerá aqui para atrair cliques."; },
    fldPreco: v => {
      // aplica máscara BRL diretamente no campo
      const el = $("#fldPreco");
      const masked = toBRL(v);
      form.preco = masked;
      if (el && el.value !== masked) el.value = masked;
      if (prevPreco) prevPreco.textContent = masked ? `R$ ${masked}` : "R$ —";
    },
    fldTroca: v => form.troca = v,
    fldCobrarPor: v => form.cobrarPor = v,
    fldDisp: v => form.disp = v,
    fldTags: v => form.tags = v,
    fldLocal: v => { form.local = v; if (prevLocal) prevLocal.textContent = v || "Cidade, UF"; },
    fldEntrega: v => form.entrega = v,
  };

  // Inputs de texto com "input"; selects com "change"
  Object.keys(bindMap).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const handler = (e) => bindMap[id](e.target.value);
    if (el.tagName === "SELECT") el.addEventListener("change", handler);
    else el.addEventListener("input", handler);
  });

  // ==================== Uploader ====================
  const fileInput = $("#fileInput");
  const dropBtn   = $("#dropBtn");
  const thumbs    = $("#thumbs");

  const objectURLs = []; // para revogar e evitar vazamento

  function setCover(url) {
    if (!prevImg) return;
    prevImg.style.backgroundImage  = `url('${url}')`;
    prevImg.style.backgroundSize   = "cover";
    prevImg.style.backgroundPosition= "center";
    prevImg.innerHTML = "";
  }
  function resetCover() {
    if (!prevImg) return;
    prevImg.style.backgroundImage = "";
    prevImg.innerHTML = "<span>capa</span>";
  }
  function cleanupURLs(){
    objectURLs.splice(0).forEach(URL.revokeObjectURL);
  }
  function renderThumbs() {
    if (!thumbs) return;
    thumbs.innerHTML = "";
    cleanupURLs();

    form.imagens.forEach((f, idx) => {
      const url = URL.createObjectURL(f);
      objectURLs.push(url);
      const div = document.createElement("div");
      div.className = "thumb";
      div.innerHTML = `
        <img src="${url}" alt="">
        <button type="button" aria-label="Remover"><i class="fa-solid fa-xmark"></i></button>`;
      div.querySelector("button").onclick = () => {
        form.imagens.splice(idx, 1);
        renderThumbs();
        if (idx === 0) resetCover();
      };
      thumbs.appendChild(div);
      if (idx === 0) setCover(url);
    });
  }
  function addFiles(files) {
    const imgs = files.filter(f => f.type.startsWith("image/"));
    const room = Math.max(0, 8 - form.imagens.length);
    imgs.slice(0, room).forEach(f => form.imagens.push(f));
    renderThumbs();
  }

  if (dropBtn && fileInput) {
    dropBtn.addEventListener("click", () => fileInput.click());
    ["dragenter","dragover"].forEach(evt => dropBtn.addEventListener(evt, e => {
      e.preventDefault(); dropBtn.style.borderColor = "#0e5aa7";
    }));
    ["dragleave","drop"].forEach(evt => dropBtn.addEventListener(evt, e => {
      e.preventDefault(); dropBtn.style.borderColor = "#d7deea";
    }));
    dropBtn.addEventListener("drop", e => addFiles([...e.dataTransfer.files]));
    fileInput.addEventListener("change", e => addFiles([...e.target.files]));
    window.addEventListener("beforeunload", cleanupURLs);
  }

  // ==================== Verificação / Gate ====================
  const MIN_STARS = 3; // ajuste se quiser
  const user = {
    stars: 2.9, // mock – traga da sua API
    verified: { doc:false, selfie:false, addr:false, phone:false }
  };

  function paintVerification(){
    const map = [
      ["v-doc","doc"], ["v-selfie","selfie"], ["v-addr","addr"], ["v-phone","phone"],
    ];
    map.forEach(([id,key])=>{
      const el = document.getElementById(id);
      if(!el) return;
      if(user.verified[key]){ el.textContent = "ok"; el.classList.add("-ok"); }
      else { el.textContent = "pendente"; el.classList.remove("-ok"); }
    });
  }

  function updatePublishEligibility(){
    const minLbl = document.getElementById("minStarsLabel");
    const usrLbl = document.getElementById("userStarsLabel");
    const msg    = document.getElementById("gateMsg");
    const btn    = document.getElementById("btnPublicar");

    if(minLbl) minLbl.textContent = `${MIN_STARS}★`;
    if(usrLbl) usrLbl.textContent = `${user.stars.toFixed(1)}★`;

    const allOk = user.verified.doc && user.verified.selfie && user.verified.addr && user.verified.phone;
    const reasons = [];
    if (user.stars < MIN_STARS) reasons.push(`alcance pelo menos ${MIN_STARS}★`);
    if (!allOk) reasons.push("conclua a verificação de identidade");

    const canPublish = reasons.length === 0;
    if (btn) btn.disabled = !canPublish || !agree?.checked;

    if (msg) {
      msg.textContent = canPublish
        ? "Tudo certo! Você atende aos requisitos para publicar."
        : `Para publicar, ${reasons.join(" e ")}.`;
    }
  }

  document.getElementById("btnStartKYC")?.addEventListener("click", ()=>{
    user.verified = { doc:true, selfie:true, addr:true, phone:true }; // mock
    paintVerification();
    updatePublishEligibility();
    alert("✅ Verificação concluída (mock). Integre aqui seu provedor de KYC.");
  });

  agree?.addEventListener("change", () => updatePublishEligibility());

  btnPublicar?.addEventListener("click", () => {
    const allOk = user.verified.doc && user.verified.selfie && user.verified.addr && user.verified.phone;
    if (user.stars < MIN_STARS || !allOk || !agree?.checked){
      updatePublishEligibility();
      return alert("⚠️ Requisitos não atendidos para publicar.");
    }
    // Chame sua API real aqui
    alert("✅ Publicado (mock). Integre com sua API.");
  });

  // ==================== Init ====================
  gotoStep(1);
  paintVerification();
  updatePublishEligibility();
})();

// Sombra no header ao rolar
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 4) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// Acessibilidade: Enter na busca não recarrega a página
(() => {
  const input = document.querySelector('.search-input');
  if (!input) return;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.preventDefault(); // aqui você pode disparar sua função de busca
  });
})();










//Você disse:
//chat, oq acha me posso modificar nesta pagina de anuncio para ficar muito profissional elegente, e que possa apresentar para o meu clinete ficar impressionado me de alguns pontos que pode me ajudar para ficar perfeito a pagina

