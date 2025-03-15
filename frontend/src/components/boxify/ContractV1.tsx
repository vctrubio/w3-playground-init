import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { detectContractStandard, getProviderAndValidateAddress } from '@/lib/etherav2';

// Interface for contract metadata
interface ContractMetadata {
  address: string;
  name?: string;
  abi?: any[];
  standard?: string;
  isVerified?: boolean;
  timestamp?: number;
  userAdded?: boolean;
  tags?: string[];
}

// Factory interface to simulate a repository of contracts
interface ContractFactory {
  getPopularContracts: () => Promise<ContractMetadata[]>;
  searchContractByAddress: (address: string) => Promise<ContractMetadata | null>;
}

export default function Contract(): JSX.Element {
  // State for contract address input
  const [contractAddress, setContractAddress] = useState<string>('');
  
  // State for searched/found contract
  const [currentContract, setCurrentContract] = useState<ContractMetadata | null>(null);
  
  // State for the list of contracts
  const [contracts, setContracts] = useState<ContractMetadata[]>([]);
  
  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // State for error messages
  const [error, setError] = useState<string | null>(null);

  // State for result display
  const [resultData, setResultData] = useState<any | null>(null);

  // Simulated contract factory/repository
  const contractFactory: ContractFactory = {
    getPopularContracts: async () => {
      // Simulated delay to mimic network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return some popular or example contracts
      return [
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          name: 'Wrapped Ether (WETH)',
          standard: 'ERC20',
          isVerified: true,
          timestamp: Date.now(),
          tags: ['token', 'defi', 'popular']
        },
        {
          address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
          name: 'Bored Ape Yacht Club',
          standard: 'ERC721',
          isVerified: true,
          timestamp: Date.now(),
          tags: ['nft', 'collection']
        },
        {
          address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
          name: 'Uniswap V2: Router',
          isVerified: true,
          timestamp: Date.now(),
          tags: ['defi', 'dex', 'router']
        }
      ];
    },
    searchContractByAddress: async (address: string) => {
      // Simulated delay to mimic network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if it's one of our predefined contracts
      const predefinedContracts = await contractFactory.getPopularContracts();
      const existingContract = predefinedContracts.find(
        contract => contract.address.toLowerCase() === address.toLowerCase()
      );
      
      if (existingContract) {
        return existingContract;
      }
      
      // For other addresses, try to detect the contract type
      try {
        const contractInfo = await detectContractStandard(address);
        
        if (contractInfo.success) {
          if (!contractInfo.isContract) {
            return null; // Not a contract
          }
          
          // Create new contract metadata
          return {
            address: address,
            standard: contractInfo.standard,
            isVerified: false,
            timestamp: Date.now(),
            userAdded: true,
            tags: ['user-added']
          };
        }
        return null;
      } catch (error) {
        console.error("Error detecting contract:", error);
        return null;
      }
    }
  };

  // Load popular contracts on component mount
  useEffect(() => {
    const loadPopularContracts = async () => {
      setIsLoading(true);
      try {
        const popularContracts = await contractFactory.getPopularContracts();
        setContracts(popularContracts);
      } catch (err) {
        setError("Failed to load popular contracts");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPopularContracts();
  }, []);

  // Handler for searching a contract by address
  const handleSearchContract = async () => {
    if (!contractAddress) {
      setError("Please enter a contract address");
      return;
    }

    // Reset states
    setIsLoading(true);
    setError(null);
    setCurrentContract(null);
    setResultData(null);
    
    try {
      // Validate the address format
      await getProviderAndValidateAddress(contractAddress);
      
      // Search for the contract
      const contract = await contractFactory.searchContractByAddress(contractAddress);
      
      if (contract) {
        setCurrentContract(contract);
        
        // Check if this contract is already in our list
        const exists = contracts.some(c => c.address.toLowerCase() === contract.address.toLowerCase());
        
        if (!exists) {
          // Add to the list if it's new
          setContracts(prevContracts => [...prevContracts, contract]);
        }
      } else {
        setError(`No contract found at address ${contractAddress} or not a valid contract`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to interact with a contract
  const interactWithContract = async (contract: ContractMetadata) => {
    setIsLoading(true);
    setError(null);
    setResultData(null);
    
    try {
      // Set as current contract
      setCurrentContract(contract);
      setContractAddress(contract.address);
      
      // Get contract type/standard details
      const detectedInfo = await detectContractStandard(contract.address);
      
      if (detectedInfo.success) {
        setResultData({
          metadata: contract,
          detectedInfo
        });
      } else {
        setError("Failed to get contract details");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to interact with contract");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-xl font-bold">Contracts</div>
      
      {/* Contract Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Contract Lookup</h3>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="Enter contract address (0x...)"
            className="flex-grow p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
          />
          <button
            onClick={handleSearchContract}
            disabled={isLoading}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Searching..." : "Look Up Contract"}
          </button>
        </div>
        
        {error && (
          <div className="mt-3 text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>
      
      {/* Current Contract Details */}
      {currentContract && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Current Contract</h3>
          <div className="mb-2">
            <div><span className="font-medium">Address:</span> {currentContract.address}</div>
            {currentContract.name && <div><span className="font-medium">Name:</span> {currentContract.name}</div>}
            {currentContract.standard && <div><span className="font-medium">Standard:</span> {currentContract.standard}</div>}
            <div><span className="font-medium">Verified:</span> {currentContract.isVerified ? "Yes" : "No"}</div>
            {currentContract.tags && currentContract.tags.length > 0 && (
              <div className="mt-2">
                <span className="font-medium">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentContract.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Contract Interaction Buttons */}
          <div className="mt-4">
            <button
              onClick={() => interactWithContract(currentContract)}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mr-2"
            >
              Analyze Contract
            </button>
            <button
              onClick={() => window.open(`https://etherscan.io/address/${currentContract.address}`, '_blank')}
              className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
            >
              View on Etherscan
            </button>
          </div>
        </div>
      )}
      
      {/* Contract List */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Contract List</h3>
        {contracts.length === 0 ? (
          <div className="text-gray-500">No contracts saved yet</div>
        ) : (
          <div className="grid gap-3">
            {contracts.map((contract, idx) => (
              <div 
                key={idx}
                className="border p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => interactWithContract(contract)}
              >
                <div className="font-medium">{contract.name || "Unnamed Contract"}</div>
                <div className="text-sm text-gray-500 truncate">{contract.address}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {contract.standard && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                      {contract.standard}
                    </span>
                  )}
                  {contract.userAdded && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                      User Added
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Result Data Display */}
      {resultData && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Contract Analysis</h3>
          <pre className="whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto p-2 bg-gray-100 dark:bg-gray-900 rounded">
            {JSON.stringify(resultData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}