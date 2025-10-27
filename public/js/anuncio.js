(() => {
  // ===== Utils
  const $  = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];
  const clamp = (n,a,b) => Math.max(a, Math.min(b, n));

  // ===== Estado
  let step = 1;
  let mode = "produto";
  let images = [];

  const DRAFT_KEY = 'ss_draft';
  const MIN_STARS = 3;
  const ENABLE_GATES = true;
  const user = { stars: 4.7 }; // ajuste p/ testar reputação

  // ===== Toast PRO (compacto)
  initToastPRO();
  function toast(msg, variant="info", title){
    window.anToast ? anToast(msg, variant, title) : alert(title ? `${title}\n${msg}` : msg);
  }

  // ===== Auth
function isAuth(){
  try{
    const raw = localStorage.getItem('ss_auth_user');
    if(!raw) return false;
    if(raw === 'null' || raw === 'undefined') return false;
    const u = JSON.parse(raw);
    // considere “logado” só se for objeto com ao menos um identificador
    return u && typeof u === 'object' && (!!u.name || !!u.token || !!u.id);
  }catch{ return false; }
}

function getAuthProfile(){
  try{
    const raw = localStorage.getItem('ss_auth_user');
    if(!raw || raw === 'null' || raw === 'undefined') return null;
    return JSON.parse(raw);
  }catch{ return null; }
}

  function goLogin(){
    localStorage.setItem('ss_continue_to', 'pagina-anuncio.html?resume=1');
    window.location.href = 'index.html';
  }

  // ===== Passos / UI
  const stepsOl = $("#steps");
  const cards   = $$("section.card");
  const modeBtns= $$(".mode-btn");

function gotoStep(n){
  step = clamp(n,1,5);
  cards.forEach(c => c.hidden = Number(c.dataset.step)!==step);
  if (stepsOl) [...stepsOl.children].forEach((li,i)=> li.classList.toggle("is-active", i+1===step));
  saveDraft();
  if(step===5) buildReviewList();
  refreshPublishGuard();
  updateProgress();                  // <— NOVO
  smoothToTop();                     // <— NOVO
}
function updateProgress(){
  // 1/5 = 0% … 5/5 = 100%
  const pct = Math.round(((step - 1) / 4) * 100);
  const fill = document.getElementById('anProgressFill');
  const txt  = document.getElementById('anProgressText');
  const hint = document.getElementById('anProgressHint');
  if(fill) fill.style.width = `${pct}%`;
  if(txt)  txt.textContent  = `${pct}%`;
  if(hint) hint.textContent = `Passo ${step} de 5`;
}

function smoothToTop(){
  const anchor = document.querySelector('#announce'); // seção principal
  if(anchor) anchor.scrollIntoView({ behavior:'smooth', block:'start' });
}


  $$("[data-next]").forEach(b => b.addEventListener("click", ()=>{
    if (validateStep(step, {reveal:true})) gotoStep(step+1);
  }));
  $$("[data-prev]").forEach(b => b.addEventListener("click", ()=> gotoStep(step-1)));

  // modo
  modeBtns.forEach(btn=>{
    btn.addEventListener("click", ()=> switchMode(btn.dataset.mode));
  });
  function switchMode(m){
    mode = (m||"").toLowerCase();
    modeBtns.forEach(b=> b.classList.toggle("is-current", b.dataset.mode===mode));
    document.querySelectorAll("[data-show]").forEach(el=>{
      const show = (el.dataset.show||"").split(/\s+/).includes(mode);
      el.hidden = !show;
      el.setAttribute("aria-hidden", show? "false":"true");
      el.querySelectorAll("input,select,textarea,button").forEach(f=> f.disabled = !show);
    });
    $("#prevTipo") && ($("#prevTipo").textContent = mode);
    saveDraft();
  }

  // ===== Preview
  const prevTitulo = $("#prevTitulo");
  const prevTipo   = $("#prevTipo");
  const prevDesc   = $("#prevDesc");
  const prevPreco  = $("#prevPreco");
  const prevLocal  = $("#prevLocal");
  const prevImg    = $("#prevImg");

  const toBRL = (v)=>{
    const digits = (v||"").replace(/[^\d]/g,"");
    if(!digits) return "";
    const n=(parseInt(digits,10)/100).toFixed(2);
    return n.replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g,".");
  };

  const bindMap = {
    fldTitulo:v=>{ prevTitulo&&(prevTitulo.textContent=v||"Título do anúncio"); saveDraft(); maybeUpdateReview(); },
    fldCategoria:()=> { saveDraft(); maybeUpdateReview(); },
    fldEstado:()=> { saveDraft(); maybeUpdateReview(); },
    fldUnidade:()=> { saveDraft(); maybeUpdateReview(); },
    fldCobrarPor:()=> { saveDraft(); maybeUpdateReview(); },
    fldPreco:v=>{
      const el=$("#fldPreco");
      const m=toBRL(v);
      if(el && el.value!==m) el.value=m;
      prevPreco&&(prevPreco.textContent = m? `R$ ${m}`:"R$ —");
      saveDraft(); maybeUpdateReview();
    },
    fldTroca:()=> { saveDraft(); maybeUpdateReview(); },
    fldDisp:()=> { saveDraft(); maybeUpdateReview(); },
    fldLocal:v=>{ prevLocal&&(prevLocal.textContent=v||"Cidade, UF"); saveDraft(); maybeUpdateReview(); },
    fldEntrega:()=> { saveDraft(); maybeUpdateReview(); },
  };

  Object.keys(bindMap).forEach(id=>{
    const el=document.getElementById(id);
    if(!el) return;
    const h=e=> bindMap[id](e.target.value);
    (el.tagName==="SELECT"? el.addEventListener("change",h) : el.addEventListener("input",h));
  });

  // máscara BRL caret-stable
  $("#fldPreco")?.addEventListener("input", (e)=>{
    const caret = e.target.selectionStart;
    const before = e.target.value.length;
    const digits = (e.target.value||"").replace(/[^\d]/g,"");
    const brl = (digits ? (Number(digits)/100).toFixed(2) : "0.00")
                  .replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.');
    e.target.value = brl;
    const after = e.target.value.length;
    const delta = after - before;
    const pos = Math.max(0, (caret||0) + delta);
    e.target.setSelectionRange(pos, pos);
    bindMap.fldPreco(e.target.value);
  });

  // ===== Uploader
  const fileInput = $("#fileInput");
  const dropBtn   = $("#dropBtn");
  const thumbs    = $("#thumbs");
  const objectURLs = [];

  function setCover(url){
    if(!prevImg) return;
    prevImg.style.backgroundImage = `url('${url}')`;
    prevImg.style.backgroundSize = "cover";
    prevImg.style.backgroundPosition = "center";
    prevImg.innerHTML = "";
  }
  function resetCover(){
    if(!prevImg) return;
    prevImg.style.backgroundImage = "";
    prevImg.innerHTML = "<span>capa</span>";
  }
  function cleanupURLs(){ objectURLs.splice(0).forEach(URL.revokeObjectURL); }

  function renderThumbs(){
    if(!thumbs) return;
    thumbs.innerHTML="";
    cleanupURLs();
    images.forEach((f,idx)=>{
      const url=URL.createObjectURL(f);
      objectURLs.push(url);
      const div=document.createElement("div");
      div.className="thumb";
      div.innerHTML=`
        <img src="${url}" alt="">
        <button type="button" aria-label="Remover"><i class="fa-solid fa-xmark"></i></button>`;
      div.querySelector("button").onclick=()=>{
        images.splice(idx,1);
        renderThumbs();
        if(idx===0) resetCover();
        refreshPublishGuard();
      };
      thumbs.appendChild(div);
      if(idx===0) setCover(url);
    });
  }

  function addFiles(files){
    const imgs = files.filter(f=> f && f.type && f.type.startsWith("image/"));
    const room = Math.max(0, 8 - images.length);
    imgs.slice(0,room).forEach(f=> images.push(f));
    if (files.length > room) toast("Limite de 8 imagens. Algumas foram ignoradas.", "warn");
    renderThumbs();
    refreshPublishGuard();
  }

  if(dropBtn && fileInput){
    dropBtn.addEventListener("click", ()=> fileInput.click());
    ["dragenter","dragover"].forEach(evt=> dropBtn.addEventListener(evt, e=>{ e.preventDefault(); dropBtn.style.borderColor="#0e5aa7"; }));
    ["dragleave","drop"].forEach(evt=> dropBtn.addEventListener(evt, e=>{ e.preventDefault(); dropBtn.style.borderColor="#d7deea"; }));
    dropBtn.addEventListener("drop", e=> addFiles([...e.dataTransfer.files]));
    fileInput.addEventListener("change", e=> addFiles([...e.target.files]));
    window.addEventListener("beforeunload", cleanupURLs);
  }

  // ===== Inputs obrigatórios PRO (um por vez)
  markRequiredUI();

  function markRequiredUI(){
    document.querySelectorAll(".fld").forEach(lbl=>{
      const ctrl = lbl.querySelector("input[required], select[required], textarea[required]");
      if(!ctrl) return;
      lbl.classList.add("--required");
      ctrl.setAttribute("aria-required","true");

      ctrl.addEventListener("input", ()=>{
        clearError(ctrl);
        refreshPublishGuard();
      });
      ctrl.addEventListener("change", ()=>{
        clearError(ctrl);
        refreshPublishGuard();
      });
    });
  }

  function fieldError(ctrl, message="Campo obrigatório"){
    if(!ctrl) return;
    ctrl.classList.add("has-error");
    ctrl.setAttribute("aria-invalid","true");
    let help = ctrl.parentElement?.querySelector(".an-field-msg");
    if(!help){
      help=document.createElement("small");
      help.className="an-field-msg";
      ctrl.parentElement?.appendChild(help);
    }
    help.textContent=message;
    if (typeof ctrl.focus === "function") ctrl.focus({ preventScroll:true });
    const rect=ctrl.getBoundingClientRect();
    window.scrollBy({ top: rect.top-120, behavior:"smooth" });
  }
  function clearError(ctrl){
    if(!ctrl) return;
    ctrl.classList.remove("has-error");
    ctrl.removeAttribute("aria-invalid");
    const help = ctrl.parentElement?.querySelector(".an-field-msg");
    if(help) help.textContent="";
  }

  function controlIsValid(ctrl){
    if(ctrl.disabled) return true;
    if(ctrl.tagName==="SELECT"){ return (ctrl.value||"").trim()!==""; }
    if(ctrl.type==="checkbox"||ctrl.type==="radio"){ return !!ctrl.checked; }
    return (ctrl.value||"").trim()!==""; 
  }

  function firstInvalidInStep(s){
    const card=document.querySelector(`section.card[data-step="${s}"]`);
    if(!card||card.hidden) return null;
    const reqs=[...card.querySelectorAll("[required]:not([disabled])")].filter(el=>{
      const hidden = el.closest('[hidden],[aria-hidden="true"]');
      return !hidden;
    });

    if(s===2 && !images.length) return {ctrl:null, msg:"Adicione pelo menos uma imagem."};
    if(s===3){
      const preco=$("#fldPreco");
      const raw=(preco?.value||"").replace(/\./g,"").replace(",",".");
      const valor=Number(raw);
      if(!(valor>0)) return {ctrl:preco, msg:"Informe um preço maior que zero."};
    }
    if(s===4){
      const local=$("#fldLocal");
      if(!local?.value.trim()) return {ctrl:local, msg:"Informe cidade e UF."};
    }

    for(const el of reqs){
      if(!controlIsValid(el)){
        const msg = el.dataset.requiredMessage || "Campo obrigatório";
        return {ctrl:el, msg};
      }
    }
    return null;
  }

  function validateStep(s, {reveal=false}={}){
    const card=document.querySelector(`section.card[data-step="${s}"]`);
    card?.querySelectorAll(".has-error").forEach(el=> clearError(el));

    const err = firstInvalidInStep(s);
    if(!err) return true;

    if(reveal){
      if(err.ctrl) fieldError(err.ctrl, err.msg);
      else toast(err.msg, "warn", "Imagens necessárias");
    }
    return false;
  }

  // ===== Review list (clicável)
  function buildReviewList(){
    const ul = $("#reviewList"); if(!ul) return;
    const get = id => document.getElementById(id)?.value || "";
    const preco = $("#fldPreco")?.value || "";
    const items = [
      {step:1, label:"Título", value:get("fldTitulo")},
      {step:1, label:"Categoria", value:get("fldCategoria")},
      {step:1, label:"Estado", value:get("fldEstado")},
      {step:1, label:"Unidade", value:get("fldUnidade")},
      ...(mode==="servico" ? [{step:1, label:"Cobrar por", value:get("fldCobrarPor")}] : []),
      {step:2, label:"Imagens", value:`${images.length} selecionada(s)`},
      {step:3, label:"Preço", value: preco ? `R$ ${preco}` : ""},
      {step:4, label:"Localização", value:get("fldLocal")},
      {step:4, label:"Entrega/Execução", value:get("fldEntrega")},
    ];

    ul.innerHTML = "";
    for(const it of items){
      const li = document.createElement("li");
      li.className="review-item";
      li.setAttribute("data-go-step", String(it.step));
      li.innerHTML = `<span class="label">${it.label}</span><span class="value">${it.value || "—"}</span>`;
      ul.appendChild(li);
    }
  }
  function maybeUpdateReview(){ if(step===5) buildReviewList(); }

  $("#reviewList")?.addEventListener("click", (e)=>{
    const li = e.target.closest(".review-item");
    if(!li) return;
    const n = Number(li.getAttribute("data-go-step")) || 1;
    gotoStep(n);
  });

  // ===== Guard: habilita Publicar quando ok (Termos vão no modal)
  const btnPublish = $("#btnPublicar");

  function allStepsOk(){
    for(let s=1;s<=4;s++){ if(!validateStep(s)) return false; }
    return true;
  }
  function refreshPublishGuard(){
    if(!btnPublish) return;
    const onStep5 = Number(document.querySelector('section.card:not([hidden])')?.dataset.step)===5;
    const enabled = onStep5 && allStepsOk();
    btnPublish.disabled = !enabled;
  }

  document.addEventListener("input", refreshPublishGuard, true);
  document.addEventListener("change", refreshPublishGuard, true);

  // ===== Modais PRO (genéricos + focus trap)
  const publishModal   = $("#publishModal");
  const editModal      = $("#editModal");
  const reputationModal= $("#reputationModal");
  const modalAgree     = $("#modalAgree");
  const pmConfirm      = $("#pmConfirm");

  function trapFocus(modal){
    const FOCUSABLE = 'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
    const nodes = [...modal.querySelectorAll(FOCUSABLE)].filter(el=>!el.hasAttribute('disabled') && getComputedStyle(el).display!=='none');
    if(!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length-1];
    function onKey(e){
      if(e.key !== 'Tab') return;
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
    modal.addEventListener('keydown', onKey);
    modal.__trap = onKey;
  }
  function releaseTrap(modal){
    if(modal?.__trap){ modal.removeEventListener('keydown', modal.__trap); delete modal.__trap; }
  }

  function openModal(modal, focusSel){
    if(!modal) return;
    modal.hidden = false;
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    modal.__previousFocus = document.activeElement;
    const focusEl = focusSel ? modal.querySelector(focusSel) : modal.querySelector('h3, [role="heading"]');
    setTimeout(()=> focusEl?.focus?.(), 0);
    trapFocus(modal);
    modal.addEventListener('click', onBackdropClose);
    window.addEventListener('keydown', onEscClose);
    function onBackdropClose(e){ if(e.target.matches('[data-close]')) closeModal(modal); }
    function onEscClose(e){ if(e.key==='Escape') closeModal(modal); }
    modal.__cleanup = ()=>{ modal.removeEventListener('click', onBackdropClose); window.removeEventListener('keydown', onEscClose); };
  }
  function closeModal(modal){
    if(!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    releaseTrap(modal);
    modal.__cleanup?.(); delete modal.__cleanup;
    (modal.__previousFocus)?.focus?.();
  }

  // ==== Botões principais
  $("#btnPublicar")?.addEventListener("click", ()=>{
    let firstInvalid=0;
    for(let s=1;s<=4;s++){ if(!validateStep(s, {reveal:true})){ firstInvalid=s; break; } }
    if(firstInvalid){ gotoStep(firstInvalid); return; }
    // abrir modal (Termos lá dentro)
    modalAgree.checked = false;
    pmConfirm.disabled = true;
    openModal(publishModal, '#pmTitle');
  });

  // habilita/desabilita o Confirmar conforme o checkbox dos Termos
modalAgree?.addEventListener('change', ()=>{
  if (pmConfirm) pmConfirm.disabled = !modalAgree.checked;
});

// CONFIRMAR PUBLICAÇÃO
pmConfirm?.addEventListener("click", async ()=>{
  // fecha o modal de confirmação
  closeModal(publishModal);

  // convidado → toast + login + volta com retomada
if(!isAuth()){
  try{ saveDraft?.(); }catch{}

  // cria toast com botão "Fazer login"
// convidado → toast-GLASS com CTA "Fazer login"
if(!isAuth()){
  try{ saveDraft?.(); }catch{}
  toastAction({
    title: "Login necessário",
    msg: "Você precisa estar logado para publicar seu anúncio.",
    variant: "warn",
    ctaLabel: "Fazer login",
    ghostLabel: "Agora não",
    duration: 9000,
    onAction: ()=>{
      try{ localStorage.setItem('ss_continue_to','pagina-anuncio.html?resume=publish'); }catch{}
      window.location.href = 'index.html';
    },
    onGhost: ()=>{ /* fica na página; usuário decide depois */ }
  });
  return;
}

  wrap.appendChild(el);

  // animação e botão de fechar
  const btnClose = el.querySelector(".tp__close");
  btnClose.addEventListener("click",()=>{ el.style.animation="tp-out .18s ease forwards"; setTimeout(()=>el.remove(),180); });
  const barFill = el.querySelector(".tp__bar i");
  let start=performance.now();
  const duration=6000;
  const step=(ts)=>{
    const p=Math.min(1,(ts-start)/duration);
    barFill.style.transform=`scaleX(${1-p})`;
    if(p>=1){ el.style.animation="tp-out .18s ease forwards"; setTimeout(()=>el.remove(),180); return; }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);

  // ação do botão "Fazer login"
  el.querySelector("#tpLoginBtn").addEventListener("click",()=>{
    try{ localStorage.setItem('ss_continue_to','pagina-anuncio.html?resume=publish'); }catch{}
    el.style.animation="tp-out .18s ease forwards";
    setTimeout(()=>{ window.location.href='index.html'; },200);
  });

  return;
}


  // gate de estrelas (se estiver ativo)
  if(typeof ENABLE_GATES !== "undefined" && ENABLE_GATES){
    const starsOk = (user?.stars ?? 0) >= (typeof MIN_STARS !== "undefined" ? MIN_STARS : 3);
    if(!starsOk){
      // abre o modal de reputação correto
      openModal(reputationModal, '#rmTitle');
      anToast?.("Requisitos de reputação não atendidos.", "bad", "Publicação bloqueada");
      return;
    }
  }

  try{
    const newId = await publishAdToFeed();
    anToast?.("Seu anúncio foi publicado com sucesso!", "ok", "Publicado");
    setTimeout(()=>{ window.location.href = `pagina-servicos.html?highlight=${encodeURIComponent(newId)}`; }, 1200);
  }catch(err){
    console.error('[publish] erro:', err);
    anToast?.("Erro ao publicar. Tente novamente.", "bad", "Falha");
  }
});





  // Editar anúncio (passo 5)
  $("#btnEditar")?.addEventListener("click", ()=> openModal(editModal, '#emTitle'));
  $("#editModal")?.addEventListener("click", (e)=>{
    const btn = e.target.closest('[data-go-step]');
    if(!btn) return;
    const n = Number(btn.getAttribute('data-go-step'))||1;
    closeModal(editModal);
    gotoStep(n);
  });

  // Reputação: CTA de dicas (mock)
  $("#rmTips")?.addEventListener("click", ()=>{
    toast("Dica: finalize atendimentos e solicite avaliações para subir sua reputação. 😉", "info");
  });

  function renderSuccessInsideStep5(){
    const step5 = document.querySelector('section.card[data-step="5"]');
    if(!step5) return;
    step5.hidden=false;
    step5.querySelector(".review")?.classList.add("is-hidden");
    step5.querySelector(".actions")?.classList.add("is-hidden");

    let panel = step5.querySelector("#publishSuccessStep5");
    if(!panel){
      panel=document.createElement("div");
      panel.id="publishSuccessStep5";
      panel.className="success-panel";
      panel.innerHTML=`
        <i class="fa-solid fa-circle-check"></i>
        <h3>Seu anúncio foi publicado!</h3>
        <p>Ele já está visível no feed do <strong>Skill Swap</strong>. Boa sorte nas trocas! 🎉</p>
        <div class="success-actions">
          <a class="btn primary" href="pagina-servicos.html">Ver meu anúncio</a>
          <button class="btn ghost" id="btnNovoAnuncio" type="button">Criar outro anúncio</button>
        </div>`;
      step5.appendChild(panel);

      panel.querySelector("#btnNovoAnuncio")?.addEventListener("click", ()=>{
        gotoStep(1);
        panel.remove();
        step5.querySelector(".review")?.classList.remove("is-hidden");
        step5.querySelector(".actions")?.classList.remove("is-hidden");
        toast("Vamos criar outro anúncio. ✨", "ok", "Novo anúncio");
        window.scrollTo({ top: 0, behavior:"smooth" });
      });
    }
    panel.hidden=false;
    panel.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  // ===== Rascunho (sem imagens)
  function saveDraft(){
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

  function loadDraft(){
    try{
      const raw = localStorage.getItem(DRAFT_KEY);
      if(!raw) return;
      const d = JSON.parse(raw);
      if(d.mode) switchMode(d.mode);
      const map = {
        fldTitulo: d.titulo, fldCategoria: d.categoria, fldEstado: d.estado, fldUnidade: d.unidade,
        fldCobrarPor: d.cobrarPor, fldPreco: d.preco, fldTroca: d.troca, fldDisp: d.disp,
        fldLocal: d.local, fldEntrega: d.entrega,
      };
      Object.entries(map).forEach(([id,val])=>{
        const el=document.getElementById(id);
        if(el!=null && val!=null){
          el.value = val;
          el.dispatchEvent(new Event('input',{bubbles:true}));
          el.dispatchEvent(new Event('change',{bubbles:true}));
        }
      });
      if(d.step) gotoStep(d.step);
    }catch{/* ignore */}
  }

  // retomar após login (?resume=1)
  (function resumeIfNeeded(){
    const params = new URLSearchParams(location.search);
    const resume = params.get('resume');
    if (resume){
      loadDraft();
      toast("Retomamos seu anúncio. Reenvie as imagens para concluir.", "info", "Rascunho carregado");
      const clean = location.origin + location.pathname;
      history.replaceState({}, document.title, clean);
    }
  })();

  // descrição no preview (sutil)
  $("#fldTitulo")?.addEventListener("blur", ()=>{
    const t = $("#fldTitulo")?.value?.trim() || "";
    $("#prevDesc") && ($("#prevDesc").textContent = t ? `• ${t}` : "—");
  });

  // start
  switchMode("produto");
  gotoStep(1);
  loadDraft();
  renderThumbs();

  // ===== Toast PRO mínimo
  function initToastPRO(){
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
    .tp{pointer-events:auto;min-width:280px;max-width:min(92vw,420px);display:grid;grid-template-columns:auto 1fr auto;gap:8px 12px;padding:14px 14px 12px;color:var(--tp-ink);background:linear-gradient( to bottom right, var(--tp-card), rgba(20,24,30,.6));border:1px solid var(--tp-border);border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.03);backdrop-filter:blur(10px) saturate(120%);opacity:0;transform:translateY(8px) scale(.98);animation:tp-in .22s ASease forwards}
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
    `;
    const style=document.createElement("style");
    style.id="toast-pro-styles"; style.textContent=css; document.head.appendChild(style);
    const wrap=document.createElement("div"); wrap.id="tp-wrap"; wrap.className="tp-wrap tp--top-right"; document.body.appendChild(wrap);

    window.anToast = function(msg, variant='info', title, opts={}){
      const vmap={ok:"ok",warn:"warn",bad:"bad",info:"info"};
      const v=vmap[variant]?variant:"info";
      const el=document.createElement("div"); el.className=`tp tp--${v}`;
      const icon=document.createElement("div"); icon.className="tp__icon";
      icon.textContent = v==="ok"?"✓":(v==="bad"?"!":(v==="warn"?"⚠":"i"));
      const body=document.createElement("div"); body.className="tp__body";
      if(title){ const t=document.createElement("div"); t.className="tp__title"; t.textContent=title; body.appendChild(t); }
      const p=document.createElement("div"); p.className="tp__msg"; p.textContent=msg; body.appendChild(p);
      const btnClose=document.createElement("button"); btnClose.className="tp__close"; btnClose.setAttribute("aria-label","Fechar aviso"); btnClose.textContent="×";
      btnClose.addEventListener("click",()=>{ el.style.animation="tp-out .18s ease forwards"; setTimeout(()=>el.remove(),180); });
      const bar=document.createElement("div"); bar.className="tp__bar"; const fill=document.createElement("i"); bar.appendChild(fill);

      el.appendChild(icon); el.appendChild(body); el.appendChild(btnClose); el.appendChild(bar);
      document.getElementById("tp-wrap").appendChild(el);

      const duration=Math.max(1800, Number(opts.duration||3200));
      let start=performance.now();
      const step=(ts)=>{ const prog=Math.min(1,(ts-start)/duration); fill.style.transform=`scaleX(${1-prog})`; if(prog>=1){ el.style.animation="tp-out .18s ease forwards"; setTimeout(()=>el.remove(),180); return; } requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
  }
  // Toast com CTA (vidro + botão de ação)
window.toastAction = function({ title="Login necessário", msg="Você precisa estar logado para publicar seu anúncio.", variant="warn", ctaLabel="Fazer login", ghostLabel=null, duration=7000, onAction=()=>{}, onGhost=null }={}){
  const wrap = document.getElementById("tp-wrap");
  const el = document.createElement("div");
  el.className = `tp tp--glass tp--${({ok:"ok",warn:"warn",bad:"bad",info:"info"}[variant]||"info")}`;
  el.innerHTML = `
    <div class="tp__icon">${variant==="ok"?"✓":(variant==="bad"?"!":(variant==="warn"?"⚠":"i"))}</div>
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
  const close = ()=>{ el.style.animation="tp-out .18s ease forwards"; setTimeout(()=>el.remove(),180); };
  el.querySelector(".tp__close").addEventListener("click", close);

  // barra tempo
  const barFill = el.querySelector(".tp__bar i");
  const t0 = performance.now();
  const dur = duration;
  (function tick(ts){
    const p = Math.min(1,(ts - t0)/dur);
    barFill.style.transform = `scaleX(${1-p})`;
    if(p<1) requestAnimationFrame(tick); else close();
  })(t0);

  // ações
  el.querySelector("#tpCtaBtn").addEventListener("click", ()=>{ try{ onAction(); }finally{ close(); } });
  if(onGhost && el.querySelector("#tpGhostBtn")){
    el.querySelector("#tpGhostBtn").addEventListener("click", ()=>{ try{ onGhost(); }finally{ close(); } });
  }
};

})();
