import React from "react";
import { Button } from "./ui/button";
import { useGame } from "~/context/game-context";
import { RefreshCw, Loader2 } from "lucide-react";
import { useWallet } from "~/hooks/use-wallet";

export function SyncButton() {
  const { syncWithBlockchain, isLoading } = useGame();
  const { isConnected } = useWallet();

  if (!isConnected) {
    return null;
  }

  return (
    <Button
      onClick={syncWithBlockchain}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/10 h-9"
      title="Sync with Stellar blockchain"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
    </Button>
  );
}
