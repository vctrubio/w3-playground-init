import { useState } from 'react';

interface GameItem {
  id: number;
  title: string;
  color: string;
}

// GameBox component to render each game item
const GameBox = ({ item, isLastInOddGroup, isLast }: { item: GameItem; isLastInOddGroup?: boolean; isLast?: boolean }) => {
  const showTitleAlways = item.id === 6 || isLast;
  
  return (
    <div 
      className={`p-4 m-2 rounded-xl shadow-md transition-transform hover:scale-105 flex-grow relative ${isLastInOddGroup ? 'w-full' : 'w-[30%]'}`}
      style={{ 
        borderWidth: '3px',
        borderStyle: 'solid',
        borderColor: item.color,
        backgroundColor: `${item.color}20`
      }}
    >
      <p className="text-lg font-semibold">Item #{item.id}</p>
      <h3 
        className={`font-bold text-lg transition-opacity duration-300 ${showTitleAlways ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      >
        {item.title}
      </h3>
      <div className="absolute inset-0 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity" style={{background: `${item.color}40`}}>
        <h3 className="font-bold text-lg">{!showTitleAlways && item.title}</h3>
      </div>
    </div>
  );
};

function Game() {
  const [gameItems, setGameItems] = useState<GameItem[]>([
    { id: 0, title: "Ruby Box", color: "#E0115F" },
    { id: 1, title: "Sapphire Box", color: "#0F52BA" },
    { id: 2, title: "Emerald Box", color: "#50C878" },
    { id: 3, title: "Amber Box", color: "#FFBF00" },
    { id: 4, title: "Amethyst Box", color: "#9966CC" },
    { id: 5, title: "Diamond Box", color: "#B9F2FF" },
    { id: 6, title: "Obsidian Box", color: "#3D3D3D" }
  ]);

  // Calculate if the last item should take up the full row
  const totalItems = gameItems.length;
  const isLastItemAlone = totalItems % 3 === 1;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Game Boxes</h1>
      <div className="flex flex-wrap justify-center border-b border-l border-r shadow-md group">
        {gameItems.map((item, index) => (
          <GameBox 
            key={item.id} 
            item={item} 
            isLastInOddGroup={isLastItemAlone && index === totalItems - 1}
            isLast={index === totalItems - 1}
          />
        ))}
      </div>
    </div>
  );
}

export default Game;