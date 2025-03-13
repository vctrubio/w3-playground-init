import { useState } from 'react';
import Account from '@/components/boxify/Account';
import Contracts from '@/components/boxify/Contrac';

import { BoxContainer, BoxProps } from '../components/boxify/BoxInterface';
export default function Home() {
  const [accountAddress, setAccountAddress] = useState<string>('');

  const handleAccountData = (address: string) => {
    setAccountAddress(address);
    console.log("Address received in parent:", address);
  };
  
  const boxModules: BoxProps[] = [
    {
      id: 'account-box',
      label: 'Account',
      path: '/account',
      component: Account,
      onAddressChange: handleAccountData, // Directly included in props
      theme: {
        dark: 'bg-blue-900',
        light: 'bg-blue-200'
      }
    },
    {
      id: 'contracts-box',
      label: 'Contracts',
      path: '/contracts',
      // component: () => <>Contract Information</>,
      component: Contracts,
      theme: {
        dark: 'bg-purple-900',
        light: 'bg-purple-200'
      }
    },
  ];

  return (
    <div className='container dark:text-white border p-4 mx-auto'>
      <BoxContainer modules={boxModules} />
    </div>
  );
}
