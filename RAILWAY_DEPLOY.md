# 🚀 Despliegue en Railway

Guía para desplegar el backend de IngresoUNAM en Railway y conectarlo con el frontend en ngrok.

---

## 📋 Requisitos Previos

1. Cuenta en [Railway](https://railway.app) (gratuita)
2. Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (ya configurada)
3. Ngrok instalado y funcionando localmente

---

## 🔧 Paso 1: Preparar el Backend

### 1.1 Verifica que tienes estos archivos en `backend/`:
- `Dockerfile` ✅
- `railway.toml` ✅ (creado)
- `requirements.txt` ✅
- `.env.example` ✅ (creado)

### 1.2 Actualiza CORS en Railway
En `backend/utils/config.py`, asegúrate de que `CORS_ORIGINS` acepte el dominio de Railway:
```python
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '').split(',')
```

---

## 🚀 Paso 2: Crear Proyecto en Railway

### Opción A: Via Web (Recomendada)

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Conecta tu repositorio de GitHub (debes hacer push primero)
5. Railway detectará automáticamente el `Dockerfile`

### Opción B: Via CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
cd backend
railway init

# Deploy
railway up
```

---

## ⚙️ Paso 3: Configurar Variables de Entorno

En el panel de Railway, ve a **"Variables"** y agrega:

### Variables Obligatorias:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `MONGO_URL` | `mongodb+srv://...` | Tu URL de MongoDB Atlas |
| `DB_NAME` | `ingresounam` | Nombre de la base de datos |
| `JWT_SECRET` | `secreto-muy-seguro` | Clave para JWT (mínimo 32 chars) |
| `CORS_ORIGINS` | `https://*.ngrok-free.app,...` | Orígenes permitidos |

### Variables Opcionales (Stripe):

| Variable | Valor |
|----------|-------|
| `STRIPE_API_KEY` | `sk_live_...` o `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

### Variables Opcionales (Google OAuth):

| Variable | Valor |
|----------|-------|
| `GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `...` |
| `GOOGLE_REDIRECT_URI` | `https://tu-ngrok.ngrok-free.app/login` |

---

## 🔗 Paso 4: Configurar CORS para ngrok

### En Railway (Variables):
```
CORS_ORIGINS=https://*.ngrok-free.app,https://*.ngrok.io,http://localhost:3000
```

### O si ngrok te da un dominio fijo:
```
CORS_ORIGINS=https://nonefficiently-malarian-iliana.ngrok-free.dev,http://localhost:3000
```

---

## 🌐 Paso 5: Obtener URL de Railway

1. Una vez desplegado, Railway te dará una URL pública:
   ```
   https://ingresounam-production.up.railway.app
   ```

2. Copia esta URL, la necesitarás para el frontend

---

## 💻 Paso 6: Configurar Frontend (ngrok)

### 6.1 Actualiza `.env` del frontend:
```env
REACT_APP_BACKEND_URL=https://tu-app-en-railway.up.railway.app
```

### 6.2 Reinicia el frontend:
```bash
cd frontend
npm start
```

### 6.3 Inicia ngrok:
```bash
ngrok http 3000
```

---

## 🔐 Paso 7: Configurar Google OAuth (si usas login con Google)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edita tu OAuth 2.0 Client ID
3. En **"Authorized redirect URIs"** agrega:
   ```
   https://tu-ngrok-url.ngrok-free.app/login
   ```
4. Guarda los cambios

---

## ✅ Verificación

### Prueba el backend:
```bash
curl https://tu-app-en-railway.up.railway.app/api/subjects
```

### Prueba desde el frontend:
1. Abre tu app en `http://localhost:3000`
2. Verifica que las peticiones vayan a Railway
3. Revisa la consola del navegador por errores CORS

---

## 🐛 Solución de Problemas

### Error: "CORS policy"
- Verifica que `CORS_ORIGINS` en Railway incluya tu URL de ngrok
- Reinicia el servicio en Railway después de cambiar variables

### Error: "Cannot connect to backend"
- Verifica que `REACT_APP_BACKEND_URL` en el frontend sea correcta
- Asegúrate de que el backend esté "Healthy" en Railway

### Error: "MongoDB connection failed"
- Verifica que `MONGO_URL` sea correcta
- Asegúrate de que la IP de Railway esté en la whitelist de MongoDB Atlas
  - En Atlas: Network Access → Add IP Address → Allow from anywhere (0.0.0.0/0)

---

## 💰 Costos

- **Railway**: Plan gratuito incluye $5/mes de créditos (suficiente para desarrollo)
- **MongoDB Atlas**: Plan gratuito (M0) es suficiente
- **ngrok**: Plan gratuito funciona bien para desarrollo

---

## 📚 Recursos

- [Railway Docs](https://docs.railway.app/)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
