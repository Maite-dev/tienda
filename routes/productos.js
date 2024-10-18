const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

// Rutas relacionadas con productos

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Obtener producto por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM productos WHERE "ID" = $1', [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Actualizar un producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock } = req.body;

  if (!nombre || precio === undefined || stock === undefined) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    const result = await pool.query(
      'UPDATE productos SET nombre = $1, precio = $2, stock = $3 WHERE "ID" = $4',
      [nombre, precio, stock, id]
    );

    if (result.rowCount > 0) {
      res.json({ message: 'Producto actualizado correctamente' });
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Agregar un nuevo producto
router.post('/', async (req, res) => {
  const { nombre, precio, stock } = req.body;

  if (!nombre || !precio || !stock) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    const query = 'INSERT INTO productos (nombre, precio, stock) VALUES ($1, $2, $3) RETURNING *';
    const values = [nombre, precio, stock];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ error: 'Error al agregar producto' });
  }
});

module.exports = router;
