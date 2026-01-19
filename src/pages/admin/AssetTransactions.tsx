import React, { CSSProperties, useState } from 'react';
import {
  Search,
  FileText,
  Plus,
  ArrowUpDown,
  CheckCircle2,
  TrendingUp,
  Calendar,
  XCircle,
  Download,
  MoreHorizontal,
  X,
  Edit
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  FileText,
  Plus,
  Download,
  TrendingUp,
  Calendar,
  XCircle,
  CheckCircle2
};

export default function AssetTransactions() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  // Extract data from JSON
  const transactionsData = adminData.assetTransactions;
  const header = transactionsData.header;
  const actionButtons = transactionsData.actionButtons;
  const summaryCards = transactionsData.summaryCards;
  const tabs = transactionsData.tabs;
  const searchPlaceholder = transactionsData.searchPlaceholder;
  const filters = transactionsData.filters;
  const tableHeaders = transactionsData.tableHeaders;
  const transactions = transactionsData.transactions;
  const selectedTransaction = transactionsData.selectedTransaction;

  // State for checkbox selections
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(
    new Set(transactions.filter(t => t.selected).map(t => t.id))
  );

  // Handle checkbox change
  const handleCheckboxChange = (transactionId: string) => {
    setSelectedTransactions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(new Set(transactions.map(t => t.id)));
    } else {
      setSelectedTransactions(new Set());
    }
  };

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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#64748B',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {card.label}
                    </div>
                    {React.createElement(iconMap[card.icon], {
                      style: { width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, color: '#64748B', flexShrink: 0 }
                    })}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 'clamp(18px, 4.5vw, 20px)' : '20px',
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: 4
                    }}
                  >
                    {card.value}
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(10px, 2.5vw, 11px)',
                      color: '#64748B'
                    }}
                  >
                    {card.subtext}
                  </div>
                </div>
              ))}
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
                const isActive = tab.key === 'all';
                return (
                  <button
                    key={tab.key}
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
                    <option key={option}>{option === 'All' ? filter.label : option}</option>
                  ))}
                </select>
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
                {React.createElement(iconMap[actionButtons.export.icon], { style: { width: 16, height: 16, flexShrink: 0 } })}
                {actionButtons.export.label}
              </button>
              <button
                onClick={() => window.location.href = '/admin/asset-transactions/create'}
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
                {React.createElement(iconMap[actionButtons.createTransaction.icon], { style: { width: 16, height: 16, flexShrink: 0 } })}
                {actionButtons.createTransaction.label}
              </button>
            </div>

            {/* Transactions Table */}
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
                            checked={selectedTransactions.size === transactions.length && transactions.length > 0}
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
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#64748B',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      style={{
                        backgroundColor: transaction.selected ? '#F8FAFC' : '#FFFFFF',
                        borderBottom: '1px solid #E2E8F0',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedTransactions.has(transaction.id)}
                          onChange={() => handleCheckboxChange(transaction.id)}
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
                          {transaction.id}
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px' }}>
                        <span
                          style={{
                            fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                            fontWeight: 600,
                            padding: isMobile ? '3px 6px' : '4px 8px',
                            borderRadius: 4,
                            backgroundColor: transaction.typeBg,
                            color: transaction.typeColor,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {transaction.type}
                        </span>
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
                            {transaction.asset}
                          </div>
                          <div
                            style={{
                              fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                              color: '#64748B'
                            }}
                          >
                            {transaction.assetId}
                          </div>
                        </div>
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
                            {transaction.counterparty}
                          </div>
                          <div
                            style={{
                              fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                              color: '#64748B'
                            }}
                          >
                            {transaction.counterpartyRole}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px', fontSize: isMobile ? 'clamp(11px, 2.8vw, 13px)' : '13px', fontWeight: 500, color: '#0F172A' }}>
                        {transaction.price}
                      </td>
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px' }}>
                        <span
                          style={{
                            fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                            fontWeight: 600,
                            padding: isMobile ? '3px 6px' : '4px 8px',
                            borderRadius: 999,
                            backgroundColor: transaction.statusBg,
                            color: transaction.statusColor,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px' }}>
                        {transaction.keyDate ? (
                          <div>
                            <div
                              style={{
                                fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px',
                                color: '#64748B'
                              }}
                            >
                              {transaction.keyDate}
                            </div>
                            <div
                              style={{
                                fontSize: isMobile ? 'clamp(8px, 2vw, 10px)' : '10px',
                                color: '#94A3B8'
                              }}
                            >
                              {transaction.keyDateLabel}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#CBD5E1' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px', textAlign: 'center' }}>
                        {transaction.docsCount > 0 ? (
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <FileText style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, color: '#64748B', flexShrink: 0 }} />
                            <span
                              style={{
                                position: 'absolute',
                                top: -6,
                                right: -6,
                                fontSize: isMobile ? '8px' : '9px',
                                fontWeight: 600,
                                color: '#FFFFFF',
                                backgroundColor: '#DC2626',
                                borderRadius: 999,
                                padding: '2px 4px',
                                minWidth: 16,
                                textAlign: 'center'
                              }}
                            >
                              {transaction.docsCount}
                            </span>
                          </div>
                        ) : (
                          <FileText style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, color: '#CBD5E1', flexShrink: 0 }} />
                        )}
                      </td>
                      <td style={{ padding: isMobile ? '10px 12px' : '12px 16px', textAlign: 'right' }}>
                        <MoreHorizontal style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, color: '#94A3B8', cursor: 'pointer', flexShrink: 0 }} />
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
            {/* Transaction Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: isMobile ? 16 : 20
              }}
            >
              <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: isMobile ? 'clamp(16px, 4vw, 18px)' : '18px',
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: 8,
                    wordBreak: 'break-word'
                  }}
                >
                  {selectedTransaction.id}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? 'clamp(11px, 2.8vw, 13px)' : '13px',
                    fontWeight: 600,
                    color: selectedTransaction.statusColor,
                    marginBottom: 4
                  }}
                >
                  {selectedTransaction.status}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px',
                    color: '#64748B',
                    wordBreak: 'break-word'
                  }}
                >
                  {selectedTransaction.type} • {selectedTransaction.asset}
                </div>
              </div>
              <button
                style={{
                  padding: 4,
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: '#64748B',
                  flexShrink: 0
                }}
              >
                <X style={{ width: isMobile ? 16 : 18, height: isMobile ? 16 : 18 }} />
              </button>
            </div>

            {/* Transaction Summary */}
            <div style={{ marginBottom: isMobile ? 16 : 20 }}>
              <div
                style={{
                  fontSize: isMobile ? 'clamp(24px, 6vw, 32px)' : '32px',
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: 8
                }}
              >
                {selectedTransaction.price}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: 4,
                    backgroundColor: selectedTransaction.typeBg,
                    color: selectedTransaction.typeColor
                  }}
                >
                  {selectedTransaction.type}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#64748B'
                  }}
                >
                  {selectedTransaction.priceLabel}
                </span>
              </div>
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
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Property</span>
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A', textAlign: 'right', wordBreak: 'break-word' }}>
                    {selectedTransaction.details.property}
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
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Counterparty</span>
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A', textAlign: 'right', wordBreak: 'break-word' }}>
                    {selectedTransaction.details.counterparty}
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
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Contract Date</span>
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A' }}>
                    {selectedTransaction.details.contractDate}
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
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Closing Date</span>
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A' }}>
                    {selectedTransaction.details.closingDate}
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
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Earnest Money</span>
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A' }}>
                    {selectedTransaction.details.earnestMoney}
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
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Net Proceeds</span>
                  <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A' }}>
                    {selectedTransaction.details.netProceeds}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div style={{ marginBottom: isMobile ? 16 : 20 }}>
              <h4
                style={{
                  fontSize: isMobile ? 'clamp(11px, 2.8vw, 13px)' : '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: isMobile ? 10 : 12
                }}
              >
                Status Timeline
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12 }}>
                {selectedTransaction.timeline.map((step, idx) => (
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
                      {idx < selectedTransaction.timeline.length - 1 && (
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
                            color: '#64748B',
                            marginBottom: step.subtext ? 2 : 0
                          }}
                        >
                          {step.date}
                        </div>
                      )}
                      {step.subtext && (
                        <div
                          style={{
                            fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                            color: '#64748B',
                            wordBreak: 'break-word'
                          }}
                        >
                          {step.subtext}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div style={{ marginBottom: isMobile ? 16 : 20 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: isMobile ? 10 : 12
                }}
              >
                <h4
                  style={{
                    fontSize: isMobile ? 'clamp(11px, 2.8vw, 13px)' : '13px',
                    fontWeight: 600,
                    color: '#0F172A'
                  }}
                >
                  Documents
                </h4>
                <button
                  style={{
                    padding: '4px 8px',
                    fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                    fontWeight: 500,
                    color: '#1E3A5F',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Upload
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedTransaction.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: 8,
                      backgroundColor: '#F8FAFC',
                      borderRadius: 6
                    }}
                  >
                    <FileText style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, color: '#64748B', flexShrink: 0 }} />
                    <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
                      <div style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 11px)' : '11px', fontWeight: 500, color: '#0F172A', wordBreak: 'break-word' }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: isMobile ? 'clamp(9px, 2.2vw, 10px)' : '10px', color: '#64748B' }}>{doc.size} • {doc.date}</div>
                    </div>
                    <Download style={{ width: isMobile ? 12 : 14, height: isMobile ? 12 : 14, color: '#64748B', cursor: 'pointer', flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Counterparty */}
            <div style={{ marginBottom: isMobile ? 16 : 20 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: isMobile ? 10 : 12
                }}
              >
                <h4
                  style={{
                    fontSize: isMobile ? 'clamp(11px, 2.8vw, 13px)' : '13px',
                    fontWeight: 600,
                    color: '#0F172A'
                  }}
                >
                  Counterparty
                </h4>
                <button
                  style={{
                    padding: 4,
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: '#64748B',
                    flexShrink: 0
                  }}
                >
                  <Edit style={{ width: isMobile ? 12 : 14, height: isMobile ? 12 : 14 }} />
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 10 : 12,
                  marginBottom: isMobile ? 10 : 12
                }}
              >
                <div
                  style={{
                    width: isMobile ? 36 : 40,
                    height: isMobile ? 36 : 40,
                    borderRadius: '50%',
                    backgroundColor: '#1E3A5F',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? 'clamp(12px, 3vw, 14px)' : '14px',
                    fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  {selectedTransaction.counterparty.initials}
                </div>
                <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: isMobile ? 'clamp(11px, 2.8vw, 13px)' : '13px',
                      fontWeight: 600,
                      color: '#0F172A',
                      marginBottom: 2,
                      wordBreak: 'break-word'
                    }}
                  >
                    {selectedTransaction.counterparty.name}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                      color: '#64748B'
                    }}
                  >
                    {selectedTransaction.counterparty.role}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 8 }}>
                <div>
                  <div style={{ fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px', color: '#64748B', marginBottom: 2 }}>Email</div>
                  <div style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A', wordBreak: 'break-word' }}>
                    {selectedTransaction.counterparty.email}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px', color: '#64748B', marginBottom: 2 }}>Phone</div>
                  <div style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A' }}>
                    {selectedTransaction.counterparty.phone}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div style={{ marginBottom: isMobile ? 16 : 20 }}>
              <h4
                style={{
                  fontSize: isMobile ? 'clamp(11px, 2.8vw, 13px)' : '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: isMobile ? 10 : 12
                }}
              >
                Activity Log
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12 }}>
                {selectedTransaction.activityLog.map((activity, idx) => (
                  <div key={idx}>
                    <div
                      style={{
                        fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px',
                        fontWeight: 600,
                        color: '#0F172A',
                        marginBottom: 4
                      }}
                    >
                      {activity.author}
                    </div>
                    <div
                      style={{
                        fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                        color: '#64748B',
                        marginBottom: 4
                      }}
                    >
                      {activity.date}
                    </div>
                    <div
                      style={{
                        fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px',
                        color: '#64748B',
                        marginBottom: activity.note ? 4 : 0,
                        wordBreak: 'break-word'
                      }}
                    >
                      {activity.action}
                    </div>
                    {activity.note && (
                      <div
                        style={{
                          fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                          color: '#94A3B8',
                          fontStyle: 'italic',
                          wordBreak: 'break-word'
                        }}
                      >
                        {activity.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: isMobile ? 10 : 12,
                  display: 'flex',
                  gap: isMobile ? 6 : 8
                }}
              >
                <input
                  type="text"
                  placeholder="Add note..."
                  style={{
                    flexGrow: 1,
                    flexShrink: 1,
                    flexBasis: 0,
                    padding: isMobile ? '6px 8px' : '6px 10px',
                    fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                    border: '1px solid #E2E8F0',
                    borderRadius: 6,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    minWidth: 0
                  }}
                />
                <button
                  style={{
                    padding: isMobile ? '6px 10px' : '6px 12px',
                    fontSize: isMobile ? 'clamp(9px, 2.2vw, 11px)' : '11px',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#1E3A5F',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Add
                </button>
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
                  color: selectedTransaction.actionButtons.terminate.color,
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${selectedTransaction.actionButtons.terminate.color}`,
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                {selectedTransaction.actionButtons.terminate.label}
              </button>
              <button
                style={{
                  width: '100%',
                  padding: isMobile ? '10px 14px' : '10px 16px',
                  fontSize: isMobile ? 'clamp(12px, 3vw, 13px)' : '13px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  backgroundColor: selectedTransaction.actionButtons.updateStatus.color,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                {selectedTransaction.actionButtons.updateStatus.label}
              </button>
              <button
                style={{
                  width: '100%',
                  padding: isMobile ? '10px 14px' : '10px 16px',
                  fontSize: isMobile ? 'clamp(12px, 3vw, 13px)' : '13px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  backgroundColor: selectedTransaction.actionButtons.closeTransaction.color,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                {React.createElement(iconMap[selectedTransaction.actionButtons.closeTransaction.icon], {
                  style: { width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }
                })}
                {selectedTransaction.actionButtons.closeTransaction.label}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

