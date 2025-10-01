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


    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
        console.log(`Acesse http://localhost:${PORT} no seu navegador para ver o frontend.`);
    });
}

// Inicia a aplicação
startServer();