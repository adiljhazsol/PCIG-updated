import { useState } from 'react';
import {
  Bell,
  User,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

export default function AdminNav() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const location = useLocation();

  // Ensure location.pathname is always defined
  const currentPath = location?.pathname || window.location.pathname;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);

  // --- 1. Define Hierarchy ---

  // Level 1: Global Nav
  const globalNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', root: '/admin/dashboard' },
    { label: 'Workflow', path: '/admin/properties', root: '/admin/properties' }, // Hub is default
    { label: 'Investors', path: '/admin/investors/management', root: '/admin/investors' },
    { label: 'Payments', path: '/admin/payments', root: '/admin/payments' },
    { label: 'Asset Transactions', path: '/admin/asset-transactions', root: '/admin/asset-transactions' },
    { label: 'Operations', path: '/admin/operations/surplus-funds-research', root: '/admin/operations' },
    { label: 'Payoffs', path: '/admin/payoffs/queue', root: '/admin/payoffs' },
    { label: 'Admin', path: '/admin/administration/settings', root: '/admin/administration' },
  ];

  // Level 2: Sub-Nav definitions
  const subNavConfig: { [key: string]: Array<{ label: string; path: string }> } = {
    'Workflow': [
      { label: 'Hub', path: '/admin/properties' },
      { label: 'FIFA Import', path: '/admin/properties/fifa-import' },
      { label: 'Parcel Research', path: '/admin/properties/parcel-research' },
      { label: 'FIFA Processing', path: '/admin/properties/fifa-processing' },
      { label: 'Sheriff Workflow', path: '/admin/properties/sheriff-workflow' },
      { label: 'Redemption', path: '/admin/properties/redemption-tracking' },
      { label: 'Barment', path: '/admin/properties/barment' },
      { label: 'Quiet Title', path: '/admin/properties/quiet-title' },
      { label: 'REO Disposition', path: '/admin/properties/reo-disposition' },
      { label: 'Auction', path: '/admin/properties/auction' }, // Added from previous file
    ],
    'Investors': [
      { label: 'Management', path: '/admin/investors/management' },
      { label: 'Fund Admin', path: '/admin/investors/fund-admin' },
    ],
    'Payments': [
      { label: 'Payments', path: '/admin/payments' },
      { label: 'K-1 Gen', path: '/admin/payments/k1-generation' },
      { label: 'Ledger', path: '/admin/payments/lightweight-ledger' },
      { label: 'Interest Calc', path: '/admin/payments/interest-calculation' },
      { label: 'Depr. & Tax', path: '/admin/payments/depreciation-tax-allocation' },
    ],
    'Asset Transactions': [
      { label: 'Transactions', path: '/admin/asset-transactions' }
    ],
    'Operations': [
      { label: 'Surplus Funds', path: '/admin/operations/surplus-funds-research' },
      { label: 'Tax Appeal', path: '/admin/operations/property-tax-appeal' },
      { label: 'Expense & Share', path: '/admin/operations/expense-input-allocation' },
      { label: 'Time Tracking', path: '/admin/operations/time-tracking' },
      { label: 'Notice Letters', path: '/admin/operations/notice-letters' },
      { label: 'eFile Cancel', path: '/admin/operations/efile-cancellations' },
    ],
    'Payoffs': [
      { label: 'Queue', path: '/admin/payoffs/queue' },
      { label: 'Owner Portal', path: '/admin/payoffs/owner-portal' },
      { label: 'Lawyer Portal', path: '/admin/payoffs/lawyer-portal' },
    ],
    'Admin': [
      { label: 'Settings', path: '/admin/administration/settings' },
      { label: 'Reports', path: '/admin/administration/reports-center' },
      { label: 'Import', path: '/admin/administration/import-center' },
      { label: 'Audit Log', path: '/admin/administration/audit-log' },
      { label: 'Users', path: '/admin/administration/user-management' },
      { label: 'Calendar', path: '/admin/administration/calendar-deadline' },
      { label: 'Notifications', path: '/admin/administration/notifications-escalation' },
      { label: 'Config', path: '/admin/administration/county-state-config' },
    ]
  };

  // --- 2. Determine Logic ---

  // Determine active root
  const activeRootItem = globalNavItems.find(item => {
    // Special case for Dashboard
    if (item.label === 'Dashboard' && currentPath === '/admin/dashboard') return true;
    // Prefix match for others (e.g. /admin/properties matches root /admin/properties)
    if (item.label !== 'Dashboard' && currentPath.startsWith(item.root)) return true;
    return false;
  }) || globalNavItems[0]; // Default to Dashboard ?? Or maybe null

  const activeSubNavItems = subNavConfig[activeRootItem.label] || [];

  return (
    <>
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* --- Global Top Nav (Level 1) --- */}
        <div style={{
          borderBottom: '1px solid #E2E8F0',
          padding: `0 clamp(16px, 4vw, 48px)`,
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>TaxDeedInvest</div>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#fff',
              backgroundColor: '#0F172A',
              padding: '2px 6px',
              borderRadius: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>ADMIN</span>
          </div>

          {/* Desktop Global Menu */}
          {!isMobileOrTablet && (
            <nav style={{
              display: 'flex',
              height: '100%',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              gap: 4
            }}>
              {globalNavItems.map(item => {
                const isActive = item.label === activeRootItem.label;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 16px',
                      height: '100%',
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#0F172A' : '#64748B',
                      borderBottom: isActive ? '2px solid #0F172A' : '2px solid transparent',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                    }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}>
              <Bell size={18} color="#64748B" />
            </button>
            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={16} color="#0F172A" />
            </div>
            {isMobileOrTablet && (
              <button onClick={() => setDrawerOpen(true)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}>
                <Menu size={20} color="#0F172A" />
              </button>
            )}
          </div>
        </div>

        {/* --- Dynamic Sub-Nav (Level 2) --- */}
        {/* Only show if there are sub-items and we are not on mobile (mobile uses drawer) */}
        {!isMobileOrTablet && activeSubNavItems.length > 0 && (
          <div style={{
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            padding: `0 clamp(16px, 4vw, 48px)`,
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, height: '100%' }}>
              {activeSubNavItems.map(subItem => {
                const isSubActive = currentPath === subItem.path || (subItem.path !== activeRootItem.root && currentPath.startsWith(subItem.path));
                // Slightly fuzzy matching for "Hub" which is root
                const isHubAndActive = subItem.label === 'Hub' && currentPath === activeRootItem.root;
                const finalActive = isSubActive || isHubAndActive;

                return (
                  <Link
                    key={subItem.label}
                    to={subItem.path}
                    style={{
                      fontSize: 13,
                      fontWeight: finalActive ? 600 : 500,
                      color: finalActive ? '#0F172A' : '#64748B',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      padding: '4px 8px',
                      borderRadius: 6,
                      backgroundColor: finalActive ? '#fff' : 'transparent',
                      boxShadow: finalActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    {subItem.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && isMobileOrTablet && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '320px',
              backgroundColor: '#FFFFFF',
              height: '100%',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: 20, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>Menu</span>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {globalNavItems.map(item => {
                const subItems = subNavConfig[item.label] || [];
                const hasSub = subItems.length > 0;
                const isExpanded = expandedMobileItem === item.label;
                const isActive = item.label === activeRootItem.label;

                return (
                  <div key={item.label}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: isActive ? '#F1F5F9' : 'transparent',
                      borderRadius: 8
                    }}>
                      <Link
                        to={item.path}
                        onClick={() => !hasSub && setDrawerOpen(false)}
                        style={{ textDecoration: 'none', color: '#0F172A', fontWeight: 600, flex: 1 }}
                      >
                        {item.label}
                      </Link>
                      {hasSub && (
                        <button
                          onClick={() => setExpandedMobileItem(isExpanded ? null : item.label)}
                          style={{ background: 'none', border: 'none', padding: 4 }}
                        >
                          <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                        </button>
                      )}
                    </div>
                    {hasSub && isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 16, gap: 8, marginTop: 4, marginBottom: 12 }}>
                        {subItems.map(sub => (
                          <Link
                            key={sub.label}
                            to={sub.path}
                            onClick={() => setDrawerOpen(false)}
                            style={{ textDecoration: 'none', color: '#64748B', fontSize: 14, padding: '8px 12px' }}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

