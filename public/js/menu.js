// js/menu.js
// Tipo de dado esperado em localStorage: key "ss_auth_user"
// {
//   id: "u123",
//   name: "Ellen Conrado",
//   avatar: "img/avatar-ellen.jpg",
//   verified: true,
//   rating: 4.7,
//   badges: ["Top Seller"],
// }

function getAuthUser(){
  try{
    return JSON.parse(localStorage.getItem('ss_auth_user') || 'null');
  }catch{ return null; }
}
function setAuthUser(user){
  localStorage.setItem('ss_auth_user', JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('auth:changed', { detail: user }));
}
function clearAuthUser(){
  localStorage.removeItem('ss_auth_user');
  window.dispatchEvent(new CustomEvent('auth:changed', { detail: null }));
}

function fmtStars(n){
  return (typeof n === 'number' && !Number.isNaN(n)) ? `${n.toFixed(1)}★` : null;
}

function paintUserEverywhere(){
  const user = getAuthUser();

  // Header
  const navUserName = document.querySelector('#navUserName[data-user-name]');
  const navUserAvatar = document.getElementById('navUserAvatar');
  const dropdown = document.getElementById('userMenuDropdown');
  const menu = document.getElementById('userMenuContent');

  if (user){
    if (navUserName) navUserName.textContent = user.name || 'Usuário';
    if (navUserAvatar && user.avatar) navUserAvatar.src = user.avatar;

    if (menu){
  // hidrata UMA vez
  if (!menu.dataset.hydrated) {
    menu.innerHTML = `
      <div class="um-head" style="display:flex; gap:8px; align-items:center; padding:8px;">
        <img id="navUserAvatarInner" src="${user.avatar || 'img/avatar-default.png'}" width="36" height="36" style="border-radius:50%" alt="">
        <div>
          <strong id="navUserNameInner" style="display:block">${user.name || 'Usuário'}</strong>
          <small id="navUserMeta" style="opacity:.75"></small>
        </div>
      </div>
      <hr style="border:none; height:1px; background:rgba(0,0,0,.06); margin:6px 0;">
      <a role="menuitem" href="#" class="um-item">Meu perfil</a>
      <a role="menuitem" href="#" class="um-item">Minhas vendas</a>
      <a role="menuitem" href="#" class="um-item">Pedidos</a>
      <a role="menuitem" href="#" class="um-item">Configurações</a>
      <hr style="border:none; height:1px; background:rgba(0,0,0,.06); margin:6px 0;">
      <button role="menuitem" id="umLogout" class="um-item">Sair</button>
    `;
    menu.dataset.hydrated = "true";
    menu.querySelector('#umLogout')?.addEventListener('click', () => {
      clearAuthUser();
      closeOffnav();
    });
  }
  // atualiza só os textos/foto (sem trocar o HTML)
  const nameInner = menu.querySelector('#navUserNameInner');
  const metaInner = menu.querySelector('#navUserMeta');
  const avatarInner = menu.querySelector('#navUserAvatarInner');
  if (nameInner)  nameInner.textContent  = user?.name || 'Usuário';
  if (avatarInner) avatarInner.src       = user?.avatar || 'img/avatar-default.png';
  if (metaInner)   metaInner.textContent = (user?.verified ? 'Conta verificada' : 'Conta não verificada') + (user?.rating ? ' • ' + fmtStars(user.rating) : '');
    }
  }else{
    if (navUserName) navUserName.textContent = 'Entrar';
    if (navUserAvatar) navUserAvatar.src = 'img/avatar-default.png';
    if (dropdown) dropdown.removeAttribute('data-logged');
    if (menu){
      menu.innerHTML = `
        <button role="menuitem" id="umLogin" class="um-item">Entrar</button>
        <a role="menuitem" href="#" class="um-item">Criar conta</a>
      `;
      menu.querySelector('#umLogin')?.addEventListener('click', () => {
        localStorage.setItem('ss_continue_to', location.pathname);
        // redirecione para sua página de login real:
        window.location.href = 'index.html';
      });
    }
  }

  // Offnav
  const offnavName = document.querySelector('#offnavUserName[data-user-name]');
  const offnavAvatar = document.getElementById('offnavAvatar');
  const offnavBadges = document.getElementById('offnavBadges');
  const btnLogin = document.getElementById('offnavLogin');
  const btnLogout = document.getElementById('offnavLogout');

  if (offnavName) offnavName.textContent = user ? user.name : 'Visitante';
  if (offnavAvatar) offnavAvatar.src = user?.avatar || 'img/avatar-default.png';
  if (offnavBadges){
    offnavBadges.innerHTML = '';
    const rating = user?.rating;
    const verified = !!user?.verified;
    const badges = Array.isArray(user?.badges) ? user.badges : [];

    if (typeof rating === 'number'){
      const span = document.createElement('span');
      span.className = 'star';
      span.textContent = fmtStars(rating);
      offnavBadges.appendChild(span);
    }
    if (verified){
      const span = document.createElement('span');
      span.className = 'badge badge--ok';
      span.textContent = 'Conta verificada';
      offnavBadges.appendChild(span);
    }
    for (const b of badges){
      const span = document.createElement('span');
      span.className = 'badge';
      span.textContent = b;
      offnavBadges.appendChild(span);
    }
  }

  if (btnLogin)  btnLogin.hidden  = !!user;
  if (btnLogout) btnLogout.hidden = !user;
}

/* ===== Offnav controls (acessibilidade + swipe) ===== */
const offnav   = document.getElementById('offnav');
const panel    = offnav?.querySelector('.offnav__panel');
const btnOpen  = document.getElementById('menuButton');
const appMain  = document.getElementById('appMain');

let lastFocus = null;

function setBodyLock(lock){
  document.documentElement.classList.toggle('offnav-open', lock);
  document.body.classList.toggle('offnav-open', lock);
  if (appMain && 'inert' in appMain) appMain.inert = lock;
}

function openOffnav(){
  if (!offnav || !panel || !btnOpen) return;
  lastFocus = document.activeElement;
  offnav.setAttribute('aria-hidden','false');
  btnOpen.setAttribute('aria-expanded','true');
  btnOpen.dataset.state = 'open';
  setBodyLock(true);
  requestAnimationFrame(() => panel.focus());
}

function closeOffnav(){
  if (!offnav || !panel || !btnOpen) return;
  offnav.setAttribute('aria-hidden','true');
  btnOpen.setAttribute('aria-expanded','false');
  btnOpen.dataset.state = 'closed';
  setBodyLock(false);
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

btnOpen?.addEventListener('click', e => {
  e.preventDefault();
  (offnav.getAttribute('aria-hidden') === 'true') ? openOffnav() : closeOffnav();
});
offnav?.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeOffnav(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && offnav?.getAttribute('aria-hidden')==='false') closeOffnav();
  if (e.key === '/' && offnav?.getAttribute('aria-hidden')==='false'){
    const search = panel.querySelector('input[type="search"], input[role="searchbox"]');
    if (search){ e.preventDefault(); search.focus(); }
  }
});

// Trap de foco
offnav?.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const focusables = [...offnav.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0], last = focusables.at(-1);
  if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
});

// Swipe para fechar (mobile)
let startX = 0, dx = 0, touching = false;
panel?.addEventListener('touchstart', e => {
  if (offnav.getAttribute('aria-hidden') === 'true') return;
  touching = true; startX = e.touches[0].clientX; dx = 0;
}, {passive:true});
panel?.addEventListener('touchmove', e => {
  if (!touching) return;
  dx = e.touches[0].clientX - startX;
  if (dx < 0) return;
  panel.style.transform = `translateX(${Math.min(dx, 120)}px)`;
}, {passive:true});
panel?.addEventListener('touchend', () => {
  if (!touching) return; touching = false;
  if (dx > 90) closeOffnav();
  panel.style.transform = ''; dx = 0;
}, {passive:true});

/* ===== Integrações: login/menu/header ===== */
function wireHeaderDropdown(){
  const dd = document.getElementById('userMenuDropdown');
  const trigger = document.getElementById('userMenuTrigger');
  const menu = document.getElementById('userMenuContent');
  if (!dd || !trigger || !menu) return;

  function setExpanded(val){
    dd.setAttribute('aria-expanded', String(val));
    trigger.setAttribute('aria-expanded', String(val));
  }
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = dd.getAttribute('aria-expanded') === 'true';
    setExpanded(!isOpen);
  });
  document.addEventListener('click', (e) => {
    if (!dd.contains(e.target)) setExpanded(false);
  });
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown'){ e.preventDefault(); setExpanded(true); menu.querySelector('.um-item')?.focus(); }
  });
}

function wireAuthButtons(){
  const btnAnunciarHeader = document.getElementById('btnAnunciar');
  const btnAnunciarOffnav = document.getElementById('offnavAnunciar');
  const btnLoginOffnav = document.getElementById('offnavLogin');
  const btnLogoutOffnav = document.getElementById('offnavLogout');

  const modal = document.getElementById('announceModal');

  function openModal(){
    modal?.removeAttribute('hidden');
    modal?.setAttribute('aria-hidden','false');
  }
  function closeModal(){
    modal?.setAttribute('hidden','');
    modal?.setAttribute('aria-hidden','true');
  }

  modal?.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });

  function handleAnunciar(){
    const user = getAuthUser();
    if (user){
      window.location.href = 'pagina-anuncio.html';
    }else{
      openModal();
    }
  }

  btnAnunciarHeader?.addEventListener('click', handleAnunciar);
  btnAnunciarOffnav?.addEventListener('click', () => { closeOffnav(); handleAnunciar(); });

  btnLoginOffnav?.addEventListener('click', () => {
    localStorage.setItem('ss_continue_to', location.pathname);
    window.location.href = 'index.html';
  });
  btnLogoutOffnav?.addEventListener('click', () => { clearAuthUser(); });

  // Modal actions
  document.getElementById('amLogin')?.addEventListener('click', () => {
    localStorage.setItem('ss_continue_to', 'pagina-anuncio.html');
    window.location.href = 'index.html';
  });
  document.getElementById('amGuest')?.addEventListener('click', () => {
    // fluxo de convidado
    closeModal();
    window.location.href = 'pagina-anuncio.html';
  });
}

/* ===== Inicialização ===== */
paintUserEverywhere();
wireHeaderDropdown();
wireAuthButtons();

window.addEventListener('auth:changed', paintUserEverywhere);

// Estado inicial seguro offnav
if (offnav){ offnav.setAttribute('aria-hidden','true'); }
if (btnOpen){ btnOpen.dataset.state = 'closed'; }

// Exemplo: se precisar simular login durante dev, descomente:
// setAuthUser({ id:"u1", name:"Ellen Conrado", avatar:"img/avatar-emerson.jpg", verified:true, rating:4.8, badges:["Top Seller"] });
window.addEventListener('storage', (e) => {
  if (e.key === 'ss_auth_user') {
    paintUserEverywhere();
  }
});
// Microinterações do botão PRO (independente do off-canvas)
(() => {
  const btn = document.getElementById('menuButton');
  if (!btn) return;

  // camada de ripple
  const rippleLayer = document.createElement('div');
  rippleLayer.className = 'ripple';
  btn.appendChild(rippleLayer);

  // ripple no clique
  const spawnRipple = (x, y) => {
    const dot = document.createElement('span');
    dot.style.left = x + 'px';
    dot.style.top  = y + 'px';
    rippleLayer.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove(), { once: true });
  };

  btn.addEventListener('pointerdown', e => {
    btn.dataset.pressed = 'true';
    const rect = btn.getBoundingClientRect();
    spawnRipple(e.clientX - rect.left, e.clientY - rect.top);
  });
  btn.addEventListener('pointerup',   () => { btn.dataset.pressed = 'false'; });
  btn.addEventListener('pointerleave',() => { btn.dataset.pressed = 'false'; });

  // halo segue o mouse
  btn.addEventListener('pointermove', e => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', ((e.clientX - r.left)/r.width*100)+'%');
    btn.style.setProperty('--my', ((e.clientY - r.top)/r.height*100)+'%');
  });

  // teclado acessível: Espaço/Enter acionam visual de press
  btn.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') btn.dataset.pressed = 'true';
  });
  btn.addEventListener('keyup', () => { btn.dataset.pressed = 'false'; });

  // dica: se tiver “novidades”, setar: btn.classList.add('has-updates')
})();
