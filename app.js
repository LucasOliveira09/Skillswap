// server.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose(); // <--- FALTAVA IMPORTAR
const bcrypt = require('bcrypt');             // <--- FALTAVA IMPORTAR
const cors = require('cors');                 // <--- BOM ADICIONAR

const app = express();
const PORT = 3000;
const DB_SOURCE = "skillswap.db";
const saltRounds = 10;

// ----------------------------------------------------
// MIDDLEWARE
// ----------------------------------------------------
app.use(cors()); // Permite requisições de outras origens (ex: seu frontend)
app.use(express.static('public')); // Serve arquivos estáticos
app.use(express.json());       // Lê o corpo de requisições JSON

// ----------------------------------------------------
// CONEXÃO COM O BANCO DE DADOS
// ----------------------------------------------------

// Variável 'db' que será usada por todas as rotas
let db;

db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        console.error("Erro ao abrir banco de dados:", err.message);
        throw err;
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        
        // SQL para criar a tabela (como você definiu)
        const sqlCreateTable = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                primeiro_nome TEXT NOT NULL,
                sobrenome TEXT,
                email TEXT NOT NULL UNIQUE,
                senha_hash TEXT NOT NULL,
                profissao TEXT,
                local TEXT,
                hashtags TEXT,
                avatar_url TEXT DEFAULT 'https://i.pinimg.com/236x/21/9e/ae/219eaea67aafa864db091919ce3f5d82.jpg',
                data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
                avaliacao_geral REAL DEFAULT 0.0,
                vendas_trocas INTEGER DEFAULT 0
            );
        `;
        
        // Executa a criação da tabela
        db.exec(sqlCreateTable, (err) => {
            if (err) {
                console.error("Erro ao criar tabela 'usuarios':", err.message);
            } else {
                console.log("Tabela 'usuarios' garantida.");

                // --- INICIA O SERVIDOR ---
                // O servidor só começa a "ouvir" DEPOIS que o banco
                // está pronto e a tabela foi verificada.
                app.listen(PORT, () => {
                    console.log(`Servidor rodando em http://localhost:${PORT}`);
                    console.log(`Acesse http://localhost:${PORT} no seu navegador.`);
                });
            }
        });
        
        // (Podemos adicionar a tabela 'servicos' aqui também para garantir)
        db.exec(`
            CREATE TABLE IF NOT EXISTS servicos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                titulo TEXT NOT NULL,
                descricao TEXT,
                categoria TEXT,
                tipo TEXT CHECK(tipo IN ('Troca', 'Venda')),
                valor REAL,
                habilidade_desejada TEXT,
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            );
        `, (err) => {
            if (!err) console.log("Tabela 'servicos' garantida.");
        });
    }
});

// ----------------------------------------------------
// FUNÇÕES DE AJUDA DO BANCO (Async/Await)
// ----------------------------------------------------
// O 'sqlite3' usa callbacks. Para usar async/await (como em 'await db.get'),
// precisamos "envelopar" as funções com Promises.

function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this); // Retorna { lastID, changes }
            }
        });
    });
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row); // Retorna a linha (ou undefined)
            }
        });
    });
}

function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows); // Retorna todas as linhas
            }
        });
    });
}

// ----------------------------------------------------
// ROTAS DA API DE USUÁRIOS
// ----------------------------------------------------

// POST: /api/usuarios/cadastro (Corrigido)
app.post('/api/usuarios/cadastro', async (req, res) => {
    const { primeiro_nome, sobrenome, email, senha } = req.body;

    if (!primeiro_nome || !email || !senha) {
        return res.status(400).json({ error: 'Primeiro nome, e-mail e senha são obrigatórios.' });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, saltRounds);
        const sql = 'INSERT INTO usuarios (primeiro_nome, sobrenome, email, senha_hash) VALUES (?, ?, ?, ?)';
        const params = [primeiro_nome, sobrenome, email, senhaHash];
        
        const result = await dbRun(sql, params); // <-- USA A FUNÇÃO DE AJUDA
        
        res.status(201).json({ 
            id: result.lastID, 
            nome: `${primeiro_nome} ${sobrenome || ''}`.trim(), 
            email: email, 
            message: 'Usuário cadastrado com sucesso.'
        });

    } catch (error) {
        if (error.errno === 19) { // SQLITE_CONSTRAINT (email já existe)
            return res.status(409).json({ error: 'O e-mail já está em uso.' });
        }
        console.error("Erro ao cadastrar:", error);
        res.status(500).json({ error: "Erro interno ao processar cadastro." });
    }
});

// POST: /api/usuarios/login (Corrigido e Seguro)
app.post('/api/usuarios/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // 1. Encontrar o usuário APENAS pelo e-mail
        const usuario = await dbGet('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // 2. Comparar a senha digitada com a senha_hash do banco
        const match = await bcrypt.compare(senha, usuario.senha_hash);

        if (!match) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // 3. Login bem-sucedido
        res.json({ 
            id: usuario.id, 
            nome: `${usuario.primeiro_nome} ${usuario.sobrenome || ''}`.trim(), 
            email: usuario.email, 
            message: 'Bem vindo ' + usuario.primeiro_nome + '!'
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: /api/usuarios (Corrigido)
// (Rota de admin, retorna todos os usuários)
app.get('/api/usuarios', async (req, res) => {
    try {
        const usuarios = await dbAll('SELECT id, primeiro_nome, sobrenome, email FROM usuarios');
        
        // Formata para o padrão "nome completo"
        const usuariosFormatados = usuarios.map(u => ({
            id: u.id,
            nome: `${u.primeiro_nome} ${u.sobrenome || ''}`.trim(),
            email: u.email
        }));
        
        res.json(usuariosFormatados);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: /api/usuarios/:id (Corrigido - Agora é 100% dinâmico)
// (Retorna os dados completos do perfil para a página de perfil)
app.get('/api/usuarios/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Seleciona TODOS os campos do perfil que o frontend precisa
        const query = `
            SELECT 
                id, primeiro_nome, sobrenome, email, 
                profissao, local, hashtags, avatar_url, 
                data_cadastro, avaliacao_geral, vendas_trocas
            FROM usuarios 
            WHERE id = ?
        `;
        const usuario = await dbGet(query, [userId]); // <-- USA A FUNÇÃO DE AJUDA

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        
        // Retorna o objeto de usuário completo (sem dados simulados)
        res.json(usuario);

    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        res.status(500).json({ error: error.message });
    }
});

// PUT: /api/usuarios/:id (Corrigido - Sintaxe SQLite e Lógica de Senha)
app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    
    // 1. Pegar dados do perfil
    const { 
        primeiro_nome, sobrenome, email, 
        profissao, local, hashtags, avatar_url,
        senha_atual, nova_senha // Campos para alterar senha
    } = req.body;

    try {
        // 2. Lógica de Atualização de Senha (se os campos foram enviados)
        if (nova_senha && senha_atual) {
            const usuario = await dbGet('SELECT senha_hash FROM usuarios WHERE id = ?', [id]);
            if (!usuario) return res.status(404).json({ error: "Usuário não encontrado." });

            const match = await bcrypt.compare(senha_atual, usuario.senha_hash);
            if (!match) {
                // Se a senha atual não bater, retorne um erro específico
                return res.status(403).json({ error: "Senha atual incorreta." });
            }

            // Se a senha atual bate, crie o novo hash e atualize
            const novaSenhaHash = await bcrypt.hash(nova_senha, saltRounds);
            await dbRun('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [novaSenhaHash, id]);
        }

        // 3. Lógica de Atualização de Perfil (sempre executa)
        const sql = `
            UPDATE usuarios SET 
                primeiro_nome = ?, 
                sobrenome = ?, 
                email = ?, 
                profissao = ?, 
                local = ?, 
                hashtags = ?,
                avatar_url = ?
            WHERE id = ?
        `;
        const params = [
            primeiro_nome,
            sobrenome,
            email,
            profissao,
            local,
            hashtags,
            avatar_url || 'https://i.pinimg.com/236x/219e/ae/219eaea67aafa864db091919ce3f5d82.jpg',
            id
        ];
        
        await dbRun(sql, params); // <-- USA A FUNÇÃO DE AJUDA

        // 4. Retornar a mensagem de sucesso
        res.json({ 
            message: "Perfil atualizado com sucesso!",
            nome: `${primeiro_nome} ${sobrenome || ''}`.trim()
        });

    } catch (error) {
        if (error.errno === 19) { // SQLITE_CONSTRAINT (email)
            return res.status(409).json({ error: "Este e-mail já está em uso por outra conta." });
        }
        console.error("Erro ao atualizar perfil:", error);
        res.status(500).json({ error: "Erro interno ao atualizar perfil." });
    }
});

// ----------------------------------------------------
// ROTAS DA API DE SERVIÇOS
// ----------------------------------------------------

// GET: /api/servicos/usuario/:usuarioId (Corrigido)
app.get('/api/servicos/usuario/:usuarioId', async (req, res) => {
    const usuarioId = req.params.usuarioId;

    try {
        const servicos = await dbAll(`
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

