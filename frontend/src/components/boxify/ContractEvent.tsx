import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useUser } from '@/contexts/UserContext';

interface Event {
  address: string;
  tokenId: number;
  total: number;
}

interface RawEvent {
  address: string;
  tokenId: number;
  amount: number;
  type: 'mint' | 'burn';
}

interface TokenOwnership {
  address: string;
  total: number;
}

interface TokenOwnerships {
  [tokenId: number]: TokenOwnership[];
}

async function getLogs(filter: ethers.Filter, provider: ethers.Provider): Promise<ethers.Log[]> {
  const raw = await provider.getLogs(filter);
  return raw;
}

// Function to calculate total tokens by address
function getEventResult(events: RawEvent[]): Event[] {
  const balanceMap: Record<string, Record<number, number>> = {};

  events.forEach(event => {
    const { address, tokenId, amount, type } = event;

    if (!balanceMap[address]) {
      balanceMap[address] = {};
    }

    if (!balanceMap[address][tokenId]) {
      balanceMap[address][tokenId] = 0;
    }

    if (type === 'mint') {
      balanceMap[address][tokenId] += amount;
    } else if (type === 'burn') {
      balanceMap[address][tokenId] -= amount;
    }
  });

  const result: Event[] = [];

  Object.entries(balanceMap).forEach(([address, tokens]) => {
    Object.entries(tokens).forEach(([tokenId, total]) => {
      result.push({
        address,
        tokenId: Number(tokenId),
        total
      });
    });
  });

  return result;
}

function getEventsByTokenId(events: Event[]): TokenOwnerships {
  const tokenMap: TokenOwnerships = {};
  
  events.forEach(event => {
    const { tokenId, address, total } = event;
    
    if (!tokenMap[tokenId]) {
      tokenMap[tokenId] = [];
    }
    
    // should always be > 0, but just checking
    if (total > 0) {
      tokenMap[tokenId].push({
        address,
        total
      });
    }
  });
  
  return tokenMap;
}

export function ContractEventComponent() {
  const { user, parentContract: contract } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [tokenEvents, setTokenEvents] = useState<TokenOwnerships>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return <div>Please connect wallet</div>;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        if (!contract?.address) {
          throw new Error('No parent contract found');
        }

        if (!user || !user.provider) {
          throw new Error('No user or provider found');
        }

        const filterMint: ethers.Filter = {
          address: contract.address,
          fromBlock: 0,
          toBlock: 'latest',
          topics: [
            ethers.id('Mint(address,uint256,uint256)'),
          ],
        };

        const filterBurn: ethers.Filter = {
          address: contract.address,
          fromBlock: 0,
          toBlock: 'latest',
          topics: [
            ethers.id('Burn(address,uint256,uint256)'),
          ],
        };

        const [mintLogs, burnLogs] = await Promise.all([
          getLogs(filterMint, user.provider),
          getLogs(filterBurn, user.provider)
        ]);

        const parsedMintLogs = mintLogs.map((log) => {
          const parsedLog = contract.instance?.interface.parseLog(log);
          return {
            address: parsedLog.args[0],
            tokenId: Number(parsedLog.args[1]),
            amount: Number(parsedLog.args[2]),
            type: 'mint',
          } as RawEvent;
        });

        const parsedBurnLogs = burnLogs.map((log) => {
          const parsedLog = contract.instance?.interface.parseLog(log);
          return {
            address: parsedLog.args[0],
            tokenId: Number(parsedLog.args[1]),
            amount: Number(parsedLog.args[2]),
            type: 'burn',
          } as RawEvent;
        });

        const allRawEvents = [...parsedMintLogs, ...parsedBurnLogs];
        const processedEvents = getEventResult(allRawEvents);
        setEvents(processedEvents);
        
        // Organize events by tokenId
        const eventsByToken = getEventsByTokenId(processedEvents);
        setTokenEvents(eventsByToken);
      } catch (err) {
        setError('Failed to fetch events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div></div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Contract Events</h1>
      {/* <h2>Events by Address</h2>
      <pre>{JSON.stringify(events, null, 2)}</pre>
       */}
      <h2>Events by Token ID</h2>
      <pre>{JSON.stringify(tokenEvents, null, 2)}</pre>
    </div>
  );
}

export default ContractEventComponent;
