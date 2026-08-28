#!/bin/sh

set -e

echo "Waiting for PostgreSQL to be ready..."
# Normally we'd use something like wait-for-it or just rely on docker-compose depends_on healthcheck
# Docker compose 'depends_on: condition: service_healthy' handles this reliably for us.

echo "Running Alembic Database Migrations..."
alembic upgrade head

echo "Starting Uvicorn Server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
