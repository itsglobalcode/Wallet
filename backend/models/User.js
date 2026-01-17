const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre es requerido"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "El email es requerido"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+$/, "Por favor ingresa un email válido"],
  },
  password: {
    type: String,
    required: [true, "La contraseña es requerida"],
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
  },
  twoFactor: {
    enabled: {
      type: Boolean,
      default: false,
    },
    emailCode: {
      type: String,
      default: null,
    },
    codeExpires: {
      type: Date,
      default: null,
    },
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

userSchema.pre("save", async function () {
  // Si la contraseña no ha sido modificada, no hacer nada
  if (!this.isModified("password")) {
    return
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model("User", userSchema)
