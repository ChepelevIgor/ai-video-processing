import {HttpException, HttpStatus, Injectable, StreamableFile} from '@nestjs/common';

import { FastifyRequest } from 'fastify';
import * as fs from 'fs';
import { join, extname } from 'path';
import { spawn } from 'child_process';


const UPLOAD_DIR = join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });


@Injectable()
export class VideosService {

   async processVideo(
        req: FastifyRequest,
        scriptName: string,
        suffix: string,
    ): Promise<StreamableFile> {
        // 1️⃣ Получаем файл
        const data = await (req as any).file();
        if (!data)
            throw new HttpException('Файл не получен', HttpStatus.BAD_REQUEST);

        const ext = extname(data.filename).toLowerCase();
        if (
            !data.mimetype.startsWith('video/') ||
            !['.mp4', '.mov', '.avi', '.mkv'].includes(ext)
        ) {
            throw new HttpException(
                'Файл не является поддерживаемым видео',
                HttpStatus.BAD_REQUEST,
            );
        }

        const timestamp = Date.now();
        const rawPath = join(UPLOAD_DIR, `${timestamp}_raw${ext}`);
        const fixedPath = join(UPLOAD_DIR, `${timestamp}_fixed${ext}`);
        const outputPath = join(UPLOAD_DIR, `${timestamp}_${suffix}${ext}`);

        // 2️⃣ Сохраняем файл
        console.log('💾 Сохраняем видео:', rawPath);
        try {
            const buffer = await data.toBuffer();
            fs.writeFileSync(rawPath, buffer);
        } catch (err) {
            console.error('❌ Ошибка при записи файла:', err);
            throw new HttpException(
                'Ошибка при сохранении файла',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        if (!fs.existsSync(rawPath) || fs.statSync(rawPath).size === 0) {
            throw new HttpException('Файл пустой или не записался', HttpStatus.BAD_REQUEST);
        }

        // 3️⃣ Проверка видео через ffprobe
        const checkVideo = async (path: string): Promise<boolean> => {
            return new Promise((resolve) => {
                const probe = spawn('ffprobe', [
                    '-v', 'error',
                    '-show_entries', 'format=duration',
                    '-of', 'default=noprint_wrappers=1:nokey=1',
                    path,
                ]);
                probe.on('close', (code) => resolve(code === 0));
            });
        };

        let valid = await checkVideo(rawPath);

        // 4️⃣ Починка, если видео битое
        if (!valid) {
            console.warn('⚠️ Видео повреждено, пытаемся починить faststart');
            try {
                await new Promise<void>((resolve, reject) => {
                    const fix = spawn('ffmpeg', [
                        '-y',
                        '-i', rawPath,
                        '-c', 'copy',
                        '-movflags', 'faststart',
                        fixedPath,
                    ]);
                    fix.on('close', (code) => {
                        if (code === 0 && fs.existsSync(fixedPath)) resolve();
                        else reject();
                    });
                });
            } catch {
                console.warn('⚠️ COPY FIX FAILED → Перекодируем файл');
                await new Promise<void>((resolve, reject) => {
                    const reencode = spawn('ffmpeg', [
                        '-y',
                        '-i', rawPath,
                        '-c:v', 'libx264',
                        '-c:a', 'aac',
                        '-movflags', 'faststart',
                        fixedPath,
                    ]);
                    reencode.on('close', (code) => {
                        if (code === 0 && fs.existsSync(fixedPath)) resolve();
                        else reject();
                    });
                });
            }

            valid = await checkVideo(fixedPath);
            if (!valid)
                throw new HttpException(
                    'Файл не удалось восстановить',
                    HttpStatus.BAD_REQUEST,
                );
        } else {
            fs.copyFileSync(rawPath, fixedPath);
        }

        // 5️⃣ Запуск Python-скрипта
        console.log(`🎬 Запуск Python-обработки: ${scriptName}`);
        await new Promise<void>((resolve, reject) => {
            const py = spawn('python', [
                join(process.cwd(), `scripts/${scriptName}`),
                fixedPath,
                outputPath,
            ]);

            let output = '';
            py.stdout.on('data', (d) => (output += d.toString()));
            py.stderr.on('data', (d) => (output += d.toString()));

            py.on('close', (code) => {
                if (code === 0 && fs.existsSync(outputPath)) {
                    console.log(`✅ ${suffix} обработка завершена`);
                    resolve();
                } else {
                    console.error(`❌ Python ${suffix} error:\n`, output);
                    reject();
                }
            });
        });

        // 6️⃣ Возврат результата
        if (!fs.existsSync(outputPath)) {
            throw new HttpException(
                `Файл не найден после ${suffix}-обработки`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        console.log('📤 Отправляем готовое видео клиенту...');
        const stream = fs.createReadStream(outputPath);

        const response = new StreamableFile(stream, {
            disposition: `attachment; filename="${suffix}${ext}"`,
            type: 'video/mp4',
        });

        // 7️⃣ Очистка
        [rawPath, fixedPath].forEach(
            (p) => fs.existsSync(p) && fs.unlinkSync(p),
        );

        return response;
    }
}