import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Job } from '../entities/job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job]),
    BullModule.registerQueue(
      { name: 'import' },
      { name: 'export' },
      { name: 'validation' },
      { name: 'tests' },
    ),
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
