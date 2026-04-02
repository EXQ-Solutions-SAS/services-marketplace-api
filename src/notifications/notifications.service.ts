import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { DevicesService } from '../devices/devices.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly devicesService: DevicesService) {}

  async notifyUser(userId: string, title: string, body: string, data?: any) {
    // 1. Buscamos todos los tokens del usuario en la tabla Device
    const devices = await this.devicesService.findByUserId(userId);
    const tokens = devices.map((d) => d.token);

    if (tokens.length === 0) {
      this.logger.warn(`Usuario ${userId} no tiene dispositivos registrados.`);
      return;
    }

    // 2. Preparamos el mensaje para Firebase
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: { title, body },
      data: data || {}, // Información extra (ej: bookingId)
      android: { priority: 'high' },
      apns: { payload: { aps: { contentAvailable: true } } },
    };

    try {
      // 3. Enviamos a todos los dispositivos
      const response = await admin.messaging().sendEachForMulticast(message);
      
      this.logger.log(`Notificaciones enviadas: ${response.successCount} exitosas.`);

      // 4. LIMPIEZA AUTOMÁTICA: Si Firebase dice que un token ya no sirve, lo borramos
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success && (resp.error?.code === 'messaging/invalid-registration-token' || 
                                resp.error?.code === 'messaging/registration-token-not-registered')) {
            this.devicesService.removeToken(tokens[idx]);
            this.logger.log(`Token expirado eliminado: ${tokens[idx]}`);
          }
        });
      }
    } catch (error) {
      this.logger.error('Error enviando notificación push', error);
    }
  }
}