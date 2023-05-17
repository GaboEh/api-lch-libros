const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const cors = require('cors');
const app = express();

const corsOptions = {
    origin: ['https://bibliotecalch.netlify.app', 'http://localhost:4200'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(bodyParser.json());
app.use(cors(corsOptions));

//variables
const PORT = process.env.PORT || 3050;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_NAME = process.env.DB_NAME || 'dblch';
const DB_PORT = process.env.DB_PORT || 3306;

//Mysql
const connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT 
});

  // Route
const router = express.Router();
app.get('/', (req, res) => {
    res.send('Bienvenido a la API de Biblioteca, Creado por GaboEh');
});



//all books
app.get('/libros', (req, res) => {
    const sql = 'SELECT libros.*, autores.nombre AS nombre_autor, editores.editor AS editorial, lugares.lugar AS lugares, paises.pais AS paises, idiomas.idioma AS idiomas, tipos.tipo AS tipos FROM libros INNER JOIN autores ON libros.autor = autores.id INNER JOIN editores ON libros.editor = editores.id INNER JOIN lugares ON libros.lugar = lugares.id INNER JOIN paises ON libros.pais = paises.id INNER JOIN idiomas ON libros.idioma = idiomas.id INNER JOIN tipos ON libros.tipo = tipos.id;';

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


    //Instantiate the connection
    connection.connect(function (err) {
        if (err) {
            console.log(`connectionRequest Failed ${err.stack}`)
        } else {
            console.log(`DB connectionRequest Successful ${connection.threadId}`)
        }
    });



controllerMethod: (req, res, next) => {
    //Establish the connection on this request
    connection = connectionRequest()

    //Run the query
    connection.query("SELECT * FROM table", function (err, result, fields) {
        if (err) {
            // If an error occurred, send a generic server failure
            console.log(`not successful! ${err}`)
            connection.destroy();

        } else {
            //If successful, inform as such
            console.log(`Query was successful, ${result}`)

            //send json file to end user if using an API
            res.json(result)

            //destroy the connection thread
            connection.destroy();
        }
    });
}

// Middleware de error 500
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Ha ocurrido un error en el servidor"
    });
});
  // Rutas de libros y consultas de SQL (omitidas por brevedad)
  // Middleware de error 404
app.use((req, res, next) => {
    res.status(404).json({
        message: "No se encontró la ruta solicitada"
    });
});

  // Establecer conexión a la base de datos
connection.connect(function (err) {
    if (err) {
        console.log(`connectionRequest Failed ${err.stack}`)
    } else {
        console.log(`DB connectionRequest Successful ${connection.threadId}`)
    }
});

app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);

module.exports.handler = serverless(app);

  // Devolver objeto de conexión
return connection;
