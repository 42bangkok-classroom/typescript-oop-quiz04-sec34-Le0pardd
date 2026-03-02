import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
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

  getSummary() {
    return this.missions.reduce((acc, mission) => {
      const status = mission.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }

  async findAll(): Promise<IMissionResponse[]> {
    const filePath = path.join(process.cwd(), 'data', 'missions.json');
    const fileData = await fs.readFile(filePath, 'utf-8');
    const missionsFromJson: IMission[] = JSON.parse(fileData);

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
}
