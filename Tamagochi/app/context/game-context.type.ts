export interface PetStats {
  hunger: number; // 0-100
  happy: number; // 0-100
  energy: number; // 0-100
}

export interface GameState {
  stats: PetStats;
  coins: number;
  inventory: string[];
  equippedItems: string[];
  isSleeping: boolean;
  lastUpdate: number;
  petMood: "happy" | "neutral" | "sad" | "sleeping";
  petName?: string;
  hasRealPet: boolean; // Track if user has created a pet on-chain
  pets: { id: string; name: string }[];
  activePetId?: string;
  level?: number;
  evolutionStage?: number; // 1..3
  exp?: number; // 0..100 to next level
}

export interface GameContextType {
  gameState: GameState;
  feedPet: () => void;
  playWithPet: () => void;
  workWithPet: () => void;
  putPetToSleep: () => void;
  equipItem: (item: string) => void;
  unequipItem: (item: string) => void;
  mintCoolGlasses: () => void;
  addItem: (item: string) => void;
  purchaseItem: (item: string, cost: number) => void;
  resetGame: () => void;
  createRealPet: (name: string) => void;
  syncWithBlockchain: () => void;
  isLoading: boolean;
  selectActivePet: (petId: string) => void;
}
