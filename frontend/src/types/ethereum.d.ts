// Type definitions for Ethereum-related window properties
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (request: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, callback: (...args: any[]) => void) => void;
    removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
  };
  web3?: any;
}

// Additional types for import.meta.env for Vite
interface ImportMeta {
  env: {
    VITE_INFURA_PROJECT_ID: string;
    [key: string]: string;
  };
}

