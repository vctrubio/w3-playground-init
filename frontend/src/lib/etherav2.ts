import { ethers } from 'ethers';

// Common ABIs for different token standards
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 value) returns (bool)',
  'function approve(address spender, uint256 value) returns (bool)',
  'function transferFrom(address from, address to, uint256 value) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

const ERC721_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)'
];

const ERC1155_ABI = [
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
  'function uri(uint256 id) view returns (string)',
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  'function setApprovalForAll(address operator, bool approved)',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
  'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)'
];

/**
 * Connects to a provider and validates an address
 */
async function getProviderAndValidateAddress(address: string) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  
  // Validate the address format
  if (!ethers.isAddress(address)) {
    throw new Error('Invalid address format');
  }
  
  return provider;
}

// ERC20 Functions

/**
 * Get detailed information about an ERC20 token
 */
export async function getERC20TokenInfo(tokenAddress: string) {
  try {
    const provider = await getProviderAndValidateAddress(tokenAddress);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    // Get token metadata
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      tokenContract.name().catch(() => 'Unknown'),
      tokenContract.symbol().catch(() => 'UNK'),
      tokenContract.decimals().catch(() => 18),
      tokenContract.totalSupply().catch(() => 0)
    ]);
    
    // Get the connected user's address
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    // Get the user's token balance
    const balance = await tokenContract.balanceOf(userAddress).catch(() => 0);
    
    return {
      success: true,
      tokenAddress,
      metadata: {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: {
          raw: totalSupply.toString(),
          formatted: ethers.formatUnits(totalSupply, decimals)
        }
      },
      userInfo: {
        address: userAddress,
        balance: {
          raw: balance.toString(),
          formatted: ethers.formatUnits(balance, decimals)
        }
      }
    };
  } catch (error) {
    console.error('Error in getERC20TokenInfo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Get token balance for any address
 */
export async function getERC20BalanceForAddress(tokenAddress: string, holderAddress: string) {
  try {
    const provider = await getProviderAndValidateAddress(tokenAddress);
    
    // Validate holder address
    if (!ethers.isAddress(holderAddress)) {
      return { success: false, error: 'Invalid holder address format' };
    }
    
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    // Get token decimals for formatting
    const decimals = await tokenContract.decimals().catch(() => 18);
    
    // Get balance for the provided address
    const balance = await tokenContract.balanceOf(holderAddress);
    
    return {
      success: true,
      tokenAddress,
      holderAddress,
      balance: {
        raw: balance.toString(),
        formatted: ethers.formatUnits(balance, decimals)
      }
    };
  } catch (error) {
    console.error('Error in getERC20BalanceForAddress:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Check allowance of spender for a token
 */
export async function checkERC20Allowance(tokenAddress: string, spenderAddress: string) {
  try {
    const provider = await getProviderAndValidateAddress(tokenAddress);
    
    // Validate spender address
    if (!ethers.isAddress(spenderAddress)) {
      return { success: false, error: 'Invalid spender address format' };
    }
    
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const decimals = await tokenContract.decimals().catch(() => 18);
    
    // Get the connected user's address
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    // Check allowance
    const allowance = await tokenContract.allowance(userAddress, spenderAddress);
    
    return {
      success: true,
      tokenAddress,
      owner: userAddress,
      spender: spenderAddress,
      allowance: {
        raw: allowance.toString(),
        formatted: ethers.formatUnits(allowance, decimals)
      }
    };
  } catch (error) {
    console.error('Error in checkERC20Allowance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Prepare an ERC20 transfer transaction (without sending)
 */
export async function prepareERC20Transfer(tokenAddress: string, recipientAddress: string, amount: string) {
  try {
    const provider = await getProviderAndValidateAddress(tokenAddress);
    
    // Validate recipient address
    if (!ethers.isAddress(recipientAddress)) {
      return { success: false, error: 'Invalid recipient address format' };
    }
    
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const decimals = await tokenContract.decimals().catch(() => 18);
    
    // Parse the amount according to token decimals
    const parsedAmount = ethers.parseUnits(amount, decimals);
    
    // Get the connected user's address
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    // Get user balance
    const balance = await tokenContract.balanceOf(userAddress);
    
    // Check if user has enough tokens
    const hasEnoughTokens = balance >= parsedAmount;
    
    // Encode the function call data
    const transferData = tokenContract.interface.encodeFunctionData('transfer', [recipientAddress, parsedAmount]);
    
    // Estimate gas (this throws if the transaction would fail)
    let gasEstimate;
    try {
      gasEstimate = await provider.estimateGas({
        from: userAddress,
        to: tokenAddress,
        data: transferData
      });
    } catch (error) {
      return {
        success: false,
        error: "Transaction would fail. Likely insufficient balance.",
        details: error instanceof Error ? error.message : String(error)
      };
    }
    
    return {
      success: true,
      type: 'ERC20 Transfer',
      tokenAddress,
      from: userAddress,
      to: recipientAddress,
      amount: {
        raw: parsedAmount.toString(),
        formatted: amount
      },
      balance: {
        raw: balance.toString(),
        formatted: ethers.formatUnits(balance, decimals)
      },
      hasEnoughTokens,
      transactionData: {
        to: tokenAddress,
        from: userAddress,
        data: transferData,
        gasEstimate: gasEstimate.toString()
      }
    };
  } catch (error) {
    console.error('Error in prepareERC20Transfer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// ERC721 Functions

/**
 * Get information about an NFT collection
 */
export async function getNFTCollectionInfo(contractAddress: string) {
  try {
    const provider = await getProviderAndValidateAddress(contractAddress);
    const nftContract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
    
    // Try to get collection metadata - some might not implement all methods
    const [name, symbol] = await Promise.all([
      nftContract.name().catch(() => 'Unknown Collection'),
      nftContract.symbol().catch(() => 'NFT')
    ]);
    
    // Get the connected user's address and their NFT count
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    const balance = await nftContract.balanceOf(userAddress).catch(() => 0);
    
    return {
      success: true,
      contractAddress,
      collectionInfo: {
        name,
        symbol
      },
      userInfo: {
        address: userAddress,
        balance: Number(balance)
      }
    };
  } catch (error) {
    console.error('Error in getNFTCollectionInfo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Get details about a specific NFT by its ID
 */
export async function getNFTDetails(contractAddress: string, tokenId: string) {
  try {
    const provider = await getProviderAndValidateAddress(contractAddress);
    const nftContract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
    
    // Get token details
    const [owner, tokenURI, approved] = await Promise.all([
      nftContract.ownerOf(tokenId).catch(() => null),
      nftContract.tokenURI(tokenId).catch(() => null),
      nftContract.getApproved(tokenId).catch(() => null)
    ]);
    
    // If we couldn't get the owner, the token may not exist
    if (!owner) {
      return {
        success: false,
        error: `NFT with ID ${tokenId} may not exist or an error occurred while fetching data`
      };
    }
    
    // Get the connected user's address
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    // Check if user is the owner
    const isOwner = owner.toLowerCase() === userAddress.toLowerCase();
    
    return {
      success: true,
      contractAddress,
      tokenId,
      tokenInfo: {
        owner,
        tokenURI,
        approved: approved || 'None' 
      },
      userInfo: {
        address: userAddress,
        isOwner
      }
    };
  } catch (error) {
    console.error('Error in getNFTDetails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Get all NFTs owned by an address (with limitations)
 */
export async function getNFTsOwnedByAddress(contractAddress: string, ownerAddress: string, maxToCheck = 20) {
  try {
    const provider = await getProviderAndValidateAddress(contractAddress);
    
    // Validate owner address
    if (!ethers.isAddress(ownerAddress)) {
      return { success: false, error: 'Invalid owner address format' };
    }
    
    const nftContract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
    
    // Get owner's balance (total NFT count)
    const balance = await nftContract.balanceOf(ownerAddress).catch(() => 0);
    
    if (balance === 0) {
      return {
        success: true,
        contractAddress,
        ownerAddress,
        balance: 0,
        tokens: [],
        note: 'No NFTs owned by this address'
      };
    }
    
    // NOTE: There's no standard way to get all token IDs owned by an address in ERC721
    // This is a limitation of the standard. We would need to:
    // 1. Either know the full range of token IDs and check each one
    // 2. Or scan transfer events from the blockchain
    
    // For demonstration, we'll just return the balance and a note about this limitation
    return {
      success: true,
      contractAddress,
      ownerAddress,
      balance: Number(balance),
      tokens: [],
      note: `This address owns ${balance.toString()} NFTs, but ERC721 doesn't provide a standard method to list them all. You would need contract-specific methods or event logs to enumerate them.`
    };
  } catch (error) {
    console.error('Error in getNFTsOwnedByAddress:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// ERC1155 Functions

/**
 * Get balances for multiple tokens in an ERC1155 contract
 */
export async function getERC1155Balances(contractAddress: string, tokenIds: string[]) {
  try {
    const provider = await getProviderAndValidateAddress(contractAddress);
    const erc1155Contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);
    
    // Convert token IDs to BigInts if needed
    const parsedTokenIds = tokenIds.map(id => BigInt(id));
    
    // Get the connected user's address
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    // Get balances for each token ID for the user
    const balances = [];
    for (const id of parsedTokenIds) {
      try {
        const balance = await erc1155Contract.balanceOf(userAddress, id);
        balances.push({
          tokenId: id.toString(),
          balance: balance.toString()
        });
      } catch (err) {
        balances.push({
          tokenId: id.toString(),
          error: "Failed to get balance"
        });
      }
    }
    
    // Try to get URIs for each token
    const uris = [];
    for (const id of parsedTokenIds) {
      try {
        const uri = await erc1155Contract.uri(id);
        uris.push({
          tokenId: id.toString(),
          uri
        });
      } catch (err) {
        uris.push({
          tokenId: id.toString(),
          uri: null,
          error: "Failed to get URI"
        });
      }
    }
    
    return {
      success: true,
      contractAddress,
      userAddress,
      balances,
      uris
    };
  } catch (error) {
    console.error('Error in getERC1155Balances:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Check if an operator is approved for all tokens
 */
export async function checkERC1155OperatorApproval(contractAddress: string, operatorAddress: string) {
  try {
    const provider = await getProviderAndValidateAddress(contractAddress);
    
    // Validate operator address
    if (!ethers.isAddress(operatorAddress)) {
      return { success: false, error: 'Invalid operator address format' };
    }
    
    const erc1155Contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);
    
    // Get the connected user's address
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    // Check if the operator is approved
    const isApproved = await erc1155Contract.isApprovedForAll(userAddress, operatorAddress);
    
    return {
      success: true,
      contractAddress,
      userAddress,
      operatorAddress,
      isApproved
    };
  } catch (error) {
    console.error('Error in checkERC1155OperatorApproval:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// General utilities

/**
 * Detect what token standard a contract implements (ERC20, ERC721, ERC1155, or unknown)
 */
export async function detectContractStandard(contractAddress: string) {
  try {
    const provider = await getProviderAndValidateAddress(contractAddress);
    
    // First check if it's a contract at all
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      return {
        success: true,
        contractAddress,
        isContract: false,
        standard: 'not a contract',
        details: 'This address does not contain contract code'
      };
    }
    
    // Create contract instances with different interfaces
    const erc20Contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
    const erc721Contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
    const erc1155Contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);
    
    // Test for ERC20
    let isERC20 = false;
    try {
      await Promise.all([
        erc20Contract.balanceOf(ethers.ZeroAddress),
        erc20Contract.totalSupply()
      ]);
      isERC20 = true;
    } catch (e) {
      isERC20 = false;
    }
    
    // Test for ERC721
    let isERC721 = false;
    try {
      // This alone isn't definitive but helps check
      const supportsERC721 = await erc721Contract.balanceOf(ethers.ZeroAddress).catch(() => null);
      isERC721 = supportsERC721 !== null;
    } catch (e) {
      isERC721 = false;
    }
    
    // Test for ERC1155
    let isERC1155 = false;
    try {
      await erc1155Contract.balanceOf(ethers.ZeroAddress, 1);
      isERC1155 = true;
    } catch (e) {
      isERC1155 = false;
    }
    
    // Determine the most likely standard
    let standard = 'unknown';
    let details = 'Could not determine contract standard';
    
    if (isERC20 && !isERC721 && !isERC1155) {
      standard = 'ERC20';
      details = 'Token contract appears to implement ERC20 standard';
    } else if (!isERC20 && isERC721 && !isERC1155) {
      standard = 'ERC721';
      details = 'NFT contract appears to implement ERC721 standard';
    } else if (!isERC20 && !isERC721 && isERC1155) {
      standard = 'ERC1155';
      details = 'Multi-token contract appears to implement ERC1155 standard';
    } else if (isERC20 || isERC721 || isERC1155) {
      standard = 'multiple';
      details = 'Contract appears to implement multiple token standards';
    }
    
    return {
      success: true,
      contractAddress,
      isContract: true,
      standard,
      details,
      supports: {
        ERC20: isERC20,
        ERC721: isERC721,
        ERC1155: isERC1155
      }
    };
  } catch (error) {
    console.error('Error in detectContractStandard:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
