import { Outlet } from "react-router";
import { Header } from "~/components/header";
import { GameProvider } from "~/context/game-context";

export default function () {
  return (
    <GameProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
          <Outlet />
        </main>

        <footer className="border-t-4 border-border bg-card py-4 text-center">
          <p className="text-[10px] sm:text-xs text-muted-foreground">🕹️ A Retro Pixel Pet Game</p>
        </footer>
      </div>
    </GameProvider>
  );
}
