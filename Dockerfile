FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero (mejor uso de caché)
COPY package*.json ./
RUN npm install

# Copiar el esquema de Prisma y generar el cliente
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar el resto del código
COPY . .

# Compilar el proyecto
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:dev"]