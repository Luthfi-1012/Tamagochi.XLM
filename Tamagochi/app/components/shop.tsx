import React from "react";
import { Button } from "./ui/button";
import { useGame } from "~/context/game-context";
import { Sparkles } from "lucide-react";

export function Shop() {
  const { gameState, purchaseItem } = useGame();

  const items: { id: string; name: string; icon: string; cost: number }[] = [
    { id: "baju", name: "T-Shirt", icon: "👕", cost: 20 },
    { id: "jacket", name: "Blue Jacket", icon: "🧥", cost: 30 },
    { id: "pedang", name: "Sword", icon: "🗡️", cost: 40 },
    { id: "headset", name: "Headset", icon: "🎧", cost: 35 },
  ];

  return (
    <div className="bg-card border-4 border-border pixel-shadow p-4 sm:p-6">
      <h2 className="text-sm sm:text-base font-bold uppercase text-center pixel-text-shadow mb-4 flex items-center justify-center gap-2">
        <Sparkles className="h-4 w-4" /> Shop
      </h2>

      <div className="grid grid-cols-1 gap-2">
        {items.map((item) => {
          const owned = gameState.inventory.includes(item.id);
          const canAfford = (gameState.coins ?? 0) >= item.cost;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border-2 border-border bg-muted"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-xs sm:text-sm font-bold">{item.name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{item.cost} coins</p>
                </div>
              </div>
              {owned ? (
                <Button size="sm" variant="outline" disabled className="text-xs">
                  Owned
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="text-xs"
                  onClick={() => purchaseItem(item.id, item.cost)}
                  disabled={!canAfford}
                >
                  {canAfford ? "Buy" : "Need more coins"}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 text-center">
        Items you buy will appear in your Wardrobe where you can equip them.
      </p>
    </div>
  );
}
