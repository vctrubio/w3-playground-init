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
};

export type Contract = {
  address: string | null;
  chainId: number | null;
  abi: ethers.InterfaceAbi | null;
  instance: ethers.Contract | null;
};
