import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import { getPoolsList } from '../services/api';
import api from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const History = () => {
    const { user } = useAuth();
    const [pools, setPools] = useState([]);
    const [userHistory, setUserHistory] = useState([]);
    const [profitLossHistory, setProfitLossHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPool, setSelectedPool] = useState('all');

    // Helper function to format currency
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return '-';
        return `$${num.toLocaleString()}`;
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const [poolsData, historyData, profitLossData] = await Promise.all([
                getPoolsList(),
                user ? api.get(`/user/${user.id}/history`) : Promise.resolve({ data: { contributions: [] } }),
                user ? api.get(`/user/${user.id}/profit-loss`).catch(() => ({ data: { profits: [] } })) : Promise.resolve({ data: { profits: [] } })
            ]);
            
            if (poolsData.success) {
                setPools(poolsData.pools || []);
            }
            
            if (user && historyData.data.success) {
                setUserHistory(historyData.data.contributions || []);
            }
            
            if (profitLossData.data?.success) {
                setProfitLossHistory(profitLossData.data.profits || []);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const headers = ['Pool Name', 'Amount', 'Date', 'Status', 'Profit/Loss', 'Return %'];
        const csvData = userHistory.map(h => [
            h.pool_name, 
            h.amount, 
            new Date(h.created_at).toLocaleDateString(), 
            h.status,
            h.profit_loss || 0,
            h.return_percentage || 0
        ]);
        const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trading-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('History exported successfully!');
    };

    const exportProfitLoss = () => {
        const headers = ['Pool Name', 'Investment', 'Profit/Loss', 'Return %', 'Date'];
        const csvData = profitLossHistory.map(p => [
            p.pool_name,
            p.investment,
            p.profit_loss,
            p.return_percentage,
            new Date(p.created_at).toLocaleDateString()
        ]);
        const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `profit-loss-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Profit/Loss exported successfully!');
    };

    const filteredHistory = userHistory.filter(h => {
        if (selectedPool !== 'all' && h.pool_id !== parseInt(selectedPool)) return false;
        if (searchTerm && !h.pool_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (selectedPeriod === 'month') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            if (new Date(h.created_at) < oneMonthAgo) return false;
        }
        if (selectedPeriod === 'year') {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            if (new Date(h.created_at) < oneYearAgo) return false;
        }
        return true;
    });

    const totalInvested = userHistory.reduce((sum, h) => sum + parseFloat(h.amount), 0);
    const totalProfit = profitLossHistory.reduce((sum, p) => sum + parseFloat(p.profit_loss || 0), 0);
    const totalReturn = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
                    <p className="text-[#a0b4b8]">Loading your trading history...</p>
                </div>
            </div>
        );
    }

    const closedPools = pools.filter(p => p.status === 'closed' || p.status === 'settled');

    return (
        <>
            <SEO title="History - PoolTrader" description="Your complete trading history and performance" />
            
            <div className="min-h-screen bg-[#0a0e0f]">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="inline-block p-4 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-2xl mb-4 shadow-[0_0_30px_rgba(0,212,170,0.2)]">
                            <span className="text-4xl">📊</span>
                        </div>
                        <h1 className="text-4xl font-bold gradient-text">
                            Trading History & Performance
                        </h1>
                        <p className="text-[#a0b4b8] mt-2 max-w-2xl mx-auto">
                            Track your investments, profits, and trading performance over time
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="stat-card text-center">
                            <div className="text-3xl mb-2">💰</div>
                            <p className="text-3xl font-bold text-[#4aa0ff]">{formatCurrency(totalInvested)}</p>
                            <p className="text-[#6a7e82] text-sm">Total Invested</p>
                        </div>
                        <div className="stat-card text-center">
                            <div className="text-3xl mb-2">📈</div>
                            <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'}`}>
                                {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
                            </p>
                            <p className="text-[#6a7e82] text-sm">Total Profit/Loss</p>
                        </div>
                        <div className="stat-card text-center">
                            <div className="text-3xl mb-2">📊</div>
                            <p className={`text-3xl font-bold ${totalReturn >= 0 ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'}`}>
                                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                            </p>
                            <p className="text-[#6a7e82] text-sm">Total Return</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-4 mb-8 card-hover">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="🔍 Search by pool name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input-dark"
                                />
                            </div>
                            <div>
                                <select
                                    value={selectedPool}
                                    onChange={(e) => setSelectedPool(e.target.value)}
                                    className="dropdown-dark"
                                >
                                    <option value="all">All Pools</option>
                                    {closedPools.map(pool => (
                                        <option key={pool.id} value={pool.id}>{pool.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="dropdown-dark"
                                >
                                    <option value="all">All Time</option>
                                    <option value="month">Last Month</option>
                                    <option value="year">Last Year</option>
                                </select>
                            </div>
                            {userHistory.length > 0 && (
                                <button
                                    onClick={exportToCSV}
                                    className="btn btn-success"
                                >
                                    📥 Export History
                                </button>
                            )}
                            {profitLossHistory.length > 0 && (
                                <button
                                    onClick={exportProfitLoss}
                                    className="btn btn-primary"
                                >
                                    📊 Export P&L
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Past Trading Sessions */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#e8f0f0] mb-4 flex items-center">
                            <span className="mr-2">🏆</span>
                            Past Trading Sessions
                        </h2>
                        {closedPools.length === 0 ? (
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-12 text-center card-hover">
                                <div className="text-6xl mb-4">📅</div>
                                <p className="text-[#a0b4b8] text-lg">No past sessions available yet.</p>
                                <p className="text-sm text-[#6a7e82] mt-2">Check back after the current session ends.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {closedPools.map((pool) => {
                                    const userPoolHistory = userHistory.find(h => h.pool_id === pool.id);
                                    const poolProfit = profitLossHistory.find(p => p.pool_id === pool.id);
                                    const progress = (parseFloat(pool.current_total || 0) / parseFloat(pool.total_target || 1)) * 100;
                                    
                                    return (
                                        <div key={pool.id} className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover">
                                            <div className="h-1.5 bg-gradient-to-r from-[#6a7e82] to-[#a0b4b8]"></div>
                                            <div className="p-6">
                                                <div className="flex justify-between items-start flex-wrap gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-xl font-bold text-[#e8f0f0]">{pool.name}</h3>
                                                            <span className="badge badge-gray">
                                                                {pool.status.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <p className="text-[#a0b4b8] text-sm">
                                                            {new Date(pool.start_date).toLocaleDateString()} - {new Date(pool.end_date).toLocaleDateString()}
                                                        </p>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                            <div>
                                                                <p className="text-xs text-[#6a7e82]">Total Pool Value</p>
                                                                <p className="font-semibold text-[#e8f0f0]">{formatCurrency(pool.current_total)}</p>
                                                            </div>
                                                            {userPoolHistory && (
                                                                <>
                                                                    <div>
                                                                        <p className="text-xs text-[#6a7e82]">Your Investment</p>
                                                                        <p className="font-semibold text-[#4aa0ff]">{formatCurrency(userPoolHistory.amount)}</p>
                                                                    </div>
                                                                    {poolProfit && (
                                                                        <>
                                                                            <div>
                                                                                <p className="text-xs text-[#6a7e82]">Profit/Loss</p>
                                                                                <p className={`font-semibold ${poolProfit.profit_loss >= 0 ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'}`}>
                                                                                    {poolProfit.profit_loss >= 0 ? '+' : ''}{formatCurrency(poolProfit.profit_loss)}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-xs text-[#6a7e82]">Return %</p>
                                                                                <p className={`font-semibold ${poolProfit.return_percentage >= 0 ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'}`}>
                                                                                    {poolProfit.return_percentage >= 0 ? '+' : ''}{poolProfit.return_percentage?.toFixed(2)}%
                                                                                </p>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                        {!userPoolHistory && (
                                                            <p className="text-sm text-[#6a7e82] mt-2">You did not invest in this pool</p>
                                                        )}
                                                    </div>
                                                    {userPoolHistory && (
                                                        <Link 
                                                            to={`/pool/${pool.id}/history`}
                                                            className="btn btn-outline mt-4 md:mt-0"
                                                        >
                                                            View Details →
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* User Contribution History Table */}
                    {filteredHistory.length > 0 && (
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover">
                            <div className="p-6 border-b border-[#2a3538]">
                                <h2 className="text-xl font-bold text-[#e8f0f0] flex items-center">
                                    <span className="mr-2">📋</span>
                                    Your Contribution History
                                </h2>
                                <p className="text-[#6a7e82] text-sm mt-1">
                                    Showing {filteredHistory.length} of {userHistory.length} contributions
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="table-dark">
                                    <thead>
                                        <tr>
                                            <th>Pool</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Share %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredHistory.map((contribution) => {
                                            const pool = pools.find(p => p.id === contribution.pool_id);
                                            const share = pool && pool.current_total > 0 
                                                ? (parseFloat(contribution.amount) / parseFloat(pool.current_total)) * 100 
                                                : 0;
                                            
                                            return (
                                                <tr key={contribution.id} className="hover:bg-[#1c2426] transition">
                                                    <td className="p-4 font-medium text-[#e8f0f0]">{contribution.pool_name}</td>
                                                    <td className="p-4 font-semibold text-[#00d4aa]">{formatCurrency(contribution.amount)}</td>
                                                    <td className="p-4 text-[#a0b4b8]">{new Date(contribution.created_at).toLocaleDateString()}</td>
                                                    <td className="p-4">
                                                        <span className={`badge ${
                                                            contribution.status === 'confirmed' 
                                                                ? 'badge-success'
                                                                : 'badge-warning'
                                                        }`}>
                                                            {contribution.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-[#a0b4b8]">{share.toFixed(2)}%</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Profit/Loss Summary Chart */}
                    {profitLossHistory.length > 0 && (
                        <div className="mt-8 bg-gradient-to-r from-[#00d4aa]/10 to-[#00b894]/10 border border-[#00d4aa]/20 rounded-2xl p-6 card-hover">
                            <h2 className="text-xl font-bold text-[#e8f0f0] mb-4 flex items-center">
                                <span className="mr-2">📈</span>
                                Profit/Loss Summary by Pool
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {profitLossHistory.map((profit, idx) => (
                                    <div key={idx} className="bg-[#1c2426] border border-[#2a3538] rounded-xl p-4 card-hover">
                                        <p className="font-semibold text-[#e8f0f0]">{profit.pool_name}</p>
                                        <div className="flex justify-between mt-2 text-[#a0b4b8]">
                                            <span className="text-sm">Investment:</span>
                                            <span className="font-semibold text-[#e8f0f0]">{formatCurrency(profit.investment)}</span>
                                        </div>
                                        <div className="flex justify-between mt-1 text-[#a0b4b8]">
                                            <span className="text-sm">Profit/Loss:</span>
                                            <span className={`font-semibold ${profit.profit_loss >= 0 ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'}`}>
                                                {profit.profit_loss >= 0 ? '+' : ''}{formatCurrency(profit.profit_loss)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between mt-1 text-[#a0b4b8]">
                                            <span className="text-sm">Return:</span>
                                            <span className={`font-semibold ${profit.return_percentage >= 0 ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'}`}>
                                                {profit.return_percentage >= 0 ? '+' : ''}{profit.return_percentage?.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {userHistory.length === 0 && closedPools.length === 0 && (
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-12 text-center card-hover">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-[#a0b4b8] text-lg">No trading history yet</p>
                            <p className="text-[#6a7e82] mt-2">Start by contributing to an active pool!</p>
                            <Link to="/pools/active" className="inline-block mt-6 btn btn-primary">
                                View Active Pools →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default History;