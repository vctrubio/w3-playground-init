import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { routes } from './routes';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col dark:bg-gray-900 transition-colors">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {routes.map((route) => (
              <Route 
                key={route.path} 
                path={route.path} 
                element={<route.component />} 
              />
            ))}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
