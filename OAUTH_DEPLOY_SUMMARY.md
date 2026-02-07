# ✅ Google OAuth Configurado para Múltiples Dispositivos

## 🎯 Resumen

El sistema ahora soporta login con Google desde **cualquier dispositivo**:
- ✅ Tu laptop (localhost)
- ✅ Cualquier URL de ngrok
- ✅ Railway (backend)
- ✅ Teléfono móvil (vía ngrok)
- ✅ Cualquier dispositivo con acceso a internet

---

## 🔧 Configuración del Backend (Railway)

### Variables de Entorno Configuradas:

```bash
GOOGLE_REDIRECT_URI=https://ingresounam-backend-production-71a1.up.railway.app/api/auth/google/callback
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
```

### URLs Soportadas Automáticamente:

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Localhost | `http://localhost:3000` | Desarrollo local |
| 127.0.0.1 | `http://127.0.0.1:3000` | Desarrollo local |
| Ngrok | `*.ngrok-free.app` | https://abc123.ngrok-free.app |
| Ngrok IO | `*.ngrok.io` | https://abc123.ngrok.io |
| Railway | URL fija | https://ingresounam-backend-production-71a1.up.railway.app |

---

## 🌐 Configuración Requerida en Google Cloud Console

### Paso 1: Ir a Google Cloud Console
- URL: https://console.cloud.google.com/apis/credentials

### Paso 2: Editar OAuth 2.0 Client ID

Agregar esta **Authorized redirect URI**:

```
https://ingresounam-backend-production-71a1.up.railway.app/api/auth/google/callback
```

> ⚠️ **IMPORTANTE**: Solo necesitas agregar esta URL. Las URLs de ngrok se manejan automáticamente.

---

## 🔄 Nuevo Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────────┐
│  FLUJO DE LOGIN CON GOOGLE (Funciona en cualquier dispositivo)  │
└─────────────────────────────────────────────────────────────────┘

1. Usuario en cualquier dispositivo
   ↓
2. Frontend detecta su URL (ej: http://localhost:3000)
   ↓  
3. Frontend llama al backend:
   GET /api/auth/google/url?frontend_url=http://localhost:3000
   ↓
4. Backend genera URL de Google con:
   - redirect_uri = Railway (URL fija registrada en Google)
   - state = {frontend_url: "http://localhost:3000"} (codificado)
   ↓
5. Usuario autoriza en Google
   ↓
6. Google redirige a Railway:
   /api/auth/google/callback?code=...&state=...
   ↓
7. Backend procesa login y redirige al frontend original:
   http://localhost:3000/login?token=...&user_id=...
   ↓
8. Frontend recibe token y completa login ✅
```

---

## 📁 Archivos Modificados

### Backend:
- ✅ `backend/utils/oauth.py` - Soporte para múltiples redirect URIs
- ✅ `backend/routes/auth.py` - Nuevas rutas GET/POST para callback

### Frontend:
- ✅ `frontend/src/pages/Login.jsx` - Manejo del nuevo flujo

### Documentación:
- ✅ `GOOGLE_OAUTH_SETUP.md` - Guía de configuración
- ✅ `OAUTH_DEPLOY_SUMMARY.md` - Este resumen

---

## 🧪 Pruebas

### 1. Desde localhost:
```bash
# Frontend ya está corriendo en http://localhost:3000
# Haz clic en "Login con Google"
```

### 2. Desde ngrok:
```bash
ngrok http 3000
# Abre la URL de ngrok en tu teléfono
# Haz clic en "Login con Google"
```

### 3. Verificar:
- Después del login, deberías ver en la URL:
  ```
  http://localhost:3000/login?token=eyJ...&user_id=user_...&email=...
  ```
- El token se guarda automáticamente en localStorage
- Redirige al dashboard

---

## ⚠️ Notas Importantes

1. **No necesitas registrar cada URL de ngrok** en Google Cloud Console
2. **El backend valida automáticamente** los dominios permitidos
3. **Seguridad**: Solo se aceptan localhost, ngrok y Railway
4. **Flujo unificado**: Funciona igual desde cualquier dispositivo

---

## 🚀 URLs Actuales

| Servicio | URL |
|----------|-----|
| Backend Railway | https://ingresounam-backend-production-71a1.up.railway.app |
| Frontend Local | http://localhost:3000 |
| Ngrok | (Tu URL dinámica de ngrok) |

---

## ✅ Checklist para Google Cloud Console

- [ ] Ir a https://console.cloud.google.com/apis/credentials
- [ ] Seleccionar proyecto
- [ ] Editar OAuth 2.0 Client ID
- [ ] Agregar redirect URI: `https://ingresounam-backend-production-71a1.up.railway.app/api/auth/google/callback`
- [ ] Guardar cambios
- [ ] Probar login desde localhost
- [ ] Probar login desde ngrok

---

¡Listo! Ahora puedes compartir tu URL de ngrok con cualquier persona y podrán hacer login con Google desde cualquier dispositivo.
