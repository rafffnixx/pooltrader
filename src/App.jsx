import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Test pages
import TestPage from './pages/TestPage';
import TestTrades from './pages/TestTrades';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import context
import { AuthProvider, useAuth } from './context/AuthContext';

// ============================================
// PROTECTED ROUTE COMPONENT
// ============================================
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
                    <p className="text-[#a0b4b8]">Loading...</p>
                </div>
            </div>
        );
    }
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        console.log('🔒 Not authenticated, redirecting to login');
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

// ============================================
// ADMIN ROUTE COMPONENT
// ============================================
const AdminRoute = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
                    <p className="text-[#a0b4b8]">Loading...</p>
                </div>
            </div>
        );
    }
    
    if (!isAuthenticated) {
        console.log('🔒 Not authenticated, redirecting to login');
        return <Navigate to="/login" replace />;
    }
    
    if (!user?.isAdmin) {
        console.log('🔒 Not admin, redirecting to dashboard');
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
};

// ============================================
// PUBLIC ROUTE (Redirects if already logged in)
// ============================================
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
                    <p className="text-[#a0b4b8]">Loading...</p>
                </div>
            </div>
        );
    }
    
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
};

// ============================================
// APP COMPONENT
// ============================================
function App() {
    return (
        <HelmetProvider>
            <AuthProvider>
                <Router>
                    <div className="min-h-screen flex flex-col bg-[#0a0e0f]">
                        <Navbar />
                        <main className="flex-grow">
                            <Routes>
                                {/* Public Routes - Anyone can access */}
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/faq" element={<FAQ />} />
                                <Route path="/privacy" element={<Privacy />} />
                                <Route path="/terms" element={<Terms />} />
                                
                                {/* Auth Routes - Redirect to dashboard if logged in */}
                                <Route path="/login" element={
                                    <PublicRoute>
                                        <Login />
                                    </PublicRoute>
                                } />
                                <Route path="/register" element={
                                    <PublicRoute>
                                        <Register />
                                    </PublicRoute>
                                } />
                                <Route path="/forgot-password" element={
                                    <PublicRoute>
                                        <ForgotPassword />
                                    </PublicRoute>
                                } />
                                <Route path="/reset-password/:token" element={<ResetPassword />} />
                                <Route path="/verify-email/:code" element={<VerifyEmail />} />
                                
                                {/* Protected Routes - Require Authentication */}
                                <Route path="/pools/active" element={
                                    <ProtectedRoute>
                                        <ActivePool />
                                    </ProtectedRoute>
                                } />
                                <Route path="/contribute" element={
                                    <ProtectedRoute>
                                        <Contribute />
                                    </ProtectedRoute>
                                } />
                                <Route path="/history" element={
                                    <ProtectedRoute>
                                        <History />
                                    </ProtectedRoute>
                                } />
                                <Route path="/wallet" element={
                                    <ProtectedRoute>
                                        <Wallet />
                                    </ProtectedRoute>
                                } />
                                <Route path="/pool/:id/details" element={
                                    <ProtectedRoute>
                                        <PoolDetails />
                                    </ProtectedRoute>
                                } />
                                
                                {/* Admin Routes - Require Admin */}
                                <Route path="/admin" element={
                                    <AdminRoute>
                                        <AdminComplete />
                                    </AdminRoute>
                                } />
                                <Route path="/pool/:id/trades" element={
                                    <AdminRoute>
                                        <PoolTrades />
                                    </AdminRoute>
                                } />
                                
                                {/* Test Routes */}
                                <Route path="/test/:poolId" element={<TestTrades />} />
                                <Route path="/test" element={<TestPage />} />
                                
                                {/* 404 */}
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