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
        setShowPaymentModal(true);
    };

    const processPayment = async () => {
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
                
                toast.success(`Successfully contributed $${amount.toLocaleString()} to ${pool.name}!`);
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
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading pool information...</p>
                </div>
            </div>
        );
    }

    if (!pool) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🏊</div>
                    <h1 className="text-2xl font-bold text-white mb-4">No Active Pool</h1>
                    <p className="text-gray-400 mb-6">No pool is currently accepting contributions.</p>
                    <Link to="/dashboard" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition">
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
            <SEO title="Contribute - PoolTrade" description="Contribute to trading pool" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
                <div className="container mx-auto px-4 max-w-5xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Invest in {pool.name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Join this trading pool and start earning profits
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Contribution Form */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                                <h2 className="text-2xl font-bold">Contribution Amount</h2>
                                <p className="text-blue-100 mt-1">
                                    Trading period: {new Date(pool.start_date).toLocaleDateString()} - {new Date(pool.end_date).toLocaleDateString()}
                                </p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div>
                                    <label className="block font-bold mb-3 text-gray-700 dark:text-gray-300">
                                        How much would you like to invest?
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl text-gray-400">$</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(parseFloat(e.target.value))}
                                            step="500"
                                            min={parseFloat(pool.min_contribution)}
                                            max={parseFloat(pool.max_contribution)}
                                            className="w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition dark:bg-gray-700 dark:text-white"
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
                                                        ? 'bg-blue-600 text-white shadow-lg'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                ${val.toLocaleString()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t dark:border-gray-700 pt-4">
                                    <h3 className="font-bold mb-3 text-gray-700 dark:text-gray-300">Payment Method</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {paymentMethods.map(method => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setSelectedPayment(method.id)}
                                                className={`p-4 rounded-xl border-2 transition transform hover:scale-105 ${
                                                    selectedPayment === method.id
                                                        ? `border-blue-500 bg-gradient-to-r ${method.color} text-white`
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
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
                                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition transform hover:scale-[1.02] shadow-lg disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                                <h3 className="text-xl font-bold mb-4">Investment Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-white/20">
                                        <span>Your Contribution</span>
                                        <span className="text-2xl font-bold">${amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-white/20">
                                        <span>Pool Total After</span>
                                        <span className="font-semibold">${newTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-white/20">
                                        <span>Your Share</span>
                                        <span className="text-2xl font-bold">{userShare.toFixed(2)}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                                <h3 className="text-xl font-bold mb-4 flex items-center">
                                    <span className="mr-2">📈</span> Estimated Returns
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Your Estimated Profit (10% pool gain)</p>
                                        <p className="text-3xl font-bold text-green-600">+${userKeep.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500 mt-1">After {pool.manager_fee_percent}% manager fee</p>
                                    </div>
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Manager Fee</p>
                                        <p className="text-2xl font-bold text-yellow-600">${managerFee.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500 mt-1">({pool.manager_fee_percent}% of profits)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                                <h3 className="font-bold mb-3 flex items-center">
                                    <span className="mr-2">📊</span> Pool Statistics
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Current Pool Size</span>
                                        <span className="font-semibold">${parseFloat(pool.current_total).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Target</span>
                                        <span className="font-semibold">${parseFloat(pool.total_target).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                                        <span className="font-semibold text-blue-600">
                                            ${(parseFloat(pool.total_target) - parseFloat(pool.current_total)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Modal */}
                    {showPaymentModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 transform animate-slide-up">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-3xl">💳</span>
                                    </div>
                                    <h3 className="text-2xl font-bold">Complete Payment</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                                        Amount: <span className="font-bold text-green-600">${amount.toLocaleString()}</span>
                                    </p>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {selectedPayment === 'crypto' && (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                            <p className="text-sm font-mono break-all">
                                                Send USDC to: <br />
                                                <span className="text-blue-600">0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">Network: ERC-20</p>
                                        </div>
                                    )}
                                    {selectedPayment === 'bank' && (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                            <p>Bank: Chase Bank</p>
                                            <p>Account: 9876543210</p>
                                            <p>Routing: 123456789</p>
                                            <p>Reference: POOL-{pool.id}-{user?.id}</p>
                                        </div>
                                    )}
                                    {selectedPayment === 'mpesa' && (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                            <p>Paybill Number: 987654</p>
                                            <p>Account Number: {user?.id || 'POOL'}{pool.id}</p>
                                            <p>Amount: ${amount.toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowPaymentModal(false)}
                                        className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={processPayment}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition"
                                    >
                                        I've Sent Payment
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