'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinTeam() {
  const [teamName, setTeamName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [tries, setTries] = useState(3);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/join-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName, playerName, tries }),
      });
      const data = await response.json();
      if (response.ok) {
        router.push(`/game?teamName=${encodeURIComponent(teamName)}&playerName=${encodeURIComponent(playerName)}`);
      } else {
        setError(data.error || 'Failed to join team. Please check the team name.');
      }
    } catch (error) {
      console.error('Error joining team:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Join a Team</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="playerName" className="block mb-2">Your Name:</label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-2 text-black"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="teamName" className="block mb-2">Team Name:</label>
          <input
            type="text"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full p-2 text-black"
            required
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button type="submit" className="w-full py-3 px-4 bg-white text-black font-bold hover:bg-gray-200 transition-colors">
          Join Team
        </button>
      </form>
    </div>
  );
}