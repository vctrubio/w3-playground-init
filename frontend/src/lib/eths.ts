import { ethers } from 'ethers';

/**
 * Connect to MetaMask/browser wallet and return a signer
 */
export async function entry() {
    const provider = new ethers.BrowserProvider(window.ethereum); // BrowserProvider is used for connecting to a browser extension like MetaMask
    await provider.send("eth_requestAccounts", []); // Connect MetaMask
    const signer = await provider.getSigner(); // Get the signer (your wallet)
    return signer;
}

/**
 * Connect to a JSON-RPC provider with optional API key
 */
export function getRpcProvider(rpcUrl: string) {
    return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Common RPC providers for different networks
 */
export const RPC_PROVIDERS = {
    mainnet: "https://eth-mainnet.g.alchemy.com/v2/",
    goerli: "https://eth-goerli.g.alchemy.com/v2/",
    sepolia: "https://eth-sepolia.g.alchemy.com/v2/",
    polygon: "https://polygon-mainnet.g.alchemy.com/v2/",
    arbitrum: "https://arb-mainnet.g.alchemy.com/v2/"
};

/**
 * Get account details from a connected wallet
 */
export async function getAccountDetails() {
    try {
        const signer = await entry();
        const provider = signer.provider;
        
        if (!provider) {
            throw new Error("No provider connected");
        }
        
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();
        
        return {
            success: true,
            address,
            balanceWei: balance.toString(),
            balanceEth: ethers.formatEther(balance),
            network: {
                name: network.name,
                chainId: network.chainId
            },
            blockNumber
        };
    } catch (error) {
        console.error("Error in getAccountDetails:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Load a contract with human-readable ABI
 */
export function getContract(address: string, abi: string[], signerOrProvider: ethers.Signer | ethers.Provider) {
    return new ethers.Contract(address, abi, signerOrProvider);
}

/**
 * Create contract instance with the most common ABIs
 */
export async function getCommonContract(address: string, type: 'ERC20' | 'ERC721' | 'ERC1155') {
    try {
        // Check address format
        if (!ethers.isAddress(address)) {
            throw new Error("Invalid address format");
        }
        
        // Create appropriate ABI based on type
        let abi: string[];
        
        switch (type) {
            case 'ERC20':
                abi = [
                    'function name() view returns (string)',
                    'function symbol() view returns (string)',
                    'function decimals() view returns (uint8)',
                    'function totalSupply() view returns (uint256)',
                    'function balanceOf(address owner) view returns (uint256)',
                    'function transfer(address to, uint256 amount) returns (bool)',
                    'function allowance(address owner, address spender) view returns (uint256)',
                    'function approve(address spender, uint256 amount) returns (bool)'
                ];
                break;
                
            case 'ERC721':
                abi = [
                    'function name() view returns (string)',
                    'function symbol() view returns (string)',
                    'function balanceOf(address owner) view returns (uint256)',
                    'function ownerOf(uint256 tokenId) view returns (address)',
                    'function tokenURI(uint256 tokenId) view returns (string)',
                    'function approve(address to, uint256 tokenId)',
                    'function getApproved(uint256 tokenId) view returns (address)'
                ];
                break;
                
            case 'ERC1155':
                abi = [
                    'function balanceOf(address account, uint256 id) view returns (uint256)',
                    'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
                    'function uri(uint256 id) view returns (string)',
                    'function isApprovedForAll(address account, address operator) view returns (bool)',
                    'function setApprovalForAll(address operator, bool approved)'
                ];
                break;
        }
        
        // Get signer for interaction
        const signer = await entry();
        return new ethers.Contract(address, abi, signer);
    } catch (error) {
        console.error(`Error creating ${type} contract:`, error);
        throw error;
    }
}

/**
 * Send Ether to an address
 */
export async function sendEther(toAddress: string, amount: string) {
    try {
        // Validate inputs
        if (!ethers.isAddress(toAddress)) {
            throw new Error("Invalid recipient address");
        }
        
        const etherAmount = parseFloat(amount);
        if (isNaN(etherAmount) || etherAmount <= 0) {
            throw new Error("Invalid amount");
        }
        
        // Get signer and check balance
        const signer = await entry();
        const signerAddress = await signer.getAddress();
        const provider = signer.provider;
        
        if (!provider) {
            throw new Error("No provider connected");
        }
        
        const balance = await provider.getBalance(signerAddress);
        const amountWei = ethers.parseEther(amount);
        
        if (balance < amountWei) {
            return {
                success: false,
                error: "Insufficient balance",
                details: {
                    required: ethers.formatEther(amountWei),
                    available: ethers.formatEther(balance)
                }
            };
        }
        
        // Create and send the transaction
        const tx = await signer.sendTransaction({
            to: toAddress,
            value: amountWei
        });
        
        // Return the transaction details
        return {
            success: true,
            transactionHash: tx.hash,
            from: signerAddress,
            to: toAddress,
            amount: ethers.formatEther(amountWei),
            wait: async () => {
                const receipt = await tx.wait();
                return {
                    blockNumber: receipt?.blockNumber,
                    gasUsed: receipt?.gasUsed.toString(),
                    effectiveGasPrice: receipt?.gasPrice ? ethers.formatUnits(receipt.gasPrice, 'gwei') : null,
                    status: receipt?.status === 1 ? "Success" : "Failed"
                };
            }
        };
    } catch (error) {
        console.error("Error sending Ether:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Get a transaction receipt with better formatting
 */
export async function getTransactionInfo(txHash: string) {
    try {
        const signer = await entry();
        const provider = signer.provider;
        
        if (!provider) {
            throw new Error("No provider connected");
        }
        
        const tx = await provider.getTransaction(txHash);
        
        if (!tx) {
            return {
                success: false,
                error: "Transaction not found"
            };
        }
        
        const receipt = await provider.getTransactionReceipt(txHash);
        const block = tx.blockNumber ? await provider.getBlock(tx.blockNumber) : null;
        
        return {
            success: true,
            transaction: {
                hash: tx.hash,
                blockNumber: tx.blockNumber,
                timestamp: block?.timestamp ? new Date(Number(block.timestamp) * 1000).toISOString() : null,
                from: tx.from,
                to: tx.to,
                value: tx.value ? ethers.formatEther(tx.value) + " ETH" : "0 ETH",
                gasLimit: tx.gasLimit.toString(),
                data: tx.data,
                nonce: tx.nonce
            },
            receipt: receipt ? {
                status: receipt.status === 1 ? "Success" : "Failed",
                gasUsed: receipt.gasUsed.toString(),
                effectiveGasPrice: receipt.gasPrice ? ethers.formatUnits(receipt.gasPrice, "gwei") : null,
                logs: receipt.logs.length
            } : "Pending"
        };
    } catch (error) {
        console.error("Error getting transaction:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Helper function to decode contract errors
 */
export function decodeError(error: any) {
    const errorMessage = error?.message || String(error);
    
    // Try to extract more useful info from common error patterns
    if (errorMessage.includes("insufficient funds")) {
        return "Insufficient funds for gas * price + value";
    }
    
    if (errorMessage.includes("user rejected")) {
        return "Transaction was rejected by the user";
    }
    
    if (errorMessage.includes("execution reverted")) {
        // Try to extract the revert reason
        const match = errorMessage.match(/execution reverted: (.*?)"/);
        if (match && match[1]) {
            return `Contract execution failed: ${match[1]}`;
        }
        return "Contract execution reverted";
    }
    
    return errorMessage;
}