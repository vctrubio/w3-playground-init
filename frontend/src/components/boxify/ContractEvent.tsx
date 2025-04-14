import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useUser } from '@/contexts/UserContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { getTokenById, RawEvent, TokenOwnerships } from '@/lib/types';
import { getEventResult, getEventsByTokenId } from '@/lib/utils';
import TokenEventsTable from './TokenEventsTable';

async function getLogs(filter: ethers.Filter, provider: ethers.Provider): Promise<ethers.Log[]> {
  const raw = await provider.getLogs(filter);
  return raw;
}

// Function to initialize listeners for real-time events
function initListener(contract: ethers.Contract, addEventCallback: (newEvent: RawEvent) => void, showNotification: any) {

  contract.on("Mint", (to: string, tokenId: number, amount: number, event: any) => {
    const token = getTokenById(Number(tokenId));
    const msg = `Mint | ${to.substring(0, 2)}...${to.substring(to.length - 3)} -> ${token.name} | Amount ${amount}`;
    console.log(msg);
    showNotification(msg, "blue");

    const newEvent: RawEvent = {
      address: to,
      tokenId: Number(tokenId),
      amount: Number(amount),
      type: 'mint',
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber
    };
    
    addEventCallback(newEvent);
  });

  contract.on("Burn", (from: string, tokenId: number, amount: number, event: any) => {
    const token = getTokenById(Number(tokenId));
    const msg = `Burn | ${from.substring(0, 2)}...${from.substring(from.length - 3)} -> ${token.name} | Amount ${amount}`;
    console.log(msg);
    showNotification(msg, "blue");

    const newEvent: RawEvent = {
      address: from,
      tokenId: Number(tokenId),
      amount: Number(amount),
      type: 'burn',
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber
    };
    
    addEventCallback(newEvent);
  });

  // Return a cleanup function to remove listeners
  return () => {
    contract.removeAllListeners("Mint");
    contract.removeAllListeners("Burn");
  };
}

export function ContractEventComponent() {
  const { user, parentContract: contract, socketContract } = useUser();
  const { showNotification } = useNotifications();
  const [tokenEvents, setTokenEvents] = useState<TokenOwnerships>({});
  const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return <div>Please connect wallet</div>;
  }

  // Function to add a new event and update all states
  const addNewEvent = (newEvent: RawEvent) => {
    // Update rawEvents
    setRawEvents(prevRawEvents => {
      const updatedRawEvents = [...prevRawEvents, newEvent];
      
      // Save to localStorage for persistence
      localStorage.setItem('rawEvents', JSON.stringify(updatedRawEvents));
      
      // Recalculate processed events
      const processedEvents = getEventResult(updatedRawEvents);
      
      // Recalculate token events
      const eventsByToken = getEventsByTokenId(processedEvents);
      setTokenEvents(eventsByToken);
      
      return updatedRawEvents;
    });
  };

  // Effect for initial data loading
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
            address: parsedLog?.args[0],
            tokenId: Number(parsedLog?.args[1]),
            amount: Number(parsedLog?.args[2]),
            type: 'mint',
          } as RawEvent;
        });

        const parsedBurnLogs = burnLogs.map((log) => {
          const parsedLog = contract.instance?.interface.parseLog(log);
          return {
            address: parsedLog?.args[0],
            tokenId: Number(parsedLog?.args[1]),
            amount: Number(parsedLog?.args[2]),
            type: 'burn',
          } as RawEvent;
        });

        const allRawEvents = [...parsedMintLogs, ...parsedBurnLogs];
        setRawEvents(allRawEvents);
        
        // Save to localStorage for persistence
        localStorage.setItem('rawEvents', JSON.stringify(allRawEvents));
        
        // Use utility functions
        const processedEvents = getEventResult(allRawEvents);
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

  // Effect for real-time updates
  useEffect(() => {
    if (!socketContract?.instance) return;
    
    const cleanup = initListener(socketContract.instance, addNewEvent, showNotification);
    return () => {
      cleanup();
    };
  }, [socketContract]);

  if (loading) {
    return <div></div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto">
      <TokenEventsTable
        tokenEvents={tokenEvents}
        rawEvents={rawEvents}
        userAddress={user.address} // Pass the user's address to highlight it
      />
    </div>
  );
}

export default ContractEventComponent;
