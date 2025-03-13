// src/lib/wallet.js
import { ethers } from 'ethers';

export async function connectWallet() {
    if (!window.ethereum) throw new Error('MetaMask not installed');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const address = accounts[0];
    return { provider, address };
}

export async function checkExistingConnection() {
    console.log("Checking existing connection");
    if (!window.ethereum) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_accounts', []);
    return accounts.length > 0 ? { provider, address: accounts[0] } : null;
}

export async function disconnectWallet() {
    console.log("Disconnecting wallet");
    // Note: Ethereum providers don't have a standard method to "disconnect"
    // Instead, we'll return a success status and let the UI handle clearing the state
    // In a real app, you might want to:
    // 1. Clear any stored data in localStorage
    // 2. Reset any application state related to the wallet
    
    // For MetaMask specifically, you could use the forgetIdentity method if available
    if (window.ethereum && window.ethereum._metamask && typeof window.ethereum._metamask.forgetIdentity === 'function') {
        try {
            await window.ethereum._metamask.forgetIdentity();
            return { success: true };
        } catch (error) {
            console.error("Failed to disconnect from MetaMask:", error);
            throw error;
        }
    }
    
    return { success: true };
}
