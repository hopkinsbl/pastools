import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus, JobType } from '../entities/job.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['project', 'createdByUser'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    return job;
  }

  /**
   * Get all jobs for a project
   */
  async getProjectJobs(projectId: string): Promise<Job[]> {
    return this.jobRepository.find({
      where: { projectId },
      relations: ['createdByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all jobs (optionally filtered by status)
   */
  async getAllJobs(status?: JobStatus): Promise<Job[]> {
    const where = status ? { status } : {};
    return this.jobRepository.find({
      where,
      relations: ['project', 'createdByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Create a new job
   */
  async createJob(
    projectId: string,
    type: JobType,
    createdBy: string,
  ): Promise<Job> {
    const job = this.jobRepository.create({
      projectId,
      type,
      createdBy,
      status: JobStatus.QUEUED,
      progress: 0,
    });

    return this.jobRepository.save(job);
  }

  /**
   * Update job status
   */
  async updateJobStatus(
    jobId: string,
    status: JobStatus,
    progress?: number,
  ): Promise<Job> {
    const job = await this.getJob(jobId);

    job.status = status;
    if (progress !== undefined) {
      job.progress = progress;
    }

    if (status === JobStatus.RUNNING && !job.startedAt) {
      job.startedAt = new Date();
    }

    if (
      (status === JobStatus.COMPLETED ||
        status === JobStatus.FAILED ||
        status === JobStatus.CANCELLED) &&
      !job.completedAt
    ) {
      job.completedAt = new Date();
    }

    return this.jobRepository.save(job);
  }

  /**
   * Update job result
   */
  async updateJobResult(
    jobId: string,
    result: Record<string, any>,
  ): Promise<Job> {
    const job = await this.getJob(jobId);
    job.result = result;
    return this.jobRepository.save(job);
  }

  /**
   * Update job error
   */
  async updateJobError(jobId: string, error: string): Promise<Job> {
    const job = await this.getJob(jobId);
    job.error = error;
    job.status = JobStatus.FAILED;
    job.completedAt = new Date();
    return this.jobRepository.save(job);
  }

  /**
   * Cancel a running job
   */
  async cancelJob(jobId: string): Promise<Job> {
    const job = await this.getJob(jobId);

    if (
      job.status !== JobStatus.QUEUED &&
      job.status !== JobStatus.RUNNING
    ) {
      throw new Error(
        `Cannot cancel job with status ${job.status}. Only queued or running jobs can be cancelled.`,
      );
    }

    job.status = JobStatus.CANCELLED;
    job.completedAt = new Date();

    return this.jobRepository.save(job);
  }

  /**
   * Reset a failed job for retry
   */
  async retryJob(jobId: string): Promise<Job> {
    const job = await this.getJob(jobId);

    if (job.status !== JobStatus.FAILED && job.status !== JobStatus.CANCELLED) {
      throw new Error(
        `Cannot retry job with status ${job.status}. Only failed or cancelled jobs can be retried.`,
      );
    }

    job.status = JobStatus.QUEUED;
    job.progress = 0;
    job.error = null as any;
    job.startedAt = null as any;
    job.completedAt = null as any;

    return this.jobRepository.save(job);
  }

  /**
   * Get job statistics for a project
   */
  async getProjectJobStats(projectId: string): Promise<{
    total: number;
    queued: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  }> {
    const jobs = await this.getProjectJobs(projectId);

    return {
      total: jobs.length,
      queued: jobs.filter((j) => j.status === JobStatus.QUEUED).length,
      running: jobs.filter((j) => j.status === JobStatus.RUNNING).length,
      completed: jobs.filter((j) => j.status === JobStatus.COMPLETED).length,
      failed: jobs.filter((j) => j.status === JobStatus.FAILED).length,
      cancelled: jobs.filter((j) => j.status === JobStatus.CANCELLED).length,
    };
  }

  /**
   * Delete old completed jobs (cleanup)
   */
  async deleteOldJobs(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.jobRepository
      .createQueryBuilder()
      .delete()
      .where('status IN (:...statuses)', {
        statuses: [JobStatus.COMPLETED, JobStatus.CANCELLED],
      })
      .andWhere('completedAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
