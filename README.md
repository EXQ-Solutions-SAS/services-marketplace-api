# **🚀 Services Marketplace \- NestJS API**

Este es el núcleo del ecosistema **Services Marketplace**. Una API RESTful diseñada bajo principios de arquitectura modular, altamente escalable y lista para producción.

## **🛠️ Stack Tecnológico**

* **Framework:** [NestJS](https://www.google.com/search?q=https://nestjs.com/) (Node.js) con TypeScript.  
* **Base de Datos:** PostgreSQL (Gestionada en GCP Cloud SQL via Terraform).  
* **ORM:** TypeORM / Prisma (el que estés usando).  
* **Autenticación:** Firebase Admin SDK / JWT.  
* **Documentación:** Swagger / OpenAPI.

---

## **🏗️ Arquitectura y Patrones**

La API sigue una estructura modular para facilitar el mantenimiento:

* **Módulos Independientes:** Auth, Users, Services, Payments.  
* **DTOs (Data Transfer Objects):** Validación estricta de entrada con `class-validator`.  
* **Middlewares & Interceptors:** Manejo global de errores y transformación de respuestas.

---

## **⚙️ CI/CD & DevOps**

Este repositorio cuenta con un pipeline de **GitHub Actions** que garantiza la calidad del código en cada commit:

1. **Linting & Formatting:** Verificación de reglas de ESLint y Prettier.  
2. **Unit Testing:** Pruebas con Jest para lógica de negocio.  
3. **Build Validation:** Asegura que el proyecto compile correctamente.  
4. **Auto-Deploy (Comentado):** Preparado para despliegue automático en **Google Cloud Run**.

**Nota:** La infraestructura (VPC, Cloud Run, DB) se gestiona como código en el repositorio de [Terraform](https://www.google.com/search?q=./link-a-tu-repo-de-infra).

## **🚀 Instalación y Uso**

1. **Clonar el repositorio:**  
   Bash

```
git clone https://github.com/tu-usuario/repo-backend.git
```

2. **Instalar dependencias:**  
   Bash

```
npm install
```

3. **Configurar variables de entorno:** Copia el archivo `.env.example` a `.env` y completa tus credenciales.  
4. **Correr en desarrollo:**  
   Bash

```
npm run start:dev
```

