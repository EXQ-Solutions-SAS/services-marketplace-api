import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { DevicesModule } from 'src/devices/devices.module';

@Module({
  imports: [DevicesModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
