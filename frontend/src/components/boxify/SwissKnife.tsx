import { ethers } from 'ethers';

/*
import { ethers } from 'ethers';

// Setup Provider and Signer
const provider = new ethers.providers.Web3Provider(window.ethereum);
await window.ethereum.request({ method: 'eth_requestAccounts' });
const signer = provider.getSigner();

// ERC1155 Contract
const erc1155Address = '0x5fbdb2315678afecb367f032d93f642f64180aa3'; // Update with your actual address
const erc1155Abi = [/* ABI from your ERC1155 contract ];

const erc1155Contract = new ethers.Contract(erc1155Address, erc1155Abi, signer);

// Forging Contract
const forgingAddress = '0x...'; // Replace with your forging contract address
const forgingAbi = [ ABI from your forging contract]
const forgingContract = new ethers.Contract(forgingAddress, forgingAbi, signer);


Read-Only (with Provider):
javascript
const readOnlyContract = new ethers.Contract(erc1155Address, erc1155Abi, provider);
const balance = await readOnlyContract.balanceOf(userAddress, 0); // Token ID 0 balance
console.log(balance.toString());

State-Changing (with Signer):
javascript
const tx = await forgingContract.forge(3); // Forge token 3 by burning 0 and 1
await tx.wait();
console.log('Forged token 3!');

*/

const SwissKnife = () => {
    return (<div>
        you are at the right spot
    </div>)
};

export default SwissKnife;
