import Home from './pages/Home';
import Dev from './pages/Dev';

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
    path: '/dev',
    component: Dev,
    label: 'Development',
    icon: '⚒️',
    showInNav: true,
    description: 'Tools and resources for blockchain developers'
  },
];

// Helper function to get routes for navigation
export const getNavRoutes = () => routes.filter(route => route.showInNav);
