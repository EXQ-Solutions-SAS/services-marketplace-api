# EXQ Solutions - Services Marketplace API 🚀

Robust backend built with NestJS, Prisma, and PostgreSQL/PostGIS. Implements modular architecture, authentication with Firebase Auth, and geospatial logic for service connections.

## Quick Start (Docker)

Para levantar todo el entorno de desarrollo (API + PostgreSQL + PostGIS) de forma automática:

1. **Configurar variables de entorno:**
   Copia el archivo de ejemplo (si existe) o crea un `.env` basado en la sección de configuración.
    DB_USER=postgres
    DB_PASSWORD=pass
    DB_NAME=exq_marketplace

    DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}?schema=public"

2. **Levantar contenedores:**
   ```bash
   docker-compose up --build -d