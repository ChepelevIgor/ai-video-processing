import React from 'react';
import VideoPlayer from '../components/VideoEditor/VideoPlayer';

const Dashboard: React.FC = () => {

  const demoVideo = 'https://www.w3schools.com/html/mov_bbb.mp4';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Дашборд</h2>
      <p className="text-gray-600 mb-4">
        Здесь будут ваши видео после обработки и оптимизации.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <VideoPlayer url={demoVideo} />
          <p className="mt-2 text-gray-700 font-medium">Пример видео</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <VideoPlayer url={demoVideo} />
          <p className="mt-2 text-gray-700 font-medium">Пример видео</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
