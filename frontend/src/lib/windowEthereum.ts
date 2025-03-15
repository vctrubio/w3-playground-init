import { ethers } from "ethers";
import { BalanceInfo, Transaction } from "./types";

export function entry(): Record<string, any> {
  console.log("call me anytime");
  const e: Record<string, any> = {}; // Start with an empty object
  const { ethereum } = window;

  if (typeof window.ethereum === "undefined") {
    return {
      status: 444,
      msg: "get out of here",
    };
  }

  if (ethereum) {
    e.windowEthereum = true;
    e.windowIsMetaMask = ethereum.isMetaMask;
    e.windowIsConnected = ethereum.isConnected();
    e.windowSelectedA = ethereum.selectedAddress; // Selected address (null if not connected)
    e.windowChainId = ethereum.chainId;
  } else {
    e.windowEthereum = false;
  }
  return e;
}

//REQUEST GO HERE//
export async function getAccounti() {
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  return accounts;
}

export async function connectWallet() {
  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts;
  } catch (error) {
    console.error("User denied account access:", error);
    throw error; // Make sure we're throwing the error for proper handling
  }
}

/**
 * Get the balance of an Ethereum address
 * @param address The Ethereum address to check
 * @returns A promise resolving to a BalanceInfo object
 */
export async function getBalance(address: string): Promise<BalanceInfo> {
  try {
    const balanceHex = await window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"]
    });
    
    // Convert hex string to decimal string to preserve precision
    const balanceWei = ethers.formatUnits(balanceHex, 0);
    
    // Format as ETH with appropriate decimals
    const ethValue = ethers.formatEther(balanceHex);
    const numericValue = parseFloat(ethValue);
    
    // Format for display with appropriate decimal places
    let formattedValue: string;
    if (numericValue < 0.0001 && numericValue > 0) {
      formattedValue = "< 0.0001"; // For very small values
    } else {
      formattedValue = numericValue.toFixed(4); // 4 decimal places for regular values
    }
    
    return {
      wei: balanceWei,
      formatted: formattedValue,
      value: numericValue
    };
  } catch (error) {
    console.error("Error getting balance:", error);
    throw error;
  }
}

/**
 * Get the native currency symbol for the current network
 * @param chainId The chain ID to get the symbol for
 * @returns A string representing the native currency symbol
 */
export function getCurrencySymbol(chainId: string | null): string {
  if (!chainId) return "ETH";
  
  // Map of common network IDs to their currency symbols
  const currencyMap: Record<string, string> = {
    "0x1": "ETH",      // Ethereum Mainnet
    "0x3": "tETH",     // Ropsten Testnet
    "0x4": "tETH",     // Rinkeby Testnet
    "0x5": "tETH",     // Goerli Testnet
    "0xaa36a7": "SEP", // Sepolia Testnet
    "0x89": "MATIC",   // Polygon Mainnet
    "0x13881": "MATIC" // Mumbai Testnet
  };
  
  return currencyMap[chainId] || "ETH"; // Default to ETH
}

/*
Description: Retrieves the chain ID of the currently connected network.
Returns: A promise resolving to a hexadecimal string (e.g., "0x1" for Mainnet).
What You Can Do: Verify or display the current network.
*/
export async function getChainId() {
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  return chainId;
}

/*
Description: Submits a transaction to the blockchain, prompting the user to sign it.
Parameters: An object with properties like from, to, value, data, etc.
Returns: A promise resolving to the transaction hash.
What You Can Do: Send Ether or interact with smart contracts.
*/
async function sendTransaction() {
  const tx = {
    from: window.ethereum.selectedAddress,
    to: "0xRecipientAddress",
    value: "0x16345785d8a0000", // 0.1 ETH in wei (hex)
  };
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [tx],
    });
    console.log("Transaction hash:", txHash);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
}

/*
Description: Adds a new network to the user’s wallet for future use.
Parameters: An object with chainId, chainName, rpcUrls, nativeCurrency, etc.
Returns: A promise that resolves if the network is added.
What You Can Do: Add custom networks (e.g., testnets or sidechains) to the wallet.
*/
async function addCustomNetwork() {
  const chainConfig = {
    chainId: "0x13881", // Polygon Mumbai Testnet
    chainName: "Polygon Mumbai",
    rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  };
  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [chainConfig],
    });
    console.log("Mumbai Testnet added!");
  } catch (error) {
    console.error("Failed to add network:", error);
  }
}

/*
Description: Requests the wallet to switch to a different Ethereum-compatible network.
Parameters: An object with chainId (e.g., "0x89" for Polygon).
Returns: A promise that resolves if successful or rejects if the chain isn’t supported.
What You Can Do: Switch the user’s wallet to a network your dApp requires.
*/
async function switchToPolygon() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x89" }], // Polygon Mainnet
    });
    console.log("Switched to Polygon!");
  } catch (error) {
    console.error("Failed to switch network:", error);
  }
}

/*
Description: Prompts the user to sign a message with their private key.
Parameters: The message (string or hex) and the signing address.
Returns: A promise resolving to the signature.
What You Can Do: Verify ownership of an address or authenticate users.
*/
async function signMessage() {
  const message = "Hello, Ethereum!";
  try {
    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [message, window.ethereum.selectedAddress],
    });
    console.log("Signature:", signature);
  } catch (error) {
    console.error("Signing failed:", error);
  }
}

/*
Description: Executes a read-only call to a smart contract without sending a transaction.
Parameters: An object with to, data, etc., and an optional block number (e.g., "latest").
Returns: A promise resolving to the call result.
What You Can Do: Query contract state (e.g., balanceOf in an ERC-20 token
*/
async function callContract() {
  const call = {
    to: "0xContractAddress",
    data: "0x70a08231...", // Encoded function call (e.g., balanceOf)
  };
  try {
    const result = await window.ethereum.request({
      method: "eth_call",
      params: [call, "latest"],
    });
    console.log("Call result:", result);
  } catch (error) {
    console.error("Call failed:", error);
  }
}

//Event Listeners
/*
window.ethereum is an EventEmitter
(following Node.js conventions), allowing you to listen for events emitted by the wallet.

window.ethereum.on("accountsChanged", (accounts) => {});
--on("accountsChanged", handler)
--on("chainChanged", handler)
--on("connect", handler)
--on("disconnect", handler)

removeListener(eventName, handler) : Description: Removes a specific event listener.
*/

/**
 * Get the current block number
 * @returns A promise resolving to the current block number
 */
export async function getBlockNumber(): Promise<number> {
  try {
    const blockNumberHex = await window.ethereum.request({
      method: "eth_blockNumber",
      params: []
    });
    
    // Convert hex string to number
    return parseInt(blockNumberHex, 16);
  } catch (error) {
    console.error("Error getting block number:", error);
    throw error;
  }
}

/**
 * Get a block by number, including the hash
 * @param blockNumber The block number to retrieve, or "latest"
 * @returns A promise resolving to the block information
 */
export async function getBlockByNumber(blockNumber: number | "latest" = "latest"): Promise<any> {
  try {
    const blockNumberParam = blockNumber === "latest" ? "latest" : `0x${blockNumber.toString(16)}`;
    
    const block = await window.ethereum.request({
      method: "eth_getBlockByNumber",
      params: [blockNumberParam, false]
    });
    
    return block;
  } catch (error) {
    console.error("Error getting block:", error);
    throw error;
  }
}

/**
 * Represents a transaction in the transaction history ------ 4Later
 */

/**
 * Get recent transactions for an address
 * Note: This is a simplified version that uses a public API for Ethereum Mainnet
 * For other networks, you'd need to adjust the API endpoint or use a different approach
 * @param address The address to get transactions for
 * @param limit Maximum number of transactions to return
 * @returns A promise resolving to an array of transactions
 */
export async function getTransactionHistory(
  address: string, 
  limit: number = 5
): Promise<Transaction[]> {
  try {
    // For a production app, you would want to use a more robust service like Etherscan API,
    // The Graph, or your own node. This is a simplified implementation.
    // Here we're using eth_getBlockByNumber to get recent blocks and filter for transactions
    // involving the user's address
    
    const currentBlock = await getBlockNumber();
    const transactions: Transaction[] = [];
    const maxBlocks = 10; // Limit how many blocks we look back
    
    for (let i = 0; i < maxBlocks && transactions.length < limit; i++) {
      const block = await getBlockByNumber(currentBlock - i);
      
      if (block && block.transactions) {
        // For a full implementation, you would use eth_getTransactionByHash
        // for each tx hash to get complete transaction details
        for (const txHash of block.transactions) {
          const tx = await window.ethereum.request({
            method: "eth_getTransactionByHash",
            params: [txHash]
          });
          
          if (!tx) continue;
          
          // Check if this transaction involves our address
          if (tx.from.toLowerCase() === address.toLowerCase() || 
              (tx.to && tx.to.toLowerCase() === address.toLowerCase())) {
            
            const weiValue = parseInt(tx.value, 16);
            const ethValue = weiValue / 1e18;
            
            transactions.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to || "Contract Creation",
              value: tx.value,
              formattedValue: ethValue.toFixed(4) + " ETH",
            });
            
            if (transactions.length >= limit) {
              break;
            }
          }
        }
      }
    }
    
    return transactions;
  } catch (error) {
    console.error("Error getting transaction history:", error);
    throw error;
  }
}
