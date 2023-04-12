const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const cors = require('cors');
const app = express();

//variables
const PORT = process.env.PORT || 3050;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_POR;
const whiteList = ['http://localhost:4200', 'http://localhost:3000', 'https://railway-production-6d4e.up.railway.app/'];

app.use(bodyParser.json());
app.use(cors({
    origin: whiteList
}));

//Mysql
const connection = mysql.createConnection({
    host: DB_HOST || 'containers.railway.app',
    user: DB_USER || 'root',
    password: DB_PASSWORD || 'bWOrGEveGMsXhtx0EjYu',
    database: DB_NAME || 'railway',
    port: DB_PORT || '7718'
});

//route
const router = express.Router();
app.get('/', (req, res) => {
    res.send('Hola desde Railway!');
});


//all books
app.get('/libros', (req, res) => {
    const sql = 'SELECT * FROM libros';

    connection.query(sql, (error, results) => {
    if (error) {
        console.error('Error en la consulta:', error);
        res.status(500).json({ error: 'Error en la consulta' });
        return;
    }
        if (results.length === 0) {
        res.status(404).json({ message: 'No se encontraron resultados' });
        return;
    }

    res.json(results);
    });
});

app.get('/autores', (req, res) => {
    const sql = 'select * from autores';

    connection.query(sql, (error, results) => {
        if (error) throw error;
        if(results.length > 0){
            res.json(results);
        }else {
            res.json('Not result');
        }
    });
});

app.get('/tipos', (req, res) => {
    const sql = 'select * from tipos';

    connection.query(sql, (error, results) => {
        if (error) throw error;
        if(results.length > 0){
            res.json(results);
        }else {
            res.json('Not result');
        }
    });
});

app.get('/libros:id', (req,res) =>{
    const {id} = req.params
    const sql = `SELECT * FROM libros WHERE id = ${id}`;
    connection.query(sql, (error, results) => {
        if (error) throw error;
        if(results.length > 0){
            res.json(results);
        }else {
            res.json('Not result');
        }
    });
});

app.get('/libros/pais:pais', (req,res) =>{
    const {pais} = req.params
    const sql = `SELECT * FROM libros WHERE pais = ${pais}`;
    connection.query(sql, (error, results) => {
        if (error) throw error;
        if(results.length > 0){
            res.json(results);
        }else {
            res.json('Not result');
        }
    });
});

app.post('/libros', (req, res)=> {
    res.send('New book');
});

app.put('/libros:id', (req, res)=> {
    res.send('update books');
});

app.delete('/libros:id', (req, res)=> {
    res.send('Delete book');
});


// Check connect
connection.connect(error => {
    if (error) throw error;
    console.log('database server running!');
});

app.listen(PORT, () => 
console.log(`Server running on port ${PORT}`));

module.exports.handler = serverless(app);