import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useUser } from '@/contexts/UserContext';

export interface Event {
  address: string;
  tokenId: number;
  amount: number;
  type: 'mint' | 'burn';
}

async function getLogs(filter: ethers.Filter, provider: ethers.Provider): Promise<ethers.Log[]> {
  return await provider.getLogs(filter);
}

export function ContractEventComponent() {
  const { user, parentContract } = useUser();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Early return with proper React component if user is null
  if (!user) {
    return <div>Please connect wallet</div>;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        if (!parentContract?.address) {
          throw new Error('No parent contract found');
        }

        if (!user || !user.provider) {
          throw new Error('No user or provider found');
        }

        const filterMint: ethers.Filter = {
          address: parentContract.address,
          fromBlock: 0,
          toBlock: 'latest',
          topics: [
            ethers.id('Mint(address,uint256,uint256)'),
          ],
        };

        const logs = await getLogs(filterMint, user.provider);
        console.log('eventMints', logs); 

        setEvents(logs)
      } catch (err) {
        setError('Failed to fetch events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []); // Dependency on user and parentContract

  if (loading) {
    return <div></div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Contract Events</h1>
      <pre>{JSON.stringify(events, null, 2)}</pre>
    </div>
  );
}

export default ContractEventComponent;
