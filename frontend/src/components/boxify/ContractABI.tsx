import { useState } from 'react';

function ContractABI() {
  const [abi, setAbi] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContractAddress(e.target.value);
  };

  const fetchABI = () => {
    if (!contractAddress) return;
    
    setIsLoading(true);
    // Simulate ABI fetch - in a real app, you would fetch from Etherscan API or similar
    setTimeout(() => {
      setAbi(JSON.stringify({
        "contractName": "Example",
        "functions": [
          { "name": "transfer", "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}] },
          { "name": "balanceOf", "inputs": [{"name": "account", "type": "address"}] }
        ]
      }, null, 2));
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Contract ABI Explorer</h2>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Contract Address</label>
        <div className="flex gap-2">
          <input 
            type="text"
            value={contractAddress}
            onChange={handleAddressChange}
            placeholder="0x..."
            className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
          />
          <button 
            onClick={fetchABI}
            disabled={isLoading || !contractAddress}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Fetch ABI'}
          </button>
        </div>
      </div>
      
      {abi && (
        <div>
          <h3 className="font-semibold mb-2">ABI Preview</h3>
          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-60 text-sm">
            {abi}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ContractABI;
