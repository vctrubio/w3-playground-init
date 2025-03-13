import { useState } from 'react';
import Account from '@/components/boxify/Account';
import Contract from '@/components/boxify/Contract';
import Brainstorm from '@/components/boxify/Brainstorm';
import { BoxContainer, BoxProps } from '../components/boxify/BoxInterface';

export default function Home() {
  const [accountAddress, setAccountAddress] = useState<string>('');
  const [tasks, setTasks] = useState<any[]>([]);

  const handleAccountData = (address: string) => {
    setAccountAddress(address);
    console.log("Address received in parent:", address);
  };

  const handleTasksChange = (updatedTasks: any[]) => {
    setTasks(updatedTasks);
    console.log("Tasks updated:", updatedTasks);
  };

  const boxModules: BoxProps[] = [

    {
      id: 'account-box',
      label: 'Account',
      path: '/account',
      component: Account,
      onAddressChange: handleAccountData,
      theme: {
        dark: 'bg-blue-900',
        light: 'bg-blue-200'
      }
    },
    {
      id: 'contracts-box',
      label: 'Contracts',
      path: '/contracts',
      component: Contract,
      theme: {
        dark: 'bg-purple-900',
        light: 'bg-purple-200'
      }
    },
    {
      id: 'brainstorm-box',
      label: 'Development Plan',
      path: '/brainstorm',
      component: Brainstorm,
      onTaskChange: handleTasksChange,
      theme: {
        dark: 'bg-green-400',
        light: 'bg-green-200'
      }
    }
  ];

  return (
    <div className='dark:text-white p-4 mx-auto'>
      <BoxContainer modules={boxModules} />
    </div>
  );
}
