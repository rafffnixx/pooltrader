import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminComplete = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [analytics, setAnalytics] = useState({});
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formData, setFormData] = useState({});
    const [userDetails, setUserDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [newPool, setNewPool] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        total_target: '',
        min_contribution: 500,
        max_contribution: 20000,
        manager_fee_percent: 20
    });
    const [profitDistribution, setProfitDistribution] = useState({
        poolId: '',
        totalProfit: '',
        managementFee: 20,
        distributing: false
    });

    useEffect(() => {
        if (user?.isAdmin) {
            fetchData();
        }
    }, [activeTab, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard') {
                const response = await api.get('/admin/analytics');
                if (response.data.success) {
                    setAnalytics(response.data.analytics);
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
            if (activeTab === 'transactions') {
                const response = await api.get('/admin/transactions');
                if (response.data.success) {
                    setTransactions(response.data.transactions);
                }
            }
            if (activeTab === 'withdrawals') {
                const response = await api.get('/admin/withdrawals');
                if (response.data.success) {
                    setWithdrawals(response.data.withdrawals);
                }
            }
            if (activeTab === 'pools') {
                const response = await api.get('/admin/pools');
                if (response.data.success) {
                    setPools(response.data.pools);
                }
            }
            if (activeTab === 'profits') {
                const response = await api.get('/admin/pools');
                if (response.data.success) {
                    setPools(response.data.pools);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePool = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/create-pool', newPool);
            if (response.data.success) {
                toast.success('Pool created successfully!');
                setShowModal(false);
                setNewPool({
                    name: '',
                    description: '',
                    start_date: '',
                    end_date: '',
                    total_target: '',
                    min_contribution: 500,
                    max_contribution: 20000,
                    manager_fee_percent: 20
                });
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create pool');
        }
    };

    const handleRecordDeposit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/deposit-request', formData);
            if (response.data.success) {
                toast.success('Deposit request recorded. Awaiting payment verification.');
                setShowModal(false);
                fetchData();
                setFormData({});
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record deposit');
        }
    };

    const handleUpdateTransactionStatus = async (transactionId, status) => {
        try {
            const response = await api.put(`/admin/transaction/${transactionId}/status`, { status });
            if (response.data.success) {
                toast.success(`Transaction ${status === 'completed' ? 'verified' : 'rejected'}`);
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to update transaction status');
        }
    };

    const handleProcessWithdrawal = async (withdrawalId, action) => {
        const adminNotes = prompt('Enter admin notes (optional):');
        try {
            const response = await api.post(`/admin/process-withdrawal/${withdrawalId}`, {
                action: action,
                admin_notes: adminNotes || ''
            });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process withdrawal');
        }
    };

    const handleDistributeProfits = async (e) => {
        e.preventDefault();
        setProfitDistribution({ ...profitDistribution, distributing: true });
        try {
            const response = await api.post(`/profits/calculate/${profitDistribution.poolId}`, {
                total_profit: parseFloat(profitDistribution.totalProfit),
                management_fee_percent: parseFloat(profitDistribution.managementFee)
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setProfitDistribution({
                    poolId: '',
                    totalProfit: '',
                    managementFee: 20,
                    distributing: false
                });
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to distribute profits');
            setProfitDistribution({ ...profitDistribution, distributing: false });
        }
    };

    const viewUserDetails = async (userId) => {
        try {
            const response = await api.get(`/admin/user-details/${userId}`);
            if (response.data.success) {
                setUserDetails(response.data);
                setShowModal(true);
                setModalType('userDetails');
            }
        } catch (error) {
            toast.error('Failed to load user details');
        }
    };

    const handleResetUserPassword = async (userId) => {
        const newPassword = prompt('Enter new password for user (min 6 characters):');
        if (newPassword && newPassword.length >= 6) {
            try {
                await api.post(`/admin/reset-user-password/${userId}`, { newPassword });
                toast.success('Password reset successfully');
            } catch (error) {
                toast.error('Failed to reset password');
            }
        } else {
            toast.error('Password must be at least 6 characters');
        }
    };

    const filteredUsers = users.filter(u => 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTransactions = transactions.filter(t => {
        if (!dateRange.start && !dateRange.end) return true;
        const transactionDate = new Date(t.created_at);
        if (dateRange.start && transactionDate < new Date(dateRange.start)) return false;
        if (dateRange.end && transactionDate > new Date(dateRange.end)) return false;
        return true;
    });

    if (!user?.isAdmin) {
        return <Navigate to="/" />;
    }

    const renderModal = () => {
        if (!showModal) return null;

        if (modalType === 'createPool') {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Create New Pool</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <form onSubmit={handleCreatePool} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Pool Name *</label>
                                <input type="text" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    value={newPool.name} onChange={(e) => setNewPool({...newPool, name: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea rows="3" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    value={newPool.description} onChange={(e) => setNewPool({...newPool, description: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Date & Time *</label>
                                <input type="datetime-local" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    value={newPool.start_date} onChange={(e) => setNewPool({...newPool, start_date: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">End Date & Time *</label>
                                <input type="datetime-local" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    value={newPool.end_date} onChange={(e) => setNewPool({...newPool, end_date: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Target Amount ($) *</label>
                                <input type="number" step="0.01" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    value={newPool.total_target} onChange={(e) => setNewPool({...newPool, total_target: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Minimum Contribution ($)</label>
                                <input type="number" step="0.01" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    value={newPool.min_contribution} onChange={(e) => setNewPool({...newPool, min_contribution: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Maximum Contribution ($)</label>
                                <input type="number" step="0.01" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    value={newPool.max_contribution} onChange={(e) => setNewPool({...newPool, max_contribution: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Manager Fee (%)</label>
                                <input type="number" step="0.5" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    value={newPool.manager_fee_percent} onChange={(e) => setNewPool({...newPool, manager_fee_percent: e.target.value})} />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Create Pool</button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }

        if (modalType === 'deposit') {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Record Deposit Request</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <form onSubmit={handleRecordDeposit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Select User</label>
                                <select className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, user_id: e.target.value})} required>
                                    <option value="">Select User</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Amount ($)</label>
                                <input type="number" step="0.01" placeholder="Amount" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Payment Method</label>
                                <select className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, payment_method: e.target.value})} required>
                                    <option value="bank_transfer">🏦 Bank Transfer</option>
                                    <option value="usdt">₿ USDT (Crypto)</option>
                                    <option value="mpesa">📱 M-Pesa</option>
                                    <option value="card">💳 Credit Card</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Reference Number / Transaction ID</label>
                                <input type="text" placeholder="Reference Number" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, reference_number: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Admin Notes</label>
                                <textarea placeholder="Admin Notes" rows="2" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, admin_notes: e.target.value})} />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-yellow-600 text-white rounded-lg">Record Deposit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }

        if (modalType === 'userDetails' && userDetails) {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">User Details</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                            <div><p className="text-sm text-gray-500">Full Name</p><p className="font-semibold text-lg">{userDetails.user.full_name}</p></div>
                            <div><p className="text-sm text-gray-500">Email</p><p className="font-semibold">{userDetails.user.email}</p></div>
                            <div><p className="text-sm text-gray-500">Current Balance</p><p className="font-semibold text-2xl text-green-600">${userDetails.user.current_balance?.toLocaleString()}</p></div>
                            <div><p className="text-sm text-gray-500">Total Deposited</p><p className="font-semibold text-blue-600">${userDetails.user.total_deposited?.toLocaleString()}</p></div>
                            <div><p className="text-sm text-gray-500">Total Withdrawn</p><p className="font-semibold text-red-600">${userDetails.user.total_withdrawn?.toLocaleString()}</p></div>
                            <div><p className="text-sm text-gray-500">Joined Date</p><p className="font-semibold">{new Date(userDetails.user.joined_date).toLocaleDateString()}</p></div>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Transaction History</h3>
                        <div className="overflow-x-auto mb-4">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3 text-left">Date</th>
                                        <th className="p-3 text-left">Type</th>
                                        <th className="p-3 text-left">Amount</th>
                                        <th className="p-3 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userDetails.transactions?.map(t => (
                                        <tr key={t.id} className="border-b">
                                            <td className="p-3">{new Date(t.created_at).toLocaleDateString()}</td>
                                            <td className="p-3 capitalize">{t.type}</td>
                                            <td className="p-3 font-semibold text-green-600">${Math.abs(t.amount).toLocaleString()}</td>
                                            <td className="p-3"><span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">{t.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => handleResetUserPassword(userDetails.user.id)} className="px-4 py-2 bg-yellow-600 text-white rounded-lg">Reset Password</button>
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Close</button>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading admin dashboard...</p>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Users', value: analytics.totalUsers || 0, icon: '👥' },
        { title: 'Total Contributions', value: `$${(analytics.totalContributions || 0).toLocaleString()}`, icon: '💰' },
        { title: 'Pending Withdrawals', value: `$${(analytics.pendingWithdrawals || 0).toLocaleString()}`, icon: '🏦' },
        { title: 'Total Pools', value: pools.length, icon: '🏊' },
    ];

    return (
        <>
            <SEO title="Admin Panel - PoolTrader" description="Complete administration panel" />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin Control Panel</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage users, deposits, withdrawals, pools, and platform settings</p>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-8">
                        <button onClick={() => { setModalType('createPool'); setShowModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">🏊 Create Pool</button>
                        <button onClick={() => { setModalType('deposit'); setShowModal(true); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">💰 Record Deposit</button>
                    </div>
                    
                    <div className="flex flex-wrap border-b dark:border-gray-700 mb-8 gap-1">
                        {['dashboard', 'users', 'transactions', 'withdrawals', 'pools', 'profits'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-semibold transition capitalize rounded-t-lg ${activeTab === tab ? 'bg-white dark:bg-gray-800 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>{tab}</button>
                        ))}
                    </div>

                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {statCards.map((stat, index) => (
                                    <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                        <div className="text-3xl mb-2">{stat.icon}</div>
                                        <h3 className="text-2xl font-bold">{stat.value}</h3>
                                        <p className="text-gray-500 text-sm mt-1">{stat.title}</p>
                                    </div>
                                ))}
                            </div>
                            {analytics.poolProgress && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
                                    <h2 className="text-xl font-bold mb-4">Active Pool Progress</h2>
                                    <div className="flex justify-between mb-2">
                                        <span>${analytics.poolProgress.current.toLocaleString()}</span>
                                        <span>Target: ${analytics.poolProgress.total.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full" style={{width: `${analytics.poolProgress.percentage}%`}}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div>
                            <div className="mb-4">
                                <input type="text" placeholder="🔍 Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-96 px-4 py-2 border rounded-lg" />
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-x-auto">
                                <table className="w-full min-w-[600px]">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-4 text-left">ID</th>
                                            <th className="p-4 text-left">Name</th>
                                            <th className="p-4 text-left">Email</th>
                                            <th className="p-4 text-left">Balance</th>
                                            <th className="p-4 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} className="border-b">
                                                <td className="p-4">{u.id}</td>
                                                <td className="p-4 font-medium">{u.full_name}</td>
                                                <td className="p-4">{u.email}</td>
                                                <td className="p-4 font-bold text-green-600">${parseFloat(u.current_balance || 0).toLocaleString()}</td>
                                                <td className="p-4">
                                                    <button onClick={() => viewUserDetails(u.id)} className="text-blue-600 hover:text-blue-800 mr-3">👁️</button>
                                                    <button onClick={() => handleResetUserPassword(u.id)} className="text-yellow-600 hover:text-yellow-800">🔑</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Transactions Tab */}
                    {activeTab === 'transactions' && (
                        <div>
                            <div className="flex flex-wrap gap-4 mb-4">
                                <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="px-4 py-2 border rounded-lg" />
                                <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="px-4 py-2 border rounded-lg" />
                                <button onClick={() => setDateRange({ start: '', end: '' })} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Clear Filters</button>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">User</th>
                                            <th className="p-4">Type</th>
                                            <th className="p-4">Amount</th>
                                            <th className="p-4">Method</th>
                                            <th className="p-4">Reference</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.map(t => (
                                            <tr key={t.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4">{new Date(t.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 font-medium">{t.user_name}</td>
                                                <td className="p-4 capitalize">{t.type}</td>
                                                <td className="p-4 font-semibold">${parseFloat(t.amount).toLocaleString()}</td>
                                                <td className="p-4">{t.payment_method || '-'}</td>
                                                <td className="p-4 text-xs font-mono">{t.reference_number || '-'}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        t.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                        t.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {t.status === 'completed' ? '✓ Verified' : t.status === 'pending' ? '⏳ Pending' : '✗ Rejected'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {t.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleUpdateTransactionStatus(t.id, 'completed')} className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">Verify</button>
                                                            <button onClick={() => handleUpdateTransactionStatus(t.id, 'failed')} className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">Reject</button>
                                                        </div>
                                                    )}
                                                    {t.status === 'completed' && <span className="text-green-600 text-xs">✓ Completed</span>}
                                                    {t.status === 'failed' && <span className="text-red-600 text-xs">✗ Rejected</span>}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredTransactions.length === 0 && (
                                            <tr>
                                                <td colSpan="8" className="p-8 text-center text-gray-500">No transactions found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Withdrawals Tab */}
                    {activeTab === 'withdrawals' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">User</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {withdrawals.map(w => (
                                        <tr key={w.id} className="border-b">
                                            <td className="p-4">{new Date(w.request_date).toLocaleDateString()}</td>
                                            <td className="p-4">{w.user_name}</td>
                                            <td className="p-4">${parseFloat(w.amount).toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    w.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    w.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {w.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {w.status === 'pending' && (
                                                    <div className="flex gap-1">
                                                        <button onClick={() => handleProcessWithdrawal(w.id, 'approve')} className="bg-green-600 text-white px-2 py-1 rounded text-sm">Approve</button>
                                                        <button onClick={() => handleProcessWithdrawal(w.id, 'reject')} className="bg-red-600 text-white px-2 py-1 rounded text-sm">Reject</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {withdrawals.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-gray-500">No withdrawal requests</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pools Tab */}
                    {activeTab === 'pools' && (
                        <div className="space-y-4">
                            <button onClick={() => { setModalType('createPool'); setShowModal(true); }} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Create New Pool</button>
                            {pools.map(pool => (
                                <div key={pool.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                    <div className="flex justify-between items-start flex-wrap">
                                        <div>
                                            <h3 className="text-xl font-bold">{pool.name}</h3>
                                            <p className="text-gray-500 text-sm">{new Date(pool.start_date).toLocaleDateString()} - {new Date(pool.end_date).toLocaleDateString()}</p>
                                            <div className="mt-2 grid grid-cols-2 gap-4">
                                                <p>Target: ${parseFloat(pool.total_target).toLocaleString()}</p>
                                                <p>Current: ${parseFloat(pool.current_total).toLocaleString()}</p>
                                                <p>Members: {pool.member_count || 0}</p>
                                                <p>Min: ${parseFloat(pool.min_contribution).toLocaleString()}</p>
                                                <p>Max: ${parseFloat(pool.max_contribution).toLocaleString()}</p>
                                                <p>Fee: {pool.manager_fee_percent}%</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-sm ${pool.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{pool.status.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Profits Tab */}
                    {activeTab === 'profits' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold mb-4">💰 Profit Distribution</h2>
                                <p className="text-gray-600 mb-4">Enter the total profit made from trading to distribute to investors.</p>
                                <form onSubmit={handleDistributeProfits} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Select Pool</label>
                                        <select value={profitDistribution.poolId} onChange={(e) => setProfitDistribution({...profitDistribution, poolId: e.target.value})} className="w-full p-2 border rounded-lg" required>
                                            <option value="">Select Pool</option>
                                            {pools.filter(p => p.status === 'open' || p.status === 'active').map(p => (
                                                <option key={p.id} value={p.id}>{p.name} (${parseFloat(p.current_total).toLocaleString()} raised)</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Total Profit Made ($)</label>
                                        <input type="number" step="0.01" placeholder="Enter total profit" value={profitDistribution.totalProfit} onChange={(e) => setProfitDistribution({...profitDistribution, totalProfit: e.target.value})} className="w-full p-2 border rounded-lg" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Management Fee (%)</label>
                                        <input type="number" step="0.5" placeholder="Management Fee %" value={profitDistribution.managementFee} onChange={(e) => setProfitDistribution({...profitDistribution, managementFee: e.target.value})} className="w-full p-2 border rounded-lg" />
                                    </div>
                                    <button type="submit" disabled={profitDistribution.distributing} className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                                        {profitDistribution.distributing ? 'Distributing...' : '📊 Calculate & Distribute Profits'}
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold mb-4">📈 How It Works</h2>
                                <div className="space-y-4">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <div className="font-bold text-blue-600">Example:</div>
                                        <p>Pool Total: $10,000 | Your Contribution: $1,000 (10% share)</p>
                                        <p>Pool Profit: $5,000 → Your share: $500</p>
                                        <p>Management Fee (20%): $100 → You receive: $400</p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <div className="font-bold text-green-600">Formula:</div>
                                        <p>Your Profit = (Pool Profit × Your Contribution %)</p>
                                        <p>Final Amount = Your Profit - (Your Profit × Fee %)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {renderModal()}
                </div>
            </div>
        </>
    );
};

export default AdminComplete;