export default function Documentation() {
  return (
    <div>
      <div className="mx-auto px-4 py-8">
        {/* Developer resources section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Developer Resources</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <a
              href="https://docs.ethers.org/v6/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Ethers.js Documentation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">JavaScript library for interacting with the Ethereum blockchain</p>
            </a>
            
            <a
              href="https://hardhat.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Hardhat Documentation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Ethereum development environment for professionals</p>
            </a>
            
            <a
              href="https://docs.soliditylang.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Solidity Documentation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Official documentation for the Solidity language</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
