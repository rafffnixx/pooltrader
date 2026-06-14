import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import api from '../services/api';
import toast from 'react-hot-toast';

const PoolDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [pool, setPool] = useState(null);
    const [contributions, setContributions] = useState([]);
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [contributeAmount, setContributeAmount] = useState(1000);
    const [walletBalance, setWalletBalance] = useState({ withdrawable: 0 });

    useEffect(() => {
        fetchPoolDetails();
        if (user) {
            fetchWalletBalance();
        }
    }, [id]);

    const fetchPoolDetails = async () => {
        try {
            const response = await api.get(`/pool/${id}`);
            if (response.data.success) {
                setPool(response.data.pool);
                setContributions(response.data.contributions || []);
                setTrades(response.data.trades || []);
            } else {
                toast.error('Pool not found');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error fetching pool details:', error);
            toast.error('Failed to load pool details');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchWalletBalance = async () => {
        try {
            const response = await api.get('/wallet/balance');
            if (response.data.success) {
                setWalletBalance(response.data.balance);
            }
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        }
    };

    const handleContribute = async () => {
        if (!pool) return;
        
        if (contributeAmount < pool.min_contribution) {
            toast.error(`Minimum contribution is $${pool.min_contribution}`);
            return;
        }
        
        if (contributeAmount > pool.max_contribution) {
            toast.error(`Maximum contribution is $${pool.max_contribution}`);
            return;
        }
        
        if (contributeAmount > walletBalance.withdrawable) {
            toast.error(`Insufficient balance. Available: $${walletBalance.withdrawable.toLocaleString()}`);
            return;
        }
        
        try {
            const response = await api.post('/wallet/allocate-to-pool', {
                pool_id: parseInt(id),
                amount: contributeAmount
            });
            
            if (response.data.success) {
                toast.success(response.data.message);
                setShowContributeModal(false);
                fetchPoolDetails();
                fetchWalletBalance();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to allocate funds');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading pool details...</p>
                </div>
            </div>
        );
    }

    if (!pool) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center">
                    <p className="text-gray-400 text-lg">Pool not found</p>
                    <Link to="/dashboard" className="text-blue-500 mt-4 inline-block hover:text-blue-400">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const progress = (parseFloat(pool.current_total) / parseFloat(pool.total_target)) * 100;
    const daysLeft = Math.ceil((new Date(pool.end_date) - new Date()) / (1000 * 60 * 60 * 24));
    const userContribution = contributions.find(c => c.user_id === user?.id);
    const userShare = userContribution ? (parseFloat(userContribution.amount) / parseFloat(pool.current_total)) * 100 : 0;

    return (
        <>
            <SEO title={`${pool.name} - PoolTrader`} description={`View details for ${pool.name}`} />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="mb-6 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl font-bold dark:text-white">{pool.name}</h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">{pool.description || 'No description provided'}</p>
                                <div className="flex gap-4 mt-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                        pool.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {pool.status.toUpperCase()}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">{daysLeft} days remaining</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Trading Period</p>
                                <p className="font-semibold dark:text-white">
                                    {new Date(pool.start_date).toLocaleDateString()} - {new Date(pool.end_date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Target Amount</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${parseFloat(pool.total_target).toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Current Raised</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">${parseFloat(pool.current_total).toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Progress</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{progress.toFixed(1)}%</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Investors</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{contributions.length}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Funding Progress</h2>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="dark:text-gray-300">${parseFloat(pool.current_total).toLocaleString()} raised</span>
                            <span className="dark:text-gray-300">Target: ${parseFloat(pool.total_target).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                            <div 
                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4 dark:text-white">Your Investment</h2>
                            {userContribution ? (
                                <div>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">${parseFloat(userContribution.amount).toLocaleString()}</p>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2">Share: {userShare.toFixed(2)}% of pool</p>
                                    <button 
                                        onClick={() => setShowContributeModal(true)}
                                        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                                    >
                                        Add More
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">You haven't invested in this pool yet</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Min: ${parseFloat(pool.min_contribution).toLocaleString()}</p>
                                    <button 
                                        onClick={() => setShowContributeModal(true)}
                                        className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                                    >
                                        Invest Now
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4 dark:text-white">Pool Terms</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Min Contribution</span>
                                    <span className="font-semibold dark:text-white">${parseFloat(pool.min_contribution).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Max Contribution</span>
                                    <span className="font-semibold dark:text-white">${parseFloat(pool.max_contribution).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Manager Fee</span>
                                    <span className="font-semibold dark:text-white">{pool.manager_fee_percent}% of profits</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {contributions.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
                            <h2 className="text-xl font-bold mb-4 dark:text-white">🏆 Top Contributors</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="p-4 text-left dark:text-white">Rank</th>
                                            <th className="p-4 text-left dark:text-white">Investor</th>
                                            <th className="p-4 text-left dark:text-white">Amount</th>
                                            <th className="p-4 text-left dark:text-white">Share %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...contributions].sort((a, b) => b.amount - a.amount).map((c, idx) => (
                                            <tr key={c.id} className="border-b dark:border-gray-700">
                                                <td className="p-4 dark:text-gray-300">#{idx + 1}</td>
                                                <td className="p-4 font-medium dark:text-white">{c.full_name || `User ${c.user_id}`} {c.user_id === user?.id && <span className="text-blue-500 text-sm ml-1">(You)</span>}</td>
                                                <td className="p-4 font-semibold text-green-600 dark:text-green-400">${parseFloat(c.amount).toLocaleString()}</td>
                                                <td className="p-4 dark:text-gray-300">{((parseFloat(c.amount) / parseFloat(pool.current_total)) * 100).toFixed(2)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {trades.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4 dark:text-white">📊 Recent Trades</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="p-4 text-left dark:text-white">Date</th>
                                            <th className="p-4 text-left dark:text-white">Symbol</th>
                                            <th className="p-4 text-left dark:text-white">Direction</th>
                                            <th className="p-4 text-left dark:text-white">Entry</th>
                                            <th className="p-4 text-left dark:text-white">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trades.map((trade) => (
                                            <tr key={trade.id} className="border-b dark:border-gray-700">
                                                <td className="p-4 dark:text-gray-300">{new Date(trade.open_time).toLocaleDateString()}</td>
                                                <td className="p-4 font-medium dark:text-white">{trade.symbol}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        trade.direction === 'BUY' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }`}>
                                                        {trade.direction}
                                                    </span>
                                                </td>
                                                <td className="p-4 dark:text-gray-300">${parseFloat(trade.open_price).toFixed(4)}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        trade.status === 'open' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {trade.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {showContributeModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold dark:text-white">Invest in {pool.name}</h2>
                                    <button onClick={() => setShowContributeModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">✕</button>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Your Available Balance</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">${walletBalance.withdrawable?.toLocaleString() || 0}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-white">Amount to Invest ($)</label>
                                        <input 
                                            type="number" 
                                            value={contributeAmount} 
                                            onChange={(e) => setContributeAmount(parseFloat(e.target.value))}
                                            min={pool.min_contribution}
                                            max={Math.min(pool.max_contribution, walletBalance.withdrawable)}
                                            step="100"
                                            className="w-full p-3 border rounded-lg text-lg font-semibold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span>Min: ${parseFloat(pool.min_contribution).toLocaleString()}</span>
                                            <span>Max: ${parseFloat(pool.max_contribution).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Your Share After Investment</p>
                                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                            {((contributeAmount + parseFloat(pool.current_total)) > 0 
                                                ? (contributeAmount / (contributeAmount + parseFloat(pool.current_total))) * 100 
                                                : 0).toFixed(2)}%
                                        </p>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button onClick={() => setShowContributeModal(false)} className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Cancel</button>
                                        <button onClick={handleContribute} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Confirm Investment</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PoolDetails;