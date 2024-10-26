// src/components/VideoCall.jsx
'use client';
import { useEffect, useRef } from 'react';

export default function VideoCall({ isLocalUser, remoteUser }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const setupVideo = async () => {
      if (isLocalUser) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        // Handle remote user video stream here
        // This is a placeholder; you would need to implement signaling to get the remote stream
      }
    };

    setupVideo();

    return () => {
      // Cleanup if necessary
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isLocalUser]);

  return (
    <video ref={videoRef} autoPlay playsInline muted={isLocalUser} className="w-64 h-48 bg-gray-800" />
  );
}