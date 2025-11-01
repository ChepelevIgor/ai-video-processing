import { useEffect, useRef, useState } from 'react';
import type { DragHandle } from '../types';


export function useDraggableRange(containerRef: React.RefObject<HTMLElement | null>, duration: number) {
    const [start, setStart] = useState<number>(0);
    const [end, setEnd] = useState<number>(duration || 0);
    const [dragging, setDragging] = useState<DragHandle>(null);


    const lastDurationRef = useRef(duration);


    useEffect(() => {
        if (duration !== lastDurationRef.current) {
            setEnd(duration);
            lastDurationRef.current = duration;
        }
    }, [duration]);


    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!dragging || !containerRef.current || duration === 0) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const clampedX = Math.max(0, Math.min(rect.width, x));
            const newTime = (clampedX / rect.width) * duration;


            if (dragging === 'start') {
                setStart((s) => Math.min(newTime, end));
            } else if (dragging === 'end') {
                setEnd((eTime) => Math.max(newTime, start));
            }
        };


        const onUp = () => setDragging(null);


        if (dragging) {
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [dragging, start, end, duration, containerRef]);


    return { start, end, setStart, setEnd, dragging, setDragging };
}