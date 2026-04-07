import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg'; // Necesitamos el Pool de la librería 'pg'
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const url = process.env.DATABASE_URL?.replace(/"/g, '');
    // 1. Creamos el pool de conexiones nativo de Postgres
    const pool = new Pool({ connectionString: url });
    // 2. Creamos el adaptador de Prisma usando ese pool
    const adapter = new PrismaPg(pool);

    // 3. Pasamos el adaptador al constructor del cliente
    super({ adapter });

    console.log('🚀 PrismaService inicializado con Native Adapter (pg)');
  }

  async onModuleInit() {
    // Con el adaptador, esto abrirá la conexión a través del pool de 'pg'
    await this.$connect();
    console.log('✅ Conexión exitosa mediante Adaptador');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
