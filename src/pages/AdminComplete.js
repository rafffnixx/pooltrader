import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import api from '../services/api';
import toast from 'react-hot-toast';

// DateTimePicker Component for editable time
const DateTimePicker = ({ value, onChange, label }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-[#a0b4b8] mb-1">{label}</label>}
      {isEditing ? (
        <div className="flex gap-2">
          <input
            type="datetime-local"
            className="w-full p-2 border border-[#2a3538] rounded-lg bg-[#1c2426] text-[#e8f0f0] focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
          />
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-2 bg-[#00d4aa] text-[#0a0e0f] rounded-lg hover:bg-[#00b894] transition font-semibold"
          >
            ✓
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-2 bg-[#2a3538] text-[#a0b4b8] rounded-lg hover:bg-[#3a4a4e] transition"
          >
            ✕
          </button>
        </div>
      ) : (
        <div 
          className="w-full p-2 bg-[#1c2426] border border-[#2a3538] rounded-lg cursor-pointer hover:border-[#00d4aa] transition flex justify-between items-center"
          onClick={() => setIsEditing(true)}
        >
          <span className="text-[#e8f0f0]">{value ? new Date(value).toLocaleString() : 'Click to set time'}</span>
          <span className="text-xs text-[#6a7e82]">✎ Edit</span>
        </div>
      )}
    </div>
  );
};

// Helper function to format currency
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '-';
  const num = parseFloat(value);
  if (isNaN(num)) return '-';
  return `$${num.toLocaleString()}`;
};

const AdminComplete = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [analytics, setAnalytics] = useState({});
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [pools, setPools] = useState([]);
    const [trades, setTrades] = useState([]);
    const [openTrades, setOpenTrades] = useState([]);
    const [selectedPool, setSelectedPool] = useState(null);
    const [showTradeModal, setShowTradeModal] = useState(false);
    const [showClosePoolModal, setShowClosePoolModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formData, setFormData] = useState({});
    const [userDetails, setUserDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    
    // Trade Form - Opening (Frontend uses lot_size, sends as volume to backend)
    const [tradeForm, setTradeForm] = useState({
        symbol: 'EUR/USD',
        direction: 'BUY',
        lot_size: '',        // Frontend name
        open_price: '',
        stake: '',           // Frontend name (sends as entry_amount)
        stop_loss: '',
        take_profit: '',
        notes: '',
        open_time: new Date().toISOString().slice(0, 16)
    });
    
    // Close Form
    const [closeFormData, setCloseFormData] = useState({
        close_price: '',
        exit_amount: '',     // Backend name
        closed_reason: '',
        close_time: new Date().toISOString().slice(0, 16)
    });
    const [closingTrade, setClosingTrade] = useState(null);
    const [showCloseModal, setShowCloseModal] = useState(false);
    
    // Auto-calculated P/L (display only)
    const [calculatedPL, setCalculatedPL] = useState(0);

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

    // Auto-calculate P/L when exit_amount changes
    useEffect(() => {
        if (closingTrade) {
            const stake = parseFloat(closingTrade.stake || closingTrade.entry_amount || 0);
            const exit = parseFloat(closeFormData.exit_amount) || 0;
            const pl = exit - stake;
            setCalculatedPL(pl);
        }
    }, [closeFormData.exit_amount, closingTrade]);

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
                const poolsRes = await api.get('/admin/pools');
                if (poolsRes.data.success) {
                    setPools(poolsRes.data.pools);
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
            if (activeTab === 'trades') {
                const tradesRes = await api.get('/admin/trades');
                if (tradesRes.data.success) {
                    setTrades(tradesRes.data.trades);
                }
                const openRes = await api.get('/admin/open-positions');
                if (openRes.data.success) {
                    setOpenTrades(openRes.data.positions);
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

    // OPEN TRADE - Maps frontend fields to backend fields
    const handleAddTrade = async (e) => {
        e.preventDefault();
        
        try {
            const response = await api.post('/admin/trade-management/trade', {
                // Map frontend fields to backend expectations
                symbol: tradeForm.symbol,
                direction: tradeForm.direction,
                volume: parseFloat(tradeForm.lot_size) || 0,           // lot_size → volume
                open_price: parseFloat(tradeForm.open_price) || 0,
                entry_amount: parseFloat(tradeForm.stake) || 0,        // stake → entry_amount
                stop_loss: tradeForm.stop_loss ? parseFloat(tradeForm.stop_loss) : null,
                take_profit: tradeForm.take_profit ? parseFloat(tradeForm.take_profit) : null,
                pool_id: selectedPool?.id,
                notes: tradeForm.notes || '',
                open_time: tradeForm.open_time ? new Date(tradeForm.open_time).toISOString() : new Date().toISOString()
            });
            
            if (response.data.success) {
                toast.success('✅ Trade opened successfully!');
                setShowTradeModal(false);
                setTradeForm({
                    symbol: 'EUR/USD',
                    direction: 'BUY',
                    lot_size: '',
                    open_price: '',
                    stake: '',
                    stop_loss: '',
                    take_profit: '',
                    notes: '',
                    open_time: new Date().toISOString().slice(0, 16)
                });
                fetchData();
            }
        } catch (error) {
            console.error('Add trade error:', error);
            toast.error(error.response?.data?.message || 'Failed to add trade');
        }
    };

    // CLOSE TRADE
    const handleCloseTrade = async (tradeId) => {
        try {
            const tradeResponse = await api.get(`/admin/trades/${tradeId}`);
            if (tradeResponse.data.success) {
                const trade = tradeResponse.data.trade;
                setClosingTrade(trade);
                setCloseFormData({
                    close_price: '',
                    exit_amount: '',
                    closed_reason: '',
                    close_time: new Date().toISOString().slice(0, 16)
                });
                setCalculatedPL(0);
                setShowCloseModal(true);
            }
        } catch (error) {
            toast.error('Failed to load trade details');
        }
    };

    const confirmCloseTrade = async (e) => {
        e.preventDefault();
        
        const stake = parseFloat(closingTrade.stake || closingTrade.entry_amount || 0);
        const exitAmount = parseFloat(closeFormData.exit_amount) || 0;
        const pl = exitAmount - stake;
        
        try {
            const response = await api.post(`/admin/trade-management/trade/${closingTrade.id}/close`, {
                close_price: parseFloat(closeFormData.close_price) || 0,
                exit_amount: exitAmount,
                profit_loss: pl,
                closed_reason: closeFormData.closed_reason || 'Closed by admin',
                close_time: closeFormData.close_time ? new Date(closeFormData.close_time).toISOString() : new Date().toISOString()
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setShowCloseModal(false);
                setClosingTrade(null);
                setCloseFormData({
                    close_price: '',
                    exit_amount: '',
                    closed_reason: '',
                    close_time: new Date().toISOString().slice(0, 16)
                });
                setCalculatedPL(0);
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to close trade');
        }
    };

    const handleClosePool = async (poolId) => {
        const confirmMsg = prompt('Type "CONFIRM" to close this pool and distribute remaining balance to investors:');
        if (confirmMsg !== 'CONFIRM') {
            toast.error('Pool closure cancelled. Type "CONFIRM" to proceed.');
            return;
        }
        
        try {
            const response = await api.post(`/admin/pools/${poolId}/close`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchData();
                setShowClosePoolModal(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to close pool');
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
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto modal-dark">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-[#e8f0f0]">Create New Pool</h2>
                            <button onClick={() => setShowModal(false)} className="text-[#a0b4b8] hover:text-[#e8f0f0] text-2xl transition">✕</button>
                        </div>
                        <form onSubmit={handleCreatePool} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Pool Name *</label>
                                <input type="text" className="input-dark"
                                    value={newPool.name} onChange={(e) => setNewPool({...newPool, name: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Description</label>
                                <textarea rows="3" className="input-dark"
                                    value={newPool.description} onChange={(e) => setNewPool({...newPool, description: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Start Date & Time *</label>
                                <input type="datetime-local" className="input-dark"
                                    value={newPool.start_date} onChange={(e) => setNewPool({...newPool, start_date: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">End Date & Time *</label>
                                <input type="datetime-local" className="input-dark"
                                    value={newPool.end_date} onChange={(e) => setNewPool({...newPool, end_date: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Target Amount ($) *</label>
                                <input type="number" step="0.01" className="input-dark"
                                    value={newPool.total_target} onChange={(e) => setNewPool({...newPool, total_target: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Min Contribution ($)</label>
                                    <input type="number" step="0.01" className="input-dark"
                                        value={newPool.min_contribution} onChange={(e) => setNewPool({...newPool, min_contribution: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Max Contribution ($)</label>
                                    <input type="number" step="0.01" className="input-dark"
                                        value={newPool.max_contribution} onChange={(e) => setNewPool({...newPool, max_contribution: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Manager Fee (%)</label>
                                <input type="number" step="0.5" className="input-dark"
                                    value={newPool.manager_fee_percent} onChange={(e) => setNewPool({...newPool, manager_fee_percent: e.target.value})} />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-[#2a3538]">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-success">Create Pool</button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }

        if (modalType === 'deposit') {
            return (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-md w-full modal-dark">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-[#e8f0f0]">💰 Record Deposit</h2>
                            <button onClick={() => setShowModal(false)} className="text-[#a0b4b8] hover:text-[#e8f0f0] text-2xl transition">✕</button>
                        </div>
                        <form onSubmit={handleRecordDeposit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Select User</label>
                                <select className="dropdown-dark"
                                    onChange={(e) => setFormData({...formData, user_id: e.target.value})} required>
                                    <option value="">Select User</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Amount ($)</label>
                                <input type="number" step="0.01" placeholder="Amount" className="input-dark"
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Payment Method</label>
                                <select className="dropdown-dark"
                                    onChange={(e) => setFormData({...formData, payment_method: e.target.value})} required>
                                    <option value="bank_transfer">🏦 Bank Transfer</option>
                                    <option value="usdt">₿ USDT (Crypto)</option>
                                    <option value="mpesa">📱 M-Pesa</option>
                                    <option value="card">💳 Credit Card</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Reference Number</label>
                                <input type="text" placeholder="Reference Number" className="input-dark"
                                    onChange={(e) => setFormData({...formData, reference_number: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Admin Notes</label>
                                <textarea placeholder="Admin Notes" rows="2" className="input-dark"
                                    onChange={(e) => setFormData({...formData, admin_notes: e.target.value})} />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-[#2a3538]">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-success">Record Deposit</button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }

        if (modalType === 'userDetails' && userDetails) {
            return (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-dark">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-[#e8f0f0]">User Details</h2>
                            <button onClick={() => setShowModal(false)} className="text-[#a0b4b8] hover:text-[#e8f0f0] text-2xl transition">✕</button>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-[#1c2426] rounded-xl border border-[#2a3538]">
                            <div>
                                <p className="text-sm text-[#6a7e82]">Full Name</p>
                                <p className="font-semibold text-lg text-[#e8f0f0]">{userDetails.user.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#6a7e82]">Email</p>
                                <p className="font-semibold text-[#e8f0f0]">{userDetails.user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#6a7e82]">Current Balance</p>
                                <p className="font-semibold text-2xl text-[#00d4aa]">{formatCurrency(userDetails.user.current_balance)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#6a7e82]">Total Deposited</p>
                                <p className="font-semibold text-[#4aa0ff]">{formatCurrency(userDetails.user.total_deposited)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#6a7e82]">Total Withdrawn</p>
                                <p className="font-semibold text-[#ff6b6b]">{formatCurrency(userDetails.user.total_withdrawn)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#6a7e82]">Joined Date</p>
                                <p className="font-semibold text-[#e8f0f0]">{new Date(userDetails.user.joined_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-[#e8f0f0] mb-3">Transaction History</h3>
                        <div className="overflow-x-auto mb-4">
                            <table className="table-dark">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userDetails.transactions?.map(t => (
                                        <tr key={t.id} className="hover:bg-[#1c2426] transition">
                                            <td className="p-4 text-[#a0b4b8]">{new Date(t.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 capitalize text-[#e8f0f0]">{t.type}</td>
                                            <td className={`p-4 font-semibold ${t.amount > 0 ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'}`}>
                                                {formatCurrency(t.amount)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`badge ${t.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => handleResetUserPassword(userDetails.user.id)} className="btn btn-warning">Reset Password</button>
                            <button onClick={() => setShowModal(false)} className="btn btn-primary">Close</button>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
                    <p className="text-[#a0b4b8]">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Users', value: analytics.totalUsers || 0, icon: '👥' },
        { title: 'Total Contributions', value: `$${(analytics.totalContributions || 0).toLocaleString()}`, icon: '💰' },
        { title: 'Pending Withdrawals', value: `$${(analytics.pendingWithdrawals || 0).toLocaleString()}`, icon: '🏦' },
        { title: 'Active Trades', value: openTrades.length, icon: '📊' },
    ];

    // Get asset type badge for display
    const getAssetTypeBadge = (pair) => {
        if (!pair) return null;
        const types = {
            'forex': { color: 'bg-[#1c2426] text-[#00d4aa] border border-[#00d4aa]/30', label: '💱 Forex' },
            'crypto': { color: 'bg-[#1c2426] text-[#a855f7] border border-[#a855f7]/30', label: '₿ Crypto' },
            'gold': { color: 'bg-[#1c2426] text-[#ffd93d] border border-[#ffd93d]/30', label: '🥇 Gold' },
            'commodity': { color: 'bg-[#1c2426] text-[#4aa0ff] border border-[#4aa0ff]/30', label: '🛢️ Commodity' }
        };
        return types[pair.type] || types.forex;
    };

    const getCurrentDateTime = () => {
        return new Date().toLocaleString();
    };

    return (
        <>
            <SEO title="Admin Panel - PoolTrader" description="Complete administration panel" />
            <div className="min-h-screen bg-[#0a0e0f]">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold gradient-text">Admin Control Panel</h1>
                        <p className="text-[#a0b4b8] mt-2">Manage users, deposits, withdrawals, pools, and trades</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <button onClick={() => { setModalType('createPool'); setShowModal(true); }} className="btn btn-primary">
                            🏊 Create Pool
                        </button>
                        <button onClick={() => { setModalType('deposit'); setShowModal(true); }} className="btn btn-success">
                            💰 Record Deposit
                        </button>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex flex-wrap border-b border-[#2a3538] mb-8 gap-1">
                        {['dashboard', 'users', 'transactions', 'withdrawals', 'pools', 'trades', 'profits'].map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)} 
                                className={`px-5 py-3 font-semibold transition capitalize rounded-t-lg ${
                                    activeTab === tab 
                                        ? 'bg-[#161c1e] text-[#00d4aa] border-b-2 border-[#00d4aa]'
                                        : 'text-[#a0b4b8] hover:text-[#e8f0f0] hover:bg-[#1c2426]'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {statCards.map((stat, index) => (
                                    <div key={index} className="stat-card">
                                        <div className="text-3xl mb-2">{stat.icon}</div>
                                        <h3 className="text-2xl font-bold text-[#e8f0f0]">{stat.value}</h3>
                                        <p className="text-[#6a7e82] text-sm mt-1">{stat.title}</p>
                                    </div>
                                ))}
                            </div>
                            {analytics.poolProgress && (
                                <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 card-hover">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-4">Active Pool Progress</h2>
                                    <div className="flex justify-between text-[#a0b4b8] mb-2">
                                        <span>{formatCurrency(analytics.poolProgress.current)}</span>
                                        <span>Target: {formatCurrency(analytics.poolProgress.total)}</span>
                                    </div>
                                    <div className="w-full bg-[#1c2426] rounded-full h-3">
                                        <div className="bg-gradient-to-r from-[#00d4aa] to-[#00b894] h-3 rounded-full" 
                                             style={{width: `${analytics.poolProgress.percentage}%`}}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div>
                            <div className="mb-4">
                                <input 
                                    type="text" 
                                    placeholder="🔍 Search users..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="input-dark max-w-md"
                                />
                            </div>
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover">
                                <div className="overflow-x-auto">
                                    <table className="table-dark">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Balance</th>
                                                <th>Admin</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map(u => (
                                                <tr key={u.id} className="hover:bg-[#1c2426] transition">
                                                    <td className="p-4 text-[#a0b4b8]">{u.id}</td>
                                                    <td className="p-4 font-medium text-[#e8f0f0]">{u.full_name}</td>
                                                    <td className="p-4 text-[#a0b4b8]">{u.email}</td>
                                                    <td className="p-4 font-bold text-[#00d4aa]">{formatCurrency(u.current_balance)}</td>
                                                    <td className="p-4 text-[#a0b4b8]">{u.is_admin ? '✅' : '-'}</td>
                                                    <td className="p-4">
                                                        <button onClick={() => viewUserDetails(u.id)} className="text-[#00d4aa] hover:text-[#33ddbb] mr-3 transition" title="View Details">👁️</button>
                                                        <button onClick={() => handleResetUserPassword(u.id)} className="text-[#ffd93d] hover:text-[#f5a623] transition" title="Reset Password">🔑</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Transactions Tab */}
                    {activeTab === 'transactions' && (
                        <div>
                            <div className="flex flex-wrap gap-4 mb-4">
                                <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="input-dark w-auto" />
                                <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="input-dark w-auto" />
                                <button onClick={() => setDateRange({ start: '', end: '' })} className="btn btn-outline">Clear Filters</button>
                            </div>
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover">
                                <div className="overflow-x-auto">
                                    <table className="table-dark">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>User</th>
                                                <th>Type</th>
                                                <th>Amount</th>
                                                <th>Method</th>
                                                <th>Reference</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTransactions.map(t => (
                                                <tr key={t.id} className="hover:bg-[#1c2426] transition">
                                                    <td className="p-4 text-[#a0b4b8]">{new Date(t.created_at).toLocaleDateString()}</td>
                                                    <td className="p-4 font-medium text-[#e8f0f0]">{t.user_name}</td>
                                                    <td className="p-4 capitalize text-[#e8f0f0]">{t.type}</td>
                                                    <td className={`p-4 font-semibold ${t.amount > 0 ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'}`}>
                                                        {formatCurrency(t.amount)}
                                                    </td>
                                                    <td className="p-4 text-[#a0b4b8]">{t.payment_method || '-'}</td>
                                                    <td className="p-4 text-xs font-mono text-[#a0b4b8]">{t.reference_number || '-'}</td>
                                                    <td className="p-4">
                                                        <span className={`badge ${
                                                            t.status === 'completed' ? 'badge-success' : 
                                                            t.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                                        }`}>
                                                            {t.status === 'completed' ? '✓ Verified' : t.status === 'pending' ? '⏳ Pending' : '✗ Rejected'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        {t.status === 'pending' && (
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleUpdateTransactionStatus(t.id, 'completed')} className="btn btn-success btn-sm">Verify</button>
                                                                <button onClick={() => handleUpdateTransactionStatus(t.id, 'failed')} className="btn btn-danger btn-sm">Reject</button>
                                                            </div>
                                                        )}
                                                        {t.status === 'completed' && <span className="text-[#00d4aa] text-xs font-medium">✓ Completed</span>}
                                                        {t.status === 'failed' && <span className="text-[#ff6b6b] text-xs font-medium">✗ Rejected</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredTransactions.length === 0 && (
                                                <tr>
                                                    <td colSpan="8" className="p-8 text-center text-[#a0b4b8]">No transactions found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Withdrawals Tab */}
                    {activeTab === 'withdrawals' && (
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover">
                            <div className="overflow-x-auto">
                                <table className="table-dark">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>User</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {withdrawals.map(w => (
                                            <tr key={w.id} className="hover:bg-[#1c2426] transition">
                                                <td className="p-4 text-[#a0b4b8]">{new Date(w.request_date).toLocaleDateString()}</td>
                                                <td className="p-4 font-medium text-[#e8f0f0]">{w.user_name}</td>
                                                <td className="p-4 font-semibold text-[#ff6b6b]">{formatCurrency(w.amount)}</td>
                                                <td className="p-4">
                                                    <span className={`badge ${
                                                        w.status === 'pending' ? 'badge-warning' :
                                                        w.status === 'approved' ? 'badge-success' : 'badge-danger'
                                                    }`}>
                                                        {w.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {w.status === 'pending' && (
                                                        <div className="flex gap-1">
                                                            <button onClick={() => handleProcessWithdrawal(w.id, 'approve')} className="btn btn-success btn-sm">Approve</button>
                                                            <button onClick={() => handleProcessWithdrawal(w.id, 'reject')} className="btn btn-danger btn-sm">Reject</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {withdrawals.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-[#a0b4b8]">No withdrawal requests</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pools Tab */}
                    {activeTab === 'pools' && (
                        <div className="space-y-4">
                            <button onClick={() => { setModalType('createPool'); setShowModal(true); }} className="btn btn-primary mb-4">
                                + Create New Pool
                            </button>
                            {pools.map(pool => {
                                const progress = (parseFloat(pool.current_total) / parseFloat(pool.total_target)) * 100;
                                const isActive = pool.status === 'open' || pool.status === 'active';
                                const hasEnded = new Date(pool.end_date) < new Date();
                                
                                return (
                                    <div key={pool.id} className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover cursor-pointer"
                                         onClick={() => navigate(`/pool/${pool.id}/trades`)}>
                                        <div className={`h-1.5 ${isActive ? 'bg-gradient-to-r from-[#00d4aa] to-[#00b894]' : hasEnded ? 'bg-[#2a3538]' : 'bg-gradient-to-r from-[#4aa0ff] to-[#00d4aa]'}`}></div>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start flex-wrap">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold text-[#e8f0f0]">{pool.name}</h3>
                                                        <span className={`badge ${
                                                            isActive ? 'badge-success' : 
                                                            hasEnded ? 'badge-gray' : 'badge-info'
                                                        }`}>
                                                            {isActive ? 'ACTIVE' : hasEnded ? 'ENDED' : pool.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <p className="text-[#a0b4b8] text-sm">
                                                        {new Date(pool.start_date).toLocaleDateString()} - {new Date(pool.end_date).toLocaleDateString()}
                                                    </p>
                                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <div>
                                                            <p className="text-xs text-[#6a7e82]">Target</p>
                                                            <p className="font-semibold text-[#e8f0f0]">{formatCurrency(pool.total_target)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-[#6a7e82]">Current</p>
                                                            <p className="font-semibold text-[#00d4aa]">{formatCurrency(pool.current_total)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-[#6a7e82]">Members</p>
                                                            <p className="font-semibold text-[#e8f0f0]">{pool.member_count || 0}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-[#6a7e82]">Fee</p>
                                                            <p className="font-semibold text-[#e8f0f0]">{pool.manager_fee_percent}%</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-[#a0b4b8]">Progress</span>
                                                            <span className="font-semibold text-[#e8f0f0]">{progress.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="w-full bg-[#1c2426] rounded-full h-2">
                                                            <div className={`h-2 rounded-full ${isActive ? 'bg-gradient-to-r from-[#00d4aa] to-[#00b894]' : 'bg-[#2a3538]'}`} 
                                                                 style={{ width: `${progress}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 md:mt-0 flex flex-col gap-2">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/pool/${pool.id}/trades`); }}
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        📊 Manage Trades
                                                    </button>
                                                    {isActive && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setSelectedPool(pool); setShowClosePoolModal(true); }}
                                                            className="btn btn-danger btn-sm"
                                                        >
                                                            🔒 Close Pool
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Trades Tab */}
                    {activeTab === 'trades' && (
                        <div>
                            <div className="mb-6">
                                <button 
                                    onClick={() => { 
                                        if (!selectedPool) {
                                            toast.error('Please select a pool first from the Pools tab');
                                            setActiveTab('pools');
                                        } else {
                                            setShowTradeModal(true);
                                        }
                                    }}
                                    className="btn btn-success"
                                >
                                    + Open New Trade
                                </button>
                            </div>

                            {openTrades.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-[#e8f0f0] mb-4">📈 Open Positions ({openTrades.length})</h2>
                                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover">
                                        <div className="overflow-x-auto">
                                            <table className="table-dark">
                                                <thead>
                                                    <tr>
                                                        <th>Open Time</th>
                                                        <th>Pool</th>
                                                        <th>Symbol</th>
                                                        <th>Direction</th>
                                                        <th>Volume</th>
                                                        <th>Entry Price</th>
                                                        <th>Stake ($)</th>
                                                        <th>Stop Loss</th>
                                                        <th>Take Profit</th>
                                                        <th>Current P&amp;L</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {openTrades.map(trade => (
                                                        <tr key={trade.id} className="hover:bg-[#1c2426] transition">
                                                            <td className="p-4 text-sm text-[#a0b4b8]">{new Date(trade.open_time).toLocaleString()}</td>
                                                            <td className="p-4 font-medium text-[#e8f0f0]">{trade.pool_name}</td>
                                                            <td className="p-4 font-semibold text-[#e8f0f0]">{trade.symbol}</td>
                                                            <td className="p-4">
                                                                <span className={`badge ${trade.direction === 'BUY' ? 'badge-success' : 'badge-danger'}`}>
                                                                    {trade.direction}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-[#e8f0f0]">{trade.volume || '-'}</td>
                                                            <td className="p-4 text-[#e8f0f0]">{parseFloat(trade.open_price).toFixed(4)}</td>
                                                            <td className="p-4 font-semibold text-[#00d4aa]">{formatCurrency(trade.entry_amount || trade.stake)}</td>
                                                            <td className="p-4 text-[#ff6b6b]">{trade.stop_loss ? `$${parseFloat(trade.stop_loss).toFixed(4)}` : '-'}</td>
                                                            <td className="p-4 text-[#00d4aa]">{trade.take_profit ? `$${parseFloat(trade.take_profit).toFixed(4)}` : '-'}</td>
                                                            <td className={`p-4 font-semibold ${(trade.current_pnl || 0) >= 0 ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'}`}>
                                                                {formatCurrency(trade.current_pnl)}
                                                                <span className="text-xs block text-[#6a7e82]">{(trade.pnl_percentage || 0).toFixed(2)}%</span>
                                                            </td>
                                                            <td className="p-4">
                                                                <button 
                                                                    onClick={() => handleCloseTrade(trade.id)} 
                                                                    className="btn btn-danger btn-sm"
                                                                >
                                                                    Close
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h2 className="text-2xl font-bold text-[#e8f0f0] mb-4">📋 Trade History ({trades.length})</h2>
                                <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover">
                                    <div className="overflow-x-auto">
                                        <table className="table-dark">
                                            <thead>
                                                <tr>
                                                    <th>Open Time</th>
                                                    <th>Close Time</th>
                                                    <th>Pool</th>
                                                    <th>Symbol</th>
                                                    <th>Direction</th>
                                                    <th>Volume</th>
                                                    <th>Entry</th>
                                                    <th>Exit</th>
                                                    <th>Stake $</th>
                                                    <th>Return $</th>
                                                    <th>P&amp;L</th>
                                                    <th>Status</th>
                                                    <th>Reason</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {trades.map(trade => (
                                                    <tr key={trade.id} className="hover:bg-[#1c2426] transition">
                                                        <td className="p-4 text-sm text-[#a0b4b8]">{new Date(trade.open_time).toLocaleString()}</td>
                                                        <td className="p-4 text-sm text-[#a0b4b8]">{trade.close_time ? new Date(trade.close_time).toLocaleString() : '-'}</td>
                                                        <td className="p-4 text-[#e8f0f0]">{trade.pool_name}</td>
                                                        <td className="p-4 font-semibold text-[#e8f0f0]">{trade.symbol}</td>
                                                        <td className="p-4">
                                                            <span className={`badge ${trade.direction === 'BUY' ? 'badge-success' : 'badge-danger'}`}>
                                                                {trade.direction}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-[#e8f0f0]">{trade.volume || '-'}</td>
                                                        <td className="p-4 text-[#e8f0f0]">{parseFloat(trade.open_price).toFixed(4)}</td>
                                                        <td className="p-4 text-[#e8f0f0]">{trade.close_price ? parseFloat(trade.close_price).toFixed(4) : '-'}</td>
                                                        <td className="p-4 font-semibold text-[#e8f0f0]">{formatCurrency(trade.entry_amount || trade.stake)}</td>
                                                        <td className="p-4 font-semibold text-[#e8f0f0]">{formatCurrency(trade.exit_amount)}</td>
                                                        <td className={`p-4 font-semibold ${(trade.profit_loss || 0) >= 0 ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'}`}>
                                                            {trade.profit_loss ? `${trade.profit_loss >= 0 ? '+' : ''}${formatCurrency(trade.profit_loss)}` : '-'}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`badge ${trade.status === 'closed' ? 'badge-gray' : 'badge-warning'}`}>
                                                                {trade.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-sm text-[#a0b4b8]">{trade.closed_reason || '-'}</td>
                                                    </tr>
                                                ))}
                                                {trades.length === 0 && (
                                                    <tr>
                                                        <td colSpan="13" className="p-8 text-center text-[#a0b4b8]">No trades found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Trade Modal - Opening (ALL MANUAL) */}
                    {showTradeModal && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto modal-dark">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-[#e8f0f0]">📊 Open New Trade</h2>
                                    <button onClick={() => setShowTradeModal(false)} className="text-[#a0b4b8] hover:text-[#e8f0f0] text-2xl transition">✕</button>
                                </div>
                                <form onSubmit={handleAddTrade} className="space-y-4">
                                    <div className="bg-[#1c2426] p-3 rounded-lg border border-[#00d4aa]/20">
                                        <p className="text-sm text-[#a0b4b8]">
                                            📊 All fields are manual entries
                                        </p>
                                    </div>

                                    <DateTimePicker
                                        label="⏰ Open Time"
                                        value={tradeForm.open_time}
                                        onChange={(value) => setTradeForm({...tradeForm, open_time: value})}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Select Pool *</label>
                                        <select 
                                            className="dropdown-dark"
                                            value={selectedPool?.id || ''}
                                            onChange={(e) => {
                                                const pool = pools.find(p => p.id === parseInt(e.target.value));
                                                setSelectedPool(pool);
                                            }}
                                            required
                                        >
                                            <option value="">Select a pool</option>
                                            {pools.filter(p => p.status === 'open').map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.current_total)} / {formatCurrency(p.total_target)})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Symbol *</label>
                                        <input type="text" placeholder="e.g., EUR/USD, XAU/USD" className="input-dark"
                                            value={tradeForm.symbol} onChange={(e) => setTradeForm({...tradeForm, symbol: e.target.value})} required />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Direction *</label>
                                        <select className="dropdown-dark"
                                            value={tradeForm.direction} onChange={(e) => setTradeForm({...tradeForm, direction: e.target.value})} required>
                                            <option value="BUY">📈 BUY (Long)</option>
                                            <option value="SELL">📉 SELL (Short)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Lot Size *</label>
                                        <input type="number" step="0.0001" placeholder="e.g., 0.01, 0.10, 1.00" className="input-dark"
                                            value={tradeForm.lot_size} onChange={(e) => setTradeForm({...tradeForm, lot_size: e.target.value})} required />
                                        <p className="text-xs text-[#6a7e82] mt-1">📊 The lot size you want to trade</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Entry Price *</label>
                                        <input type="number" step="0.0001" placeholder="Enter open price" className="input-dark"
                                            value={tradeForm.open_price} onChange={(e) => setTradeForm({...tradeForm, open_price: e.target.value})} required />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Stake ($) *</label>
                                        <input type="number" step="0.01" placeholder="Enter stake amount" className="input-dark"
                                            value={tradeForm.stake} onChange={(e) => setTradeForm({...tradeForm, stake: e.target.value})} required />
                                        <p className="text-xs text-[#6a7e82] mt-1">💰 The amount you're trading/staking</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Stop Loss</label>
                                            <input type="number" step="0.0001" placeholder="Optional" className="input-dark"
                                                value={tradeForm.stop_loss} onChange={(e) => setTradeForm({...tradeForm, stop_loss: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Take Profit</label>
                                            <input type="number" step="0.0001" placeholder="Optional" className="input-dark"
                                                value={tradeForm.take_profit} onChange={(e) => setTradeForm({...tradeForm, take_profit: e.target.value})} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Notes</label>
                                        <textarea placeholder="Add notes about this trade" rows="2" className="input-dark"
                                            value={tradeForm.notes} onChange={(e) => setTradeForm({...tradeForm, notes: e.target.value})} />
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4 border-t border-[#2a3538]">
                                        <button type="button" onClick={() => setShowTradeModal(false)} className="btn btn-outline">Cancel</button>
                                        <button type="submit" className="btn btn-primary">✅ Open Trade</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Close Trade Modal - P/L is AUTO-CALCULATED and DISPLAY ONLY */}
                    {showCloseModal && closingTrade && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto modal-dark">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-[#e8f0f0]">🔒 Close Trade</h2>
                                    <button onClick={() => {
                                        setShowCloseModal(false);
                                        setClosingTrade(null);
                                    }} className="text-[#a0b4b8] hover:text-[#e8f0f0] text-2xl transition">✕</button>
                                </div>
                                <form onSubmit={confirmCloseTrade} className="space-y-4">
                                    <div className="bg-[#1c2426] p-3 rounded-lg border border-[#ffd93d]/20">
                                        <p className="text-sm text-[#a0b4b8]">
                                            Closing Trade: <strong className="text-[#e8f0f0]">{closingTrade.symbol}</strong>
                                        </p>
                                        <p className="text-sm text-[#a0b4b8]">
                                            Open Time: {new Date(closingTrade.open_time).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-[#a0b4b8]">
                                            Entry Price: {parseFloat(closingTrade.open_price).toFixed(4)}
                                        </p>
                                        <p className="text-sm text-[#a0b4b8]">
                                            Volume: <strong className="text-[#e8f0f0]">{closingTrade.volume}</strong>
                                        </p>
                                        <p className="text-sm text-[#a0b4b8]">
                                            Stake: <strong className="text-[#00d4aa]">{formatCurrency(closingTrade.entry_amount || closingTrade.stake)}</strong>
                                        </p>
                                    </div>

                                    <DateTimePicker
                                        label="⏰ Close Time"
                                        value={closeFormData.close_time}
                                        onChange={(value) => setCloseFormData({...closeFormData, close_time: value})}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Currency Pair</label>
                                        <div className="w-full p-2 bg-[#1c2426] rounded-lg font-semibold text-[#e8f0f0]">
                                            {closingTrade.symbol}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Volume (Fixed from Opening)</label>
                                        <div className="w-full p-2 bg-[#1c2426] rounded-lg font-semibold text-[#e8f0f0]">
                                            {closingTrade.volume || '-'}
                                        </div>
                                        <p className="text-xs text-[#6a7e82] mt-1">🔒 Volume is fixed and cannot be changed when closing</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Close Price *</label>
                                        <input type="number" step="0.0001" placeholder="Enter close price" className="input-dark"
                                            value={closeFormData.close_price} onChange={(e) => setCloseFormData({...closeFormData, close_price: e.target.value})} required />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Exit Amount ($) *</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            placeholder="e.g., 45.00 (amount received/closed)" 
                                            className="input-dark"
                                            value={closeFormData.exit_amount} 
                                            onChange={(e) => {
                                                setCloseFormData({...closeFormData, exit_amount: e.target.value});
                                            }} 
                                            required 
                                        />
                                        <p className="text-xs text-[#6a7e82] mt-1">💰 The actual dollar amount you're closing the trade with</p>
                                    </div>

                                    {/* P/L - DISPLAY ONLY - AUTO-CALCULATED */}
                                    <div className="bg-[#1c2426] p-4 rounded-lg border-2 border-[#00d4aa]/30">
                                        <p className="text-sm font-semibold text-center text-[#a0b4b8]">
                                            📊 Profit/Loss (Auto-Calculated)
                                        </p>
                                        <p className={`text-2xl font-bold text-center ${calculatedPL >= 0 ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'}`}>
                                            {calculatedPL >= 0 ? '+' : ''}${calculatedPL.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-[#6a7e82] text-center mt-1">
                                            Exit Amount - Stake = {closeFormData.exit_amount || '0'} - {closingTrade?.entry_amount || closingTrade?.stake || '0'} = {calculatedPL.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-[#6a7e82] text-center mt-1">
                                            🔒 Auto-calculated - No manual entry needed
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Reason for Closing</label>
                                        <select className="dropdown-dark"
                                            value={closeFormData.closed_reason} onChange={(e) => setCloseFormData({...closeFormData, closed_reason: e.target.value})}>
                                            <option value="">Select reason (optional)</option>
                                            <option value="Take Profit Attained">✅ Take Profit Attained</option>
                                            <option value="Stop Loss Hit">⛔ Stop Loss Hit</option>
                                            <option value="Market Conditions Changed">📊 Market Conditions Changed</option>
                                            <option value="Risk Management">🛡️ Risk Management</option>
                                            <option value="Manual Close">✋ Manual Close</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <input type="text" placeholder="Or type custom reason..." className="input-dark mt-2"
                                            value={closeFormData.closed_reason} onChange={(e) => setCloseFormData({...closeFormData, closed_reason: e.target.value})} />
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4 border-t border-[#2a3538]">
                                        <button type="button" onClick={() => {
                                            setShowCloseModal(false);
                                            setClosingTrade(null);
                                        }} className="btn btn-outline">Cancel</button>
                                        <button type="submit" className="btn btn-danger">🔒 Close Trade</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Close Pool Confirmation Modal */}
                    {showClosePoolModal && selectedPool && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-md w-full modal-dark">
                                <h2 className="text-2xl font-bold text-[#ff6b6b] mb-4">⚠️ Close Pool</h2>
                                <p className="text-[#a0b4b8] mb-4">Are you sure you want to close <strong className="text-[#e8f0f0]">{selectedPool.name}</strong>?</p>
                                <div className="bg-[#1c2426] p-4 rounded-lg border border-[#ffd93d]/20 mb-4">
                                    <p className="text-sm text-[#a0b4b8]">
                                        <strong className="text-[#ffd93d]">Warning:</strong> Closing this pool will:
                                    </p>
                                    <ul className="text-xs text-[#6a7e82] mt-2 list-disc list-inside">
                                        <li>Close all open trades</li>
                                        <li>Calculate final pool balance</li>
                                        <li>Distribute remaining funds to investors based on their contribution percentage</li>
                                        <li>Mark the pool as closed</li>
                                    </ul>
                                </div>
                                <p className="text-sm text-[#a0b4b8] mb-4">
                                    Type <strong className="text-[#ff6b6b]">"CONFIRM"</strong> to proceed with closing this pool.
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button onClick={() => setShowClosePoolModal(false)} className="btn btn-outline">Cancel</button>
                                    <button onClick={() => handleClosePool(selectedPool.id)} className="btn btn-danger">Close Pool</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Profits Tab */}
                    {activeTab === 'profits' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 card-hover">
                                <h2 className="text-2xl font-bold text-[#e8f0f0] mb-4">💰 Profit Distribution</h2>
                                <p className="text-[#a0b4b8] mb-4">Enter the total profit made from trading to distribute to investors.</p>
                                <form onSubmit={handleDistributeProfits} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Select Pool</label>
                                        <select value={profitDistribution.poolId} onChange={(e) => setProfitDistribution({...profitDistribution, poolId: e.target.value})} className="dropdown-dark" required>
                                            <option value="">Select Pool</option>
                                            {pools.filter(p => p.status === 'closed' || p.status === 'settled').map(p => (
                                                <option key={p.id} value={p.id}>{p.name} (Final: {formatCurrency(p.current_total)})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Total Profit Made ($)</label>
                                        <input type="number" step="0.01" placeholder="Enter total profit" value={profitDistribution.totalProfit} onChange={(e) => setProfitDistribution({...profitDistribution, totalProfit: e.target.value})} className="input-dark" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Management Fee (%)</label>
                                        <input type="number" step="0.5" placeholder="Management Fee %" value={profitDistribution.managementFee} onChange={(e) => setProfitDistribution({...profitDistribution, managementFee: e.target.value})} className="input-dark" />
                                    </div>
                                    <button type="submit" disabled={profitDistribution.distributing} className="w-full btn btn-primary">
                                        {profitDistribution.distributing ? 'Distributing...' : '📊 Calculate & Distribute Profits'}
                                    </button>
                                </form>
                            </div>

                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 card-hover">
                                <h2 className="text-2xl font-bold text-[#e8f0f0] mb-4">📈 How It Works</h2>
                                <div className="space-y-4">
                                    <div className="p-3 bg-[#1c2426] rounded-lg border border-[#4aa0ff]/20">
                                        <div className="font-bold text-[#4aa0ff]">Example:</div>
                                        <p className="text-[#a0b4b8]">Pool Total: $10,000 | Your Contribution: $1,000 (10% share)</p>
                                        <p className="text-[#a0b4b8]">Pool Profit: $5,000 → Your share: $500</p>
                                        <p className="text-[#a0b4b8]">Management Fee (20%): $100 → You receive: $400</p>
                                    </div>
                                    <div className="p-3 bg-[#1c2426] rounded-lg border border-[#00d4aa]/20">
                                        <div className="font-bold text-[#00d4aa]">Formula:</div>
                                        <p className="text-[#a0b4b8]">Your Profit = (Pool Profit × Your Contribution %)</p>
                                        <p className="text-[#a0b4b8]">Final Amount = Your Profit - (Your Profit × Fee %)</p>
                                    </div>
                                    <div className="p-3 bg-[#1c2426] rounded-lg border border-[#ffd93d]/20">
                                        <div className="font-bold text-[#ffd93d]">When Pool Closes:</div>
                                        <p className="text-[#a0b4b8]">When a pool is closed, the remaining balance is distributed to all investors based on their contribution percentage.</p>
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