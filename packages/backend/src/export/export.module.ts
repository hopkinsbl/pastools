import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { ExportProcessor } from './export.processor';
import { Job } from '../entities/job.entity';
import { Tag } from '../entities/tag.entity';
import { Equipment } from '../entities/equipment.entity';
import { Alarm } from '../entities/alarm.entity';
import { Document } from '../entities/document.entity';
import { TechnicalQuery } from '../entities/technical-query.entity';
import { PunchlistItem } from '../entities/punchlist-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Job,
      Tag,
      Equipment,
      Alarm,
      Document,
      TechnicalQuery,
      PunchlistItem,
    ]),
    BullModule.registerQueue({
      name: 'export',
    }),
  ],
  controllers: [ExportController],
  providers: [ExportService, ExportProcessor],
  exports: [ExportService],
})
export class ExportModule {}
