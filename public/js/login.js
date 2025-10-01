const API_LOGIN_URL = 'http://localhost:3000/api/usuarios/login'

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm')
    
    if (!loginForm) {
        console.error("loginForm não encontrado!");
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login_email').value;
        const senha = document.getElementById('login_senha').value;
        if (!email || !senha) {
            Toastify({
                text: "Está faltando algo!",
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
    return; // Para o processo se estiver incompleto
}

    const credenciais = { email: email, senha: senha}

    try {
        const response = await fetch(API_LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'

            },
            body: JSON.stringify(credenciais)
        });

        const resultado = await response.json();

            if(response.ok && response.status === 200){
                localStorage.setItem('usuarioNome', resultado.nome);
                localStorage.setItem('usuarioId', resultado.id);

                Toastify({
                text: "Login bem-sucedido! Bem-vindo(a), " + resultado.nome + "!",
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

            setTimeout(function(){
                window.location.href = 'pagina-servicos.html'
            }, 2000)
            }
    } catch(error) {
        Toastify({
                text: "Servidor indisponivel!",
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
    })
})