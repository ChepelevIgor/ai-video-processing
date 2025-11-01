import React, { useEffect, useRef, useState } from 'react';
import {
    FRAME_SAMPLES_DEFAULT,
    WAVEFORM_CANVAS_HEIGHT,
    WAVEFORM_CANVAS_WIDTH,
} from '../../utils/constants';

interface Props {
    file?: File;
    peaks?: number[];
    duration?: number;
    audioRef?: React.RefObject<HTMLAudioElement>;
    onRangeChange?: (start: number, end: number) => void;
}

export default function AudioWaveform({
                                          file,
                                          peaks: initialPeaks,
                                          duration = 0,
                                          audioRef,
                                          onRangeChange,
                                      }: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [peaks, setPeaks] = useState<number[]>(initialPeaks || []);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(duration);
    const [dragging, setDragging] = useState<'start' | 'end' | null>(null);
    const [playhead, setPlayhead] = useState(0);

    // 🕒 Обновляем длительность, если она изменилась
    useEffect(() => {
        setEnd(duration);
    }, [duration]);

    // 📈 Декодируем аудиофайл в пики
    useEffect(() => {
        if (!file) return;
        const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
        let cancelled = false;

        (async () => {
            try {
                const ab = await file.arrayBuffer();
                const decoded = await ac.decodeAudioData(ab.slice(0));
                const data = decoded.getChannelData(0);

                const samples = FRAME_SAMPLES_DEFAULT;
                const block = Math.floor(data.length / samples);
                const p: number[] = [];
                for (let i = 0; i < samples; i++) {
                    let sum = 0;
                    const startIdx = i * block;
                    for (let j = 0; j < block; j++) sum += Math.abs(data[startIdx + j] || 0);
                    p.push(sum / block);
                }

                if (!cancelled) setPeaks(p);
            } catch (err) {
                console.error('Error decoding audio:', err);
            }
        })();

        return () => {
            cancelled = true;
            ac.close().catch(() => {});
        };
    }, [file]);

    // 🎨 Отрисовка waveform + маркеров
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = WAVEFORM_CANVAS_WIDTH;
        canvas.height = WAVEFORM_CANVAS_HEIGHT;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Основная волна
        const max = Math.max(...peaks, 0.0001);
        const barWidth = canvas.width / Math.max(peaks.length, 1);
        ctx.fillStyle = '#3B82F6';
        peaks.forEach((p, i) => {
            const h = (p / max) * canvas.height;
            const x = i * barWidth;
            const y = canvas.height - h;
            ctx.fillRect(x, y, Math.max(1, barWidth - 1), h);
        });

        // Выделение
        const startX = (start / Math.max(duration, 1)) * canvas.width;
        const endX = (end / Math.max(duration, 1)) * canvas.width;
        ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.fillRect(startX, 0, endX - startX, canvas.height);

        // Ручки
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.fillRect(startX - 2, 0, 4, canvas.height);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.fillRect(endX - 2, 0, 4, canvas.height);

        // Playhead
        const playX = (playhead / Math.max(duration, 1)) * canvas.width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(playX - 1, 0, 2, canvas.height);
    }, [peaks, start, end, playhead, duration]);

    // 🎵 Слежение за проигрыванием
    useEffect(() => {
        const audio = audioRef?.current;
        if (!audio) return;

        const update = () => setPlayhead(audio.currentTime);
        audio.addEventListener('timeupdate', update);
        return () => audio.removeEventListener('timeupdate', update);
    }, [audioRef]);

    // 🎚 Управление перетаскиванием
    useEffect(() => {
        const onPointerMove = (e: PointerEvent) => {
            if (!dragging || !canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const clampedX = Math.max(0, Math.min(rect.width, x));
            const newTime = (clampedX / rect.width) * Math.max(duration, 1);

            if (dragging === 'start') {
                setStart(Math.min(newTime, end));
            } else {
                setEnd(Math.max(newTime, start));
            }

            onRangeChange?.(start, end);
        };

        const onPointerUp = () => setDragging(null);

        if (dragging) {
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [dragging, start, end, duration, onRangeChange]);

    // 🖱 Обработка кликов на канвасе
    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = (x / rect.width) * Math.max(duration, 1);
        const distToStart = Math.abs(time - start);
        const distToEnd = Math.abs(time - end);
        setDragging(distToStart < distToEnd ? 'start' : 'end');
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md">
            <canvas
                ref={canvasRef}
                width={WAVEFORM_CANVAS_WIDTH}
                height={WAVEFORM_CANVAS_HEIGHT}
                className="cursor-crosshair w-full"
                onPointerDown={handlePointerDown}
            />
        </div>
    );
}
