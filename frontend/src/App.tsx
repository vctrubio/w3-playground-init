import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { routes } from './routes';
import NotFound from './components/NotFound';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { configRainbow } from './configs/rainbow';

import {
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <WagmiProvider config={configRainbow}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <Router>
              <div className="min-h-screen flex flex-col dark:bg-gray-900 transition-colors">
                <Navbar />
               
                <Footer />
              </div>
            </Router>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default App;

