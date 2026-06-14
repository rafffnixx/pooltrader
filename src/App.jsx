import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';

// Import pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ActivePool from './pages/ActivePool';
import Contribute from './pages/Contribute';
import History from './pages/History';
import AdminComplete from './pages/AdminComplete';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Customers from './pages/Customers';
import PoolTrades from './pages/PoolTrades';
import Wallet from './pages/Wallet';
import PoolDetails from './pages/PoolDetails';








// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import context
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pools/active" element={<ActivePool />} />
                <Route path="/contribute" element={<Contribute />} />
                <Route path="/history" element={<History />} />
                <Route path="/admin" element={<AdminComplete />} />

                <Route path="/customers" element={<Customers />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/pools/active/:id" element={<ActivePool />} />
                <Route path="/pools/active" element={<ActivePool />} />
                <Route path="/pool/:poolId/trades" element={<PoolTrades />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/pool/:id/details" element={<PoolDetails />} />



              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;