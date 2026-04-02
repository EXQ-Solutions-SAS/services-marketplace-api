import { Controller, Post, Body, UseGuards, Delete, Param, Get } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) { }

  @Post('register')
  @UseGuards(FirebaseAuthGuard)
  register(@GetUser('id') userId: string, @Body() registerDeviceDto: RegisterDeviceDto) {
    return this.devicesService.register(userId, registerDeviceDto);
  }

  @Get('my-devices')
  @UseGuards(FirebaseAuthGuard)
  getMyDevices(@GetUser('id') userId: string) {
    return this.devicesService.findByUserId(userId);
  }

  // src/devices/devices.controller.ts

  @Delete('unregister') // Cambiamos la ruta para que no espere parámetro en URL
  @UseGuards(FirebaseAuthGuard)
  remove(@Body('token') token: string) { // <--- Ahora lo saca del JSON del Body
    return this.devicesService.removeToken(token);
  }
}