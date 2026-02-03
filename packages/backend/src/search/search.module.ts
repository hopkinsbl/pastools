import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Tag } from '../entities/tag.entity';
import { Equipment } from '../entities/equipment.entity';
import { Document } from '../entities/document.entity';
import { TechnicalQuery } from '../entities/technical-query.entity';
import { PunchlistItem } from '../entities/punchlist-item.entity';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tag,
      Equipment,
      Document,
      TechnicalQuery,
      PunchlistItem,
    ]),
    ProjectsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
