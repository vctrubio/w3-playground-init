import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  getWalletDetails,
  initializeContract,
  getContractFunctions,
  executeContractFunction,
  ABI_TEMPLATES,
  SAMPLE_CONTRACTS,
  ContractFunction
} from '../../lib/contractOperations';

// Unified state interface for cleaner state management
interface ContractState {
  // Connection states
  connected: boolean;
  signer: ethers.Signer | null;
  signerAddress: string;
  chainId: string;
  networkName: string;
  balance: string;
  
  // Contract states
  contractAddress: string;
  contractABI: string;
  contract: ethers.Contract | null;
  
  // UI states
  isLoading: boolean;
  error: string | null;
  resultData: any | null;
  
  // Function execution states
  selectedFunction: string | null;
  functionInputs: Record<string, string>;
}

export default function Contract(): JSX.Element {
  // Initialize with a single state object
  const [state, setState] = useState<ContractState>({
    // Connection states
    connected: false,
    signer: null,
    signerAddress: '',
    chainId: '',
    networkName: '',
    balance: '',
    
    // Contract states
    contractAddress: '',
    contractABI: '',
    contract: null,
    
    // UI states
    isLoading: false,
    error: null,
    resultData: null,
    
    // Function execution states
    selectedFunction: null,
    functionInputs: {}
  });
  
  // Helper to update specific state properties
  const updateState = (newState: Partial<ContractState>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };
  
  // Common pattern for setting loading/error states
  const withLoadingState = async (operation: () => Promise<void>) => {
    updateState({ isLoading: true, error: null });
    try {
      await operation();
    } catch (error) {
      updateState({ error: error instanceof Error ? error.message : "An unknown error occurred" });
      console.error(error);
    } finally {
      updateState({ isLoading: false });
    }
  };
  
  // Auto-connect wallet when component mounts
  useEffect(() => {
    const connectWallet = async () => {
      try {
        updateState({ isLoading: true, error: null });
        const walletDetails = await getWalletDetails();
        
        if (walletDetails.connected) {
          updateState({
            connected: true,
            signer: walletDetails.signer,
            signerAddress: walletDetails.signerAddress,
            chainId: walletDetails.chainId,
            networkName: walletDetails.networkName,
            balance: walletDetails.balance
          });
        } else {
          updateState({
            error: walletDetails.error || "Failed to connect wallet"
          });
        }
      } catch (error) {
        updateState({
          error: error instanceof Error ? error.message : "Failed to connect wallet"
        });
        console.error(error);
      } finally {
        updateState({ isLoading: false });
      }
    };
    
    connectWallet();
  }, []);
  
  // Set a template ABI
  const handleSelectAbiTemplate = (templateName: keyof typeof ABI_TEMPLATES) => {
    updateState({ 
      contractABI: JSON.stringify(ABI_TEMPLATES[templateName], null, 2) 
    });
  };
  
  // Set a sample contract address
  const handleSelectSampleContract = (address: string) => {
    updateState({ contractAddress: address });
  };
  
  // Initialize contract
  const handleInitializeContract = () => withLoadingState(async () => {
    const contract = await initializeContract(state.contractAddress, state.contractABI);
    updateState({ 
      contract,
      selectedFunction: null,
      functionInputs: {},
      resultData: null
    });
  });
  
  // Select a function to call
  const handleSelectFunction = (functionName: string) => {
    updateState({ 
      selectedFunction: functionName, 
      functionInputs: {}, 
      resultData: null 
    });
  };
  
  // Update a function input value
  const handleUpdateFunctionInput = (name: string, value: string) => {
    updateState({
      functionInputs: { ...state.functionInputs, [name]: value }
    });
  };
  
  // Execute the selected function
  const handleExecuteFunction = () => withLoadingState(async () => {
    if (!state.contract || !state.selectedFunction) return;
    
    const result = await executeContractFunction(
      state.contract,
      state.selectedFunction,
      state.functionInputs
    );
    
    updateState({ resultData: result });
  });
  
  // Get available functions from contract
  const contractFunctions = state.contract 
    ? getContractFunctions(state.contract) 
    : [];
  
  // Get info about selected function
  const selectedFunctionInfo = state.selectedFunction 
    ? contractFunctions.find(f => f.name === state.selectedFunction) 
    : null;

  return (
    <div className="p-4 space-y-6">
      <div className="text-xl font-bold">Smart Contract Interface</div>
      
      {/* Wallet Information */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Wallet Status</h3>
        {state.isLoading && !state.connected ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Connecting wallet...</span>
          </div>
        ) : state.connected ? (
          <div className="space-y-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Address:</span> 
                <div className="text-sm font-mono">{state.signerAddress}</div>
              </div>
              <div>
                <span className="font-medium">Balance:</span> 
                <div className="text-sm">{state.balance}</div>
              </div>
              <div>
                <span className="font-medium">Network:</span> 
                <div className="text-sm">{state.networkName}</div>
              </div>
              <div>
                <span className="font-medium">Chain ID:</span> 
                <div className="text-sm">{state.chainId}</div>
              </div>
            </div>
            <div className="text-xs text-green-500 mt-2">
              ✓ Wallet connected
            </div>
          </div>
        ) : (
          <div className="text-red-500">
            Failed to connect wallet. {state.error}
          </div>
        )}
      </div>
      
      {/* Contract Setup */}
      {state.connected && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Contract Setup</h3>
          
          <div className="space-y-4">
            {/* Contract Address */}
            <div>
              <label className="block text-sm mb-1">Contract Address</label>
              <input
                type="text"
                value={state.contractAddress}
                onChange={(e) => updateState({ contractAddress: e.target.value })}
                placeholder="0x..."
                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
              />
              
              {/* Sample contracts */}
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Sample Contracts:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(SAMPLE_CONTRACTS).map(([category, contracts]) => (
                    <div key={category} className="mb-2 mr-3">
                      <p className="text-xs font-medium mb-1">{category}:</p>
                      <div className="flex flex-wrap gap-1">
                        {contracts.map((contract, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectSampleContract(contract.address)}
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
            
            {/* ABI Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm">Contract ABI</label>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleSelectAbiTemplate('ERC20')}
                    className="text-xs bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 px-2 py-0.5 rounded"
                  >
                    ERC20
                  </button>
                  <button 
                    onClick={() => handleSelectAbiTemplate('ERC721')}
                    className="text-xs bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 px-2 py-0.5 rounded"
                  >
                    ERC721
                  </button>
                  <button 
                    onClick={() => handleSelectAbiTemplate('ERC1155')}
                    className="text-xs bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 px-2 py-0.5 rounded"
                  >
                    ERC1155
                  </button>
                </div>
              </div>
              <textarea
                value={state.contractABI}
                onChange={(e) => updateState({ contractABI: e.target.value })}
                placeholder="Enter contract ABI JSON or interface array..."
                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 h-32 font-mono text-sm"
              />
            </div>
            
            <button
              onClick={handleInitializeContract}
              disabled={state.isLoading || !state.contractAddress || !state.contractABI}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {state.isLoading ? "Initializing..." : "Initialize Contract"}
            </button>
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {state.error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded">
          <strong>Error:</strong> {state.error}
        </div>
      )}
      
      {/* Contract Functions */}
      {state.contract && contractFunctions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Contract Functions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {contractFunctions.map((func, idx) => (
              <div 
                key={idx}
                className={`border p-3 rounded cursor-pointer ${
                  state.selectedFunction === func.name 
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${
                  func.stateMutability === 'view' || func.stateMutability === 'pure'
                    ? 'border-l-4 border-l-green-500'
                    : 'border-l-4 border-l-orange-500'
                }`}
                onClick={() => handleSelectFunction(func.name)}
              >
                <div className="font-medium">{func.name}</div>
                <div className="text-xs text-gray-500">
                  {func.stateMutability === 'view' || func.stateMutability === 'pure' 
                    ? '📖 Read' 
                    : '✏️ Write'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Selected Function Execution */}
      {state.contract && selectedFunctionInfo && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-2">{selectedFunctionInfo.name}</h3>
          <div className="text-sm mb-3">
            <span className={
              selectedFunctionInfo.stateMutability === 'view' || selectedFunctionInfo.stateMutability === 'pure'
                ? 'text-green-500'
                : 'text-orange-500'
            }>
              {selectedFunctionInfo.stateMutability}
            </span>
          </div>
          
          {/* Function Parameters */}
          {selectedFunctionInfo.inputs.length > 0 && (
            <div className="mb-4 space-y-3">
              <h4 className="font-medium">Parameters:</h4>
              {selectedFunctionInfo.inputs.map((input, idx) => (
                <div key={idx} className="flex flex-col">
                  <label className="text-sm mb-1">
                    {input.name} <span className="text-gray-500 text-xs">({input.type})</span>
                  </label>
                  <input
                    type="text"
                    value={state.functionInputs[input.name] || ''}
                    onChange={(e) => handleUpdateFunctionInput(input.name, e.target.value)}
                    placeholder={`Enter ${input.type}`}
                    className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
              ))}
            </div>
          )}
          
          <button
            onClick={handleExecuteFunction}
            disabled={state.isLoading}
            className={`py-2 px-4 rounded text-white ${
              selectedFunctionInfo.stateMutability === 'view' || selectedFunctionInfo.stateMutability === 'pure'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-orange-500 hover:bg-orange-600'
            } disabled:opacity-50`}
          >
            {state.isLoading 
              ? "Executing..." 
              : `Execute ${selectedFunctionInfo.name}`
            }
          </button>
        </div>
      )}
      
      {/* Result Display */}
      {state.resultData !== null && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Result</h3>
          <pre className="whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto p-2 bg-gray-100 dark:bg-gray-900 rounded">
            {JSON.stringify(state.resultData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
