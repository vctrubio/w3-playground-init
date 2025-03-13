import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { ethers } from 'ethers';

export default function Dev() {
  const { isConnected, account } = useWallet();
  const [networkInfo, setNetworkInfo] = useState<{
    name: string;
    chainId: number;
    blockNumber: number;
    gasPrice: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractName, setContractName] = useState('');
  const [contractCode, setContractCode] = useState(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MyContract {
    uint256 private value;
    
    event ValueChanged(uint256 newValue);
    
    function setValue(uint256 newValue) public {
        value = newValue;
        emit ValueChanged(newValue);
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
}`);

  useEffect(() => {
    const fetchNetworkInfo = async () => {
      if (!window.ethereum) {
        setError("No Ethereum provider detected");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();
        const feeData = await provider.getFeeData();
        
        setNetworkInfo({
          name: network.name === 'homestead' ? 'Ethereum Mainnet' : network.name,
          chainId: Number(network.chainId),
          blockNumber,
          gasPrice: ethers.formatUnits(feeData.gasPrice || 0n, 'gwei')
        });
        setError(null);
      } catch (err) {
        console.error("Failed to fetch network info:", err);
        setError("Failed to fetch network information");
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      fetchNetworkInfo();
    } else {
      setNetworkInfo(null);
      setIsLoading(false);
    }
  }, [isConnected]);

  // This function would typically use a contract compilation API
  const handleCompile = () => {
    alert(`Compiling contract: ${contractName || 'Unnamed'}`);
    // In a real implementation, you would send the code to a compilation service
    // or use a library like solc-js to compile it
  };

  return (
    <div>
      <div className="mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Developer Tools</h1>
        
        {!isConnected && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-700 dark:text-yellow-200">
              Please connect your wallet to access all development features
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Network Info Panel */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Network Information</h2>
            
            {isLoading ? (
              <div className="animate-pulse flex flex-col space-y-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ) : error ? (
              <p className="text-red-500 dark:text-red-400">{error}</p>
            ) : networkInfo ? (
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Network</dt>
                  <dd className="text-gray-900 dark:text-white">{networkInfo.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Chain ID</dt>
                  <dd className="text-gray-900 dark:text-white">{networkInfo.chainId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Block</dt>
                  <dd className="text-gray-900 dark:text-white">{networkInfo.blockNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gas Price</dt>
                  <dd className="text-gray-900 dark:text-white">{networkInfo.gasPrice} Gwei</dd>
                </div>
              </dl>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">Connect your wallet to view network details</p>
            )}
          </div>

          {/* Solidity Editor Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Solidity Editor</h2>
            
            <div className="mb-4">
              <label htmlFor="contractName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contract Name
              </label>
              <input
                type="text"
                id="contractName"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="MyContract"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="solidity-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contract Code
              </label>
              <textarea
                id="solidity-code"
                rows={12}
                className="w-full p-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={contractCode}
                onChange={(e) => setContractCode(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleCompile}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
                disabled={!isConnected}
              >
                Compile Contract
              </button>
            </div>
          </div>
        </div>
        
        {/* Additional developer resources section */}
        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Developer Resources</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <a
              href="https://docs.ethers.org/v6/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Ethers.js Documentation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">JavaScript library for interacting with the Ethereum blockchain</p>
            </a>
            
            <a
              href="https://hardhat.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Hardhat Documentation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Ethereum development environment for professionals</p>
            </a>
            
            <a
              href="https://docs.soliditylang.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Solidity Documentation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Official documentation for the Solidity language</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
