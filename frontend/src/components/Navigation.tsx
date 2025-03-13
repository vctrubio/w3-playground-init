import { Link } from 'react-router-dom';
import { getNavRoutes } from '../routes';

export default function Navigation() {
  const navRoutes = getNavRoutes();
  
  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Navigate the App
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
          Explore different sections of the application to interact with Ethereum blockchain, manage contracts, and more.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {navRoutes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md hover:shadow-lg transition flex flex-col h-full"
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{route.icon}</span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{route.label}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 flex-grow">
                {route.description}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-600 flex justify-end">
                <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium">
                  Visit {route.label}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
