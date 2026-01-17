// Importa Express y crea un router modular
const express = require("express")
const router = express.Router()

// Importamos mongoose
const mongoose = require("mongoose");

// Importamos CORS para permitir peticiones desde otros dominios (frontend)
const cors = require('cors');

// Cargamos variables de entorno desde el archivo .env
require('dotenv').config();

// Creamos la app de Express
const app = express();

// =====================
// Middlewares
// =====================

// Permite que el frontend pueda hacer peticiones al backend
app.use(cors());

// Permite leer JSON en las peticiones (req.body)
app.use(express.json());

// Importa el modelo de usuario    
const User = require("../models/User");

// ==========================
// RUTA: /get-info
// Obtiene la información del usuario
// ==========================
router.get("/get_info", async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ message: "user_id requerido" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user); // devuelve el usuario
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener la información del usuario" });
  }
});

module.exports = router;