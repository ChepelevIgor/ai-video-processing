import React from 'react';
import VideoUpload from '../Upload/VideoUpload';

interface UploadPanelProps {
    onVideoUploaded: (url: string, file?: File) => void;
}

export default function UploadPanel({ onVideoUploaded }: UploadPanelProps) {
    return (
        <div className="w-full">
            <h2 className="text-lg font-semibold mb-3">Upload Video</h2>
            <VideoUpload onUploaded={onVideoUploaded} />
        </div>
    );
}
