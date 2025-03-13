import { ReactNode } from 'react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Dev from './pages/Dev'; // Import the new Dev component

// Define the route type
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  label: string;
  icon?: string;
  showInNav?: boolean;
  description?: string;
}

// Define all application routes
export const routes: RouteConfig[] = [
  {
    path: '/',
    component: Home,
    label: 'Home',
    icon: '🏠',
    showInNav: true,
    description: 'Welcome page with key features and information'
  },
  {
    path: '/dashboard',
    component: Dashboard,
    label: 'Dashboard',
    icon: '📊',
    showInNav: true,
    description: 'Interact with smart contracts and manage your wallet'
  },
  {
    path: '/dev',
    component: Dev,
    label: 'Development',
    icon: '⚒️',
    showInNav: true,
    description: 'Tools and resources for blockchain developers'
  },
  // Add more routes as needed
];

// Helper function to get routes for navigation
export const getNavRoutes = () => routes.filter(route => route.showInNav);
