import { useUser } from '@/contexts/UserContext';

interface EventData {
    address: string;
    tokenId: number;
    amount: number;
    type: 'mint' | 'burn';
    transactionHash: string;
    blockNumber: number;
}

export function ContractOnListener() {
    const { user } = useUser();
    
    return (
        <div>
            hello lover again
        </div>
    )
}

export default ContractOnListener;
