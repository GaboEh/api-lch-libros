const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const cors = require('cors');
const app = express();

//variables
const PORT = process.env.PORT || 3050;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_NAME = process.env.DB_NAME || 'dblch';
const DB_PORT = process.env.DB_PORT || 3306;
const whiteList = ['http://localhost:4200', 'http://localhost:3000'];

app.use(bodyParser.json());
app.use(cors({
    origin: whiteList
}));

//Mysql
const connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT
});

//route
const router = express.Router();
app.get('/', (req, res) => {
    res.send('Hola desde Railway!');
});


//all customers
app.get('/libros', (req, res) => {
    const sql = 'select * from libros';

    connection.query(sql, (error, results) => {
        if (error) throw error;
        if(results.length > 0){
            res.json(results);
        }else {
            res.json('Not result');
        }
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