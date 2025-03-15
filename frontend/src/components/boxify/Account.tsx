import { useState, useEffect } from "react";
import { DropdownList, ListItem } from "@/components/DropdownList";
import { entry, getAccounti } from "@/lib/windowEthereum.js";
import AccountUserStory from "./AccountUserStory";
import { User } from "@/lib/types";

interface WorkingOnProps {
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User>>;
}

const initialTasks: ListItem[] = [
    {
        id: "task-1",
        text: "Connect to wallet using X library.",
        completed: true,
    },
    {
        id: "task-2",
        text: "Be able to sign out, sign back in with previouse wallet, or last wallet",
        completed: true,
    },
    { id: "task-3", text: "Be able to see address of wallet", completed: true },
    { id: "task-4", text: "Be able to see balance of wallet", completed: true },
    {
        id: "task-5",
        text: "Be able to see transaction history of wallet",
        completed: false, //not tested... loading but not returning last 5....
    },
    { id: "task-6", text: "Be able to see network of wallet", completed: true },
    {
        id: "task-7",
        text: "Be able to see block number of wallet",
        completed: true,
    },
    {
        id: "task-8",
        text: "Be able to see block hash of wallet",
        completed: true,
    },
];

const WorkingOn = ({ user, setUser }: WorkingOnProps) => {
    useEffect(() => {
        const initApi = async () => {
            try {
                const apiResponse = entry();

                setUser((prev) => ({
                    ...prev,
                    wallet: {
                        ...prev.wallet,
                        apiResponse,
                    }
                }));

                if (apiResponse.windowEthereum) {
                    const accounts = await getAccounti();
                    // console.log('accounts...', accounts)
                    if (accounts && accounts.length > 0) {
                        setUser((prev) => ({
                            ...prev,
                            loggedIn: true,
                            wallet: {
                                ...prev.wallet,
                                address: accounts[0],
                                chainId: apiResponse.windowChainId || "",
                            }
                        }));
                    }
                }
            } catch (error) {
                console.error("Error initializing wallet:", error);
            }
        };
        initApi();
    }, [])

    const handleCheckConnection = async () => {
        try {
            const apiResponse: Record<string, any> = entry();
            if (apiResponse) {
                setUser(prev => ({
                    ...prev,
                    wallet: {
                        ...prev.wallet,
                        apiResponse
                    }
                }));
            }
        } catch (error) {
            console.log('error checking connection', error)
        }
    };


    return (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-md border mb-2">
            <div
                onClick={handleCheckConnection}
                className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-md border mb-2"
            >
                Check Existing Connection
            </div>

            <div className="mb-2">
                <p><strong>IP Address:</strong> {user.ipAddress}</p>
                <p><strong>Login Status:</strong> {user.loggedIn ? 'Logged In' : 'Not Logged In'}</p>
            </div>

            {Object.keys(user.wallet).length > 0 && (
                <div className="mt-2 p-4 min-h-[100px] rounded text-sm border text-gray-600 dark:text-gray-400">
                    <pre>{JSON.stringify(user, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default function Account() {
    const [user, setUser] = useState<User>({
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        loggedIn: false,
        wallet: {
            address: null,
            chainId: null,
            balance: null,
            apiResponse: {},
            blockNumber: undefined,
            blockHash: undefined,
            transactions: undefined,
        }
    });
    const [tasks, setTasks] = useState<ListItem[]>(initialTasks);

    window.ws = user.wallet;
    return (
        <div className="flex flex-col gap-4">
            <WorkingOn user={user} setUser={setUser} />

            <AccountUserStory user={user} setUser={setUser} />

            <DropdownList
                title="Wallet Integration Tasks"
                items={tasks}
                onItemToggle={(id, completed) => {
                    setTasks(
                        tasks.map((task) => (task.id === id ? { ...task, completed } : task)),
                    );
                }}
            />
        </div>
    );
}
