import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            await login(email, password);
            toast.success('Login successful! Welcome back!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <SEO title="Login - PoolTrader" description="Login to your trading pool account" />
            
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0a0e0f]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e0f] via-[#0a0e0f] to-[#00d4aa]/5"></div>
                <div className="relative z-10 max-w-md w-full space-y-8">
                    {/* Logo */}
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,212,170,0.2)]">
                                <svg className="w-12 h-12 text-[#0a0e0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold text-[#e8f0f0] mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-[#a0b4b8]">Sign in to your trading account</p>
                    </div>
                    
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[#a0b4b8] text-sm block mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#1c2426] border border-[#2a3538] rounded-xl text-[#e8f0f0] placeholder-[#6a7e82] focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-transparent transition"
                                    placeholder="admin@tradingpool.com"
                                />
                            </div>
                            <div>
                                <label className="text-[#a0b4b8] text-sm block mb-2">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#1c2426] border border-[#2a3538] rounded-xl text-[#e8f0f0] placeholder-[#6a7e82] focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-transparent transition"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex justify-end">
                            <Link 
                                to="/forgot-password" 
                                className="text-sm text-[#00d4aa] hover:text-[#33ddbb] transition font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-[#00d4aa] to-[#00b894] text-[#0a0e0f] font-semibold rounded-xl hover:shadow-[0_8px_30px_rgba(0,212,170,0.35)] focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:ring-offset-2 focus:ring-offset-[#0a0e0f] transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0a0e0f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign in'}
                        </button>

                        <div className="text-center">
                            <p className="text-[#a0b4b8]">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-[#00d4aa] hover:text-[#33ddbb] font-semibold transition">
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-[#161c1e] border border-[#2a3538] rounded-xl">
                        <p className="text-xs text-center text-[#6a7e82]">
                            Demo Admin Account:<br />
                            <span className="font-mono text-[#a0b4b8]">Email: admin@tradingpool.com</span><br />
                            <span className="font-mono text-[#a0b4b8]">Password: Admin123!</span>
                        </p>
                    </div>

                    {/* Risk Warning */}
                    <div className="mt-4 p-3 border-l-4 border-[#ff6b6b] bg-[#161c1e] rounded-lg">
                        <p className="text-xs text-[#6a7e82]">
                            ⚠️ <strong className="text-[#ff6b6b]">Risk Warning:</strong> Trading involves substantial risk of loss. Past performance does not guarantee future results.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;