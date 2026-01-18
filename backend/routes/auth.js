// Importa Express y crea un router modular
const express = require("express")
const router = express.Router()

// Importa el modelo de usuario de MongoDB
const User = require("../models/User")

// Crypto se usa para generar tokens aleatorios y hashes seguros
const crypto = require("crypto")
const { sendVerificationCode, sendPasswordResetLink } = require("../utils/emailService")

// ==========================
// RUTA: /register
// Endpoint para registrar un usuario
// ==========================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Valida que todos los campos requeridos estén presentes
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Por favor completa todos los campos",
      })
    }

    // Verifica si ya existe un usuario con ese email
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        message: "Este email ya está registrado",
      })
    }

    // Crea un nuevo usuario
    const user = new User({
      name,
      email,
      password,
    })

    await user.save() // Guarda en la base de datos

    res.status(201).json({
      message: "Usuario creado exitosamente",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al crear la cuenta",
    })
  }
})

// ==========================
// RUTA: /login
// Endpoint para iniciar sesión
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Valida campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        message: "Por favor completa todos los campos",
      })
    }

    // Busca usuario por email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        message: "Email o contraseña incorrectos",
      })
    }

    // Valida la contraseña usando método del modelo
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Email o contraseña incorrectos",
      })
    }

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al iniciar sesión",
    })
  }
})

// ==========================
// RUTA: /forgot-password
// Genera token de recuperación de contraseña
// ==========================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email es requerido" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      // No revelamos si existe o no el usuario
      return res.json({ message: "Si el email existe, recibirás instrucciones" })
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000 

    await user.save()

    const emailResult = await sendPasswordResetLink(user.email, resetToken, user.name)

    if (!emailResult.success) {
      return res.status(500).json({
        message: "Error al enviar el email de recuperación",
      })
    }

    res.json({
      message: "Enlace de recuperación enviado a tu email",
      email: user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al procesar solicitud",
    })
  }
})

// ==========================
// RUTA: /reset-password
// Resetea la contraseña usando token
// ==========================
router.post("/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: "Token y nueva contraseña son requeridos" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" })
    }

    // Convierte token a hash para comparar con DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
    })


    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado" })
    }

    // Actualiza la contraseña
    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: "Contraseña actualizada correctamente" })
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar contraseña",
    })
  }
})

// Exporta el router para usar en app.js o server.js
module.exports = router
