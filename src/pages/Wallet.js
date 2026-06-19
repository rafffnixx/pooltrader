import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Wallet = () => {
    const [balance, setBalance] = useState({
        total: 0,
        allocated: 0,
        withdrawable: 0,
        pendingDeposits: 0,
        pendingWithdrawals: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [paymentDetails, setPaymentDetails] = useState({
        phoneNumber: '',
        accountName: '',
        accountNumber: '',
        bankName: '',
        walletAddress: ''
    });
    const [loading, setLoading] = useState(true);

    // Helper function to format currency
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return '-';
        return `$${num.toLocaleString()}`;
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const [balanceRes, transactionsRes, withdrawalsRes] = await Promise.all([
                api.get('/wallet/balance'),
                api.get('/wallet/transactions'),
                api.get('/wallet/withdrawals')
            ]);
            
            if (balanceRes.data.success) setBalance(balanceRes.data.balance);
            if (transactionsRes.data.success) setTransactions(transactionsRes.data.transactions);
            if (withdrawalsRes.data.success) setWithdrawals(withdrawalsRes.data.withdrawals);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
            toast.error('Failed to load wallet data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        if (!depositAmount || depositAmount < 10) {
            toast.error('Minimum deposit is $10');
            return;
        }
        
        let details = {};
        if (paymentMethod === 'mpesa') {
            if (!paymentDetails.phoneNumber) {
                toast.error('Please enter M-Pesa phone number');
                return;
            }
            details = { phoneNumber: paymentDetails.phoneNumber };
        } else if (paymentMethod === 'bank_transfer') {
            if (!paymentDetails.accountName || !paymentDetails.accountNumber) {
                toast.error('Please enter bank account details');
                return;
            }
            details = { 
                accountName: paymentDetails.accountName, 
                accountNumber: paymentDetails.accountNumber, 
                bankName: paymentDetails.bankName || 'Not specified'
            };
        } else if (paymentMethod === 'usdt') {
            if (!paymentDetails.walletAddress) {
                toast.error('Please enter USDT wallet address');
                return;
            }
            details = { walletAddress: paymentDetails.walletAddress };
        }
        
        try {
            const response = await api.post('/wallet/deposit-request', {
                amount: parseFloat(depositAmount),
                payment_method: paymentMethod,
                payment_details: details
            });
            
            if (response.data.success) {
                toast.success('Deposit request submitted! Awaiting admin confirmation.');
                setShowDepositModal(false);
                setDepositAmount('');
                setPaymentDetails({
                    phoneNumber: '',
                    accountName: '',
                    accountNumber: '',
                    bankName: '',
                    walletAddress: ''
                });
                fetchWalletData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process deposit');
        }
    };

    const handleWithdrawRequest = async (e) => {
        e.preventDefault();
        if (!withdrawAmount || withdrawAmount < 10) {
            toast.error('Minimum withdrawal is $10');
            return;
        }
        
        if (withdrawAmount > balance.withdrawable) {
            toast.error(`Insufficient withdrawable balance. Available: $${balance.withdrawable.toLocaleString()}`);
            return;
        }
        
        let details = {};
        if (paymentMethod === 'mpesa') {
            if (!paymentDetails.phoneNumber) {
                toast.error('Please enter M-Pesa phone number');
                return;
            }
            details = { phoneNumber: paymentDetails.phoneNumber };
        } else if (paymentMethod === 'bank_transfer') {
            if (!paymentDetails.accountName || !paymentDetails.accountNumber) {
                toast.error('Please enter bank account details');
                return;
            }
            details = { 
                accountName: paymentDetails.accountName, 
                accountNumber: paymentDetails.accountNumber, 
                bankName: paymentDetails.bankName || 'Not specified'
            };
        } else if (paymentMethod === 'usdt') {
            if (!paymentDetails.walletAddress) {
                toast.error('Please enter USDT wallet address');
                return;
            }
            details = { walletAddress: paymentDetails.walletAddress };
        }
        
        try {
            const response = await api.post('/wallet/withdraw-request', {
                amount: parseFloat(withdrawAmount),
                payment_method: paymentMethod,
                payment_details: details
            });
            
            if (response.data.success) {
                toast.success('Withdrawal request submitted! Admin will process it shortly.');
                setShowWithdrawModal(false);
                setWithdrawAmount('');
                setPaymentDetails({
                    phoneNumber: '',
                    accountName: '',
                    accountNumber: '',
                    bankName: '',
                    walletAddress: ''
                });
                fetchWalletData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process withdrawal');
        }
    };

    const resetPaymentDetails = () => {
        setPaymentDetails({
            phoneNumber: '',
            accountName: '',
            accountNumber: '',
            bankName: '',
            walletAddress: ''
        });
    };

    const renderPaymentDetailsFields = () => {
        switch (paymentMethod) {
            case 'mpesa':
                return (
                    <div>
                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">M-Pesa Phone Number</label>
                        <input
                            type="tel"
                            value={paymentDetails.phoneNumber}
                            onChange={(e) => setPaymentDetails({...paymentDetails, phoneNumber: e.target.value})}
                            placeholder="0712345678"
                            className="input-dark"
                            required
                        />
                        <p className="text-xs text-[#6a7e82] mt-1">You will receive a payment request on this number</p>
                    </div>
                );
            case 'bank_transfer':
                return (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Account Name</label>
                            <input
                                type="text"
                                value={paymentDetails.accountName}
                                onChange={(e) => setPaymentDetails({...paymentDetails, accountName: e.target.value})}
                                placeholder="John Doe"
                                className="input-dark"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Account Number</label>
                            <input
                                type="text"
                                value={paymentDetails.accountNumber}
                                onChange={(e) => setPaymentDetails({...paymentDetails, accountNumber: e.target.value})}
                                placeholder="1234567890"
                                className="input-dark"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Bank Name (Optional)</label>
                            <input
                                type="text"
                                value={paymentDetails.bankName}
                                onChange={(e) => setPaymentDetails({...paymentDetails, bankName: e.target.value})}
                                placeholder="Chase Bank"
                                className="input-dark"
                            />
                        </div>
                    </div>
                );
            case 'usdt':
                return (
                    <div>
                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">USDT Wallet Address (ERC-20)</label>
                        <input
                            type="text"
                            value={paymentDetails.walletAddress}
                            onChange={(e) => setPaymentDetails({...paymentDetails, walletAddress: e.target.value})}
                            placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5"
                            className="input-dark"
                            required
                        />
                        <p className="text-xs text-[#6a7e82] mt-1">Make sure to use ERC-20 network</p>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
                    <p className="text-[#a0b4b8]">Loading your wallet...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO title="Wallet - PoolTrader" description="Manage your funds and withdrawals" />
            
            <div className="min-h-screen bg-[#0a0e0f]">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="inline-block p-4 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-2xl mb-4 shadow-[0_0_30px_rgba(0,212,170,0.2)]">
                            <span className="text-4xl">💰</span>
                        </div>
                        <h1 className="text-4xl font-bold gradient-text">
                            Your Trading Wallet
                        </h1>
                        <p className="text-[#a0b4b8] mt-2 max-w-2xl mx-auto">
                            Manage your funds, track deposits, and withdraw your profits. 
                            Your money is safe and ready for trading when you are.
                        </p>
                    </div>

                    {/* Balance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        <div className="stat-card text-center border-t-4 border-[#00d4aa]">
                            <p className="text-[#6a7e82] text-sm">Total Balance</p>
                            <p className="text-3xl font-bold text-[#e8f0f0]">{formatCurrency(balance.total)}</p>
                            <p className="text-[#6a7e82] text-xs mt-1">💰 Total funds</p>
                        </div>
                        
                        <div className="stat-card text-center border-t-4 border-[#4aa0ff]">
                            <p className="text-[#6a7e82] text-sm">Allocated to Pools</p>
                            <p className="text-3xl font-bold text-[#4aa0ff]">{formatCurrency(balance.allocated)}</p>
                            <p className="text-[#6a7e82] text-xs mt-1">📊 Invested</p>
                        </div>
                        
                        <div className="stat-card text-center border-t-4 border-[#00d4aa]">
                            <p className="text-[#6a7e82] text-sm">Withdrawable</p>
                            <p className="text-3xl font-bold text-[#00d4aa]">{formatCurrency(balance.withdrawable)}</p>
                            <p className="text-[#6a7e82] text-xs mt-1">💵 Available</p>
                        </div>
                        
                        <div className="stat-card text-center border-t-4 border-[#ffd93d]">
                            <p className="text-[#6a7e82] text-sm">Pending Deposits</p>
                            <p className="text-3xl font-bold text-[#ffd93d]">{formatCurrency(balance.pendingDeposits)}</p>
                            <p className="text-[#6a7e82] text-xs mt-1">⏳ Awaiting confirmation</p>
                        </div>
                        
                        <div className="stat-card text-center border-t-4 border-[#ff6b6b]">
                            <p className="text-[#6a7e82] text-sm">Pending Withdrawals</p>
                            <p className="text-3xl font-bold text-[#ff6b6b]">{formatCurrency(balance.pendingWithdrawals)}</p>
                            <p className="text-[#6a7e82] text-xs mt-1">📤 Processing</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        <button 
                            onClick={() => {
                                setShowDepositModal(true);
                                resetPaymentDetails();
                            }}
                            className="flex-1 btn btn-success btn-lg"
                        >
                            💰 Deposit Funds
                        </button>
                        <button 
                            onClick={() => {
                                setShowWithdrawModal(true);
                                resetPaymentDetails();
                            }}
                            className="flex-1 btn btn-primary btn-lg"
                        >
                            💸 Withdraw Funds
                        </button>
                        <Link 
                            to="/dashboard"
                            className="flex-1 btn btn-outline btn-lg text-center"
                        >
                            📊 Go to Dashboard
                        </Link>
                    </div>

                    {/* How It Works Section */}
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 mb-8 card-hover">
                        <h2 className="text-xl font-bold text-[#e8f0f0] mb-4 flex items-center">
                            <span className="mr-2">💡</span> How It Works
                        </h2>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="p-3 bg-[#1c2426] rounded-lg border border-[#00d4aa]/20">
                                <div className="font-bold text-[#00d4aa]">1. Deposit Funds</div>
                                <p className="text-[#a0b4b8]">Request a deposit with your preferred payment method. Admin will confirm and funds will be added to your wallet.</p>
                            </div>
                            <div className="p-3 bg-[#1c2426] rounded-lg border border-[#00d4aa]/20">
                                <div className="font-bold text-[#00d4aa]">2. Allocate to Pools</div>
                                <p className="text-[#a0b4b8]">Use your withdrawable balance to invest in active trading pools.</p>
                            </div>
                            <div className="p-3 bg-[#1c2426] rounded-lg border border-[#00d4aa]/20">
                                <div className="font-bold text-[#00d4aa]">3. Withdraw Profits</div>
                                <p className="text-[#a0b4b8]">Request withdrawal of your withdrawable balance anytime.</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden mb-8 card-hover">
                        <div className="p-6 border-b border-[#2a3538]">
                            <h2 className="text-xl font-bold text-[#e8f0f0] flex items-center">
                                <span className="mr-2">📋</span> Recent Transactions
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table-dark">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-[#1c2426] transition">
                                            <td className="p-4 text-[#a0b4b8]">{new Date(t.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 capitalize">
                                                <span className={`badge ${
                                                    t.type === 'deposit' ? 'badge-success' : 
                                                    t.type === 'allocation' ? 'badge-info' : 'badge-danger'
                                                }`}>
                                                    {t.type === 'allocation' ? 'Investment' : t.type}
                                                </span>
                                            </td>
                                            <td className={`p-4 font-semibold ${
                                                t.type === 'deposit' || t.type === 'allocation' ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'
                                            }`}>
                                                {t.type === 'deposit' || t.type === 'allocation' ? '+' : '-'}{formatCurrency(t.amount)}
                                            </td>
                                            <td className="p-4 text-[#a0b4b8]">{t.payment_method || 'Wallet'}</td>
                                            <td className="p-4">
                                                <span className={`badge ${
                                                    t.status === 'completed' ? 'badge-success' :
                                                    t.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                                }`}>
                                                    {t.status === 'completed' ? '✓ Completed' : t.status === 'pending' ? '⏳ Pending' : '✗ Failed'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-[#a0b4b8]">
                                                No transactions yet. Make a deposit to get started!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Withdrawal Requests */}
                    {withdrawals.length > 0 && (
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover">
                            <div className="p-6 border-b border-[#2a3538]">
                                <h2 className="text-xl font-bold text-[#e8f0f0] flex items-center">
                                    <span className="mr-2">📤</span> Withdrawal History
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="table-dark">
                                    <thead>
                                        <tr>
                                            <th>Request Date</th>
                                            <th>Amount</th>
                                            <th>Method</th>
                                            <th>Status</th>
                                            <th>Processed Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {withdrawals.map((w) => (
                                            <tr key={w.id} className="hover:bg-[#1c2426] transition">
                                                <td className="p-4 text-[#a0b4b8]">{new Date(w.request_date).toLocaleDateString()}</td>
                                                <td className="p-4 font-semibold text-[#ff6b6b]">{formatCurrency(w.amount)}</td>
                                                <td className="p-4 text-[#a0b4b8]">{w.payment_method || '-'}</td>
                                                <td className="p-4">
                                                    <span className={`badge ${
                                                        w.status === 'approved' ? 'badge-success' :
                                                        w.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                                    }`}>
                                                        {w.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-[#a0b4b8]">{w.processed_date ? new Date(w.processed_date).toLocaleDateString() : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Deposit Modal */}
                    {showDepositModal && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto modal-dark">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-[#e8f0f0]">Deposit Funds</h2>
                                    <button onClick={() => setShowDepositModal(false)} className="text-[#a0b4b8] hover:text-[#e8f0f0] text-2xl transition">✕</button>
                                </div>
                                <form onSubmit={handleDeposit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Amount ($)</label>
                                        <input 
                                            type="number" 
                                            value={depositAmount} 
                                            onChange={(e) => setDepositAmount(e.target.value)}
                                            min="10"
                                            step="10"
                                            required
                                            className="input-dark text-lg font-semibold"
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Payment Method</label>
                                        <select 
                                            value={paymentMethod} 
                                            onChange={(e) => {
                                                setPaymentMethod(e.target.value);
                                                resetPaymentDetails();
                                            }} 
                                            className="dropdown-dark"
                                        >
                                            <option value="bank_transfer">🏦 Bank Transfer</option>
                                            <option value="usdt">₿ USDT (Crypto)</option>
                                            <option value="mpesa">📱 M-Pesa</option>
                                        </select>
                                    </div>
                                    
                                    {renderPaymentDetailsFields()}
                                    
                                    <div className="p-3 bg-[#1c2426] rounded-lg border border-[#4aa0ff]/20">
                                        <p className="text-sm text-[#a0b4b8]">💡 Instructions:</p>
                                        <p className="text-xs text-[#6a7e82] mt-1">
                                            {paymentMethod === 'bank_transfer' && 'After submitting, please transfer the amount to our bank account. Include your email as reference.'}
                                            {paymentMethod === 'usdt' && 'After submitting, please send USDT to the provided address. Your deposit will be confirmed once received.'}
                                            {paymentMethod === 'mpesa' && 'You will receive a payment request on your M-Pesa phone number.'}
                                        </p>
                                    </div>
                                    
                                    <button type="submit" className="w-full btn btn-success">
                                        Submit Deposit Request
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Withdraw Modal */}
                    {showWithdrawModal && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto modal-dark">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-[#e8f0f0]">Withdraw Funds</h2>
                                    <button onClick={() => setShowWithdrawModal(false)} className="text-[#a0b4b8] hover:text-[#e8f0f0] text-2xl transition">✕</button>
                                </div>
                                <form onSubmit={handleWithdrawRequest} className="space-y-4">
                                    <div className="p-3 bg-[#1c2426] rounded-lg border border-[#00d4aa]/20 text-center">
                                        <p className="text-sm text-[#a0b4b8]">Available to Withdraw</p>
                                        <p className="text-2xl font-bold text-[#00d4aa]">{formatCurrency(balance.withdrawable)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Amount to Withdraw ($)</label>
                                        <input 
                                            type="number" 
                                            value={withdrawAmount} 
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            min="10"
                                            max={balance.withdrawable}
                                            step="10"
                                            required
                                            className="input-dark text-lg font-semibold"
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Payment Method</label>
                                        <select 
                                            value={paymentMethod} 
                                            onChange={(e) => {
                                                setPaymentMethod(e.target.value);
                                                resetPaymentDetails();
                                            }} 
                                            className="dropdown-dark"
                                        >
                                            <option value="bank_transfer">🏦 Bank Transfer</option>
                                            <option value="usdt">₿ USDT</option>
                                            <option value="mpesa">📱 M-Pesa</option>
                                        </select>
                                    </div>
                                    
                                    {renderPaymentDetailsFields()}
                                    
                                    <div className="p-3 bg-[#1c2426] rounded-lg border border-[#ffd93d]/20">
                                        <p className="text-xs text-[#a0b4b8]">
                                            ⏳ Withdrawal requests are processed within 24-48 hours after admin approval.
                                            Funds will be sent to your provided payment details.
                                        </p>
                                    </div>
                                    
                                    <button type="submit" className="w-full btn btn-primary">
                                        Submit Withdrawal Request
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Wallet;