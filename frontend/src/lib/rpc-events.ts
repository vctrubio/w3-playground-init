import { ethers } from 'ethers';
import { Contract } from './types';
import { parseAndCategorizeAbi, SolItemType } from './rpc-abi';

export interface ContractEvent {
  name: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  timestamp: number;
  args: Record<string, any>;
  raw?: any;
}

export function listenToContractEvents(
  contract: Contract, 
  onEventReceived: (event: ContractEvent) => void
): () => void {
  if (!contract.instance || !contract.abi) {
    console.error('Cannot listen to events: Contract instance or ABI not available');
    return () => {};
  }

  const { events } = parseAndCategorizeAbi(contract.abi);
  if (events.length === 0) {
    console.log('No events found in contract ABI');
    return () => {};
  }

  console.log(`Setting up listeners for ${events.length} events:`, events.map(e => e.name));

  // Set up listeners for each event
  const cleanupFunctions = events.map(eventDef => {
    try {
      return contract.instance!.on(eventDef.name, (...args) => {
        // The last argument is the event object
        const eventObj = args[args.length - 1];
        
        // Get the arguments (without the event object)
        const eventArgs = args.slice(0, -1);
        
        // Create named arguments mapping
        const namedArgs: Record<string, any> = {};
        
        // Map positional args to named args if we have names
        eventDef.inputs.forEach((input, index) => {
          if (index < eventArgs.length) {
            namedArgs[input.name || `arg${index}`] = eventArgs[index];
          }
        });

        // For named args in the event object
        if (eventObj.args) {
          Object.entries(eventObj.args).forEach(([key, value]) => {
            if (isNaN(Number(key))) { // Skip numeric keys
              namedArgs[key] = value;
            }
          });
        }
        
        const contractEvent: ContractEvent = {
          name: eventDef.name,
          blockNumber: eventObj.blockNumber,
          transactionHash: eventObj.transactionHash,
          logIndex: eventObj.logIndex,
          timestamp: Date.now(), // We'll use current time as the event time
          args: namedArgs,
          raw: eventObj
        };
        
        console.log('Event received:', contractEvent);
        onEventReceived(contractEvent);
      });
    } catch (error) {
      console.error(`Error setting up listener for event ${eventDef.name}:`, error);
      return () => {};
    }
  });

  // Return a cleanup function that removes all listeners
  return () => {
    console.log('Cleaning up event listeners');
    contract.instance!.removeAllListeners();
  };
}

export async function getHistoricalEvents(
  contract: Contract,
  eventName: string, 
  fromBlock: number = 0
): Promise<ContractEvent[]> {
  if (!contract.instance || !contract.abi) {
    console.error('Cannot get events: Contract instance or ABI not available');
    return [];
  }
  
  try {
    const filter = contract.instance.filters[eventName]();
    const events = await contract.instance.queryFilter(filter, fromBlock);
    
    return events.map(event => {
      // Find the event definition in the ABI
      const { events: abiEvents } = parseAndCategorizeAbi(contract.abi!);
      const eventDef = abiEvents.find(e => e.name === eventName);
      
      // Create named arguments
      const namedArgs: Record<string, any> = {};
      
      if (eventDef && event.args) {
        eventDef.inputs.forEach((input, index) => {
          if (event.args && index < event.args.length) {
            namedArgs[input.name || `arg${index}`] = event.args[index];
          }
        });
      }
      
      return {
        name: eventName,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.logIndex,
        timestamp: Date.now(), // We don't have the actual timestamp easily available
        args: event.args ? {...namedArgs, ...event.args} : namedArgs,
        raw: event
      };
    });
    
  } catch (error) {
    console.error(`Error getting historical events for ${eventName}:`, error);
    return [];
  }
}
