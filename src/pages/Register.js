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
        
        if (strength <= 2) return { text: 'Weak', color: 'text-[#ff6b6b]', width: '25%' };
        if (strength <= 3) return { text: 'Fair', color: 'text-[#ffd93d]', width: '50%' };
        if (strength <= 4) return { text: 'Good', color: 'text-[#4aa0ff]', width: '75%' };
        return { text: 'Strong', color: 'text-[#00d4aa]', width: '100%' };
    };

    if (showVerification) {
        return (
            <>
                <SEO title="Verify Email - PoolTrader" description="Verify your email address" />
                
                <div className="min-h-screen bg-[#0a0e0f] flex items-center justify-center py-12 px-4">
                    <div className="relative z-10 max-w-md w-full">
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,212,170,0.2)]">
                                    <span className="text-4xl">📧</span>
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-[#e8f0f0]">Verify Your Email</h2>
                            <p className="text-[#a0b4b8] mt-2">
                                We've sent a verification code to<br />
                                <strong className="text-[#00d4aa]">{registeredEmail}</strong>
                            </p>
                        </div>
                        
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-8 card-hover">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[#a0b4b8] text-sm font-semibold block mb-2">
                                        Enter Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        maxLength="6"
                                        className="input-dark text-center text-2xl tracking-widest"
                                    />
                                    <p className="text-[#6a7e82] text-sm mt-2 text-center">
                                        Check your spam folder if you don't see the email
                                    </p>
                                </div>
                                
                                <button
                                    onClick={handleVerifyEmail}
                                    disabled={isLoading}
                                    className="w-full btn btn-primary btn-lg"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify Email'}
                                </button>
                                
                                <div className="text-center">
                                    <button
                                        onClick={handleResendCode}
                                        disabled={resendTimer > 0}
                                        className="text-[#00d4aa] hover:text-[#33ddbb] text-sm font-medium transition disabled:opacity-50"
                                    >
                                        {resendTimer > 0 
                                            ? `Resend code in ${resendTimer}s` 
                                            : 'Resend verification code'}
                                    </button>
                                </div>
                                
                                <div className="text-center">
                                    <Link to="/login" className="text-[#6a7e82] hover:text-[#a0b4b8] text-sm transition">
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
            
            <div className="min-h-screen bg-[#0a0e0f] flex items-center justify-center py-12 px-4">
                <div className="relative z-10 max-w-md w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,212,170,0.2)]">
                                <svg className="w-12 h-12 text-[#0a0e0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-[#e8f0f0]">Create Account</h2>
                        <p className="text-[#a0b4b8] mt-2">Start your trading journey today</p>
                    </div>
                    
                    {/* Registration Form */}
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-8 card-hover">
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Full Name Field */}
                            <div>
                                <label className="text-[#a0b4b8] text-sm font-semibold block mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6a7e82]">👤</span>
                                    <input
                                        name="fullName"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={`input-dark pl-10 ${errors.fullName ? 'border-[#ff6b6b]' : ''}`}
                                        placeholder="John Doe"
                                    />
                                </div>
                                {errors.fullName && <p className="text-[#ff6b6b] text-xs mt-1">{errors.fullName}</p>}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="text-[#a0b4b8] text-sm font-semibold block mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6a7e82]">📧</span>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`input-dark pl-10 ${errors.email ? 'border-[#ff6b6b]' : ''}`}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                {errors.email && <p className="text-[#ff6b6b] text-xs mt-1">{errors.email}</p>}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="text-[#a0b4b8] text-sm font-semibold block mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6a7e82]">🔒</span>
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`input-dark pl-10 pr-12 ${errors.password ? 'border-[#ff6b6b]' : ''}`}
                                        placeholder="Create a password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6a7e82] hover:text-[#a0b4b8] transition"
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                
                                {formData.password && (
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
                                {errors.password && <p className="text-[#ff6b6b] text-xs mt-1">{errors.password}</p>}
                                <p className="text-[#6a7e82] text-xs mt-1">
                                    Must contain at least 6 characters, uppercase, lowercase, and number
                                </p>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="text-[#a0b4b8] text-sm font-semibold block mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6a7e82]">🔒</span>
                                    <input
                                        name="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`input-dark pl-10 ${errors.confirmPassword ? 'border-[#ff6b6b]' : ''}`}
                                        placeholder="Confirm your password"
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-[#ff6b6b] text-xs mt-1">{errors.confirmPassword}</p>}
                            </div>

                            {/* Terms and Conditions */}
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className="mt-1 mr-3 w-4 h-4 rounded border-[#2a3538] bg-[#1c2426] accent-[#00d4aa] focus:ring-[#00d4aa]"
                                />
                                <label htmlFor="terms" className="text-[#a0b4b8] text-sm">
                                    I agree to the{' '}
                                    <Link to="/terms" className="text-[#00d4aa] hover:text-[#33ddbb] transition font-medium">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link to="/privacy" className="text-[#00d4aa] hover:text-[#33ddbb] transition font-medium">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                            {errors.terms && <p className="text-[#ff6b6b] text-xs">{errors.terms}</p>}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn btn-primary btn-lg"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0a0e0f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating account...
                                    </span>
                                ) : 'Create Account →'}
                            </button>

                            {/* Login Link */}
                            <div className="text-center pt-4">
                                <p className="text-[#a0b4b8]">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-[#00d4aa] hover:text-[#33ddbb] font-semibold transition">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </form>
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

export default Register;