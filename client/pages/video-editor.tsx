import React from 'react';
import FilterPanel from '../components/Panels/FilterPanel';
import UploadPanel from '../components/Panels/UploadPanel';
import StatusPanel from '../components/UI/StatusPanel';
import VideoTimeline from '../components/VideoEditor/VideoTimeline';
import { useVideoManager } from '../hooks/useVideoManager';
import { useVideoFrames } from '../components/VideoEditor/useVideoFrames';

export default function VideoEditorPage() {
    const { extractFrames } = useVideoFrames();

    const {
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
    } = useVideoManager(extractFrames);

    return (
        <div className="flex min-h-screen bg-gray-50 p-6 gap-6">
            {/* Левая панель эффектов */}
            <FilterPanel
                onApplyEffect={async (effect) => {
                    await applyEffect(effect); // твоя текущая логика применения эффекта
                }}
                onReset={resetVideo}
                disabled={loading}
                videoLoaded={!!video.url}
            />
            {/* Правая секция видео */}
            <section
                className="flex-1 max-w-4xl bg-white p-6 rounded-xl shadow-lg flex flex-col items-center"
                style={{ minHeight: '400px', maxHeight: '600px' }}
            >
                <h1 className="text-3xl font-bold mb-6">🎞 Video Frame Editor</h1>

                {/* UploadPanel отображается только если видео нет */}
                {!video.url && <UploadPanel onVideoUploaded={loadVideo} />}

                {/* Кнопка удаления видео */}
                {video.url && (
                    <div className="w-full flex justify-end mb-4">
                        <button
                            onClick={deleteVideo}
                            className="text-red-500 hover:text-red-700 p-2 rounded-full bg-red-100 hover:bg-red-200 transition"
                            title="Удалить видео"
                        >
                            🗑️
                        </button>
                    </div>
                )}

                {/* Статус */}
                <div className="w-full mt-2">
                    <StatusPanel
                        status={status}
                        type={loading ? 'loading' : status?.includes('Ошибка') ? 'error' : 'success'}
                    />
                </div>

                {/* Видео и таймлайн */}
                {video.url && (
                    <div className="mt-4 w-full">
                        <video
                            ref={videoRef}
                            src={video.url}
                            controls
                            className="max-h-[300px] w-auto rounded-lg shadow-md mb-4 mx-auto"
                            onLoadedMetadata={loadMetadata}
                        />

                        {!loading && frames.length > 0 && (
                            <VideoTimeline
                                frames={frames}
                                duration={duration}
                                containerRef={null} // Можно передать timelineRef, если нужен
                                start={start}
                                end={end}
                                setStart={setStart}
                                setEnd={setEnd}
                            />
                        )}

                        <div className="mt-4 text-center">
                            <p>
                                Выделенный диапазон: <strong>{start.toFixed(2)}s</strong> —{' '}
                                <strong>{end.toFixed(2)}s</strong>
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
