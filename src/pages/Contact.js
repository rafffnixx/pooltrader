import React, { useState } from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        // Simulate email sending (integrate with actual email API in production)
        setTimeout(() => {
            toast.success('Message sent! We will respond within 24-48 hours.');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setSubmitting(false);
        }, 1500);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <>
            <SEO title="Contact Us - PoolTrader" description="Contact PoolTrader support team" />
            
            <div className="min-h-screen bg-[#0a0e0f]">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Back Button */}
                        <div className="mb-8">
                            <Link to="/" className="text-[#00d4aa] hover:text-[#33ddbb] font-medium transition inline-flex items-center gap-2">
                                ← Back to Home
                            </Link>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Contact Form */}
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 card-hover">
                                <h1 className="text-2xl font-bold text-[#e8f0f0] mb-4">Contact Us</h1>
                                <p className="text-[#a0b4b8] mb-6">
                                    Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                                </p>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Name <span className="text-[#ff6b6b]">*</span></label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="input-dark"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Email <span className="text-[#ff6b6b]">*</span></label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="input-dark"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Subject <span className="text-[#ff6b6b]">*</span></label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="input-dark"
                                            placeholder="What is this regarding?"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Message <span className="text-[#ff6b6b]">*</span></label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="5"
                                            className="input-dark resize-none"
                                            placeholder="Please provide details about your inquiry..."
                                        />
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full btn btn-primary btn-lg"
                                    >
                                        {submitting ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0a0e0f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sending...
                                            </span>
                                        ) : 'Send Message'}
                                    </button>
                                </form>
                            </div>
                            
                            {/* Contact Information */}
                            <div className="space-y-6">
                                <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 card-hover">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-4">Get in Touch</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 p-3 bg-[#1c2426] rounded-xl">
                                            <div className="text-2xl">📧</div>
                                            <div>
                                                <p className="font-semibold text-[#e8f0f0]">Email</p>
                                                <p className="text-[#a0b4b8]">support@pooltrader.com</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-[#1c2426] rounded-xl">
                                            <div className="text-2xl">💬</div>
                                            <div>
                                                <p className="font-semibold text-[#e8f0f0]">Response Time</p>
                                                <p className="text-[#a0b4b8]">24-48 hours</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-[#1c2426] rounded-xl">
                                            <div className="text-2xl">🌐</div>
                                            <div>
                                                <p className="font-semibold text-[#e8f0f0]">Website</p>
                                                <p className="text-[#a0b4b8]">https://pooltrader.vercel.app</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 card-hover">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-4">Support Hours</h2>
                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b border-[#2a3538]">
                                            <span className="text-[#a0b4b8]">Monday - Friday</span>
                                            <span className="font-semibold text-[#e8f0f0]">9:00 AM - 6:00 PM (EST)</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-[#2a3538]">
                                            <span className="text-[#a0b4b8]">Saturday</span>
                                            <span className="font-semibold text-[#e8f0f0]">10:00 AM - 4:00 PM (EST)</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-[#a0b4b8]">Sunday</span>
                                            <span className="font-semibold text-[#ff6b6b]">Closed</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-r from-[#00d4aa]/10 to-[#00b894]/10 border border-[#00d4aa]/20 rounded-2xl p-6 card-hover">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3">Quick Links</h2>
                                    <div className="space-y-2">
                                        <Link to="/faq" className="block text-[#00d4aa] hover:text-[#33ddbb] transition font-medium">FAQ</Link>
                                        <Link to="/privacy" className="block text-[#00d4aa] hover:text-[#33ddbb] transition font-medium">Privacy Policy</Link>
                                        <Link to="/terms" className="block text-[#00d4aa] hover:text-[#33ddbb] transition font-medium">Terms of Service</Link>
                                        <Link to="/about" className="block text-[#00d4aa] hover:text-[#33ddbb] transition font-medium">About Us</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Contact;