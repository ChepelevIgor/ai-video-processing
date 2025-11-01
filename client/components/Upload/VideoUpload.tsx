import React from 'react';
import { uploadVideo } from '../../services/api';


interface Props {
    onUploaded: (url: string) => void;
}


export default function VideoUpload({ onUploaded }: Props) {
// todo
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Создаём локальный URL для выбранного файла
        const url = URL.createObjectURL(file);

        // Вызываем callback в родительский компонент
        onUploaded(url);
    };
    // const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (!file) return;
    //     try {
    //         console.log(file);
    //         onUploaded(file);
    //         return file
    //         const res = await uploadVideo(file);
    //         const url = `http://localhost:3000${res.filePath}`;
    //         onUploaded(url);
    //     } catch (err) {
    //         console.error(err);
    //         alert('Ошибка загрузки видео');
    //     }
    // };


    return (
        <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
    );
}