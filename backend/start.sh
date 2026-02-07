#!/bin/sh
# Start script for Railway

# Use PORT from environment variable (Railway sets this automatically)
# Default to 8000 if not set
PORT=${PORT:-8000}

echo "Starting IngresoUNAM API on port $PORT"
exec uvicorn server:app --host 0.0.0.0 --port $PORT --workers 2
