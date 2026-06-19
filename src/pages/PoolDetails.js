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

    // Helper function to format currency
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return '-';
        return `$${num.toLocaleString()}`;
    };

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
        if (!user) return;
        try {
            const response = await api.get('/wallet/balance');
            if (response.data.success) {
                setWalletBalance(response.data.balance);
            }
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        }
    };

    useEffect(() => {
        fetchPoolDetails();
        if (user) {
            fetchWalletBalance();
        }
    }, [id, user]);

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
                await fetchPoolDetails();
                await fetchWalletBalance();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to allocate funds');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
                    <p className="text-[#a0b4b8]">Loading pool details...</p>
                </div>
            </div>
        );
    }

    if (!pool) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-[#a0b4b8] text-lg">Pool not found</p>
                    <Link to="/dashboard" className="text-[#00d4aa] hover:text-[#33ddbb] mt-4 inline-block font-medium transition">
                        Back to Dashboard →
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
            
            <div className="min-h-screen bg-[#0a0e0f]">
                <div className="container mx-auto px-4 py-8">
                    {/* Back Button */}
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="text-[#00d4aa] hover:text-[#33ddbb] mb-6 flex items-center gap-2 font-medium transition"
                    >
                        ← Back to Dashboard
                    </button>

                    {/* Pool Header */}
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 mb-8 card-hover">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-[#e8f0f0]">{pool.name}</h1>
                                <p className="text-[#a0b4b8] mt-2">{pool.description || 'No description provided'}</p>
                                <div className="flex gap-4 mt-4">
                                    <span className={`badge ${pool.status === 'open' || pool.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                                        {pool.status.toUpperCase()}
                                    </span>
                                    <span className="text-[#6a7e82] text-sm">{daysLeft} days remaining</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-[#6a7e82]">Trading Period</p>
                                <p className="font-semibold text-[#e8f0f0]">
                                    {new Date(pool.start_date).toLocaleDateString()} - {new Date(pool.end_date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="stat-card">
                            <div className="stat-label">Target Amount</div>
                            <div className="stat-value text-[#00d4aa]">{formatCurrency(pool.total_target)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Current Raised</div>
                            <div className="stat-value text-[#00d4aa]">{formatCurrency(pool.current_total)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Progress</div>
                            <div className="stat-value text-[#ffd93d]">{progress.toFixed(1)}%</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Total Investors</div>
                            <div className="stat-value text-[#4aa0ff]">{contributions.length}</div>
                        </div>
                    </div>

                    {/* Funding Progress */}
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 mb-8 card-hover">
                        <h2 className="text-xl font-bold text-[#e8f0f0] mb-4">Funding Progress</h2>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-[#a0b4b8]">{formatCurrency(pool.current_total)} raised</span>
                            <span className="text-[#a0b4b8]">Target: {formatCurrency(pool.total_target)}</span>
                        </div>
                        <div className="w-full bg-[#1c2426] rounded-full h-3">
                            <div 
                                className="bg-gradient-to-r from-[#00d4aa] to-[#00b894] h-3 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Investment Section */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 card-hover">
                            <h2 className="text-xl font-bold text-[#e8f0f0] mb-4">Your Investment</h2>
                            {userContribution ? (
                                <div>
                                    <p className="text-3xl font-bold text-[#00d4aa]">{formatCurrency(userContribution.amount)}</p>
                                    <p className="text-[#a0b4b8] mt-2">Share: {userShare.toFixed(2)}% of pool</p>
                                    <button 
                                        onClick={() => setShowContributeModal(true)}
                                        className="btn btn-primary w-full mt-4"
                                    >
                                        Add More
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-[#a0b4b8]">You haven't invested in this pool yet</p>
                                    <p className="text-sm text-[#6a7e82] mt-1">Min: {formatCurrency(pool.min_contribution)}</p>
                                    <button 
                                        onClick={() => setShowContributeModal(true)}
                                        className="btn btn-success w-full mt-4"
                                    >
                                        Invest Now
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 card-hover">
                            <h2 className="text-xl font-bold text-[#e8f0f0] mb-4">Pool Terms</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-[#2a3538]">
                                    <span className="text-[#a0b4b8]">Min Contribution</span>
                                    <span className="font-semibold text-[#e8f0f0]">{formatCurrency(pool.min_contribution)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-[#2a3538]">
                                    <span className="text-[#a0b4b8]">Max Contribution</span>
                                    <span className="font-semibold text-[#e8f0f0]">{formatCurrency(pool.max_contribution)}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-[#a0b4b8]">Manager Fee</span>
                                    <span className="font-semibold text-[#e8f0f0]">{pool.manager_fee_percent}% of profits</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Contributors */}
                    {contributions.length > 0 && (
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 mb-8 card-hover">
                            <h2 className="text-xl font-bold text-[#e8f0f0] mb-4">🏆 Top Contributors</h2>
                            <div className="overflow-x-auto">
                                <table className="table-dark">
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Investor</th>
                                            <th>Amount</th>
                                            <th>Share %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...contributions]
                                            .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
                                            .map((c, idx) => (
                                            <tr key={c.id} className="hover:bg-[#1c2426] transition">
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                                        idx === 0 ? 'bg-[#ffd93d] text-[#0a0e0f]' :
                                                        idx === 1 ? 'bg-[#a0b4b8] text-[#0a0e0f]' :
                                                        idx === 2 ? 'bg-[#ff6b6b] text-white' :
                                                        'bg-[#1c2426] text-[#a0b4b8]'
                                                    }`}>
                                                        #{idx + 1}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-medium text-[#e8f0f0]">
                                                    {c.full_name || `User ${c.user_id}`} 
                                                    {c.user_id === user?.id && <span className="text-[#00d4aa] text-sm ml-1">(You)</span>}
                                                </td>
                                                <td className="p-4 font-semibold text-[#00d4aa]">{formatCurrency(c.amount)}</td>
                                                <td className="p-4 text-[#a0b4b8]">{((parseFloat(c.amount) / parseFloat(pool.current_total)) * 100).toFixed(2)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Recent Trades */}
                    {trades.length > 0 && (
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 card-hover">
                            <h2 className="text-xl font-bold text-[#e8f0f0] mb-4">📊 Recent Trades</h2>
                            <div className="overflow-x-auto">
                                <table className="table-dark">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Symbol</th>
                                            <th>Direction</th>
                                            <th>Entry</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trades.map((trade) => (
                                            <tr key={trade.id} className="hover:bg-[#1c2426] transition">
                                                <td className="p-4 text-sm text-[#a0b4b8]">{new Date(trade.open_time).toLocaleDateString()}</td>
                                                <td className="p-4 font-medium text-[#e8f0f0]">{trade.symbol}</td>
                                                <td className="p-4">
                                                    <span className={`badge ${trade.direction === 'BUY' ? 'badge-success' : 'badge-danger'}`}>
                                                        {trade.direction}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-[#e8f0f0]">${parseFloat(trade.open_price).toFixed(4)}</td>
                                                <td className="p-4">
                                                    <span className={`badge ${trade.status === 'open' ? 'badge-warning' : 'badge-gray'}`}>
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

                    {/* Contribute Modal */}
                    {showContributeModal && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-md w-full modal-dark">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-[#e8f0f0]">Invest in {pool.name}</h2>
                                    <button onClick={() => setShowContributeModal(false)} className="text-[#a0b4b8] hover:text-[#e8f0f0] text-2xl transition">✕</button>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-3 bg-[#1c2426] rounded-lg border border-[#00d4aa]/20">
                                        <p className="text-sm text-[#a0b4b8]">Your Available Balance</p>
                                        <p className="text-2xl font-bold text-[#00d4aa]">{formatCurrency(walletBalance.withdrawable)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Amount to Invest ($)</label>
                                        <input 
                                            type="number" 
                                            value={contributeAmount} 
                                            onChange={(e) => setContributeAmount(parseFloat(e.target.value))}
                                            min={pool.min_contribution}
                                            max={Math.min(pool.max_contribution, walletBalance.withdrawable)}
                                            step="100"
                                            className="input-dark text-lg font-semibold"
                                        />
                                        <div className="flex justify-between text-xs text-[#6a7e82] mt-1">
                                            <span>Min: {formatCurrency(pool.min_contribution)}</span>
                                            <span>Max: {formatCurrency(pool.max_contribution)}</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#1c2426] p-3 rounded-lg">
                                        <p className="text-sm text-[#a0b4b8]">Your Share After Investment</p>
                                        <p className="text-xl font-bold text-[#00d4aa]">
                                            {((contributeAmount + parseFloat(pool.current_total)) > 0 
                                                ? (contributeAmount / (contributeAmount + parseFloat(pool.current_total))) * 100 
                                                : 0).toFixed(2)}%
                                        </p>
                                    </div>
                                    <div className="bg-[#1c2426] p-3 rounded-lg border-l-4 border-[#ffd93d]">
                                        <p className="text-xs text-[#a0b4b8]">
                                            ⚡ Funds will be allocated from your wallet balance to this pool.
                                            Your withdrawable balance will decrease by this amount.
                                        </p>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button onClick={() => setShowContributeModal(false)} className="flex-1 btn btn-outline">Cancel</button>
                                        <button onClick={handleContribute} className="flex-1 btn btn-success">Confirm Investment</button>
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