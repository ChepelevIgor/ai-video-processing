import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.entity'
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { BullModule } from '@nestjs/bull';
import { VideoProcessor } from '../jobs/processors/video.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video]),
    BullModule.registerQueue({
      name: 'video'
    }),
  ],
  controllers: [VideosController],
  providers: [VideosService, VideoProcessor],
})
export class VideosModule {}