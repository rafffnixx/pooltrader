import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import { getActivePool } from '../services/api';
import toast from 'react-hot-toast';

const Contribute = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [amount, setAmount] = useState(5000);
    const [pool, setPool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('crypto');
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Helper function to format currency
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return '-';
        return `$${num.toLocaleString()}`;
    };

    const fetchActivePool = async () => {
        try {
            const response = await getActivePool();
            if (response.success && response.pool) {
                setPool(response.pool);
            } else {
                toast.error('No active pool available for contribution');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error fetching pool:', error);
            toast.error('Failed to load pool information');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivePool();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to contribute');
            navigate('/login');
            return;
        }
        
        if (amount < pool.min_contribution) {
            toast.error(`Minimum contribution is $${pool.min_contribution}`);
            return;
        }
        
        if (amount > pool.max_contribution) {
            toast.error(`Maximum contribution is $${pool.max_contribution}`);
            return;
        }
        
        setShowPaymentModal(true);
    };

    const processPayment = async () => {
        setSubmitting(true);
        setShowPaymentModal(false);
        
        try {
            // Simulate payment processing
            toast.loading('Processing payment...', { duration: 2000 });
            
            setTimeout(async () => {
                // Here you would call your API to record the contribution
                // const response = await api.post('/contributions', {
                //     pool_id: pool.id,
                //     amount: amount,
                //     payment_method: selectedPayment
                // });
                
                toast.success(`Successfully contributed ${formatCurrency(amount)} to ${pool.name}!`);
                navigate('/dashboard');
            }, 2000);
            
        } catch (error) {
            toast.error(error.message || 'Contribution failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
                    <p className="text-[#a0b4b8]">Loading pool information...</p>
                </div>
            </div>
        );
    }

    if (!pool) {
        return (
            <div className="min-h-screen bg-[#0a0e0f] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🏊</div>
                    <h1 className="text-2xl font-bold text-[#e8f0f0] mb-4">No Active Pool</h1>
                    <p className="text-[#a0b4b8] mb-6">No pool is currently accepting contributions.</p>
                    <Link to="/dashboard" className="btn btn-primary">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const newTotal = parseFloat(pool.current_total) + amount;
    const userShare = (amount / newTotal) * 100;
    const estimatedProfit = amount * 0.1;
    const managerFee = estimatedProfit * (parseFloat(pool.manager_fee_percent) / 100);
    const userKeep = estimatedProfit - managerFee;

    const paymentMethods = [
        { id: 'crypto', name: 'Cryptocurrency', icon: '₿', color: 'from-orange-500 to-yellow-500' },
        { id: 'bank', name: 'Bank Transfer', icon: '🏦', color: 'from-blue-500 to-cyan-500' },
        { id: 'card', name: 'Credit Card', icon: '💳', color: 'from-purple-500 to-pink-500' },
        { id: 'mpesa', name: 'M-Pesa', icon: '📱', color: 'from-green-500 to-teal-500' },
    ];

    return (
        <>
            <SEO title="Contribute - PoolTrader" description="Contribute to trading pool" />
            
            <div className="min-h-screen bg-[#0a0e0f] py-12">
                <div className="container mx-auto px-4 max-w-5xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold gradient-text">
                            Invest in {pool.name}
                        </h1>
                        <p className="text-[#a0b4b8] mt-2">
                            Join this trading pool and start earning profits
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Contribution Form */}
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover">
                            <div className="bg-gradient-to-r from-[#00d4aa] to-[#00b894] text-[#0a0e0f] p-6">
                                <h2 className="text-2xl font-bold">Contribution Amount</h2>
                                <p className="text-[#0a0e0f]/70 mt-1">
                                    Trading period: {new Date(pool.start_date).toLocaleDateString()} - {new Date(pool.end_date).toLocaleDateString()}
                                </p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div>
                                    <label className="block font-bold mb-3 text-[#e8f0f0]">
                                        How much would you like to invest?
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl text-[#6a7e82]">$</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(parseFloat(e.target.value))}
                                            step="500"
                                            min={parseFloat(pool.min_contribution)}
                                            max={parseFloat(pool.max_contribution)}
                                            className="w-full pl-10 pr-4 py-4 text-2xl font-bold bg-[#1c2426] border-2 border-[#2a3538] rounded-xl focus:border-[#00d4aa] focus:ring-2 focus:ring-[#00d4aa] focus:ring-opacity-30 transition text-[#e8f0f0]"
                                        />
                                    </div>
                                    
                                    <div className="flex gap-2 mt-4 flex-wrap">
                                        {[500, 1000, 5000, 10000, 20000].map(val => (
                                            <button 
                                                key={val}
                                                type="button"
                                                onClick={() => setAmount(val)}
                                                className={`px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 ${
                                                    amount === val 
                                                        ? 'bg-[#00d4aa] text-[#0a0e0f] shadow-[0_4px_15px_rgba(0,212,170,0.25)]'
                                                        : 'bg-[#1c2426] text-[#a0b4b8] hover:bg-[#2a3538]'
                                                }`}
                                            >
                                                ${val.toLocaleString()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-[#2a3538] pt-4">
                                    <h3 className="font-bold mb-3 text-[#e8f0f0]">Payment Method</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {paymentMethods.map(method => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setSelectedPayment(method.id)}
                                                className={`p-4 rounded-xl border-2 transition transform hover:scale-105 ${
                                                    selectedPayment === method.id
                                                        ? `border-[#00d4aa] bg-gradient-to-r ${method.color} text-[#0a0e0f]`
                                                        : 'border-[#2a3538] hover:border-[#00d4aa] bg-[#1c2426] text-[#a0b4b8]'
                                                }`}
                                            >
                                                <div className="text-2xl mb-1">{method.icon}</div>
                                                <div className="font-semibold text-sm">{method.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full btn btn-success btn-lg"
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0a0e0f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : 'Confirm Contribution →'}
                                </button>
                            </form>
                        </div>

                        {/* Summary Card */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-2xl p-6 text-[#0a0e0f]">
                                <h3 className="text-xl font-bold mb-4">Investment Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-[#0a0e0f]/20">
                                        <span>Your Contribution</span>
                                        <span className="text-2xl font-bold">{formatCurrency(amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-[#0a0e0f]/20">
                                        <span>Pool Total After</span>
                                        <span className="font-semibold">{formatCurrency(newTotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Your Share</span>
                                        <span className="text-2xl font-bold">{userShare.toFixed(2)}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 card-hover">
                                <h3 className="text-xl font-bold text-[#e8f0f0] mb-4 flex items-center">
                                    <span className="mr-2">📈</span> Estimated Returns
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-[#1c2426] rounded-xl border border-[#00d4aa]/20">
                                        <p className="text-sm text-[#a0b4b8]">Your Estimated Profit (10% pool gain)</p>
                                        <p className="text-3xl font-bold text-[#00d4aa]">+{formatCurrency(userKeep)}</p>
                                        <p className="text-xs text-[#6a7e82] mt-1">After {pool.manager_fee_percent}% manager fee</p>
                                    </div>
                                    <div className="p-4 bg-[#1c2426] rounded-xl border border-[#ffd93d]/20">
                                        <p className="text-sm text-[#a0b4b8]">Manager Fee</p>
                                        <p className="text-2xl font-bold text-[#ffd93d]">{formatCurrency(managerFee)}</p>
                                        <p className="text-xs text-[#6a7e82] mt-1">({pool.manager_fee_percent}% of profits)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 card-hover">
                                <h3 className="font-bold text-[#e8f0f0] mb-3 flex items-center">
                                    <span className="mr-2">📊</span> Pool Statistics
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-2 border-b border-[#2a3538]">
                                        <span className="text-[#a0b4b8]">Current Pool Size</span>
                                        <span className="font-semibold text-[#e8f0f0]">{formatCurrency(pool.current_total)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-[#2a3538]">
                                        <span className="text-[#a0b4b8]">Target</span>
                                        <span className="font-semibold text-[#e8f0f0]">{formatCurrency(pool.total_target)}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-[#a0b4b8]">Remaining</span>
                                        <span className="font-semibold text-[#00d4aa]">
                                            {formatCurrency(parseFloat(pool.total_target) - parseFloat(pool.current_total))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Modal */}
                    {showPaymentModal && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl max-w-md w-full p-6 transform animate-slide-up modal-dark">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(0,212,170,0.2)]">
                                        <span className="text-3xl">💳</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#e8f0f0]">Complete Payment</h3>
                                    <p className="text-[#a0b4b8] mt-2">
                                        Amount: <span className="font-bold text-[#00d4aa]">{formatCurrency(amount)}</span>
                                    </p>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {selectedPayment === 'crypto' && (
                                        <div className="p-4 bg-[#1c2426] border border-[#2a3538] rounded-xl">
                                            <p className="text-sm font-mono break-all text-[#e8f0f0]">
                                                Send USDC to: <br />
                                                <span className="text-[#00d4aa]">0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5</span>
                                            </p>
                                            <p className="text-xs text-[#6a7e82] mt-2">Network: ERC-20</p>
                                        </div>
                                    )}
                                    {selectedPayment === 'bank' && (
                                        <div className="p-4 bg-[#1c2426] border border-[#2a3538] rounded-xl">
                                            <p className="text-[#e8f0f0]">Bank: Chase Bank</p>
                                            <p className="text-[#e8f0f0]">Account: 9876543210</p>
                                            <p className="text-[#e8f0f0]">Routing: 123456789</p>
                                            <p className="text-[#6a7e82] text-sm">Reference: POOL-{pool.id}-{user?.id}</p>
                                        </div>
                                    )}
                                    {selectedPayment === 'mpesa' && (
                                        <div className="p-4 bg-[#1c2426] border border-[#2a3538] rounded-xl">
                                            <p className="text-[#e8f0f0]">Paybill Number: 987654</p>
                                            <p className="text-[#e8f0f0]">Account Number: {user?.id || 'POOL'}{pool.id}</p>
                                            <p className="text-[#6a7e82] text-sm">Amount: {formatCurrency(amount)}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowPaymentModal(false)}
                                        className="flex-1 btn btn-outline"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={processPayment}
                                        disabled={submitting}
                                        className="flex-1 btn btn-success"
                                    >
                                        {submitting ? 'Processing...' : "I've Sent Payment"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Contribute;