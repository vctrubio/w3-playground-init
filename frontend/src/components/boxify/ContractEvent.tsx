import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { listenToContractEvents, ContractEvent } from '@/lib/rpc-events';

function ContractEventComponent() {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const { contract } = useUser();
  const { addNotification } = useNotifications();
  const [selectedEvent, setSelectedEvent] = useState<ContractEvent | null>(null);

  // Set up event listening when enabled
  useEffect(() => {
    if (!isListening || !contract?.instance || !contract?.abi) {
      return;
    }

    const cleanupListener = listenToContractEvents(contract, (newEvent) => {
      addNotification({
        type: 'info',
        message: `New event detected: ${newEvent.name}`,
      });
      
      setEvents(prev => [newEvent, ...prev]);
    });

    return () => {
      if (cleanupListener) cleanupListener();
    };
  }, [isListening, contract, addNotification]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return String(value);
      }
    }
    return String(value);
  };

  const handleViewDetails = (event: ContractEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseDetails = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Contract Events</h2>
        <button 
          onClick={() => setIsListening(prev => !prev)}
          disabled={!contract?.instance}
          className={`px-4 py-1 rounded text-white
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700' 
              : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'} 
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isListening ? 'Stop Listening' : 'Start Listenaing'}
        </button>
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 italic">
            {!contract?.instance 
              ? 'Connect to a contract to listen for events' 
              : isListening 
                ? 'Waiting for events...' 
                : 'Click "Start Listening" to begin monitoring events'}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {events.map(event => (
              <div 
                key={`${event.blockNumber}-${event.logIndex}-${event.name}`} 
                className="border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 mb-3 hover:shadow-md transition-shadow"
                onClick={() => handleViewDetails(event)}
              >
                <div className="flex justify-between">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{event.name}</span>
                  <div className="flex space-x-2">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">#{event.blockNumber}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{formatTime(event.timestamp)}</span>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-1">
                  {Object.entries(event.args || {}).slice(0, 2).map(([key, value]) => (
                    <div key={key} className="flex text-sm overflow-hidden">
                      <span className="text-gray-600 dark:text-gray-400 font-medium mr-2">{key}:</span>
                      <span className="font-mono text-gray-800 dark:text-gray-200 truncate">{formatValue(value)}</span>
                    </div>
                  ))}
                  {Object.keys(event.args || {}).length > 2 && (
                    <div className="text-sm text-blue-500 dark:text-blue-400 cursor-pointer">
                      + {Object.keys(event.args || {}).length - 2} more fields...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Event: {selectedEvent.name}
              </h3>
              <button 
                onClick={handleCloseDetails}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Block Number:</span>
                <span className="col-span-2 font-mono">{selectedEvent.blockNumber}</span>
                
                <span className="text-gray-600 dark:text-gray-400">Transaction Hash:</span>
                <span className="col-span-2 font-mono text-blue-500 truncate">
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${selectedEvent.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedEvent.transactionHash}
                  </a>
                </span>
                
                <span className="text-gray-600 dark:text-gray-400">Time:</span>
                <span className="col-span-2">{new Date(selectedEvent.timestamp).toLocaleString()}</span>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Event Arguments:</h4>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg">
                  {Object.entries(selectedEvent.args || {}).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-2 mb-1">
                      <span className="font-mono text-gray-600 dark:text-gray-400">{key}:</span>
                      <span className="col-span-2 font-mono break-all">{formatValue(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Raw Log Data:</h4>
                <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(selectedEvent.raw || {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractEventComponent;
