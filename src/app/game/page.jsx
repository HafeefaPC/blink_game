// src/app/game/page.jsx
'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import VideoCall from '../../components/VideoCall';
import BlinkDetector from '../../components/BlinkDetector';
import Confetti from 'react-confetti';
import SearchParamsProvider from './SearchParamsProvider'; // Import the new component

export default function Game() {
  const [teamName, setTeamName] = useState(null);
  const [playerName, setPlayerName] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Callback to set team and player names from SearchParamsProvider
  const handleParamsReady = ({ teamName, playerName }) => {
    setTeamName(teamName);
    setPlayerName(playerName);
  };

  // Fetch the game state from Firestore
  useEffect(() => {
    if (teamName) {
      const teamsRef = collection(db, 'teams');
      const q = query(teamsRef, where('name', '==', teamName));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setGameState(doc.data());
          if (doc.data().winner) {
            setShowConfetti(true);
          }
        } else {
          console.error('No such document!');
          setError('No such document!');
        }
      }, (err) => {
        console.error('Error fetching game state:', err);
        setError('Failed to fetch game state. Please try again.');
      });
      return () => unsubscribe();
    }
  }, [teamName]);

  // Start the game
  const startGame = useCallback(async () => {
    if (!teamName) return;
    try {
      await updateDoc(doc(db, 'teams', teamName), {
        gameStarted: true,
        winner: null,
        startTime: Date.now(),
        player1Tries: gameState.tries,
        player2Tries: gameState.tries
      });
    } catch (err) {
      console.error('Failed to start game:', err);
      setError('Failed to start the game. Please try again.');
    }
  }, [teamName, gameState]);

  // Handle blink detection
  const handleBlink = useCallback(async (player) => {
    if (!teamName || !gameState?.gameStarted || gameState?.winner) return;
    try {
      const playerTriesField = player === 1 ? 'player1Tries' : 'player2Tries';
      const newTries = gameState[playerTriesField] - 1;

      if (newTries <= 0) {
        const winnerPlayer = player === 1 ? 2 : 1;
        const winnerName = winnerPlayer === 1 ? gameState.players[0] : gameState.players[1];
        await updateDoc(doc(db, 'teams', teamName), {
          [playerTriesField]: 0,
          winner: winnerName,
          endTime: Date.now(),
          duration: Date.now() - gameState.startTime
        });
      } else {
        await updateDoc(doc(db, 'teams', teamName), {
          [playerTriesField]: newTries
        });
      }
    } catch (err) {
      console.error('Failed to update game state:', err);
      setError('Failed to update the game state. Please try again.');
    }
  }, [teamName, gameState]);

  // Error handling and loading state
  if (error) return <div className="text-red-500">{error}</div>;
  if (!gameState) return <div>Loading...</div>;

  const isPlayer1 = playerName === gameState.players[0];
  const isPlayer2 = playerName === gameState.players[1];

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsProvider onParamsReady={handleParamsReady} />
      <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8">Blink Challenge</h1>
        {gameState.players.length === 2 && (
          <div className="flex space-x-4 mb-8">
            <VideoCall isLocalUser={isPlayer1} />
            <VideoCall isLocalUser={isPlayer2} />
          </div>
        )}
        {!gameState.gameStarted && gameState.players.length === 2 && (
          <button
            onClick={startGame}
            className="py-3 px-4 bg-white text-black font-bold hover:bg-gray-200 transition-colors"
          >
            Start Game
          </button>
        )}
        {gameState.gameStarted && !gameState.winner && (
          <div className="text-2xl mb-4">Game in progress... Don&apos;t blink!</div>
        )}
        {gameState.gameStarted && (
          <div className="flex space-x-8 mb-4">
            <div>
              <p>{gameState.players[0]}: {gameState.player1Tries} tries left</p>
              {isPlayer1 && <BlinkDetector onBlink={() => handleBlink(1)} />}
            </div>
            <div>
              <p>{gameState.players[1]}: {gameState.player2Tries} tries left</p>
              {isPlayer2 && <BlinkDetector onBlink={() => handleBlink(2)} />}
            </div>
          </div>
        )}
        {gameState.winner && (
          <div className="text-2xl">
            {gameState.winner} wins!
            <br />
            Time: {((gameState.endTime - gameState.startTime) / 1000).toFixed(2)} seconds
          </div>
        )}
        {showConfetti && <Confetti />}
      </div>
    </Suspense>
  );
}