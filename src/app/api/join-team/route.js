import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { teamName, playerName, tries } = await request.json(); // Get teamName, playerName, and tries from the request body
    
    // Query for the team with the given name
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where("name", "==", teamName));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Assume the first matching team is the one we want
      const teamDoc = querySnapshot.docs[0];
      await updateDoc(teamDoc.ref, {
        players: arrayUnion(playerName), // Add player name to the team
        playerTwo: playerName, // Store the name of player two
        tries: tries // Update the number of tries
      });
      return NextResponse.json({ success: true, teamId: teamDoc.id }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to join team:', error);
    return NextResponse.json({ error: 'Failed to join team' }, { status: 500 });
  }
}
