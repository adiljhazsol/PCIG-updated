import { useState } from 'react';
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
} from 'lucide-react';
import InvestorNav from '../../components/investor/InvestorNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import investorsData from '../../data/investors.json';

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

export default function InvestorsTransactions() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();


  const [activeFilter, setActiveFilter] = useState<string>(investorsData.transactions.defaultFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>(investorsData.transactions.defaultSort);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);



  // Helper function to parse amount string to number
  const parseAmount = (amountStr: string): number => {
    // Remove $, +, - and commas, then parse
    return parseFloat(amountStr.replace(/[^0-9.-]/g, '')) || 0;
  };

  // Calculate summary statistics from all transactions
  const allTransactions = investorsData.transactions.transactions;

  const totalDeposits = allTransactions
    .filter(t => t.type === 'Deposit')
    .reduce((sum, t) => sum + Math.abs(parseAmount(t.amount)), 0);

  const totalWithdrawals = allTransactions
    .filter(t => t.type === 'Withdrawal')
    .reduce((sum, t) => sum + Math.abs(parseAmount(t.amount)), 0);

  const totalDistributions = allTransactions
    .filter(t => t.type === 'Distribution')
    .reduce((sum, t) => sum + Math.abs(parseAmount(t.amount)), 0);

  const pendingCount = allTransactions.filter(t => t.status === 'Pending').length;

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter and search transactions
  let filteredTransactions = investorsData.transactions.transactions.filter(transaction => {
    // Apply filter
    if (activeFilter !== 'All') {
      if (activeFilter === 'Deposits' && transaction.type !== 'Deposit') return false;
      if (activeFilter === 'Withdrawals' && transaction.type !== 'Withdrawal') return false;
      if (activeFilter === 'Distributions' && transaction.type !== 'Distribution') return false;
      if (activeFilter === 'Pending' && transaction.status !== 'Pending') return false;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        transaction.id.toLowerCase().includes(query) ||
        transaction.description.toLowerCase().includes(query) ||
        transaction.propertyFund.toLowerCase().includes(query) ||
        transaction.method.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Helper function to parse dates in format "Jan 15, 2024, 09:30 AM"
  const parseDate = (dateStr: string): number => {
    // Replace the comma after year with empty string: "Jan 15, 2024, 09:30 AM" -> "Jan 15, 2024 09:30 AM"
    const cleaned = dateStr.replace(/,(\d{4}),/, ' $1');
    const parsed = new Date(cleaned);
    return parsed.getTime() || 0;
  };

  // Apply sort
  filteredTransactions.sort((a, b) => {
    switch (sortBy) {
      case 'Oldest':
        return parseDate(a.date) - parseDate(b.date);
      case 'Amount (High to Low)':
        const amountA = parseFloat(a.amount.replace(/[^0-9.-]/g, ''));
        const amountB = parseFloat(b.amount.replace(/[^0-9.-]/g, ''));
        return amountB - amountA;
      case 'Amount (Low to High)':
        const amountA2 = parseFloat(a.amount.replace(/[^0-9.-]/g, ''));
        const amountB2 = parseFloat(b.amount.replace(/[^0-9.-]/g, ''));
        return amountA2 - amountB2;
      case 'Newest':
      default:
        return parseDate(b.date) - parseDate(a.date);
    }
  });

  // Pagination
  const itemsPerPage = investorsData.transactions.itemsPerPage;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

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
        {/* Top Navigation Bar */}
        {/* Top Navigation Bar */}
        <InvestorNav />

        {/* Main Content */}
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
                {investorsData.transactions.header.title}
              </h1>
              <p style={{
                fontSize: `clamp(13px, 1.4vw, 15px)`,
                color: '#64748B',
                margin: 0
              }}>
                {investorsData.transactions.header.subtitle}
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
                onClick={() => { /* Implement Make a Deposit Modal/Page */ }}
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
            {investorsData.transactions.summaryCards.map((card) => {
              const IconComponent = summaryIconMap[card.icon] || Clock;

              // Get dynamic values based on card ID
              let displayValue = card.value;
              let displaySubtext = card.subtext;

              if (card.id === 'total-deposits') {
                displayValue = formatCurrency(totalDeposits);
              } else if (card.id === 'total-withdrawals') {
                displayValue = formatCurrency(totalWithdrawals);
              } else if (card.id === 'total-distributions') {
                displayValue = formatCurrency(totalDistributions);
                // Calculate return percentage for distributions
                if (totalDeposits > 0) {
                  const returnPct = ((totalDistributions / totalDeposits) * 100).toFixed(1);
                  displaySubtext = `+${returnPct}% Return`;
                }
              } else if (card.id === 'pending') {
                displayValue = pendingCount.toString();
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
              {/* Search Input */}
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
                  placeholder={investorsData.transactions.searchPlaceholder}
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
                {investorsData.transactions.filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
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
          </div>

          {/* Table Header */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '12px' : '0',
            marginBottom: `clamp(12px, 1.5vh, 16px)`
          }}>
            <div style={{
              fontSize: `clamp(12px, 1.3vw, 14px)`,
              color: '#64748B'
            }}>
              Showing {investorsData.transactions.count.showing} of {investorsData.transactions.count.total} transactions
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: `clamp(8px, 1.2vw, 12px)`,
              flexDirection: isMobile ? 'column' : 'row',
              width: isMobile ? '100%' : 'auto'
            }}>
              <button
                onClick={() => { /* Implement CSV/PDF Download */ }}
                style={{
                  padding: `clamp(10px, 1.2vh, 12px) clamp(14px, 1.8vw, 16px)`,
                  fontSize: `clamp(13px, 1.4vw, 14px)`,
                  fontWeight: 500,
                  color: '#0F172A',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto',
                  whiteSpace: 'nowrap'
                }}>
                Export
              </button>
              <div style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: isMobile ? '100%' : 'auto',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(32px, 4vw, 40px) clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(13px, 1.4vw, 14px)`,
                    border: '1px solid #E2E8F0',
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    fontWeight: 500,
                    boxSizing: 'border-box'
                  }}
                >
                  {investorsData.transactions.sortOptions.map((option) => (
                    <option key={option} value={option}>Sort by: {option}</option>
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
          </div>

          {/* Transactions Table - Desktop */}
          {!isMobile && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: `clamp(8px, 1vw, 12px)`,
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
              overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                    <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
                    <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                    <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</th>
                    <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Property/Fund</th>
                    <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'right', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
                    <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Method</th>
                    <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'center', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map((transaction, index) => {
                    const TypeIcon = typeIconMap[transaction.typeIcon] || Eye;
                    return (
                      <tr
                        key={transaction.id}
                        style={{
                          borderBottom: index < currentTransactions.length - 1 ? '1px solid #E2E8F0' : 'none'
                        }}
                      >
                        <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#0F172A' }}>{transaction.date}</td>
                        <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#0F172A', fontWeight: 500 }}>{transaction.id}</td>
                        <td style={{ padding: `clamp(12px, 1.5vw, 16px)` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(6px, 0.8vw, 8px)` }}>
                            <div style={{
                              width: `clamp(28px, 3vw, 32px)`,
                              height: `clamp(28px, 3vw, 32px)`,
                              borderRadius: `clamp(4px, 0.6vw, 6px)`,
                              backgroundColor: transaction.typeIconBgColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <TypeIcon style={{ width: `clamp(14px, 1.6vw, 16px)`, height: `clamp(14px, 1.6vw, 16px)`, color: transaction.typeIconColor }} />
                            </div>
                            <span style={{ fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#0F172A', fontWeight: 500 }}>{transaction.type}</span>
                          </div>
                        </td>
                        <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#64748B' }}>{transaction.description}</td>
                        <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#64748B' }}>{transaction.propertyFund}</td>
                        <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'right', fontSize: `clamp(13px, 1.4vw, 14px)`, fontWeight: 600, color: transaction.amountColor }}>
                          {transaction.amount}
                        </td>
                        <td style={{ padding: `clamp(12px, 1.5vw, 16px)` }}>
                          <span style={{
                            display: 'inline-block',
                            padding: `clamp(4px, 0.5vh, 6px) clamp(10px, 1.3vw, 12px)`,
                            fontSize: `clamp(11px, 1.2vw, 12px)`,
                            fontWeight: 500,
                            color: transaction.statusColor,
                            backgroundColor: transaction.statusBgColor,
                            borderRadius: `clamp(10px, 1.2vw, 12px)`
                          }}>
                            {transaction.status}
                          </span>
                        </td>
                        <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#64748B' }}>{transaction.method}</td>
                        <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'center' }}>
                          <button style={{
                            fontSize: `clamp(13px, 1.4vw, 14px)`,
                            fontWeight: 500,
                            color: transaction.actionColor,
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0'
                          }}>
                            {transaction.action}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Transactions Cards - Mobile */}
          {isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: `clamp(12px, 1.5vw, 16px)` }}>
              {currentTransactions.map((transaction) => {
                const TypeIcon = typeIconMap[transaction.typeIcon] || Eye;
                return (
                  <div
                    key={transaction.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      padding: `clamp(16px, 2vw, 20px)`,
                      borderRadius: `clamp(8px, 1vw, 12px)`,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: `clamp(12px, 1.5vh, 16px)`
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#0F172A', fontWeight: 500, marginBottom: '4px' }}>{transaction.id}</div>
                        <div style={{ fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B' }}>{transaction.date}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(6px, 0.8vw, 8px)` }}>
                        <div style={{
                          width: `clamp(32px, 4vw, 36px)`,
                          height: `clamp(32px, 4vw, 36px)`,
                          borderRadius: `clamp(4px, 0.6vw, 6px)`,
                          backgroundColor: transaction.typeIconBgColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <TypeIcon style={{ width: `clamp(16px, 2vw, 18px)`, height: `clamp(16px, 2vw, 18px)`, color: transaction.typeIconColor }} />
                        </div>
                        <span style={{ fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#0F172A', fontWeight: 500 }}>{transaction.type}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div style={{ fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#64748B' }}>{transaction.description}</div>

                    {/* Property/Fund */}
                    {transaction.propertyFund !== '-' && (
                      <div style={{ fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B' }}>
                        <span style={{ fontWeight: 500, color: '#0F172A' }}>Property/Fund: </span>
                        {transaction.propertyFund}
                      </div>
                    )}

                    {/* Amount and Status Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: `clamp(16px, 2vw, 18px)`, fontWeight: 600, color: transaction.amountColor }}>
                        {transaction.amount}
                      </div>
                      <span style={{
                        display: 'inline-block',
                        padding: `clamp(4px, 0.5vh, 6px) clamp(10px, 1.3vw, 12px)`,
                        fontSize: `clamp(11px, 1.2vw, 12px)`,
                        fontWeight: 500,
                        color: transaction.statusColor,
                        backgroundColor: transaction.statusBgColor,
                        borderRadius: `clamp(10px, 1.2vw, 12px)`
                      }}>
                        {transaction.status}
                      </span>
                    </div>

                    {/* Method and Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: `clamp(8px, 1vh, 12px)`, borderTop: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B' }}>
                        <span style={{ fontWeight: 500, color: '#0F172A' }}>Method: </span>
                        {transaction.method}
                      </div>
                      <button style={{
                        fontSize: `clamp(13px, 1.4vw, 14px)`,
                        fontWeight: 500,
                        color: transaction.actionColor,
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0'
                      }}>
                        {transaction.action}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `clamp(8px, 1vw, 12px)`,
              marginTop: `clamp(24px, 3vh, 32px)`
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: `clamp(8px, 1vh, 10px)`,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronLeft style={{ width: `clamp(16px, 2vw, 18px)`, height: `clamp(16px, 2vw, 18px)`, color: '#64748B' }} />
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, idx) => idx + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    padding: `clamp(8px, 1vh, 10px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(12px, 1.3vw, 14px)`,
                    fontWeight: currentPage === pageNum ? 600 : 500,
                    color: currentPage === pageNum ? '#FFFFFF' : '#64748B',
                    backgroundColor: currentPage === pageNum ? '#1E3A5F' : '#FFFFFF',
                    border: currentPage === pageNum ? 'none' : '1px solid #E2E8F0',
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: `clamp(32px, 4vw, 40px)`
                  }}
                >
                  {pageNum}
                </button>
              ))}
              {totalPages > 3 && (
                <span style={{ fontSize: `clamp(12px, 1.3vw, 14px)`, color: '#64748B', padding: '0 8px' }}>...</span>
              )}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: `clamp(8px, 1vh, 10px)`,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronRight style={{ width: `clamp(16px, 2vw, 18px)`, height: `clamp(16px, 2vw, 18px)`, color: '#64748B' }} />
              </button>
            </div>
          )}
        </div>


        <style>{`
          /* Hide scrollbar for Chrome, Safari and Opera */
          .filter-buttons-scroll::-webkit-scrollbar {
            display: none;
          }
          /* Hide scrollbar for IE, Edge and Firefox */
          .filter-buttons-scroll {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}</style>
      </div>
    </>
  );
}

