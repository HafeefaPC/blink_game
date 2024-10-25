import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Blink Challenge</h1>
        <p className="text-sm">Test your focus in a retro staring contest!</p>
      </header>

      <main className="w-full max-w-md">
        <div className="border-4 border-white p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Choose an Option</h2>
          
          <div className="space-y-4">
            <Link href="/create-team" className="block w-full py-3 px-4 bg-white text-black text-center font-bold hover:bg-gray-200 transition-colors">
              Create a Team
            </Link>
            
            <Link href="/join-team" className="block w-full py-3 px-4 bg-white text-black text-center font-bold hover:bg-gray-200 transition-colors">
              Join a Team
            </Link>
          </div>
        </div>
      </main>

      
    </div>
  );
}