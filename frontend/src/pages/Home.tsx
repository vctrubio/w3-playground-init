import { useState, useEffect } from "react";
import Game from "@/components/boxify/Game";
import User from "@/components/boxify/User";
import ContractABI from "@/components/boxify/ContractABI";
import ContractEvent from "@/components/boxify/ContractEvent";
import { BoxContainer, BoxProps } from "../components/boxify/BoxInterface";
import { getIsWeb3 } from "@/lib/rpc-json";
import { useNotifications } from "@/contexts/NotificationContext";
import { useUser } from "@/contexts/UserContext";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
    // showNotification("Successfully connected to wallet", "success");
  };

  // useEffect(() => {
  //   handleLogin();
  // }, []);

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
            <BoxContainer modules={boxModules} />
          </div>
        )}
      </div>
    </>
  );
}