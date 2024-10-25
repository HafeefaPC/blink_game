'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

const EAR_THRESHOLD = 0.27; // This can be adjusted based on your testing

export default function BlinkDetector({ onBlink }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [model, setModel] = useState(null);

  useEffect(() => {
    async function setupCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }

    async function loadOpenCV() {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://docs.opencv.org/4.5.2/opencv.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    async function setupBlinkDetection() {
      await loadOpenCV();
      const faceCascade = new cv.CascadeClassifier();
      faceCascade.load(cv.HAAR_FRONTALFACE_DEFAULT); // Load the face cascade
      const eyeCascade = new cv.CascadeClassifier();
      eyeCascade.load(cv.HAAR_EYE); // Load the eye cascade
      setModel({ faceCascade, eyeCascade });
    }

    setupCamera();
    setupBlinkDetection();

    return () => {
      const currentVideoRef = videoRef.current; // Store the current ref in a variable
      if (currentVideoRef && currentVideoRef.srcObject) {
        currentVideoRef.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const detectBlink = useCallback(() => {
    if (!model || !videoRef.current) return false;

    const { faceCascade, eyeCascade } = model;
    const src = new cv.Mat(videoRef.current.height, videoRef.current.width, cv.CV_8UC4);
    const cap = new cv.VideoCapture(videoRef.current);
    cap.read(src);

    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    const faces = new cv.RectVector();
    faceCascade.detectMultiScale(gray, faces);

    let blinkDetected = false;

    for (let i = 0; i < faces.size(); ++i) {
      const face = faces.get(i);
      const roiGray = gray.roi(face);
      const roiSrc = src.roi(face);

      const eyes = new cv.RectVector();
      eyeCascade.detectMultiScale(roiGray, eyes);

      // If no eyes are detected, consider it a blink
      if (eyes.size() === 0) {
        blinkDetected = true;
        break; // Exit the loop if a blink is detected
      }

      // Optionally, you can draw rectangles around detected eyes
      for (let j = 0; j < eyes.size(); ++j) {
        const eye = eyes.get(j);
        cv.rectangle(roiSrc, new cv.Point(eye.x, eye.y), new cv.Point(eye.x + eye.width, eye.y + eye.height), [255, 0, 0, 255], 2);
      }
    }

    // Clean up
    src.delete();
    gray.delete();
    faces.delete();
    roiGray.delete();
    roiSrc.delete();
    eyes.delete();

    return blinkDetected;
  }, [model]);

  useEffect(() => {
    let intervalId;

    async function checkForBlink() {
      if (!isDetecting && model) {
        setIsDetecting(true);
        const blinkDetected = detectBlink();
        if (blinkDetected) {
          onBlink();
        }
        setIsDetecting(false);
      }
    }

    intervalId = setInterval(checkForBlink, 100); // Check every 100ms for more responsive detection

    return () => {
      clearInterval(intervalId);
    };
  }, [onBlink, isDetecting, model, detectBlink]);

  return (
    <>
      <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
      <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
    </>
  );
}