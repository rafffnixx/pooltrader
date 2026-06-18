import React from 'react';
import { Link } from 'react-router-dom';

const TestPage = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Test Links</h1>
            <div className="space-y-2">
                <div><Link to="/pool/1/trades" className="text-blue-600">Pool 1 Trades</Link></div>
                <div><Link to="/pool/2/trades" className="text-blue-600">Pool 2 Trades</Link></div>
                <div><Link to="/pool/3/trades" className="text-blue-600">Pool 3 Trades</Link></div>
                <div><Link to="/pool/4/trades" className="text-blue-600">Pool 4 Trades</Link></div>
                <div><Link to="/pool/5/trades" className="text-blue-600">Pool 5 Trades</Link></div>
                <div><Link to="/admin" className="text-green-600">Admin Panel</Link></div>
                <div><Link to="/dashboard" className="text-green-600">Dashboard</Link></div>
            </div>
        </div>
    );
};

export default TestPage;