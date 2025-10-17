// database.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function setupDatabase() {
    const dbPath = path.resolve(__dirname, 'skillswap.db');

    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // Cria a tabela 'usuarios' (EXISTENTE)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha_hash TEXT NOT NULL 
        );
    `);

    // NOVA TABELA: Cria a tabela 'servicos'
    await db.exec(`
        CREATE TABLE IF NOT EXISTS servicos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            titulo TEXT NOT NULL,
            descricao TEXT NOT NULL,
            categoria TEXT,
            tipo TEXT CHECK(tipo IN ('Troca', 'Venda')) NOT NULL,
            valor REAL, -- Usado para 'Venda'
            habilidade_desejada TEXT, -- Usado para 'Troca'
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );
    `);
    
    console.log("Banco de dados 'skillswap.db' pronto.");
    return db;
}

module.exports = setupDatabase;