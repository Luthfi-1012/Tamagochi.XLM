import React from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useGame } from "~/context/game-context";
import { Shirt, Sparkles } from "lucide-react";

export function Wardrobe() {
  const { gameState, equipItem, unequipItem } = useGame();

  const items = [
    {
      id: "cool-glasses",
      name: "Cool Glasses",
      icon: "🕶️",
      isNFT: false, // treat as normal item for inventory display
    },
    {
      id: "hat",
      name: "Red Cap",
      icon: "🧢",
      isNFT: false,
    },
    {
      id: "jacket",
      name: "Blue Jacket",
      icon: "🧥",
      isNFT: false,
    },
    {
      id: "baju",
      name: "T-Shirt",
      icon: "👕",
      isNFT: false,
    },
    {
      id: "pedang",
      name: "Sword",
      icon: "🗡️",
      isNFT: false,
    },
    {
      id: "headset",
      name: "Headset",
      icon: "🎧",
      isNFT: false,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="h-16 sm:h-20 w-full max-w-md flex flex-col items-center justify-center gap-1 pixel-shadow hover:translate-y-1 transition-transform text-xs sm:text-sm"
        >
          <Shirt className="h-5 w-5 sm:h-6 sm:w-6" />
          <span>Wardrobe</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md pixel-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl pixel-text-shadow">🎨 Wardrobe</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Equip items to customize your pet!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Inventory Items */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold mb-2 uppercase">Your Items</h3>
            <div className="space-y-2">
              {gameState.inventory.length === 0 ? (
                <p className="text-xs text-muted-foreground">No items yet. Mint some below!</p>
              ) : (
                gameState.inventory.map((itemId) => {
                  const item = items.find((i) => i.id === itemId);
                  if (!item) return null;

                  const isEquipped = gameState.equippedItems.includes(itemId);

                  return (
                    <div
                      key={itemId}
                      className="flex items-center justify-between p-3 border-2 border-border bg-background"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-xs sm:text-sm font-bold">{item.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant={isEquipped ? "destructive" : "default"}
                        onClick={() => (isEquipped ? unequipItem(itemId) : equipItem(itemId))}
                        className="text-xs"
                      >
                        {isEquipped ? "Unequip" : "Equip"}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Shop removed; now handled by separate Shop component */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
