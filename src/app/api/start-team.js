import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { teamId } = await request.json();
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      gameStarted: true
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to start game:', error);
    return NextResponse.json({ error: 'Failed to start game' }, { status: 500 });
  }
}