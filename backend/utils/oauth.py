"""
Google OAuth 2.0 direct implementation
Replaces Emergent AI authentication
"""
import os
import httpx
from typing import Optional, Dict
from datetime import datetime, timezone
from urllib.parse import urlparse

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")

# Lista de redirect URIs permitidos (para múltiples dispositivos/orígenes)
ALLOWED_REDIRECT_ORIGINS = [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "https://127.0.0.1:3000",
    # Railway backend (para callback centralizado)
    "https://ingresounam-backend-production-71a1.up.railway.app",
    # ngrok URLs dinámicas (patrón)
]

# Permitir ngrok dinámico via variable de entorno
NGROK_URL = os.environ.get("NGROK_URL", "")
if NGROK_URL:
    ALLOWED_REDIRECT_ORIGINS.append(NGROK_URL)

# Redirect URI por defecto (Railway backend)
DEFAULT_REDIRECT_URI = "https://ingresounam-backend-production-71a1.up.railway.app/api/auth/google/callback"

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


class GoogleOAuthError(Exception):
    """Custom exception for Google OAuth errors"""
    pass


def is_allowed_redirect_uri(redirect_uri: str) -> bool:
    """
    Verifica si el redirect_uri está permitido
    """
    if not redirect_uri:
        return False
    
    # Parsear la URL
    parsed = urlparse(redirect_uri)
    origin = f"{parsed.scheme}://{parsed.netloc}"
    
    # Verificar origen exacto
    if origin in ALLOWED_REDIRECT_ORIGINS:
        return True
    
    # Permitir cualquier ngrok-free.app
    if parsed.netloc.endswith(".ngrok-free.app"):
        return True
    
    # Permitir cualquier ngrok.io
    if parsed.netloc.endswith(".ngrok.io"):
        return True
    
    return False


def get_google_auth_url(redirect_uri: Optional[str] = None, state: Optional[str] = None, frontend_url: Optional[str] = None) -> str:
    """
    Generate Google OAuth authorization URL
    
    Args:
        redirect_uri: URL de callback (opcional, usa default si no se proporciona)
        state: Optional state parameter for security (puede contener frontend_url)
        frontend_url: URL del frontend para redirigir después del login
        
    Returns:
        Authorization URL to redirect user
    """
    if not GOOGLE_CLIENT_ID:
        raise GoogleOAuthError("GOOGLE_CLIENT_ID not configured")
    
    # Usar el redirect_uri proporcionado o el default
    callback_uri = redirect_uri or DEFAULT_REDIRECT_URI
    
    # Validar que el redirect_uri esté permitido
    if not is_allowed_redirect_uri(callback_uri):
        raise GoogleOAuthError(f"Redirect URI no permitido: {callback_uri}")
    
    # Construir state con frontend_url si se proporciona
    state_value = state or ""
    if frontend_url:
        import base64
        import json
        state_data = {"f": frontend_url, "s": state_value}
        state_value = base64.urlsafe_b64encode(json.dumps(state_data).encode()).decode().rstrip("=")
    
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": callback_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    
    if state_value:
        params["state"] = state_value
    
    from urllib.parse import urlencode
    query_string = urlencode(params)
    return f"{GOOGLE_AUTH_URL}?{query_string}"


async def exchange_code_for_tokens(code: str, redirect_uri: Optional[str] = None) -> Dict:
    """
    Exchange authorization code for access tokens
    
    Args:
        code: Authorization code from Google callback
        redirect_uri: URL de callback usado (opcional, usa default si no se proporciona)
        
    Returns:
        Dictionary with access_token, refresh_token, etc.
    """
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise GoogleOAuthError("Google OAuth credentials not configured")
    
    # Usar el redirect_uri proporcionado o el default
    callback_uri = redirect_uri or DEFAULT_REDIRECT_URI
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": callback_uri,
                "grant_type": "authorization_code",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code != 200:
            error_data = response.json()
            raise GoogleOAuthError(f"Token exchange failed: {error_data.get('error_description', 'Unknown error')}")
        
        return response.json()


async def get_user_info(access_token: str) -> Dict:
    """
    Get user info from Google using access token
    
    Args:
        access_token: Valid Google access token
        
    Returns:
        User info: email, name, picture, etc.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if response.status_code != 200:
            raise GoogleOAuthError("Failed to fetch user info")
        
        return response.json()


async def verify_google_token(id_token: str) -> Optional[Dict]:
    """
    Verify Google ID token (for one-tap sign-in or mobile apps)
    
    Args:
        id_token: Google ID token
        
    Returns:
        Decoded token payload if valid, None otherwise
    """
    import jwt
    from jwt import PyJWKClient
    
    try:
        # Fetch Google's public keys
        jwks_url = "https://www.googleapis.com/oauth2/v3/certs"
        jwks_client = PyJWKClient(jwks_url)
        
        # Get signing key
        signing_key = jwks_client.get_signing_key_from_jwt(id_token)
        
        # Verify token
        payload = jwt.decode(
            id_token,
            signing_key.key,
            algorithms=["RS256"],
            audience=GOOGLE_CLIENT_ID,
            issuer=["https://accounts.google.com", "accounts.google.com"]
        )
        
        return payload
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None


async def refresh_access_token(refresh_token: str) -> Dict:
    """
    Refresh an expired access token
    
    Args:
        refresh_token: Valid refresh token
        
    Returns:
        New tokens dictionary
    """
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise GoogleOAuthError("Google OAuth credentials not configured")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "refresh_token": refresh_token,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "grant_type": "refresh_token",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code != 200:
            raise GoogleOAuthError("Token refresh failed")
        
        return response.json()
