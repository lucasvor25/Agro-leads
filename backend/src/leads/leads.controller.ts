import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { GetLeadsFilterDto } from './dto/get-leads-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) { }

  @Post()
  create(
    @Body() createLeadDto: CreateLeadDto,
    @GetUser('id') userId: number
  ) {
    return this.leadsService.create(createLeadDto, userId);
  }

  @Get()
  findAll(
    @Query() filterDto: GetLeadsFilterDto,
    @GetUser('id') userId: number
  ) {
    return this.leadsService.findAll(filterDto, userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number
  ) {
    return this.leadsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeadDto: UpdateLeadDto,
    @GetUser('id') userId: number
  ) {
    return this.leadsService.update(id, updateLeadDto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number
  ) {
    return this.leadsService.remove(id, userId);
  }
}
