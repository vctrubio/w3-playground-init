import React, { useState } from 'react';
import { ethers } from 'ethers';
import HouseUrbanABI from './erc1155abi.json'; // Your contract ABI

const CONTRACT_ADDRESS = '0x8274a1859910C3454CC5a8804B80cfC83b5cacBd';
const SEPOLIA_CHAIN_ID = '11155111';

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState('0');

  // Connect to MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        // Switch to Sepolia
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${Number(SEPOLIA_CHAIN_ID).toString(16)}` }],
        });

        // Set up provider and signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Create contract instance
        const houseUrbanContract = new ethers.Contract(CONTRACT_ADDRESS, HouseUrbanABI, signer);
        setContract(houseUrbanContract);

        console.log('Connected:', accounts[0]);
      } catch (error) {
        console.error('Connection failed:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  // Example: Check balance of a token ID (e.g., tokenId = 1)
  const checkBalance = async () => {
    if (contract && account) {
      try {
        const tokenId = 1; // Adjust based on your token IDs
        const balance = await contract.balanceOf(account, tokenId);
        setBalance(balance.toString());
      } catch (error) {
        console.error('Balance fetch failed:', error);
      }
    }
  };

  // Example: Mint a token (assuming your contract has a mint function)
  const mintToken = async () => {
    if (contract) {
      try {
        const tokenId = 1; // Adjust based on your token IDs
        const amount = 1;  // Number of tokens to mint
        const tx = await contract.mint(account, tokenId, amount, '0x'); // '0x' is empty data
        await tx.wait();
        console.log('Minted successfully!');
        checkBalance(); // Update balance after minting
      } catch (error) {
        console.error('Minting failed:', error);
      }
    }
  };

  return (
    <div>
      <h1>HouseUrban ERC-1155 DApp</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {account}</p>
          <button onClick={checkBalance}>Check Balance</button>
          <p>Balance of Token ID 1: {balance}</p>
          <button onClick={mintToken}>Mint Token</button>
        </div>
      )}
    </div>
  );
}

export default App;