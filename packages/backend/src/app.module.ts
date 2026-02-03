import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProjectRolesModule } from './project-roles/project-roles.module';
import { AuditModule } from './audit/audit.module';
import { StorageModule } from './storage/storage.module';
import { ProjectsModule } from './projects/projects.module';
import { TagsModule } from './tags/tags.module';
import { EquipmentModule } from './equipment/equipment.module';
import { AlarmsModule } from './alarms/alarms.module';
import { DocumentsModule } from './documents/documents.module';
import { LinksModule } from './links/links.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { SearchModule } from './search/search.module';
import { ImportModule } from './import/import.module';
import { ValidationModule } from './validation/validation.module';
import { MergeModule } from './merge/merge.module';
import { ExportModule } from './export/export.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'pastools'),
        password: configService.get('DATABASE_PASSWORD', 'pastools_dev_password'),
        database: configService.get('DATABASE_NAME', 'pastools'),
        entities: [__dirname + '/entities/*.entity{.ts,.js}'],
        synchronize: false,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: true,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Job Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),

    // Authentication
    AuthModule,

    // Project Management
    ProjectsModule,

    // Project Roles
    ProjectRolesModule,

    // Audit Logging
    AuditModule,

    // File Storage
    StorageModule,

    // CDM Entities
    TagsModule,
    EquipmentModule,
    AlarmsModule,
    DocumentsModule,

    // Universal Linking
    LinksModule,

    // Attachments
    AttachmentsModule,

    // Search
    SearchModule,

    // Import
    ImportModule,

    // Validation
    ValidationModule,

    // Merge and Deduplication
    MergeModule,

    // Export
    ExportModule,

    // Jobs Management
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
