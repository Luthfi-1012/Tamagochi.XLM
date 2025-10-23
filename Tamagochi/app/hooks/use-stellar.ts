import { useCallback, useMemo } from "react";
import * as Tamago from "../../packages/contract";
import { useSubmitTransaction } from "./use-submit-transaction";
import { useWallet } from "./use-wallet";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  selectedWallet: unknown;
}

const NETWORK_PASSPHRASE = Tamago.networks.testnet.networkPassphrase;
const RPC_URL = "https://soroban-testnet.stellar.org";

export const useStellar = () => {
  const { address, isConnected } = useWallet();

  const { submit } = useSubmitTransaction({
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    onSuccess: () => {
      console.log("success submit tx");
    },
    onError: (error) => {
      console.error("Transaction error ", error);
    },
  });

  const getContractClient = useMemo(() => {
    if (!isConnected || address === "-") return null;

    return new Tamago.Client({
      ...Tamago.networks.testnet,
      rpcUrl: "https://soroban-testnet.stellar.org",
      allowHttp: false,
      publicKey: address || undefined,
    });
  }, [address]);

  // Helper for contract calls with transaction submission
  const execTx = useCallback(
    async (txPromise: Promise<any>) => {
      const tx = await txPromise;
      await submit(tx);
      return tx.result;
    },
    [submit]
  );

  // Helper for read-only contract calls
  const readTx = useCallback(
    async (txPromise: Promise<any>, defaultValue: any, transform?: (result: any) => any) => {
      try {
        const tx = await txPromise;
        return transform ? transform(tx.result) : tx.result;
      } catch {
        return defaultValue;
      }
    },
    []
  );

  // Contract methods
  const createPet = (name: string) => {
    const tx = getContractClient!.create({ owner: address, name });
    return execTx(tx);
  };

  /* --------------------------------- get_pet -------------------------------- */
  const getPet = () => {
    const tx = getContractClient!.get_pet({ owner: address });
    return readTx(tx, null);
  };

  /* -------------------------------- get_coins ------------------------------- */
  const getCoins = () => {
    return readTx(getContractClient!.get_coins({ owner: address }), 0, Number);
  };

  // Multi-pet helpers
  const listPets = () => {
    const tx = getContractClient!.list_pets({ owner: address });
    return readTx(tx, [], (res) => res as any[]);
  };

  const setActivePet = (petId: string) => {
    const tx = getContractClient!.set_active_pet({ owner: address, pet_id: petId });
    return execTx(tx);
  };

  /* ---------------------------------- feed ---------------------------------- */
  const feedPet = () => {
    return execTx(getContractClient!.feed({ owner: address }));
  };

  /* ---------------------------------- play ---------------------------------- */
  const playWithPet = () => {
    return execTx(getContractClient!.play({ owner: address }));
  };

  /* ---------------------------------- work ---------------------------------- */
  const workWithPet = () => {
    return execTx(getContractClient!.work({ owner: address }));
  };

  /* ---------------------------------- sleep --------------------------------- */
  const putPetToSleep = () => {
    return execTx(getContractClient!.sleep({ owner: address }));
  };

  /* ------------------------------ mint_glasses ------------------------------ */
  const mintGlasses = () => {
    return execTx(getContractClient!.mint_glasses({ owner: address }));
  };

  /* -------------------------------- buy_item -------------------------------- */
  const buyItem = (itemId: string, cost: number) => {
    return execTx(getContractClient!.buy_item({ owner: address, item_id: itemId, cost }));
  };

  return {
    createPet,
    getPet,
    getCoins,
    listPets,
    setActivePet,
    feedPet,
    playWithPet,
    workWithPet,
    putPetToSleep,
    mintGlasses,
    buyItem,
  };
};
