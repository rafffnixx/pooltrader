import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [validToken, setValidToken] = useState(true);

    useEffect(() => {
        if (!token) {
            setValidToken(false);
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await api.post('/auth/reset-password', {
                token: token,
                newPassword: password,
                confirmPassword: confirmPassword
            });
            
            if (response.data.success) {
                toast.success('Password reset successful! Please login with your new password.');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    // Password strength indicator
    const passwordStrength = () => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        if (strength <= 2) return { text: 'Weak', color: 'text-[#ff6b6b]', width: '25%' };
        if (strength <= 3) return { text: 'Fair', color: 'text-[#ffd93d]', width: '50%' };
        if (strength <= 4) return { text: 'Good', color: 'text-[#4aa0ff]', width: '75%' };
        return { text: 'Strong', color: 'text-[#00d4aa]', width: '100%' };
    };

    if (!validToken) {
        return (
            <div className="min-h-screen bg-[#0a0e0f] flex items-center justify-center py-12 px-4">
                <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-8 max-w-md w-full text-center card-hover">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-[#e8f0f0] mb-2">Invalid Reset Link</h2>
                    <p className="text-[#a0b4b8] mb-6">
                        The password reset link is invalid or has expired.
                    </p>
                    <Link to="/forgot-password" className="btn btn-primary">
                        Request New Reset Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO title="Reset Password - PoolTrader" description="Reset your password" />
            
            <div className="min-h-screen bg-[#0a0e0f] flex items-center justify-center py-12 px-4">
                <div className="relative z-10 max-w-md w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,212,170,0.2)]">
                                <svg className="w-12 h-12 text-[#0a0e0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-[#e8f0f0]">Reset Password</h2>
                        <p className="text-[#a0b4b8] mt-2">Enter your new password</p>
                    </div>
                    
                    {/* Reset Form */}
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-8 card-hover">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-[#a0b4b8] text-sm font-semibold block mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6a7e82]">
                                        🔒
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-dark pl-10 pr-12"
                                        placeholder="Enter new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6a7e82] hover:text-[#a0b4b8] transition"
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                
                                {password && (
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-[#6a7e82]">Password strength:</span>
                                            <span className={passwordStrength().color}>
                                                {passwordStrength().text}
                                            </span>
                                        </div>
                                        <div className="w-full bg-[#1c2426] rounded-full h-1.5">
                                            <div className={`h-1.5 rounded-full transition-all duration-300 bg-[#00d4aa]`} 
                                                 style={{ width: passwordStrength().width }}></div>
                                        </div>
                                    </div>
                                )}
                                <p className="text-[#6a7e82] text-xs mt-1">Must be at least 6 characters</p>
                            </div>
                            
                            <div>
                                <label className="text-[#a0b4b8] text-sm font-semibold block mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6a7e82]">
                                        🔒
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input-dark pl-10"
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-[#ff6b6b] text-xs mt-1">Passwords do not match</p>
                                )}
                                {confirmPassword && password === confirmPassword && password.length >= 6 && (
                                    <p className="text-[#00d4aa] text-xs mt-1">✓ Passwords match</p>
                                )}
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
                                        Resetting...
                                    </span>
                                ) : 'Reset Password'}
                            </button>
                            
                            <div className="text-center">
                                <Link to="/login" className="text-[#00d4aa] hover:text-[#33ddbb] text-sm font-medium transition">
                                    ← Back to Login
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Security Note */}
                    <div className="mt-4 p-3 border-l-4 border-[#4aa0ff] bg-[#161c1e] rounded-lg">
                        <p className="text-xs text-[#6a7e82]">
                            🔒 <strong className="text-[#4aa0ff]">Security Tip:</strong> Use a strong, unique password that you don't use elsewhere.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResetPassword;