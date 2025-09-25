const express = require('express');

const mysql = require('mysql2');

const app = express();

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

app.listen(8080);