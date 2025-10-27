// Arquivo: js/pagina_editarPerfil.js

const API_USUARIOS_URL = 'http://localhost:3000/api/usuarios/';
let usuarioIdLogado = null;

document.addEventListener('DOMContentLoaded', () => {
    usuarioIdLogado = localStorage.getItem('usuarioId');
    const usuarioNomeLogado = localStorage.getItem('usuarioNome');
    
    if (!usuarioIdLogado) {
        window.location.href = 'index.html'; 
        return;
    }
    
    // (Sua lógica da Navbar - pode copiar de perfil.js se precisar)
    // gerenciarNavbar(); 

    carregarDadosPerfil(usuarioIdLogado);

    const form = document.getElementById('formEditarPerfil'); // Use o ID do formulário
    form.addEventListener('submit', salvarDadosPerfil);
    
    document.querySelector('button[type="button"]').addEventListener('click', (e) => {
        e.preventDefault();
        carregarDadosPerfil(usuarioIdLogado); 
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
        
        // Preenche o formulário
        document.getElementById('primeiro_nome').value = dados.primeiro_nome || '';
        document.getElementById('sobrenome').value = dados.sobrenome || '';
        document.getElementById('email').value = dados.email || '';
        
        // PREENCHER OS NOVOS CAMPOS
        document.getElementById('avatar_url').value = dados.avatar_url || '';
        document.getElementById('profissao').value = dados.profissao || '';
        document.getElementById('local').value = dados.local || '';
        document.getElementById('hashtags').value = dados.hashtags || '';
        
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
    
    // Captura os dados do perfil (INCLUINDO OS NOVOS)
    const primeiro_nome = document.getElementById('primeiro_nome').value.trim();
    const sobrenome = document.getElementById('sobrenome').value.trim();
    const email = document.getElementById('email').value.trim();
    const avatar_url = document.getElementById('avatar_url').value.trim();
    const profissao = document.getElementById('profissao').value.trim();
    const local = document.getElementById('local').value.trim();
    const hashtags = document.getElementById('hashtags').value.trim();

    // Captura os dados de senha
    const senha_atual = document.getElementById('senha_atual').value;
    const nova_senha = document.getElementById('nova_senha').value;
    const confirma_nova_senha = document.getElementById('confirma_nova_senha').value;

    const dadosAtualizados = {
        primeiro_nome,
        sobrenome,
        email,
        avatar_url, // ADICIONADO
        profissao,  // ADICIONADO
        local,      // ADICIONADO
        hashtags,   // ADICIONADO
        senha_atual,
        nova_senha,
        confirma_nova_senha
    };
    
    // (Sua lógica de validação de senha está ótima)
    if (nova_senha) {
        if (!senha_atual) {
            exibirToast("Preencha a 'Senha atual' para definir uma nova senha.", 'orange');
            return;
        }
        if (nova_senha !== confirma_nova_senha) {
            exibirToast("A nova senha e a confirmação não coincidem.", 'orange');
            return;
        }
        // ... (etc)
    } 
    
    // 2. Chamada à API (PUT)
    try {
        const response = await fetch(API_USUARIOS_URL + usuarioIdLogado, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados) // O backend vai ignorar campos protegidos
        });

        const resultado = await response.json();

        if (response.ok) {
            // Atualiza o nome no localStorage se ele mudou
            if(resultado.nome) {
                localStorage.setItem('usuarioNome', resultado.nome);
            }
            
            exibirToast(resultado.message || "Dados atualizados com sucesso!", 'green');
            
            // Recarrega os dados no formulário (limpa senhas)
            // carregarDadosPerfil(usuarioIdLogado); // Não precisa recarregar, vamos redirecionar

            // Opcional: Redireciona de volta ao perfil após 2 segundos
            setTimeout(() => {
                window.location.href = 'pagina_perfil.html'; // Corrigido para o seu link
            }, 2000);

        } else {
            // Se o servidor retornar um erro (ex: senha errada), vai aparecer aqui
            exibirToast(resultado.error || 'Erro ao salvar alterações.', 'red');
        }
    } catch (error) {
        // Se a API estiver offline ou der erro de rede
        exibirToast("Erro na conexão com o servidor.", 'red');
        console.error("Erro ao salvar perfil:", error);
    }
}


// ----------------------------------------------------
// FUNÇÃO UTILITÁRIA QUE ESTAVA FALTANDO
// ----------------------------------------------------
function exibirToast(text, type) {
    let backgroundStyle;
    if (type === 'green') {
        backgroundStyle = "linear-gradient(to right, #00b09b, #96c93d)";
    } else if (type === 'red') {
        backgroundStyle = "linear-gradient(to right, #ff5f6d, #ffc371)";
    } else { // orange/info
        backgroundStyle = "linear-gradient(to right, #ff9900, #ffcc66)";
    }

    if (typeof Toastify === 'undefined') {
        console.error("Biblioteca Toastify não foi carregada!");
        alert(text); // Fallback para um alerta simples
        return;
    }

    Toastify({
        text: text,
        duration: 4000,
        gravity: "top", 
        position: "right", 
        stopOnFocus: true,
        style: { background: backgroundStyle, opacity: 0.9 },
    }).showToast();
}