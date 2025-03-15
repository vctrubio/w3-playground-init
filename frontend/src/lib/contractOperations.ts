import { ethers } from 'ethers';
import { entry } from './eths';

// Contract function metadata interface
export interface ContractFunction {
  name: string;
  inputs: Array<{name: string; type: string}>;
  outputs: Array<{type: string}>;
  stateMutability: string;
}

/**
 * Initialize a contract instance from address and ABI
 */
export async function initializeContract(contractAddress: string, contractABI: string) {
  // Validate address
  if (!contractAddress) {
    throw new Error("Contract address is required");
  }
  
  if (!ethers.isAddress(contractAddress)) {
    throw new Error("Invalid contract address format");
  }
  
  if (!contractABI) {
    throw new Error("Contract ABI is required");
  }
  
  // Get signer
  const signer = await entry();
  
  // Parse ABI (handle both JSON and human-readable formats)
  let parsedABI: any;
  try {
    parsedABI = JSON.parse(contractABI);
  } catch {
    // Try to use as human-readable ABI
    parsedABI = contractABI.split('\n').filter(line => line.trim() !== '');
  }
  
  // Create and return contract instance
  return new ethers.Contract(contractAddress, parsedABI, signer);
}

/**
 * Parse contract interface to get available functions
 */
export function getContractFunctions(contract: ethers.Contract): ContractFunction[] {
  if (!contract) return [];
  
  const interface_ = contract.interface;
  const functions: ContractFunction[] = [];
  
  for (const fragment of interface_.fragments) {
    if (fragment.type === 'function') {
      functions.push({
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
  
  return functions;
}

/**
 * Execute a contract function with proper input parsing
 */
export async function executeContractFunction(
  contract: ethers.Contract, 
  functionName: string, 
  functionInputs: Record<string, string>
) {
  if (!contract) {
    throw new Error("Contract is not initialized");
  }
  
  if (!functionName) {
    throw new Error("Function name is required");
  }

  // Get function fragment
  const functionFragment = contract.interface.getFunction(functionName);
  if (!functionFragment) {
    throw new Error(`Function ${functionName} not found in contract`);
  }
  
  // Prepare params from inputs
  const params = functionFragment.inputs.map(input => {
    const value = functionInputs[input.name] || '';
    return parseInputParam(value, input.type);
  });
  
  // Execute function based on type (read or write)
  const isReadFunction = 
    functionFragment.stateMutability === 'view' || 
    functionFragment.stateMutability === 'pure';
  
  if (isReadFunction) {
    // Read-only call
    const result = await contract[functionName](...params);
    return formatContractResult(result);
  } else {
    // State-changing transaction
    const tx = await contract[functionName](...params);
    const receipt = await tx.wait();
    
    return {
      transactionHash: tx.hash,
      receipt: {
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? "Success" : "Failed",
        logs: receipt.logs.length
      }
    };
  }
}

/**
 * Parse input parameter based on type
 */
export function parseInputParam(value: string, type: string): any {
  // Empty value handling
  if (value === '') {
    if (type.includes('int')) return 0;
    if (type === 'bool') return false;
    if (type.includes('[]')) return [];
    if (type === 'address') return ethers.ZeroAddress;
    return '';
  }
  
  // Type-specific parsing
  if (type.includes('int')) {
    // For integers/big numbers
    return value;
  }
  
  if (type === 'bool') {
    return value.toLowerCase() === 'true';
  }
  
  // For arrays, try to parse JSON
  if (type.includes('[]')) {
    try {
      return JSON.parse(value);
    } catch (e) {
      throw new Error(`Invalid array format for ${type}: ${value}`);
    }
  }
  
  // Address validation
  if (type === 'address' && !ethers.isAddress(value)) {
    throw new Error(`Invalid address format: ${value}`);
  }
  
  // Default for string, address, bytes, etc.
  return value;
}

/**
 * Format contract call results for better readability
 */
export function formatContractResult(result: any): any {
  // For BigInt or BigNumber results
  if (typeof result === 'bigint' || result?._isBigNumber) {
    return {
      raw: result.toString(),
      formatted: ethers.formatUnits(result, 'ether'),
      hex: result.toHexString?.() || ethers.toBeHex(result)
    };
  }
  
  // For addresses
  if (typeof result === 'string' && ethers.isAddress(result)) {
    return {
      address: result,
      isZeroAddress: result === ethers.ZeroAddress
    };
  }
  
  // For arrays
  if (Array.isArray(result)) {
    return result.map(item => formatContractResult(item));
  }
  
  // For objects (e.g., structs)
  if (result && typeof result === 'object') {
    const formatted: Record<string, any> = {};
    for (const key in result) {
      if (Object.prototype.hasOwnProperty.call(result, key) && isNaN(Number(key))) {
        formatted[key] = formatContractResult(result[key]);
      }
    }
    if (Object.keys(formatted).length > 0) {
      return formatted;
    }
  }
  
  // Default: return as is
  return result;
}

/**
 * Get wallet connection details
 */
export async function getWalletDetails() {
  try {
    const signer = await entry();
    const address = await signer.getAddress();
    const provider = signer.provider;
    
    if (!provider) {
      throw new Error("Provider not available");
    }
    
    // Get network information
    const network = await provider.getNetwork();
    
    // Get balance
    const balance = await provider.getBalance(address);
    
    return {
      connected: true,
      signer,
      signerAddress: address,
      chainId: network.chainId.toString(),
      networkName: network.name,
      balance: `${ethers.formatEther(balance)} ETH`,
      balanceWei: balance.toString()
    };
  } catch (error) {
    console.error("Error getting wallet details:", error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * ABI templates for common contract types
 */
export const ABI_TEMPLATES = {
  ERC20: [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)'
  ],
  ERC721: [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function balanceOf(address owner) view returns (uint256)',
    'function ownerOf(uint256 tokenId) view returns (address)',
    'function tokenURI(uint256 tokenId) view returns (string)',
    'function approve(address to, uint256 tokenId)',
    'function getApproved(uint256 tokenId) view returns (address)',
    'function isApprovedForAll(address owner, address operator) view returns (bool)'
  ],
  ERC1155: [
    'function balanceOf(address account, uint256 id) view returns (uint256)',
    'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
    'function uri(uint256 id) view returns (string)',
    'function isApprovedForAll(address account, address operator) view returns (bool)',
    'function setApprovalForAll(address operator, bool approved)'
  ]
};

/**
 * Sample contracts for testing
 */
export const SAMPLE_CONTRACTS = {
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
    { name: "Rarible", address: "0xB66a603f4cFe17e3D27B87a8BfCaD319856518B8" }
  ]
};
