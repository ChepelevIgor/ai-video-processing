import React from 'react';


interface Props {
  src: string;
  videoRef: React.RefObject<HTMLVideoElement>;
}


export default function VideoPlayer({ src, videoRef }: Props) {
  return (
      <video ref={videoRef} src={src} controls className="w-full rounded-lg mb-4" />
  );
}