import React, { CSSProperties, useState } from 'react';
import {
  Search,
  FileText,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpDown,
  CheckCircle2,
  Check
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  FileText,
  Plus
};

export default function Payments() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  // Extract data from JSON
  const paymentsData = adminData.payments;
  const header = paymentsData.header;
  const actionButtons = paymentsData.actionButtons;
  const summaryCards = paymentsData.summaryCards;
  const tabs = paymentsData.tabs;
  const searchPlaceholder = paymentsData.searchPlaceholder;
  const filters = paymentsData.filters;
  const tableHeaders = paymentsData.tableHeaders;
  const payments = paymentsData.payments;
  const selectedPayment = paymentsData.selectedPayment;

  // State for checkbox selections
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(
    new Set(payments.filter(p => p.selected).map(p => p.id))
  );

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
      setSelectedPayments(new Set(filteredPayments.map(p => p.id)));
    } else {
      setSelectedPayments(new Set());
    }
  };

  // State for filtering
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState({
    status: 'All',
    type: 'All',
    method: 'All',
    date: 'Last 7 Days'
  });

  // Filter keys corresponding to the `filters` array in JSON
  const filterKeys = ['status', 'type', 'method', 'date'];

  const handleFilterChange = (idx: number, value: string) => {
    setFilterValues(prev => ({ ...prev, [filterKeys[idx]]: value }));
  };

  // Filtering Logic
  const filteredPayments = payments.filter(payment => {
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
              {summaryCards.map((card, idx) => (
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
                {React.createElement(iconMap[actionButtons.reports.icon], { style: { width: 16, height: 16, flexShrink: 0 } })}
                {actionButtons.reports.label}
              </button>
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
                {React.createElement(iconMap[actionButtons.processPayments.icon], { style: { width: 16, height: 16, flexShrink: 0 } })}
                {actionButtons.processPayments.label}
              </button>
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
              {tabs.map((tab) => {
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
              {filters.map((filter, idx) => (
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
                  {filter.options.map((option) => (
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
                    {tableHeaders.map((header, idx) => (
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
                  {filteredPayments.map((payment) => (
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
                {selectedPayment.timeline.map((step, idx) => (
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

