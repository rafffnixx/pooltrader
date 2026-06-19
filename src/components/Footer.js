import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#111618] border-t border-[#2a3538] mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(0,212,170,0.15)]">
                <img 
                  src="/pooltrader.png" 
                  alt="PoolTrader Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-extrabold text-xl text-[#e8f0f0]">
                Pool<span className="text-[#00d4aa]">Trader</span>
              </span>
            </div>
            <p className="text-[#a0b4b8] text-sm leading-relaxed">
              Professional trading pool management platform. Trade together, win together.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-[#e8f0f0] mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-[#a0b4b8] hover:text-[#00d4aa] transition duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#a0b4b8] hover:text-[#00d4aa] transition duration-300">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#a0b4b8] hover:text-[#00d4aa] transition duration-300">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-[#a0b4b8] hover:text-[#00d4aa] transition duration-300">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-[#e8f0f0] mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-[#a0b4b8] hover:text-[#00d4aa] transition duration-300">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-[#a0b4b8] hover:text-[#00d4aa] transition duration-300">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Risk Warning */}
          <div>
            <h4 className="font-semibold text-[#e8f0f0] mb-4">⚠️ Risk Warning</h4>
            <div className="bg-[#1c2426] border-l-4 border-[#ff6b6b] p-3 rounded-lg">
              <p className="text-[#a0b4b8] text-xs leading-relaxed">
                Trading involves substantial risk of loss. Past performance does not guarantee future results. 
                Only invest what you can afford to lose.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#2a3538] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#6a7e82] text-sm">
            &copy; {new Date().getFullYear()} PoolTrader. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[#6a7e82] text-xs">Built with ❤️ by PoolTrader Team</span>
            <span className="w-1 h-1 bg-[#2a3538] rounded-full"></span>
            <span className="text-[#6a7e82] text-xs">Version 2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;