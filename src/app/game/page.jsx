'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Confetti from 'react-confetti';

export default function Game() {
  const [gameState, setGameState] = useState({
    isStarted: false,
    startTime: null,
    endTime: null,
    score: null,
    showConfetti: false
  });
  const [error, setError] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const searchParams = useSearchParams();
  const playerName = searchParams.get('playerName');

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let stream;
    let animationFrameId;
    let lastFrameData = null;
    let lastBlinkTime = 0;
    const blinkCooldown = 300;
    
    const startVideo = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640,
            height: 480,
            frameRate: 30
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Failed to access camera. Please ensure camera permissions are granted.');
      }
    };

    const detectBlink = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const ctx = canvasRef.current.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Define eye regions (left and right)
      const leftEyeRegion = {
        x: Math.floor(canvasRef.current.width * 0.35),
        y: Math.floor(canvasRef.current.height * 0.35),
        width: Math.floor(canvasRef.current.width * 0.15),
        height: Math.floor(canvasRef.current.height * 0.1)
      };

      const rightEyeRegion = {
        x: Math.floor(canvasRef.current.width * 0.5),
        y: Math.floor(canvasRef.current.height * 0.35),
        width: Math.floor(canvasRef.current.width * 0.15),
        height: Math.floor(canvasRef.current.height * 0.1)
      };

      const analyzeEyeRegion = (region) => {
        const imageData = ctx.getImageData(region.x, region.y, region.width, region.height);
        const data = imageData.data;
        let totalDifference = 0;
        let significantChanges = 0;
        const totalPixels = (region.width * region.height);

        if (lastFrameData) {
          const lastRegionData = new Uint8ClampedArray(data.length);
          const startOffset = (region.y * canvasRef.current.width + region.x) * 4;
          
          for (let y = 0; y < region.height; y++) {
            const offset = startOffset + y * canvasRef.current.width * 4;
            for (let x = 0; x < region.width * 4; x++) {
              lastRegionData[y * region.width * 4 + x] = lastFrameData[offset + x];
            }
          }

          for (let i = 0; i < data.length; i += 4) {
            const rDiff = Math.abs(data[i] - lastRegionData[i]);
            const gDiff = Math.abs(data[i + 1] - lastRegionData[i + 1]);
            const bDiff = Math.abs(data[i + 2] - lastRegionData[i + 2]);
            
            const pixelDifference = (rDiff + gDiff + bDiff) / 3;
            totalDifference += pixelDifference;

            if (pixelDifference > 25) {
              significantChanges++;
            }
          }
        }

        return {
          averageDifference: totalDifference / (data.length / 4),
          changePercentage: (significantChanges / totalPixels) * 100
        };
      };

      const leftEyeAnalysis = analyzeEyeRegion(leftEyeRegion);
      const rightEyeAnalysis = analyzeEyeRegion(rightEyeRegion);

      // Draw eye region rectangles
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(leftEyeRegion.x, leftEyeRegion.y, leftEyeRegion.width, leftEyeRegion.height);
      ctx.strokeRect(rightEyeRegion.x, rightEyeRegion.y, rightEyeRegion.width, rightEyeRegion.height);

      // Update debug info
      setDebugInfo({
        leftEye: leftEyeAnalysis.changePercentage.toFixed(2),
        rightEye: rightEyeAnalysis.changePercentage.toFixed(2),
        averageChange: ((leftEyeAnalysis.changePercentage + rightEyeAnalysis.changePercentage) / 2).toFixed(2)
      });

      const now = Date.now();
      if ((leftEyeAnalysis.changePercentage > 10 || rightEyeAnalysis.changePercentage > 10) && 
          now - lastBlinkTime > blinkCooldown) {
        lastBlinkTime = now;
        if (gameState.isStarted && !gameState.endTime) {
          const score = ((now - gameState.startTime) / 1000).toFixed(2);
          setGameState(prevState => ({
            ...prevState,
            endTime: now,
            score,
            showConfetti: true
          }));

          setTimeout(() => {
            setGameState(prevState => ({
              ...prevState,
              showConfetti: false
            }));
          }, 5000);
        }
      }

      lastFrameData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height).data;
      animationFrameId = requestAnimationFrame(detectBlink);
    };

    startVideo().then(() => {
      animationFrameId = requestAnimationFrame(detectBlink);
    }).catch(err => {
      console.error('Error in setup:', err);
      setError('Failed to set up blink detection. Please refresh the page.');
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [gameState]);

  const startGame = () => {
    if (isCameraReady) {
      setGameState(prevState => ({
        ...prevState,
        isStarted: true,
        startTime: Date.now(),
        endTime: null,
        score: null,
        showConfetti: false
      }));
    } else {
      setError("Please ensure your camera is on before starting the game.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-4">
      {gameState.showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      <h1 className="text-4xl font-bold mb-8">Blink Challenge</h1>
      <div className="mb-8 relative">
        <video
          ref={videoRef}
          style={{ display: 'block' }}
          width="640"
          height="480"
        />
        <canvas
          ref={canvasRef}
          className="w-full max-w-lg border-4 border-white absolute top-0 left-0"
          width="640"
          height="480"
        />
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!isCameraReady && <div className="text-yellow-500 mb-4">Camera is initializing...</div>}
      {!gameState.isStarted && (
        <button
          onClick={startGame}
          className={`py-3 px-4 bg-white text-black font-bold transition-colors ${isCameraReady ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'}`}
          disabled={!isCameraReady}
        >
          Start Game
        </button>
      )}
      {gameState.isStarted && !gameState.endTime && (
        <div className="text-2xl mb-4 animate-pulse">
          Keep your eyes open! Time running...
        </div>
      )}
      {gameState.score && (
        <div className="text-center">
          <div className="text-4xl font-bold mb-4 text-yellow-400">Game Over!</div>
          <div className="text-2xl">
            Amazing, {playerName || 'Player'}! 
            <br />
            You kept your eyes open for:
            <br />
            <span className="text-6xl font-bold text-green-400 block mt-4">
              {gameState.score} seconds
            </span>
          </div>
          <button
            onClick={startGame}
            className="mt-8 py-3 px-6 bg-white text-black font-bold hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
      <div className="mt-4 text-sm">
        <p>Debug Info:</p>
        <p>Left Eye Movement: {debugInfo.leftEye}%</p>
        <p>Right Eye Movement: {debugInfo.rightEye}%</p>
        <p>Average Movement: {debugInfo.averageChange}%</p>
      </div>
    </div>
  );
}