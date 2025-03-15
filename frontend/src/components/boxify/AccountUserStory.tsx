import { useState } from "react";
import { User } from "@/lib/types";
import { 
  connectWallet, 
  getBalance, 
  getChainId, 
  getCurrencySymbol,
  getBlockNumber,
  getBlockByNumber,
  getTransactionHistory,
} from "@/lib/ethera.js";

// Updated interface for props using the User type
export interface AccountUserStoryProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

export default function AccountUserStory({ user, setUser }: AccountUserStoryProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const accounts = await connectWallet();
      if (accounts && accounts.length > 0) {
        setUser(prev => ({
          ...prev,
          loggedIn: true,
          wallet: {
            ...prev.wallet,
            address: accounts[0],
          }
        }));
        setStep(2);
      } else {
        setError("No accounts returned from wallet");
      }
    } catch (err) {
      setError(`Failed to connect wallet: ${err instanceof Error ? err.message : String(err)}`);
      console.error("Connection error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckChain = async () => {
    setLoading(true);
    setError(null);
    try {
      const chainId = await getChainId();
      setUser(prev => ({
        ...prev,
        wallet: {
          ...prev.wallet,
          chainId: chainId
        }
      }));
      setStep(3);
    } catch (err) {
      setError(`Failed to get chain ID: ${err instanceof Error ? err.message : String(err)}`);
      console.error("Chain ID error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user.wallet.address) {
        throw new Error("No wallet address available");
      }
      
      const balanceInfo = await getBalance(user.wallet.address);
      
      setUser(prev => ({
        ...prev,
        wallet: {
          ...prev.wallet,
          balance: balanceInfo
        }
      }));
      setStep(4);
    } catch (err) {
      setError(`Failed to get balance: ${err instanceof Error ? err.message : String(err)}`);
      console.error("Balance error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBlockNumber = async () => {
    setLoading(true);
    setError(null);
    try {
      const blockNumber = await getBlockNumber();
      
      setUser(prev => ({
        ...prev,
        wallet: {
          ...prev.wallet,
          blockNumber
        }
      }));
      setStep(5);
    } catch (err) {
      setError(`Failed to get block number: ${err instanceof Error ? err.message : String(err)}`);
      console.error("Block number error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBlockHash = async () => {
    setLoading(true);
    setError(null);
    try {
      if (user.wallet.blockNumber === undefined) {
        throw new Error("Block number not available");
      }
      
      const block = await getBlockByNumber(user.wallet.blockNumber);
      
      setUser(prev => ({
        ...prev,
        wallet: {
          ...prev.wallet,
          blockHash: block.hash
        }
      }));
      setStep(6);
    } catch (err) {
      setError(`Failed to get block hash: ${err instanceof Error ? err.message : String(err)}`);
      console.error("Block hash error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetTransactions = async () => {
    //for later... takes too long
    setStep(7);
    return;
    //
    setLoading(true);
    setError(null);
    try {
      if (!user.wallet.address) {
        throw new Error("No wallet address available");
      }
      
      const transactions = await getTransactionHistory(user.wallet.address, 5);
      
      setUser(prev => ({
        ...prev,
        wallet: {
          ...prev.wallet,
          transactions
        }
      }));
      setStep(7);
    } catch (err) {
      setError(`Failed to get transactions: ${err instanceof Error ? err.message : String(err)}`);
      console.error("Transactions error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get the appropriate currency symbol based on the chain ID
  const currencySymbol = getCurrencySymbol(user.wallet.chainId);

  const resetGame = () => {
    setStep(1);
    setUser(prev => ({
      ...prev,
      loggedIn: false,
      wallet: {
        ...prev.wallet,
        address: null,
        chainId: null,
        balance: null,
        blockNumber: undefined,
        blockHash: undefined,
        transactions: undefined,
      }
    }));
    setError(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md border">
      <h3 className="text-lg font-medium mb-4">Wallet User Story Game</h3>
      
      <div className="mb-4">
        {/* Step 1: Connect Wallet */}
        <div className="flex items-center mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
          <span className="font-medium">Connect Wallet</span>
          {user.wallet.address && <span className="ml-2 text-green-500">✓</span>}
        </div>
        
        {step === 1 && (
          <div className="ml-11 mb-4">
            <p className="mb-2 text-sm">Connect your wallet to continue.</p>
            <button 
              onClick={handleConnectWallet}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        )}
        
        {/* Step 2: Identify Chain */}
        <div className="flex items-center mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
          <span className="font-medium">Identify Chain</span>
          {user.wallet.chainId && <span className="ml-2 text-green-500">✓</span>}
        </div>
        
        {step === 2 && (
          <div className="ml-11 mb-4">
            <p className="mb-2 text-sm">Great! Now let's check which blockchain network you're connected to.</p>
            <button 
              onClick={handleCheckChain}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Chain'}
            </button>
          </div>
        )}
        
        {/* Step 3: Check Balance */}
        <div className="flex items-center mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>3</div>
          <span className="font-medium">Check Balance</span>
          {user.wallet.balance !== null && <span className="ml-2 text-green-500">✓</span>}
        </div>
        
        {step === 3 && (
          <div className="ml-11 mb-4">
            <p className="mb-2 text-sm">Now let's check your wallet balance.</p>
            <button 
              onClick={handleCheckBalance}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Check Balance'}
            </button>
          </div>
        )}
        
        {/* Step 4: Get Block Number */}
        <div className="flex items-center mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${step >= 4 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>4</div>
          <span className="font-medium">Check Block Number</span>
          {user.wallet.blockNumber !== undefined && <span className="ml-2 text-green-500">✓</span>}
        </div>
        
        {step === 4 && (
          <div className="ml-11 mb-4">
            <p className="mb-2 text-sm">Let's check the current block number.</p>
            <button 
              onClick={handleCheckBlockNumber}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Check Block Number'}
            </button>
          </div>
        )}
        
        {/* Step 5: Get Block Hash */}
        <div className="flex items-center mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${step >= 5 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>5</div>
          <span className="font-medium">Check Block Hash</span>
          {user.wallet.blockHash && <span className="ml-2 text-green-500">✓</span>}
        </div>
        
        {step === 5 && (
          <div className="ml-11 mb-4">
            <p className="mb-2 text-sm">Now let's get the hash of the current block.</p>
            <button 
              onClick={handleCheckBlockHash}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Check Block Hash'}
            </button>
          </div>
        )}
        
        {/* Step 6: Get Transactions */}
        <div className="flex items-center mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${step >= 6 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>6</div>
          <span className="font-medium">Check Transaction History</span>
          {user.wallet.transactions && <span className="ml-2 text-green-500">✓</span>}
        </div>
        
        {step === 6 && (
          <div className="ml-11 mb-4">
            <p className="mb-2 text-sm">Finally, let's check your recent transaction history.</p>
            <button 
              onClick={handleGetTransactions}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get Transactions'}
            </button>
          </div>
        )}
        
        {/* Completion Step */}
        {step === 7 && (
          <div className="ml-11 bg-green-100 dark:bg-green-900 p-4 rounded-md">
            <p className="text-green-700 dark:text-green-300 font-medium">Congratulations! You've completed all steps.</p>
            <div className="mt-4 space-y-2">
              <p><strong>Your Address:</strong> {user.wallet.address}</p>
              <p><strong>Network:</strong> {getNetworkName(user.wallet.chainId)}</p>
              <p><strong>Balance:</strong> {user.wallet.balance ? user.wallet.balance.formatted : "0.0000"} {currencySymbol}</p>
              <p><strong>Current Block:</strong> {user.wallet.blockNumber}</p>
              <p><strong>Block Hash:</strong> <span className="text-xs break-all">{user.wallet.blockHash}</span></p>
              
              {user.wallet.transactions && user.wallet.transactions.length > 0 ? (
                <div>
                  <p className="font-medium mb-2">Recent Transactions:</p>
                  <div className="max-h-40 overflow-y-auto">
                    {user.wallet.transactions.map((tx, index) => (
                      <div key={index} className="border-t first:border-t-0 py-2">
                        <p className="text-xs break-all">
                          <strong>Hash:</strong> {tx.hash}
                        </p>
                        <p className="text-xs">
                          <strong>From:</strong> {tx.from === user.wallet.address ? 'You' : tx.from.substring(0, 8) + '...'}
                        </p>
                        <p className="text-xs">
                          <strong>To:</strong> {tx.to === user.wallet.address ? 'You' : tx.to.substring(0, 8) + '...'}
                        </p>
                        <p className="text-xs">
                          <strong>Value:</strong> {tx.formattedValue}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p>No recent transactions found.</p>
              )}
            </div>
            <button 
              onClick={resetGame}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Start Over
            </button>
          </div>
        )}
        
        {error && (
          <div className="ml-11 bg-red-100 dark:bg-red-900 p-3 rounded-md text-red-700 dark:text-red-300 text-sm mt-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get network name from chain ID
function getNetworkName(chainId: string | null): string {
  if (!chainId) return "Unknown";
  
  const networks: Record<string, string> = {
    "0x1": "Ethereum Mainnet",
    "0x3": "Ropsten Testnet",
    "0x4": "Rinkeby Testnet",
    "0x5": "Goerli Testnet",
    "0xaa36a7": "Sepolia Testnet",
    "0x89": "Polygon Mainnet",
    "0x13881": "Mumbai Testnet"
  };
  
  return networks[chainId] || `Unknown Network (${chainId})`;
}
