import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { routes } from "./routes";
import NotFound from "./components/NotFound";

function App() {
  return (
    <>
      <Router>
        <div className="min-h-screen flex flex-col dark:bg-gray-900 transition-colors">
          <Navbar />

          <Footer />
        </div>
      </Router>
    </>
  );
}

export default App;
