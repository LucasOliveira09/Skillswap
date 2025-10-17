const API_USUARIOS_URL = 'http://localhost:3000/api/usuarios/';
let usuarioIdLogado = null;


document.addEventListener('DOMContentLoaded', () => {
    usuarioIdLogado = localStorage.getItem('usuarioId');
    const usuarioNomeLogado = localStorage.getItem('usuarioNome');
    
    if (!usuarioIdLogado) {
        // Redireciona se não estiver logado
        window.location.href = 'index.html'; 
        return;
    }
    
    // Preenche o nome na saudação do HTML (Bem vindo, Otávio)
    const saudacaoElements = document.querySelectorAll('.inicio-bemvindo nav span:last-child');
    saudacaoElements.forEach(el => {
        if (el.textContent.includes('Otávio')) { // Usa o valor estático do seu HTML
            el.textContent = `Bem vindo, ${usuarioNomeLogado.split(' ')[0]}`;
        }
    });

    carregarDadosPerfil(usuarioIdLogado);

    // Adiciona listener ao formulário de edição
    const form = document.querySelector('section form');
    form.addEventListener('submit', salvarDadosPerfil);
    
    // Adiciona listener ao botão Cancelar (para recarregar a página)
    document.querySelector('button[type="button"]').addEventListener('click', (e) => {
        e.preventDefault();
        carregarDadosPerfil(usuarioIdLogado); // Recarrega os dados originais
        exibirToast("Alterações canceladas.", 'orange');
    });
});

async function carregarDadosPerfil(userId) {
    try {
        const response = await fetch(API_USUARIOS_URL + userId);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar dados do perfil.');
        }
        
        const dados = await response.json();
        
        // Preenche o formulário com os dados do banco
        document.getElementById('primeiro_nome').value = dados.primeiro_nome || '';
        document.getElementById('sobrenome').value = dados.sobrenome || '';
        document.getElementById('email').value = dados.email || '';
        document.getElementById('endereco').value = dados.endereco || ''; // Campo simulado
        
        // Limpa campos de senha
        document.getElementById('senha_atual').value = '';
        document.getElementById('nova_senha').value = '';
        document.getElementById('confirma_nova_senha').value = '';
        
    } catch (error) {
        exibirToast("Erro ao carregar dados: " + error.message, 'red');
        console.error("Erro ao carregar perfil:", error);
    }
}


async function salvarDadosPerfil(e) {
    e.preventDefault();
    
    // Captura os dados do perfil
    const primeiro_nome = document.getElementById('primeiro_nome').value.trim();
    const sobrenome = document.getElementById('sobrenome').value.trim();
    const email = document.getElementById('email').value.trim();
    const endereco = document.getElementById('endereco').value.trim(); 
    
    // Captura os dados de senha (podem estar vazios)
    const senha_atual = document.getElementById('senha_atual').value;
    const nova_senha = document.getElementById('nova_senha').value;
    const confirma_nova_senha = document.getElementById('confirma_nova_senha').value;

    const dadosAtualizados = {
        primeiro_nome,
        sobrenome,
        email,
        endereco, // Mantido para simulação
        senha_atual,
        nova_senha,
        confirma_nova_senha
    };
    
    // 1. VALIDAÇÃO FRONTAL PARA NOVA SENHA
    // Se o usuário preencheu a nova senha, verificamos se ela coincide no frontend
    if (nova_senha) {
        if (!senha_atual) {
            exibirToast("Preencha a 'Senha atual' para definir uma nova senha.", 'orange');
            return;
        }
        if (nova_senha !== confirma_nova_senha) {
            exibirToast("A nova senha e a confirmação não coincidem.", 'orange');
            return;
        }
        if (nova_senha.length < 6) { 
            exibirToast("A nova senha deve ter no mínimo 6 caracteres.", 'orange');
            return;
        }
    } 
    // Se o campo nova_senha ESTÁ VAZIO, não fazemos mais nenhuma verificação
    // e enviamos os campos vazios. O backend simplesmente IGNORARÁ a alteração de senha.


    // 2. Chamada à API (PUT)
    try {
        const response = await fetch(API_USUARIOS_URL + usuarioIdLogado, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        });

        const resultado = await response.json();

        if (response.ok) {
            if(resultado.nome) {
                localStorage.setItem('usuarioNome', resultado.nome);
            }
            
            exibirToast(resultado.message || "Dados atualizados com sucesso!", 'green');
            carregarDadosPerfil(usuarioIdLogado); 
            
            if (typeof gerenciarUI === 'function') {
                gerenciarUI(); 
            }

        } else {
            exibirToast(resultado.error || 'Erro ao salvar alterações.', 'red');
        }

    } catch (error) {
        exibirToast("Erro na conexão com o servidor.", 'red');
        console.error("Erro ao salvar perfil:", error);
    }
}


/**
 * Função utilitária para exibir notificações Toastify.
 * @param {string} text - O texto da mensagem.
 * @param {string} type - 'green', 'red' ou 'orange'.
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
        style: { background: backgroundStyle, opacity: 0.9 },
    }).showToast();
}