import {ethers} from 'ethers';
//ethera to not confuse with ethers on import

export async function helloEthers() {
    // Check if window.ethereum is available
    if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
    }
    
    try {
        // Create a provider instance
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Request permission to access accounts
        await provider.send("eth_requestAccounts", []);
        
        // Get signer
        const signer = provider.getSigner();
        
        // Get address to verify connection
        const address = await signer.getAddress();
        
        return `Connected successfully with address: ${address}`;
    } catch (error) {
        console.error("Error in helloEthers:", error);
        throw error;
    }
}