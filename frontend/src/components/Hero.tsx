import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="bg-blue-50 dark:bg-gray-800 py-20 transition-colors">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 text-center max-w-3xl mb-10">
          Hello world into web3, using ethers and hardhat/foundry
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            to="/dashboard" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center"
          >
            <span>Go to Dashboard</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
