import { ethers } from "ethers";

/*
  we need a provider , a wallet and a X? to make a transaction
*/


export function entry(): Record<string, any> {
  console.log("call me anytime");

  const e: Record<string, any> = {}; // Start with an empty object

  const { ethereum } = window;

  if (typeof window.ethereum === "undefined"){
    return {
      status: 444,
      msg: "get out of here"
    }
  }

  if (ethereum) {
    e.windowEthereum = true;
    e.windowIsMetaMask = ethereum.isMetaMask;
    e.windowIsConnected = ethereum.isConnected();
    e.windowSelectedA = ethereum.selectedAddress; //if no wallet is connected = false --> call connectWallet();
    e.windowChainId = ethereum.chainId;
  } else {
    e.windowEthereum = false;
  }


  async function getters(){
    const accounts = await getAccounts();
    const wallet = await connectWallet();

    console.log('cmp')
  }

  getters();
  return e;
}


//REQUEST GO HERE// 
async function getAccounts() {
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  return accounts;
}

async function connectWallet() {
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    return accounts;
  } catch (error) {
    console.error("User denied account access:", error);
  }
}

/*
Description: Retrieves the chain ID of the currently connected network.
Returns: A promise resolving to a hexadecimal string (e.g., "0x1" for Mainnet).
What You Can Do: Verify or display the current network.
*/
async function getChainId() {
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
