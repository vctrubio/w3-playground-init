import ThemeToggle from "./ThemeToggle";
import { Link, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import Logo from "./Logo";
import { useUser } from "@/contexts/UserContext";

const NavButton = () => {
  const { user } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleNetworkClick = (networkId: number) => {
    console.log(`Selected network ID: ${networkId}`);
    setShowDropdown(false);
  };

  const handleClick = () => {
    if (user) {
      setShowDropdown(!showDropdown);
    } else {
      // Navigate to documentation if no user
      window.location.href = "/documentation";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-full transition text-sm flex items-center"
      >
        {user ? (
          <>
            Chain: {user.network.id}
          </>
        ) : (
          "Documentation"
        )}
      </button>

      {showDropdown && user && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1">
          <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-700">
            Select Network
          </div>
          {[1, 2, 3].map((id) => (
            <div
              key={id}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => handleNetworkClick(id)}
            >
              Network {id}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Breadcrumbs = () => {
  const location = useLocation();

  // Generate breadcrumb segments from current path
  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);

    // Start with home
    const crumbs = [{ path: "/", label: "Home" }];

    // Build up the paths for each segment
    let currentPath = "";
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      // Capitalize the first letter of each segment
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      crumbs.push({ path: currentPath, label });
    });

    return crumbs;
  }, [location.pathname]);

  if (location.pathname === "/") {
    return null;
  }

  return (
    <div className="flex items-center ml-4">
      <span className="text-gray-400 dark:text-gray-500 mx-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </span>
      <div className="flex items-center">
        {breadcrumbs.slice(1).map((crumb, index) => (
          <div key={crumb.path} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400 dark:text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            )}
            <Link
              to={crumb.path}
              className={`${index === breadcrumbs.length - 2
                ? "text-gray-900 dark:text-white font-medium"
                : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
            >
              {crumb.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow p-4 transition-colors">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Logo />
          <Breadcrumbs />
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <NavButton />
        </div>
      </div>
    </nav>
  );
}
