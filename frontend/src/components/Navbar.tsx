import { useWallet } from '../contexts/WalletContext';
import ThemeToggle from './ThemeToggle';
import { Link, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import Logo from './Logo';

export default function Navbar() {
  const { account, isConnected, balance, connectWallet, disconnectWallet } = useWallet();
  const location = useLocation();
  
  // Generate breadcrumb segments from current path
  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Start with home 
    const crumbs = [{ path: '/', label: 'Home' }];
    
    // Build up the paths for each segment
    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      // Capitalize the first letter of each segment
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      crumbs.push({ path: currentPath, label });
    });
    
    return crumbs;
  }, [location.pathname]);

  const isHomePage = location.pathname === '/';

  return (
    <nav className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow p-4 transition-colors">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Logo is always visible */}
          <Logo />
          
          {/* Show breadcrumb path if not on home page */}
          {!isHomePage && (
            <div className="flex items-center ml-4">
              <span className="text-gray-400 dark:text-gray-500 mx-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <div className="flex items-center">
                {breadcrumbs.slice(1).map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center">
                    {index > 0 && (
                      <span className="mx-2 text-gray-400 dark:text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    )}
                    <Link 
                      to={crumb.path}
                      className={`${
                        index === breadcrumbs.length - 2 
                          ? 'text-gray-900 dark:text-white font-medium' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    >
                      {crumb.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
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
