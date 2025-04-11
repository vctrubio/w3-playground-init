import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { executeContract } from '@/lib/rpc-contract';

interface GameItem {
  id: number;
  title: string;
  color: string;
  msg: string;
}

const GameBox = ({
  item,
  onMint,
  onBurn,
  canBurn,
  loading
}: {
  item: GameItem;
  onMint: (item: GameItem) => void;
  onBurn: (item: GameItem) => void;
  canBurn: boolean;
  loading: boolean;
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
        <div className="flex items-center">
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: item.color }}
          ></div>
          {item.title}
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {item.msg}
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
  const { contract } = useUser();
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const gameItems: GameItem[] = [
    { id: 0, title: "SEED", color: "#E0115F", msg: "Free mint" },
    { id: 1, title: "WATER", color: "#0F52BA", msg: "Free mint" },
    { id: 2, title: "SOIL", color: "#50C878", msg: "Free mint" },
    { id: 3, title: "PLANT", color: "#8531BA", msg: "Needs SEED and WATER" },
    { id: 4, title: "FRUIT", color: "#307DA1", msg: "Needs WATER and SOIL" },
    { id: 5, title: "FLOWER", color: "#986C8E", msg: "Needs SEED and SOIL" },
    { id: 6, title: "BASKET", color: "#483D6F", msg: "Needs SEED, WATER, and SOIL" }
  ];

  // In the assignment
  const canBurnItem = (id: number) => id >= 3 && id <= 7;

  const handleMint = async (item: GameItem) => {
    if (!contract) {
      console.log('No contract available. Please connect wallet first.');
      return;
    }

    const actionKey = `mint-${item.id}`;
    setLoading({ ...loading, [actionKey]: true });

    try {
      console.log(`Starting to mint ${item.title}...`);
      console.log(`Executing "mint" on contract with arg:`, item.id);

      const result = await executeContract({
        contract,
        functionName: 'mint',
        functionArgs: [item.id]
      });

      console.log(`Mint result for ${item.title} (ID: ${item.id}):`, result);

      // Check if the result has a hash, indicating transaction was sent
      if (result && result.hash) {
        console.log(`Successfully minted ${item.title}! Transaction: ${result.hash}`);
      } else {
        console.log(`${item.title} minted successfully!`);
      }
    } catch (error) {
      console.error(`Error minting ${item.title} (ID: ${item.id}):`, error);
    } finally {
      setLoading({ ...loading, [actionKey]: false });
    }
  };

  const handleBurn = async (item: GameItem) => {
    if (!contract) {
      console.log('No contract available. Please connect wallet first.');
      return;
    }

    if (!canBurnItem(item.id)) {
      console.log(`${item.title} cannot be burned`);
      return;
    }

    const actionKey = `burn-${item.id}`;
    setLoading({ ...loading, [actionKey]: true });

    try {
      console.log(`Starting to burn ${item.title}...`);
      console.log(`Executing "burn" on contract with arg:`, item.id);

      const result = await executeContract({
        contract,
        functionName: 'burn',
        functionArgs: [item.id]
      });

      console.log(`Burn result for ${item.title} (ID: ${item.id}):`, result);

      if (result && result.hash) {
        console.log(`Successfully burned ${item.title}! Transaction: ${result.hash}`);
      } else {
        console.log(`${item.title} burned successfully!`);
      }
    } catch (error) {
      console.error(`Error burning ${item.title} (ID: ${item.id}):`, error);
    } finally {
      setLoading({ ...loading, [actionKey]: false });
    }
  };

  // Check if the last item should take full width
  const shouldLastItemSpanFull = gameItems.length % 3 === 1;

  return (
    <div className="p-6 max-w-5xl mx-auto border-b border-r border-l">
      <h1 className="text-xl font-bold mb-6 ">Collect all the collectables</h1>

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
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Game;