import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { executeContract } from '@/lib/rpc-contract';

interface GameItem {
  id: number;
  title: string;
  color: string;
  msg: string;
}

const GameBox = ({ item }: { item: GameItem }) => {
  const { contract } = useUser();

  async function handleClick() {
    console.log('Clicking game item:', item.id, item.title);
    
    if (!contract) {
      console.log('No contract available. Please connect wallet first.');
      return;
    }
    
    try {
      console.log(`Executing "Mint" on contract with arg:`, item.id);
      const result = await executeContract({
        contract,
        functionName: 'mint',
        functionArgs: [item.id]
      });
      
      console.log(`Mint result for ${item.title} (ID: ${item.id}):`, result);
    } catch (error) {
      console.error(`Error minting ${item.title} (ID: ${item.id}):`, error);
    }
  }

  return (
    <div
      className="p-4 m-2 rounded-xl shadow-md transition-transform min-h-[150px] flex flex-col relative"
      onClick={handleClick}
      style={{
        borderWidth: '3px',
        borderStyle: 'solid',
        borderColor: item.color,
        backgroundColor: `${item.color}20`
      }}
    >
      <h3 className="font-bold text-lg mb-2">
        {item.title}
      </h3>
      <div className="flex-grow"></div>
      {item.msg && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 flex flex-col items-center justify-center transition-opacity" style={{ background: `${item.color}70` }}>
          <p className="text-center px-4 font-medium w-full">{item.msg}</p>
        </div>
      )}
    </div>
  );
};

function Game() {
  const gameItems: GameItem[] = [
    { id: 0, title: "SEED", color: "#E0115F", msg: "Free mint" },
    { id: 1, title: "WATER", color: "#0F52BA", msg: "Free mint" },
    { id: 2, title: "SOIL", color: "#50C878", msg: "Free mint" },
    { id: 3, title: "PLANT", color: "#8531BA", msg: "Needs SEED and WATER" },
    { id: 4, title: "FRUIT", color: "#307DA1", msg: "Needs WATER and SOIL" },
    { id: 5, title: "FLOWER", color: "#986C8E", msg: "Needs SEED and SOIL" },
    { id: 6, title: "BASKET", color: "#483D6F", msg: "Needs SEED, WATER, and SOIL" }
  ];

  // Check if the last item should take full width
  const shouldLastItemSpanFull = gameItems.length % 3 === 1;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Game Play</h1>
      <div className="grid grid-cols-3 gap-2 border-b border-l border-r shadow-md p-4">
        {gameItems.map((item, index) => (
          <div
            key={item.id}
            className={`${shouldLastItemSpanFull && index === gameItems.length - 1 ? 'col-span-3' : ''}`}
          >
            <GameBox item={item} />
          </div>

        ))}
      </div>
    </div>
  );
}

export default Game;