import { Link } from 'react-router-dom';
import { routes } from '../routes';

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-6 dark:text-white">Page Not Found</h2>
      <p className="text-lg mb-8 dark:text-gray-300">The page you're looking for doesn't exist or has been moved.</p>
      
      <div className="max-w-lg mx-auto">
        <h3 className="text-xl font-medium mb-4 dark:text-white">Available Routes:</h3>
        <ul className="space-y-3">
          {routes.map((route) => (
            <li key={route.path}>
              <Link 
                to={route.path} 
                className="block p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md 
                  hover:shadow-lg hover:scale-105 transform transition-all duration-300 
                  hover:bg-blue-50 dark:hover:bg-gray-700 dark:text-white"
              >
                {route.path === "/" ? "Home" : route.path.replace(/^\//, '').charAt(0).toUpperCase() + route.path.replace(/^\//, '').slice(1)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotFound;
