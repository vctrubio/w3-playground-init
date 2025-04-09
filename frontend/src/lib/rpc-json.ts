import { ethers } from "ethers";
import { User } from "./types";
import { networkChains, isLocalNetwork, NetworkChain } from "./rpc-network";

export interface ApiResponse {
  success: boolean;
  message: string;
  code?: number;
  type?: "error" | "warning" | "success";
  data?: any;
}

export function getIsWeb3() {
  return (
    typeof window.ethereum !== "undefined" || typeof window.web3 !== "undefined"
  );
}

async function getWalletCredentials(provider: ethers.BrowserProvider) {
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  const balance = await provider.getBalance(address);
  const currency = "ETH"; // default to ETH, you can modify this based on the network

  // check name, id, and balance is not null....
  return {
    address,
    signer,
    network: {
      id: network.chainId.toString(),
      name: network.name,
      balance: ethers.formatEther(balance),
      currency: currency,
    },
  };
}

export async function getWallet(): Promise<User | null> {
  if (!getIsWeb3()) return null;

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const { address, network, signer } = await getWalletCredentials(provider);
    return {
      address,
      network,
      provider,
      signer,
    };
  } catch (error) {
    console.error("Error creating provider:", error);
    return null;
  }
}

// Re-export networkChains for backward compatibility
export { networkChains, isLocalNetwork };

// Function to add a network to the wallet with improved error handling
export async function addNetwork(chain: NetworkChain): Promise<ApiResponse> {
  if (typeof window.ethereum === "undefined") {
    return {
      success: false,
      message: "MetaMask or compatible wallet not found",
      type: "error",
    };
  }

  try {
    const params = {
      chainId: `0x${parseInt(chain.id).toString(16)}`,
      chainName: chain.name,
      rpcUrls: [chain.rpcUrl],
      nativeCurrency: chain.currency || {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
    };

    // Only add blockExplorer if it exists
    if (chain.blockExplorer) {
      Object.assign(params, { blockExplorerUrls: [chain.blockExplorer] });
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [params],
    });

    return {
      success: true,
      message: `${chain.name} has been added to your wallet`,
      type: "success",
    };
  } catch (error: any) {
    console.error("Error adding network:", error);

    // Specific error handling for local networks
    if (isLocalNetwork(chain.id)) {
      if (error.message?.includes("resolve host")) {
        return {
          success: false,
          message: `Failed to connect to ${chain.name}. Make sure your local node is running.`,
          code: error.code,
          type: "error",
        };
      }
    }

    return {
      success: false,
      message: error.message || "Failed to add network",
      code: error.code,
      type: "error",
    };
  }
}

// Switch network function with improved error handling and automatic network addition
export async function switchNetwork(chainId: string): Promise<ApiResponse> {
  console.log("hex chainId:", `0x${parseInt(chainId).toString(16)}`);
  if (typeof window.ethereum === "undefined") {
    return {
      success: false,
      message: "MetaMask or compatible wallet not found",
      type: "error",
    };
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${parseInt(chainId).toString(16)}` }],
    });

    return {
      success: true,
      message: "Network switched successfully",
      type: "success",
    };
  } catch (error: any) {
    // Handle the case where the chain hasn't been added to MetaMask
    if (
      error.code === 4902 ||
      (error.message && error.message.includes("Unrecognized chain ID"))
    ) {
      const chain = networkChains.find((c) => c.id === chainId);

      if (chain) {
        const warningResponse: ApiResponse = {
          success: false,
          message: `Network not found in your wallet. Attempting to add ${chain.name}...`,
          type: "warning",
        };

        try {
          // Try to add the network
          const addResult = await addNetwork(chain);
          if (addResult.success) {
            return {
              success: true,
              message: `${chain.name} added to your wallet. Please try switching again.`,
              type: "success",
            };
          } else {
            return addResult; // Return the error from adding network
          }
        } catch (addError: any) {
          return {
            success: false,
            message: `Failed to add network: ${
              addError.message || "Unknown error"
            }`,
            code: addError.code,
            type: "error",
          };
        }
      }
    }

    // For other errors
    return {
      success: false,
      message: error.message || "Failed to switch network",
      code: error.code,
      type: "error",
    };
  }
}
