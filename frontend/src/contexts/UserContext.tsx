import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Contract } from '@/lib/types';
import { getWallet } from '@/lib/rpc-json';
import { ethers } from 'ethers';
import { contractGame } from './ContractGame';
import { contractMain } from './ContractGame';
import { INFURA_PROJECT_ID } from '@/lib/rpc-network';
interface UserContextType {
    user: User | null;
    loginWithGameContract: () => void;
    contract: Contract | null;
    parentContract: Contract | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [contract, setContract] = useState<Contract | null>(null);
    const [parentContract, setParentContract] = useState<Contract | null>(null);

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

    function updateContract(contract?: Contract, isParentContract: boolean = false) {
        if (!user || !user.address) {
            console.log("Contract reverted... no user found...");
            return;
        }

        if (!contract || !contract.address || !contract.abi) {
            console.log("Invalid contract data");
            return;
        }

        try {
            const ethersContract = new ethers.Contract(
                contract.address,
                contract.abi,
                user.signer
            );

            const contractData = {
                ...contract,
                instance: ethersContract,
            };

            if (isParentContract) {
                setParentContract(contractData);
            } else {
                setContract(contractData);
            }

        } catch (e) {
            console.error(`Error updating ${isParentContract ? 'parent' : 'child'} contract:`, e);
        }
    }

    function setSocket() {
        if (!user) {
            console.log("Socket reverted... no user found...");
            return;
        }

        try {
            const wsProvider = new ethers.WebSocketProvider(
                `wss://sepolia.infura.io/ws/v3/${INFURA_PROJECT_ID}`
            );
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
            updateContract({
                address: contractGame.address,
                abi: contractGame.abi,
                chainId: Number(contractGame.chainId),
            }, false);

            // Initialize the main contract (parent)
            updateContract({
                address: contractMain.address,
                abi: contractMain.abi,
                chainId: Number(contractMain.chainId),
            }, true);

            setSocket();
            console.log("User logged in with game and parent contracts");
        } else {
            console.log("Failed to get user wallet for contract login");
        }
    };

    window.uu = user;
    window.cc = contract;
    window.pc = parentContract;

    return (
        <UserContext.Provider value={{
            user,
            contract,
            parentContract,
            loginWithGameContract
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