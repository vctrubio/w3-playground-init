import {ethers} from 'ethers';
//ethera to not confuse with ethers on import

export async function helloEthers() {
    try {
        // Create a provider instance
        const provider = new ethers.BrowserProvider(window.ethereum);
        console.log('provider', provider);
        
        // Request permission to access accounts
        await provider.send("eth_requestAccounts", []);
        
        // Get network information
        const network = await provider.getNetwork();
        
        // Get current block number
        const blockNumber = await provider.getBlockNumber();
        
        // Get fee data
        const feeData = await provider.getFeeData();
        
        // Return structured data that can be displayed
        return {
            connected: true,
            network: {
                name: network.name,
                chainId: network.chainId.toString()
            },
            blockNumber: blockNumber,
            gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") + " gwei" : "unknown"
        };
    } catch (error) {
        console.error('Error in helloEthers:', error);
        return {
            connected: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

export async function helloEthersFather() {
    try {
        // Get the basic info from helloEthers
        const basicInfo = await helloEthers();
        
        // If connection failed, just return basic info
        if (!basicInfo.connected) {
            return basicInfo;
        }
        
        // Create a provider instance to get additional information
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Get accounts
        const accounts = await provider.listAccounts();
        
        // Get detailed account information for the first account
        let accountDetails = null;
        if (accounts && accounts.length > 0) {
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const balance = await provider.getBalance(address);
            
            accountDetails = {
                address: address,
                balance: {
                    wei: balance.toString(),
                    ether: ethers.formatEther(balance),
                },
                transactionCount: await provider.getTransactionCount(address)
            };
        }
        
        // Get latest block details
        const latestBlock = await provider.getBlock('latest');
        
        // Return enhanced data
        return {
            ...basicInfo,
            accounts: {
                count: accounts.length,
                firstAccount: accountDetails
            },
            latestBlock: {
                number: latestBlock?.number,
                timestamp: latestBlock?.timestamp ? new Date(Number(latestBlock.timestamp) * 1000).toISOString() : null,
                hash: latestBlock?.hash,
                gasLimit: latestBlock?.gasLimit?.toString(),
                gasUsed: latestBlock?.gasUsed?.toString(),
            },
            ethersVersion: ethers.version
        };
    } catch (error) {
        console.error('Error in helloEthersFather:', error);
        return {
            connected: false,
            error: error instanceof Error ? error.message : String(error),
            source: 'helloEthersFather'
        };
    }
}

export async function getContractInfo(address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2') { // Default to WETH on mainnet
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        
        // Validate the address format
        if (!ethers.isAddress(address)) {
            return {
                success: false,
                error: 'Invalid address format'
            };
        }
        
        // Get contract information
        const balance = await provider.getBalance(address);
        const code = await provider.getCode(address);
        const isContract = code !== '0x';
        const transactionCount = await provider.getTransactionCount(address);
        
        return {
            success: true,
            address,
            isContract,
            balance: {
                wei: balance.toString(),
                ether: ethers.formatEther(balance)
            },
            bytecodeSize: isContract ? code.length / 2 - 1 : 0, // Convert hex to bytes size
            transactionCount,
            bytecode: isContract ? (code.length > 200 ? code.substring(0, 200) + '...' : code) : 'Not a contract'
        };
    } catch (error) {
        console.error('Error in getContractInfo:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

export async function sendSimpleTransaction() {
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // Create a simple transaction to self with minimal value
        const tx = {
            to: address,
            value: ethers.parseEther('0.0001'), // A very small amount
        };
        
        // Estimate gas
        const gasEstimate = await provider.estimateGas(tx);
        
        // Get current gas price
        const feeData = await provider.getFeeData();
        
        // Show details before sending
        return {
            status: 'ready',
            transaction: {
                from: address,
                to: tx.to,
                value: ethers.formatEther(tx.value) + ' ETH',
                gasEstimate: gasEstimate.toString(),
                gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') + ' gwei' : 'unknown',
                estimatedFee: feeData.gasPrice ? 
                    ethers.formatEther(gasEstimate * feeData.gasPrice) + ' ETH' : 'unknown',
            },
            message: 'Transaction ready. Call sendSimpleTransactionConfirm() to execute'
        };
    } catch (error) {
        console.error('Error in sendSimpleTransaction:', error);
        return {
            status: 'error',
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

export async function readContractData(address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2') { // Default to WETH
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        
        // Standard ERC-20 interface ABI
        const erc20ABI = [
            'function name() view returns (string)',
            'function symbol() view returns (string)',
            'function decimals() view returns (uint8)',
            'function totalSupply() view returns (uint256)',
            'function balanceOf(address owner) view returns (uint256)'
        ];
        
        // Create contract instance
        const contract = new ethers.Contract(address, erc20ABI, provider);
        
        // Read basic token data
        try {
            const [name, symbol, decimals, totalSupply] = await Promise.all([
                contract.name(),
                contract.symbol(),
                contract.decimals(),
                contract.totalSupply()
            ]);
            
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            const userBalance = await contract.balanceOf(userAddress);
            
            return {
                success: true,
                contractType: 'Possible ERC-20',
                tokenInfo: {
                    name,
                    symbol,
                    decimals: Number(decimals),
                    totalSupply: ethers.formatUnits(totalSupply, decimals),
                    userBalance: ethers.formatUnits(userBalance, decimals)
                },
                userAddress
            };
        } catch (e) {
            // Not an ERC-20 or failed calls
            return {
                success: true,
                contractType: 'Not an ERC-20 or incompatible interface',
                error: e instanceof Error ? e.message : String(e)
            };
        }
    } catch (error) {
        console.error('Error in readContractData:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

export async function analyzeTransaction(txHash = '') {
    try {
        if (!txHash || txHash.length < 10) {
            // If no transaction hash provided, we'll get the latest block transactions
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            
            const latestBlock = await provider.getBlock('latest');
            if (!latestBlock || !latestBlock.transactions || latestBlock.transactions.length === 0) {
                return {
                    success: false,
                    error: 'No transactions found in the latest block'
                };
            }
            
            // Use the first transaction in the latest block
            txHash = latestBlock.transactions[0];
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const tx = await provider.getTransaction(txHash);
        
        if (!tx) {
            return {
                success: false,
                error: 'Transaction not found'
            };
        }
        
        const receipt = await provider.getTransactionReceipt(txHash);
        
        return {
            success: true,
            transaction: {
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: tx.value ? ethers.formatEther(tx.value) + ' ETH' : '0 ETH',
                nonce: tx.nonce,
                data: tx.data && tx.data !== '0x' ? 
                    (tx.data.length > 100 ? tx.data.substring(0, 100) + '...' : tx.data) : 
                    'No data',
                dataLength: tx.data ? (tx.data.length - 2) / 2 : 0, // Bytes (excluding '0x')
            },
            receipt: receipt ? {
                status: receipt.status === 1 ? 'Success' : 'Failed',
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed?.toString(),
                effectiveGasPrice: receipt.effectiveGasPrice ? 
                    ethers.formatUnits(receipt.effectiveGasPrice, 'gwei') + ' gwei' : 'unknown',
                logs: receipt.logs.length
            } : 'Pending'
        };
    } catch (error) {
        console.error('Error in analyzeTransaction:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}