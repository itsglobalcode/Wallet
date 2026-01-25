// Importamos Express para crear el servidor
const express = require("express")

// Importamos Mongoose para conectar con MongoDB
const mongoose = require("mongoose")

// Importamos CORS para permitir peticiones desde otros dominios (frontend)
const cors = require("cors")

// Cargamos variables de entorno desde el archivo .env
require("dotenv").config()

const { verifyEmailConfig } = require("./utils/emailService")

// Creamos la app de Express
const app = express()

// =====================
// Middlewares
// =====================

// Permite que el frontend pueda hacer peticiones al backend
app.use(cors())

// Permite leer JSON en las peticiones (req.body)
app.use(express.json())

// =====================
// Conexión a MongoDB
// =====================

// Conectamos a MongoDB usando la URI del archivo .env
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    verifyEmailConfig()
  })
  .catch((err) => {})


// =====================
// Rutas
// =====================

// Todas las rutas de autenticación empiezan por /api/auth
const authRoutes = require("./routes/auth")
app.use("/api/auth", authRoutes)

// Todas las rutas para el usuario empiezan por /api/user
app.use("/api/user", require("./routes/user"))

// Tpdas las rutas para el wallet empiezan por /api/wallet
app.use("/api/wallet", require("./routes/wallet"))

// Tpdas las rutas para el wallet empiezan por /api/search
app.use("/api/search", require("./routes/search"))

// =====================
// Ruta raíz
// =====================

// Endpoint de prueba para ver si la API funciona
app.get("/", (req, res) => {
  res.json({ message: "NOMAD API funcionando correctamente" })
})

// =====================
// Arranque del servidor
// =====================

// Puerto del servidor (por defecto 3000)
const PORT = process.env.PORT || 3000

// Iniciamos el servidor
app.listen(PORT)
