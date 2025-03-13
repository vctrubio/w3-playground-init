import { useState } from 'react';

export interface AccountProps {
  onAddressChange?: (address: string) => void;
}

export default function Account({ onAddressChange }: AccountProps): JSX.Element {
    const [address, setAddress] = useState<string>('');

    // Simulate getting an address (could be from a wallet connection)
    const connectWallet = () => {
        const mockAddress = "0x" + Math.random().toString(16).slice(2, 14);
        setAddress(mockAddress);
        
        // Pass the address back to the parent
        if (onAddressChange) {
            onAddressChange(mockAddress);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div>
                {address ? 
                    <div>Connected: {address}</div> : 
                    <div>Not connected to account</div>
                }
            </div>
            <button 
                onClick={connectWallet}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
                {address ? 'Change Address' : 'Connect Wallet'}
            </button>
        </div>
    );
}