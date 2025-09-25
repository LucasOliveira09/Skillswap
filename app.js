const express = require('express');

const mysql = require('mysql2');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

const conexao = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'skillswap'
});

conexao.connect(function(erro){
    if(erro) throw erro;
    console.log('conexao efetuada')
})

//rota

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/pagina-login.html');
})

app.post('/cadastrar', function(req, res){
    
    const { nome, email, senha } = req.body;

    
    const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';

    const valores = [nome, email, senha];

    conexao.query(sql, valores, function(erro, resultados){
        if(erro) {
            console.error('Erro ao cadastrar usuário:', erro);
            
            return res.send('Erro ao realizar cadastro.');
        }

        
        const novoId = resultados.insertId;

        console.log(`Usuário ${nome} cadastrado com sucesso! ID gerado: ${novoId}`);

        
        res.redirect('/');
    });
});

app.listen(8080);