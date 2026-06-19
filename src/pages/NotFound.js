import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const NotFound = () => {
  return (
    <>
      <SEO title="404 - Page Not Found" description="Page not found" />
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e0f] px-4">
        <div className="text-center max-w-md">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(0,212,170,0.15)] animate-glow">
              <svg className="w-16 h-16 text-[#0a0e0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Error Code */}
          <h1 className="text-8xl font-extrabold text-[#e8f0f0] mb-2">
            4<span className="text-[#00d4aa]">0</span>4
          </h1>
          
          {/* Message */}
          <h2 className="text-2xl font-bold text-[#e8f0f0] mb-3">
            Page Not Found
          </h2>
          <p className="text-[#a0b4b8] mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="btn btn-primary btn-lg"
            >
              🏠 Go Home
            </Link>
            <Link 
              to="/dashboard" 
              className="btn btn-secondary btn-lg"
            >
              📊 Dashboard
            </Link>
          </div>

          {/* Help Text */}
          <p className="mt-8 text-sm text-[#6a7e82]">
            Need help? <Link to="/contact" className="text-[#00d4aa] hover:text-[#33ddbb] transition font-medium">Contact Support</Link>
          </p>

          {/* Decorative Line */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="w-12 h-0.5 bg-[#2a3538]"></span>
            <span className="text-[#6a7e82] text-xs">•</span>
            <span className="w-12 h-0.5 bg-[#2a3538]"></span>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;