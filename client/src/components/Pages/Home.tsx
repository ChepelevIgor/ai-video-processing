import React, { useEffect, useRef, useState } from 'react';
import styles from './Home.module.scss';
import Button from '../ui/Button';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const audioCanvasRef = useRef<HTMLDivElement | null>(null);

  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioVolume, setAudioVolume] = useState<number[]>([]);
  const [frames, setFrames] = useState<string[]>([]);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);

  const canvas = document.createElement('canvas');

  const [audioPeaks, setAudioPeaks] = useState<number[]>([]);
  const [audioStartTime, setAudioStartTime] = useState(0);
  const [audioEndTime, setAudioEndTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [draggingAudio, setDraggingAudio] = useState<'start' | 'end' | null>(
    null,
  );

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoURL(url);
      setFrames([]);
    }
  };

  const extractFrames = async (interval = 1) => {
    const video = videoRef.current;
    if (!video) return;

    const framesList: string[] = [];
    const ctx = canvas.getContext('2d');

    for (let time = 0; time <= video.duration; time += interval) {
      await new Promise<void>((resolve) => {
        video.currentTime = time;
        video.onseeked = () => {
          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            framesList.push(canvas.toDataURL('image/png'));
          }
          resolve();
        };
      });
    }

    setFrames(framesList);
    setStartTime(0);
    setEndTime(video.duration);
  };

  useEffect(() => {
    if (videoRef.current && videoURL) {
      videoRef.current.onloadedmetadata = () => {
        const duration = videoRef.current!.duration;
        setDuration(duration);
        extractFrames(1);
      };
    }
  }, [videoURL]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging || !timelineRef.current || duration === 0) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;

      const newTime = (x / width) * duration;
      const clampedTime = Math.max(0, Math.min(duration, newTime));

      if (dragging === 'start') {
        setStartTime(clampedTime > endTime ? endTime : clampedTime);
      } else {
        setEndTime(clampedTime < startTime ? startTime : clampedTime);
      }
    };

    const handleMouseUp = () => setDragging(null);

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, startTime, endTime, duration]);

  const handleCut = () => {
    alert(
      `Cutting video from ${startTime.toFixed(2)} sec to ${endTime.toFixed(2)} sec`,
    );
  };

  const handleRemovePauses = () => {
    alert(
      'Removing pauses and awkward moments (This will be a placeholder functionality)',
    );
  };

  const handleAudioUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    setAudioURL(url);

    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const decodedData = await audioContext.decodeAudioData(arrayBuffer);
    drawAudioWaveform(decodedData);
  };

  const drawAudioWaveform = (audioBuffer: AudioBuffer) => {
    const rawData = audioBuffer.getChannelData(0);
    const samples = 500;
    const blockSize = Math.floor(rawData.length / samples);
    const peaks = [];

    for (let i = 0; i < samples; i++) {
      const start = i * blockSize;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[start + j]);
      }
      peaks.push(sum / blockSize);
    }

    setAudioPeaks(peaks);
    setAudioStartTime(0);
    setAudioEndTime(audioBuffer.duration);
    setAudioDuration(audioBuffer.duration);
  };

  return (
    <div className={styles.editor}>
      <h1 className={styles.editor__title}>🎞 Video Frame Editor</h1>

      <input
        type="file"
        accept="video/*"
        className={styles.uploadButton}
        onChange={handleUpload}
      />

      {videoURL && (
        <div className={styles.videoControls}>
          <video
            ref={videoRef}
            src={videoURL}
            controls
            className={styles.videoControls__video}
          />

          <div className={styles.timeline} ref={timelineRef}>
            <div className={styles.timeline__frames}>
              {frames.map((frame, index) => (
                <div key={index} className={styles.timeline__frameWrapper}>
                  <img
                    src={frame}
                    className={styles.timeline__frame}
                    alt={`frame-${index}`}
                  />
                </div>
              ))}

              <div
                className={`${styles.timeline__handle} ${styles['timeline__handle--start']}`}
                style={{ left: `${(startTime / duration) * 100}%` }}
                onMouseDown={() => setDragging('start')}
              />
              <div
                className={`${styles.timeline__handle} ${styles['timeline__handle--end']}`}
                style={{ left: `${(endTime / duration) * 100}%` }}
                onMouseDown={() => setDragging('end')}
              />
            </div>

            <div className={styles.timeline__scale}>
              {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
                <div key={i} className={styles.timeline__tick}>
                  {i}s
                </div>
              ))}
            </div>
          </div>

          <div className={styles.controlsPanel}>
            {/* Перенести на отдельный компонент кнопки */}
            <Button
              className={`${styles.button} ${styles['button--cut']}`}
              onClick={handleCut}
            >
              Cut Video
            </Button>
            <Button
              className={`${styles.button} ${styles['button--remove-pauses']}`}
              onClick={handleRemovePauses}
            >
              Remove Pauses and Awkward Moments
            </Button>
          </div>
        </div>
      )}

      {/* Upload audio file */}
      <input
        type="file"
        accept="audio/*"
        className={styles.uploadButton}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleAudioUpload(file);
        }}
      />

      {audioPeaks.length > 0 && (
        <div className={styles.audioWaveform} ref={audioCanvasRef}>
          <svg width="800" height="100">
            {audioPeaks.map((peak, i) => (
              <rect
                key={i}
                x={i * 1.6}
                y={100 - peak * 100}
                width={1}
                height={peak * 100}
                fill="#00f"
              />
            ))}

            <rect
              x={(audioStartTime / audioDuration) * 800}
              y={0}
              width={3}
              height={100}
              fill="red"
              onMouseDown={() => setDraggingAudio('start')}
            />
            <rect
              x={(audioEndTime / audioDuration) * 800}
              y={0}
              width={3}
              height={100}
              fill="green"
              onMouseDown={() => setDraggingAudio('end')}
            />
          </svg>
        </div>
      )}
    </div>
  );
}
