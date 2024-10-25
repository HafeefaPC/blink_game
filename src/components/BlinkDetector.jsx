'use client';
import { useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as ort from 'onnxruntime-web';
import { detectBlinks } from '../lib/yolo';

export default function BlinkDetector({ onBlink }) {
  const videoRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    let session;

    async function setupBlinkDetection() {
      await tf.ready();
      session = await ort.InferenceSession.create('/models/yolov5n-face.onnx');

      async function detectFrame() {
        if (videoRef.current) {
          const blinks = await detectBlinks(videoRef.current, session);
          if (blinks > 0) {
            onBlink();
          }
        }
        animationFrameId = requestAnimationFrame(detectFrame);
      }

      detectFrame();
    }

    setupBlinkDetection();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (session) {
        session.release();
      }
    };
  }, [onBlink]);

  return <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />;
}