import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';

// Import pages
import Dashboard from './pages/Dashboard';
import ActivePool from './pages/ActivePool';
import Contribute from './pages/Contribute';
import History from './pages/History';
import AdminComplete from './pages/AdminComplete';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Wallet from './pages/Wallet';
import PoolDetails from './pages/PoolDetails';
import PoolTrades from './pages/PoolTrades';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import VerifyEmail from './pages/VerifyEmail';

// Test pages (keep for debugging)
import TestPage from './pages/TestPage';
import TestTrades from './pages/TestTrades';

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
          <div className="min-h-screen flex flex-col bg-[#0a0e0f]">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Home is now Dashboard */}
                <Route path="/" element={<Dashboard />} />
                
                {/* Dashboard route (redirects to home or keep as alias) */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Main routes */}
                <Route path="/pools/active" element={<ActivePool />} />
                <Route path="/contribute" element={<Contribute />} />
                <Route path="/history" element={<History />} />
                <Route path="/admin" element={<AdminComplete />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/pool/:id/details" element={<PoolDetails />} />
                <Route path="/pool/:id/trades" element={<PoolTrades />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/verify-email/:code" element={<VerifyEmail />} />
                
                {/* Test routes */}
                <Route path="/test/:poolId" element={<TestTrades />} />
                <Route path="/test" element={<TestPage />} />
                
                {/* 404 - Keep last */}
                <Route path="*" element={<NotFound />} />
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