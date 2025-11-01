import { useCallback, useRef } from 'react';


export function useVideoFrames() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);


    if (!canvasRef.current && typeof document !== 'undefined') {
        canvasRef.current = document.createElement('canvas');
    }


    const extractFrames = useCallback(async (video: HTMLVideoElement, interval = 1) => {
        if (!video || !canvasRef.current) return [] as string[];
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return [];


        const frames: string[] = [];


        for (let time = 0; time <= video.duration; time += interval) {
            await new Promise<void>((resolve) => {
                const onSeeked = () => {
                    try {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        ctx.drawImage(video, 0, 0);
                        frames.push(canvas.toDataURL('image/png'));
                    } catch (err) {
                        console.error('frame capture error', err);
                    } finally {
                        video.removeEventListener('seeked', onSeeked);
                        resolve();
                    }
                };
                video.addEventListener('seeked', onSeeked);
// small timeout to ensure event listeners are registered in some browsers
// then advance time
                video.currentTime = Math.min(time, video.duration);
            });
        }


        return frames;
    }, []);


    return { extractFrames };
}