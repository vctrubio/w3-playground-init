import ZHelloWorld from "@/components/boxify/Wallet";
import Game from "@/components/boxify/Game";
import { BoxContainer, BoxProps } from "../components/boxify/BoxInterface";
import { useState } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
      id: "hello-world-box",
      label: "Hello World",
      component: ZHelloWorld,
      theme: {
        dark: "bg-red-800",
        light: "bg-red-200",
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
    <div className="dark:text-white p-4 mx-auto min-h-screen flex flex-col items-center justify-center">
      {!isLoggedIn ? (
        <button
          onClick={() => setIsLoggedIn(true)}
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
  );
}