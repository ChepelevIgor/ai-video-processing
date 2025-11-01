import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as AWS from 'aws-sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from '../../videos/entities/video.entity';
import { Repository } from 'typeorm';

@Processor('video')
export class VideoProcessor {
  private s3: AWS.S3;

  constructor(
    @InjectRepository(Video)
    private repo: Repository<Video>
  ) {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
      endpoint: process.env.S3_ENDPOINT,
      s3ForcePathStyle: !!process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'us-east-1'
    });
  }

  @Process('process')
  async handleProcess(job: Job) {
    const { videoId, s3Key } = job.data;
    const video = await this.repo.findOneBy({ id: videoId });
    if (!video) return;

    try {
      console.log('Processing video', s3Key);
      await new Promise((r) => setTimeout(r, 5000));

      const outputKey = s3Key.replace('uploads/', 'outputs/');

      video.output_key = outputKey;
      video.status = 'done';
      await this.repo.save(video);

    } catch (err) {
      console.error('Processing failed', err);
      video.status = 'failed';
      await this.repo.save(video);
      throw err;
    }
  }
}