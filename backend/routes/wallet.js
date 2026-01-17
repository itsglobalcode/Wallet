const express = require("express")
const router = express.Router()

const User = require("../models/User")
const { Wallet, SpendingMovement, Category, InviteToWallet } = require("../models/Wallet")

const crypto = require("crypto")

const { sendWalletInvitationEmail } = require("../utils/emailService")

// =========================
// GET /wallets?userId=
// Obtener wallets de un usuario
// =========================
router.get("/check_wallets", async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: "Falta userId" })

    const wallets = await Wallet.find({
      users: userId,
      archived: false,
    })

    res.json({ wallets })
  } catch (err) {
    res.status(500).json({ error: "Error al obtener wallets" })
  }
})

// =========================
// POST /wallets
// Crear wallet - Siempre crea wallet personal, se comparte desde el SVG
// =========================
router.post("/wallets", async (req, res) => {
  try {
    const { userId, name, currency, icon } = req.body
    if (!userId || !name) {
      return res.status(400).json({ error: "Faltan datos obligatorios" })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" })

    const wallet = await Wallet.create({
      users: [userId],
      name,
      currency: currency || "EUR",
      icon: icon || "wallet",
    })

    res.status(201).json({ wallet })
  } catch (err) {
    res.status(500).json({ error: "Error al crear wallet" })
  }
})

// =========================
// POST /invite
// Invitar usuario a wallet
// =========================
router.post("/invite", async (req, res) => {
  try {
    const { walletId, userId, inviteId } = req.body
    console.log(walletId, userId, inviteId)
    if (!walletId || !userId) {
      return res.status(400).json({ error: "Faltan datos obligatorios" })
    }

    const wallet = await Wallet.findById(walletId)
    if (!wallet) return res.status(404).json({ error: "Wallet no encontrado" })

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" })

    const inviter = await User.findById(inviteId)
    if (!inviter) return res.status(404).json({ error: "Usuario que invita no encontrado" })

    const inv = await InviteToWallet.find({
      wallet: walletId,
      user: userId,
    })

    if (inv.length > 0) {
      if (inv.status === "pending" || inv.status === "accepted") {
        return res.status(400).json({ error: "Usuario ya invitado" })
      }
    }

    const invite = await InviteToWallet.create({
      wallet: walletId,
      user: userId,
    })

    console.log(invite)

    await invite.save()

    const success = await sendWalletInvitationEmail({
      email: user.email,
      invitedUserName: user.name,
      inviterName: inviter.name,
      walletName: wallet.name,
      acceptUrl: `http://localhost:8081/accept?id=${invite._id}&token=${invite.token}`,
    })

    if (!success) {
      return res.status(500).json({ error: "Error al enviar email de invitación" })
    }

    res.json({ invite })
  } catch (err) {
    res.status(500).json({ error: "Error al invitar usuario" })
  }
})

// =========================
// PUT /accept-invite
// Aceptar invitación a wallet con token seguro
// =========================
router.put("/accept-invite", async (req, res) => {
  try {
    const { inviteId, token } = req.body

    if (!token) {
      return res.status(400).send("Token de invitación faltante")
    }

    // Buscar la invitación
    const invite = await InviteToWallet.findById(inviteId).populate("wallet").populate("user")

    if (!invite) {
      return res.status(404).send("Invitación no encontrada")
    }

    if (invite.status !== "pending") {
      return res.status(400).send("Invitación ya procesada")
    }

    if (invite.token !== token) {
      return res.status(403).send("Token inválido o expirado")
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return res.status(400).send("Invitación expirada")
    }

    const wallet = await Wallet.findById(invite.wallet._id)
    if (!wallet.users.includes(invite.user._id)) {
      wallet.users.push(invite.user._id)
      await wallet.save()
    }

    invite.status = "accepted"
    await invite.save()
  } catch (err) {
    console.error("ACCEPT INVITE ERROR:", err)
    res.status(500).send("Error al aceptar invitación")
  }
})

// =========================
// GET /get-wallet
// Obtener wallet
// =========================
router.get("/get-wallet", async (req, res) => {
  try {
    const { id } = req.query
    const wallet = await Wallet.findById(id).populate("users")
    if (!wallet) return res.status(404).json({ error: "Wallet no encontrado" })

    res.json(wallet)
  } catch {
    res.status(500).json({ error: "Error del servidor" })
  }
})

// =========================
// PUT /edit-wallet
// Editar valores por defecto del wallet
// =========================
router.put("/edit-wallet", async (req, res) => {
  try {
    const { id, name, currency, budget } = req.body
    console.log(id, name, currency, budget)
    if (!id || !name || !currency) {
      return res.status(400).json({ error: "Faltan datos obligatorios" })
    }

    const wallet = await Wallet.findById(id)
    console.log(wallet)

    wallet.name = name
    wallet.currency = currency
    wallet.budget = budget
    console.log(wallet)

    await wallet.save()

    res.json({ wallet })
  } catch (err) {
    console.error("EDIT WALLET ERROR:", err)
    res.status(500).json({ error: "Error al editar wallet" })
  }
})

// =========================
// DELETE /delete-wallet
// Archivar wallet (soft delete)
// =========================
router.delete("/delete-wallet", async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.body.id)
    if (!wallet) return res.status(404).json({ error: "Wallet no encontrado" })

    wallet.archived = true
    await wallet.save()

    res.json({ message: "Wallet archivado" })
  } catch {
    res.status(500).json({ error: "Error del servidor" })
  }
})

// =========================
// GET /wallet/:id/movements
// =========================
router.get("/wallet/:id/movements", async (req, res) => {
  try {
    const movements = await SpendingMovement.find({
      wallet: req.params.id,
      archived: false,
    })
      .populate("category")
      .populate("user")

    res.json({ movements })
  } catch {
    res.status(500).json({ error: "Error al obtener movimientos" })
  }
})

// =========================
// POST /movements
// Crear movimiento - Soporta campos de conversión de moneda
// =========================
router.post("/movements", async (req, res) => {
  try {
    const { wallet, user, type, amount, category, notes, tags, date, originalAmount, originalCurrency, exchangeRate } =
      req.body

    // Category no es requerida para transferencias
    if (!wallet || !user || !type || !amount) {
      return res.status(400).json({ error: "Faltan datos obligatorios" })
    }

    const movementData = {
      wallet,
      user,
      type,
      amount,
      category: category || null,
      notes,
      tags,
      date,
    }

    // Añadir datos de conversión si existen
    if (originalAmount) movementData.originalAmount = originalAmount
    if (originalCurrency) movementData.originalCurrency = originalCurrency
    if (exchangeRate) movementData.exchangeRate = exchangeRate

    const movement = await SpendingMovement.create(movementData)

    res.status(201).json({ movement })
  } catch (err) {
    console.error("CREATE MOVEMENT ERROR:", err)
    res.status(500).json({ error: "Error al crear movimiento" })
  }
}) 

// =========================
// DELETE /movements/:id
// =========================
router.delete("/movements/:id", async (req, res) => {
  try {
    const movement = await SpendingMovement.findById(req.params.id)
    if (!movement) return res.status(404).json({ error: "Movimiento no encontrado" })

    movement.archived = true
    await movement.save()

    res.json({ message: "Movimiento archivado" })
  } catch {
    res.status(500).json({ error: "Error del servidor" })
  }
})

// =========================
// CATEGORIES
// =========================

// GET /categories
router.get("/categories", async (_, res) => {
  try {
    const categories = await Category.find()
    res.json(categories)
  } catch {
    res.status(500).json({ error: "Error al obtener categorías" })
  }
})

// POST /set_categories
router.post("/set_categories", async (req, res) => {
  try {
    const { name, href } = req.body
    if (!name) return res.status(400).json({ error: "Nombre requerido" })

    const category = await Category.create({ name, href })
    res.status(201).json({ category })
  } catch (err) {
    res.status(500).json({ error: "Error al crear categoría" })
  }
})

module.exports = router
