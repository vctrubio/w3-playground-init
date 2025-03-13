import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="w-8 h-8 dark:bg-blue-600 rounded-md flex items-center justify-center bg-orange-500">
        <span className="text-white font-bold text-xs">w3</span>
      </div>
    </Link>
  );
}
