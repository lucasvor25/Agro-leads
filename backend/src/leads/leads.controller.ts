import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { GetLeadsFilterDto } from './dto/get-leads-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) { }

  @Post()
  create(@Body() createLeadDto: CreateLeadDto, @Req() req: Request & { user: { id: number } }) {
    return this.leadsService.create(createLeadDto, req.user.id);
  }

  @Get()
  findAll(@Query() filterDto: GetLeadsFilterDto, @Req() req: Request & { user: { id: number } }) {
    return this.leadsService.findAll(filterDto, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request & { user: { id: number } }) {
    return this.leadsService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto, @Req() req: Request & { user: { id: number } }) {
    return this.leadsService.update(+id, updateLeadDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request & { user: { id: number } }) {
    return this.leadsService.remove(+id, req.user.id);
  }
}
