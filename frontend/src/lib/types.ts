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
