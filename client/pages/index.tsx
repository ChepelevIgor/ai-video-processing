import React from 'react';
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center px-6">
      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 text-center drop-shadow-lg">
        AI Video Platform
      </h1>
      <p className="text-gray-700 mb-10 text-center max-w-2xl text-lg md:text-xl">
        Автоматическая нарезка и оптимизация видео под TikTok, Reels и Shorts. 
        Создавай короткие ролики быстро и легко с помощью AI.
      </p>
      <div className="flex flex-col md:flex-row gap-4">
        <Link
          href="/video-editor"
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg transform transition hover:scale-105 hover:from-blue-600 hover:to-blue-700"
        >
          Загрузить видео
        </Link>
        <Link
          href="/dashboard"
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-lg transform transition hover:scale-105 hover:from-green-600 hover:to-green-700"
        >
          Дашборд
        </Link>
      </div>
      <p className="mt-12 text-gray-500 text-sm md:text-base text-center max-w-md">
        Быстро, удобно и полностью автоматизировано. Экономьте время и создавайте контент профессионального уровня.
      </p>
    </div>
  );
};

export default Home;
