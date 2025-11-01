import { useState, useCallback, useRef } from 'react';
import { fetchFileFromUrl, applyEffect as applyEffectService } from '../services/videoService';

export interface VideoState {
    file?: File;
    url?: string;
}

export const useVideoManager = (extractFrames: (video: HTMLVideoElement, fps: number) => Promise<string[]>) => {
    const [video, setVideo] = useState<VideoState>({});
    const [frames, setFrames] = useState<string[]>([]);
    const [duration, setDuration] = useState(0);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);

    const loadVideo = useCallback(async (url: string, file?: File) => {
        let finalFile = file;
        if (!finalFile) {
            try {
                finalFile = await fetchFileFromUrl(url);
            } catch (err) {
                console.error('Ошибка при создании File из URL:', err);
                setStatus('❌ Не удалось обработать видео');
                return;
            }
        }

        setVideo({ file: finalFile, url });
        setFrames([]);
        setDuration(0);
        setStart(0);
        setEnd(0);
        setStatus('Видео загружено');
    }, []);

    const applyEffect = useCallback(async (effect: string) => {
        if (!video.file) return;

        setLoading(true);
        setStatus('⏳ Применение эффекта...');

        try {
            const blob = await applyEffectService(video.file, effect);
            const newUrl = URL.createObjectURL(blob);
            setVideo(prev => ({ ...prev, url: newUrl }));
            setStatus('✅ Эффект успешно применён');
        } catch (err) {
            console.error(err);
            setStatus('❌ Ошибка при применении эффекта');
        } finally {
            setLoading(false);
            setTimeout(() => setStatus(null), 3000);
        }
    }, [video.file]);

    const resetVideo = useCallback(() => {
        if (!video.file) return;
        const originalUrl = URL.createObjectURL(video.file);
        setVideo({ file: video.file, url: originalUrl });
        setFrames([]);
        setStart(0);
        setEnd(duration);
        setStatus('📌 Видео сброшено');
    }, [video.file, duration]);

    const deleteVideo = useCallback(() => {
        if (video.url) URL.revokeObjectURL(video.url);
        setVideo({});
        setFrames([]);
        setDuration(0);
        setStart(0);
        setEnd(0);
        setStatus('📌 Видео удалено');
    }, [video.url]);

    const loadMetadata = useCallback(async () => {
        if (!videoRef.current) return;

        setLoading(true);
        setStatus('🧠 Извлечение кадров...');

        const dur = videoRef.current.duration;
        setDuration(dur);
        setStart(0);
        setEnd(dur);

        try {
            const capturedFrames = await extractFrames(videoRef.current, 1);
            setFrames(capturedFrames);
            setStatus(`✅ Извлечено ${capturedFrames.length} кадров`);
        } catch (err) {
            console.error('Error extracting frames:', err);
            setStatus('❌ Ошибка при извлечении кадров');
        } finally {
            setLoading(false);
            setTimeout(() => setStatus(null), 3000);
        }
    }, [extractFrames]);

    return {
        video,
        frames,
        duration,
        start,
        end,
        status,
        loading,
        videoRef,
        loadVideo,
        applyEffect,
        resetVideo,
        deleteVideo,
        loadMetadata,
        setStart,
        setEnd,
    };
};
