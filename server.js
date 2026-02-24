const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
// Serve os arquivos estáticos (Frontend) a partir da pasta 'public'
app.use(express.static(path.join(__dirname, 'public'))); 

// Inicializa o Banco de Dados
const db = new sqlite3.Database('./loja-games.db', (err) => {
    if (err) console.error('Erro ao conectar ao banco de dados:', err.message);
    else console.log('Conectado ao banco de dados SQLite.');
});

// Cria a tabela de produtos e insere dados iniciais
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        categoria TEXT NOT NULL,
        preco REAL NOT NULL,
        imagem TEXT NOT NULL
    )`);

    // Inserindo produtos de exemplo caso o banco esteja vazio
    db.get("SELECT COUNT(*) AS count FROM produtos", (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO produtos (nome, categoria, preco, imagem) VALUES (?, ?, ?, ?)");
            stmt.run("PlayStation 5", "Console", 3999.99, "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=300&q=80");
            stmt.run("Elden Ring (PS5)", "Jogo", 299.90, "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=300&q=80");
            stmt.run("Xbox Series X", "Console", 4299.00, "https://images.unsplash.com/photo-1621259403767-1428574ab83c?auto=format&fit=crop&w=300&q=80");
            stmt.run("Controle DualSense", "Acessório", 450.00, "https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?auto=format&fit=crop&w=300&q=80");
            stmt.finalize();
        }
    });
});

// Rota (API) para buscar todos os produtos
app.get('/api/produtos', (req, res) => {
    db.all("SELECT * FROM produtos", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
