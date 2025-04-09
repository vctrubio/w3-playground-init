import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { routes } from "./routes";
import NotFound from "./components/NotFound";
import { UserProvider } from "./contexts/UserContext";


function App() {
  return (
    <UserProvider>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
