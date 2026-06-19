import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const VerifyEmail = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [email, setEmail] = useState('');
    const [showResend, setShowResend] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (code) {
            verifyWithCode();
        } else {
            setVerifying(false);
            setShowResend(true);
        }
    }, [code]);

    const verifyWithCode = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const emailParam = urlParams.get('email');
        
        if (emailParam) {
            setEmail(emailParam);
            try {
                const response = await api.post('/auth/verify-email', {
                    email: emailParam,
                    code: code
                });
                
                if (response.data.success) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    toast.success('Email verified successfully!');
                    navigate('/dashboard');
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Verification failed');
                setShowResend(true);
            } finally {
                setVerifying(false);
            }
        } else {
            setVerifying(false);
            setShowResend(true);
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await api.post('/auth/resend-verification', { email });
            if (response.data.success) {
                toast.success('New verification code sent to your email!');
                startResendTimer();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend code');
        } finally {
            setIsLoading(false);
        }
    };

    const startResendTimer = () => {
        setResendTimer(60);
        const timer = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    if (verifying) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
                    <p className="text-[#a0b4b8]">Verifying your email...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO title="Verify Email - PoolTrader" description="Verify your email address" />
            
            <div className="min-h-screen bg-[#0a0e0f] flex items-center justify-center py-12 px-4">
                <div className="relative z-10 max-w-md w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,212,170,0.2)]">
                                <span className="text-4xl">📧</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-[#e8f0f0]">Verify Your Email</h2>
                        <p className="text-[#a0b4b8] mt-2">
                            Please enter your email address to receive a verification code.
                        </p>
                    </div>
                    
                    {/* Form Card */}
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-8 card-hover">
                        <div className="space-y-4">
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
                                        placeholder="your@email.com"
                                        className="input-dark pl-10"
                                    />
                                </div>
                            </div>
                            
                            <button
                                onClick={handleResend}
                                disabled={isLoading || resendTimer > 0}
                                className="w-full btn btn-primary btn-lg"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0a0e0f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : resendTimer > 0 ? (
                                    `Resend in ${resendTimer}s`
                                ) : (
                                    'Send Verification Code'
                                )}
                            </button>
                            
                            <div className="text-center pt-4">
                                <Link to="/login" className="text-[#00d4aa] hover:text-[#33ddbb] text-sm font-medium transition">
                                    ← Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Help Note */}
                    <div className="mt-4 p-3 border-l-4 border-[#4aa0ff] bg-[#161c1e] rounded-lg">
                        <p className="text-xs text-[#6a7e82]">
                            💡 <strong className="text-[#4aa0ff]">Tip:</strong> Check your spam folder if you don't receive the verification email.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VerifyEmail;