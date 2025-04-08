import { useWallet } from "../contexts/WalletContext";
import ThemeToggle from "./ThemeToggle";
import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import Logo from "./Logo";

const NavButton = ({
  onClick,
  color = "blue",
  children,
}: {
  onClick: () => void;
  color?: "blue" | "red" | "orange" | "purple";
  children: React.ReactNode;
}) => {
  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700",
    red: "bg-red-600 hover:bg-red-700",
    orange: "bg-orange-800 hover:bg-orange-500",
    purple: "bg-purple-600 hover:bg-purple-700",
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} text-white py-2 px-4 rounded-full transition text-sm`}
    >
      {children}
    </button>
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

          <NavButton
            onClick={() => (window.location.href = "/documentation")}
            color="purple"
          >
            Documentaion
          </NavButton>
        </div>
      </div>
    </nav>
  );
}
