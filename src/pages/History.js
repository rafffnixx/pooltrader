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
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your trading history...</p>
                </div>
            </div>
        );
    }

    const closedPools = pools.filter(p => p.status === 'closed' || p.status === 'settled');

    return (
        <>
            <SEO title="History - PoolTrader" description="Your complete trading history and performance" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="inline-block p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
                            <span className="text-4xl">📊</span>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Trading History & Performance
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
                            Track your investments, profits, and trading performance over time
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                            <div className="text-3xl mb-2">💰</div>
                            <p className="text-3xl font-bold text-blue-600">${totalInvested.toLocaleString()}</p>
                            <p className="text-gray-500 text-sm">Total Invested</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                            <div className="text-3xl mb-2">📈</div>
                            <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
                            </p>
                            <p className="text-gray-500 text-sm">Total Profit/Loss</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                            <div className="text-3xl mb-2">📊</div>
                            <p className={`text-3xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                            </p>
                            <p className="text-gray-500 text-sm">Total Return</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-8">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="🔍 Search by pool name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                            <div>
                                <select
                                    value={selectedPool}
                                    onChange={(e) => setSelectedPool(e.target.value)}
                                    className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
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
                                    className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="all">All Time</option>
                                    <option value="month">Last Month</option>
                                    <option value="year">Last Year</option>
                                </select>
                            </div>
                            {userHistory.length > 0 && (
                                <button
                                    onClick={exportToCSV}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                                >
                                    📥 Export History
                                </button>
                            )}
                            {profitLossHistory.length > 0 && (
                                <button
                                    onClick={exportProfitLoss}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                                >
                                    📊 Export P&L
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Past Trading Sessions */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 flex items-center">
                            <span className="mr-2">🏆</span>
                            Past Trading Sessions
                        </h2>
                        {closedPools.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                                <div className="text-6xl mb-4">📅</div>
                                <p className="text-gray-500 text-lg">No past sessions available yet.</p>
                                <p className="text-sm text-gray-400 mt-2">Check back after the current session ends.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {closedPools.map((pool) => {
                                    const userPoolHistory = userHistory.find(h => h.pool_id === pool.id);
                                    const poolProfit = profitLossHistory.find(p => p.pool_id === pool.id);
                                    
                                    return (
                                        <div key={pool.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                                            <div className="h-2 bg-gradient-to-r from-gray-500 to-gray-600"></div>
                                            <div className="p-6">
                                                <div className="flex justify-between items-start flex-wrap gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-xl font-bold">{pool.name}</h3>
                                                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                                                                {pool.status.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                            {new Date(pool.start_date).toLocaleDateString()} - {new Date(pool.end_date).toLocaleDateString()}
                                                        </p>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                            <div>
                                                                <p className="text-xs text-gray-500">Total Pool Value</p>
                                                                <p className="font-semibold">${parseFloat(pool.current_total).toLocaleString()}</p>
                                                            </div>
                                                            {userPoolHistory && (
                                                                <>
                                                                    <div>
                                                                        <p className="text-xs text-gray-500">Your Investment</p>
                                                                        <p className="font-semibold text-blue-600">${parseFloat(userPoolHistory.amount).toLocaleString()}</p>
                                                                    </div>
                                                                    {poolProfit && (
                                                                        <>
                                                                            <div>
                                                                                <p className="text-xs text-gray-500">Profit/Loss</p>
                                                                                <p className={`font-semibold ${poolProfit.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                                    {poolProfit.profit_loss >= 0 ? '+' : ''}${parseFloat(poolProfit.profit_loss || 0).toLocaleString()}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-xs text-gray-500">Return %</p>
                                                                                <p className={`font-semibold ${poolProfit.return_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                                    {poolProfit.return_percentage >= 0 ? '+' : ''}{poolProfit.return_percentage?.toFixed(2)}%
                                                                                </p>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Link 
                                                        to={`/pool/${pool.id}/history`}
                                                        className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                                                    >
                                                        View Details →
                                                    </Link>
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
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b dark:border-gray-700">
                                <h2 className="text-xl font-bold flex items-center">
                                    <span className="mr-2">📋</span>
                                    Your Contribution History
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Showing {filteredHistory.length} of {userHistory.length} contributions
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="p-4 text-left">Pool</th>
                                            <th className="p-4 text-left">Amount</th>
                                            <th className="p-4 text-left">Date</th>
                                            <th className="p-4 text-left">Status</th>
                                            <th className="p-4 text-left">Share %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredHistory.map((contribution) => {
                                            const pool = pools.find(p => p.id === contribution.pool_id);
                                            const share = pool && pool.current_total > 0 
                                                ? (parseFloat(contribution.amount) / parseFloat(pool.current_total)) * 100 
                                                : 0;
                                            
                                            return (
                                                <tr key={contribution.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                    <td className="p-4 font-medium">{contribution.pool_name}</td>
                                                    <td className="p-4 font-semibold text-green-600">${parseFloat(contribution.amount).toLocaleString()}</td>
                                                    <td className="p-4">{new Date(contribution.created_at).toLocaleDateString()}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                            contribution.status === 'confirmed' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {contribution.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">{share.toFixed(2)}%</td>
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
                        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center">
                                <span className="mr-2">📈</span>
                                Profit/Loss Summary by Pool
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {profitLossHistory.map((profit, idx) => (
                                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4">
                                        <p className="font-semibold">{profit.pool_name}</p>
                                        <div className="flex justify-between mt-2">
                                            <span className="text-sm text-gray-500">Investment:</span>
                                            <span className="font-semibold">${parseFloat(profit.investment).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-sm text-gray-500">Profit/Loss:</span>
                                            <span className={`font-semibold ${profit.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {profit.profit_loss >= 0 ? '+' : ''}${parseFloat(profit.profit_loss || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-sm text-gray-500">Return:</span>
                                            <span className={`font-semibold ${profit.return_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-gray-500 text-lg">No trading history yet</p>
                            <p className="text-gray-400 mt-2">Start by contributing to an active pool!</p>
                            <Link to="/pools/active" className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
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