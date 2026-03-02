import { Controller, Get, Param, Query, Delete } from '@nestjs/common';
import { MissionService } from './mission.service';

@Controller('missions')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Get()
  findAll() {
    return this.missionService.findAll();
  }

  @Get('summary')
  getSummary() {
    return this.missionService.getSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('clearance') clearance?: string) {
    const userClearance = clearance || 'STANDARD';
    return this.missionService.findOne(id, userClearance);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.missionService.remove(id);
  }
}
