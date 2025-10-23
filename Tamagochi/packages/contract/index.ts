// Temporary client that mixes local mock state for gameplay with
// real Soroban transaction assembly for selected methods.
// When you have a generated client, replace the assemble helpers below.
import { Address, nativeToScVal } from "@stellar/stellar-sdk";
import { assembleTransaction } from "@stellar/stellar-sdk/contract";

export type Pet = {
  id: string;
  owner?: string;
  name: string;
  birthdate?: number;
  last_updated?: number;
  is_alive: boolean;
  hunger: number;
  happiness: number;
  energy: number;
  has_glasses: boolean;
  level: number;
  exp: number; // 0..100 threshold per level
  evolution_stage: number; // 1..3, evolves every 2 levels
};

export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    // Replace with your deployed contract ID
    contractId: "CCZ7PMSCNHXO4XWRFBKLYCT7IDHS4JORM2BJBXK2E52V23NU4UKQT4WC",
  },
};

export type ClientOptions = {
  rpcUrl: string;
  networkPassphrase: string;
  allowHttp?: boolean;
  publicKey?: string;
  contractId?: string;
};

// Minimal shape that matches how use-stellar.ts uses the client methods:
// - methods return a Promise of an object that has toXDR() and result
// This will compile and let the app run until you wire the real client.
export class Client {
  constructor(public opts: ClientOptions) {}

  // In-memory state to simulate chain storage (per process)
  private static petsByOwner = new Map<string, Map<string, Pet>>();
  private static activePetByOwner = new Map<string, string>();
  private static walletCoins = new Map<string, number>();

  private tx(result: any) {
    return Promise.resolve({
      // Dummy XDR; submitting this will fail. Replace with real implementation.
      toXDR: () => "",
      result,
    });
  }

  // Helper: assemble a Soroban transaction for a contract method
  private assemble(method: string, args: any[]) {
    const contractAddress = this.opts.contractId ?? networks.testnet.contractId;
    if (!this.opts.publicKey) throw new Error("publicKey required to assemble transaction");
    return assembleTransaction({
      networkPassphrase: this.opts.networkPassphrase,
      rpcUrl: this.opts.rpcUrl,
      source: this.opts.publicKey,
      contractAddress,
      method,
      args,
    });
  }

  private static addExp(pet: Pet, gained: number) {
    pet.exp += gained;
    const LEVEL_EXP = 100;
    while (pet.exp >= LEVEL_EXP) {
      pet.exp -= LEVEL_EXP;
      pet.level += 1;
    }
    // Evolution thresholds: stage 2 at level >=3, stage 3 at level >=5
    if (pet.level >= 5) pet.evolution_stage = 3;
    else if (pet.level >= 3) pet.evolution_stage = 2;
    else pet.evolution_stage = 1;
  }

  create(_: { owner: string | null; name: string }) {
    const owner = _.owner ?? "-";
    const now = Date.now();
    const id = `${owner}:${now}:${Math.random().toString(36).slice(2, 8)}`;
    const pet: Pet = {
      id,
      owner,
      name: _.name,
      birthdate: now,
      last_updated: now,
      is_alive: true,
      hunger: 100,
      happiness: 100,
      energy: 100,
      has_glasses: false,
      level: 1,
      exp: 0,
      evolution_stage: 1,
    };
    const bag = Client.petsByOwner.get(owner) ?? new Map<string, Pet>();
    bag.set(id, pet);
    Client.petsByOwner.set(owner, bag);
    // Initialize coins if missing
    if (!Client.walletCoins.has(owner)) Client.walletCoins.set(owner, 0);
    // Set the newly created pet as active by default
    Client.activePetByOwner.set(owner, id);
    return this.tx(pet);
  }

  get_pet(_: { owner: string | null }) {
    const owner = _.owner ?? "-";
    const activeId = Client.activePetByOwner.get(owner);
    const bag = Client.petsByOwner.get(owner);
    const pet = activeId && bag ? bag.get(activeId) ?? null : null;
    return this.tx(pet);
  }

  get_coins(_: { owner: string | null }) {
    const owner = _.owner ?? "-";
    const c = Client.walletCoins.get(owner) ?? 0;
    return this.tx(c);
  }

  feed(_: { owner: string | null }) {
    const owner = _.owner ?? "-";
    const activeId = Client.activePetByOwner.get(owner);
    const bag = Client.petsByOwner.get(owner);
    const pet = activeId && bag ? bag.get(activeId) : undefined;
    if (pet && pet.is_alive) {
      pet.hunger = Math.min(100, pet.hunger + 30);
      pet.last_updated = Date.now();
      Client.addExp(pet, 5);
      bag!.set(activeId!, pet);
    }
    return this.tx(null);
  }

  play(_: { owner: string | null }) {
    const owner = _.owner ?? "-";
    const activeId = Client.activePetByOwner.get(owner);
    const bag = Client.petsByOwner.get(owner);
    const pet = activeId && bag ? bag.get(activeId) : undefined;
    if (pet && pet.is_alive) {
      pet.happiness = Math.min(100, pet.happiness + 20);
      pet.energy = Math.max(0, pet.energy - 15);
      pet.last_updated = Date.now();
      Client.addExp(pet, 8);
      bag!.set(activeId!, pet);
    }
    return this.tx(null);
  }

  work(_: { owner: string | null }) {
    const owner = _.owner ?? "-";
    const activeId = Client.activePetByOwner.get(owner);
    const bag = Client.petsByOwner.get(owner);
    const pet = activeId && bag ? bag.get(activeId) : undefined;
    if (pet && pet.is_alive) {
      if (pet.energy < 20) return this.tx(null);
      pet.energy = Math.max(0, pet.energy - 20);
      pet.happiness = Math.max(0, pet.happiness - 10);
      pet.last_updated = Date.now();
      Client.addExp(pet, 10);
      bag!.set(activeId!, pet);
      const c = Client.walletCoins.get(owner) ?? 0;
      Client.walletCoins.set(owner, c + 25);
    }
    return this.tx(null);
  }

  sleep(_: { owner: string | null }) {
    const owner = _.owner ?? "-";
    const activeId = Client.activePetByOwner.get(owner);
    const bag = Client.petsByOwner.get(owner);
    const pet = activeId && bag ? bag.get(activeId) : undefined;
    if (pet && pet.is_alive) {
      pet.energy = Math.min(100, pet.energy + 40);
      pet.last_updated = Date.now();
      Client.addExp(pet, 6);
      bag!.set(activeId!, pet);
    }
    return this.tx(null);
  }

  mint_glasses(_: { owner: string | null }) {
    // Build real Soroban tx (uses wallet & gas). Contract method must exist on-chain.
    const owner = _.owner ?? this.opts.publicKey ?? "-";
    return this.assemble("mint_glasses", [new Address(owner).toScVal()]);
  }

  // New methods for multi-pet support
  list_pets(_: { owner: string | null }) {
    const owner = _.owner ?? "-";
    const bag = Client.petsByOwner.get(owner);
    const list = bag ? Array.from(bag.values()) : [];
    return this.tx(list);
  }

  set_active_pet(_: { owner: string | null; pet_id: string }) {
    const owner = _.owner ?? "-";
    const bag = Client.petsByOwner.get(owner);
    if (bag && bag.has(_.pet_id)) {
      Client.activePetByOwner.set(owner, _.pet_id);
    }
    return this.tx(null);
  }

  // Simple shop: deduct coins and optionally mark glasses
  buy_item(_: { owner: string | null; item_id: string; cost: number }) {
    // Assemble a real on-chain transaction to consume gas and move state on Soroban.
    const owner = _.owner ?? this.opts.publicKey ?? "-";
    return this.assemble("buy_item", [
      new Address(owner).toScVal(),
      nativeToScVal(_.item_id, { type: "string" }),
      nativeToScVal(BigInt(_.cost), { type: "i128" }),
    ]);
  }
}
