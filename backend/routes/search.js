const express = require("express")
const router = express.Router()

const User = require("../models/User")
const { Wallet, SpendingMovement, Category } = require("../models/Wallet")

// =========================
// GET /search/users
// Buscar usuarios por nombre o email
// =========================
router.get("/users", async (req, res) => {
  try {
    const { id, query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Falta query" });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
    ],
    });

    // ✅ FUNCIÓN USADA DE VERDAD
    function searchUsers(usuarios, q, currentUserId) {
      return usuarios.filter(user =>
        user.name.toLowerCase().includes(q.toLowerCase()) &&
        user._id.toString() !== currentUserId
      );
    }

    const filteredUsers = searchUsers(users, query, id);

    res.json({ users: filteredUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al buscar usuarios" });
  }
});


module.exports = router