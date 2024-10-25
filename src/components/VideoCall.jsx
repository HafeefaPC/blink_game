'use client';
import { useEffect, useRef } from 'react';

export default function VideoCall() {
  const videoRef = useRef(null);

  useEffect(() => {
    async function setupVideo() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    }
    setupVideo();
  }, []);

  return (
    <video ref={videoRef} autoPlay playsInline muted className="w-64 h-48 bg-gray-800" />
  );
}