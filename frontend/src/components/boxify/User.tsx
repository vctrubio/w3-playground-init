import { useState } from 'react';

interface UserProfile {
  address: string;
  ens?: string;
  balance: string;
  transactions: number;
  joinedDate: Date;
}

function User() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const fetchUserProfile = () => {
    if (!address) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockProfile: UserProfile = {
        address: address,
        ens: address === '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' ? 'vitalik.eth' : undefined,
        balance: (Math.random() * 100).toFixed(4) + ' ETH',
        transactions: Math.floor(Math.random() * 1000),
        joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      };
      setProfile(mockProfile);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Ethereum Address</label>
        <div className="flex gap-2">
          <input 
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder="0x..."
            className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
          />
          <button 
            onClick={fetchUserProfile}
            disabled={isLoading || !address}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Lookup'}
          </button>
        </div>
      </div>
      
      {profile && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="mb-3">
            {profile.ens && (
              <h3 className="text-lg font-bold">{profile.ens}</h3>
            )}
            <p className="text-sm text-gray-500 font-mono truncate">{profile.address}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="font-semibold">{profile.balance}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Transactions</p>
              <p className="font-semibold">{profile.transactions}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t dark:border-gray-700">
            <p className="text-sm text-gray-500">Member since</p>
            <p>{profile.joinedDate.toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default User;
