# NOMAD

Una aplicación móvil moderna construida con React Native y Expo, con autenticación segura y verificación en dos pasos (2FA) por email.

## Tecnologías

### Frontend
- React Native 0.81.5
- Expo 54
- TypeScript
- React Navigation 7
- React 19.1

### Backend
- Node.js
- Express 5.2.1
- MongoDB con Mongoose 9.0.2
- bcryptjs 3.0.3 (encriptación de contraseñas)
- nodemailer 6.9.8 (envío de emails para 2FA)

## Características

- Registro e inicio de sesión de usuarios
- **Autenticación de dos factores (2FA) obligatoria por email con código de 6 dígitos**
- Contador regresivo de 5 minutos para códigos de verificación
- Recuperación de contraseña
- Encriptación segura de contraseñas con bcrypt
- Diseño minimalista y moderno
- Interfaz responsive

## Estructura del Proyecto

```
nomad/
├── frontend/              # Aplicación React Native
│   ├── app/
│   │   ├── (auth)/       # Pantallas de autenticación
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── verify-2fa.tsx
│   │   │   ├── forgot-password.tsx
│   │   │   └── reset-password.tsx
│   │   ├── (tabs)/       # Pantallas principales
│   │   └── index.tsx     # Pantalla inicial
│   └── package.json
└── backend/              # API REST
    ├── models/
    │   └── User.js
    ├── routes/
    │   └── auth.js
    ├── utils/
    │   └── emailService.js
    ├── server.js
    └── package.json
```

## Instalación Completa

### Prerrequisitos del Sistema

Antes de empezar, asegúrate de tener instalado:

1. **Node.js** (versión 18 o superior)
   - Descarga desde: https://nodejs.org/
   - Verifica con: `node --version`

2. **MongoDB Atlas** (base de datos en la nube - GRATIS)
   - Crea cuenta en: https://www.mongodb.com/cloud/atlas/register
   - Sigue las instrucciones de la sección "Configuración de MongoDB"

3. **Gmail** (para enviar códigos de verificación)
   - Necesitas una cuenta de Gmail activa
   - Sigue las instrucciones de la sección "Configuración de Email"

4. **Expo Go** (para probar en móvil)
   - Descarga desde App Store (iOS) o Google Play (Android)

---

## PASO 1: Configurar MongoDB Atlas

1. Ve a https://www.mongodb.com/cloud/atlas/register y crea una cuenta
2. Crea un nuevo cluster (selecciona el plan FREE M0)
3. **Crear usuario de base de datos:**
   - Ve a "Database Access" → "Add New Database User"
   - Usuario: `nomaduser` (o el que prefieras)
   - Contraseña: Genera una segura y GUÁRDALA
   - Permisos: "Read and write to any database"

4. **Permitir acceso desde cualquier IP:**
   - Ve a "Network Access" → "Add IP Address"
   - Selecciona "Allow Access from Anywhere" (0.0.0.0/0)

5. **Obtener cadena de conexión:**
   - Ve a "Database" → "Connect" → "Connect your application"
   - Copia la cadena que se ve así:
     ```
     mongodb+srv://nomaduser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Reemplaza `<password>` con tu contraseña
   - Añade `/nomad` después de `.net/`:
     ```
     mongodb+srv://nomaduser:tuPassword@cluster0.xxxxx.mongodb.net/nomad?retryWrites=true&w=majority
     ```

---

## PASO 2: Configurar Gmail para Envío de Emails

**IMPORTANTE:** El 2FA funciona enviando códigos de 6 dígitos por email. Debes configurar Gmail correctamente.

### A) Activar Verificación en Dos Pasos de Google

1. Ve a: https://myaccount.google.com/security
2. Busca "Verificación en dos pasos"
3. Haz clic en "Empezar" y sigue los pasos
4. Verifica tu identidad con tu número de teléfono

### B) Generar Contraseña de Aplicación

1. Ve a: https://myaccount.google.com/apppasswords
2. Si no ves esta opción, asegúrate de haber activado la verificación en dos pasos
3. En "Seleccionar app", elige "Correo"
4. En "Seleccionar dispositivo", elige "Otro" y escribe "NOMAD"
5. Haz clic en "Generar"
6. **COPIA LA CONTRASEÑA DE 16 DÍGITOS** (se ve así: `abcd efgh ijkl mnop`)
7. Guárdala, la necesitarás en el archivo `.env`

---

## PASO 3: Instalar Backend

```bash
# 1. Navega a la carpeta backend
cd backend

# 2. Instala TODOS los paquetes necesarios
npm install
```

Esto instalará automáticamente:
- **express** (5.2.1) - Servidor web
- **mongoose** (9.0.2) - Conexión con MongoDB
- **bcryptjs** (3.0.3) - Encriptación de contraseñas
- **cors** (2.8.5) - Permitir peticiones desde el frontend
- **dotenv** (17.2.3) - Variables de entorno
- **nodemailer** (6.9.8) - Envío de emails para 2FA
- **crypto** (1.0.1) - Funciones criptográficas
- **nodemon** (3.1.11) - Auto-reinicio en desarrollo

---

## PASO 4: Configurar Variables de Entorno del Backend

Crea o edita el archivo `backend/.env` con este contenido:

```env
# ==========================================
# CONFIGURACIÓN DE MONGODB
# ==========================================
MONGODB_URI=mongodb+srv://nomaduser:tuPassword@cluster0.xxxxx.mongodb.net/nomad?retryWrites=true&w=majority
PORT=3000

# ==========================================
# CONFIGURACIÓN DE EMAIL (Gmail)
# ==========================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=NOMAD App <tu-email@gmail.com>
```

**Reemplaza:**
- `MONGODB_URI` → Tu cadena de conexión de MongoDB Atlas
- `EMAIL_USER` → Tu email de Gmail completo
- `EMAIL_PASSWORD` → La contraseña de aplicación de 16 dígitos que generaste
- `EMAIL_FROM` → Usa el mismo email que EMAIL_USER

---

## PASO 5: Instalar Frontend

```bash
# 1. Navega a la carpeta frontend
cd frontend

# 2. Instala TODOS los paquetes necesarios
npm install
```

Esto instalará automáticamente:
- **expo** (~54.0.30) - Framework principal
- **react** (19.1.0) y **react-native** (0.81.5)
- **@react-navigation/native** (7.1.8) - Navegación
- **@react-navigation/bottom-tabs** (7.4.0) - Tabs de navegación
- **@react-native-async-storage/async-storage** (2.2.0) - Almacenamiento local
- **react-native-gesture-handler** (2.28.0) - Gestos táctiles
- **react-native-reanimated** (4.1.1) - Animaciones
- **react-native-safe-area-context** (5.6.0) - Áreas seguras
- **react-native-screens** (4.16.0) - Optimización de pantallas
- **expo-router** (6.0.21) - Enrutamiento
- **TypeScript** (5.9.2) - Soporte de tipos

(npx expo install react-native-svg)
(npm install @react-native-picker/picker --save)

---

## PASO 6: Ejecutar el Proyecto

### Terminal 1 - Backend:

```bash
cd backend
npm start
```

**Deberías ver:**
```
🚀 Servidor corriendo en puerto 3000
✅ MongoDB conectado exitosamente
✅ Configuración de email verificada correctamente
```

Si ves errores de email, verifica que las credenciales en `.env` sean correctas.

### Terminal 2 - Frontend:

```bash
cd frontend
npm start
```

Esto abrirá Expo DevTools. Luego puedes:
- Presionar **`w`** para abrir en navegador web
- Presionar **`a`** para Android (requiere emulador o dispositivo)
- Presionar **`i`** para iOS (solo Mac con Xcode)
- **Escanear el código QR** con la app **Expo Go** en tu teléfono

---

## Uso de la Aplicación

### 1. Registro de Usuario

1. Abre la app y selecciona "Registrarse"
2. Completa:
   - Nombre completo
   - Email válido
   - Contraseña (mínimo 6 caracteres)
3. Haz clic en "Registrarse"
4. **Automáticamente** recibirás un email con un código de 6 dígitos

### 2. Verificación 2FA (Obligatoria)

1. Revisa tu email (el que pusiste al registrarte)
2. Copia el código de 6 dígitos
3. En la app, ingresa el código en las 6 casillas
4. Tienes **5 minutos** antes de que expire (hay contador regresivo)
5. Si expira, haz clic en "Reenviar código"
6. Una vez verificado, accederás a la app

### 3. Inicio de Sesión

1. Ingresa tu email y contraseña
2. Si tienes 2FA activado, recibirás un código por email
3. Ingresa el código de 6 dígitos
4. Accede a la aplicación

### 4. Recuperación de Contraseña

1. Desde login, selecciona "Olvidaste tu contraseña"
2. Ingresa tu email
3. Recibirás un código de recuperación
4. Ingresa el código y tu nueva contraseña

---

## Solución de Problemas Comunes

### ❌ "No se envía el email de verificación"

**Solución:**
1. Verifica que tu Gmail tenga la verificación en dos pasos activada
2. Confirma que la contraseña de aplicación sea correcta (16 dígitos)
3. Revisa que `EMAIL_USER` y `EMAIL_PASSWORD` estén correctos en `.env`
4. Reinicia el servidor backend: `Ctrl+C` y luego `npm start`

### ❌ "Cannot connect to MongoDB"

**Solución:**
1. Verifica que la cadena `MONGODB_URI` esté correcta
2. Confirma que la contraseña en la URI no tenga caracteres especiales sin codificar
3. Asegúrate de que "Network Access" permita 0.0.0.0/0 en MongoDB Atlas

### ❌ "No navega a la pantalla de verificación"

**Solución:**
1. Reinicia el servidor frontend con: `npx expo start -c` (limpia caché)
2. Verifica que exista el archivo `frontend/app/index.tsx`
3. Revisa los logs en la consola del frontend

### ❌ "El código de 6 dígitos no funciona"

**Solución:**
1. Verifica que el código no haya expirado (5 minutos)
2. Copia el código exactamente como aparece en el email
3. Si expira, solicita un nuevo código con "Reenviar código"

---

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario (envía código por email)
- `POST /api/auth/login` - Iniciar sesión

### 2FA por Email
- `POST /api/auth/2fa/verify` - Verificar código de 6 dígitos
- `POST /api/auth/2fa/send-code` - Reenviar código de verificación

### Recuperación de Contraseña
- `POST /api/auth/forgot-password` - Solicitar código de recuperación
- `POST /api/auth/reset-password` - Resetear contraseña con código

---

## Seguridad

- ✅ Contraseñas encriptadas con bcrypt (salt rounds: 10)
- ✅ Códigos 2FA de 6 dígitos generados aleatoriamente
- ✅ Códigos expiran después de 5 minutos
- ✅ Validación de datos en backend y frontend
- ✅ Conexión segura con MongoDB Atlas (TLS/SSL)
- ✅ Emails enviados por canal seguro (STARTTLS)

---

## Dependencias Completas

### Backend (package.json)
```json
{
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.5",
    "crypto": "^1.0.1",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "mongoose": "^9.0.2",
    "nodemailer": "^6.9.8"
  },
  "devDependencies": {
    "nodemon": "^3.1.11"
  }
}
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "@expo/vector-icons": "^15.0.3",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-navigation/bottom-tabs": "^7.4.0",
    "@react-navigation/native": "^7.1.8",
    "expo": "~54.0.30",
    "expo-router": "~6.0.21",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "typescript": "~5.9.2"
  }
}
```

---

## Comandos Rápidos

```bash
# Instalar todo desde cero
cd backend && npm install && cd ../frontend && npm install

# Ejecutar backend
cd backend && npm start

# Ejecutar frontend
cd frontend && npm start

# Ejecutar frontend limpiando caché
cd frontend && npx expo start -c

# Ver logs del backend
cd backend && npm start
```

---

## Notas Importantes

1. **El 2FA es OBLIGATORIO** - Todos los usuarios deben verificar su email con el código de 6 dígitos
2. **Usa Gmail real** - No uses emails temporales o falsos, no recibirás los códigos
3. **Misma red WiFi** - Tu teléfono y computadora deben estar en la misma red para Expo Go
4. **Contraseña de aplicación** - NO uses tu contraseña normal de Gmail, usa la de 16 dígitos
5. **MongoDB Atlas** - La versión gratuita es suficiente (hasta 512MB de datos)

---

## Licencia

Este proyecto es privado y confidencial.
