import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { executeContract } from '@/lib/rpc-contract';
import { Token, TOKENS, RawEvent } from '@/lib/types';
import { getTokenBalance, formatTokenBalance } from '@/lib/utils';

const GameBox = ({
  item,
  onMint,
  onBurn,
  canBurn,
  loading,
  userBalance
}: {
  item: Token;
  onMint: (item: Token) => void;
  onBurn: (item: Token) => void;
  canBurn: boolean;
  loading: boolean;
  userBalance: number;
}) => {
  return (
    <div
      className="overflow-hidden rounded-xl shadow-lg transition-all hover:shadow-xl"
      style={{
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: item.color,
        background: `linear-gradient(135deg, ${item.color}15, ${item.color}30)`
      }}
    >
      <div
        className="py-3 px-4 font-bold text-lg"
        style={{
          borderBottom: `1px solid ${item.color}40`,
          background: `${item.color}25`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                color: item.color,
                border: `1px solid ${item.color}`,
                backgroundColor: `${item.color}20`
              }}
            >
              {userBalance}
            </div>
            {item.name}
          </div>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {item.description}
        </p>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onMint(item)}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-lg font-medium text-white transition-all relative overflow-hidden group"
            style={{
              backgroundColor: `${item.color}`,
              boxShadow: `0 2px 10px ${item.color}50`
            }}
          >
            <div className="absolute inset-0 w-full h-full transition-all duration-300 ease-out bg-white opacity-0 group-hover:opacity-20"></div>
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <span>Mint</span>
            )}
          </button>

          {canBurn && (
            <button
              onClick={() => onBurn(item)}
              disabled={loading}
              className="flex-1 py-2 px-4 rounded-lg font-medium transition-all relative overflow-hidden group"
              style={{
                color: item.color,
                border: `1px solid ${item.color}`,
                backgroundColor: 'transparent'
              }}
            >
              <div className="absolute inset-0 w-full h-full transition-all duration-300 ease-out opacity-0 group-hover:opacity-10"
                style={{ backgroundColor: item.color }}></div>
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="w-5 h-5 border-2 rounded-full animate-spin"
                    style={{ borderColor: `${item.color}`, borderTopColor: 'transparent' }}></div>
                </div>
              ) : (
                <span>Burn</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

function Game() {
  const { contract, user, parentContract } = useUser();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);
  const [balances, setBalances] = useState<Record<number, number>>({});

  const gameItems = TOKENS;
  const canBurnItem = (id: number) => id >= 3 && id <= 7;

  // Fetch user's token balances when the component mounts
  useEffect(() => {
    if (!user || !parentContract?.instance) return;

    // This would typically be a function that gets events from the blockchain
    // For now, we'll use localStorage to simulate persistence between renders
    const storedEvents = localStorage.getItem('rawEvents');
    if (storedEvents) {
      try {
        const events = JSON.parse(storedEvents) as RawEvent[];
        setRawEvents(events);

        // Calculate balances for the current user
        const userBalances: Record<number, number> = {};
        TOKENS.forEach(token => {
          userBalances[token.id] = getTokenBalance(events, token.id, user.address);
        });
        setBalances(userBalances);
      } catch (e) {
        console.error('Error parsing stored events:', e);
      }
    }

    // Set up event listener for real-time updates
    if (parentContract.instance) {
      const mintFilter = parentContract.instance.filters.Mint(user.address);
      const burnFilter = parentContract.instance.filters.Burn(user.address);

      const handleMintEvent = (address: string, tokenId: number, amount: number, event: any) => {
        const newEvent: RawEvent = {
          address,
          tokenId: Number(tokenId),
          amount: Number(amount),
          type: 'mint',
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        };

        setRawEvents(prev => {
          const updated = [...prev, newEvent];
          localStorage.setItem('rawEvents', JSON.stringify(updated));
          return updated;
        });

        setBalances(prev => ({
          ...prev,
          [tokenId]: (prev[tokenId] || 0) + amount
        }));
      };

      const handleBurnEvent = (address: string, tokenId: number, amount: number, event: any) => {
        const newEvent: RawEvent = {
          address,
          tokenId: Number(tokenId),
          amount: Number(amount),
          type: 'burn',
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        };

        setRawEvents(prev => {
          const updated = [...prev, newEvent];
          localStorage.setItem('rawEvents', JSON.stringify(updated));
          return updated;
        });

        setBalances(prev => ({
          ...prev,
          [tokenId]: (prev[tokenId] || 0) - amount
        }));
      };

      parentContract.instance.on(mintFilter, handleMintEvent);
      parentContract.instance.on(burnFilter, handleBurnEvent);

      return () => {
        parentContract.instance?.off(mintFilter, handleMintEvent);
        parentContract.instance?.off(burnFilter, handleBurnEvent);
      };
    }
  }, [user, parentContract]);

  useEffect(() => {
    if (!user || !parentContract?.instance) return;

    // Add listener for custom tokenUpdate events
    const handleTokenUpdate = (event: CustomEvent) => {
      const { type, address, tokenId, amount } = event.detail;
      
      // Only update balances if the event is for the current user
      if (address.toLowerCase() === user.address.toLowerCase()) {
        setBalances(prev => {
          const currentBalance = prev[tokenId] || 0;
          const newBalance = type === 'mint' 
            ? currentBalance + amount 
            : currentBalance - amount;
            
          return {
            ...prev,
            [tokenId]: newBalance
          };
        });
      }
    };

    // Add the event listener
    window.addEventListener('tokenUpdate', handleTokenUpdate as EventListener);

    return () => {
      window.removeEventListener('tokenUpdate', handleTokenUpdate as EventListener);
    };
  }, [user, parentContract]);

  const handleMint = async (item: Token) => {
    if (!contract) {
      console.log('No contract available. Please connect wallet first.');
      return;
    }

    const actionKey = `mint-${item.id}`;
    setLoading({ ...loading, [actionKey]: true });

    try {
      console.log(`Starting to mint ${item.name}...`);
      console.log(`Executing "mint" on contract with arg:`, item.id);

      const result = await executeContract({
        contract,
        functionName: 'mint',
        functionArgs: [item.id]
      });

      console.log(`Mint result for ${item.name} (ID: ${item.id}):`, result);

      if (result && result.hash) {
        console.log(`Successfully minted ${item.name}! Transaction: ${result.hash}`);
      } else {
        console.log(`${item.name} minted successfully!`);
      }
    } catch (error) {
      console.error(`Error minting ${item.name} (ID: ${item.id}):`, error);
    } finally {
      setLoading({ ...loading, [actionKey]: false });
    }
  };

  const handleBurn = async (item: Token) => {
    if (!contract) {
      console.log('No contract available. Please connect wallet first.');
      return;
    }

    if (!canBurnItem(item.id)) {
      console.log(`${item.name} cannot be burned`);
      return;
    }

    const actionKey = `burn-${item.id}`;
    setLoading({ ...loading, [actionKey]: true });

    try {
      console.log(`Starting to burn ${item.name}...`);
      console.log(`Executing "burn" on contract with arg:`, item.id);

      const result = await executeContract({
        contract,
        functionName: 'burn',
        functionArgs: [item.id]
      });

      console.log(`Burn result for ${item.name} (ID: ${item.id}):`, result);

      if (result && result.hash) {
        console.log(`Successfully burned ${item.name}! Transaction: ${result.hash}`);
      } else {
        console.log(`${item.name} burned successfully!`);
      }
    } catch (error) {
      console.error(`Error burning ${item.name} (ID: ${item.id}):`, error);
    } finally {
      setLoading({ ...loading, [actionKey]: false });
    }
  };

  const shouldLastItemSpanFull = gameItems.length % 3 === 1;

  return (
    <div className="p-6 max-w-5xl mx-auto border-b border-r border-l">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gameItems.map((item) => (
          <div
            key={item.id}
            className={`${shouldLastItemSpanFull && item.id === gameItems.length - 1 ? 'md:col-span-2 lg:col-span-3' : ''}`}
          >
            <GameBox
              item={item}
              onMint={handleMint}
              onBurn={handleBurn}
              canBurn={canBurnItem(item.id)}
              loading={loading[`mint-${item.id}`] || loading[`burn-${item.id}`] || false}
              userBalance={balances[item.id] || 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Game;