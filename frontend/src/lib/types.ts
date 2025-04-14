import { ethers } from "ethers";

export type Network = {
  name: string;
  id: string;
  balance: string;
  currency: string;
};


export type User = {
  address: string;
  network: Network;
  signer: ethers.JsonRpcSigner;
  provider: ethers.BrowserProvider;
  socket: ethers.WebSocketProvider;
  //needed to add WebSocketProvider, init in UserContext and use it in eventlistener.
};

export type Contract = {
  address: string;
  abi: ethers.InterfaceAbi;
  chainId?: number;
  instance?: ethers.Contract;
};

export type NotificationType = "error" | "warning" | "success" | "info";

export interface Notification {
  id?: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  code?: number;
  type?: NotificationType;
  data?: any;
}

export interface Token {
  id: number;
  name: string;
  color: string;
  description: string;
}

export interface RawEvent {
  address: string;
  tokenId: number;
  amount: number;
  type: 'mint' | 'burn';
  transactionHash?: string;
  blockNumber?: number;
}

export interface TokenOwnership {
  address: string;
  total: number;
}

export interface TokenOwnerships {
  [tokenId: number]: TokenOwnership[];
}

// Game tokens available in the application
export const TOKENS: Token[] = [
  { id: 0, name: "SEED", color: "#E0115F", description: "Free mint" },
  { id: 1, name: "WATER", color: "#0F52BA", description: "Free mint" },
  { id: 2, name: "SOIL", color: "#50C878", description: "Free mint" },
  { id: 3, name: "PLANT", color: "#8531BA", description: "Needs SEED and WATER" },
  { id: 4, name: "FRUIT", color: "#307DA1", description: "Needs WATER and SOIL" },
  { id: 5, name: "FLOWER", color: "#986C8E", description: "Needs SEED and SOIL" },
  { id: 6, name: "BASKET", color: "#483D6F", description: "Needs SEED, WATER, and SOIL" }
];

// Utility function to get token by ID
export function getTokenById(id: number): Token {
  const token = TOKENS.find(t => t.id === id);
  if (!token) {
    return { id, name: `Unknown #${id}`, color: "#999999", description: "Unknown token" };
  }
  return token;
}
