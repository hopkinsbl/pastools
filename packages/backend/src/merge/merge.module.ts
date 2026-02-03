import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MergeController } from './merge.controller';
import { MergeService } from './merge.service';
import { Tag } from '../entities/tag.entity';
import { Equipment } from '../entities/equipment.entity';
import { Alarm } from '../entities/alarm.entity';
import { Document } from '../entities/document.entity';
import { Link } from '../entities/link.entity';
import { Attachment } from '../entities/attachment.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Project } from '../entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tag,
      Equipment,
      Alarm,
      Document,
      Link,
      Attachment,
      AuditLog,
      Project,
    ]),
  ],
  controllers: [MergeController],
  providers: [MergeService],
  exports: [MergeService],
})
export class MergeModule {}
