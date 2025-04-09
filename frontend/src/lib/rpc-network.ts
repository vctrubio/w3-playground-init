const INFURA_PROJECT_ID = "d8813f365adb4e3fa6365a111eed3589"; // process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;

export interface NetworkChain {
  id: string;
  name: string;
  rpcUrl: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorer?: string;
}

export const networkChains: NetworkChain[] = [
  {
    id: "1",
    name: "Ethereum Mainnet",
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    currency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorer: "https://etherscan.io",
  },
  {
    id: "11155111",
    name: "Sepolia Testnet",
    rpcUrl: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
    currency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorer: "https://sepolia.etherscan.io",
  },
  {
    id: "31337",
    name: "Localhost (Hardhat)",
    rpcUrl: "http://localhost:8545",
    currency: {
      name: "Hardhat Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  {
    id: "59144",
    name: "Linea Mainnet",
    rpcUrl: `https://linea-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    currency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorer: "https://lineascan.build",
  },
  {
    id: "1337",
    name: "Localhost (Ganache)",
    rpcUrl: "http://localhost:7545", // Default Ganache port
    currency: {
      name: "Ganache Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  {
    id: "137",
    name: "Polygon Mainnet",
    rpcUrl: `https://polygon-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    currency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    blockExplorer: "https://polygonscan.com",
  },
  {
    id: "10",
    name: "Optimism Mainnet",
    rpcUrl: `https://optimism-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    currency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorer: "https://optimistic.etherscan.io",
  },
  {
    id: "42161",
    name: "Arbitrum One",
    rpcUrl: `https://arbitrum-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    currency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorer: "https://arbiscan.io",
  },
  {
    id: "100",
    name: "Gnosis Chain",
    rpcUrl: "https://rpc.gnosischain.com",
    currency: {
      name: "xDAI",
      symbol: "xDAI",
      decimals: 18,
    },
    blockExplorer: "https://blockscout.com/xdai/mainnet",
  },
  {
    id: "43114",
    name: "Avalanche C-Chain",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    currency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
    },
    blockExplorer: "https://snowtrace.io",
  },
  {
    id: "56",
    name: "BNB Smart Chain",
    rpcUrl: "https://bsc-dataseed.binance.org",
    currency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    blockExplorer: "https://bscscan.com",
  },
];

// Helper function to check if a network is a local network
export function isLocalNetwork(chainId: string): boolean {
  return chainId === "31337" || chainId === "1337";
}
