import { useState, useEffect } from 'react';

interface Event {
  id: number;
  name: string;
  address: string;
  blockNumber: number;
  timestamp: number;
  parameters: Record<string, string>;
}

function ContractEvent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Simulate event subscription
  useEffect(() => {
    if (!isListening) return;

    const timer = setInterval(() => {
      const newEvent = {
        id: Date.now(),
        name: ['Transfer', 'Approval', 'Mint', 'Burn'][Math.floor(Math.random() * 4)],
        address: `0x${Math.floor(Math.random() * 0xFFFFFFFFFFFFFFFF).toString(16).padStart(16, '0')}`,
        blockNumber: Math.floor(Math.random() * 10000000),
        timestamp: Date.now(),
        parameters: {
          from: `0x${Math.floor(Math.random() * 0xFFFFFFFFFFFFFFFF).toString(16).padStart(16, '0')}`,
          to: `0x${Math.floor(Math.random() * 0xFFFFFFFFFFFFFFFF).toString(16).padStart(16, '0')}`,
          value: (Math.random() * 10).toFixed(4)
        }
      };

      setEvents(prev => [newEvent, ...prev].slice(0, 5));
    }, 3000);

    return () => clearInterval(timer);
  }, [isListening]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Contract Events</h2>
        <button 
          onClick={() => setIsListening(prev => !prev)}
          className={`px-4 py-1 rounded text-white ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500 italic">
            {isListening ? 'Waiting for events...' : 'Click "Start Listening" to begin monitoring events'}
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
              <div className="flex justify-between">
                <span className="font-semibold">{event.name}</span>
                <span className="text-gray-500 text-sm">Block #{event.blockNumber}</span>
              </div>
              <div className="text-sm truncate text-gray-500">{event.address}</div>
              <div className="mt-2 space-y-1 text-sm">
                {Object.entries(event.parameters).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-2">
                    <span className="font-mono text-gray-600 dark:text-gray-400">{key}:</span>
                    <span className="col-span-2 truncate font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ContractEvent;
