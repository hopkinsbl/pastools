import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectRoleType } from '../../entities/project-role.entity';

export class UpdateRoleDto {
  @ApiProperty({
    enum: ProjectRoleType,
    example: ProjectRoleType.ENGINEER,
  })
  @IsEnum(ProjectRoleType)
  @IsNotEmpty()
  role: ProjectRoleType;
}
