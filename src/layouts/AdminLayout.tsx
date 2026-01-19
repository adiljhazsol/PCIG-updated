import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  Settings,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  CreditCard,
  Calendar,
  ClipboardList,
  FolderOpen,
  BarChart3,
  Upload,
  Shield,
  MapPin,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface NavItemType {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { label: string; path: string }[];
}

const navItems: NavItemType[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Properties', path: '/admin/properties', icon: Building2 },
  {
    label: 'Workflow',
    path: '/admin/workflow',
    icon: ClipboardList,
    children: [
      { label: 'FIFA Import', path: '/admin/workflow/fifa-import' },
      { label: 'Parcel Research', path: '/admin/workflow/parcel-research' },
      { label: 'FIFA Processing', path: '/admin/workflow/fifa-processing' },
      { label: 'Sheriff Workflow', path: '/admin/workflow/sheriff' },
      { label: 'Redemption Tracking', path: '/admin/workflow/redemption' },
      { label: 'Barment', path: '/admin/workflow/barment' },
      { label: 'Quiet Title', path: '/admin/workflow/quiet-title' },
      { label: 'REO Disposition', path: '/admin/workflow/reo' },
    ],
  },
  {
    label: 'Operations',
    path: '/admin/operations',
    icon: FolderOpen,
    children: [
      { label: 'Surplus Funds', path: '/admin/operations/surplus-funds' },
      { label: 'Tax Appeal', path: '/admin/operations/tax-appeal' },
      { label: 'Expenses', path: '/admin/operations/expenses' },
      { label: 'Time Tracking', path: '/admin/operations/time-tracking' },
      { label: 'Notice Letters', path: '/admin/operations/notice-letters' },
      { label: 'eFile Cancellations', path: '/admin/operations/efile' },
    ],
  },
  {
    label: 'Payoffs',
    path: '/admin/payoffs',
    icon: CreditCard,
    children: [
      { label: 'Owner Portal', path: '/admin/payoffs/owner' },
      { label: 'Lawyer Portal', path: '/admin/payoffs/lawyer' },
      { label: 'Request Queue', path: '/admin/payoffs/queue' },
    ],
  },
  {
    label: 'Management',
    path: '/admin/management',
    icon: Users,
    children: [
      { label: 'Investors', path: '/admin/management/investors' },
      { label: 'Fund Admin', path: '/admin/management/funds' },
      { label: 'Payments', path: '/admin/management/payments' },
      { label: 'Transactions', path: '/admin/management/transactions' },
      { label: 'REO Leased', path: '/admin/management/reo-leased' },
    ],
  },
  { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'Import Center', path: '/admin/import', icon: Upload },
  { label: 'Calendar', path: '/admin/calendar', icon: Calendar },
  { label: 'Documents', path: '/admin/documents', icon: FileText },
  {
    label: 'Administration',
    path: '/admin/administration',
    icon: Shield,
    children: [
      { label: 'Audit Log', path: '/admin/administration/audit-log' },
      { label: 'Settings', path: '/admin/administration/settings' },
      { label: 'User Management', path: '/admin/administration/users' },
      { label: 'Notifications', path: '/admin/administration/notifications' },
      { label: 'City/County Config', path: '/admin/administration/locations' },
    ],
  },
];

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const isMobile = useIsMobile();

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold text-white">TaxDeedInvest</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors',
                      isActive(item.path)
                        ? 'text-white bg-gray-800'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform',
                        expandedItems.includes(item.label) && 'rotate-180'
                      )}
                    />
                  </button>
                  {expandedItems.includes(item.label) && (
                    <div className="bg-gray-800/50">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={() => isMobile && setSidebarOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              'block pl-12 pr-4 py-2 text-sm transition-colors',
                              isActive
                                ? 'text-blue-400 bg-gray-800'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            )
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-white bg-gray-800 border-l-4 border-blue-500'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              )}
            </div>
          ))}
        </nav>
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
            <h1 className="text-lg font-semibold text-gray-800">
              Admin Portal
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">Admin User</p>
                <p className="text-xs text-gray-500">admin@taxdeedinvest.com</p>
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

export default AdminLayout;

