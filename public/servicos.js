document.addEventListener('DOMContentLoaded', () => {
    // 1. Tenta recuperar as informações salvas no localStorage
    const nomeDoUsuario = localStorage.getItem('usuarioNome');
    const idDoUsuario = localStorage.getItem('usuarioId');

    
    if (nomeDoUsuario && idDoUsuario) {
        const titulo = document.getElementById('tituloBoasVindas');
        if (titulo) {
            titulo.textContent = `Bem-vindo(a) de volta, ${nomeDoUsuario}!`;
        }
        
    } else {
        Toastify({
                text: "Voce não esta logado",
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "top",
                position: "right", 
                stopOnFocus: true,
                style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
                },
            }).showToast();
    }
});