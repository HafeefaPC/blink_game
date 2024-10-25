'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinTeam() {
  const [teamId, setTeamId] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/join-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId }),
    });
    const data = await response.json();
    if (data.success) {
      router.push(`/game?teamId=${teamId}`);
    } else {
      alert('Failed to join team. Please check the team ID.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Join a Team</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="teamId" className="block mb-2">Team ID:</label>
          <input
            type="text"
            id="teamId"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="w-full p-2 text-black"
            required
          />
        </div>
        <button type="submit" className="w-full py-3 px-4 bg-white text-black font-bold hover:bg-gray-200 transition-colors">
          Join Team
        </button>
      </form>
    </div>
  );
}