import {
    Controller,
    Post,
    StreamableFile,
    Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { VideosService } from "./videos.service";


@Controller('video')
export class VideosController {

    constructor(private videosService: VideosService) {
    }
    @Post('denoise')
    async denoise(@Req() req: FastifyRequest): Promise<StreamableFile> {
        return this.videosService.processVideo(req, 'denoise_script.py', 'denoised');
    }

    // =====================================
    // 🚀 2️⃣ Улучшение качества видео (Enhance)
    // =====================================
    @Post('enhance')
    async enhance(@Req() req: FastifyRequest): Promise<StreamableFile> {
        return this.videosService.processVideo(req, 'enhance_script.py', 'enhanced');
    }

    @Post('hollywood')
    async hollywood(@Req() req: FastifyRequest): Promise<StreamableFile> {
        return this.videosService.processVideo(req, 'hollywood_script.py', 'hollywood');
    }



}
