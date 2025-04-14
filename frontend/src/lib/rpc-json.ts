import { ethers } from "ethers";
import { User } from "./types";

export function getIsWeb3() {
  return (
    typeof window?.ethereum !== "undefined" || typeof window?.web3 !== "undefined"
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
    const provider = new ethers.BrowserProvider(window.ethereum!);
    await provider.send("eth_requestAccounts", []);
    const { address, network, signer } = await getWalletCredentials(provider);
    return {
      address,
      network,
      provider,
      signer,
      socket: undefined // Since it's optional, we can set it to undefined initially
    };
  } catch (error) {
    console.error("Error creating provider:", error);
    return null;
  }
}

