import React from 'react';

function User() {
  // Hardcoded values to display
  const userData = {
    account: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    balance: '1.234 ETH',
    network: 'Ethereum Mainnet',
    contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Wallet Information</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        {Object.entries(userData).map(([label, value]) => (
          <div key={label} className="mb-3 pb-3 border-b dark:border-gray-700 last:border-b-0">
            <p className="text-sm text-gray-500 capitalize">{label}</p>
            <p className="font-mono font-medium truncate">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default User;
