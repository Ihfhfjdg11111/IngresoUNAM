# IngresoUNAM - Contexto del Proyecto

## Descripción
Plataforma de preparación para el examen de admisión de la UNAM (Universidad Nacional Autónoma de México).

## Stack Tecnológico

### Backend
- **Framework:** FastAPI (Python)
- **Base de Datos:** MongoDB (motor.asyncio)
- **Autenticación:** JWT + Google OAuth 2.0
- **Validación:** Pydantic

### Frontend
- **Framework:** React 18
- **Estilos:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Routing:** React Router
- **Build Tool:** Create React App (CRA) + Craco

## Estructura de Archivos Clave

### Backend (`backend/`)
```
backend/
├── server.py                 # Entry point FastAPI
├── routes/                   # API Routes
│   ├── auth.py              # Autenticación (login, register, OAuth)
│   ├── attempts.py          # Intentos de examen
│   ├── admin.py             # Admin dashboard
│   ├── simulators.py        # Simulacros
│   ├── subjects.py          # Materias
│   └── payments.py          # Pagos/Stripe
├── services/                 # Lógica de negocio
│   ├── attempt_service.py   # Creación de attempts
│   ├── auth_service.py      # Hashing, tokens
│   └── subscription_service.py  # Suscripciones
├── models/                   # Pydantic models
│   ├── auth.py
│   ├── attempts.py
│   └── questions.py
└── utils/                    # Utilidades
    ├── database.py          # Conexión MongoDB
    ├── config.py            # Configuración
    ├── oauth.py             # Google OAuth
    ├── security.py          # Sanitización
    └── rate_limiter.py      # Rate limiting
```

### Frontend (`frontend/src/`)
```
frontend/src/
├── App.js                   # Entry point React
├── pages/                   # Vistas/Páginas
│   ├── Exam.jsx            # Pantalla de examen
│   ├── SubjectPractice.jsx # Práctica por materia
│   ├── Dashboard.jsx       # Panel principal
│   ├── Simulators.jsx      # Lista de simulacros
│   ├── Subjects.jsx        # Lista de materias
│   ├── Results.jsx         # Resultados de examen
│   ├── History.jsx         # Historial
│   ├── Login.jsx           # Login
│   ├── Register.jsx        # Registro
│   └── admin/              # Panel Admin
│       ├── AdminDashboard.jsx
│       ├── AdminQuestions.jsx
│       └── AdminUsers.jsx
└── components/              # Componentes reutilizables
    ├── ui/                 # shadcn/ui components
    └── Sidebar.jsx
```

## Convenciones de Código

### Backend (Python)
- Seguir PEP8
- Usar type hints
- Manejar errores con try/except apropiado
- Documentar funciones con docstrings
- Usar async/await para operaciones DB

### Frontend (React/JSX)
- Functional components con hooks
- Props destructuring
- Manejo de estado con useState/useEffect
- Context API para estado global (AuthContext)
- Tailwind para estilos

## Variables de Entorno Importantes

### Backend (`.env`)
```
MONGO_URL=mongodb://...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
ENV=development  # o production
```

### Frontend (`.env`)
```
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_STRIPE_PUBLIC_KEY=...
```

## Patrones Comunes

### Crear un nuevo endpoint
1. Definir Pydantic model en `models/`
2. Crear función en `routes/` con `@router.get/post/put/delete`
3. Usar `Depends(get_current_user)` para rutas protegidas
4. Usar `Depends(get_admin_user)` para rutas admin

### Crear una nueva página
1. Crear archivo en `frontend/src/pages/`
2. Usar `useContext(AuthContext)` para acceso a API y usuario
3. Usar componentes de `components/ui/`
4. Agregar ruta en `App.js`

## Testing

### Backend
```bash
cd backend
python -m pytest tests/
```

### Frontend
```bash
cd frontend
npm test
```

## Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `uvicorn server:app --reload` | Iniciar backend en desarrollo |
| `npm start` | Iniciar frontend en desarrollo |
| `npm run build` | Build de producción |

## Notas de Arquitectura

- **Autenticación:** JWT tokens + cookies de sesión opcional
- **Rate Limiting:** Implementado en memoria o Redis
- **CORS:** Configurado para permitir frontend
- **Seguridad:** Headers de seguridad, sanitización de inputs
- **Examenes:** Los attempts guardan question_ids para evitar regenerar preguntas
- **Suscripciones:** Stripe para pagos, MongoDB para estado de suscripción
