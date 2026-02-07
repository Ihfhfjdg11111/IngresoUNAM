FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Puerto expuesto (Railway asigna puerto dinámico via $PORT)
EXPOSE 8000

# Script de inicio
COPY start.sh .
RUN chmod +x start.sh

# Comando de inicio
CMD ["./start.sh"]
