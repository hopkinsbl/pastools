import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { Tag } from '../entities/tag.entity';
import { ProjectsModule } from '../projects/projects.module';
import { LinksModule } from '../links/links.module';
import { AttachmentsModule } from '../attachments/attachments.module';
import { ValidationModule } from '../validation/validation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag]),
    ProjectsModule,
    LinksModule,
    AttachmentsModule,
    ValidationModule,
  ],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
