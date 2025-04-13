import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Contract } from '@/lib/types';
import { getWallet } from '@/lib/rpc-json';
import { ethers } from 'ethers';
import { contractGame } from './ContractGame';
import { contractMain } from './ContractGame';
import { INFURA_PROJECT_ID } from '@/lib/rpc-network';
interface UserContextType {
    user: User | null;
    isInitializing: boolean;
    loginWithGameContract: () => void;
    contract: Contract | null;
    parentContract: Contract | null;
    socketContract: Contract | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [contract, setContract] = useState<Contract | null>(null);
    const [parentContract, setParentContract] = useState<Contract | null>(null);
    const [socketContract, setSocketContract] = useState<Contract | null>(null);

    // Initialize user on mount
    useEffect(() => {
        const initializeUser = async () => {
            try {
                const initialUser = await getWallet();
                if (initialUser) {
                    setUser(initialUser);
                    console.log("User wallet initialized automatically");
                }
            } catch (error) {
                console.error("Error initializing wallet:", error);
            } finally {
                setIsInitializing(false);
            }
        };

        initializeUser();
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
            const handleChainChanged = () => {
                console.log("Network changed, refreshing data...");
                getWallet().then(setUser);
            };

            const handleAccountsChanged = (accounts: string[]) => {
                console.log("Accounts changed:", accounts);
                if (accounts.length === 0) {
                    console.log("User disconnected wallet");
                    setUser(null);
                } else {
                    getWallet().then(setUser);
                }
            };

            window.ethereum.on('chainChanged', handleChainChanged);
            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                window.ethereum.removeListener('chainChanged', handleChainChanged);
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, [user]);

    function updateContract(contract: Contract): Contract | null {
        if (!user || !user.address) {
            console.log("Contract reverted... no user found...");
            return null;
        }

        if (!contract || !contract.address || !contract.abi) {
            console.log("Invalid contract data");
            return null;
        }

        try {
            const ethersContract = new ethers.Contract(
                contract.address,
                contract.abi,
                user.signer
            );

            return {
                ...contract,
                instance: ethersContract,
            };
        } catch (e) {
            console.error(`Error updating contract:`, e);
            return null;
        }
    }

    function setSocketOnContract(contract: Contract) {
        if (!user) {
            console.log("Socket reverted... no user found...");
            return;
        }

        //this should not be, becasue contract is required, but double checking doesnt hurt right?
        if (!contract || !contract.address || !contract.abi) {
            console.log("Socket reverted... no contract found...");
            return; // Add return statement to prevent further execution
        }

        try {
            if (INFURA_PROJECT_ID === "" || INFURA_PROJECT_ID === undefined || INFURA_PROJECT_ID === null) {
                console.log("INFURA_PROJECT_ID is not set, cannot create WebSocket provider");
                return;
            }

            const wsProvider = new ethers.WebSocketProvider(
                `wss://sepolia.infura.io/ws/v3/${INFURA_PROJECT_ID}`
            );

            const socketContractData: Contract = {
                address: contract.address,
                abi: contract.abi,
                instance: new ethers.Contract(
                    contract.address,
                    contract.abi,
                    wsProvider
                ),
                chainId: Number(contract.chainId),
            };

            setSocketContract(socketContractData);
            user.socket = wsProvider;
            console.log("WebSocket provider set up successfully");

        } catch (error) {
            console.error("Error setting up WebSocket provider:", error);
            return null;
        }
    }

    const loginWithGameContract = async () => {
        const newUser = await getWallet();
        setUser(newUser);

        if (newUser && newUser.address) {
            // Initialize the game contract (child)
            const gameContractData = updateContract({
                address: contractGame.address,
                abi: contractGame.abi,
                chainId: Number(contractGame.chainId),
            });

            // Initialize the main contract (parent)
            const mainContractData = updateContract({
                address: contractMain.address,
                abi: contractMain.abi,
                chainId: Number(contractMain.chainId),
            });

            if (gameContractData) {
                setContract(gameContractData);
            } else {
                console.log("Game contract not found... Problematic");
            }

            if (mainContractData) {
                setParentContract(mainContractData);
                setSocketOnContract(mainContractData);
            } else {
                console.log("Parent contract not found, so no web socket provider");
            }

            console.log("User logged in!!");
        } else {
            console.log("Failed to get user wallet for contract login");
        }
    };

    window.uu = user;
    window.cc = contract;
    window.pc = parentContract;
    window.sc = socketContract;

    return (
        <UserContext.Provider value={{
            user,
            isInitializing,
            contract,
            parentContract,
            socketContract,
            loginWithGameContract,
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};