// public/js/perfilNav.js

document.addEventListener('DOMContentLoaded', () => {
    const usuarioNome = localStorage.getItem('usuarioNome');
    const navUserName = document.getElementById('navUserName');
    const menuTrigger = document.getElementById('userMenuTrigger');
    const menuContent = document.getElementById('userMenuContent');
    const dropdown = document.getElementById('userMenuDropdown');

    if (usuarioNome && navUserName) {
        const primeiroNome = usuarioNome.split(' ')[0];
        navUserName.textContent = `Olá, ${primeiroNome}`;
        
        // Preenche o conteúdo do dropdown
        menuContent.innerHTML = `
            <a href="pagina_perfil.html" class="menu-item">
                Perfil
            </a>
            <hr class="menu-divider">
            <button onclick="fazerLogout()" class="menu-item menu-logout-btn">
                Sair
            </button>
        `;
        
        // Adiciona evento para mostrar/esconder o dropdown
        menuTrigger.addEventListener('click', () => {
            menuContent.classList.toggle('is-open');
            dropdown.classList.toggle('is-active');
        });

        // Opcional: Esconder ao clicar fora
        document.addEventListener('click', (event) => {
            if (!dropdown.contains(event.target)) {
                menuContent.classList.remove('is-open');
                dropdown.classList.remove('is-active');
            }
        });

    } else {
        // Se não houver sessão, você pode redirecionar ou mostrar o link de login
        // Neste contexto, vamos apenas garantir que a saudação mostre o default
        if (navUserName) {
             navUserName.textContent = 'Entrar/Registrar-se';
             menuTrigger.setAttribute('onclick', "window.location.href='index.html'");
        }
    }
});



function fazerLogout() {
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioNome');
    
    // Se o Toastify não estiver definido, comente a linha abaixo!
    if (typeof Toastify !== 'undefined') {
        Toastify({
            text: "Sessão encerrada. Até logo!",
            duration: 2000,
            style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" },
        }).showToast();
    }
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}
