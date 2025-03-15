import { useState, useEffect } from "react";
import { DropdownList, ListItem } from "@/components/DropdownList";
import { entry, getAccounti, connectWallet, getBalance, getChainId} from "@/lib/ethera.js";

const initialTasks: ListItem[] = [
    {
        id: "task-1",
        text: "Connect to wallet using X library.",
        completed: false,
    },
    {
        id: "task-2",
        text: "Be able to sign out, sign back in with previouse wallet, or last wallet",
        completed: false,
    },
    { id: "task-3", text: "Be able to see address of wallet", completed: false },
    { id: "task-4", text: "Be able to see balance of wallet", completed: false },
    {
        id: "task-5",
        text: "Be able to see transaction history of wallet",
        completed: false,
    },
    { id: "task-6", text: "Be able to see network of wallet", completed: false },
    {
        id: "task-7",
        text: "Be able to see block number of wallet",
        completed: false,
    },
    {
        id: "task-8",
        text: "Be able to see block hash of wallet",
        completed: false,
    },
];

interface WalletStatus {
    address: string | null;
    chainId: string | null;
    balance: number | null;
    loggedIn: boolean;
    apiResponse: Record<string, any>;
}

const UserStoryWallet = ({ walletStatus, setWalletStatus }: { walletStatus: WalletStatus, setWalletStatus: React.Dispatch<React.SetStateAction<WalletStatus>> }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnectWallet = async () => {
        setLoading(true);
        setError(null);
        try {
            const accounts = await connectWallet();
            if (accounts && accounts.length > 0) {
                setWalletStatus(prev => ({
                    ...prev,
                    address: accounts[0],
                    loggedIn: true
                }));
                setStep(2);
            } else {
                setError("No accounts returned from wallet");
            }
        } catch (err) {
            setError(`Failed to connect wallet: ${err instanceof Error ? err.message : String(err)}`);
            console.error("Connection error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckChain = async () => {
        setLoading(true);
        setError(null);
        try {
            const chainId = await getChainId();
            setWalletStatus(prev => ({
                ...prev,
                chainId: chainId
            }));
            setStep(3);
        } catch (err) {
            setError(`Failed to get chain ID: ${err instanceof Error ? err.message : String(err)}`);
            console.error("Chain ID error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckBalance = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!walletStatus.address) {
                throw new Error("No wallet address available");
            }
            
            const balanceWei = await getBalance(walletStatus.address);
            // Convert from Wei to Ether for display
            const balanceEth = parseFloat(balanceWei) / 1e18;
            
            setWalletStatus(prev => ({
                ...prev,
                balance: balanceEth
            }));
            setStep(4);
        } catch (err) {
            setError(`Failed to get balance: ${err instanceof Error ? err.message : String(err)}`);
            console.error("Balance error:", err);
        } finally {
            setLoading(false);
        }
    };

    const resetGame = () => {
        setStep(1);
        setWalletStatus(prev => ({
            ...prev,
            address: null,
            chainId: null,
            balance: null,
            loggedIn: false
        }));
        setError(null);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md border">
            <h3 className="text-lg font-medium mb-4">Wallet User Story Game</h3>
            
            <div className="mb-4">
                <div className="flex items-center mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
                    <span className="font-medium">Connect Wallet</span>
                    {walletStatus.address && <span className="ml-2 text-green-500">✓</span>}
                </div>
                
                {step === 1 && (
                    <div className="ml-11 mb-4">
                        <p className="mb-2 text-sm">Connect your wallet to continue.</p>
                        <button 
                            onClick={handleConnectWallet}
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {loading ? 'Connecting...' : 'Connect Wallet'}
                        </button>
                    </div>
                )}
                
                <div className="flex items-center mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
                    <span className="font-medium">Identify Chain</span>
                    {walletStatus.chainId && <span className="ml-2 text-green-500">✓</span>}
                </div>
                
                {step === 2 && (
                    <div className="ml-11 mb-4">
                        <p className="mb-2 text-sm">Great! Now let's check which blockchain network you're connected to.</p>
                        <button 
                            onClick={handleCheckChain}
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {loading ? 'Checking...' : 'Check Chain'}
                        </button>
                    </div>
                )}
                
                <div className="flex items-center mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>3</div>
                    <span className="font-medium">Check Balance</span>
                    {walletStatus.balance !== null && <span className="ml-2 text-green-500">✓</span>}
                </div>
                
                {step === 3 && (
                    <div className="ml-11 mb-4">
                        <p className="mb-2 text-sm">Now let's check your wallet balance.</p>
                        <button 
                            onClick={handleCheckBalance}
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Check Balance'}
                        </button>
                    </div>
                )}
                
                {step === 4 && (
                    <div className="ml-11 bg-green-100 dark:bg-green-900 p-4 rounded-md">
                        <p className="text-green-700 dark:text-green-300 font-medium">Congratulations! You've completed all steps.</p>
                        <div className="mt-4">
                            <p><strong>Your Address:</strong> {walletStatus.address}</p>
                            <p><strong>Chain ID:</strong> {walletStatus.chainId}</p>
                            <p><strong>Balance:</strong> {walletStatus.balance?.toFixed(4)} ETH</p>
                        </div>
                        <button 
                            onClick={resetGame}
                            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Start Over
                        </button>
                    </div>
                )}
                
                {error && (
                    <div className="ml-11 bg-red-100 dark:bg-red-900 p-3 rounded-md text-red-700 dark:text-red-300 text-sm mt-2">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

const WorkingOn = ({}: { }) => {
    const [walletStatus, setWalletStatus] = useState<WalletStatus>({
        address: null,
        chainId: null,
        balance: null,
        loggedIn: false,
        apiResponse: {},
    });

    useEffect(()=> {
        const initApi = async () => {
            try {
                const apiResponse = entry();

                setWalletStatus((prev) => ({
                    ...prev,
                    apiResponse,
                }));

                if (apiResponse.windowEthereum) {
                    const accounts = await getAccounti();
                    console.log('accounts', accounts)
                    if (accounts && accounts.length > 0) {
                        setWalletStatus((prev) => ({
                            ...prev,
                            address: accounts[0],
                            chainId: apiResponse.windowChainId || "",
                            loggedIn: true,
                        }));
                    }
                }
            } catch (error) {
                console.error("Error initializing wallet:", error);
            }
        };
        initApi();
    },[])

    const handleCheckConnection = async () => {
        try {
            const apiResponse: Record<string, any> = entry();
            if (apiResponse) walletStatus.apiResponse = apiResponse;
        } catch (error) {
        console.log('error checking connection', error)
        }
    };

    window.ws = walletStatus;

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-md border mb-2">
                <div
                    onClick={handleCheckConnection}
                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-md border mb-2"
                >
                    Check Existing Connection 
                </div>

                {Object.keys(walletStatus.apiResponse).length > 0 && (
                    <div className="mt-2 p-4 min-h-[100px] rounded text-sm border text-gray-600 dark:text-gray-400">
                        <pre>{JSON.stringify(walletStatus.apiResponse, null, 2)}</pre>
                    </div>
                )}
            </div>
            
            <UserStoryWallet walletStatus={walletStatus} setWalletStatus={setWalletStatus} />
        </div>
    );
};

export default function Account(){
    const [tasks, setTasks] = useState<ListItem[]>(initialTasks);

    const handleTaskToggle = (id: string, completed: boolean) => {
        setTasks(
            tasks.map((task) => (task.id === id ? { ...task, completed } : task)),
        );
    };

    return (
        <div className="flex flex-col gap-4">
            <WorkingOn />

            <DropdownList
                title="Wallet Integration Tasks"
                items={tasks}
                onItemToggle={handleTaskToggle}
            />
        </div>
    );
}
