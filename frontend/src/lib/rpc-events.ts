import { ethers } from 'ethers';
import { useUser } from '@/contexts/UserContext';

async function getLogs(filter: ethers.Filter): Promise<ethers.Log[]> {
  const { user } = useUser();

  if (!user) {
    throw new Error('No user found');
  }

  const logs = await user.provider.getLogs(filter);
  return logs;
}

export async function initGetContractEvents() {
  const { parentContract } = useUser();

  if (!parentContract?.address) {
    throw new Error('No parent contract found');
  }

  const filterMint: ethers.Filter = {
    address: parentContract.address,
    fromBlock: 0,
    toBlock: 'latest',
    topics: [
      ethers.id('Mint(address,uint256,uint256)')
    ]
  };

  const eventMints = await getLogs(filterMint)
  console.log('eventMints', eventMints);

  return eventMints;
}


/*
{
  topics: [
    keccak256("Mint(address,uint256,uint256)"), // topic[0]: event signature
    "0xUserAddress",                            // topic[1]: indexed `to`
  ],
  data: ABI.encode([1, 10])                    // non-indexed `id` and `amount`
  

  // const mintEvents = events.find((e) => e.name === 'Mint');
  // const burnEvents = events.find((e) => e.name === 'Burn');

  
"mintEvents": {
    "type": "event",
    "name": "Mint",
    "inputs": [
      {
        "name": "address",
        "type": "indexed"
      },
      {
        "name": "arg1",
        "type": "uint256"
      },
      {
        "name": "arg2",
        "type": "uint256"
      }
    ],
    "itemType": "event"
  },
  "burnEvents": {
    "type": "event",
    "name": "Burn",
    "inputs": [
      {
        "name": "address",
        "type": "indexed"
      },
      {
        "name": "arg1",
        "type": "uint256"
      },
      {
        "name": "arg2",
        "type": "uint256"
      }
    ],
    "itemType": "event"
  }

}

*/