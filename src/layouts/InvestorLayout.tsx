import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  Receipt,
  FileText,
  ArrowLeftRight,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  MapPin,
  Wallet,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface NavItemType {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItemType[] = [
  { label: 'Dashboard', path: '/investor/dashboard', icon: LayoutDashboard },
  { label: 'Properties', path: '/investor/properties', icon: Building2 },
  { label: 'Funds', path: '/investor/funds', icon: TrendingUp },
  { label: 'Transactions', path: '/investor/transactions', icon: Receipt },
  { label: 'Documents', path: '/investor/documents', icon: FileText },
  { label: 'Share Marketplace', path: '/investor/shares', icon: ArrowLeftRight },
  { label: 'Settings', path: '/investor/settings', icon: Settings },
];

const InvestorLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <MapPin className="w-8 h-8 text-emerald-500" />
            <span className="text-xl font-bold text-white">TaxDeedInvest</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Portfolio Summary Card */}
        <div className="m-4 p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-100 text-sm mb-2">
            <Wallet className="w-4 h-4" />
            Portfolio Value
          </div>
          <p className="text-2xl font-bold text-white">$245,850.00</p>
          <p className="text-sm text-emerald-200 mt-1">+12.5% this month</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 mx-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'text-white bg-slate-700/50 border-l-4 border-emerald-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Help Section */}
        <div className="p-4 border-t border-slate-700">
          <div className="p-4 bg-slate-800 rounded-lg">
            <p className="text-sm font-medium text-white mb-1">Need Help?</p>
            <p className="text-xs text-slate-400 mb-3">
              Contact our support team for assistance.
            </p>
            <button className="w-full py-2 text-sm font-medium text-emerald-500 hover:text-emerald-400 border border-emerald-500 hover:border-emerald-400 rounded-lg transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <p className="text-sm text-gray-500">Welcome back,</p>
              <h1 className="text-lg font-semibold text-gray-800">John Doe</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">John Doe</p>
                <p className="text-xs text-gray-500">Verified Investor</p>
              </div>
              <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InvestorLayout;

