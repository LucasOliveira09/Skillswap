// server.js

const express = require('express');
const setupDatabase = require('./database'); // Importa o setup do banco

const app = express();
const PORT = 3000;

// Variável global para a conexão do banco de dados
let db; 

// ----------------------------------------------------
// MIDDLEWARE (Configurações Iniciais)
// ----------------------------------------------------

// 1. Permite ao Express servir arquivos estáticos (HTML, CSS, JS) da pasta 'public'
app.use(express.static('public')); 

// 2. Middleware para parsear o corpo das requisições como JSON
app.use(express.json());

// ----------------------------------------------------
// FUNÇÃO PRINCIPAL PARA INICIAR O SERVIDOR
// ----------------------------------------------------
async function startServer() {
    // Conecta ou cria o banco de dados SQLite
    db = await setupDatabase();

    // ------------------------------------
    // ROTAS DA API DE USUÁRIOS
    // ------------------------------------

    // Rota POST: /api/usuarios/cadastro
    // Recebe os dados do formulário HTML e insere no SQLite
    app.post('/api/usuarios/cadastro', async (req, res) => {
        // Captura os dados enviados no corpo da requisição (do seu script.js)
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        try {
            const result = await db.run(
                'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
                [nome, email, senha] 
            );

            res.status(201).json({ 
                id: result.lastID, 
                nome, 
                email, 
                message: 'Usuário cadastrado com sucesso.'
            });

        } catch (error) {
            if (error.errno === 19) {
                return res.status(409).json({ error: 'O e-mail já está em uso.' });
            }
            console.error("Erro ao cadastrar:", error);
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/usuarios/login', async (req, res) => {
        const { email, senha } = req.body;

        try {
            const usuario = await db.get(
                'SELECT id, nome, email FROM usuarios WHERE email = ? AND senha_hash = ?', 
                [email, senha] 
            );

            if (!usuario) {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            res.json({ 
                id: usuario.id, 
                nome: usuario.nome, 
                email: usuario.email, 
                message: 'Bem vindo ' + usuario.nome + '!' });

            

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    app.get('/api/usuarios', async (req, res) => {
        try {
            const usuarios = await db.all('SELECT id, nome, email FROM usuarios');
            res.json(usuarios);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/usuarios/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const usuario = await db.get(
            // ATENÇÃO: Nunca retorne a senha_hash!
            'SELECT id, nome, email, senha_hash FROM usuarios WHERE id = ?', 
            [userId]
        );

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        
        const [primeiro_nome, ...sobrenomeArray] = usuario.nome.split(' ');
        const sobrenome = sobrenomeArray.join(' ');


        // Retorna apenas os dados seguros
        res.json({
            id: usuario.id,
            primeiro_nome: primeiro_nome || usuario.nome,
            sobrenome: sobrenome,
            email: usuario.email,
            // Adicionar campos futuros aqui (ex: endereco, telefone, etc.)
            endereco: "Ourinhos, 5236, Brasil (Em breve no DB!)" // Simulação
        });

    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/usuarios/:id', async (req, res) => {
    const userId = req.params.id;
    const { 
        primeiro_nome, 
        sobrenome, 
        email, 
        senha_atual, 
        nova_senha, 
        confirma_nova_senha 
    } = req.body;
    
    const novoNomeCompleto = `${primeiro_nome} ${sobrenome}`.trim();

    try {
        // 1. Busca o usuário atual (apenas para verificar a senha e pegar o hash antigo)
        const usuarioAtual = await db.get(
            'SELECT id, senha_hash FROM usuarios WHERE id = ?',
            [userId]
        );

        if (!usuarioAtual) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        
        // Assume que a senha NÃO será alterada
        let novaSenhaHash = usuarioAtual.senha_hash;
        
        // 2. Lógica de ATUALIZAÇÃO DE SENHA (Opcional)
        // Só executa se o campo 'nova_senha' foi preenchido pelo usuário
        if (nova_senha) {
            
            // Validações obrigatórias apenas se a senha estiver sendo alterada
            if (!senha_atual) {
                 return res.status(400).json({ error: 'Você deve fornecer a "Senha atual" para definir uma nova senha.' });
            }
            if (nova_senha !== confirma_nova_senha) {
                return res.status(400).json({ error: 'Nova senha e Confirmação de nova senha não coincidem.' });
            }
            
            // VERIFICAÇÃO DE SENHA ATUAL (Texto Simples)
            // Se a senha atual fornecida NÃO for igual à senha salva no DB (senha_hash)
            if (senha_atual !== usuarioAtual.senha_hash) {
                return res.status(401).json({ error: 'A Senha Atual fornecida está incorreta.' });
            }
            
            // Se passou por todas as validações, define a nova senha para o UPDATE
            novaSenhaHash = nova_senha;
        }

        // 3. Executa a atualização no banco de dados
        // Atualiza NOME, EMAIL e a SENHA (que pode ser a antiga ou a nova)
        const result = await db.run(
            'UPDATE usuarios SET nome = ?, email = ?, senha_hash = ? WHERE id = ?',
            [novoNomeCompleto, email, novaSenhaHash, userId]
        );

        if (result.changes === 0) {
            return res.status(200).json({ message: 'Nenhuma alteração feita.' });
        }

        res.json({ 
            message: 'Perfil atualizado com sucesso!',
            nome: novoNomeCompleto,
            email: email
        });

    } catch (error) {
        // Erro 19 é geralmente violação de UNIQUE (ex: tentar mudar para um email já existente)
        if (error.errno === 19) {
            return res.status(409).json({ error: 'O e-mail já está em uso por outra conta.' });
        }
        console.error("Erro ao atualizar perfil:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/servicos/usuario/:usuarioId', async (req, res) => {
    const usuarioId = req.params.usuarioId;

    try {
        const servicos = await db.all(`
            SELECT 
                id, titulo, descricao, categoria, tipo, valor, habilidade_desejada
            FROM servicos
            WHERE usuario_id = ?
            ORDER BY criado_em DESC
        `, [usuarioId]);
        
        res.json(servicos);
    } catch (error) {
        console.error("Erro ao listar serviços por usuário:", error);
        res.status(500).json({ error: error.message });
    }
});



    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
        console.log(`Acesse http://localhost:${PORT} no seu navegador para ver o frontend.`);
    });
}

// Inicia a aplicação
startServer();