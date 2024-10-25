'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateTeam() {
    const [teamName, setTeamName] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [tries, setTries] = useState(3);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('/api/create-team', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamName, playerName, tries }),
        });
        const data = await response.json();
        router.push(`/game?teamId=${data.teamId}&playerName=${encodeURIComponent(playerName)}`);
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-8">Create a Team</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-md">
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
                <div className="mb-4">
                    <label htmlFor="playerName" className="block mb-2">Player Name:</label>
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
                    <label htmlFor="tries" className="block mb-2">Number of Tries:</label>
                    <input
                        type="number"
                        id="tries"
                        value={tries}
                        onChange={(e) => setTries(parseInt(e.target.value) || 3)}
                        className="w-full p-2 text-black"
                        min="1"
                        required
                    />
                </div>
                <button type="submit" className="w-full py-3 px-4 bg-white text-black font-bold hover:bg-gray-200 transition-colors">
                    Create Team
                </button>
            </form>
        </div>
    );
}