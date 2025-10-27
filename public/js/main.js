// public/js/main.js (ou cadastro.js)

const API_CADASTRO_URL = 'http://localhost:3000/api/usuarios/cadastro';

document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastroForm');
    
    // ----------------------------------------------------
    // Captura do Evento de Submissão do Formulário
    // ----------------------------------------------------
    cadastroForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // <-- MUITO IMPORTANTE: Previne o envio padrão do formulário
        
        // 1. Captura dos valores dos campos (usando os IDs ou Names)
        const nomeCompleto = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const emailConfirm = document.getElementById('email_confirm').value;
        const senha = document.getElementById('senha').value;
        const senhaConfirm = document.getElementById('senha_confirm').value;

        // 2. Validação Básica (Frontend)
        if (email !== emailConfirm) {
            exibirToast("Os emails não coincidem", 'red');
            return;
        }
        if (senha !== senhaConfirm) {
            exibirToast("As senhas não coincidem", 'red');
            return;
        }

        // 3. Monta o objeto de dados a ser enviado para a API
        // --- CORREÇÃO APLICADA AQUI ---
        
        const partesNome = nomeCompleto.trim().split(' '); // "Lucas Oliveira" -> ["Lucas", "Oliveira"]
        const primeiro_nome = partesNome.shift(); // Remove e retorna o primeiro item: "Lucas"
        const sobrenome = partesNome.join(' '); // Junta o resto: "Oliveira" (ou "Leite de Oliveira", etc.)

        // Verifica se o primeiro nome existe após o split
        if (!primeiro_nome) {
            exibirToast("Por favor, digite seu nome.", 'red');
            return;
        }

        const dadosCadastro = {
            primeiro_nome: primeiro_nome,
            sobrenome: sobrenome,
            email: email,
            senha: senha
        };
        // --- FIM DA CORREÇÃO ---


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
                exibirToast('Cadastro realizado com sucesso, ' + resultado.nome + "!", 'green'); 
                cadastroForm.reset(); 
                
                setTimeout(function(){
                    window.location.href = 'index.html'; // Redireciona para o login
                }, 2000);
                
            } else {
                // Trata erros de validação (ex: email duplicado, status 409 ou 400)
                exibirToast(`Falha no Cadastro: ${resultado.error || 'Erro desconhecido.'}`, 'red');
            }

        } catch (error) {
            // Trata erros de rede/conexão
            console.error('Erro de conexão:', error);
            exibirToast('Não foi possível conectar ao servidor.', 'red');
        }
    });

    /**
     * Função auxiliar para exibir Toastify
     * @param {string} text - A mensagem
     * @param {string} type - 'green', 'red' ou 'orange'
     */
    function exibirToast(text, type) {
        let backgroundStyle;
        if (type === 'green') {
            backgroundStyle = "linear-gradient(to right, #00b09b, #96c93d)";
        } else if (type === 'red') {
            backgroundStyle = "linear-gradient(to right, #ff5f6d, #ffc371)";
        } else { // orange/info
            backgroundStyle = "linear-gradient(to right, #ff9900, #ffcc66)";
        }

        Toastify({
            text: text,
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top",
            position: "right", 
            stopOnFocus: true,
            style: { background: backgroundStyle },
        }).showToast();
    }
});