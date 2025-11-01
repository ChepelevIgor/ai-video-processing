// Пример сервиса для взаимодействия с backend
// В реальном проекте замените URL на ваш API

export const uploadVideo = async (file: File): Promise<void> => {
  if (!file) throw new Error('Нет файла для загрузки');

  const formData = new FormData();
  formData.append('video', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.statusText}`);
    }

    console.log('Видео успешно загружено:', file.name);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
