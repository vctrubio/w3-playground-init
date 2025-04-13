import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { ethers } from 'ethers';

interface EventData {
    address: string;
    tokenId: number;
    amount: number;
    type: 'mint' | 'burn';
    transactionHash: string;
    blockNumber: number;
}

interface EventLogger {
    events: EventData[];
    addEvent: (event: EventData) => void;
    total: number;
}

function initListener(contract: ethers.Contract, logger: EventLogger) {
    contract.on("Mint", (to, tokenId, amount, event) => {
        console.log("Mint event detected", to, tokenId, amount);
        logger.addEvent({
            address: to,
            tokenId: Number(tokenId),
            amount: Number(amount),
            type: 'mint',
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
        });
    });

    // Listen for Burn events
    contract.on("Burn", (from, tokenId, amount, event) => {
        console.log("Burn event detected", from, tokenId, amount);
        logger.addEvent({
            address: from,
            tokenId: Number(tokenId),
            amount: Number(amount),
            type: 'burn',
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
        });
    });

    // Return a cleanup function to remove listeners
    return () => {
        contract.removeAllListeners("Mint");
        contract.removeAllListeners("Burn");
    };
}

// (user.socket.destroy()), dont forget to destroy the socket connection when the component unmounts
export function ContractOnListener() {
    const { socketContract: contract } = useUser();
    const [events, setEvents] = useState<EventData[]>([]);

    useEffect(() => {
        if (!contract?.instance) return;

        const logger: EventLogger = {
            events: [],
            addEvent: (event: EventData) => {
                setEvents((prevEvents) => [...prevEvents, event]);
            },
            total: events.length
        };
        const cleanup = initListener(contract.instance, logger);
        return () => {
            cleanup();
            setEvents([]);
        }

    }, [contract]);

    return (
        <div>
            <h3>Contract Events hello</h3>
            {events.length === 0 ? (
                <p>No events detected yet</p>
            ) : (
                <ul>
                    {events.map((event, index) => (
                        <li key={`${event.transactionHash}-${index}`}>
                            {event.type === 'mint' ? '- Minted -' : '- Burned -'} -
                            Token #{event.tokenId} -
                            Amount: {event.amount} -
                            Address: {event.address.substring(0, 6)}...
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default ContractOnListener;
