export const fetchFileFromUrl = async (url: string): Promise<File> => {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return new File([blob], 'video.mp4', { type: blob.type });
};

export const applyEffect = async (file: File, effect: string): Promise<Blob> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('effect', effect);

    const res = await fetch(`http://localhost:3000/video/${effect}`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) throw new Error('Ошибка при обработке видео');
    return res.blob();
};
