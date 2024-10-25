import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { teamName, playerName, tries } = await request.json();
    const docRef = await setDoc(doc(db, 'teams', teamName), {
      name: teamName,
      players: [playerName],
      rounds: 1,
      gameStarted: false,
      winner: null,
      tries: tries,
    });
    return NextResponse.json({ 
      teamId: teamName,
      message: 'Waiting for the next player'
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to create team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}