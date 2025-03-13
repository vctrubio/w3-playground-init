import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

export default function Dashboard() {
  const { account, balance, isConnected } = useWallet();
  const [contractAddress, setContractAddress] = useState('');
  const [recentContracts, setRecentContracts] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentContracts');
    return saved ? JSON.parse(saved) : [];
  });

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contractAddress && !recentContracts.includes(contractAddress)) {
      const updated = [contractAddress, ...recentContracts.slice(0, 4)];
      setRecentContracts(updated);
      localStorage.setItem('recentContracts', JSON.stringify(updated));
    }
    // Here you would typically also load the contract ABI and interact with it
  };

  const handleContractSelect = (address: string) => {
    setContractAddress(address);
    // Logic to load the selected contract
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please connect your wallet to access the dashboard and interact with contracts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your Dashboard</h1>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Account</h2>
              <p className="text-gray-600 dark:text-gray-300 font-mono break-all">{account}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Balance</h2>
              <p className="text-gray-600 dark:text-gray-300">{balance} ETH</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Interact with a Contract</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-6">
            <form onSubmit={handleAddressSubmit}>
              <div className="mb-4">
                <label htmlFor="contractAddress" className="block text-gray-700 dark:text-gray-300 mb-2">
                  Contract Address
                </label>
                <input
                  type="text"
                  id="contractAddress"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0x..."
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                Load Contract
              </button>
            </form>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Contract Functions</h3>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400">
                  {contractAddress ? "Contract interactions will appear here" : "Enter a contract address above to interact with it"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Contracts</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-6">
            {recentContracts.length > 0 ? (
              <ul className="space-y-3">
                {recentContracts.map((address, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleContractSelect(address)}
                      className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-mono transition"
                    >
                      {address.substring(0, 18)}...
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                No recent contracts. Enter an address above to start.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
