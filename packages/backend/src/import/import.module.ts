import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { BullModule } from '@nestjs/bullmq';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { ImportProcessor } from './import.processor';
import { ImportProfile } from '../entities/import-profile.entity';
import { Job } from '../entities/job.entity';
import { Tag } from '../entities/tag.entity';
import { Equipment } from '../entities/equipment.entity';
import { Alarm } from '../entities/alarm.entity';
import { Document } from '../entities/document.entity';
import { ValidationModule } from '../validation/validation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImportProfile,
      Job,
      Tag,
      Equipment,
      Alarm,
      Document,
    ]),
    MulterModule.register({
      dest: './uploads',
    }),
    BullModule.registerQueue({
      name: 'import',
    }),
    ValidationModule,
  ],
  controllers: [ImportController],
  providers: [ImportService, ImportProcessor],
  exports: [ImportService],
})
export class ImportModule {}
