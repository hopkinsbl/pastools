import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectRoleType } from '../../entities/project-role.entity';

export class AssignRoleDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    enum: ProjectRoleType,
    example: ProjectRoleType.ENGINEER,
  })
  @IsEnum(ProjectRoleType)
  @IsNotEmpty()
  role: ProjectRoleType;
}
