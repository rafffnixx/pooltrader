import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await api.post('/auth/forgot-password', { email });
            if (response.data.success) {
                setSubmitted(true);
                toast.success('Password reset instructions sent to your email!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <>
                <SEO title="Reset Link Sent - PoolTrader" description="Password reset email sent" />
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center py-12 px-4">
                    <div className="relative z-10 max-w-md w-full text-center">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-gray-700">
                            <div className="text-6xl mb-4">📧</div>
                            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                            <p className="text-gray-300 mb-6">
                                We've sent a password reset link to <strong className="text-blue-400">{email}</strong>
                            </p>
                            <Link to="/login" className="text-blue-400 hover:text-blue-300">
                                ← Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <SEO title="Forgot Password - PoolTrader" description="Reset your password" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center py-12 px-4">
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative z-10 max-w-md w-full">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                                <span className="text-4xl">🔐</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-white">Forgot Password?</h2>
                        <p className="text-gray-300 mt-2">No worries, we'll send you reset instructions</p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-700">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-gray-300 text-sm font-semibold block mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        📧
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-[1.02] disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                            
                            <div className="text-center">
                                <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm">
                                    ← Back to Login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;