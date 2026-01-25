const { Resend } = require("resend")

const resend = new Resend(process.env.RESEND_API_KEY)

// Función para enviar invitación a wallet compartido
const sendWalletInvitationEmail = async ({ email, invitedUserName, inviterName, walletName, acceptUrl }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "NOMAD <onboarding@resend.dev>",
      to: [email],
      subject: `Invitación a wallet compartido - ${walletName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0a0a0a; color: #fff; padding: 30px; text-align: center; border-radius: 14px 14px 0 0; }
            .brand { font-size: 32px; font-weight: 700; letter-spacing: -0.5px; }
            .tagline { font-size: 13px; color: #666; margin-top: 6px; }
            .content-area { background: #0a0a0a; padding: 30px 20px; }
            .content-area h2, .content-area p { color: #fff; }
            .content-area p { color: #999; }
            .wallet-box { 
              background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
              border: 2px solid #A855F7;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
              border-radius: 14px;
              box-shadow: 0 0 30px rgba(168, 85, 247, 0.3);
            }
            .wallet-name { 
              font-size: 28px; 
              font-weight: 700; 
              color: #fff;
              text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            }
            .inviter-name {
              color: #A855F7;
              font-weight: 700;
            }
            .button {
              display: inline-block;
              background: #A855F7;
              color: #fff !important;
              padding: 14px 32px;
              border-radius: 14px;
              text-decoration: none;
              font-weight: 700;
              margin-top: 20px;
              box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
              transition: all 0.3s ease;
            }
            .button:hover {
              background: #9333EA;
              box-shadow: 0 6px 30px rgba(168, 85, 247, 0.6);
            }
            .footer { 
              text-align: center; 
              color: #666; 
              font-size: 14px; 
              margin-top: 30px; 
              padding: 20px; 
              background: #0a0a0a; 
              border-top: 1px solid #222;
              border-radius: 0 0 14px 14px;
            }
          </style>
        </head>
        <body style="background: #0a0a0a; margin: 0; padding: 20px;">
          <div class="container">
            <div class="header">
              <div class="brand">NeonWallet</div>
              <p class="tagline">powered by Nomad</p>
            </div>

            <div class="content-area">
              <h2 style="color: #fff; margin-bottom: 20px;">Hola ${invitedUserName},</h2>
              <p style="color: #999;"><span class="inviter-name">${inviterName}</span> te ha invitado a unirte a un wallet compartido.</p>

              <div class="wallet-box">
                <div class="wallet-name">${walletName}</div>
              </div>

              <p style="color: #999;">Al aceptar esta invitación podrás ver y gestionar los gastos compartidos en tiempo real.</p>

              <div style="text-align: center;">
                <a href="${acceptUrl}" class="button">Aceptar Invitación</a>
              </div>

              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Si no reconoces esta invitación, puedes ignorar este correo de forma segura.
              </p>
            </div>

            <div class="footer">
              <p>NeonWallet - Wallets compartidos</p>
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
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch {
    return { success: false, error: "Error al enviar invitación" }
  }
}

// Verificar configuración de email
const verifyEmailConfig = async () => {
  try {
    if (!process.env.RESEND_API_KEY) {
      return false
    }
    return true
  } catch {
    return false
  }
}

// Función para enviar enlace de restablecimiento de contraseña
const sendPasswordResetLink = async (email, resetToken, userName) => {
  try {
    const resetLink = `http://localhost:8081/reset-password?token=${resetToken}`

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "NOMAD <onboarding@resend.dev>",
      to: [email],
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
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch {
    return { success: false, error: "Error al enviar email" }
  }
}

module.exports = {
  verifyEmailConfig,
  sendWalletInvitationEmail,
  sendPasswordResetLink,
}
