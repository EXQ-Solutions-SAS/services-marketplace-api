import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Module({
  imports: [PrismaModule],
  providers: [AuthService, FirebaseAuthGuard],
  exports: [AuthService, FirebaseAuthGuard], // Exportalo para que otros módulos lo usen
})
export class AuthModule {}
