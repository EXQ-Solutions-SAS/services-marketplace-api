import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { SearchServiceDto } from './dto/search-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('PROVIDER', 'ADMIN', 'CLIENT')
  create(@Body() createServiceDto: CreateServiceDto, @GetUser('id') userId: string) {
    return this.servicesService.create(createServiceDto, userId);
  }

  @Get()
  findAll(@Query('excludeUserId') excludeUserId?: string) {
    // Ahora permitimos pasar un ID para no mostrar los servicios de ese usuario
    return this.servicesService.findAll(excludeUserId);
  }

  @Get('search')
  async search(@Query() query: SearchServiceDto) {
    return this.servicesService.search(query);
  }

  @Get('mine') // <--- NUEVO: Debe ir ANTES de Get(':id') para que Nest no lo confunda con un ID
  @UseGuards(FirebaseAuthGuard)
  findMyServices(@GetUser('id') userId: string) {
    return this.servicesService.findMyServices(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @GetUser('id') userId: string
  ) {
    return this.servicesService.update(id, updateServiceDto, userId);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.servicesService.remove(id, userId);
  }


}