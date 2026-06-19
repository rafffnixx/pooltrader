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

    // Success State
    if (submitted) {
        return (
            <>
                <SEO title="Reset Link Sent - PoolTrader" description="Password reset email sent" />
                <div className="min-h-screen bg-[#0a0e0f] flex items-center justify-center py-12 px-4">
                    <div className="relative z-10 max-w-md w-full">
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-8 text-center card-hover">
                            <div className="w-20 h-20 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(0,212,170,0.2)]">
                                <span className="text-4xl">📧</span>
                            </div>
                            <h2 className="text-2xl font-bold text-[#e8f0f0] mb-2">Check Your Email</h2>
                            <p className="text-[#a0b4b8] mb-6">
                                We've sent a password reset link to <strong className="text-[#00d4aa]">{email}</strong>
                            </p>
                            <Link to="/login" className="text-[#00d4aa] hover:text-[#33ddbb] font-medium transition">
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
            
            <div className="min-h-screen bg-[#0a0e0f] flex items-center justify-center py-12 px-4">
                <div className="relative z-10 max-w-md w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,212,170,0.2)]">
                                <span className="text-4xl">🔐</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-[#e8f0f0]">Forgot Password?</h2>
                        <p className="text-[#a0b4b8] mt-2">No worries, we'll send you reset instructions</p>
                    </div>
                    
                    {/* Form Card */}
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-8 card-hover">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-[#a0b4b8] text-sm font-semibold block mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6a7e82]">
                                        📧
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-dark pl-10"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn btn-primary btn-lg"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0a0e0f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : 'Send Reset Link'}
                            </button>
                            
                            <div className="text-center">
                                <Link to="/login" className="text-[#00d4aa] hover:text-[#33ddbb] text-sm font-medium transition">
                                    ← Back to Login
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Risk Warning */}
                    <div className="mt-4 p-3 border-l-4 border-[#ff6b6b] bg-[#161c1e] rounded-lg">
                        <p className="text-xs text-[#6a7e82]">
                            ⚠️ <strong className="text-[#ff6b6b]">Security Note:</strong> If you don't receive the email, check your spam folder or contact support.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;