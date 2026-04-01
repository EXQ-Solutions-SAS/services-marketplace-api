import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';

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
  findAll() {
    return this.servicesService.findAll();
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