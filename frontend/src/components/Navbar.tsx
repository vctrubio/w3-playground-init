import { useWallet } from '../contexts/WalletContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { account, isConnected, balance, connectWallet, disconnectWallet } = useWallet();

  return (
    <nav className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow p-4 transition-colors">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">W3Brb</h1>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {isConnected ? (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {balance.substring(0, 6)} ETH
                </span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2">
                <span className="text-sm">
                  {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
                </span>
              </div>
              <button
                onClick={disconnectWallet}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full text-sm transition"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full transition"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
