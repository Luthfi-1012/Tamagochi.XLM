import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useStellar } from "~/hooks/use-stellar";
import * as Tamago from "../../packages/contract";
import { useWallet } from "~/hooks/use-wallet";
import { toast } from "sonner";
import type { GameState, PetStats, GameContextType } from "./game-context.type";

const GameContext = createContext<GameContextType | undefined>(undefined);

const INITIAL_STATE: GameState = {
  stats: {
    hunger: 0,
    happy: 0,
    energy: 0,
  },
  coins: 0,
  inventory: [],
  equippedItems: [],
  isSleeping: false,
  lastUpdate: Date.now(),
  petMood: "neutral",
  petName: undefined,
  hasRealPet: false,
  pets: [],
  activePetId: undefined,
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useWallet();
  const {
    getPet,
    getCoins,
    createPet,
    listPets,
    setActivePet,
    buyItem,
    feedPet: feedPetStellar,
    mintGlasses,
    playWithPet: playWithPetStellar,
    workWithPet: workWithPetStellar,
    putPetToSleep: putPetToSleepStellar,
  } = useStellar();

  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem("pixelPetGame");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, lastUpdate: Date.now() };
    }
    return INITIAL_STATE;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("pixelPetGame", JSON.stringify(gameState));
  }, [gameState]);

  // Helper to convert blockchain Pet to our PetStats
  const convertPetToStats = (
    pet: Tamago.Pet
  ): { stats: PetStats; petName: string; level: number; evolutionStage: number; exp: number } => {
    return {
      stats: {
        hunger: Number(pet.hunger),
        happy: Number(pet.happiness),
        energy: Number(pet.energy),
      },
      petName: pet.name,
      level: Number(pet.level ?? 1),
      evolutionStage: Number(pet.evolution_stage ?? 1),
      exp: Number((pet as any).exp ?? 0),
    };
  };

  // Calculate pet mood based on stats
  const calculateMood = (stats: PetStats, isSleeping: boolean): GameState["petMood"] => {
    if (isSleeping) return "sleeping";
    const avgStat = (stats.hunger + stats.happy + stats.energy) / 3;
    if (avgStat > 60) return "happy";
    if (avgStat > 30) return "neutral";
    return "sad";
  };

  // Sync with blockchain data
  const syncWithBlockchain = useCallback(async () => {
    if (!isConnected) return;

    console.log("masuk kok sync");

    try {
      setIsLoading(true);
      const [pet, coins, petsList] = await Promise.all([getPet(), getCoins(), listPets()]);

      if (pet && pet.is_alive) {
        const { stats, petName, level, evolutionStage, exp } = convertPetToStats(pet);
        setGameState((prev) => ({
          ...prev,
          stats,
          coins,
          petName,
          level,
          evolutionStage,
          exp,
          hasRealPet: true,
          petMood: calculateMood(stats, false),
          pets: petsList.map((p: any) => ({ id: p.id, name: p.name })),
          activePetId: pet.id,
          equippedItems: pet.has_glasses
            ? [...prev.equippedItems.filter((item) => item !== "cool-glasses"), "cool-glasses"]
            : prev.equippedItems.filter((item) => item !== "cool-glasses"),
          inventory: pet.has_glasses
            ? [...prev.inventory.filter((item) => item !== "cool-glasses"), "cool-glasses"]
            : prev.inventory.filter((item) => item !== "cool-glasses"),
        }));
      } else {
        // Pet doesn't exist or is dead
        setGameState((prev) => ({
          ...prev,
          hasRealPet: false,
          coins,
          pets: petsList.map((p: any) => ({ id: p.id, name: p.name })),
          activePetId: undefined,
          petName: undefined,
        }));
      }
    } catch (error) {
      console.error("Failed to sync with blockchain:", error);
      toast.error("Failed to sync with blockchain");
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // Create real pet on blockchain
  const createRealPet = async (name: string) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      toast.loading("Creating pet on Stellar...", { id: "create" });

      const pet = await createPet(name);
      const { stats, petName, level, evolutionStage, exp } = convertPetToStats(pet);

      setGameState((prev) => ({
        ...prev,
        stats,
        petName,
        level,
        evolutionStage,
        exp,
        hasRealPet: true,
        petMood: calculateMood(stats, false),
        lastUpdate: Date.now(),
        pets: [...prev.pets.filter((p) => p.id !== pet.id), { id: pet.id, name: pet.name }],
        activePetId: pet.id,
      }));

      toast.dismiss("create");
      toast.success(`🎉 ${name} created on Stellar!`);
    } catch (error) {
      console.error("Failed to create pet:", error);
      toast.error("Failed to create pet on blockchain");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for blockchain actions
  const executeStellarAction = async (
    action: () => Promise<any>,
    loadingMsg: string,
    successMsg: string,
    toastId: string
  ) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!gameState.hasRealPet) {
      toast.error("Please create a pet on Stellar first");
      return;
    }

    try {
      setIsLoading(true);
      toast.loading(loadingMsg, { id: toastId });
      await action();
      await syncWithBlockchain();
      toast.dismiss(toastId);
      toast.success(successMsg);
    } catch (error) {
      console.error(`Blockchain ${toastId} failed:`, error);
      toast.error(`Failed to ${toastId} on blockchain`);
    } finally {
      setIsLoading(false);
    }
  };

  // prettier-ignore
  const feedPet = () => executeStellarAction(feedPetStellar, "Feeding pet on Stellar...", "🍖 Yum! Pet fed on-chain!", "feed");

  // prettier-ignore
  const playWithPet = () => executeStellarAction(playWithPetStellar, "Playing with pet on Stellar...", "🎮 Wheee! So fun on-chain!", "play");

  // prettier-ignore
  const workWithPet = () => executeStellarAction(workWithPetStellar, "Working with pet on Stellar...", "💰 Work completed on-chain!", "work");

  // prettier-ignore
  const putPetToSleep = () => executeStellarAction(putPetToSleepStellar, "Putting pet to sleep on Stellar...", "💤 Pet is sleeping on-chain!", "sleep");

  // Helper for wallet/pet validation
  const validatePetAction = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return false;
    }
    if (!gameState.hasRealPet) {
      toast.error("Please create a pet on Stellar first");
      return false;
    }
    return true;
  };

  const equipItem = (item: string) => {
    if (!validatePetAction()) return;

    setGameState((prev) => {
      if (prev.equippedItems.includes(item)) {
        toast("👔 Already equipped!", { icon: "ℹ️" });
        return prev;
      }

      toast.success(`✨ Equipped ${item}!`);
      return {
        ...prev,
        equippedItems: [...prev.equippedItems, item],
      };
    });
  };

  const unequipItem = (item: string) => {
    if (!validatePetAction()) return;

    setGameState((prev) => ({
      ...prev,
      equippedItems: prev.equippedItems.filter((i) => i !== item),
    }));
    toast("👔 Item unequipped");
  };

  const mintCoolGlasses = () =>
    executeStellarAction(
      mintGlasses,
      "🌟 Minting on Stellar...",
      "🕶️ Cool Glasses minted on-chain!",
      "mint"
    );

  // Add local wardrobe item (non-NFT) to inventory
  const addItem = (item: string) => {
    setGameState((prev) => {
      if (prev.inventory.includes(item)) {
        toast("Already owned", { icon: "ℹ️" });
        return prev;
      }
      toast.success(`Added ${item}!`);
      return { ...prev, inventory: [...prev.inventory, item] };
    });
  };

  // Purchase an item from shop using coins (simulated on-chain)
  const purchaseItem = async (item: string, cost: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    try {
      setIsLoading(true);
      toast.loading("Purchasing item...", { id: "buy" });
      const res = await buyItem(item, cost);
      if (res?.ok) {
        const coins = await getCoins();
        setGameState((prev) => ({
          ...prev,
          coins,
          inventory: prev.inventory.includes(item) ? prev.inventory : [...prev.inventory, item],
        }));
        toast.success("Item purchased!");
      } else {
        toast.error("Not enough coins to buy this item");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to purchase item");
    } finally {
      toast.dismiss("buy");
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    if (window.confirm("Reset your pet? All progress will be lost!")) {
      setGameState(INITIAL_STATE);
      toast("🔄 Game reset!");
    }
  };

  const selectActivePet = async (petId: string) => {
    try {
      setIsLoading(true);
      await setActivePet(petId);
      await syncWithBlockchain();
    } finally {
      setIsLoading(false);
    }
  };

  // Reset game state when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setGameState(INITIAL_STATE);
    } else {
      syncWithBlockchain();
    }
  }, [isConnected]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        feedPet,
        playWithPet,
        workWithPet,
        putPetToSleep,
        equipItem,
        unequipItem,
        mintCoolGlasses,
        purchaseItem,
        addItem,
        resetGame,
        createRealPet,
        syncWithBlockchain,
        isLoading,
        selectActivePet,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
};
