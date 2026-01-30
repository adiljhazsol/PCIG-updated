import React from 'react';
import { Outlet } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <MapPin className="w-10 h-10 text-white" />
          <span className="text-2xl font-bold text-white">TaxDeedInvest</span>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-6">
            Invest in Tax Deed Properties with Confidence
          </h1>
          <p className="text-lg text-blue-100 mb-8">
            Access exclusive tax deed investment opportunities with comprehensive 
            research, transparent tracking, and professional management.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-3xl font-bold text-white">$50M+</p>
              <p className="text-blue-200 text-sm">Assets Managed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">2,500+</p>
              <p className="text-blue-200 text-sm">Properties</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">18%</p>
              <p className="text-blue-200 text-sm">Avg. Returns</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-blue-200 text-sm">
          © {new Date().getFullYear()} TaxDeedInvest. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <MapPin className="w-10 h-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">TaxDeedInvest</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

