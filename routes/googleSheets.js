const express = require('express');
const router = express.Router();
const axios = require('axios');

// URL del Google Apps Script (cambia esto por tu URL real)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/TU_SCRIPT_ID/exec';

// Ruta POST para enviar datos a Google Sheets
router.post('/', async (req, res) => {
  const { nombre, precio, stock } = req.body;

  try {
    // Enviar los datos a Google Sheets
    const response = await axios.post(GOOGLE_SCRIPT_URL, { nombre, precio, stock });
    res.status(200).json({ message: 'Datos guardados exitosamente', data: response.data });
  } catch (error) {
    console.error('Error al guardar en Google Sheets:', error);
    res.status(500).json({ message: 'Error al guardar en Google Sheets', error: error.message });
  }
});

module.exports = router;
