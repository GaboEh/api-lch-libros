const mysql = require('mysql2');
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();
const corsOptions = {
  origin: ['https://bibliotecalch.netlify.app', 'http://localhost:4200'],
  optionsSuccessStatus: 200
};

app.use(express.json());
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3050;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_NAME = process.env.DB_NAME || 'dblch';
const DB_PORT = process.env.DB_PORT || 3306;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  connectionLimit: 10
});

function getConnection(callback) {
  pool.getConnection(function (err, connection) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, connection);
    }
  });
}

const handleDatabaseError = (res, error) => {
  console.error('Error en la consulta:', error);
  res.status(500).json({ error: 'Error en la consulta' });
};

// Route
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Bienvenido a la API de Biblioteca, Creado por GaboEh');
});

router.get('/libros', (req, res) => {
  const sql = 'SELECT libros.*, autores.nombre AS nombre_autor, editores.editor AS editorial, lugares.lugar AS lugares, paises.pais AS paises, idiomas.idioma AS idiomas, tipos.tipo AS tipos FROM libros INNER JOIN autores ON libros.autor = autores.id INNER JOIN editores ON libros.editor = editores.id INNER JOIN lugares ON libros.lugar = lugares.id INNER JOIN paises ON libros.pais = paises.id INNER JOIN idiomas ON libros.idioma = idiomas.id INNER JOIN tipos ON libros.tipo = tipos.id;';

  getConnection((err, connection) => {
    if (err) {
      console.error('Error en la conexión:', err);
      res.status(500).json({ error: 'Error en la conexión' });
      return;
    }

    connection.query(sql, (error, results) => {
      connection.release();

      if (error) {
        handleDatabaseError(res, error);
        return;
      }

      if (results.length === 0) {
        res.status(404).json({ message: 'No se encontraron resultados' });
        return;
      }

      res.json(results);
    });
  });
});

router.get('/libros/titulo/:titulo', (req, res) => {
  const { titulo } = req.params;
  const sql = `SELECT libros.*, autores.nombre AS nombre_autor, editores.editor AS editorial, lugares.lugar AS lugares FROM libros INNER JOIN autores ON libros.autor = autores.id INNER JOIN editores ON libros.editor = editores.id INNER JOIN lugares ON libros.lugar = lugares.id WHERE libros.titulo LIKE '%${titulo}%'`;

  getConnection((err, connection) => {
    if (err) {
      console.error('Error en la conexión:', err);
      res.status(500).json({ error: 'Error en la conexión' });
      return;
    }

    connection.query(sql, (error, results) => {
      connection.release();

      if (error) {
        handleDatabaseError(res, error);
        return;
      }

      if (results.length === 0) {
        res.status(404).json({ message: 'No se encontraron resultados' });
        return;
      }

      res.json(results);
    });
  });
});

// Resto de las rutas...

app.use('/api', router);

// Middleware de error 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Ha ocurrido un error en el servidor"
  });
});

// Middleware de error 404
app.use((req, res, next) => {
  res.status(404).json({
    message: "No se encontró la ruta solicitada"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports.handler = serverless(app);