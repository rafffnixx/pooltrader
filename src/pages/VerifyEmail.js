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
        
        try {
            const response = await api.post('/auth/resend-verification', { email });
            if (response.data.success) {
                toast.success('New verification code sent to your email!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend code');
        }
    };

    if (verifying) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <>
            <SEO title="Verify Email - PoolTrader" description="Verify your email address" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center py-12 px-4">
                <div className="relative z-10 max-w-md w-full">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-gray-700 text-center">
                        <div className="text-6xl mb-4">📧</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
                        <p className="text-gray-300 mb-6">
                            Please enter your email address to receive a verification code.
                        </p>
                        
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        />
                        
                        <button
                            onClick={handleResend}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition"
                        >
                            Send Verification Code
                        </button>
                        
                        <div className="mt-4">
                            <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm">
                                ← Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VerifyEmail;