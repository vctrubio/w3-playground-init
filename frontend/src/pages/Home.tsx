import { useState } from "react";
import Account from "@/components/boxify/Account";
import Contract from "@/components/boxify/Contract";
import Brainstorm from "@/components/boxify/Brainstorm";
import ContractExplorer from "@/components/boxify/ContractExplorer";
import SwissKnife from "@/components/boxify/SwissKnife";
import { BoxContainer, BoxProps } from "../components/boxify/BoxInterface";

export default function Home() {
  const boxModules: BoxProps[] = [
    // {
    //   id: "contracts-box",
    //   label: "Contracts",
    //   path: "/contracts",
    //   component: Contract,
    //   theme: {
    //     dark: "bg-purple-900",
    //     light: "bg-purple-200",
    //   },
    // },

    // {
    //   id: 'brainstorm-box',
    //   label: 'Development Plan',
    //   path: '/brainstorm',
    //   component: Brainstorm,
    //   theme: {
    //     dark: 'bg-green-400',
    //     light: 'bg-green-200'
    //   }
    // },
    {
      id: 'swissknife-box',
      label: 'Ethers SwissKnife',
      path: '/swissknife',
      component: SwissKnife,
      theme: {
        dark: 'bg-yellow-800',
        light: 'bg-yellow-200'
      }
    },
    {
      id: "account-box",
      label: "Account",
      path: "/account",
      component: Account,
      theme: {
        dark: "bg-blue-900",
        light: "bg-blue-200",
      },
    }
  ];

  return (
    <div className="dark:text-white p-4 mx-auto">
      <BoxContainer modules={boxModules} />
    </div>
  );
}
