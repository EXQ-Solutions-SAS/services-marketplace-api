import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard'; // Ajusta la ruta
import { GetUser } from '../auth/decorators/get-user.decorator'; // Ajusta la ruta

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  create(
    @Body() createServiceDto: CreateServiceDto,
    @GetUser('id') userId: string, // <-- Asegúrate de que este 'id' coincida con la propiedad que tu decorador extrae del request.user
  ) {
    console.log('ID del usuario creando servicio:', userId); // Agrega este log para debuguear
    return this.servicesService.create(createServiceDto, userId);
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }
}