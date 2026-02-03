import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ExportService } from './export.service';
import { StartExportDto } from './dto/start-export.dto';

@Processor('export')
export class ExportProcessor extends WorkerHost {
  constructor(private readonly exportService: ExportService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { jobId, projectId, exportDto } = job.data as {
      jobId: string;
      projectId: string;
      exportDto: StartExportDto;
    };

    await this.exportService.processExport(jobId, projectId, exportDto);

    return { success: true };
  }
}
