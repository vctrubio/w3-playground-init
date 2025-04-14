import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useNotifications } from '@/contexts/NotificationContext';
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

function initListener(contract: ethers.Contract, logger: EventLogger, showNotification: any) {
    contract.on("Mint", (to, tokenId, amount, event) => {
        const msg = `Mint | ${to.substring(0, 2)}...${to.substring(to.length - 3)} -> ID ${tokenId} | Amount ${amount}`;
        console.log("Mint event detected", to, tokenId, amount);
        showNotification(msg, "blue");

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
        const msg = `Burn | ${from.substring(0, 2)}...${from.substring(from.length - 3)} -> ID ${tokenId} | Amount ${amount}`;
        console.log("Burn event detected", from, tokenId, amount);
        showNotification(msg, "blue");

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
    const { socketContract: contract, user } = useUser();
    const [events, setEvents] = useState<EventData[]>([]);
    const { showNotification } = useNotifications();

    useEffect(() => {
        if (!contract?.instance) return;
        const logger: EventLogger = {
            events: [],
            addEvent: (event: EventData) => {
                setEvents((prevEvents) => [...prevEvents, event]);
            },
            total: events.length
        };
        const cleanup = initListener(contract.instance, logger, showNotification);
        return () => {
            cleanup();
            setEvents([]);
        }
    }, [contract]);

    const truncateAddress = (address: string) => {
        return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
    };

    const getEventTypeIcon = (type: string) => {
        return type === 'mint' ? '🔨' : '🔥';
    };

    const getEventTypeColor = (type: string, isUserEvent: boolean) => {
        if (isUserEvent) {
            return type === 'mint' 
                ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-200' 
                : 'bg-purple-100 dark:bg-purple-900 border-purple-500 text-purple-700 dark:text-purple-200';
        }
        
        return type === 'mint' 
            ? 'bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-200' 
            : 'bg-red-100 dark:bg-red-900 border-red-500 text-red-700 dark:text-red-200';
    };

    window.ev = events
    return (
        <div className="shadow-md">
            {events.length === 0 ? (
                <div className="rounded-lg p-8 text-center dark:text-gray-200">
                    <div className="text-6xl mb-4">📡</div>
                    <span>Listening on {contract?.address ? truncateAddress(contract.address) : 'contract'}</span>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Any Mint or Burn events will appear here</p>
                </div>
            ) : (
                <div className="max-h-80 overflow-y-auto">
                    <ul className="space-y-2">
                        {events.map((event, index) => {
                            const isUserEvent = user && user.address.toLowerCase() === event.address.toLowerCase();
                            
                            return (
                                <li
                                    key={`${event.transactionHash}-${index}`}
                                    className={`border-l-4 p-3 rounded flex items-center justify-between ${getEventTypeColor(event.type, isUserEvent)}`}
                                >
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">{getEventTypeIcon(event.type)}</span>
                                        <div>
                                            <div className="font-medium">
                                                {event.type === 'mint' ? 'Minted' : 'Burned'} Token ID#{event.tokenId}
                                                {isUserEvent && <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">Your wallet</span>}
                                            </div>
                                            <div className="text-sm opacity-75">
                                                {event.amount} {event.amount > 1 ? 'tokens' : 'token'} •
                                                Address: {truncateAddress(event.address)}
                                            </div>
                                        </div>
                                    </div>
                                    {/* <a
                                        href={`https://etherscan.io/tx/${event.transactionHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm underline opacity-75 hover:opacity-100"
                                    >
                                        View
                                    </a> */}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default ContractOnListener;
