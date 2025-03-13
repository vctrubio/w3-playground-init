import { useState } from 'react';
import { DropdownList, ListItem } from '../DropdownList';

export interface AccountProps {
    onAddressChange?: (address: string) => void;
}

// Convert the existing task array to the new ListItem format
const initialTasks: ListItem[] = [
    { id: "task-1", text: "Connect to wallet using X library.", completed: false },
    { id: "task-2", text: "Be able to sign out, sign back in with previouse wallet, or last wallet", completed: false },
    { id: "task-3", text: "Be able to see address of wallet", completed: false },
    { id: "task-4", text: "Be able to see balance of wallet", completed: false },
    { id: "task-5", text: "Be able to see transaction history of wallet", completed: false },
    { id: "task-6", text: "Be able to see network of wallet", completed: false },
    { id: "task-7", text: "Be able to see block number of wallet", completed: false },
    { id: "task-8", text: "Be able to see block hash of wallet", completed: false },
];

export default function Account({ onAddressChange }: AccountProps): JSX.Element {
    const [address, setAddress] = useState<string>('');
    const [tasks, setTasks] = useState<ListItem[]>(initialTasks);

    // Simulate getting an address (could be from a wallet connection)
    const connectWallet = () => {
        const mockAddress = "0x" + Math.random().toString(16).slice(2, 14);
        setAddress(mockAddress);

        // Pass the address back to the parent
        if (onAddressChange) {
            onAddressChange(mockAddress);
        }
    };

    const disconnectWallet = () => {
        setAddress('');
        if (onAddressChange) {
            onAddressChange('');
        }
    };

    const handleTaskToggle = (id: string, completed: boolean) => {
        setTasks(tasks.map(task => 
            task.id === id ? { ...task, completed } : task
        ));
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                {address ?
                    <div className="flex flex-col mb-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Connected Address:</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400">{address}</span>
                    </div> :
                    <div className="text-gray-500 dark:text-gray-400 mb-2">Not connected to a wallet</div>
                }
                <div className="flex gap-4">
                    <button
                        onClick={connectWallet}
                        className="border bg-blue-500 hover:bg-blue-600 text-white w-6/12 px-4 py-2 rounded"
                    >
                        {address ? 'Change Address' : 'Connect Wallet'}
                    </button>
                    <button
                        onClick={disconnectWallet}
                        className="border bg-gray-500 hover:bg-gray-600 text-white w-6/12 px-4 py-2 rounded"
                        disabled={!address}
                    >
                        Disconnect Wallet
                    </button>
                </div>
            </div>
            
            <DropdownList 
                title="Wallet Integration Tasks" 
                items={tasks}
                onItemToggle={handleTaskToggle}
            />
        </div>
    );
}