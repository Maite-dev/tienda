const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const cors = require('cors'); // Agregando CORS
require('dotenv').config();

const app = express();
const port = 3000;

// Configuración de CORS para permitir solicitudes desde otros orígenes
app.use(cors());

// Middleware para interpretar JSON
app.use(express.json());

// Middleware para servir archivos estáticos (HTML, CSS, JS)
app.use(express.static('public')); // Asegúrate de que tus archivos estáticos estén en la carpeta 'public'

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

// Middleware para manejar errores
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
}

app.use(errorHandler);

// Configuración de multer para manejar la carga de archivos
const upload = multer({ dest: 'uploads/' });

// Ruta para la raíz
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html'); // Asegúrate de que el HTML esté en la carpeta 'public'
});

// Ruta para obtener productos
app.get('/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Ruta para agregar uno o varios productos
app.post('/productos', async (req, res) => {
  const productos = req.body; // Aquí se espera un array de productos

  // Verifica si el cuerpo de la solicitud es un array
  if (!Array.isArray(productos)) {
    return res.status(400).json({ error: 'Se esperaba un array de productos.' });
  }

  try {
    // Inicia una transacción
    await pool.query('BEGIN');
    for (const producto of productos) {
      const { nombre, precio, stock } = producto;
      await pool.query('INSERT INTO productos (nombre, precio, stock) VALUES ($1, $2, $3)', [nombre, precio, stock]);
    }
    // Si todo fue bien, confirma la transacción
    await pool.query('COMMIT');
    res.status(201).json({ message: 'Productos agregados exitosamente.' });
  } catch (error) {
    console.error('Error al agregar productos:', error);
    await pool.query('ROLLBACK'); // Reversa la transacción en caso de error
    res.status(500).json({ error: 'Error al agregar productos' });
  }
});

// Ruta para cargar productos desde un archivo CSV
app.post('/cargar-csv', upload.single('csvFile'), (req, res) => {
  const results = [];

  // Procesar el archivo CSV
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log('Resultados del CSV:', results); // Añadir este log para depurar
      // Agregar los productos a la base de datos
      try {
        await pool.query('BEGIN'); // Iniciar transacción
        for (const producto of results) {
          const { Nombre, Precio, Stock } = producto; // Asegúrate de que estos son los nombres correctos
          await pool.query('INSERT INTO productos (nombre, precio, stock) VALUES ($1, $2, $3)', [Nombre, Precio, Stock]);
        }
        await pool.query('COMMIT'); // Confirmar transacción
        fs.unlinkSync(req.file.path); // Eliminar el archivo CSV después de procesarlo
        res.status(200).send('Productos cargados desde CSV.');
      } catch (error) {
        console.error('Error al agregar productos desde CSV:', error);
        await pool.query('ROLLBACK'); // Reversa la transacción en caso de error
        res.status(500).send('Error al procesar el archivo CSV.');
      }
    })
    .on('error', (error) => {
      console.error('Error al procesar el archivo CSV:', error);
      res.status(500).send('Error al procesar el archivo CSV.');
    });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
