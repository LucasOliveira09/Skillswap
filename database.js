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

    // Cria a tabela 'usuarios'
    await db.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha_hash TEXT NOT NULL  
        );
    `);

    console.log("Banco de dados 'skillswap.db' pronto.");
    return db;
}

module.exports = setupDatabase;