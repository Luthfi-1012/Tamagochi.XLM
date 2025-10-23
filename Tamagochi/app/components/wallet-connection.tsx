import React from "react";
import { Button } from "./ui/button";
import { Wallet, LogOut, Loader2 } from "lucide-react";
import { useWallet } from "~/hooks/use-wallet";

export const WalletConnection: React.FC = () => {
  const { address, connect, disconnect, isConnected, loading } = useWallet();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2 h-9">
        <div className="text-xs font-mono text-green-400 bg-green-900/20 px-2 py-2 rounded border border-green-500/30 h-9 flex items-center">
          {truncateAddress(address)}
        </div>
        <Button
          onClick={disconnect}
          variant="outline"
          size="sm"
          className="border-red-500/50 hover:border-red-400 hover:bg-red-500/10 h-9"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={connect}
      disabled={loading}
      size="sm"
      className="bg-blue-600 hover:bg-blue-700 text-white font-pixel h-9"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </>
      )}
    </Button>
  );
};
