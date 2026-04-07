import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMyProfile(@GetUser() user: any) {
    // El usuario ya viene completo desde el Guard
    return user;
  }

  @Patch('me')
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, dto);
  }

  @Delete('me')
  async deactivateAccount(@GetUser('id') userId: string) {
    return this.usersService.remove(userId);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN') // Solo el admin ve la lista completa
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch(':id/role')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.usersService.updateRole(id, updateRoleDto.role);
  }
}
