import React, { CSSProperties, useState, useEffect } from 'react';
import {
  Search,
  FileText,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpDown,
  CheckCircle2,
  Check,
  TrendingUp,
  Clock,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  FileText,
  Plus,
  TrendingUp,
  Clock,
  XCircle,
  CheckCircle2,
  Check,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpDown,
  Loader2,
  AlertCircle
};

interface Header {
  title: string;
  subtitle: string;
}

interface ActionButton {
  label: string;
  icon: string;
}

interface ActionButtons {
  reports: ActionButton;
  processPayments: ActionButton;
}

interface SummaryCard {
  label: string;
  amount?: string;
  count?: string;
  subtext?: string;
}

interface Tab {
  key: string;
  label: string;
}

interface Filter {
  label: string;
  options: string[];
}

interface Payment {
  id: string;
  type: string;
  direction: string;
  directionColor: string;
  status: string;
  statusBg: string;
  statusColor: string;
  recipient: string;
  recipientType: string;
  amount: string;
  relatedTo: string;
  method: string;
  date: string;
  selected?: boolean;
}

interface PaymentDetails {
  recipient: string;
  method: string;
  account: string;
  accountVerified: boolean;
  initiated: string;
  initiatedBy: string;
}

interface PaymentContext {
  fundName: string;
  fundId: string;
  description: string;
}

interface TimelineStep {
  step: string;
  status: 'completed' | 'current' | 'pending';
  color: string;
  date?: string;
}

interface PaymentActionButton {
  label: string;
  color: string;
}

interface PaymentActionButtons {
  approve: PaymentActionButton;
  reject: PaymentActionButton;
}

interface SelectedPayment extends Payment {
  details: PaymentDetails;
  context: PaymentContext;
  timeline: TimelineStep[];
  actionButtons: PaymentActionButtons;
}

interface DashboardData {
  header: Header;
  actionButtons: ActionButtons;
  summaryCards: SummaryCard[];
  tabs: Tab[];
  searchPlaceholder: string;
  filters: Filter[];
  tableHeaders: string[];
  payments: Payment[];
  selectedPayment: SelectedPayment;
}

export default function Payments() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  // State for Data Fetching
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for checkbox selections
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());

  // State for filtering
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState({
    status: 'All',
    type: 'All',
    method: 'All',
    date: 'Last 7 Days'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/payments/dashboard-data');
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching payments data:', err);
        setError('Failed to load payments data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading payments data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border border-slate-200">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Data</h3>
          <p className="text-slate-600 mb-6">{error || 'Something went wrong'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const header = data?.header || { title: '', subtitle: '' };
  const actionButtons = data?.actionButtons || { 
    reports: { label: 'Reports', icon: 'FileText' }, 
    processPayments: { label: 'Process Payments', icon: 'TrendingUp' } 
  };
  const summaryCards = Array.isArray(data?.summaryCards) ? data.summaryCards : [];
  const tabs = Array.isArray(data?.tabs) ? data.tabs : [];
  const searchPlaceholder = data?.searchPlaceholder || '';
  const filters = Array.isArray(data?.filters) ? data.filters : [];
  const tableHeaders = Array.isArray(data?.tableHeaders) ? data.tableHeaders : [];
  const rawPayments = Array.isArray(data?.payments) ? data.payments : [];

  const payments = rawPayments.map((p: any) => ({
    id: p?.id || '',
    type: p?.type || '',
    direction: p?.direction || '',
    directionColor: p?.directionColor || '',
    status: p?.status || '',
    statusBg: p?.statusBg || '',
    statusColor: p?.statusColor || '',
    recipient: p?.recipient || '',
    recipientType: p?.recipientType || '',
    amount: p?.amount || '',
    relatedTo: p?.relatedTo || '',
    method: p?.method || '',
    date: p?.date || '',
    selected: !!p?.selected
  }));
  
  // Safe selectedPayment extraction with default values for nested properties
  const rawSelectedPayment: any = data?.selectedPayment || (payments.length > 0 ? payments[0] : {}) || {};
  const rawDetails = rawSelectedPayment.details || {};
  const rawContext = rawSelectedPayment.context || {};
  const rawActionButtons = rawSelectedPayment.actionButtons || {};

  const selectedPayment = {
    ...rawSelectedPayment,
    id: rawSelectedPayment.id || 'PAY-Unknown',
    amount: rawSelectedPayment.amount || '$0.00',
    status: rawSelectedPayment.status || 'Unknown',
    statusBg: rawSelectedPayment.statusBg || '#F1F5F9',
    statusColor: rawSelectedPayment.statusColor || '#64748B',
    type: rawSelectedPayment.type || 'Unknown',
    direction: rawSelectedPayment.direction || 'Unknown',
    details: { 
      recipient: rawDetails.recipient || rawSelectedPayment.recipient || 'Unknown Recipient', 
      method: rawDetails.method || rawSelectedPayment.method || 'Unknown Method', 
      account: rawDetails.account || '****', 
      accountVerified: rawDetails.accountVerified || false, 
      initiated: rawDetails.initiated || rawSelectedPayment.date || 'Unknown Date', 
      initiatedBy: rawDetails.initiatedBy || 'System' 
    },
    context: { 
      fundName: rawContext.fundName || rawSelectedPayment.relatedTo || 'General Fund', 
      fundId: rawContext.fundId || 'FUND-001', 
      description: rawContext.description || 'Payment transaction' 
    },
    timeline: rawSelectedPayment.timeline || [
      { step: 'Payment Initiated', status: 'completed', color: '#10B981', date: rawSelectedPayment.date }
    ],
    actionButtons: {
      approve: { label: 'Approve', color: '#10B981', ...rawActionButtons.approve },
      reject: { label: 'Reject', color: '#EF4444', ...rawActionButtons.reject }
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (paymentId: string) => {
    setSelectedPayments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }
      return newSet;
    });
  };

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayments(new Set(filteredPayments.map((p: Payment) => p.id)));
    } else {
      setSelectedPayments(new Set());
    }
  };

  // Filter keys corresponding to the `filters` array in JSON
  const filterKeys = ['status', 'type', 'method', 'date'];

  const handleFilterChange = (idx: number, value: string) => {
    setFilterValues(prev => ({ ...prev, [filterKeys[idx]]: value }));
  };

  // Filtering Logic
  const filteredPayments = payments.filter((payment: Payment) => {
    // 1. Tab Filter
    if (activeTab === 'incoming' && payment.direction !== 'Incoming') return false;
    if (activeTab === 'outgoing' && payment.direction !== 'Outgoing') return false;
    if (activeTab === 'pending' && payment.status !== 'Pending') return false;
    if (activeTab === 'failed' && payment.status !== 'Failed') return false;

    // 2. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches =
        payment.id.toLowerCase().includes(q) ||
        payment.recipient.toLowerCase().includes(q) ||
        payment.amount.toLowerCase().includes(q) ||
        payment.relatedTo.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // 3. Dropdown Filters
    if (filterValues.status !== 'All' && payment.status !== filterValues.status) return false;
    if (filterValues.type !== 'All' && payment.type !== filterValues.type) return false;
    if (filterValues.method !== 'All' && payment.method !== filterValues.method) return false;

    // Note: Date filter logic is complex without real Date objects. 
    // Implementing a basic pass-through for now unless 'All Time' is selected 
    // or if we parse the dates later.

    return true;
  });

  const pageWrapperStyle: CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
    overflowX: 'hidden'
  };

  return (
    <div style={pageWrapperStyle}>
      <AdminNav />

      <div
        style={{
          padding: isMobile ? '16px 16px 24px' : isTablet ? '20px 24px 32px' : '24px 40px',
          maxWidth: '100%',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Main 2-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet
              ? 'minmax(0, 1fr)'
              : 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: isMobile ? 16 : 24,
            alignItems: 'flex-start'
          }}
        >
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 20 }}>
            {/* Page Header */}
            <div>
              <h1
                style={{
                  fontSize: isMobile ? 'clamp(20px, 5vw, 24px)' : '24px',
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: 4
                }}
              >
                {header.title}
              </h1>
              {!isMobile && (
                <p
                  style={{
                    fontSize: 'clamp(11px, 1.5vw, 13px)',
                    color: '#64748B'
                  }}
                >
                  {header.subtitle}
                </p>
              )}
            </div>

            {/* Summary Cards Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? 'repeat(1, minmax(0, 1fr))'
                  : isTablet
                    ? 'repeat(2, minmax(0, 1fr))'
                    : 'repeat(4, minmax(0, 1fr))',
                gap: isMobile ? 12 : 16
              }}
            >
              {summaryCards.map((card: SummaryCard, idx: number) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    padding: 16
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#64748B',
                      marginBottom: 8,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {card.label}
                  </div>
                  {card.amount ? (
                    <>
                      <div
                        style={{
                          fontSize: isMobile ? 'clamp(18px, 4.5vw, 20px)' : '20px',
                          fontWeight: 700,
                          color: '#0F172A',
                          marginBottom: 4
                        }}
                      >
                        {card.amount}
                      </div>
                      {card.count && (
                        <div
                          style={{
                            fontSize: 'clamp(10px, 2.5vw, 11px)',
                            color: '#64748B'
                          }}
                        >
                          {card.count}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          fontSize: isMobile ? 'clamp(18px, 4.5vw, 20px)' : '20px',
                          fontWeight: 700,
                          color: '#0F172A',
                          marginBottom: 4
                        }}
                      >
                        {card.count}
                      </div>
                      {card.subtext && (
                        <div
                          style={{
                            fontSize: 'clamp(10px, 2.5vw, 11px)',
                            color: '#DC2626',
                            fontWeight: 500
                          }}
                        >
                          {card.subtext}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: isMobile ? 'stretch' : 'flex-end',
                gap: isMobile ? 8 : 12,
                flexDirection: isMobile ? 'column' : 'row'
              }}
            >
              {actionButtons?.reports && (
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: isMobile ? '10px 14px' : '8px 14px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: isMobile ? 'clamp(12px, 3vw, 13px)' : '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center'
                  }}
                >
                  {actionButtons.reports?.icon && iconMap[actionButtons.reports.icon] && React.createElement(iconMap[actionButtons.reports.icon], { style: { width: 16, height: 16, flexShrink: 0 } })}
                  {actionButtons.reports?.label}
                </button>
              )}
              {actionButtons?.processPayments && (
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: isMobile ? '10px 16px' : '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#1E3A5F',
                    color: '#FFFFFF',
                    fontSize: isMobile ? 'clamp(12px, 3vw, 13px)' : '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.15)',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center'
                  }}
                >
                  {actionButtons.processPayments?.icon && iconMap[actionButtons.processPayments.icon] && React.createElement(iconMap[actionButtons.processPayments.icon], { style: { width: 16, height: 16, flexShrink: 0 } })}
                  {actionButtons.processPayments?.label}
                </button>
              )}
            </div>

            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                gap: isMobile ? 4 : 8,
                borderBottom: '1px solid #E2E8F0',
                overflowX: isMobile ? 'auto' : 'visible',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin'
              }}
            >
              {tabs.map((tab: Tab) => {
                const isActive = tab.key === activeTab;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      padding: isMobile ? '8px 12px' : '10px 16px',
                      fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#1E3A5F' : '#64748B',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: isActive ? '2px solid #1E3A5F' : '2px solid transparent',
                      cursor: 'pointer',
                      marginBottom: -1,
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      flexShrink: 0
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search and Filters */}
            <div
              style={{
                display: 'flex',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? 8 : 12,
                flexWrap: isMobile ? 'wrap' : 'nowrap'
              }}
            >
              <div
                style={{
                  flexGrow: 1,
                  flexShrink: 1,
                  flexBasis: 0,
                  position: 'relative',
                  minWidth: isMobile ? '100%' : 0
                }}
              >
                <Search
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 16,
                    height: 16,
                    color: '#64748B',
                    flexShrink: 0
                  }}
                />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '8px 10px 8px 32px' : '8px 12px 8px 36px',
                    fontSize: isMobile ? 'clamp(12px, 3vw, 13px)' : '13px',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    minWidth: 0
                  }}
                />
              </div>
              {filters.map((filter: Filter, idx: number) => (
                <select
                  key={idx}
                  value={filterValues[filterKeys[idx] as keyof typeof filterValues]}
                  onChange={(e) => handleFilterChange(idx, e.target.value)}
                  style={{
                    padding: isMobile ? '8px 10px' : '8px 12px',
                    fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    cursor: 'pointer',
                    width: isMobile ? 'calc(50% - 4px)' : 'auto',
                    minWidth: isMobile ? 0 : 120
                  }}
                >
                  {filter.options.map((option: string) => (
                    <option key={option} value={option === 'All' ? 'All' : option}>
                      {option === 'All' ? filter.label : option}
                    </option>
                  ))}
                </select>
              ))}
            </div>

            {/* Payments Table */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                overflow: isMobileOrTablet ? 'auto' : 'hidden',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px',
                  minWidth: isMobileOrTablet ? 800 : 'auto'
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderBottom: '1px solid #E2E8F0'
                    }}
                  >
                    {tableHeaders.map((header: string, idx: number) => (
                      <th
                        key={header + idx}
                        style={{
                          padding: isMobile ? '10px 12px' : '12px 16px',
                          textAlign: idx === 0 ? 'center' : 'left',
                          fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px',
                          fontWeight: 600,
                          color: '#64748B',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {header === '' ? (
                          <input
                            type="checkbox"
                            checked={filteredPayments.length > 0 && selectedPayments.size === filteredPayments.length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                          />
                        ) : header}
                        {idx > 0 && idx < tableHeaders.length - 1 && !isMobile && (
                          <ArrowUpDown
                            style={{
                              width: 12,
                              height: 12,
                              marginLeft: 4,
                              color: '#CBD5E1',
                              verticalAlign: 'middle'
                            }}
                          />
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment: Payment) => (
                    <tr
                      key={payment.id}
                      style={{
                        backgroundColor: payment.selected ? '#F8FAFC' : '#FFFFFF',
                        borderBottom: '1px solid #E2E8F0',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedPayments.has(payment.id)}
                          onChange={() => handleCheckboxChange(payment.id)}
                        />
                      </td>
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px' }}>
                        <div
                          style={{
                            fontSize: isMobile ? 'clamp(11px, 2.8vw, 13px)' : '13px',
                            fontWeight: 600,
                            color: '#0F172A'
                          }}
                        >
                          {payment.id}
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px', fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#475569' }}>
                        {payment.type}
                      </td>
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px' }}>
                        {payment.direction === 'Incoming' ? (
                          <ArrowDownRight style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, color: payment.directionColor, flexShrink: 0 }} />
                        ) : (
                          <ArrowUpRight style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, color: payment.directionColor, flexShrink: 0 }} />
                        )}
                      </td>
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px' }}>
                        <div>
                          <div
                            style={{
                              fontSize: isMobile ? 'clamp(11px, 2.8vw, 13px)' : '13px',
                              fontWeight: 500,
                              color: '#0F172A'
                            }}
                          >
                            {payment.recipient}
                          </div>
                          <div
                            style={{
                              fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                              color: '#64748B'
                            }}
                          >
                            {payment.recipientType}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px', fontSize: isMobile ? 'clamp(11px, 2.8vw, 13px)' : '13px', fontWeight: 500, color: '#0F172A' }}>
                        {payment.amount}
                      </td>
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px', fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#475569' }}>
                        {payment.method}
                      </td>
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px' }}>
                        <span
                          style={{
                            fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                            fontWeight: 600,
                            padding: isMobile ? '3px 6px' : '4px 8px',
                            borderRadius: 999,
                            backgroundColor: payment.statusBg,
                            color: payment.statusColor,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px', fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>
                        {payment.date}
                      </td>
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px', fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>
                        {payment.relatedTo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              padding: isMobile ? 16 : 20,
              position: isMobileOrTablet ? 'relative' : 'sticky',
              top: isMobileOrTablet ? 0 : 24,
              marginTop: isMobileOrTablet ? (isMobile ? 16 : 20) : 0
            }}
          >
            {/* Payment Header */}
            <div style={{ marginBottom: isMobile ? 16 : 20 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                  flexWrap: 'wrap'
                }}
              >
                <span
                  style={{
                    fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                    fontWeight: 600,
                    padding: isMobile ? '3px 6px' : '4px 8px',
                    borderRadius: 4,
                    backgroundColor: selectedPayment.statusBg,
                    color: selectedPayment.statusColor
                  }}
                >
                  {selectedPayment.status}
                </span>
                <span
                  style={{
                    fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                    color: '#64748B'
                  }}
                >
                  {selectedPayment.type} • {selectedPayment.direction}
                </span>
              </div>
              <h3
                style={{
                  fontSize: isMobile ? 'clamp(16px, 4vw, 18px)' : '18px',
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: 4,
                  wordBreak: 'break-word'
                }}
              >
                {selectedPayment.id}
              </h3>
            </div>

            {/* Payment Amount */}
            <div
              style={{
                fontSize: isMobile ? 'clamp(24px, 6vw, 32px)' : '32px',
                fontWeight: 700,
                color: '#0F172A',
                marginBottom: isMobile ? 16 : 20
              }}
            >
              {selectedPayment.amount}
            </div>

            {/* Payment Details */}
            <div style={{ marginBottom: isMobile ? 16 : 20 }}>
              <h4
                style={{
                  fontSize: isMobile ? 'clamp(11px, 2.8vw, 13px)' : '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: isMobile ? 10 : 12
                }}
              >
                Payment Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 10 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 4
                  }}
                >
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Recipient</span>
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A', textAlign: 'right', wordBreak: 'break-word' }}>
                    {selectedPayment.details.recipient}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 4
                  }}
                >
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Method</span>
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A' }}>
                    {selectedPayment.details.method}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 4
                  }}
                >
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Account</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A', wordBreak: 'break-word' }}>
                      {selectedPayment.details.account}
                    </span>
                    {selectedPayment.details.accountVerified && (
                      <Check style={{ width: isMobile ? 12 : 14, height: isMobile ? 12 : 14, color: '#10B981', flexShrink: 0 }} />
                    )}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 4
                  }}
                >
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Initiated</span>
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A', textAlign: 'right' }}>
                    {selectedPayment.details.initiated}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 4
                  }}
                >
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Initiated By</span>
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A', textAlign: 'right', wordBreak: 'break-word' }}>
                    {selectedPayment.details.initiatedBy}
                  </span>
                </div>
              </div>
            </div>

            {/* Context */}
            <div style={{ marginBottom: isMobile ? 16 : 20 }}>
              <h4
                style={{
                  fontSize: isMobile ? 'clamp(11px, 2.8vw, 13px)' : '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: isMobile ? 8 : 8
                }}
              >
                Context
              </h4>
              <div
                style={{
                  fontSize: isMobile ? 'clamp(11px, 2.8vw, 13px)' : '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: 4,
                  wordBreak: 'break-word'
                }}
              >
                {selectedPayment.context.fundName}
              </div>
              <div
                style={{
                  fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                  color: '#64748B',
                  marginBottom: 8
                }}
              >
                ID: {selectedPayment.context.fundId}
              </div>
              <div
                style={{
                  fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px',
                  color: '#64748B',
                  lineHeight: 1.5,
                  wordBreak: 'break-word'
                }}
              >
                {selectedPayment.context.description}
              </div>
            </div>

            {/* Processing Timeline */}
            <div style={{ marginBottom: isMobile ? 16 : 20 }}>
              <h4
                style={{
                  fontSize: isMobile ? 'clamp(11px, 2.8vw, 13px)' : '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: isMobile ? 10 : 12
                }}
              >
                Processing Timeline
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12 }}>
                {selectedPayment.timeline.map((step: TimelineStep, idx: number) => (
                  <div key={idx} style={{ display: 'flex', gap: isMobile ? 10 : 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {step.status === 'completed' ? (
                        <CheckCircle2 style={{ width: isMobile ? 18 : 20, height: isMobile ? 18 : 20, color: step.color, flexShrink: 0 }} />
                      ) : step.status === 'current' ? (
                        <div
                          style={{
                            width: isMobile ? 18 : 20,
                            height: isMobile ? 18 : 20,
                            borderRadius: '50%',
                            border: `2px solid ${step.color}`,
                            backgroundColor: '#FFFFFF',
                            flexShrink: 0
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: isMobile ? 18 : 20,
                            height: isMobile ? 18 : 20,
                            borderRadius: '50%',
                            backgroundColor: '#E2E8F0',
                            flexShrink: 0
                          }}
                        />
                      )}
                      {idx < selectedPayment.timeline.length - 1 && (
                        <div
                          style={{
                            width: 2,
                            height: isMobile ? 18 : 20,
                            backgroundColor: step.status === 'completed' ? step.color : '#E2E8F0',
                            marginTop: 4
                          }}
                        />
                      )}
                    </div>
                    <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px',
                          fontWeight: 600,
                          color: step.status === 'pending' ? '#64748B' : '#0F172A',
                          marginBottom: 4,
                          wordBreak: 'break-word'
                        }}
                      >
                        {step.step}
                      </div>
                      {step.date && (
                        <div
                          style={{
                            fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                            color: '#64748B'
                          }}
                        >
                          {step.date}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? 8 : 8,
                paddingTop: isMobile ? 16 : 20,
                borderTop: '1px solid #E2E8F0'
              }}
            >
              <button
                style={{
                  width: '100%',
                  padding: isMobile ? '10px 14px' : '10px 16px',
                  fontSize: isMobile ? 'clamp(12px, 3vw, 13px)' : '13px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  backgroundColor: selectedPayment.actionButtons.approve.color,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                {selectedPayment.actionButtons.approve.label}
              </button>
              <button
                style={{
                  width: '100%',
                  padding: isMobile ? '10px 14px' : '10px 16px',
                  fontSize: isMobile ? 'clamp(12px, 3vw, 13px)' : '13px',
                  fontWeight: 500,
                  color: selectedPayment.actionButtons.reject.color,
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${selectedPayment.actionButtons.reject.color}`,
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                {selectedPayment.actionButtons.reject.label}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

