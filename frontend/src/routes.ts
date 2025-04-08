import Home from './pages/Home';
import Documentation from './pages/Dicumentation';

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
    path: '/Documentation',
    component: Documentation,
    label: 'Documentation',
    icon: '⚒️',
    showInNav: true,
    description: 'What i Did'
  },
];

// Helper function to get routes for navigation
export const getNavRoutes = () => routes.filter(route => route.showInNav);
