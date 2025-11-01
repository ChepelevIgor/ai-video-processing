import React from 'react';
import { uploadAudio } from '../../services/api';


interface Props {
    onUploaded: (url: string, file: File) => void;
}


export default function AudioUpload({ onUploaded }: Props) {
    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const res = await uploadAudio(file);
            const url = `http://localhost:3000${res.filePath}`;
            onUploaded(url, file);
        } catch (err) {
            console.error(err);
            alert('Ошибка загрузки аудио');
        }
    };


    return (
        <input
            type="file"
            accept="audio/*"
            onChange={handleChange}
            className="mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
    );
}