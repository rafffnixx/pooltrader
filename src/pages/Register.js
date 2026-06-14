import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import api from '../services/api';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.length < 2) {
            newErrors.fullName = 'Name must be at least 2 characters';
        }
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        if (!agreeTerms) {
            newErrors.terms = 'You must agree to the terms and conditions';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await api.post('/auth/register', {
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName
            });
            
            if (response.data.success) {
                if (response.data.requiresVerification) {
                    setRegisteredEmail(formData.email);
                    setShowVerification(true);
                    toast.success('Registration successful! Please check your email for verification code.');
                    startResendTimer();
                } else {
                    toast.success('Registration successful! Welcome to PoolTrader!');
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            toast.error('Please enter the 6-digit verification code');
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await api.post('/auth/verify-email', {
                email: registeredEmail,
                code: verificationCode
            });
            
            if (response.data.success) {
                // Store token and user data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                toast.success('Email verified! Welcome to PoolTrader!');
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendTimer > 0) return;
        
        try {
            const response = await api.post('/auth/resend-verification', {
                email: registeredEmail
            });
            
            if (response.data.success) {
                toast.success('New verification code sent to your email!');
                startResendTimer();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend code');
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

    const passwordStrength = () => {
        const password = formData.password;
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        if (strength <= 2) return { text: 'Weak', color: 'red', width: '25%' };
        if (strength <= 3) return { text: 'Fair', color: 'yellow', width: '50%' };
        if (strength <= 4) return { text: 'Good', color: 'blue', width: '75%' };
        return { text: 'Strong', color: 'green', width: '100%' };
    };

    if (showVerification) {
        return (
            <>
                <SEO title="Verify Email - PoolTrader" description="Verify your email address" />
                
                <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="relative z-10 max-w-md w-full">
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                                    <span className="text-4xl">📧</span>
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-white">Verify Your Email</h2>
                            <p className="text-gray-300 mt-2">
                                We've sent a verification code to<br />
                                <strong className="text-blue-400">{registeredEmail}</strong>
                            </p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-700">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-gray-300 text-sm font-semibold block mb-2">
                                        Enter Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        maxLength="6"
                                        className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                                    />
                                    <p className="text-gray-400 text-sm mt-2 text-center">
                                        Check your spam folder if you don't see the email
                                    </p>
                                </div>
                                
                                <button
                                    onClick={handleVerifyEmail}
                                    disabled={isLoading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify Email'}
                                </button>
                                
                                <div className="text-center">
                                    <button
                                        onClick={handleResendCode}
                                        disabled={resendTimer > 0}
                                        className="text-blue-400 hover:text-blue-300 text-sm disabled:opacity-50"
                                    >
                                        {resendTimer > 0 
                                            ? `Resend code in ${resendTimer}s` 
                                            : 'Resend verification code'}
                                    </button>
                                </div>
                                
                                <div className="text-center">
                                    <Link to="/login" className="text-gray-400 hover:text-gray-300 text-sm">
                                        ← Back to Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <SEO title="Register - PoolTrader" description="Create a new trading pool account" />
            
            <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative z-10 max-w-md w-full">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-white">Create Account</h2>
                        <p className="text-gray-300 mt-2">Start your trading journey today</p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-700">
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Full Name Field */}
                            <div>
                                <label className="text-gray-300 text-sm font-semibold block mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">👤</span>
                                    <input
                                        name="fullName"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.fullName ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                        placeholder="John Doe"
                                    />
                                </div>
                                {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="text-gray-300 text-sm font-semibold block mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📧</span>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.email ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="text-gray-300 text-sm font-semibold block mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.password ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                        placeholder="Create a password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                                
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-400">Password strength:</span>
                                            <span className={`text-${passwordStrength().color}-400`}>
                                                {passwordStrength().text}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-1">
                                            <div className={`h-1 rounded-full transition-all duration-300 bg-${passwordStrength().color}-500`} style={{ width: passwordStrength().width }}></div>
                                        </div>
                                    </div>
                                )}
                                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                                <p className="text-gray-500 text-xs mt-1">
                                    Must contain at least 6 characters, uppercase, lowercase, and number
                                </p>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="text-gray-300 text-sm font-semibold block mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
                                    <input
                                        name="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                        placeholder="Confirm your password"
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                            </div>

                            {/* Terms and Conditions */}
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className="mt-1 mr-3 w-4 h-4 rounded border-gray-600 bg-white/10 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="terms" className="text-gray-300 text-sm">
                                    I agree to the{' '}
                                    <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                            {errors.terms && <p className="text-red-400 text-xs">{errors.terms}</p>}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition transform hover:scale-[1.02] disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating account...
                                    </span>
                                ) : 'Create Account →'}
                            </button>

                            {/* Login Link */}
                            <div className="text-center pt-4">
                                <p className="text-gray-400">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;