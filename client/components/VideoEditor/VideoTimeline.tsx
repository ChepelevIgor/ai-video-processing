import React, { useEffect } from 'react';
import type { DragHandle } from '../../types';

interface Props {
    frames: string[];
    duration: number;
    containerRef: React.RefObject<HTMLDivElement>;
    start: number;
    end: number;
    setStart: (s: number) => void;
    setEnd: (e: number) => void;
}

export default function VideoTimeline({
                                          frames,
                                          duration,
                                          containerRef,
                                          start,
                                          end,
                                          setStart,
                                          setEnd,
                                      }: Props) {
    const safeDuration = Math.max(duration, 1);
    const barWidthPercent = (val: number) => (val / safeDuration) * 100;

    // Dragging state внутри компонента
    const draggingRef = React.useRef<DragHandle | null>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!draggingRef.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const clampedX = Math.max(0, Math.min(rect.width, x));
            const newTime = (clampedX / rect.width) * safeDuration;

            if (draggingRef.current === 'start') {
                setStart(Math.min(newTime, end)); // start <= end
            } else if (draggingRef.current === 'end') {
                setEnd(Math.max(newTime, start)); // end >= start
            }
        };

        const handleMouseUp = () => {
            draggingRef.current = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [start, end, safeDuration, setStart, setEnd, containerRef]);

    return (
        <div
            ref={containerRef}
            className="relative h-32 bg-gray-100 rounded overflow-x-scroll select-none"
        >
            {/* Кадры */}
            <div className="flex items-end h-24">
                {frames.map((frame, i) => (
                    <img
                        key={i}
                        src={frame}
                        alt={`frame-${i}`}
                        className="h-24 w-auto object-cover"
                        draggable={false}
                    />
                ))}
            </div>

            {/* Ручка начала */}
            <div
                className="absolute top-0 bottom-0 w-2 bg-red-500 cursor-ew-resize opacity-80"
                style={{ left: `${barWidthPercent(start)}%` }}
                onMouseDown={() => (draggingRef.current = 'start')}
            />

            {/* Ручка конца */}
            <div
                className="absolute top-0 bottom-0 w-2 bg-green-500 cursor-ew-resize opacity-80"
                style={{ left: `${barWidthPercent(end)}%` }}
                onMouseDown={() => (draggingRef.current = 'end')}
            />

            {/* Шкала времени */}
            <div className="absolute bottom-0 left-0 flex text-xs text-gray-600">
                {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
                    <div key={i} className="w-12 text-center select-none">
                        {i}s
                    </div>
                ))}
            </div>
        </div>
    );
}
