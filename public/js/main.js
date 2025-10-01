// public/js/main.js

const API_CADASTRO_URL = 'http://localhost:3000/api/usuarios/cadastro';

document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastroForm');
    
    // ----------------------------------------------------
    // Captura do Evento de Submissão do Formulário
    // ----------------------------------------------------
    cadastroForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // <-- MUITO IMPORTANTE: Previne o envio padrão do formulário
        
        // 1. Captura dos valores dos campos (usando os IDs ou Names)
        const nome = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const emailConfirm = document.getElementById('email_confirm').value;
        const senha = document.getElementById('senha').value;
        const senhaConfirm = document.getElementById('senha_confirm').value;

        // 2. Validação Básica (Frontend)
        if (email !== emailConfirm) {
            Toastify({
                text: "Os emails não coincidem",
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
            return;
        }
        if (senha !== senhaConfirm) {
            Toastify({
                text: "As senhas não coincidem",
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
            return;
        }

        // 3. Monta o objeto de dados a ser enviado para a API
        const dadosCadastro = {
            nome: nome,
            email: email,
            senha: senha
        };

        // 4. Envia a Requisição POST para o Servidor Node.js
        try {
            const response = await fetch(API_CADASTRO_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Indica que o corpo é JSON
                },
                body: JSON.stringify(dadosCadastro)
            });

            const resultado = await response.json();

            // 5. Trata a Resposta da API
            if (response.ok && response.status === 201) {
                Toastify({
                text: 'Cadastro realizado com sucesso, ' + resultado.nome + "!",
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
                cadastroForm.reset(); 
                
                setTimeout(function(){
                    window.location.href = 'index.html'; 
                }, 2000);
                
            } else {
                // Trata erros de validação (ex: email duplicado, status 409)
                alert(`Falha no Cadastro: ${resultado.error || 'Erro desconhecido.'}`);
            }

        } catch (error) {
            // Trata erros de rede/conexão
            console.error('Erro de conexão:', error);
            alert('Não foi possível conectar ao servidor. Verifique se o Node.js está rodando.');
        }
    });
    
});