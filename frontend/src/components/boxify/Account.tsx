import { useState } from "react";
import { DropdownList, ListItem } from "@/components/DropdownList";
import { entry } from "@/lib/ethers.js"
import {
    checkExistingConnection,
    connectWallet,
    disconnectWallet,
} from "@/lib/account";

export interface AccountProps {
    onAddressChange?: (address: string) => void;
}

// Convert the existing task array to the new ListItem format
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
    address: string;
    chainId: string;
    balance: number;
    loggedIn: bool;
    apiResponse: Record<string, any>;
}

const WorkingOn = ({
    setAddress,
    onAddressChange,
}: {
    setAddress: (address: string) => void;
    onAddressChange?: (address: string) => void;
}) => {
    const [walletStatus, setWalletStatus]= useState<WalletStatus | null>(null);
    const [ftStatus, setFtStatus] = useState<string>("");

    const handleCheckConnection = async () => {
        setFtStatus("calling....");
        try {
            const apiResponse: Record<string, any> = entry();
        } catch (error) {
            setConnectionStatus(
                `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
        setFtStatus("call ended");
    };

    const HandleConnection = () => {
        return (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-md border mb-2">
                <div
                    onClick={handleCheckConnection}
                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-md border mb-2"
                >
                    Check Existing Connection
                </div>
                {ftStatus && (
                    <div className="mt-2 p-4 min-h-[100px] rounded text-sm border min-h-100 text-gray-600 dark:text-gray-400">
                        {ftStatus}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            <HandleConnection />
        </div>
    );
};

export default function Account({
    onAddressChange,
}: AccountProps): JSX.Element {
    const [address, setAddress] = useState<string>("");
    const [tasks, setTasks] = useState<ListItem[]>(initialTasks);
    const [connectionError, setConnectionError] = useState<string>("");
    const [disconnectStatus, setDisconnectStatus] = useState<string>("");

    const handleConnectWallet = async () => {
        try {
            setConnectionError("");
            const result = await connectWallet();
            setAddress(result.address);

            // Pass the address back to the parent
            if (onAddressChange) {
                onAddressChange(result.address);
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Unknown error connecting wallet";
            setConnectionError(errorMessage);
            console.error("Wallet connection error:", error);
        }
    };

    const handleDisconnectWallet = async () => {
        try {
            setDisconnectStatus("Disconnecting...");
            await disconnectWallet();
            setAddress("");
            setDisconnectStatus("Disconnected successfully");

            if (onAddressChange) {
                onAddressChange("");
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Unknown error disconnecting wallet";
            setDisconnectStatus(`Error: ${errorMessage}`);
            console.error("Wallet disconnection error:", error);
        }
    };

    const handleTaskToggle = (id: string, completed: boolean) => {
        setTasks(
            tasks.map((task) => (task.id === id ? { ...task, completed } : task)),
        );
    };

    return (
        <div className="flex flex-col gap-4">
            <WorkingOn setAddress={setAddress} onAddressChange={onAddressChange} />

            {/* <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md"> */}
            {/*     {address ? */}
            {/*         <div className="flex flex-col mb-2"> */}
            {/*             <span className="text-gray-500 dark:text-gray-400 text-sm">Connected Address:</span> */}
            {/*             <span className="font-mono text-blue-600 dark:text-blue-400">{address}</span> */}
            {/*         </div> : */}
            {/*         <div className="text-gray-500 dark:text-gray-400 mb-2">Not connected to a wallet</div> */}
            {/*     } */}
            {/**/}
            {/*     {connectionError && ( */}
            {/*         <div className="text-red-500 text-sm mb-2">{connectionError}</div> */}
            {/*     )} */}
            {/**/}
            {/*     {disconnectStatus && ( */}
            {/*         <div className="text-sm mb-2 text-gray-600 dark:text-gray-400">{disconnectStatus}</div> */}
            {/*     )} */}
            {/**/}
            {/*     <div className="flex gap-4"> */}
            {/*         <button */}
            {/*             onClick={handleConnectWallet} */}
            {/*             className="border bg-blue-500 hover:bg-blue-600 text-white w-6/12 px-4 py-2 rounded" */}
            {/*         > */}
            {/*             {address ? 'Change Address' : 'Connect Wallet'} */}
            {/*         </button> */}
            {/*         <button */}
            {/*             onClick={handleDisconnectWallet} */}
            {/*             className="border bg-gray-500 hover:bg-gray-600 text-white w-6/12 px-4 py-2 rounded" */}
            {/*             disabled={!address} */}
            {/*         > */}
            {/*             Disconnect Wallet */}
            {/*         </button> */}
            {/*     </div> */}
            {/* </div> */}

            <DropdownList
                title="Wallet Integration Tasks"
                items={tasks}
                onItemToggle={handleTaskToggle}
            />
        </div>
    );
}
