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
            alert('Erro: Os campos de E-mail não coincidem!');
            return;
        }
        if (senha !== senhaConfirm) {
            alert('Erro: Os campos de Senha não coincidem!');
            return;
        }

        // 3. Monta o objeto de dados a ser enviado para a API
        const dadosCadastro = {
            nome: nome,
            email: email,
            senha: senha // Lembre-se, estamos enviando sem criptografia (TESTE)
        };

        // 4. Envia a Requisição POST para o Servidor Node.js
        try {
            const response = await fetch(API_CADASTRO_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Indica que o corpo é JSON
                },
                body: JSON.stringify(dadosCadastro) // Converte o objeto JS para string JSON
            });

            const resultado = await response.json();

            // 5. Trata a Resposta da API
            if (response.ok && response.status === 201) {
                alert(`Cadastro realizado com sucesso! Bem-vindo(a), ${resultado.nome}.`);
                cadastroForm.reset(); // Limpa o formulário após sucesso
                
                // Redirecionar para a página de login/perfil
                // window.location.href = 'pagina-de-login.html'; 
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