import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  create(@Body() createPropertyDto: CreatePropertyDto, @Req() req: Request & { user: { id: number } }) {
    return this.propertiesService.create(createPropertyDto, req.user.id);
  }

  @Get()
  findAll(@Req() req: Request & { user: { id: number } }) {
    return this.propertiesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request & { user: { id: number } }) {
    return this.propertiesService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto, @Req() req: Request & { user: { id: number } }) {
    return this.propertiesService.update(+id, updatePropertyDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request & { user: { id: number } }) {
    return this.propertiesService.remove(+id, req.user.id);
  }
}
