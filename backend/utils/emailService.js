const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // false para puerto 587 (TLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Permite certificados autofirmados
  },
  logger: true, // Activa logs de nodemailer
  debug: true, // Activa modo debug
})

// Función para enviar invitación a wallet compartido
const sendWalletInvitationEmail = async ({ email, invitedUserName, inviterName, walletName, acceptUrl }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "NOMAD <noreply@nomad.com>",
      to: email,
      subject: `Invitación a wallet compartido - ${walletName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 30px; text-align: center; }
            .brand { font-size: 32px; font-weight: 900; letter-spacing: 4px; }
            .card { background: #fff; padding: 30px; margin-top: 20px; border-radius: 8px; }
            .wallet-box { background: #f4f4f4; border: 2px dashed #000; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px; }
            .wallet-name { font-size: 26px; font-weight: 700; color: #000; }
            .button {
              display: inline-block;
              background: #000;
              color: #fff !important;
              padding: 14px 28px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 700;
              margin-top: 20px;
            }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="brand">NOMAD</div>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Tu viaje empieza aquí</p>
            </div>

            <div class="card">
              <h2>Hola ${invitedUserName},</h2>
              <p><strong>${inviterName}</strong> te ha invitado a unirte a un wallet compartido.</p>

              <div class="wallet-box">
                <div class="wallet-name">${walletName}</div>
              </div>

              <p>Al aceptar esta invitación podrás ver y gestionar los gastos compartidos.</p>

              <div style="text-align: center;">
                <a href="${acceptUrl}" class="button">Aceptar invitación</a>
              </div>

              <p style="margin-top: 30px;">
                Si no reconoces esta invitación, puedes ignorar este correo.
              </p>
            </div>

            <div class="footer">
              <p>NOMAD App - Wallets compartidos</p>
              <p>Este es un correo automático, por favor no respondas.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hola ${invitedUserName},

${inviterName} te ha invitado a unirte a un wallet compartido.

Wallet: ${walletName}

Acepta la invitación aquí:
${acceptUrl}

Si no reconoces esta invitación, puedes ignorar este correo.

NOMAD App - Tu viaje empieza aquí
      `,
    }

    const info = await transporter.sendMail(mailOptions)

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Error al enviar invitación de wallet")
    console.error("Nombre del error:", error.name)
    console.error("Mensaje:", error.message)
    console.error("Stack:", error.stack)
    console.error("Código:", error.code)
    console.error("Comando:", error.command)

    return { success: false, error: error.message }
  }
}

// Verificar configuración de email
const verifyEmailConfig = async () => {
  try {
    await transporter.verify()
    console.log("✅ Configuración de email verificada correctamente")
    return true
  } catch (error) {
    console.error("❌ Error en configuración de email:", error.message)
    return false
  }
}

// Función para enviar enlace de restablecimiento de contraseña
const sendPasswordResetLink = async (email, resetToken, userName) => {
  try {
    const resetLink = `http://localhost:8081/reset-password?token=${resetToken}`

    const mailOptions = {
      from: process.env.EMAIL_FROM || "NOMAD <noreply@nomad.com>",
      to: email,
      subject: "Recuperación de contraseña - NeonWallet",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0a0a0a; color: #fff; padding: 30px; text-align: center; }
            .brand { font-size: 32px; font-weight: 700; letter-spacing: -0.5px; }
            .tagline { font-size: 13px; color: #666; margin-top: 6px; }
            .content-area { background: #0a0a0a; padding: 30px 20px; }
            .content-area h2, .content-area p { color: #fff; }
            .content-area p { color: #999; }
            .button {
              display: inline-block;
              background: #A855F7;
              color: #fff !important;
              padding: 14px 28px;
              border-radius: 14px;
              text-decoration: none;
              font-weight: 700;
              margin-top: 20px;
            }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding: 20px; background: #0a0a0a; border-top: 1px solid #222; }
          </style>
        </head>
        <body style="background: #0a0a0a; margin: 0; padding: 20px;">
          <div class="container">
            <div class="header">
              <div class="brand">NeonWallet</div>
              <p class="tagline">powered by Nomad</p>
            </div>
            
            <div class="content-area">
              <h2 style="color: #fff; margin-bottom: 20px;">Hola ${userName || "Usuario"},</h2>
              <p style="color: #999;">Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para continuar:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Restablecer Contraseña</a>
              </div>
              
              <p style="color: #999; margin-top: 20px;"><strong>Este enlace expirará en 1 hora.</strong></p>
              <p style="color: #999;">Si no solicitaste restablecer tu contraseña, ignora este mensaje.</p>
            </div>
            
            <div class="footer">
              <p>NeonWallet - Recuperación de contraseña</p>
              <p>Este es un correo automático, por favor no respondas.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hola ${userName || "Usuario"},

Has solicitado restablecer tu contraseña. Accede a este enlace para continuar:

${resetLink}

Este enlace expirará en 1 hora.

Si no solicitaste restablecer tu contraseña, ignora este mensaje.

NeonWallet - powered by Nomad
      `,
    }

    const info = await transporter.sendMail(mailOptions)

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error detallado al enviar email de recuperación:")
    console.error("Nombre del error:", error.name)
    console.error("Mensaje:", error.message)
    console.error("Stack:", error.stack)
    console.error("Código:", error.code)
    console.error("Comando:", error.command)

    return { success: false, error: error.message }
  }
}

module.exports = {
  verifyEmailConfig,
  sendWalletInvitationEmail,
  sendPasswordResetLink,
}
