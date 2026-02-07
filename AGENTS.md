# IngresoUNAM - Agent Guide

> **Versión:** 1.0  
> **Idioma principal:** Español (código y documentación)  
> **Última actualización:** 2026-02-07

---

## Resumen del Proyecto

**IngresoUNAM** es una plataforma web de preparación para el examen de admisión a la Universidad Nacional Autónoma de México (UNAM). La aplicación permite a los estudiantes practicar con simulacros de exámenes, estudiar por materia, y realizar un seguimiento de su progreso.

### Funcionalidades Principales

- **Modo Práctica:** Práctica por materia con preguntas aleatorias (5-30 preguntas por sesión)
- **Simulacros completos:** 4 áreas del examen UNAM (120 preguntas, 3 horas)
- **Sistema de Suscripción:** Plan gratuito (limitado) y Premium (ilimitado)
- **Seguimiento de Progreso:** Estadísticas detalladas por área y materia
- **Panel de Administración:** Gestión de preguntas, usuarios, textos de lectura y reportes
- **Pagos:** Integración con Stripe para suscripciones mensuales/trimestrales
- **Autenticación:** Email/password y Google OAuth

---

## Arquitectura del Proyecto

```
ingresounam/
├── backend/               # API FastAPI + MongoDB
│   ├── models/            # Modelos Pydantic para validación
│   ├── routes/            # Endpoints de la API
│   ├── services/          # Lógica de negocio
│   ├── utils/             # Utilidades y configuración
│   ├── tests/             # Tests con pytest
│   ├── server.py          # Punto de entrada principal
│   ├── seed_data.py       # Datos de prueba
│   └── requirements.txt   # Dependencias Python
└── frontend/              # React 19 + Tailwind CSS
    ├── src/
    │   ├── components/        # Componentes reutilizables
    │   │   ├── animations/    # Animaciones con Framer Motion
    │   │   └── ui/            # Componentes shadcn/ui (40+)
    │   ├── pages/             # Páginas de la aplicación
    │   ├── contexts/          # Contextos React (Theme, AdminData)
    │   ├── hooks/             # Custom hooks
    │   └── lib/               # Utilidades
    ├── public/
    ├── package.json           # Dependencias Node.js
    ├── tailwind.config.js     # Configuración Tailwind
    └── jsconfig.json          # Configuración paths (@/*)
```

### Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Backend** | Python | 3.11+ |
| | FastAPI | 0.110.1 |
| | Motor (MongoDB async) | 3.3.1 |
| | PyJWT | 2.10.1 |
| | Stripe | 14.1.0 |
| | bcrypt | 4.1.3 |
| | pydantic | 2.12.5 |
| **Frontend** | React | 19.0.0 |
| | React Router | 7.5.1 |
| | Tailwind CSS | 3.4.17 |
| | shadcn/ui | latest |
| | Framer Motion | 12.29.2 |
| | Radix UI | ^1.x |
| **Base de datos** | MongoDB | 4.5+ |

---

## Configuración del Entorno

### Variables de Entorno - Backend (`backend/.env`)

```env
# Base de datos MongoDB (Atlas o local) - REQUERIDO
MONGO_URL=mongodb+srv://usuario:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=ingresounam

# Seguridad JWT - REQUERIDO
JWT_SECRET=tu_secreto_jwt_muy_seguro_32_caracteres_o_mas

# CORS - Incluye URLs de desarrollo local
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Stripe (pagos) - Opcional para desarrollo
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google OAuth - Opcional para desarrollo
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/login

# Redis (opcional - rate limiting)
# REDIS_URL=redis://localhost:6379/0
```

### Variables de Entorno - Frontend (`frontend/.env`)

```env
REACT_APP_BACKEND_URL=http://localhost:8000
DANGEROUSLY_DISABLE_HOST_CHECK=true
DISABLE_ESLINT_PLUGIN=true
ESLINT_NO_DEV_ERRORS=true
```

---

## Comandos de Desarrollo

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv .venv

# Activar (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor de desarrollo
uvicorn server:app --reload --host 0.0.0.0 --port 8000

# El servidor estará en http://localhost:8000
# Documentación API (requiere ENABLE_DOCS=true): http://localhost:8000/api/docs
```

### Frontend

```bash
cd frontend

# Instalar dependencias (usando yarn o npm)
yarn install
# o
npm install

# Iniciar servidor de desarrollo
yarn start
# o
npm start

# El servidor estará en http://localhost:3000
```

### Tests

```bash
# Backend - Ejecutar tests (requiere servidor corriendo)
cd backend
$env:REACT_APP_BACKEND_URL="http://localhost:8000"
pytest tests/test_bug_fixes.py -v

# Frontend - Tests integrados con react-scripts
cd frontend
npm test
```

---

## Estructura de la API

### Endpoints Principales

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registro de usuario | Público |
| POST | `/api/auth/login` | Inicio de sesión | Público |
| GET | `/api/auth/me` | Perfil del usuario actual | JWT |
| GET | `/api/auth/google/url` | URL para OAuth de Google | Público |
| POST | `/api/auth/google/callback` | Callback de Google OAuth | Público |
| GET | `/api/subjects` | Lista de materias con conteo | JWT |
| GET | `/api/subjects/{id}/questions` | Preguntas por materia (admin) | Admin |
| POST | `/api/practice/start` | Iniciar sesión de práctica | JWT |
| POST | `/api/practice/{id}/submit` | Enviar respuestas de práctica | JWT |
| GET | `/api/practice/{id}/review` | Revisar práctica completada | JWT |
| GET | `/api/simulators` | Lista de simulacros | JWT |
| POST | `/api/attempts` | Crear intento de examen | JWT |
| GET | `/api/attempts` | Lista de intentos del usuario | JWT |
| GET | `/api/attempts/{id}` | Detalle de intento | JWT |
| GET | `/api/attempts/{id}/questions` | Obtener preguntas del intento | JWT |
| POST | `/api/attempts/{id}/save-progress` | Guardar progreso parcial | JWT |
| POST | `/api/attempts/{id}/submit` | Enviar respuestas del examen | JWT |
| GET | `/api/user/limits` | Límites del usuario | JWT |
| POST | `/api/payments/checkout` | Crear sesión de pago Stripe | JWT |
| GET | `/api/admin/stats` | Estadísticas (admin) | Admin |
| GET | `/api/admin/users` | Lista de usuarios (admin) | Admin |
| POST | `/api/seed` | Poblar base de datos | Local/Admin |

### Configuración del Examen UNAM

El examen tiene 4 áreas configuradas en `backend/utils/config.py`:

- **Área 1:** Ciencias Físico-Matemáticas e Ingenierías (azul) - 120 preguntas
- **Área 2:** Ciencias Biológicas, Químicas y de la Salud (verde) - 120 preguntas
- **Área 3:** Ciencias Sociales (naranja) - 120 preguntas
- **Área 4:** Humanidades y Artes (rojo) - 120 preguntas

Cada área tiene distribución específica de preguntas entre 9-10 materias.

---

## Modelos de Datos Principales

### Usuario
```python
{
  "user_id": "user_xxx",
  "email": "usuario@email.com",
  "name": "Nombre",
  "role": "student" | "admin",
  "is_premium": bool,
  "picture": "url_opcional",
  "preferences": {"carrera": "...", "plantel": "..."},
  "created_at": "ISO datetime"
}
```

### Pregunta
```python
{
  "question_id": "q_xxx",
  "subject_id": "subj_xxx",
  "topic": "Tema",
  "text": "Texto de la pregunta",
  "options": ["A", "B", "C", "D"],
  "correct_answer": 0-3,
  "explanation": "Explicación",
  "image_url": "url opcional",
  "option_images": [urls opcionales],
  "reading_text_id": "text_id opcional"
}
```

### Intento de Examen
```python
{
  "attempt_id": "attempt_xxx",
  "user_id": "user_xxx",
  "simulator_id": "sim_xxx",
  "question_ids": ["q_xxx", ...],
  "answers": [...],
  "score": int,
  "status": "in_progress" | "completed" | "abandoned",
  "started_at": "ISO datetime",
  "finished_at": "ISO datetime",
  "saved_progress": {"question_index": int, "answers": [...], "time_remaining": int}
}
```

### Sesión de Práctica
```python
{
  "practice_id": "practice_xxx",
  "user_id": "user_xxx",
  "subject_id": "subj_xxx",
  "subject_name": "Nombre Materia",
  "question_ids": ["q_xxx", ...],
  "answers": [...],
  "score": int,
  "status": "in_progress" | "completed",
  "started_at": "ISO datetime",
  "finished_at": "ISO datetime"
}
```

---

## Sistema de Suscripción (Freemium)

### Límites Usuario Gratuito

```python
# backend/utils/config.py
FREE_SIMULATORS_PER_AREA = 3           # 3 simulacros por área
FREE_PRACTICE_ATTEMPTS_PER_DAY = 5     # 5 prácticas por día
FREE_PRACTICE_QUESTIONS_PER_DAY = 10   # 10 preguntas por práctica
```

### Planes Premium

- **Mensual:** $10 MXN / 30 días
- **Trimestral:** $25 MXN / 90 días (ahorro 17%)

Los usuarios Premium tienen acceso ilimitado a todas las funcionalidades.

---

## Guías de Desarrollo

### Estilo de Código

**Python (Backend):**
- Formateador: `black` (incluido en requirements.txt)
- Import sorter: `isort` (incluido en requirements.txt)
- Type checker: `mypy` (incluido en requirements.txt)
- Linter: `flake8` (incluido en requirements.txt)

**JavaScript/React (Frontend):**
- ESLint configurado en `devDependencies`
- Hooks rules: `eslint-plugin-react-hooks`
- JSX a11y: `eslint-plugin-jsx-a11y`

### Convenciones de Nomenclatura

- **Backend:**
  - Modelos Pydantic: `PascalCase` (e.g., `UserCreate`, `QuestionResponse`)
  - Funciones/variables: `snake_case`
  - IDs generados: `{prefix}_{uuid_short}` (e.g., `user_abc123`, `q_def456`)
  
- **Frontend:**
  - Componentes React: `PascalCase` (e.g., `Dashboard.jsx`, `AdminUsers.jsx`)
  - Hooks custom: `useCamelCase` (e.g., `useCachedFetch.js`)
  - Utilidades: `camelCase` (e.g., `utils.js`)

### Base de Datos - MongoDB

La aplicación usa **Motor** (driver async de MongoDB). Colecciones principales:

- `users` - Usuarios registrados
- `subjects` - Materias del examen (10 materias)
- `questions` - Preguntas del banco
- `simulators` - Configuración de simulacros (4 áreas)
- `attempts` - Intentos de examen
- `practice_sessions` - Sesiones de práctica
- `subscriptions` - Suscripciones de pago
- `user_sessions` - Sesiones activas (con TTL index)
- `feedback` - Retroalimentación de usuarios
- `unam_scores` - Datos de puntajes UNAM 2025
- `reading_texts` - Textos de lectura para preguntas

Índices importantes definidos en `utils/database.py`:
- TTL index en `user_sessions` para auto-expirar sesiones
- Unique index en `attempts` para prevenir duplicados en progreso
- Unique index en `users.email`
- Index en `attempts` por `user_id` + `started_at`

### Seguridad

- JWT tokens con expiración de 7 días (`JWT_EXPIRATION_HOURS = 24 * 7`)
- Rate limiting (configurable con Redis)
- Headers de seguridad en todas las respuestas (X-Content-Type-Options, X-Frame-Options, etc.)
- CORS configurado por variables de entorno
- Sanitización de strings de entrada (`sanitize_string` en `utils/security.py`)
- Validación de URLs para imágenes (`validate_url`)
- Contraseñas hasheadas con bcrypt
- HTTP-only cookies para sesiones

---

## Seeds y Datos de Prueba

### Poblar Base de Datos

```bash
# Con el servidor corriendo
curl -X POST http://localhost:8000/api/seed
```

Esto crea:
- 10 materias del examen UNAM
- 300 preguntas de ejemplo (30 por materia)
- 4 simulacros (uno por área)
- Usuario admin: `admin@ingresounam.com` / `admin123`

### Datos UNAM 2025

```bash
# Ejecutar script para cargar datos de puntajes UNAM 2025
cd backend
python seed_unam_scores_2025.py
```

---

## Solución de Problemas Comunes

### Error: "Authentication failed" (MongoDB)
- Verificar que la contraseña sea correcta
- Codificar caracteres especiales: `@` → `%40`, `:` → `%3A`
- Verificar IP whitelist en MongoDB Atlas

### Error: CORS
- Verificar `CORS_ORIGINS` incluya el origen del frontend
- En desarrollo: incluir `http://localhost:3000`

### Error: Stripe webhook
- Verificar `STRIPE_WEBHOOK_SECRET` correcto
- Para desarrollo local, usar Stripe CLI: `stripe listen --forward-to localhost:8000/api/payments/webhook`

---

## Tests Críticos

Los tests en `backend/tests/test_bug_fixes.py` verifican:

1. **Bug 1:** Reanudar examen carga las mismas preguntas guardadas
2. **Bug 2:** Usuarios no-admin ven `question_count` en `/api/subjects`
3. **Bug 3:** Práctica por materia permite cambiar respuestas (frontend)
4. **Bug 4:** Estadísticas admin muestran `premium_users` correcto desde subscriptions

---

## Estructura de Directorios Detallada

### Backend

```
backend/
├── models/              # Validación Pydantic
│   ├── __init__.py
│   ├── attempts.py      # Modelos de intentos
│   ├── auth.py          # Modelos de autenticación
│   ├── payments.py      # Modelos de pagos
│   ├── questions.py     # Modelos de preguntas y textos
│   ├── simulators.py    # Modelos de simulacros
│   ├── subjects.py      # Modelos de materias
│   └── users.py         # Modelos de usuarios
├── routes/              # Endpoints API
│   ├── __init__.py      # Router principal
│   ├── admin.py         # Rutas de administración
│   ├── analytics.py     # Analíticas
│   ├── attempts.py      # Gestión de intentos
│   ├── auth.py          # Autenticación
│   ├── feedback.py      # Feedback de usuarios
│   ├── payments.py      # Pagos Stripe
│   ├── questions.py     # Gestión de preguntas
│   ├── reports.py       # Reportes
│   ├── simulators.py    # Simulacros
│   ├── subjects.py      # Materias
│   ├── unam_scores.py   # Puntajes UNAM
│   └── user_preferences.py  # Preferencias
├── services/            # Lógica de negocio
│   ├── __init__.py
│   ├── attempt_service.py      # Servicio de intentos
│   ├── auth_service.py         # Servicio de autenticación
│   └── subscription_service.py # Servicio de suscripciones
├── tests/               # Tests pytest
│   ├── conftest.py
│   ├── test_bug_fixes.py
│   └── test_new_features.py
├── utils/               # Utilidades
│   ├── __init__.py
│   ├── auth.py          # Helpers de auth
│   ├── cache.py         # Caché
│   ├── config.py        # Configuración global
│   ├── database.py      # Conexión MongoDB
│   ├── database_indexes.py  # Índices DB
│   ├── helpers.py       # Helpers generales
│   ├── oauth.py         # Google OAuth
│   ├── rate_limiter.py  # Rate limiting
│   └── security.py      # Sanitización/validación
├── server.py            # Punto de entrada FastAPI
├── seed_data.py         # Script de seed
├── seed_unam_scores_2025.py  # Datos UNAM
├── requirements.txt     # Dependencias
└── requirements-prod.txt  # Dependencias producción
```

### Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── animations/      # Componentes de animación
│   │   │   ├── AnimatedCounter.jsx
│   │   │   ├── FadeIn.jsx
│   │   │   ├── FloatingElements.jsx
│   │   │   ├── GradientText.jsx
│   │   │   ├── PageTransition.jsx
│   │   │   ├── ScaleOnHover.jsx
│   │   │   └── index.js
│   │   ├── ui/              # Componentes shadcn/ui (40+ componentes)
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   └── ...
│   │   ├── FeedbackButton.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── UserLimits.jsx
│   ├── contexts/
│   │   ├── AdminDataContext.js
│   │   └── ThemeContext.js
│   ├── hooks/
│   │   ├── use-toast.js
│   │   ├── useAdminResource.js
│   │   ├── useCachedFetch.js
│   │   └── usePrefetch.js
│   ├── lib/
│   │   └── utils.js         # Utilidades (cn function)
│   ├── pages/
│   │   ├── admin/           # Páginas de administración
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminFeedback.jsx
│   │   │   ├── AdminQuestions.jsx
│   │   │   ├── AdminReadingTexts.jsx
│   │   │   ├── AdminReports.jsx
│   │   │   ├── AdminSimulators.jsx
│   │   │   └── AdminUsers.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Exam.jsx
│   │   ├── History.jsx
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Onboarding.jsx
│   │   ├── PaymentCancel.jsx
│   │   ├── PaymentSuccess.jsx
│   │   ├── Plans.jsx
│   │   ├── Register.jsx
│   │   ├── Results.jsx
│   │   ├── Simulators.jsx
│   │   ├── SubjectPractice.jsx
│   │   └── Subjects.jsx
│   ├── App.css
│   ├── App.js
│   └── index.css
├── public/
│   └── index.html
├── components.json      # Configuración shadcn/ui
├── jsconfig.json        # Configuración paths
├── package.json
└── tailwind.config.js   # Configuración Tailwind
```

---

## Notas para Agentes de IA

1. **Idioma:** Todo el código y comentarios están en español. Mantener consistencia.
2. **Validación:** Usar siempre modelos Pydantic para validación de entrada en el backend.
3. **Autenticación:** Verificar JWT en rutas protegidas usando `get_current_user`.
4. **Permisos:** Validar roles (student/admin) antes de operaciones sensibles.
5. **Base de datos:** Usar `db.collection` desde `utils.database` para operaciones MongoDB.
6. **Frontend:** Usar componentes de `components/ui/` para mantener consistencia visual.
7. **Estado:** Usar Context API para estado global (auth, theme, admin data).
8. **Estilos:** Usar Tailwind CSS con las clases de shadcn/ui. Función `cn()` para mergear clases.
9. **IDs:** Generar IDs únicos con formato `{prefix}_{uuid_short}` vía `AuthService.generate_id()`.
10. **Pagos:** Siempre verificar estado de suscripción vía `SubscriptionService` para funciones premium.
11. **Imports:** Usar paths absolutos con `@/` en frontend (ej: `import { cn } from "@/lib/utils"`).
12. **CORS:** En desarrollo, el frontend usa proxy configurado en `package.json` para redirigir `/api` al backend.

---

## Recursos Adicionales

- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Motor Documentation:** https://motor.readthedocs.io/
- **FastAPI Documentation:** https://fastapi.tiangolo.com/
- **Stripe Documentation:** https://stripe.com/docs/api
- **shadcn/ui:** https://ui.shadcn.com/
