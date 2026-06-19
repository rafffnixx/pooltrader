import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import api from '../services/api';
import toast from 'react-hot-toast';

// Embedded Currency Pairs Data with Type Classification
const popularCurrencyPairs = [
  // Major Pairs - FOREX
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', group: 'Major', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', group: 'Major', type: 'forex', priceDecimals: 3, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', group: 'Major', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', group: 'Major', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  
  // Minor Pairs - FOREX
  { symbol: 'EUR/GBP', name: 'Euro / British Pound', group: 'Minor', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', group: 'Minor', type: 'forex', priceDecimals: 3, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', group: 'Minor', type: 'forex', priceDecimals: 3, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', group: 'Minor', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', group: 'Minor', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', group: 'Minor', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'EUR/CHF', name: 'Euro / Swiss Franc', group: 'Minor', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'EUR/AUD', name: 'Euro / Australian Dollar', group: 'Minor', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  
  // Crypto Pairs
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', group: 'Crypto', type: 'crypto', priceDecimals: 2, volumeMin: 0.001, volumeMax: 10.00, volumeStep: 0.001, volumeLabel: 'BTC' },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', group: 'Crypto', type: 'crypto', priceDecimals: 2, volumeMin: 0.001, volumeMax: 10.00, volumeStep: 0.001, volumeLabel: 'ETH' },
  { symbol: 'BTC/ETH', name: 'Bitcoin / Ethereum', group: 'Crypto', type: 'crypto', priceDecimals: 4, volumeMin: 0.001, volumeMax: 10.00, volumeStep: 0.001, volumeLabel: 'BTC' },
  { symbol: 'ADA/USD', name: 'Cardano / US Dollar', group: 'Crypto', type: 'crypto', priceDecimals: 4, volumeMin: 0.001, volumeMax: 10.00, volumeStep: 0.001, volumeLabel: 'ADA' },
  { symbol: 'DOT/USD', name: 'Polkadot / US Dollar', group: 'Crypto', type: 'crypto', priceDecimals: 2, volumeMin: 0.001, volumeMax: 10.00, volumeStep: 0.001, volumeLabel: 'DOT' },
  { symbol: 'SOL/USD', name: 'Solana / US Dollar', group: 'Crypto', type: 'crypto', priceDecimals: 2, volumeMin: 0.001, volumeMax: 10.00, volumeStep: 0.001, volumeLabel: 'SOL' },
  { symbol: 'XRP/USD', name: 'Ripple / US Dollar', group: 'Crypto', type: 'crypto', priceDecimals: 4, volumeMin: 0.001, volumeMax: 10.00, volumeStep: 0.001, volumeLabel: 'XRP' },
  { symbol: 'LTC/USD', name: 'Litecoin / US Dollar', group: 'Crypto', type: 'crypto', priceDecimals: 2, volumeMin: 0.001, volumeMax: 10.00, volumeStep: 0.001, volumeLabel: 'LTC' },
  
  // Exotic Pairs - FOREX
  { symbol: 'USD/TRY', name: 'US Dollar / Turkish Lira', group: 'Exotic', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'USD/ZAR', name: 'US Dollar / South African Rand', group: 'Exotic', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'USD/MXN', name: 'US Dollar / Mexican Peso', group: 'Exotic', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'USD/SGD', name: 'US Dollar / Singapore Dollar', group: 'Exotic', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'USD/HKD', name: 'US Dollar / Hong Kong Dollar', group: 'Exotic', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'USD/NOK', name: 'US Dollar / Norwegian Krone', group: 'Exotic', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'USD/SEK', name: 'US Dollar / Swedish Krona', group: 'Exotic', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'USD/DKK', name: 'US Dollar / Danish Krone', group: 'Exotic', type: 'forex', priceDecimals: 4, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  
  // Precious Metals & Commodities
  { symbol: 'XAU/USD', name: 'Gold / US Dollar', group: 'Commodity', type: 'gold', priceDecimals: 2, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'XAG/USD', name: 'Silver / US Dollar', group: 'Commodity', type: 'gold', priceDecimals: 3, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'XPT/USD', name: 'Platinum / US Dollar', group: 'Commodity', type: 'gold', priceDecimals: 2, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'XPD/USD', name: 'Palladium / US Dollar', group: 'Commodity', type: 'gold', priceDecimals: 2, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'WTI/USD', name: 'Crude Oil / US Dollar', group: 'Commodity', type: 'commodity', priceDecimals: 3, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
  { symbol: 'BRENT/USD', name: 'Brent Oil / US Dollar', group: 'Commodity', type: 'commodity', priceDecimals: 3, volumeMin: 0.01, volumeMax: 10.00, volumeStep: 0.01, volumeLabel: 'lots' },
];

// Searchable Dropdown Component
const SearchableDropdown = ({ options, value, onChange, placeholder = 'Search currency pairs...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredOptions(
        options.filter(opt => 
          opt.symbol.toLowerCase().includes(term) || 
          opt.name.toLowerCase().includes(term)
        )
      );
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option.symbol);
    setSearchTerm('');
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.symbol === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="w-full p-2 border border-[#2a3538] rounded-lg bg-[#1c2426] cursor-pointer hover:border-[#00d4aa] transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? (
          <div className="flex justify-between items-center">
            <span className="font-medium text-[#e8f0f0]">{selectedOption.symbol}</span>
            <span className="text-sm text-[#6a7e82]">{selectedOption.name}</span>
          </div>
        ) : (
          <span className="text-[#6a7e82]">{placeholder}</span>
        )}
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#161c1e] border border-[#2a3538] rounded-lg shadow-lg max-h-80 overflow-hidden">
          <div className="p-2 border-b border-[#2a3538]">
            <input
              type="text"
              className="w-full p-2 border border-[#2a3538] rounded-lg bg-[#1c2426] text-[#e8f0f0] focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-transparent"
              placeholder="Type to search pairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="overflow-y-auto max-h-60">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-[#1c2426] cursor-pointer flex justify-between items-center"
                  onClick={() => handleSelect(option)}
                >
                  <div>
                    <span className="font-medium text-[#e8f0f0]">{option.symbol}</span>
                    <span className="text-xs text-[#6a7e82] ml-2">{option.group}</span>
                  </div>
                  <span className="text-sm text-[#a0b4b8]">{option.name}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-[#6a7e82]">
                No pairs found. You can type a custom pair.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
  if (value === null || value === undefined || value === '') return '-';
  const num = parseFloat(value);
  if (isNaN(num)) return '-';
  return `$${num.toFixed(2)}`;
};

// Helper function to format number with decimals
const formatNumber = (value, decimals = 4) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = parseFloat(value);
  if (isNaN(num)) return '-';
  return num.toFixed(decimals);
};

// Main PoolTrades Component
const PoolTrades = () => {
    console.log('🔥 PoolTrades rendering');
    const { poolId } = useParams();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    const pathParts = location.pathname.split('/');
    const idFromPath = pathParts[2];
    const finalPoolId = poolId || idFromPath;
    
    console.log('📌 Final Pool ID:', finalPoolId);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pool, setPool] = useState(null);
    const [trades, setTrades] = useState([]);
    const [openPositions, setOpenPositions] = useState([]);
    const [tradeStats, setTradeStats] = useState({});
    const [showAddTradeModal, setShowAddTradeModal] = useState(false);
    const [showCloseTradeModal, setShowCloseTradeModal] = useState(false);
    const [closingTrade, setClosingTrade] = useState(null);
    
    // Auto-calculated P/L for close modal
    const [calculatedPL, setCalculatedPL] = useState(0);
    
    const [formData, setFormData] = useState({
        symbol: '',
        direction: 'BUY',
        lot_size: '',
        open_price: '',
        stop_loss: '',
        take_profit: '',
        stake: '',
        notes: '',
        open_time: new Date().toISOString().slice(0, 16)
    });

    const [closeFormData, setCloseFormData] = useState({
        close_price: '',
        return_amount: '',
        closed_reason: '',
        close_time: new Date().toISOString().slice(0, 16)
    });

    // Auto-calculate P/L when return_amount changes
    useEffect(() => {
        if (closingTrade) {
            const stake = parseFloat(closingTrade.stake || closingTrade.entry_amount || 0);
            const returnAmount = parseFloat(closeFormData.return_amount) || 0;
            const pl = returnAmount - stake;
            setCalculatedPL(pl);
        }
    }, [closeFormData.return_amount, closingTrade]);

    // Get selected pair details
    const selectedPair = popularCurrencyPairs.find(p => p.symbol === formData.symbol);
    const selectedClosePair = closingTrade ? popularCurrencyPairs.find(p => p.symbol === closingTrade.symbol) : null;

    // Validate stop loss and take profit based on direction
    const validateSLTP = (price, type, direction, openPrice) => {
        if (!price || !direction || !openPrice) return { valid: true, message: '' };
        
        const numPrice = parseFloat(price);
        const numOpenPrice = parseFloat(openPrice);
        
        if (isNaN(numPrice) || isNaN(numOpenPrice)) return { valid: true, message: '' };
        
        if (type === 'stop_loss') {
            if (direction === 'BUY' && numPrice >= numOpenPrice) {
                return { 
                    valid: false, 
                    message: '⚠️ For BUY orders, Stop Loss must be BELOW the opening price' 
                };
            }
            if (direction === 'SELL' && numPrice <= numOpenPrice) {
                return { 
                    valid: false, 
                    message: '⚠️ For SELL orders, Stop Loss must be ABOVE the opening price' 
                };
            }
        }
        
        if (type === 'take_profit') {
            if (direction === 'BUY' && numPrice <= numOpenPrice) {
                return { 
                    valid: false, 
                    message: '⚠️ For BUY orders, Take Profit must be ABOVE the opening price' 
                };
            }
            if (direction === 'SELL' && numPrice >= numOpenPrice) {
                return { 
                    valid: false, 
                    message: '⚠️ For SELL orders, Take Profit must be BELOW the opening price' 
                };
            }
        }
        
        return { valid: true, message: '' };
    };

    // Get volume step based on pair type
    const getVolumeStep = (pair) => {
        if (!pair) return '0.01';
        return pair.volumeStep.toString();
    };

    // Get volume placeholder based on pair type
    const getVolumePlaceholder = (pair) => {
        if (!pair) return 'Enter lot size';
        return `e.g., ${pair.volumeMin} - ${pair.volumeMax} ${pair.volumeLabel}`;
    };

    // Get price placeholder based on pair type
    const getPricePlaceholder = (pair) => {
        if (!pair) return 'Enter price';
        const examples = {
            'forex': 'e.g., 1.0925',
            'crypto': 'e.g., 65000.00',
            'gold': 'e.g., 2350.50',
            'commodity': 'e.g., 82.50'
        };
        return examples[pair.type] || 'Enter price';
    };

    // Get volume label
    const getVolumeLabel = (pair) => {
        if (!pair) return 'Lot Size';
        return `Lot Size (${pair.volumeLabel})`;
    };

    // Get price label
    const getPriceLabel = (pair) => {
        if (!pair) return 'Price';
        return `Price (${pair.symbol})`;
    };

    // Get asset type badge
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

    const fetchPoolTrades = useCallback(async () => {
        if (!isAuthenticated || !user?.isAdmin || !finalPoolId) {
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            console.log('📡 Making API calls for pool:', finalPoolId);
            
            const poolRes = await api.get(`/pools/${finalPoolId}`);
            if (poolRes.data.success) {
                setPool(poolRes.data.pool);
            } else {
                setError('Pool not found');
                setLoading(false);
                return;
            }
            
            const [tradesRes, positionsRes, statsRes] = await Promise.all([
                api.get(`/admin/trade-management/pool/${finalPoolId}/trades`),
                api.get(`/admin/trade-management/pool/${finalPoolId}/positions`),
                api.get(`/admin/trade-management/pool/${finalPoolId}/summary`)
            ]);
            
            if (tradesRes.data.success) setTrades(tradesRes.data.trades || []);
            if (positionsRes.data.success) setOpenPositions(positionsRes.data.positions || []);
            if (statsRes.data.success) setTradeStats(statsRes.data.tradeStats || {});
            
        } catch (error) {
            console.error('❌ Error fetching pool trades:', error);
            setError(error.response?.data?.message || 'Failed to load trade data');
            toast.error('Failed to load trade data');
        } finally {
            setLoading(false);
        }
    }, [finalPoolId, isAuthenticated, user?.isAdmin]);

    useEffect(() => {
        fetchPoolTrades();
    }, [fetchPoolTrades]);

    const handleAddTrade = async (e) => {
        e.preventDefault();
        
        // Validate Stop Loss
        if (formData.stop_loss) {
            const slValidation = validateSLTP(formData.stop_loss, 'stop_loss', formData.direction, formData.open_price);
            if (!slValidation.valid) {
                toast.error(slValidation.message);
                return;
            }
        }
        
        // Validate Take Profit
        if (formData.take_profit) {
            const tpValidation = validateSLTP(formData.take_profit, 'take_profit', formData.direction, formData.open_price);
            if (!tpValidation.valid) {
                toast.error(tpValidation.message);
                return;
            }
        }
        
        try {
            const response = await api.post('/admin/trade-management/trade', {
                symbol: formData.symbol,
                direction: formData.direction,
                lot_size: parseFloat(formData.lot_size) || 0,
                open_price: parseFloat(formData.open_price) || 0,
                stake: parseFloat(formData.stake) || 0,
                stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
                take_profit: formData.take_profit ? parseFloat(formData.take_profit) : null,
                pool_id: parseInt(finalPoolId),
                notes: formData.notes || '',
                open_time: formData.open_time ? new Date(formData.open_time).toISOString() : new Date().toISOString()
            });
            
            if (response.data.success) {
                toast.success('✅ Trade opened successfully!');
                setShowAddTradeModal(false);
                fetchPoolTrades();
                setFormData({
                    symbol: '',
                    direction: 'BUY',
                    lot_size: '',
                    open_price: '',
                    stop_loss: '',
                    take_profit: '',
                    stake: '',
                    notes: '',
                    open_time: new Date().toISOString().slice(0, 16)
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to open trade');
        }
    };

    const handleCloseTrade = (trade) => {
        setClosingTrade(trade);
        setCloseFormData({
            close_price: '',
            return_amount: '',
            closed_reason: '',
            close_time: new Date().toISOString().slice(0, 16)
        });
        setCalculatedPL(0);
        setShowCloseTradeModal(true);
    };

    const confirmCloseTrade = async (e) => {
        e.preventDefault();
        
        const stake = parseFloat(closingTrade.stake || closingTrade.entry_amount || 0);
        const returnAmount = parseFloat(closeFormData.return_amount) || 0;
        const pl = returnAmount - stake;
        
        try {
            const response = await api.post(`/admin/trade-management/trade/${closingTrade.id}/close`, {
                close_price: parseFloat(closeFormData.close_price) || 0,
                return_amount: returnAmount,
                profit_loss: pl,
                closed_reason: closeFormData.closed_reason || 'Closed by admin',
                close_time: closeFormData.close_time ? new Date(closeFormData.close_time).toISOString() : new Date().toISOString()
            });
            
            if (response.data.success) {
                toast.success('✅ Trade closed successfully!');
                setShowCloseTradeModal(false);
                setClosingTrade(null);
                setCloseFormData({
                    close_price: '',
                    return_amount: '',
                    closed_reason: '',
                    close_time: new Date().toISOString().slice(0, 16)
                });
                setCalculatedPL(0);
                fetchPoolTrades();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to close trade');
        }
    };

    // Auth checks
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: `/pool/${finalPoolId}/trades` }} />;
    }

    if (!user?.isAdmin) {
        return <Navigate to="/dashboard" />;
    }

    if (!finalPoolId) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-[#ff6b6b] mb-2">Invalid Pool ID</h2>
                    <p className="text-[#a0b4b8]">No pool ID provided in the URL.</p>
                    <button 
                        onClick={() => navigate('/admin')}
                        className="btn btn-primary mt-4"
                    >
                        Back to Admin
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
                    <p className="text-[#a0b4b8]">Loading trades for Pool #{finalPoolId}...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-[#ff6b6b] mb-2">Error Loading Data</h2>
                    <p className="text-[#a0b4b8] mb-4">{error}</p>
                    <button 
                        onClick={() => navigate('/admin')}
                        className="btn btn-primary"
                    >
                        Back to Admin Panel
                    </button>
                </div>
            </div>
        );
    }

    const getCurrentDateTime = () => {
        return new Date().toLocaleString();
    };

    return (
        <>
            <SEO title={`${pool?.name || 'Pool'} - Trade Management`} />
            
            <div className="min-h-screen bg-[#0a0e0f]">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button 
                            onClick={() => navigate('/admin')} 
                            className="text-[#00d4aa] hover:text-[#33ddbb] mb-2 inline-block flex items-center gap-2 font-medium transition"
                        >
                            ← Back to Admin Panel
                        </button>
                        <h1 className="text-3xl font-bold text-[#e8f0f0]">{pool?.name || 'Pool'} - Trade Management</h1>
                        <p className="text-[#a0b4b8] mt-2">
                            Pool ID: {finalPoolId} • Current Time: {getCurrentDateTime()}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="stat-card">
                            <div className="stat-label">Total Trades</div>
                            <div className="stat-value">{tradeStats.total_trades || 0}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Open Positions</div>
                            <div className="stat-value text-[#ffd93d]">{tradeStats.open_trades || 0}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Total Profit</div>
                            <div className="stat-value text-[#00d4aa]">${Math.abs(tradeStats.total_profit || 0).toLocaleString()}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Total Loss</div>
                            <div className="stat-value text-[#ff6b6b]">-${Math.abs(tradeStats.total_loss || 0).toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Add Trade Button */}
                    <div className="mb-6">
                        <button 
                            onClick={() => setShowAddTradeModal(true)}
                            className="btn btn-primary btn-lg"
                        >
                            + Open New Trade
                        </button>
                    </div>

                    {/* Open Positions Section */}
                    {openPositions.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-[#e8f0f0] mb-4">📈 Open Positions ({openPositions.length})</h2>
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover">
                                <div className="overflow-x-auto">
                                    <table className="table-dark">
                                        <thead>
                                            <tr>
                                                <th>Open Time</th>
                                                <th>Pool</th>
                                                <th>Symbol</th>
                                                <th>Type</th>
                                                <th>Direction</th>
                                                <th>Lot Size</th>
                                                <th>Entry Price</th>
                                                <th>Stake ($)</th>
                                                <th>Stop Loss</th>
                                                <th>Take Profit</th>
                                                <th>Current P&L</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {openPositions.map(trade => {
                                                const pair = popularCurrencyPairs.find(p => p.symbol === trade.symbol);
                                                const typeBadge = getAssetTypeBadge(pair);
                                                return (
                                                    <tr key={trade.id} className="hover:bg-[#1c2426] transition">
                                                        <td className="p-4 text-sm text-[#a0b4b8]">{new Date(trade.open_time).toLocaleString()}</td>
                                                        <td className="p-4 font-medium text-[#e8f0f0]">{trade.pool_name || pool?.name || '-'}</td>
                                                        <td className="p-4 font-semibold text-[#e8f0f0]">{trade.symbol}</td>
                                                        <td className="p-4">
                                                            {pair && (
                                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${typeBadge.color}`}>
                                                                    {typeBadge.label}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`badge ${trade.direction === 'BUY' ? 'badge-success' : 'badge-danger'}`}>
                                                                {trade.direction}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-[#e8f0f0]">{trade.lot_size || trade.volume || '-'}</td>
                                                        <td className="p-4 text-[#e8f0f0]">{formatNumber(trade.open_price, pair?.priceDecimals || 4)}</td>
                                                        <td className="p-4 font-semibold text-[#e8f0f0]">{formatCurrency(trade.stake || trade.entry_amount)}</td>
                                                        <td className="p-4 text-[#ff6b6b]">{trade.stop_loss ? `$${formatNumber(trade.stop_loss, pair?.priceDecimals || 4)}` : '-'}</td>
                                                        <td className="p-4 text-[#00d4aa]">{trade.take_profit ? `$${formatNumber(trade.take_profit, pair?.priceDecimals || 4)}` : '-'}</td>
                                                        <td className={`p-4 font-semibold ${(trade.current_pnl || 0) >= 0 ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'}`}>
                                                            ${(trade.current_pnl || 0).toLocaleString()}
                                                            <span className="text-xs block text-[#6a7e82]">{(trade.pnl_percentage || 0).toFixed(2)}%</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <button 
                                                                onClick={() => handleCloseTrade(trade)} 
                                                                className="btn btn-danger btn-sm"
                                                            >
                                                                Close
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trade History */}
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
                                            <th>Type</th>
                                            <th>Direction</th>
                                            <th>Lot Size</th>
                                            <th>Entry</th>
                                            <th>Exit</th>
                                            <th>Stake $</th>
                                            <th>Return $</th>
                                            <th>P&L</th>
                                            <th>Status</th>
                                            <th>Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trades.map(trade => {
                                            const pair = popularCurrencyPairs.find(p => p.symbol === trade.symbol);
                                            const typeBadge = getAssetTypeBadge(pair);
                                            return (
                                                <tr key={trade.id} className="hover:bg-[#1c2426] transition">
                                                    <td className="p-4 text-sm text-[#a0b4b8]">{new Date(trade.open_time).toLocaleString()}</td>
                                                    <td className="p-4 text-sm text-[#a0b4b8]">{trade.close_time ? new Date(trade.close_time).toLocaleString() : '-'}</td>
                                                    <td className="p-4 text-[#e8f0f0]">{trade.pool_name || pool?.name || '-'}</td>
                                                    <td className="p-4 font-semibold text-[#e8f0f0]">{trade.symbol}</td>
                                                    <td className="p-4">
                                                        {pair && (
                                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${typeBadge.color}`}>
                                                                {typeBadge.label}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`badge ${trade.direction === 'BUY' ? 'badge-success' : 'badge-danger'}`}>
                                                            {trade.direction}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-[#e8f0f0]">{trade.lot_size || trade.volume || '-'}</td>
                                                    <td className="p-4 text-[#e8f0f0]">{formatNumber(trade.open_price, pair?.priceDecimals || 4)}</td>
                                                    <td className="p-4 text-[#e8f0f0]">{trade.close_price ? formatNumber(trade.close_price, pair?.priceDecimals || 4) : '-'}</td>
                                                    <td className="p-4 font-semibold text-[#e8f0f0]">{formatCurrency(trade.stake || trade.entry_amount)}</td>
                                                    <td className="p-4 font-semibold text-[#e8f0f0]">{formatCurrency(trade.return_amount || trade.exit_amount)}</td>
                                                    <td className={`p-4 font-semibold ${(trade.profit_loss || 0) >= 0 ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'}`}>
                                                        {trade.profit_loss !== null && trade.profit_loss !== undefined 
                                                            ? `${trade.profit_loss >= 0 ? '+' : ''}$${parseFloat(trade.profit_loss).toLocaleString()}` 
                                                            : '-'
                                                        }
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`badge ${trade.status === 'closed' ? 'badge-gray' : 'badge-warning'}`}>
                                                            {trade.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-[#a0b4b8]">{trade.closed_reason || '-'}</td>
                                                </tr>
                                            );
                                        })}
                                        {trades.length === 0 && (
                                            <tr>
                                                <td colSpan="14" className="p-8 text-center text-[#a0b4b8]">
                                                    No trades found for this pool
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Open New Trade Modal */}
                    {showAddTradeModal && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto modal-dark">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-[#e8f0f0]">📊 Open New Trade</h2>
                                    <button onClick={() => setShowAddTradeModal(false)} className="text-[#a0b4b8] hover:text-[#e8f0f0] text-2xl transition">✕</button>
                                </div>
                                <form onSubmit={handleAddTrade} className="space-y-4">
                                    <div className="bg-[#1c2426] p-3 rounded-lg border border-[#00d4aa]/20">
                                        <p className="text-sm text-[#a0b4b8]">
                                            📊 Direction: <strong className="text-[#e8f0f0]">{formData.direction === 'BUY' ? '📈 LONG' : '📉 SHORT'}</strong>
                                            {formData.direction === 'BUY' ? (
                                                <span className="text-xs text-[#00d4aa] ml-2">(Stop Loss ↓ Below • Take Profit ↑ Above)</span>
                                            ) : (
                                                <span className="text-xs text-[#ff6b6b] ml-2">(Stop Loss ↑ Above • Take Profit ↓ Below)</span>
                                            )}
                                        </p>
                                    </div>

                                    <DateTimePicker
                                        label="⏰ Open Time"
                                        value={formData.open_time}
                                        onChange={(value) => setFormData({...formData, open_time: value})}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Currency Pair <span className="text-[#ff6b6b]">*</span></label>
                                        <SearchableDropdown
                                            options={popularCurrencyPairs}
                                            value={formData.symbol}
                                            onChange={(symbol) => {
                                                const pair = popularCurrencyPairs.find(p => p.symbol === symbol);
                                                setFormData({
                                                    ...formData, 
                                                    symbol,
                                                    open_price: '',
                                                    lot_size: '',
                                                    stop_loss: '',
                                                    take_profit: '',
                                                    stake: ''
                                                });
                                            }}
                                            placeholder="Search or type currency pair..."
                                        />
                                        {selectedPair && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getAssetTypeBadge(selectedPair).color}`}>
                                                    {getAssetTypeBadge(selectedPair).label}
                                                </span>
                                                <span className="text-xs text-[#6a7e82]">
                                                    Price: {selectedPair.priceDecimals} decimals • Lot Size: {selectedPair.volumeMin} - {selectedPair.volumeMax} {selectedPair.volumeLabel}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Direction <span className="text-[#ff6b6b]">*</span></label>
                                        <select className="w-full p-2 border border-[#2a3538] rounded-lg bg-[#1c2426] text-[#e8f0f0] focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                                            value={formData.direction} onChange={(e) => {
                                                setFormData({...formData, direction: e.target.value});
                                            }} required>
                                            <option value="BUY">📈 BUY (Long - Expecting price to rise)</option>
                                            <option value="SELL">📉 SELL (Short - Expecting price to fall)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">{getPriceLabel(selectedPair)} <span className="text-[#ff6b6b]">*</span></label>
                                        <input 
                                            type="number" 
                                            step={selectedPair ? `0.${'0'.repeat(selectedPair.priceDecimals - 1)}1` : '0.0001'}
                                            placeholder={getPricePlaceholder(selectedPair)} 
                                            className="input-dark"
                                            value={formData.open_price} 
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (selectedPair) {
                                                    const decimals = selectedPair.priceDecimals;
                                                    const parts = val.split('.');
                                                    if (parts[1] && parts[1].length > decimals) {
                                                        return;
                                                    }
                                                }
                                                setFormData({...formData, open_price: val});
                                            }} 
                                            required 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">{getVolumeLabel(selectedPair)} <span className="text-[#ff6b6b]">*</span></label>
                                        <input 
                                            type="number" 
                                            step={getVolumeStep(selectedPair)}
                                            placeholder={getVolumePlaceholder(selectedPair)} 
                                            className="input-dark"
                                            value={formData.lot_size} 
                                            onChange={(e) => setFormData({...formData, lot_size: e.target.value})} 
                                            required 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Stake ($) <span className="text-[#ff6b6b]">*</span></label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            placeholder="e.g., 100.00 (amount staked/traded)" 
                                            className="input-dark"
                                            value={formData.stake} 
                                            onChange={(e) => setFormData({...formData, stake: e.target.value})} 
                                            required 
                                        />
                                        <p className="text-xs text-[#6a7e82] mt-1">💰 The actual dollar amount you're trading/staking</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Stop Loss</label>
                                            <input 
                                                type="number" 
                                                step={selectedPair ? `0.${'0'.repeat(selectedPair.priceDecimals - 1)}1` : '0.0001'}
                                                placeholder="Optional" 
                                                className="input-dark"
                                                value={formData.stop_loss} 
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setFormData({...formData, stop_loss: value});
                                                }} 
                                            />
                                            {formData.stop_loss && formData.open_price && (
                                                <div className="mt-1">
                                                    {(() => {
                                                        const validation = validateSLTP(formData.stop_loss, 'stop_loss', formData.direction, formData.open_price);
                                                        if (!validation.valid) {
                                                            return <p className="text-xs text-[#ff6b6b]">{validation.message}</p>;
                                                        } else {
                                                            return (
                                                                <p className="text-xs text-[#00d4aa]">
                                                                    ✅ Valid: Stop Loss is {formData.direction === 'BUY' ? 'below' : 'above'} opening price
                                                                </p>
                                                            );
                                                        }
                                                    })()}
                                                </div>
                                            )}
                                            <p className="text-xs text-[#6a7e82] mt-1">
                                                {formData.direction === 'BUY' 
                                                    ? '📈 For BUY: Stop Loss must be BELOW opening price' 
                                                    : '📉 For SELL: Stop Loss must be ABOVE opening price'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Take Profit</label>
                                            <input 
                                                type="number" 
                                                step={selectedPair ? `0.${'0'.repeat(selectedPair.priceDecimals - 1)}1` : '0.0001'}
                                                placeholder="Optional" 
                                                className="input-dark"
                                                value={formData.take_profit} 
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setFormData({...formData, take_profit: value});
                                                }}
                                            />
                                            {formData.take_profit && formData.open_price && (
                                                <div className="mt-1">
                                                    {(() => {
                                                        const validation = validateSLTP(formData.take_profit, 'take_profit', formData.direction, formData.open_price);
                                                        if (!validation.valid) {
                                                            return <p className="text-xs text-[#ff6b6b]">{validation.message}</p>;
                                                        } else {
                                                            return (
                                                                <p className="text-xs text-[#00d4aa]">
                                                                    ✅ Valid: Take Profit is {formData.direction === 'BUY' ? 'above' : 'below'} opening price
                                                                </p>
                                                            );
                                                        }
                                                    })()}
                                                </div>
                                            )}
                                            <p className="text-xs text-[#6a7e82] mt-1">
                                                {formData.direction === 'BUY' 
                                                    ? '📈 For BUY: Take Profit must be ABOVE opening price' 
                                                    : '📉 For SELL: Take Profit must be BELOW opening price'}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Notes</label>
                                        <textarea placeholder="Add notes about this trade" rows="2" className="input-dark"
                                            value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4 border-t border-[#2a3538]">
                                        <button type="button" onClick={() => setShowAddTradeModal(false)} className="btn btn-outline">Cancel</button>
                                        <button type="submit" className="btn btn-primary">✅ Open Trade</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Close Trade Modal - P/L AUTO-CALCULATED DISPLAY ONLY */}
                    {showCloseTradeModal && closingTrade && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto modal-dark">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-[#e8f0f0]">🔒 Close Trade</h2>
                                    <button onClick={() => {
                                        setShowCloseTradeModal(false);
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
                                            Entry Price: {formatNumber(closingTrade.open_price, selectedClosePair?.priceDecimals || 4)}
                                        </p>
                                        <p className="text-sm text-[#a0b4b8]">
                                            Lot Size: <strong className="text-[#e8f0f0]">{closingTrade.lot_size || closingTrade.volume || '-'}</strong>
                                        </p>
                                        <p className="text-sm text-[#a0b4b8]">
                                            Stake: <strong className="text-[#00d4aa]">{formatCurrency(closingTrade.stake || closingTrade.entry_amount)}</strong>
                                        </p>
                                        {selectedClosePair && (
                                            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${getAssetTypeBadge(selectedClosePair).color}`}>
                                                {getAssetTypeBadge(selectedClosePair).label}
                                            </span>
                                        )}
                                    </div>

                                    <DateTimePicker
                                        label="⏰ Close Time"
                                        value={closeFormData.close_time}
                                        onChange={(value) => setCloseFormData({...closeFormData, close_time: value})}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Currency Pair</label>
                                        <div className="w-full p-2 bg-[#1c2426] border border-[#2a3538] rounded-lg font-semibold text-[#e8f0f0]">
                                            {closingTrade.symbol}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Lot Size (Fixed from Opening)</label>
                                        <div className="w-full p-2 bg-[#1c2426] border border-[#2a3538] rounded-lg font-semibold text-[#e8f0f0]">
                                            {closingTrade.lot_size || closingTrade.volume || '-'}
                                        </div>
                                        <p className="text-xs text-[#6a7e82] mt-1">🔒 Lot Size is fixed and cannot be changed when closing</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">{getPriceLabel(selectedClosePair)} <span className="text-[#ff6b6b]">*</span></label>
                                        <input 
                                            type="number" 
                                            step={selectedClosePair ? `0.${'0'.repeat(selectedClosePair.priceDecimals - 1)}1` : '0.0001'}
                                            placeholder={getPricePlaceholder(selectedClosePair)} 
                                            className="input-dark"
                                            value={closeFormData.close_price} 
                                            onChange={(e) => setCloseFormData({...closeFormData, close_price: e.target.value})} 
                                            required 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Return ($) <span className="text-[#ff6b6b]">*</span></label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            placeholder="e.g., 45.00 (amount received/closed)" 
                                            className="input-dark"
                                            value={closeFormData.return_amount} 
                                            onChange={(e) => {
                                                setCloseFormData({...closeFormData, return_amount: e.target.value});
                                            }} 
                                            required 
                                        />
                                        <p className="text-xs text-[#6a7e82] mt-1">💰 The actual dollar amount you're closing the trade with</p>
                                    </div>

                                    {/* P/L - AUTO-CALCULATED DISPLAY ONLY */}
                                    <div className="bg-[#1c2426] p-4 rounded-lg border-2 border-[#00d4aa]/30">
                                        <p className="text-sm font-semibold text-center text-[#a0b4b8]">
                                            📊 Profit/Loss (Auto-Calculated)
                                        </p>
                                        <p className={`text-2xl font-bold text-center ${calculatedPL >= 0 ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'}`}>
                                            {calculatedPL >= 0 ? '+' : ''}${calculatedPL.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-[#6a7e82] text-center mt-1">
                                            Return - Stake = {closeFormData.return_amount || '0'} - {closingTrade?.stake || closingTrade?.entry_amount || '0'} = {calculatedPL.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-[#6a7e82] text-center mt-1">
                                            🔒 Auto-calculated - No manual entry needed
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Reason for Closing</label>
                                        <select className="w-full p-2 border border-[#2a3538] rounded-lg bg-[#1c2426] text-[#e8f0f0] focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
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
                                            setShowCloseTradeModal(false);
                                            setClosingTrade(null);
                                        }} className="btn btn-outline">Cancel</button>
                                        <button type="submit" className="btn btn-danger">🔒 Close Trade</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PoolTrades;