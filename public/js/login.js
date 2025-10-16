// public/js/login.js

const API_LOGIN_URL = 'http://localhost:3000/api/usuarios/login';

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------
    // 1. VERIFICAÇÃO DE PERSISTÊNCIA (Sessão no localStorage)
    // ----------------------------------------------------
    const usuarioId = localStorage.getItem('usuarioId');
    if (usuarioId) {
        // Se houver um ID salvo, o usuário está "logado". Redireciona.
        const usuarioNome = localStorage.getItem('usuarioNome');
        
        Toastify({
            text: "Bem-vindo(a) de volta, " + usuarioNome + "!",
            duration: 2000,
            style: { 
                background: "linear-gradient(to right, #00b09b, #96c93d)",
                opacity: 0.9 
            },
        }).showToast();

        // Redireciona após um pequeno atraso
        setTimeout(function(){
            window.location.href = 'pagina-servicos.html'
        }, 1000)
        return; 
    }
    // ----------------------------------------------------
    

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
                background: "linear-gradient(to right, #ff5f6d, #ffc371)", // Cor de erro
                },
            }).showToast();
        return; 
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
                // Salva os dados de persistência no navegador
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
            } else {
                // Erro de credenciais inválidas (401) ou outro erro da API
                Toastify({
                    text: resultado.error || "Credenciais inválidas. Tente novamente.",
                    duration: 3000,
                    style: {
                        background: "linear-gradient(to right, #ff5f6d, #ffc371)",
                    },
                }).showToast();
            }
        } catch(error) {
            Toastify({
                text: "Servidor indisponivel!",
                duration: 3000,
                style: {
                    background: "linear-gradient(to right, #ff5f6d, #ffc371)",
                },
            }).showToast();
        }
    })
})