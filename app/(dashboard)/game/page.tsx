export default function GamePage() {
  return (
    <div className="max-w-2xl mx-auto p-6 text-center space-y-8">
      <h1 className="font-pixel text-dream-bright text-sm">DREAM GAME</h1>
      <p className="font-sans text-dream-text text-sm leading-relaxed">
        Enter the Dream World — a 3D interactive experience where you float through clouds and discover dreams from other users. Rate them as you explore!
      </p>
      <div className="bg-dream-surface pixel-border-gold p-12 flex items-center justify-center">
        <p className="font-pixel text-dream-muted text-xs">
          Game launching soon...
        </p>
        {/* Replace with: <iframe src="GAME_URL" className="w-full h-[600px]" /> */}
      </div>
      <p className="font-pixel text-dream-muted text-xs">
        You must be signed in to rate dreams from within the game.
      </p>
    </div>
  );
}
