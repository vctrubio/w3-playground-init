import { useState } from 'react';
import { entry } from '../../lib/eths';
import { ethers } from 'ethers';

// Default ABIs for common contract types
const DEFAULT_ABIS = {
  ERC20: [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)'
  ],
  ERC721: [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function balanceOf(address owner) view returns (uint256)',
    'function ownerOf(uint256 tokenId) view returns (address)',
    'function tokenURI(uint256 tokenId) view returns (string)'
  ],
  ERC1155: [
    'function balanceOf(address account, uint256 id) view returns (uint256)',
    'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
    'function uri(uint256 id) view returns (string)',
    'function isApprovedForAll(address account, address operator) view returns (bool)',
    'function setApprovalForAll(address operator, bool approved)',
    'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
    'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)'
  ]
};

// Sample contract addresses for testing
const TEST_CONTRACTS = {
  ERC20: [
    { name: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
    { name: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
    { name: "DAI", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" }
  ],
  ERC721: [
    { name: "BAYC", address: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D" },
    { name: "CryptoPunks", address: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB" },
    { name: "Azuki", address: "0xED5AF388653567Af2F388E6224dC7C4b3241C544" }
  ],
  ERC1155: [
    { name: "OpenSea Shared", address: "0x495f947276749Ce646f68AC8c248420045cb7b5e" },
    { name: "Rarible", address: "0xB66a603f4cFe17e3D27B87a8BfCaD319856518B8" },
    { name: "ENS Name Wrapper", address: "0x114D4603199df73e7D157787f8778E21fCd13066" }
  ]
};

// Interface for contract function metadata
interface ContractFunction {
  name: string;
  inputs: Array<{name: string; type: string}>;
  outputs: Array<{type: string}>;
  stateMutability: string;
}

export default function Contract(): JSX.Element {
  // Connection states
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [signerAddress, setSignerAddress] = useState<string>('');

  // Contract states
  const [contractAddress, setContractAddress] = useState<string>('');
  const [contractABI, setContractABI] = useState<string>('');
  const [abiType, setAbiType] = useState<'custom' | 'ERC20' | 'ERC721' | 'ERC1155'>('custom');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [contractFunctions, setContractFunctions] = useState<ContractFunction[]>([]);
  
  // Function execution states
  const [selectedFunction, setSelectedFunction] = useState<ContractFunction | null>(null);
  const [functionParams, setFunctionParams] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any | null>(null);

  // Connect wallet and initialize provider/signer
  const connectWallet = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const signerObj = await entry();
      const providerObj = signerObj.provider;
      if (!providerObj) throw new Error("No provider available");
      
      setProvider(providerObj);
      setSigner(signerObj);
      setSignerAddress(await signerObj.getAddress());
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  // Load the contract ABI based on selected type
  const handleAbiTypeChange = (type: 'custom' | 'ERC20' | 'ERC721' | 'ERC1155') => {
    setAbiType(type);
    if (type !== 'custom') {
      setContractABI(JSON.stringify(DEFAULT_ABIS[type]));
    } else {
      setContractABI('');
    }
  };

  // Set a test contract address
  const setTestContractAddress = (address: string) => {
    setContractAddress(address);
  };

  // Initialize contract and parse its functions
  const initializeContract = () => {
    setError(null);
    setContract(null);
    setContractFunctions([]);
    setSelectedFunction(null);
    setResultData(null);
    
    if (!contractAddress) {
      setError("Contract address is required");
      return;
    }
    
    if (!ethers.isAddress(contractAddress)) {
      setError("Invalid contract address format");
      return;
    }
    
    if (!contractABI) {
      setError("Contract ABI is required");
      return;
    }
    
    try {
      let abiArray;
      try {
        abiArray = JSON.parse(contractABI);
      } catch (e) {
        // If not valid JSON, try treating it as human-readable ABI format
        abiArray = contractABI.split('\n').filter(line => line.trim() !== '');
      }
      
      // Create contract instance
      const contractInstance = new ethers.Contract(
        contractAddress,
        abiArray,
        signer || provider
      );
      
      setContract(contractInstance);
      
      // Parse functions from ABI
      const parsedFunctions: ContractFunction[] = [];
      const interface_ = contractInstance.interface;
      
      for (const fragment of interface_.fragments) {
        if (fragment.type === "function") {
          parsedFunctions.push({
            name: fragment.name,
            inputs: fragment.inputs.map((input: any) => ({
              name: input.name,
              type: input.type
            })),
            outputs: fragment.outputs?.map((output: any) => ({
              type: output.type
            })) || [],
            stateMutability: fragment.stateMutability
          });
        }
      }
      
      setContractFunctions(parsedFunctions);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to initialize contract");
    }
  };

  // Select a function and reset parameters
  const handleSelectFunction = (func: ContractFunction) => {
    setSelectedFunction(func);
    setFunctionParams({});
    setResultData(null);
  };

  // Update function parameter
  const handleParamChange = (paramName: string, value: string) => {
    setFunctionParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  // Execute selected contract function
  const executeFunction = async () => {
    if (!contract || !selectedFunction) return;
    
    setIsLoading(true);
    setError(null);
    setResultData(null);
    
    try {
      const functionName = selectedFunction.name;
      
      // Convert parameters to the right format
      const params = selectedFunction.inputs.map(input => {
        const value = functionParams[input.name] || '';
        
        // Parse values based on type
        if (input.type.includes('int')) {
          // For integers/big numbers
          return value === '' ? 0 : value;
        }
        if (input.type === 'bool') {
          return value.toLowerCase() === 'true';
        }
        // For arrays, try to parse JSON
        if (input.type.includes('[]')) {
          try {
            return JSON.parse(value);
          } catch (e) {
            return [];
          }
        }
        // Default for address, string, etc.
        return value;
      });
      
      // Get the function from contract
      const contractFunction = contract[functionName];
      
      if (!contractFunction) {
        throw new Error(`Function ${functionName} not found in contract`);
      }
      
      // Call or send based on state mutability
      const isView = 
        selectedFunction.stateMutability === 'view' || 
        selectedFunction.stateMutability === 'pure';
      
      let result;
      if (isView) {
        // Read-only call
        result = await contractFunction(...params);
      } else {
        // State-changing transaction
        if (!signer) {
          throw new Error("Signer required for non-view functions");
        }
        
        // First estimate gas
        const gasEstimate = await contract.connect(signer).estimateGas[functionName](...params);
        
        // Execute transaction
        const tx = await contractFunction(...params);
        result = {
          hash: tx.hash,
          gasLimit: gasEstimate.toString(),
          wait: "Transaction sent. Waiting for confirmation...",
        };
        
        // Wait for confirmation and update result
        const receipt = await tx.wait();
        result.receipt = {
          status: receipt.status === 1 ? "Success" : "Failed",
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
        };
      }
      
      // Format result based on return type
      let formattedResult = result;
      
      // Handle common return types for better display
      if (ethers.isAddress(result)) {
        formattedResult = {
          address: result,
          formatted: result
        };
      } else if (result?._isBigNumber || typeof result === 'bigint') {
        // BigNumber result
        formattedResult = {
          raw: result.toString(),
          formatted: ethers.formatUnits(result, 'ether'),
          wei: result.toString()
        };
      } else if (Array.isArray(result)) {
        // Format array items if they're big numbers
        formattedResult = result.map(item => 
          item?._isBigNumber || typeof item === 'bigint' 
            ? { raw: item.toString(), formatted: ethers.formatUnits(item, 'ether') }
            : item
        );
      }
      
      setResultData(formattedResult);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Function execution failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-xl font-bold">Smart Contract Interface</div>
      
      {/* Wallet Connection */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Wallet Connection</h3>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </button>
          
          {signerAddress && (
            <span className="text-sm">
              Connected: {signerAddress.substring(0, 6)}...{signerAddress.substring(38)}
            </span>
          )}
        </div>
      </div>
      
      {/* Contract Setup */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Contract Setup</h3>
        
        <div className="space-y-4">
          {/* Contract Address */}
          <div>
            <label className="block text-sm mb-1">Contract Address</label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
            />
            
            {/* Test Contract Addresses */}
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">Test Contracts:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(TEST_CONTRACTS).map(([standard, contracts]) => (
                  <div key={standard} className="mb-2">
                    <p className="text-xs font-medium mb-1">{standard}:</p>
                    <div className="flex flex-wrap gap-1">
                      {contracts.map((contract, idx) => (
                        <button
                          key={idx}
                          onClick={() => setTestContractAddress(contract.address)}
                          className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded"
                          title={contract.address}
                        >
                          {contract.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* ABI Type Selection */}
          <div>
            <label className="block text-sm mb-1">ABI Type</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAbiTypeChange('custom')}
                className={`py-1 px-3 rounded ${abiType === 'custom' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}
              >
                Custom ABI
              </button>
              <button
                onClick={() => handleAbiTypeChange('ERC20')}
                className={`py-1 px-3 rounded ${abiType === 'ERC20' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}
              >
                ERC20
              </button>
              <button
                onClick={() => handleAbiTypeChange('ERC721')}
                className={`py-1 px-3 rounded ${abiType === 'ERC721' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}
              >
                ERC721
              </button>
              <button
                onClick={() => handleAbiTypeChange('ERC1155')}
                className={`py-1 px-3 rounded ${abiType === 'ERC1155' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}
              >
                ERC1155
              </button>
            </div>
          </div>
          
          {/* ABI Input */}
          <div>
            <label className="block text-sm mb-1">Contract ABI</label>
            <textarea
              value={contractABI}
              onChange={(e) => setContractABI(e.target.value)}
              placeholder="Enter contract ABI JSON or interface array..."
              className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 h-32 font-mono text-sm"
            />
          </div>
          
          <button
            onClick={initializeContract}
            disabled={isLoading || !contractAddress || !contractABI}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Initialize Contract
          </button>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {/* Contract Functions */}
      {contract && contractFunctions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Contract Functions</h3>
          
          {/* Function Type Filters */}
          <div className="mb-4">
            <span className="text-sm mr-2">Filter:</span>
            <button className="mr-2 py-1 px-2 bg-blue-100 dark:bg-blue-900 rounded text-sm">All</button>
            <button className="mr-2 py-1 px-2 bg-green-100 dark:bg-green-900 rounded text-sm">View/Pure</button>
            <button className="py-1 px-2 bg-orange-100 dark:bg-orange-900 rounded text-sm">State Changing</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
            {contractFunctions.map((func, idx) => (
              <div 
                key={idx}
                className={`border p-3 rounded cursor-pointer ${
                  selectedFunction?.name === func.name 
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${
                  func.stateMutability === 'view' || func.stateMutability === 'pure'
                    ? 'border-l-4 border-l-green-500'
                    : 'border-l-4 border-l-orange-500'
                }`}
                onClick={() => handleSelectFunction(func)}
              >
                <div className="font-medium">{func.name}</div>
                <div className="text-xs text-gray-500">
                  {func.stateMutability === 'view' || func.stateMutability === 'pure' 
                    ? '📖 Read' 
                    : '✏️ Write'}
                </div>
                {func.inputs.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Inputs: {func.inputs.map(i => `${i.name}:${i.type}`).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Selected Function Execution */}
      {selectedFunction && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-2">{selectedFunction.name}</h3>
          <div className="text-sm mb-3">
            <span className={
              selectedFunction.stateMutability === 'view' || selectedFunction.stateMutability === 'pure'
                ? 'text-green-500'
                : 'text-orange-500'
            }>
              {selectedFunction.stateMutability}
            </span>
            {selectedFunction.stateMutability !== 'view' && selectedFunction.stateMutability !== 'pure' && (
              <span className="ml-2 text-gray-500">(Requires transaction)</span>
            )}
          </div>
          
          {/* Function Parameters */}
          {selectedFunction.inputs.length > 0 && (
            <div className="mb-4 space-y-3">
              <h4 className="font-medium">Parameters:</h4>
              {selectedFunction.inputs.map((input, idx) => (
                <div key={idx} className="flex flex-col">
                  <label className="text-sm mb-1">
                    {input.name} <span className="text-gray-500 text-xs">({input.type})</span>
                  </label>
                  <input
                    type="text"
                    value={functionParams[input.name] || ''}
                    onChange={(e) => handleParamChange(input.name, e.target.value)}
                    placeholder={`Enter ${input.type}`}
                    className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
              ))}
            </div>
          )}
          
          <button
            onClick={executeFunction}
            disabled={isLoading || !contract}
            className={`py-2 px-4 rounded text-white ${
              selectedFunction.stateMutability === 'view' || selectedFunction.stateMutability === 'pure'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-orange-500 hover:bg-orange-600'
            } disabled:opacity-50`}
          >
            {isLoading 
              ? "Executing..." 
              : (selectedFunction.stateMutability === 'view' || selectedFunction.stateMutability === 'pure') 
                ? `Call ${selectedFunction.name}` 
                : `Send Transaction`
            }
          </button>
        </div>
      )}
      
      {/* Result Display */}
      {resultData !== null && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Result</h3>
          <pre className="whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto p-2 bg-gray-100 dark:bg-gray-900 rounded">
            {JSON.stringify(resultData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}