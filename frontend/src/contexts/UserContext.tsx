import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Contract } from '@/lib/types';
import { getWallet } from '@/lib/rpc-json';
import { ethers } from 'ethers';

interface UserContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    login: () => void;
    contract: Contract | null;
    setContract: React.Dispatch<React.SetStateAction<Contract | null>>;
    updateContract: (contract?: Contract) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [contract, setContract] = useState<Contract | null>(null);

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

    // Event Listening for onChanged
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

    function updateContract(contract?: Contract) {
        if (!user || !user.address) {
            console.log("Contract reverted... no user found...");
            return;
        }

        if (!contract || !contract.address || !contract.abi) {
            console.log("Invalid contract data");
            return;
        }

        try {
            console.log(`Updating contract for user ${user.address}...`);
            console.log("Contract data:", contract);

            const ethersContract = new ethers.Contract(
                contract.address,
                contract.abi,
                user.signer
            );

            setContract({
                address: contract.address,
                chainId: contract.chainId,
                abi: contract.abi,
                instance: ethersContract,
            });

        } catch (e) {
            console.error("Error updating contract:", e);
        }
    }

    // window.uu = user;
    // window.cc = contract;
    // window.nn = user?.network;

    return (
        <UserContext.Provider value={{
            user,
            setUser,
            login: () => getWallet().then(setUser),
            contract,
            setContract,
            updateContract,
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