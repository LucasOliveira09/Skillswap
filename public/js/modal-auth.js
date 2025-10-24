/*
(() => {
  // ===== Mock de auth (troque depois pela sua verificação real) =====
  function isLoggedIn(){
    return !!localStorage.getItem("ss_auth_user"); // ajuste p/ sua auth real
  }

  const BTN_ID = "btnAnunciar";              // id do botão/link ANUNCIAR
  const DESTINO_ANUNCIO = "pagina-anuncio.html";    // URL da página de anúncio

  const btn = document.getElementById(BTN_ID);
  const modal = document.getElementById("authModal");
  if (!btn || !modal) return;

  const backdrop  = modal.querySelector("[data-close]");
  const btnClose  = modal.querySelector(".authm__x");
  const btnSignIn = modal.querySelector("#authSignIn");
  const btnGuest  = modal.querySelector("#authGuest");

  function openModal(){ modal.hidden = false; document.body.style.overflow = "hidden"; }
  function closeModal(){ modal.hidden = true; document.body.style.overflow = ""; }

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (isLoggedIn()){
      window.location.href = DESTINO_ANUNCIO;
      return;
    }
    openModal();
  });

  backdrop?.addEventListener("click", closeModal);
  btnClose?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape" && !modal.hidden) closeModal(); });

  // Entrar / criar conta (ajuste para sua rota real)
  btnSignIn?.addEventListener("click", () => {
    localStorage.setItem("ss_continue_to", DESTINO_ANUNCIO);
    window.location.href = "/login.html"; // troque para sua rota
  });

  // Continuar sem login
  btnGuest?.addEventListener("click", () => {
    localStorage.setItem("ss_guest_mode", "1");
    closeModal();
    window.location.href = DESTINO_ANUNCIO;
  });
})();
*/
