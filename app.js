const express = require('express');

const { engine } = require('express-handlebars')

const mysql = require('mysql2');

const app = express();

app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'))

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

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
    res.render('pagina-login')
})

app.listen(8080);