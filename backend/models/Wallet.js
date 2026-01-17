const mongoose = require("mongoose")
const crypto = require("crypto")

const walletSchema = new mongoose.Schema({
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  name: {
    type: String,
    required: [true, "El nombre es requerido"],
    trim: true,
  },
  currency: {
    type: String,
    default: "EUR",
    trim: true,
  },
  icon: {
    type: String,
    default: "wallet",
    trim: true,
  },
  archived: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    timestamps: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    timestamps: true,
  },
})

const spendingMovementSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  type: {
    type: String,
    enum: ["income", "expense", "transfer"],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    timestamps: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: false,
  },
  notes: {
    type: String,
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  amount: {
    type: Number,
    required: true,
  },
  // Campos para conversión de moneda
  originalAmount: {
    type: Number,
  },
  originalCurrency: {
    type: String,
  },
  exchangeRate: {
    type: Number,
  },
  archived: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    timestamps: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    timestamps: true,
  },
})

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  href: {
    type: String,
  },
})

const inviteToWalletSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  token: {
    type: String,
    default: () => crypto.randomBytes(32).toString("hex"),
  },
  createdAt: {
    type: Date,
    default: Date.now,
    timestamps: true,
  },
})

module.exports = {
  Wallet: mongoose.model("Wallet", walletSchema),
  SpendingMovement: mongoose.model("SpendingMovement", spendingMovementSchema),
  Category: mongoose.model("Category", categorySchema),
  InviteToWallet: mongoose.model("InviteToWallet", inviteToWalletSchema),
}
