const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const cors = require('cors');
const app = express();

//variables
const PORT = process.env.PORT || 3050
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_NAME = process.env.DB_NAME || 'dblch';
const DB_PORT = process.env.DB_PORT || 3306;
const whiteList = ['http://localhost:4200', 'http://localhost:3000', 'https://railway-production-6d4e.up.railway.app/'];

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
    res.send('Bienvenido a la api de Biblioteca, Creado por GaboEh');
});


//all books
app.get('/libros', (req, res) => {
    const sql = 'SELECT libros.*, autores.nombre AS nombre_autor, editores.editor AS editorial, lugares.lugar AS lugares, paises.pais AS paises, idiomas.idioma AS idiomas, tipos.tipo AS tipos FROM libros INNER JOIN autores ON libros.autor = autores.id INNER JOIN editores ON libros.editor = editores.id INNER JOIN lugares ON libros.lugar = lugares.id INNER JOIN paises ON libros.pais = paises.id INNER JOIN idiomas ON libros.idioma = idiomas.id INNER JOIN tipos ON tipos.tipo = tipos.id;';

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

app.get('/libros/titulo/:titulo', (req, res) => {
    const { titulo } = req.params;
    const sql = `SELECT libros.*, autores.nombre AS nombre_autor, editores.editor AS editorial, lugares.lugar AS lugares FROM libros INNER JOIN autores ON libros.autor = autores.id INNER JOIN editores ON libros.editor = editores.id INNER JOIN lugares ON libros.lugar = lugares.id WHERE libros.titulo LIKE '%${titulo}%'`;

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
    const sql = 'SELECT * FROM autores';

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

app.get('/tipos', (req, res) => {
  const sql = 'SELECT * FROM tipos';

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

app.get('/consulta', (req, res) => {
    const consulta = req.query.q; // Obtener la consulta SQL de la URL
    connection.query(consulta, (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            res.status(500).json({ error: 'Error en la consulta' });
        return;
    }
    res.json(results);
    });
});


app.post('/libros', (req, res)=> {
    res.send('New book');
});

// app.put('/libros:id', (req, res)=> {
//     res.send('update books');
// });

app.delete('/libros:id', (req, res)=> {
    res.send('Delete book');
});


// Check connect
connection.connect(error => {
    if (error) throw error;
    console.log('database server running!');
});

// Middleware de error 404
app.use((req, res, next) => {
    res.status(404).json({
    message: "No se encontró la ruta solicitada"
    });
});

  // Middleware de error 500
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
    message: "Ha ocurrido un error en el servidor"
    });
});

app.listen(PORT, () => 
console.log(`Server running on port ${PORT}`));

module.exports.handler = serverless(app);
