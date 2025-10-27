// server.js (Atualizado)

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DB_SOURCE = "skillswap.db";
const saltRounds = 10;

// ----------------------------------------------------
// MIDDLEWARE
// ----------------------------------------------------
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// ----------------------------------------------------
// CONEXÃO COM O BANCO DE DADOS
// ----------------------------------------------------
let db;

db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        console.error("Erro ao abrir banco de dados:", err.message);
        throw err;
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        
        // --- Garantir Tabela 'usuarios' (Sem alterações) ---
        const sqlCreateTableUsuarios = `
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
        
        db.exec(sqlCreateTableUsuarios, (err) => {
            if (err) {
                console.error("Erro ao criar tabela 'usuarios':", err.message);
            } else {
                console.log("Tabela 'usuarios' garantida.");
            }
        });
        
        // --- NOVA TABELA: 'produtos' ---
        // Esta tabela corresponde à estrutura do seu JSON estático
        const sqlCreateTableProdutos = `
            CREATE TABLE IF NOT EXISTS produtos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                nome TEXT NOT NULL,
                categoria TEXT,
                preco REAL,
                imagem TEXT,
                descricao TEXT,
                needs TEXT,
                postedAtMs INTEGER,
                location TEXT,
                schedule TEXT,
                groupSize TEXT,
                period TEXT,
                tradeCheck TEXT,
                include TEXT,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            );
        `;

        db.exec(sqlCreateTableProdutos, (err) => {
            if (err) {
                console.error("Erro ao criar tabela 'produtos':", err.message);
            } else {
                console.log("Tabela 'produtos' garantida.");
            }
        });

        // --- INICIA O SERVIDOR ---
        // (Movido para fora da callback de criação de tabela,
        // mas depois da inicialização do 'db')
    }
});

// O servidor começa a ouvir aqui, após a conexão ser estabelecida
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Acesse http://localhost:${PORT} no seu navegador.`);
});


// ----------------------------------------------------
// FUNÇÕES DE AJUDA DO BANCO (Async/Await)
// (Sem alterações)
// ----------------------------------------------------
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
// (Sem alterações)
// ----------------------------------------------------

// POST: /api/usuarios/cadastro
app.post('/api/usuarios/cadastro', async (req, res) => {
    const { primeiro_nome, sobrenome, email, senha } = req.body;

    if (!primeiro_nome || !email || !senha) {
        return res.status(400).json({ error: 'Primeiro nome, e-mail e senha são obrigatórios.' });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, saltRounds);
        const sql = 'INSERT INTO usuarios (primeiro_nome, sobrenome, email, senha_hash) VALUES (?, ?, ?, ?)';
        const params = [primeiro_nome, sobrenome, email, senhaHash];
        
        const result = await dbRun(sql, params); 
        
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

// POST: /api/usuarios/login
app.post('/api/usuarios/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await dbGet('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const match = await bcrypt.compare(senha, usuario.senha_hash);

        if (!match) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

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

// GET: /api/usuarios
app.get('/api/usuarios', async (req, res) => {
    try {
        const usuarios = await dbAll('SELECT id, primeiro_nome, sobrenome, email FROM usuarios');
        
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

// GET: /api/usuarios/:id
app.get('/api/usuarios/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const query = `
            SELECT 
                id, primeiro_nome, sobrenome, email, 
                profissao, local, hashtags, avatar_url, 
                data_cadastro, avaliacao_geral, vendas_trocas
            FROM usuarios 
            WHERE id = ?
        `;
        const usuario = await dbGet(query, [userId]); 

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        
        res.json(usuario);

    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        res.status(500).json({ error: error.message });
    }
});

// PUT: /api/usuarios/:id
app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    
    const { 
        primeiro_nome, sobrenome, email, 
        profissao, local, hashtags, avatar_url,
        senha_atual, nova_senha 
    } = req.body;

    try {
        if (nova_senha && senha_atual) {
            const usuario = await dbGet('SELECT senha_hash FROM usuarios WHERE id = ?', [id]);
            if (!usuario) return res.status(404).json({ error: "Usuário não encontrado." });

            const match = await bcrypt.compare(senha_atual, usuario.senha_hash);
            if (!match) {
                return res.status(403).json({ error: "Senha atual incorreta." });
            }

            const novaSenhaHash = await bcrypt.hash(nova_senha, saltRounds);
            await dbRun('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [novaSenhaHash, id]);
        }

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
            avatar_url || 'https://i.pinimg.com/236x/21/9e/ae/219eaea67aafa864db091919ce3f5d82.jpg',
            id
        ];
        
        await dbRun(sql, params); 

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
// ROTAS DA API DE PRODUTOS (NOVO)
// ----------------------------------------------------

/**
 * GET: /api/produtos
 * Retorna TODOS os produtos/serviços para a página principal.
 * Já inclui os dados do autor (nome, avatar, estrelas) da tabela 'usuarios'.
 */
app.get('/api/produtos', async (req, res) => {
    const sql = `
        SELECT 
            p.id,
            p.nome,
            p.categoria,
            p.preco,
            p.imagem,
            p.descricao,
            p.needs,
            p.postedAtMs,
            p.location,
            p.schedule,
            p.groupSize,
            p.period,
            p.tradeCheck,
            p.include,
            u.id as authorId,
            u.primeiro_nome,
            u.sobrenome,
            u.avatar_url as authorAvatar,
            u.avaliacao_geral as stars
        FROM produtos p
        JOIN usuarios u ON p.usuario_id = u.id
        ORDER BY p.postedAtMs DESC
    `;
    try {
        const rows = await dbAll(sql);
        
        // Formata os dados para bater EXATAMENTE com o que a função card(p) espera
        const produtos = rows.map(p => ({
            id: p.id,
            nome: p.nome,
            categoria: p.categoria,
            preco: p.preco,
            imagem: p.imagem,
            descricao: p.descricao,
            authorAvatar: p.authorAvatar,
            authorName: `${p.primeiro_nome} ${p.sobrenome || ''}`.trim(),
            authorId: p.authorId,
            stars: p.stars,
            needs: JSON.parse(p.needs || '[]'), // Converte string JSON para array
            postedAtMs: p.postedAtMs,
            location: p.location,
            schedule: p.schedule,
            group: p.groupSize, // Mapeia p.groupSize -> p.group
            period: JSON.parse(p.period || '[]'), // Converte string JSON para array
            tradeCheck: p.tradeCheck,
            include: JSON.parse(p.include || '[]') // Converte string JSON para array
        }));

        res.json(produtos);
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST: /api/produtos
 * Cria (anuncia) um novo produto/serviço no banco de dados.
 */
app.post('/api/produtos', async (req, res) => {
    // Em um app real, o 'usuario_id' viria de um token de autenticação (JWT).
    // Por enquanto, o frontend deve enviá-lo no corpo da requisição.
    const {
        usuario_id, // <-- ID do usuário logado
        nome,
        categoria,
        preco,
        imagem,
        descricao,
        needs,
        location,
        schedule,
        group, // 'group' vem do frontend
        period,
        tradeCheck,
        include
    } = req.body;

    if (!usuario_id || !nome || !categoria || !preco) {
        return res.status(400).json({ error: 'ID do usuário, nome, categoria e preço são obrigatórios.' });
    }

    const sql = `
        INSERT INTO produtos (
            usuario_id, nome, categoria, preco, imagem, descricao, 
            needs, postedAtMs, location, schedule, groupSize, period, tradeCheck, include
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const postedAt = Date.now();
    const params = [
        usuario_id,
        nome,
        categoria,
        preco,
        imagem || './img/placeholder.jpg', // Imagem padrão
        descricao,
        JSON.stringify(needs || []), // Salva array como string JSON
        postedAt,
        location,
        schedule,
        group, // Salva o valor de 'group' em 'groupSize'
        JSON.stringify(period || []), // Salva array como string JSON
        tradeCheck || 'No',
        JSON.stringify(include || []) // Salva array como string JSON
    ];

    try {
        const result = await dbRun(sql, params);
        
        // Retorna o produto recém-criado para o frontend
        res.status(201).json({ 
            id: result.lastID,
            message: "Produto anunciado com sucesso!",
            ...req.body,
            postedAtMs: postedAt 
        });
    } catch (error) {
        console.error("Erro ao anunciar produto:", error);
        res.status(500).json({ error: error.message });
    }
});