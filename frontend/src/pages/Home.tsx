import Game from "@/components/boxify/Game";
import ContractABI from "@/components/boxify/ContractABI";
import ContractEvent from "@/components/boxify/ContractEvent";
import User from "@/components/boxify/User";
import { BoxContainer, BoxProps } from "../components/boxify/BoxInterface";
import { useState } from "react";
import { UserProvider } from "@/contexts/UserContext";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); //false for deployment...

  const handleLogin = () => {
    console.log("User attempting to login");
    setIsLoggedIn(true);
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
      id: "user-box",
      label: "User Profile",
      component: User,
      theme: {
        dark: "bg-yellow-800",
        light: "bg-yellow-200",
      },
    },
    {
      id: "contract-abi-box",
      label: "Contract ABI",
      component: ContractABI,
      theme: {
        dark: "bg-blue-800",
        light: "bg-blue-200",
      },
    },
    {
      id: "contract-event-box",
      label: "Contract Events",
      component: ContractEvent,
      theme: {
        dark: "bg-purple-800",
        light: "bg-purple-200",
      },
    },
    {
      id: "game-box",
      label: "Game",
      component: Game,
      theme: {
        dark: "bg-green-800",
        light: "bg-green-200",
      },
    },

  ];

  return (
    <UserProvider>
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
    </UserProvider>
  );
}