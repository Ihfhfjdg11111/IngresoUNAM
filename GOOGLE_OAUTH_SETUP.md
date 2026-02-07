# 🔐 Configuración de Google OAuth para Múltiples Dispositivos

Guía para configurar Google OAuth y que funcione desde cualquier dispositivo (local, ngrok, Railway, etc.)

---

## 📋 Resumen de Cambios

El backend ahora soporta **múltiples redirect URIs dinámicamente**:

- ✅ Localhost (desarrollo)
- ✅ Cualquier URL de ngrok (dinámica)
- ✅ Railway (producción)
- ✅ Cualquier dispositivo que acceda vía ngrok

---

## 🔧 Paso 1: Configurar Google Cloud Console

### 1.1 Ir a Google Cloud Console
- URL: https://console.cloud.google.com/apis/credentials
- Selecciona tu proyecto

### 1.2 Editar OAuth 2.0 Client ID

1. Busca tu cliente OAuth (el que tiene tu GOOGLE_CLIENT_ID)
2. Click en **"Edit"** (lápiz)

### 1.3 Agregar URIs Autorizadas

En la sección **"Authorized redirect URIs"**, agrega estas URLs:

```
https://ingresounam-backend-production-71a1.up.railway.app/api/auth/google/callback
```

> **Nota:** Ya no necesitas agregar cada URL de ngrok individualmente. El backend maneja automáticamente las URLs de ngrok.

### 1.4 Guardar Cambios
- Click en **"Save"**

---

## 🌐 Paso 2: Flujo de Autenticación (Cómo Funciona)

```
1. Usuario hace clic en "Login con Google"
   ↓
2. Frontend llama: GET /api/auth/google/url?frontend_url=http://localhost:3000
   ↓
3. Backend genera URL de Google con:
   - redirect_uri = Railway (https://...railway.app/api/auth/google/callback)
   - state = {f: "http://localhost:3000", s: "..."} (codificado)
   ↓
4. Usuario es redirigido a Google para autorizar
   ↓
5. Google redirige a: Railway /api/auth/google/callback?code=...&state=...
   ↓
6. Backend procesa el login y redirige a:
   http://localhost:3000/login?token=...&user_id=...&email=...
   ↓
7. Frontend recibe el token y completa el login
```

---

## 💻 Paso 3: Actualizar Frontend

### 3.1 Modificar Login.jsx para soportar el nuevo flujo

El frontend debe:
1. Detectar su propia URL
2. Enviarla al backend al solicitar la URL de Google
3. Manejar los parámetros de URL cuando Google redirige

### 3.2 Código del Frontend (Ejemplo)

```javascript
// Al hacer clic en "Login con Google"
const handleGoogleLogin = async () => {
  // Detectar URL actual del frontend
  const frontendUrl = window.location.origin; // ej: http://localhost:3000
  
  // Solicitar URL de Google OAuth
  const response = await fetch(
    `${API}/auth/google/url?frontend_url=${encodeURIComponent(frontendUrl)}`
  );
  const { auth_url } = await response.json();
  
  // Redirigir a Google
  window.location.href = auth_url;
};

// Al cargar la página de login (manejar callback)
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const userId = params.get('user_id');
  const email = params.get('email');
  const name = params.get('name');
  const role = params.get('role');
  const picture = params.get('picture');
  const error = params.get('error');
  
  if (error) {
    toast.error(`Error de login: ${error}`);
    return;
  }
  
  if (token) {
    // Guardar token y datos del usuario
    localStorage.setItem('token', token);
    localStorage.setItem('user_id', userId);
    localStorage.setItem('email', email);
    localStorage.setItem('name', name);
    localStorage.setItem('role', role);
    localStorage.setItem('picture', picture);
    
    // Limpiar URL
    window.history.replaceState({}, document.title, '/login');
    
    // Redirigir al dashboard
    navigate('/dashboard');
  }
}, []);
```

---

## ✅ URLs Soportadas

El backend ahora acepta automáticamente:

| Origen | Ejemplo | Soportado |
|--------|---------|-----------|
| Localhost | `http://localhost:3000` | ✅ |
| Localhost HTTPS | `https://localhost:3000` | ✅ |
| 127.0.0.1 | `http://127.0.0.1:3000` | ✅ |
| Railway | `https://ingresounam-backend-production-71a1.up.railway.app` | ✅ |
| Ngrok (cualquiera) | `https://*.ngrok-free.app` | ✅ |
| Ngrok (cualquiera) | `https://*.ngrok.io` | ✅ |

---

## 🔍 Verificación

### Probar el flujo:

1. **Iniciar sesión desde localhost:**
   ```bash
   cd frontend
   npm start
   # Ir a http://localhost:3000/login
   # Click en "Login con Google"
   ```

2. **Iniciar sesión desde ngrok:**
   ```bash
   ngrok http 3000
   # Ir a la URL de ngrok (ej: https://abc123.ngrok-free.app/login)
   # Click en "Login con Google"
   ```

3. **Verificar que el token se recibe:**
   - Después del login, la URL debe contener: `?token=eyJ...&user_id=user_...`

---

## ⚠️ Notas Importantes

1. **Google Cloud Console:**
   - Solo necesitas registrar la URL de Railway como redirect URI
   - No es necesario registrar cada URL de ngrok

2. **Seguridad:**
   - El backend valida que el `frontend_url` sea de un dominio permitido
   - No se aceptan URLs arbitrarias para prevenir ataques

3. **Variables de Entorno:**
   - `GOOGLE_REDIRECT_URI` debe ser la URL de Railway
   - `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` se mantienen igual

---

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"
- Verifica que la URL de Railway esté registrada en Google Cloud Console
- La URL debe ser exactamente: `https://ingresounam-backend-production-71a1.up.railway.app/api/auth/google/callback`

### Error: "origin not allowed"
- El dominio del frontend no está en la lista de permitidos
- Verifica que uses localhost, ngrok, o un dominio válido

### No se recibe el token después del login
- Verifica que el frontend esté manejando los parámetros de URL correctamente
- Revisa la consola del navegador por errores
