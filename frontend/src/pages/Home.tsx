import { useState, useEffect } from "react";
import Game from "@/components/boxify/Game";
import User from "@/components/boxify/User";
import ContractABI from "@/components/boxify/ContractABI";
import ContractEvent from "@/components/boxify/ContractEvent";
import { BoxContainer, BoxProps } from "../components/boxify/BoxInterface";
import { getIsWeb3 } from "@/lib/rpc-json";
import { useNotifications } from "@/contexts/NotificationContext";
import { useUser } from "@/contexts/UserContext";
import { switchNetwork, networkChains } from "@/lib/rpc-network";

// NetworkCheck component to verify and prompt for Sepolia network
function NetworkCheck({ onNetworkCorrect }: { onNetworkCorrect: (isCorrect: boolean) => void }) {
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotifications();
  const { user } = useUser();

  const SEPOLIA_CHAIN_ID = "11155111";

  // Check if user is on Sepolia network
  useEffect(() => {
    if (user?.network?.id) {
      const isCorrect = user.network.id === SEPOLIA_CHAIN_ID;
      setIsCorrectNetwork(isCorrect);
      onNetworkCorrect(isCorrect);
    }
  }, [user?.network?.id, onNetworkCorrect, SEPOLIA_CHAIN_ID]);

  // Handle network switch without page reload
  const handleSwitchNetwork = async () => {
    setIsLoading(true);
    try {
      const result = await switchNetwork(SEPOLIA_CHAIN_ID);
      showNotification(result.message, result.type || "info");

      // Don't reload the page, let the effect handle the network change
      if (result.success) {
        // Give MetaMask a moment to update the network info
        setTimeout(() => {
          // The useEffect will detect network change and update UI
        }, 500);
      }
    } catch (error) {
      console.error("Error switching network:", error);
      showNotification("Failed to switch network. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // If still checking or on correct network, don't show anything
  if (isCorrectNetwork === null || isCorrectNetwork === true) {
    return null;
  }

  return (
    <div className="w-full mb-6 p-4 rounded-lg border-2 border-orange-500 dark:border-blue-700 bg-orange-100 dark:bg-slate-800 text-center">
      <h3 className="text-lg font-semibold mb-2 text-orange-800 dark:text-blue-300">
        Network Requirement
      </h3>
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        This game requires you to be on the Sepolia test network.
      </p>
      <button
        onClick={handleSwitchNetwork}
        disabled={isLoading}
        className={`px-6 py-2 rounded-md font-medium transition-all
          ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-600 dark:hover:bg-blue-800'}
          bg-orange-500 dark:bg-blue-700 text-white`}
      >
        {isLoading ? 'Switching...' : 'Switch to Sepolia Network'}
      </button>
    </div>
  );
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNetworkCorrect, setIsNetworkCorrect] = useState<boolean | null>(null);
  const { showNotification } = useNotifications();
  const { loginWithGameContract } = useUser();

  const handleLogin = async () => {
    console.log("User attempting to login");

    if (!getIsWeb3()) {
      showNotification("No Web3 provider found. Please install MetaMask.", "error");
      return;
    }

    try {
      await loginWithGameContract();
    } catch (error) {
      showNotification("Login failed. Please try again.", "error");
      return;
    }

    setIsLoggedIn(true);
    showNotification("Successfully connected to wallet", "success");
  };

  /**
   * BoxModules Configuration:
   * - id: Unique identifier for the box, used for DOM identification
   * - label: Display name shown to users in the UI
   * - component: React component to render inside the box
   * - theme: Styling configuration for the box
   *   - dark: CSS class for dark mode
   *   - light: CSS class for light mode
   */
  const boxModules: BoxProps[] = [
    {
      id: "user",
      label: "User Profile",
      component: User,
      theme: {
        dark: "bg-red-800",
        light: "bg-yellow-200",
      },
    },
    {
      id: "game",
      label: "Game",
      component: Game,
      theme: {
        dark: "bg-green-800",
        light: "bg-green-200",
      },
    },
    {
      id: "event",
      label: "Contract Events",
      component: ContractEvent,
      theme: {
        dark: "bg-purple-800",
        light: "bg-purple-200",
      },
    },

    {
      id: "contract",
      label: "Contract ABI",
      component: ContractABI,
      theme: {
        dark: "bg-blue-800",
        light: "bg-blue-200",
      },
    },
  ];

  return (
    <>
      <div className="dark:text-white p-4 mx-auto min-h-screen flex flex-col items-center justify-center">
        {!isLoggedIn ? (
          <button
            onClick={handleLogin}
            className="px-8 py-3 text-lg font-semibold rounded-lg 
          bg-orange-500 dark:bg-blue-700 text-white
          hover:bg-orange-800 dark:hover:bg-black
          transform transition-all duration-300 
                      animate-bounce hover:animate-none
                      shadow-lg dark:shadow-blue-900/50"
          >
            Sign In
          </button>
        ) : (
          <div className="w-full animate-fadeIn">
            <NetworkCheck onNetworkCorrect={setIsNetworkCorrect} />
            {isNetworkCorrect && <BoxContainer modules={boxModules} />}
          </div>
        )}
      </div>
    </>
  );
}