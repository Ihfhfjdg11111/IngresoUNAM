# IngresoUNAM

Plataforma de preparación para el examen de admisión UNAM.

## Estructura

- `backend/` - API FastAPI + MongoDB
- `frontend/` - React + Tailwind CSS

## Configuración Rápida

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Crear .env con variables necesarias
uvicorn server:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Variables de Entorno

Crear `backend/.env`:
```
MONGO_URL=mongodb://localhost:27017/ingresounam
JWT_SECRET=tu_secreto_jwt
STRIPE_API_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CORS_ORIGINS=http://localhost:3000
```

## Tecnologías

- Python 3.11 + FastAPI
- MongoDB
- React 19
- Stripe
- Google OAuth
