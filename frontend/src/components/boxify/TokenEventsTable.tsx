import React from 'react';
import { getTokenById } from '@/lib/types';

interface TokenOwnership {
  address: string;
  total: number;
}

interface TokenOwnerships {
  [tokenId: number]: TokenOwnership[];
}

interface RawEvent {
  address: string;
  tokenId: number;
  amount: number;
  type: 'mint' | 'burn';
}

interface TokenEventsTableProps {
  tokenEvents: TokenOwnerships;
  rawEvents?: RawEvent[];
  userAddress?: string; // Add new prop for user address
}

// Utility function to calculate mint and burn amounts for each address and token
const calculateMintBurn = (rawEvents: RawEvent[], tokenId: number, address: string) => {
  let minted = 0;
  let burned = 0;

  rawEvents?.forEach(event => {
    if (event.tokenId === tokenId && event.address === address) {
      if (event.type === 'mint') {
        minted += event.amount;
      } else if (event.type === 'burn') {
        burned += event.amount;
      }
    }
  });

  return { minted, burned };
};

export const TokenEventsTable: React.FC<TokenEventsTableProps> = ({ tokenEvents, rawEvents = [], userAddress }) => {
  // Function to check if an address is the user's address
  const isUserAddress = (address: string): boolean => {
    return userAddress ? address.toLowerCase() === userAddress.toLowerCase() : false;
  };

  return (
    <div className="mt-4">
      {Object.keys(tokenEvents).length === 0 ? (
        <p>No token events found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="py-2 px-4 border-b border-r border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">Token</th>
                <th className="py-2 px-4 border-b border-r border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">Address</th>
                <th className="py-2 px-4 border-b border-r border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">Minted</th>
                <th className="py-2 px-4 border-b border-r border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">Burned</th>
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(tokenEvents).flatMap(([tokenId, ownerships]) => {
                const token = getTokenById(Number(tokenId));
                return ownerships.map((ownership, index) => {
                  const { minted, burned } = calculateMintBurn(rawEvents, Number(tokenId), ownership.address);
                  const isUser = isUserAddress(ownership.address);
                  
                  // Apply special styling for the user's address
                  const addressClass = isUser 
                    ? "py-2 px-4 border-b border-r border-gray-200 dark:border-gray-600 font-mono text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    : "py-2 px-4 border-b border-r border-gray-200 dark:border-gray-600 font-mono text-sm text-gray-800 dark:text-gray-200";
                  
                  const tokenStyle = { 
                    backgroundColor: `${token.color}20`,
                    borderLeft: `3px solid ${token.color}`
                  };
                  
                  return (
                    <tr key={`${tokenId}-${ownership.address}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {index === 0 ? (
                        <td className="py-2 px-4 border-b border-r border-gray-200 dark:border-gray-600 font-semibold text-gray-800 dark:text-gray-200" 
                            style={tokenStyle} 
                            rowSpan={ownerships.length}>
                          {token.name}
                        </td>
                      ) : null}
                      <td className={addressClass}>
                        {ownership.address.substring(0, 6)}...{ownership.address.substring(ownership.address.length - 4)}
                        {isUser && <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">You</span>}
                      </td>
                      <td className="py-2 px-4 border-b border-r border-gray-200 dark:border-gray-600 text-center text-gray-800 dark:text-gray-200">{minted}</td>
                      <td className="py-2 px-4 border-b border-r border-gray-200 dark:border-gray-600 text-center text-gray-800 dark:text-gray-200">{burned}</td>
                      <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-center font-semibold text-gray-800 dark:text-gray-200">{ownership.total}</td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TokenEventsTable;
