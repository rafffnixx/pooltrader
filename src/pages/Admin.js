import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import api from '../services/api';
import toast from 'react-hot-toast';

const Admin = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [pools, setPools] = useState([]);
    const [trades, setTrades] = useState([]);
    const [contributions, setContributions] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (user?.isAdmin) {
            fetchAllData();
        }
    }, [activeTab]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard') {
                const response = await api.get('/admin/dashboard-stats');
                if (response.data.success) {
                    setStats(response.data.stats);
                }
                const usersRes = await api.get('/admin/users');
                if (usersRes.data.success) {
                    setUsers(usersRes.data.users);
                }
            }
            if (activeTab === 'users') {
                const response = await api.get('/admin/users');
                if (response.data.success) {
                    setUsers(response.data.users);
                }
            }
            if (activeTab === 'pools') {
                const response = await api.get('/admin/pools');
                if (response.data.success) {
                    setPools(response.data.pools);
                }
            }
            if (activeTab === 'trades') {
                const response = await api.get('/admin/trades');
                if (response.data.success) {
                    setTrades(response.data.trades);
                }
            }
            if (activeTab === 'contributions') {
                const response = await api.get('/admin/contributions');
                if (response.data.success) {
                    setContributions(response.data.contributions);
                }
            }
            if (activeTab === 'withdrawals') {
                const response = await api.get('/admin/withdrawals');
                if (response.data.success) {
                    setWithdrawals(response.data.withdrawals);
                }
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/users', formData);
            if (response.data.success) {
                toast.success('User created successfully');
                setShowModal(false);
                fetchAllData();
                setFormData({});
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleCreatePool = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/pools', formData);
            if (response.data.success) {
                toast.success('Pool created successfully');
                setShowModal(false);
                fetchAllData();
                setFormData({});
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create pool');
        }
    };

    const handleCreateTrade = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/trades', formData);
            if (response.data.success) {
                toast.success('Trade created successfully');
                setShowModal(false);
                fetchAllData();
                setFormData({});
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create trade');
        }
    };

    const handleApproveWithdrawal = async (withdrawalId) => {
        try {
            const response = await api.post(`/admin/withdrawals/${withdrawalId}/approve`);
            if (response.data.success) {
                toast.success('Withdrawal approved');
                fetchAllData();
            }
        } catch (error) {
            toast.error('Failed to approve withdrawal');
        }
    };

    const handleResetPassword = async (userId) => {
        const newPassword = prompt('Enter new password:');
        if (newPassword) {
            try {
                await api.post(`/admin/users/${userId}/reset-password`, { new_password: newPassword });
                toast.success('Password reset successfully');
            } catch (error) {
                toast.error('Failed to reset password');
            }
        }
    };

    if (!user?.isAdmin) {
        return <Navigate to="/" />;
    }

    const renderModal = () => {
        if (!showModal) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4">
                        {modalType === 'user' && 'Create New User'}
                        {modalType === 'pool' && 'Create New Pool'}
                        {modalType === 'trade' && 'Create New Trade'}
                    </h2>
                    
                    <form onSubmit={
                        modalType === 'user' ? handleCreateUser :
                        modalType === 'pool' ? handleCreatePool :
                        handleCreateTrade
                    }>
                        {modalType === 'user' && (
                            <>
                                <input type="email" placeholder="Email" className="w-full p-2 mb-3 border rounded dark:bg-gray-700" 
                                    onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                                <input type="text" placeholder="Full Name" className="w-full p-2 mb-3 border rounded dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})} required />
                                <input type="password" placeholder="Password" className="w-full p-2 mb-3 border rounded dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                                <label className="flex items-center mb-3">
                                    <input type="checkbox" className="mr-2" 
                                        onChange={(e) => setFormData({...formData, is_admin: e.target.checked})} />
                                    Is Admin
                                </label>
                            </>
                        )}
                        
                        {modalType === 'pool' && (
                            <>
                                <input type="text" placeholder="Pool Name" className="w-full p-2 mb-3 border rounded dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                <textarea placeholder="Description" className="w-full p-2 mb-3 border rounded dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, description: e.target.value})} />
                                <input type="date" placeholder="Start Date" className="w-full p-2 mb-3 border rounded dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, start_date: e.target.value})} required />
                                <input type="date" placeholder="End Date" className="w-full p-2 mb-3 border rounded dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, end_date: e.target.value})} required />
                                <input type="number" placeholder="Target Amount" className="w-full p-2 mb-3 border rounded dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, total_target: e.target.value})} required />
                                <input type="number" placeholder="Min Contribution" className="w-full p-2 mb-3 border rounded dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, min_contribution: e.target.value})} />
                                <input type="number" placeholder="Max Contribution" className="w-full p-2 mb-3 border rounded dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, max_contribution: e.target.value})} />
                            </>
                        )}
                        
                        {modalType === 'trade' && (
                            <>
                                <input type="number" placeholder="Pool ID" className="w-full p-2 mb-3 border rounded dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, pool_id: e.target.value})} required />
                                <input type="text" placeholder="Symbol (e.g., EUR/USD)" className="w-full p-2 mb-3 border rounded dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, symbol: e.target.value})} required />
                                <select className="w-full p-2 mb-3 border rounded dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, direction: e.target.value})} required>
                                    <option value="">Select Direction</option>
                                    <option value="BUY">BUY</option>
                                    <option value="SELL">SELL</option>
                                </select>
                                <input type="number" placeholder="Volume" step="0.01" className="w-full p-2 mb-3 border rounded dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, volume: e.target.value})} required />
                                <input type="number" placeholder="Open Price" step="0.0001" className="w-full p-2 mb-3 border rounded dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, open_price: e.target.value})} required />
                            </>
                        )}
                        
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <SEO title="Admin Panel - PoolTrader" description="Administration panel" />
            
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                    <h1 className="text-3xl font-bold">Admin Panel</h1>
                    <div className="flex space-x-3 flex-wrap gap-2">
                        <button onClick={() => { setModalType('user'); setShowModal(true); }} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                            + Add User
                        </button>
                        <button onClick={() => { setModalType('pool'); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            + Create Pool
                        </button>
                        <button onClick={() => { setModalType('trade'); setShowModal(true); }} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                            + Add Trade
                        </button>
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="flex flex-wrap border-b dark:border-gray-700 mb-8 gap-2">
                    {['dashboard', 'users', 'pools', 'trades', 'contributions', 'withdrawals'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-semibold transition capitalize ${
                                activeTab === tab 
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <p className="text-gray-500 text-sm">Total Users</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.totalUsers || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <p className="text-gray-500 text-sm">Total Pools</p>
                            <p className="text-3xl font-bold text-green-600">{stats.totalPools || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <p className="text-gray-500 text-sm">Total Trades</p>
                            <p className="text-3xl font-bold text-purple-600">{stats.totalTrades || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <p className="text-gray-500 text-sm">Total Contributions</p>
                            <p className="text-3xl font-bold text-orange-600">${(stats.totalContributions || 0).toLocaleString()}</p>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="p-4 text-left">ID</th>
                                    <th className="p-4 text-left">Name</th>
                                    <th className="p-4 text-left">Email</th>
                                    <th className="p-4 text-left">Balance</th>
                                    <th className="p-4 text-left">Admin</th>
                                    <th className="p-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="border-b dark:border-gray-700">
                                        <td className="p-4">{u.id}</td>
                                        <td className="p-4 font-medium">{u.full_name}</td>
                                        <td className="p-4">{u.email}</td>
                                        <td className="p-4">${parseFloat(u.current_balance || 0).toLocaleString()}</td>
                                        <td className="p-4">{u.is_admin ? '✓' : '-'}</td>
                                        <td className="p-4">
                                            <button onClick={() => handleResetPassword(u.id)} className="text-blue-600 hover:underline mr-3">
                                                Reset PW
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pools Tab */}
                {activeTab === 'pools' && (
                    <div className="space-y-4">
                        {pools.map(pool => (
                            <div key={pool.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <div className="flex justify-between items-start flex-wrap">
                                    <div>
                                        <h3 className="text-xl font-bold">{pool.name}</h3>
                                        <p className="text-gray-600 text-sm">{new Date(pool.start_date).toLocaleDateString()} - {new Date(pool.end_date).toLocaleDateString()}</p>
                                        <p className="mt-2">Target: ${parseFloat(pool.total_target).toLocaleString()} | Current: ${parseFloat(pool.current_total || 0).toLocaleString()}</p>
                                        <p>Members: {pool.member_count || 0} | Trades: {pool.trade_count || 0}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                        pool.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {pool.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Trades Tab */}
                {activeTab === 'trades' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="p-4">Pool</th>
                                    <th className="p-4">Symbol</th>
                                    <th className="p-4">Direction</th>
                                    <th className="p-4">Volume</th>
                                    <th className="p-4">Entry</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trades.map(trade => (
                                    <tr key={trade.id} className="border-b dark:border-gray-700">
                                        <td className="p-4">{trade.pool_name}</td>
                                        <td className="p-4">{trade.symbol}</td>
                                        <td className="p-4">{trade.direction}</td>
                                        <td className="p-4">{trade.volume}</td>
                                        <td className="p-4">${parseFloat(trade.open_price).toFixed(4)}</td>
                                        <td className="p-4">{trade.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Contributions Tab */}
                {activeTab === 'contributions' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Pool</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Share %</th>
                                    <th className="p-4">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contributions.map(c => (
                                    <tr key={c.id} className="border-b dark:border-gray-700">
                                        <td className="p-4">{c.user_name}</td>
                                        <td className="p-4">{c.pool_name}</td>
                                        <td className="p-4">${parseFloat(c.amount).toLocaleString()}</td>
                                        <td className="p-4">{parseFloat(c.percentage_share || 0).toFixed(2)}%</td>
                                        <td className="p-4">{new Date(c.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Withdrawals Tab */}
                {activeTab === 'withdrawals' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Request Date</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawals.map(w => (
                                    <tr key={w.id} className="border-b dark:border-gray-700">
                                        <td className="p-4">{w.user_name}</td>
                                        <td className="p-4">${parseFloat(w.amount).toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                w.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {w.status}
                                            </span>
                                        </td>
                                        <td className="p-4">{new Date(w.request_date).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            {w.status === 'pending' && (
                                                <button onClick={() => handleApproveWithdrawal(w.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                                                    Approve
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {renderModal()}
            </div>
        </>
    );
};

export default Admin;