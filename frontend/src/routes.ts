import Home from './pages/Home';

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
    icon: '^',
    showInNav: true,
    description: 'Welcome page with key features and information'
  },

];

// Helper function to get routes for navigation
export const getNavRoutes = () => routes.filter(route => route.showInNav);
