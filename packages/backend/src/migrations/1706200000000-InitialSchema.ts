import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1706200000000 implements MigrationInterface {
  name = 'InitialSchema1706200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid-ossp extension for uuid_generate_v4()
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "username" varchar NOT NULL UNIQUE,
        "passwordHash" varchar NOT NULL,
        "email" varchar NOT NULL,
        "fullName" varchar NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create projects table
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "description" text,
        "metadata" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        CONSTRAINT "FK_projects_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id")
      )
    `);

    // Create project_roles table
    await queryRunner.query(`
      CREATE TYPE "project_role_type_enum" AS ENUM ('Admin', 'Engineer', 'Viewer', 'Approver');
      CREATE TABLE "project_roles" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "projectId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "role" "project_role_type_enum" NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_project_roles_projectId" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_project_roles_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create tags table
    await queryRunner.query(`
      CREATE TYPE "tag_type_enum" AS ENUM ('AI', 'AO', 'DI', 'DO', 'PID', 'Valve', 'Drive', 'Totaliser', 'Calc');
      CREATE TABLE "tags" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "projectId" uuid NOT NULL,
        "type" "tag_type_enum" NOT NULL,
        "name" varchar NOT NULL,
        "description" text,
        "engineeringUnits" varchar,
        "scaleLow" float,
        "scaleHigh" float,
        "metadata" jsonb,
        "importLineage" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        CONSTRAINT "FK_tags_projectId" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tags_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_tags_projectId_name" ON "tags" ("projectId", "name")`);
    await queryRunner.query(`CREATE INDEX "IDX_tags_projectId_type" ON "tags" ("projectId", "type")`);

    // Create equipment table
    await queryRunner.query(`
      CREATE TABLE "equipment" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "projectId" uuid NOT NULL,
        "name" varchar NOT NULL,
        "description" text,
        "type" varchar,
        "location" varchar,
        "metadata" jsonb,
        "importLineage" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        CONSTRAINT "FK_equipment_projectId" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_equipment_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_equipment_projectId_name" ON "equipment" ("projectId", "name")`);

    // Create alarms table
    await queryRunner.query(`
      CREATE TYPE "alarm_priority_enum" AS ENUM ('Critical', 'High', 'Medium', 'Low');
      CREATE TABLE "alarms" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "projectId" uuid NOT NULL,
        "tagId" uuid NOT NULL,
        "priority" "alarm_priority_enum" NOT NULL,
        "setpoint" float,
        "rationalization" text,
        "consequence" text,
        "operatorAction" text,
        "metadata" jsonb,
        "importLineage" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        CONSTRAINT "FK_alarms_projectId" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_alarms_tagId" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_alarms_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_alarms_projectId_tagId" ON "alarms" ("projectId", "tagId")`);
    await queryRunner.query(`CREATE INDEX "IDX_alarms_projectId_priority" ON "alarms" ("projectId", "priority")`);

    // Create documents table
    await queryRunner.query(`
      CREATE TABLE "documents" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "projectId" uuid NOT NULL,
        "title" varchar NOT NULL,
        "type" varchar,
        "version" varchar,
        "fileId" uuid,
        "metadata" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        CONSTRAINT "FK_documents_projectId" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_documents_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_documents_projectId" ON "documents" ("projectId")`);

    // Create technical_queries table
    await queryRunner.query(`
      CREATE TYPE "tq_priority_enum" AS ENUM ('Critical', 'High', 'Medium', 'Low');
      CREATE TYPE "tq_status_enum" AS ENUM ('Draft', 'Submitted', 'UnderReview', 'Answered', 'Approved', 'Closed');
      CREATE TABLE "technical_queries" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "projectId" uuid NOT NULL,
        "title" varchar NOT NULL,
        "description" text NOT NULL,
        "category" varchar,
        "priority" "tq_priority_enum" NOT NULL,
        "status" "tq_status_enum" NOT NULL DEFAULT 'Draft',
        "impactFlags" jsonb,
        "answer" text,
        "metadata" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        "assignedTo" uuid,
        CONSTRAINT "FK_technical_queries_projectId" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_technical_queries_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id"),
        CONSTRAINT "FK_technical_queries_assignedTo" FOREIGN KEY ("assignedTo") REFERENCES "users"("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_technical_queries_projectId_status" ON "technical_queries" ("projectId", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_technical_queries_projectId_assignedTo" ON "technical_queries" ("projectId", "assignedTo")`);

    // Create tq_comments table
    await queryRunner.query(`
      CREATE TABLE "tq_comments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tqId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "comment" text NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_tq_comments_tqId" FOREIGN KEY ("tqId") REFERENCES "technical_queries"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tq_comments_userId" FOREIGN KEY ("userId") REFERENCES "users"("id")
      )
    `);

    // Create punchlist_items table
    await queryRunner.query(`
      CREATE TYPE "punchlist_category_enum" AS ENUM ('A', 'B', 'C');
      CREATE TYPE "punchlist_priority_enum" AS ENUM ('Critical', 'High', 'Medium', 'Low');
      CREATE TYPE "punchlist_status_enum" AS ENUM ('Open', 'InProgress', 'PendingVerification', 'Closed');
      CREATE TABLE "punchlist_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "projectId" uuid NOT NULL,
        "description" text NOT NULL,
        "category" "punchlist_category_enum" NOT NULL,
        "priority" "punchlist_priority_enum" NOT NULL,
        "status" "punchlist_status_enum" NOT NULL DEFAULT 'Open',
        "closureCriteria" text,
        "evidenceRequired" boolean NOT NULL DEFAULT false,
        "assignedTo" uuid,
        "metadata" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "closedAt" timestamp,
        "createdBy" uuid NOT NULL,
        CONSTRAINT "FK_punchlist_items_projectId" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_punchlist_items_assignedTo" FOREIGN KEY ("assignedTo") REFERENCES "users"("id"),
        CONSTRAINT "FK_punchlist_items_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_punchlist_items_projectId_status" ON "punchlist_items" ("projectId", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_punchlist_items_projectId_category" ON "punchlist_items" ("projectId", "category")`);
    await queryRunner.query(`CREATE INDEX "IDX_punchlist_items_projectId_assignedTo" ON "punchlist_items" ("projectId", "assignedTo")`);

    // Create links table
    await queryRunner.query(`
      CREATE TABLE "links" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "sourceEntityType" varchar NOT NULL,
        "sourceEntityId" uuid NOT NULL,
        "targetEntityType" varchar NOT NULL,
        "targetEntityId" uuid NOT NULL,
        "linkType" varchar,
        "description" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        CONSTRAINT "FK_links_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_links_sourceEntityType_sourceEntityId" ON "links" ("sourceEntityType", "sourceEntityId")`);
    await queryRunner.query(`CREATE INDEX "IDX_links_targetEntityType_targetEntityId" ON "links" ("targetEntityType", "targetEntityId")`);

    // Create files table
    await queryRunner.query(`
      CREATE TABLE "files" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "filename" varchar NOT NULL,
        "contentType" varchar NOT NULL,
        "size" bigint NOT NULL,
        "storageKey" varchar NOT NULL,
        "uploadedAt" timestamp NOT NULL DEFAULT now(),
        "uploadedBy" uuid NOT NULL,
        CONSTRAINT "FK_files_uploadedBy" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id")
      )
    `);

    // Create attachments table
    await queryRunner.query(`
      CREATE TABLE "attachments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "entityType" varchar NOT NULL,
        "entityId" uuid NOT NULL,
        "fileId" uuid NOT NULL,
        "description" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        CONSTRAINT "FK_attachments_fileId" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_attachments_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_attachments_entityType_entityId" ON "attachments" ("entityType", "entityId")`);

    // Create baselines table
    await queryRunner.query(`
      CREATE TABLE "baselines" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "projectId" uuid NOT NULL,
        "name" varchar NOT NULL,
        "description" text,
        "snapshotData" jsonb NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        CONSTRAINT "FK_baselines_projectId" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_baselines_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id")
      )
    `);

    // Create import_profiles table
    await queryRunner.query(`
      CREATE TABLE "import_profiles" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "entityType" varchar NOT NULL,
        "columnMappings" jsonb NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        CONSTRAINT "FK_import_profiles_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id")
      )
    `);

    // Create validation_results table
    await queryRunner.query(`
      CREATE TYPE "validation_severity_enum" AS ENUM ('Error', 'Warning', 'Info');
      CREATE TABLE "validation_results" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "projectId" uuid NOT NULL,
        "entityType" varchar NOT NULL,
        "entityId" uuid NOT NULL,
        "ruleName" varchar NOT NULL,
        "severity" "validation_severity_enum" NOT NULL,
        "message" text NOT NULL,
        "acknowledged" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_validation_results_projectId" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE
      )
    `);

    // Create audit_logs table
    await queryRunner.query(`
      CREATE TYPE "audit_operation_enum" AS ENUM ('Create', 'Update', 'Delete', 'Link', 'Unlink');
      CREATE TABLE "audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "operation" "audit_operation_enum" NOT NULL,
        "entityType" varchar NOT NULL,
        "entityId" uuid NOT NULL,
        "changes" jsonb,
        "timestamp" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_audit_logs_userId" FOREIGN KEY ("userId") REFERENCES "users"("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_userId" ON "audit_logs" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entityType_entityId" ON "audit_logs" ("entityType", "entityId")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_timestamp" ON "audit_logs" ("timestamp")`);

    // Create jobs table
    await queryRunner.query(`
      CREATE TYPE "job_type_enum" AS ENUM ('Import', 'Export', 'Validation', 'TestRun');
      CREATE TYPE "job_status_enum" AS ENUM ('Queued', 'Running', 'Completed', 'Failed', 'Cancelled');
      CREATE TABLE "jobs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "type" "job_type_enum" NOT NULL,
        "projectId" uuid NOT NULL,
        "status" "job_status_enum" NOT NULL DEFAULT 'Queued',
        "progress" int NOT NULL DEFAULT 0,
        "result" jsonb,
        "error" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "startedAt" timestamp,
        "completedAt" timestamp,
        "createdBy" uuid NOT NULL,
        CONSTRAINT "FK_jobs_projectId" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_jobs_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_jobs_projectId_status" ON "jobs" ("projectId", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_jobs_createdBy" ON "jobs" ("createdBy")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "jobs"`);
    await queryRunner.query(`DROP TYPE "job_status_enum"`);
    await queryRunner.query(`DROP TYPE "job_type_enum"`);
    
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TYPE "audit_operation_enum"`);
    
    await queryRunner.query(`DROP TABLE "validation_results"`);
    await queryRunner.query(`DROP TYPE "validation_severity_enum"`);
    
    await queryRunner.query(`DROP TABLE "import_profiles"`);
    await queryRunner.query(`DROP TABLE "baselines"`);
    await queryRunner.query(`DROP TABLE "attachments"`);
    await queryRunner.query(`DROP TABLE "files"`);
    await queryRunner.query(`DROP TABLE "links"`);
    
    await queryRunner.query(`DROP TABLE "punchlist_items"`);
    await queryRunner.query(`DROP TYPE "punchlist_status_enum"`);
    await queryRunner.query(`DROP TYPE "punchlist_priority_enum"`);
    await queryRunner.query(`DROP TYPE "punchlist_category_enum"`);
    
    await queryRunner.query(`DROP TABLE "tq_comments"`);
    
    await queryRunner.query(`DROP TABLE "technical_queries"`);
    await queryRunner.query(`DROP TYPE "tq_status_enum"`);
    await queryRunner.query(`DROP TYPE "tq_priority_enum"`);
    
    await queryRunner.query(`DROP TABLE "documents"`);
    await queryRunner.query(`DROP TABLE "alarms"`);
    await queryRunner.query(`DROP TYPE "alarm_priority_enum"`);
    
    await queryRunner.query(`DROP TABLE "equipment"`);
    
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`DROP TYPE "tag_type_enum"`);
    
    await queryRunner.query(`DROP TABLE "project_roles"`);
    await queryRunner.query(`DROP TYPE "project_role_type_enum"`);
    
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
