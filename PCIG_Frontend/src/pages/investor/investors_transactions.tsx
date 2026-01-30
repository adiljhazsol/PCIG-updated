import { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  TrendingUp,
  Clock,
  Plus,
  Minus,
  CheckCircle,
  CreditCard,
  Wrench,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InvestorNav from '../../components/investor/InvestorNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

// Interfaces
interface Transaction {
  id: number;
  user_id: number;
  type: string;
  amount: string; // Backend returns string for decimals usually, or number
  status: string;
  description: string;
  created_at: string;
  reference_id?: string;
  property_id?: number;
  fund_id?: number;
  // Additional fields from resource
  date?: string; 
  method?: string;
  property_address?: string;
  fund_name?: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface SummaryData {
  total_deposits: number;
  total_withdrawals: number;
  total_distributions: number;
  pending_count: number;
}

// Icon mapping for transaction types
const typeIconMap: { [key: string]: any } = {
  TrendingUp,
  Plus,
  Minus,
  CheckCircle,
  CreditCard,
  Wrench
};

// Icon mapping for summary cards
const summaryIconMap: { [key: string]: any } = {
  ArrowDown,
  ArrowUp,
  TrendingUp,
  Clock
};

const staticContent = {
  header: {
    title: "Transactions",
    subtitle: "View and manage your transaction history."
  },
  filters: ['All', 'Deposits', 'Withdrawals', 'Distributions', 'Pending'],
  sortOptions: ['Newest', 'Oldest', 'Amount (High to Low)', 'Amount (Low to High)'],
  summaryCards: [
    {
      id: 'total-deposits',
      label: 'Total Deposits',
      icon: 'ArrowDown',
      iconColor: '#10B981',
      iconBgColor: '#DCFCE7',
      subtext: 'Lifetime deposits'
    },
    {
      id: 'total-withdrawals',
      label: 'Total Withdrawals',
      icon: 'ArrowUp',
      iconColor: '#64748B',
      iconBgColor: '#F1F5F9',
      subtext: 'Lifetime withdrawals'
    },
    {
      id: 'total-distributions',
      label: 'Total Distributions',
      icon: 'TrendingUp',
      iconColor: '#3B82F6',
      iconBgColor: '#DBEAFE',
      subtext: 'Lifetime earnings'
    },
    {
      id: 'pending',
      label: 'Pending',
      icon: 'Clock',
      iconColor: '#F59E0B',
      iconBgColor: '#FEF3C7',
      subtext: 'Processing transactions'
    }
  ],
  searchPlaceholder: "Search transactions..."
};

export default function InvestorsTransactions() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('Newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Advanced Filters State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // const [minAmount, setMinAmount] = useState(''); // Backend might not support range on amount yet, but we can send it if needed. Controller doesn't show it.
  // Controller shows date range. Let's stick to what controller supports for now or add client side filtering if needed.
  // Controller supports: type, status, date_from, date_to, sort_by, sort_order, per_page.
  // It does NOT support min/max amount. I will omit amount filter for now or filter client side if the result set is small, but server side is better.
  // Let's keep the UI but maybe disable it or implement it in backend later. For now, let's remove amount filters from UI to match backend capabilities, or keep them and implement later.
  // To be safe and functional, I will comment out amount filters in UI for now.

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        per_page: 10, // Default to 10 for pagination
      };

      // Filter Mapping
      if (activeFilter !== 'All') {
        if (activeFilter === 'Deposits') params.type = 'deposit';
        else if (activeFilter === 'Withdrawals') params.type = 'withdrawal';
        else if (activeFilter === 'Distributions') params.type = 'distribution';
        else if (activeFilter === 'Pending') params.status = 'pending';
      }

      // Date Filters
      if (startDate) params.date_from = startDate;
      if (endDate) params.date_to = endDate;

      // Sort Mapping
      if (sortBy === 'Newest') {
        params.sort_by = 'created_at';
        params.sort_order = 'desc';
      } else if (sortBy === 'Oldest') {
        params.sort_by = 'created_at';
        params.sort_order = 'asc';
      } else if (sortBy === 'Amount (High to Low)') {
        params.sort_by = 'amount';
        params.sort_order = 'desc';
      } else if (sortBy === 'Amount (Low to High)') {
        params.sort_by = 'amount';
        params.sort_order = 'asc';
      }

      // API Calls
      const [listResponse, summaryResponse] = await Promise.all([
        api.get('/investor/transactions', { params }),
        api.get('/investor/transactions/summary')
      ]);

      if (listResponse.data.success) {
        setTransactions(listResponse.data.data);
        setPagination(listResponse.data.meta);
      }
      
      if (summaryResponse.data.success) {
        setSummaryData(summaryResponse.data.data);
      }

    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, activeFilter, sortBy, startDate, endDate]);

  // Format currency
  const formatCurrency = (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.last_page) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      <div style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        padding: 0,
        overflowX: 'hidden'
      }}>
        <InvestorNav />

        <div style={{
          padding: `clamp(16px, 2vh, 24px) clamp(16px, 2.5vw, 48px)`,
          width: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          maxWidth: '100vw'
        }}>
          {/* Header Section */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'flex-start',
            gap: isMobile ? '16px' : '0',
            marginBottom: `clamp(16px, 2vh, 24px)`
          }}>
            <div>
              <h1 style={{
                fontSize: `clamp(22px, 2.8vw, 28px)`,
                fontWeight: 700,
                color: '#0F172A',
                marginTop: 0,
                marginLeft: 0,
                marginRight: 0,
                marginBottom: `clamp(4px, 0.6vh, 6px)`
              }}>
                {staticContent.header.title}
              </h1>
              <p style={{
                fontSize: `clamp(13px, 1.4vw, 15px)`,
                color: '#64748B',
                margin: 0
              }}>
                {staticContent.header.subtitle}
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: `clamp(8px, 1.2vw, 12px)`,
              flexDirection: isMobile ? 'column' : 'row',
              width: isMobile ? '100%' : 'auto'
            }}>
              <button
                onClick={() => { /* Implement Request Withdrawal Modal/Page */ }}
                style={{
                  padding: `clamp(10px, 1.2vh, 12px) clamp(16px, 2vw, 20px)`,
                  fontSize: `clamp(13px, 1.4vw, 14px)`,
                  fontWeight: 500,
                  color: '#0F172A',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: isMobile ? '100%' : 'auto',
                  whiteSpace: 'nowrap'
                }}>
                Request Withdrawal
              </button>
              <button
                onClick={() => navigate('/investor/deposit')}
                style={{
                  padding: `clamp(10px, 1.2vh, 12px) clamp(16px, 2vw, 20px)`,
                  fontSize: `clamp(13px, 1.4vw, 14px)`,
                  fontWeight: 500,
                  color: '#FFFFFF',
                  backgroundColor: '#1E3A5F',
                  border: 'none',
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: isMobile ? '100%' : 'auto',
                  whiteSpace: 'nowrap'
                }}>
                Make a Deposit
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: `clamp(12px, 1.5vw, 16px)`,
            marginBottom: `clamp(16px, 2vh, 24px)`
          }}>
            {staticContent.summaryCards.map((card) => {
              const IconComponent = summaryIconMap[card.icon] || Clock;

              // Get dynamic values based on card ID
              let displayValue = '0.00';
              let displaySubtext = card.subtext;

              if (summaryData) {
                if (card.id === 'total-deposits') {
                  displayValue = formatCurrency(summaryData.total_deposits);
                } else if (card.id === 'total-withdrawals') {
                  displayValue = formatCurrency(summaryData.total_withdrawals);
                } else if (card.id === 'total-distributions') {
                  displayValue = formatCurrency(summaryData.total_distributions);
                  // Calculate return percentage for distributions
                  if (summaryData.total_deposits > 0) {
                    const returnPct = ((summaryData.total_distributions / summaryData.total_deposits) * 100).toFixed(1);
                    displaySubtext = `+${returnPct}% Return`;
                  }
                } else if (card.id === 'pending') {
                  displayValue = summaryData.pending_count.toString();
                }
              }

              return (
                <div
                  key={card.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: `clamp(16px, 2vw, 20px)`,
                    borderRadius: `clamp(8px, 1vw, 12px)`,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: `clamp(10px, 1.2vh, 12px)` }}>
                    <div style={{ fontSize: `clamp(12px, 1.3vw, 14px)`, fontWeight: 500, color: '#64748B' }}>{card.label}</div>
                    <div style={{
                      width: `clamp(36px, 4vw, 40px)`,
                      height: `clamp(36px, 4vw, 40px)`,
                      borderRadius: `clamp(6px, 0.8vw, 8px)`,
                      backgroundColor: card.iconBgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <IconComponent style={{ width: `clamp(18px, 2vw, 20px)`, height: `clamp(18px, 2vw, 20px)`, color: card.iconColor }} />
                    </div>
                  </div>
                  <div style={{ fontSize: `clamp(20px, 2.5vw, 24px)`, fontWeight: 700, color: '#0F172A', marginBottom: `clamp(4px, 0.5vh, 6px)` }}>
                    {displayValue}
                  </div>
                  <div style={{ fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B' }}>{displaySubtext}</div>
                </div>
              );
            })}
          </div>

          {/* Search and Filter Bar */}
          <div style={{ marginBottom: `clamp(16px, 2vh, 20px)` }}>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: `clamp(12px, 1.5vw, 16px)`,
              marginBottom: `clamp(12px, 1.5vh, 16px)`
            }}>
              {/* Search Input - Currently client side only if needed, or implement backend search */}
              <div style={{
                position: 'relative',
                flex: isMobile ? '0 1 auto' : 1,
                width: isMobile ? '100%' : 'auto',
                maxWidth: isMobile ? '100%' : '600px'
              }}>
                <Search style={{
                  position: 'absolute',
                  left: `clamp(12px, 1.5vw, 16px)`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: `clamp(16px, 1.8vw, 20px)`,
                  height: `clamp(16px, 1.8vw, 20px)`,
                  color: '#64748B',
                  pointerEvents: 'none'
                }} />
                <input
                  type="text"
                  placeholder={staticContent.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    height: `clamp(40px, 5vh, 44px)`,
                    paddingLeft: `clamp(40px, 5vw, 48px)`,
                    paddingRight: `clamp(12px, 1.5vw, 16px)`,
                    border: '1px solid #E2E8F0',
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    fontSize: `clamp(13px, 1.4vw, 15px)`,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Filter Buttons */}
              <div
                className="filter-buttons-scroll"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: `clamp(8px, 1.2vw, 12px)`,
                  flexWrap: isMobile ? 'nowrap' : 'wrap',
                  width: isMobile ? '100%' : 'auto',
                  overflowX: isMobile ? 'auto' : 'visible',
                  WebkitOverflowScrolling: 'touch',
                  paddingBottom: isMobile ? '4px' : '0'
                }}
              >
                {staticContent.filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setActiveFilter(filter);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: `clamp(8px, 1vh, 10px) clamp(16px, 2vw, 20px)`,
                      fontSize: `clamp(12px, 1.3vw, 14px)`,
                      fontWeight: activeFilter === filter ? 600 : 500,
                      color: activeFilter === filter ? '#FFFFFF' : '#64748B',
                      backgroundColor: activeFilter === filter ? '#1E3A5F' : '#F1F5F9',
                      border: 'none',
                      borderRadius: `clamp(20px, 2.5vw, 24px)`,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Filters */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: `clamp(6px, 0.8vw, 8px)`,
                  padding: `clamp(10px, 1.2vh, 12px) clamp(14px, 1.8vw, 16px)`,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  fontSize: `clamp(13px, 1.4vw, 14px)`,
                  fontWeight: 500,
                  color: '#0F172A',
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center'
                }}
              >
                Advanced Filters
                <ChevronDown style={{ width: `clamp(16px, 1.8vw, 18px)`, height: `clamp(16px, 1.8vw, 18px)` }} />
              </button>
            </div>

            {/* Advanced Filters Dropdown */}
            {advancedFiltersOpen && (
              <div style={{
                marginTop: '16px',
                padding: '20px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', // Simplified to 2 columns for dates only
                gap: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748B', marginBottom: '6px' }}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      fontSize: '14px',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748B', marginBottom: '6px' }}>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      fontSize: '14px',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: `clamp(16px, 2vh, 20px)`
          }}>
            <div style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  appearance: 'none',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  padding: `clamp(10px, 1.2vh, 12px) clamp(32px, 3vw, 36px) clamp(10px, 1.2vh, 12px) clamp(16px, 2vw, 20px)`,
                  fontSize: `clamp(13px, 1.4vw, 14px)`,
                  color: '#0F172A',
                  cursor: 'pointer',
                  outline: 'none',
                  width: isMobile ? '100%' : 'auto',
                  minWidth: '200px'
                }}
              >
                {staticContent.sortOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown style={{
                position: 'absolute',
                right: `clamp(12px, 1.5vw, 16px)`,
                top: '50%',
                transform: 'translateY(-50%)',
                width: `clamp(16px, 1.8vw, 18px)`,
                height: `clamp(16px, 1.8vw, 18px)`,
                color: '#64748B',
                pointerEvents: 'none'
              }} />
            </div>
          </div>

          {/* Transactions List */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: `clamp(8px, 1vw, 12px)`,
            border: '1px solid #E2E8F0',
            overflow: 'hidden'
          }}>
            {loading ? (
              <div style={{ padding: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#1E3A5F' }} />
              </div>
            ) : error ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#EF4444' }}>
                <AlertCircle style={{ width: '48px', height: '48px', margin: '0 auto 16px' }} />
                <p>{error}</p>
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                <p>No transactions found.</p>
              </div>
            ) : (
              <div>
                {/* Desktop/Tablet Table Header */}
                {!isMobile && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1fr 1fr',
                    padding: '16px 24px',
                    borderBottom: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    <div>Description</div>
                    <div>Property/Fund</div>
                    <div>Date</div>
                    <div>Amount</div>
                    <div>Method</div>
                    <div style={{ textAlign: 'right' }}>Status</div>
                  </div>
                )}

                {/* Transaction Items */}
                {transactions.map((transaction) => {
                  // Determine icon based on transaction type
                  let IconComponent = typeIconMap['CheckCircle']; // Default
                  let iconColor = '#64748B';
                  let iconBgColor = '#F1F5F9';

                  if (transaction.type === 'deposit') {
                    IconComponent = typeIconMap['Plus'];
                    iconColor = '#10B981';
                    iconBgColor = '#DCFCE7';
                  } else if (transaction.type === 'withdrawal') {
                    IconComponent = typeIconMap['Minus'];
                    iconColor = '#64748B';
                    iconBgColor = '#F1F5F9';
                  } else if (transaction.type === 'distribution') {
                    IconComponent = typeIconMap['TrendingUp'];
                    iconColor = '#3B82F6';
                    iconBgColor = '#DBEAFE';
                  }

                  const amount = parseFloat(transaction.amount);
                  const isPositive = transaction.type === 'deposit' || transaction.type === 'distribution';
                  const formattedAmount = formatCurrency(amount);

                  return (
                    <div
                      key={transaction.id}
                      style={{
                        padding: isMobile ? '16px' : '20px 24px',
                        borderBottom: '1px solid #E2E8F0',
                        display: isMobile ? 'flex' : 'grid',
                        gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1fr 1fr',
                        alignItems: 'center',
                        gap: isMobile ? '16px' : '0',
                        flexDirection: isMobile ? 'column' : 'row',
                        transition: 'background-color 0.15s ease'
                      }}
                      className="transaction-row"
                    >
                      {isMobile ? (
                        // Mobile View
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: iconBgColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <IconComponent style={{ width: '20px', height: '20px', color: iconColor }} />
                              </div>
                              <div>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>{transaction.description}</div>
                                <div style={{ fontSize: '13px', color: '#64748B' }}>{formatDate(transaction.created_at)}</div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{
                                fontSize: '15px',
                                fontWeight: 600,
                                color: isPositive ? '#10B981' : '#0F172A'
                              }}>
                                {isPositive ? '+' : ''}{formattedAmount}
                              </div>
                              <div style={{
                                fontSize: '12px',
                                fontWeight: 500,
                                color: transaction.status === 'completed' ? '#10B981' : transaction.status === 'pending' ? '#F59E0B' : '#EF4444',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '4px',
                                padding: '2px 8px',
                                backgroundColor: transaction.status === 'completed' ? '#DCFCE7' : transaction.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                                borderRadius: '12px'
                              }}>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </div>
                            </div>
                          </div>
                          {(transaction.property_address || transaction.fund_name) && (
                            <div style={{ fontSize: '13px', color: '#64748B', marginLeft: '52px' }}>
                              {transaction.property_address || transaction.fund_name}
                            </div>
                          )}
                        </div>
                      ) : (
                        // Desktop/Tablet View
                        <>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: iconBgColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <IconComponent style={{ width: '20px', height: '20px', color: iconColor }} />
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                              {transaction.description}
                            </div>
                          </div>
                          <div style={{ fontSize: '14px', color: '#64748B' }}>
                             {transaction.property_address || transaction.fund_name || '-'}
                          </div>
                          <div style={{ fontSize: '14px', color: '#64748B' }}>
                            {formatDate(transaction.created_at)}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: isPositive ? '#10B981' : '#0F172A'
                          }}>
                            {isPositive ? '+' : ''}{formattedAmount}
                          </div>
                          <div style={{ fontSize: '14px', color: '#64748B' }}>
                            {transaction.method || '-'}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: 500,
                              color: transaction.status === 'completed' ? '#10B981' : transaction.status === 'pending' ? '#F59E0B' : '#EF4444',
                              padding: '4px 12px',
                              backgroundColor: transaction.status === 'completed' ? '#DCFCE7' : transaction.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                              borderRadius: '16px'
                            }}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: `clamp(16px, 2vh, 24px)`
            }}>
              <div style={{ fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#64748B' }}>
                Showing {pagination.per_page * (pagination.current_page - 1) + 1} to {Math.min(pagination.per_page * pagination.current_page, pagination.total)} of {pagination.total} transactions
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  style={{
                    padding: `clamp(8px, 1vh, 8px) clamp(12px, 1.5vw, 12px)`,
                    fontSize: `clamp(13px, 1.4vw, 14px)`,
                    fontWeight: 500,
                    color: pagination.current_page === 1 ? '#94A3B8' : '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: `clamp(6px, 0.8vw, 6px)`,
                    cursor: pagination.current_page === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ChevronLeft style={{ width: '16px', height: '16px' }} />
                  {!isMobile && 'Previous'}
                </button>
                {/* Page Numbers */}
                {!isMobile && Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                  let pageNum;
                  if (pagination.last_page <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.current_page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.current_page >= pagination.last_page - 2) {
                    pageNum = pagination.last_page - 4 + i;
                  } else {
                    pageNum = pagination.current_page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      style={{
                        padding: '8px 12px',
                        fontSize: '14px',
                        fontWeight: pagination.current_page === pageNum ? 600 : 500,
                        color: pagination.current_page === pageNum ? '#FFFFFF' : '#0F172A',
                        backgroundColor: pagination.current_page === pageNum ? '#1E3A5F' : '#FFFFFF',
                        border: pagination.current_page === pageNum ? 'none' : '1px solid #E2E8F0',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  style={{
                    padding: `clamp(8px, 1vh, 8px) clamp(12px, 1.5vw, 12px)`,
                    fontSize: `clamp(13px, 1.4vw, 14px)`,
                    fontWeight: 500,
                    color: pagination.current_page === pagination.last_page ? '#94A3B8' : '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: `clamp(6px, 0.8vw, 6px)`,
                    cursor: pagination.current_page === pagination.last_page ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {!isMobile && 'Next'}
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
