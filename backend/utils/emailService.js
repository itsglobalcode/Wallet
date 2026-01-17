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

// Función para enviar código de verificación 2FA
const sendVerificationCode = async (email, code, userName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || "NOMAD <noreply@nomad.com>",
            to: email,
            subject: "Código de verificación NOMAD - 2FA",
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 30px; text-align: center; }
            .brand { font-size: 32px; font-weight: 900; letter-spacing: 4px; }
            .code-box { background: #f4f4f4; border: 2px dashed #000; padding: 30px; text-align: center; margin: 30px 0; border-radius: 8px; }
            .code { font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #000; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="brand">NOMAD</div>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Tu viaje empieza aquí</p>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #000; margin-bottom: 20px;">Hola ${userName},</h2>
              <p>Has solicitado iniciar sesión en tu cuenta NOMAD. Tu código de verificación es:</p>
              
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              
              <p><strong>Este código expirará en 5 minutos.</strong></p>
              <p>Si no solicitaste este código, ignora este mensaje.</p>
            </div>
            
            <div class="footer">
              <p>NOMAD App - Autenticación de dos factores</p>
              <p>Este es un correo automático, por favor no respondas.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
Hola ${userName},

Tu código de verificación NOMAD es: ${code}

Este código expirará en 5 minutos.

Si no solicitaste este código, ignora este mensaje.

NOMAD App - Tu viaje empieza aquí
      `,
        }

        const info = await transporter.sendMail(mailOptions)

        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error("Error detallado al enviar email:")
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

// Función para enviar invitación a wallet compartido
const sendWalletInvitationEmail = async ({
    email,
    invitedUserName,
    inviterName,
    walletName,
    acceptUrl,
}) => {
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


module.exports = {
    sendVerificationCode,
    verifyEmailConfig,
    sendWalletInvitationEmail,
}
