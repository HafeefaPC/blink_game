'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import VideoCall from '../../components/VideoCall';
import BlinkDetector from '../../components/BlinkDetector';

export default function Game() {
  const [gameState, setGameState] = useState(null);
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');

  useEffect(() => {
    if (teamId) {
      const unsubscribe = onSnapshot(doc(db, 'teams', teamId), (doc) => {
        setGameState(doc.data());
      });
      return () => unsubscribe();
    }
  }, [teamId]);

  const startGame = async () => {
    await fetch('/api/start-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId }),
    });
  };

  const handleBlink = async (player) => {
    if (gameState?.gameStarted && !gameState?.winner) {
      await fetch('/api/end-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, winner: player === 1 ? 2 : 1 }),
      });
    }
  };

  if (!gameState) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Blink Challenge</h1>
      <div className="flex space-x-4 mb-8">
        <VideoCall />
        <VideoCall />
      </div>
      {!gameState.gameStarted && (
        <button
          onClick={startGame}
          className="py-3 px-4 bg-white text-black font-bold hover:bg-gray-200 transition-colors"
        >
          Start Game
        </button>
      )}
      {gameState.gameStarted && !gameState.winner && (
        <div className="text-2xl">Game in progress... Don't blink!</div>
      )}
      {gameState.winner && (
        <div className="text-2xl">Player {gameState.winner} wins!</div>
      )}
      <BlinkDetector onBlink={() => handleBlink(1)} />
      <BlinkDetector onBlink={() => handleBlink(2)} />
    </div>
  );
}