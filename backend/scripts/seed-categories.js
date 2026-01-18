// Script to seed default expense categories
// Run with: node scripts/seed-categories.js

const mongoose = require("mongoose")
const { Category } = require("../models/Wallet")
require("dotenv").config({ path: require("path").join(__dirname, "../.env") })

// Default expense categories for travel/personal finance
const defaultCategories = [
  { name: "Alojamiento", href: "accommodation" },
  { name: "Transporte", href: "transport" },
  { name: "Comida", href: "food" },
  { name: "Entretenimiento", href: "entertainment" },
  { name: "Compras", href: "shopping" },
  { name: "Salud", href: "health" },
  { name: "Comunicación", href: "communication" },
  { name: "Servicios", href: "services" },
  { name: "Suscripciones", href: "subscriptions" },
  { name: "Otros", href: "other" },
]

async function seedCategories() {
  try {
    const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/nomad"
    await mongoose.connect(mongoUrl)

    // Check if categories already exist
    const existingCount = await Category.countDocuments()
    if (existingCount > 0) {
      await mongoose.disconnect()
      return
    }

    // Insert all categories
    await Category.insertMany(defaultCategories)

    await mongoose.disconnect()
  } catch (error) {
    console.error("Error seeding categories:", error)
    process.exit(1)
  }
}

seedCategories()
