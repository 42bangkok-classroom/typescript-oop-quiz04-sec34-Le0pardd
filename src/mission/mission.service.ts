import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { IMission, IMissionResponse } from './mission.interface';

@Injectable()
export class MissionService {
  private readonly missions = [
    { id: 1, codename: 'OPERATION_STORM', status: 'ACTIVE' },
    { id: 2, codename: 'SILENT_SNAKE', status: 'COMPLETED' },
    { id: 3, codename: 'RED_DAWN', status: 'FAILED' },
    { id: 4, codename: 'BLACKOUT', status: 'ACTIVE' },
    { id: 5, codename: 'ECHO_FALLS', status: 'COMPLETED' },
    { id: 6, codename: 'GHOST_RIDER', status: 'COMPLETED' },
  ];

  getSummary(): Record<string, number> {
    return this.missions.reduce(
      (acc: Record<string, number>, mission) => {
        const status = mission.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  findAll(): IMissionResponse[] {
    const filePath = path.join(process.cwd(), 'data', 'missions.json');
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const missionsFromJson = JSON.parse(fileData) as IMission[];

    return missionsFromJson.map((mission) => {
      let durationDays = -1;

      if (mission.endDate !== null) {
        const start = new Date(mission.startDate).getTime();
        const end = new Date(mission.endDate).getTime();
        const diffTime = end - start;
        durationDays = diffTime / (1000 * 60 * 60 * 24);
      }

      return {
        ...mission,
        durationDays,
      };
    });
  }

  findOne(id: string, clearance: string): IMission {
    const filePath = path.join(process.cwd(), 'data', 'missions.json');
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const missionsFromJson = JSON.parse(fileData) as IMission[];

    const mission = missionsFromJson.find((m) => m.id === id);

    if (!mission) {
      throw new NotFoundException(`Mission with ID ${id} not found`);
    }

    const result = { ...mission };
    const isHighRisk =
      result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL';

    if (isHighRisk && clearance !== 'TOP_SECRET') {
      result.targetName = '***REDACTED***';
    }

    return result;
  }

  remove(id: string): { message: string } {
    const filePath = path.join(process.cwd(), 'data', 'missions.json');
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const missionsFromJson = JSON.parse(fileData) as IMission[];

    const missionIndex = missionsFromJson.findIndex((m) => m.id === id);

    if (missionIndex === -1) {
      throw new NotFoundException();
    }

    missionsFromJson.splice(missionIndex, 1);

    fs.writeFileSync(
      filePath,
      JSON.stringify(missionsFromJson, null, 2),
      'utf-8',
    );

    return {
      message: `Mission ID ${id} has been successfully deleted.`,
    };
  }
}
