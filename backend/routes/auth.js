// Importa Express y crea un router modular
const express = require("express")
const router = express.Router()

// Importa el modelo de usuario de MongoDB
const User = require("../models/User")

// Crypto se usa para generar tokens aleatorios y hashes seguros
const crypto = require("crypto")
const { sendVerificationCode } = require("../utils/emailService")

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

        const code = Math.floor(100000 + Math.random() * 900000).toString()
        user.twoFactor.emailCode = code
        user.twoFactor.codeExpires = Date.now() + 5 * 60 * 1000
        await user.save()

        const emailResult = await sendVerificationCode(user.email, code, user.name)

        if (!emailResult.success) {
            console.error("Error enviando email:", emailResult.error)
            return res.status(500).json({
                message: "Error al enviar el email. Verifica la configuración del servidor de email.",
                error: emailResult.error,
                userId: user._id,
            })
        }

        // Retorna éxito con indicación de que debe verificar email
        res.status(201).json({
            message: "Usuario creado exitosamente",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            requires2FA: true,
            email: user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
        })
    } catch (error) {
        console.error("Register error:", error)
        res.status(500).json({
            message: "Error al crear la cuenta",
            error: error.message,
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
        if (!user.twoFactor.enabled) {
            // Generar y enviar código
            const code = Math.floor(100000 + Math.random() * 900000).toString()
            user.twoFactor.emailCode = code
            user.twoFactor.codeExpires = Date.now() + 5 * 60 * 1000
            await user.save()
            await sendVerificationCode(user.email, code, user.name)
            return res.status(200).json({
                requires2FA: true,
                userId: user._id,
                message: "Código de verificación enviado a tu email",
                email: user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
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
        console.error("Login error:", error)
        res.status(500).json({
            message: "Error al iniciar sesión",
            error: error.message,
        })
    }
})

// ==========================
// RUTA: /2fa/setup
// Configura 2FA para un usuario
// ==========================
router.post("/2fa/setup", async (req, res) => {
    try {
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({ message: "userId es requerido" })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" })
        }

        // Genera un secreto para 2FA
        const secret = Math.floor(100000 + Math.random() * 900000).toString()

        // Guarda el secreto en la base de datos del usuario
        user.twoFactor.secret = secret
        await user.save()

        // Retorna éxito
        res.json({
            message: "2FA configurado correctamente",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        })
    } catch (error) {
        console.error("2FA setup error:", error)
        res.status(500).json({
            message: "Error al configurar 2FA",
            error: error.message,
        })
    }
})

// ==========================
// RUTA: /2fa/send-code
// Envía código 2FA por email
// ==========================
router.post("/2fa/send-code", async (req, res) => {
    try {
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({ message: "userId es requerido" })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" })
        }

        // Generar código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString()

        // Guardar código y expiración (5 minutos)
        user.twoFactor.emailCode = code
        user.twoFactor.codeExpires = Date.now() + 5 * 60 * 1000
        await user.save()

        // Enviar email
        const emailResult = await sendVerificationCode(user.email, code, user.name)

        if (!emailResult.success) {
            return res.status(500).json({
                message: "Error al enviar el email. Verifica la configuración.",
                error: emailResult.error,
            })
        }

        res.json({
            message: "Código enviado a tu email",
            email: user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3"), // Ocultar email parcialmente
        })
    } catch (error) {
        console.error("Send code error:", error)
        res.status(500).json({
            message: "Error al enviar código",
            error: error.message,
        })
    }
})

// ==========================
// RUTA: /2fa/verify
// Verifica el código 2FA y activa 2FA
// ==========================
router.post("/2fa/verify", async (req, res) => {
    try {
        const { userId, token } = req.body

        if (!userId || !token) {
            return res.status(400).json({ message: "userId y token son requeridos" })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" })
        }

        if (!user.twoFactor.emailCode) {
            return res.status(400).json({ message: "No hay código pendiente. Solicita uno nuevo." })
        }

        // Verificar si el código expiró
        if (user.twoFactor.codeExpires < Date.now()) {
            return res.status(400).json({ message: "El código ha expirado. Solicita uno nuevo." })
        }

        // Verificar código
        if (user.twoFactor.emailCode !== token) {
            return res.status(400).json({ message: "Código incorrecto. Intenta de nuevo." })
        }

        // Activar 2FA y limpiar código
        user.twoFactor.enabled = true
        user.twoFactor.emailCode = null
        user.twoFactor.codeExpires = null
        await user.save()

        res.json({
            message: "2FA activado correctamente",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                twoFactorEnabled: true,
            },
        })
    } catch (error) {
        console.error("2FA verify error:", error)
        res.status(500).json({
            message: "Error al verificar 2FA",
            error: error.message,
        })
    }
})

// ==========================
// RUTA: /login/2fa
// Login usando código 2FA
// ==========================
router.post("/login/2fa", async (req, res) => {
    try {
        const { userId, token } = req.body

        if (!userId || !token) {
            return res.status(400).json({ message: "userId y token son requeridos" })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" })
        }

        if (user.twoFactor.enabled) {
            return res.status(400).json({ message: "2FA no está habilitado" })
        }

        // Verificar expiración
        if (user.twoFactor.codeExpires < Date.now()) {
            return res.status(400).json({ message: "El código ha expirado. Solicita uno nuevo." })
        }

        // Verificar código
        if (user.twoFactor.emailCode !== token) {
            return res.status(401).json({ message: "Código incorrecto" })
        }

        // Limpiar código usado
        user.twoFactor.emailCode = null
        user.twoFactor.codeExpires = null
        await user.save()

        res.json({
            message: "Login exitoso",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        })
    } catch (error) {
        console.error("2FA login error:", error)
        res.status(500).json({
            message: "Error al verificar 2FA",
            error: error.message,
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

        // Genera token aleatorio y hash
        const resetToken = crypto.randomBytes(32).toString("hex")
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000 // 10 minutos

        await user.save()

        // En producción se enviaría un email. Aquí lo retornamos solo para testing
        res.json({
            message: "Token de recuperación generado",
            resetToken, // REMOVE en producción
            userId: user._id,
        })
    } catch (error) {
        console.error("Forgot password error:", error)
        res.status(500).json({
            message: "Error al procesar solicitud",
            error: error.message,
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
            resetPasswordExpires: { $gt: Date.now() }, // Verifica expiración
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
        console.error("Reset password error:", error)
        res.status(500).json({
            message: "Error al actualizar contraseña",
            error: error.message,
        })
    }
})

// ==========================
// RUTA: /get-2fa
// Obtiene la información del usuario
// ==========================

router.get("/get-2fa", async (req, res) => {
    try {
        const userId = req.query.user_id;
        if (!userId) return res.status(400).json({ message: "user_id requerido" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json({ twoFactorEnabled: user.twoFactor.enabled }); // devuelve el usuario
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al obtener la información del usuario" });
    }
});

// ==========================
// RUTA: /desactivate-2fa
// Desactiva el 2FA
// ========================== 

router.put("/desactivate-2fa", async (req, res) => {
    try {
        const userId = req.body.userId;
        if (!userId) return res.status(400).json({ message: "user_id requerido" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        user.twoFactor.enabled = false;
        console.log(user)
        await user.save();

        res.json({ message: "2FA desactivado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al desactivar el 2FA" });
    }
})

// Exporta el router para usar en app.js o server.js
module.exports = router 
