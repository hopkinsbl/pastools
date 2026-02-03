import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectRolesService } from './project-roles.service';
import { ProjectRolesController } from './project-roles.controller';
import { ProjectRole } from '../entities/project-role.entity';
import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectRole, User, Project]),
    AuthModule,
  ],
  controllers: [ProjectRolesController],
  providers: [ProjectRolesService],
  exports: [ProjectRolesService],
})
export class ProjectRolesModule {}
