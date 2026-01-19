import React, { CSSProperties, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Plus,
  Edit,
  FileDown,
  Share2
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  FileText,
  Plus,
  Edit,
  FileDown,
  Share2
};

export default function FundAdmin() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const navigate = useNavigate();
  const isMobileOrTablet = isMobile || isTablet;

  // Extract data from JSON
  const fundAdminData = adminData.fundAdmin;
  const header = fundAdminData.header;
  const actionButtons = fundAdminData.actionButtons;
  const summaryCards = fundAdminData.summaryCards;
  const searchPlaceholder = fundAdminData.searchPlaceholder;
  const filters = fundAdminData.filters;
  const tableHeaders = fundAdminData.tableHeaders;
  const funds = fundAdminData.funds;
  const selectedFund = fundAdminData.selectedFund;

  const [selectedFundId, setSelectedFundId] = useState<string>(selectedFund.id);
  const [activeTab, setActiveTab] = useState<string>(selectedFund.activeTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // const currentFund = funds.find(f => f.id === selectedFundId) || funds[0];
  const fundDetails = selectedFund;

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
          {/* Left Column - Fund List */}
          <div>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 24
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: `clamp(18px, 3vw, 24px)`,
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: 4,
                    margin: 0
                  }}
                >
                  {header.title}
                </h1>
                {!isMobile && (
                  <p
                    style={{
                      fontSize: `clamp(11px, 1.5vw, 13px)`,
                      color: '#64748B',
                      margin: 0,
                      marginTop: 4
                    }}
                  >
                    {header.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobileOrTablet ? 'column' : 'row',
                gap: 12,
                marginBottom: 24
              }}
            >
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: `clamp(8px, 1vh, 10px) clamp(12px, 2vw, 16px)`,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: isMobileOrTablet ? '100%' : 'auto'
                }}
              >
                {React.createElement(iconMap[actionButtons.reports.icon], { style: { width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` } })}
                {actionButtons.reports.label}
              </button>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: `clamp(8px, 1vh, 10px) clamp(12px, 2vw, 16px)`,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#1D4ED8',
                  color: '#FFFFFF',
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: isMobileOrTablet ? '100%' : 'auto'
                }}
                onClick={() => navigate('/admin/funds/create')}
              >
                {React.createElement(iconMap[actionButtons.createFund.icon], { style: { width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` } })}
                {actionButtons.createFund.label}
              </button>
            </div>

            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? 'repeat(1, minmax(0, 1fr))'
                  : isTablet
                    ? 'repeat(2, minmax(0, 1fr))'
                    : 'repeat(4, minmax(0, 1fr))',
                gap: isMobile ? 12 : 16,
                marginBottom: 24
              }}
            >
              {summaryCards.map((card, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div
                    style={{
                      fontSize: `clamp(10px, 1.3vw, 11px)`,
                      fontWeight: 500,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: 8
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      fontSize: `clamp(18px, 4.5vw, 20px)`,
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: 4
                    }}
                  >
                    {card.value}
                  </div>
                  <div
                    style={{
                      fontSize: `clamp(11px, 1.5vw, 12px)`,
                      color: '#64748B'
                    }}
                  >
                    {card.subtext}
                  </div>
                </div>
              ))}
            </div>

            {/* Search and Filters */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 12,
                marginBottom: 16,
                flexWrap: isMobile ? 'nowrap' : 'wrap'
              }}
            >
              <div
                style={{
                  position: 'relative',
                  flex: 1
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
                    color: '#64748B'
                  }}
                />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px) clamp(8px, 1vh, 10px) ${isMobileOrTablet ? 'clamp(36px, 5vw, 40px)' : '36px'}`,
                    fontSize: `clamp(12px, 1.5vw, 13px)`,
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                />
              </div>
              {filters.map((filter, idx) => (
                <select
                  key={idx}
                  style={{
                    padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px)`,
                    fontSize: `clamp(12px, 1.5vw, 13px)`,
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    cursor: 'pointer',
                    minWidth: isMobile ? '100%' : '120px',
                    width: isMobile ? '100%' : 'auto',
                    outline: 'none'
                  }}
                  defaultValue={filter.selected}
                  onChange={(e) => {
                    if (filter.label === 'Status') {
                      setStatusFilter(e.target.value);
                    }
                  }}
                >
                  <option value={filter.selected}>{filter.label}: {filter.selected}</option>
                  {filter.options.filter(opt => opt !== filter.selected).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ))}
            </div>

            {/* Fund Table */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                overflow: isMobileOrTablet ? 'auto' : 'hidden',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div style={{ minWidth: isMobileOrTablet ? '800px' : 'auto', overflowX: isMobileOrTablet ? 'auto' : 'visible' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: `clamp(11px, 1.5vw, 13px)`,
                    minWidth: isMobileOrTablet ? '800px' : 'auto'
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderBottom: '1px solid #E2E8F0'
                      }}
                    >
                      {tableHeaders.map((header) => (
                        <th
                          key={header}
                          style={{
                            padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`,
                            textAlign: 'left',
                            fontSize: `clamp(10px, 1.3vw, 11px)`,
                            fontWeight: 600,
                            color: '#64748B',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {funds.filter(fund => {
                      const matchesSearch = fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        fund.id.toLowerCase().includes(searchTerm.toLowerCase());
                      // Basic mapping for "All Statuses" or specific status
                      // The JSON uses "All Statuses" as default selected, which we map to 'All' logic
                      // If the dropdown value is strictly a status, we match it.
                      // Note: admin.json might have "All Statuses" as the toggle label.
                      const matchesStatus = statusFilter === 'All Statuses' || statusFilter === 'All' || fund.status === statusFilter;

                      return matchesSearch && matchesStatus;
                    }).map((fund) => {
                      const isSelected = fund.id === selectedFundId;
                      return (
                        <tr
                          key={fund.id}
                          onClick={() => setSelectedFundId(fund.id)}
                          style={{
                            backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                            borderBottom: '1px solid #E2E8F0',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#F8FAFC';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#FFFFFF';
                            }
                          }}
                        >
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, fontWeight: 500, color: '#0F172A' }}>
                            <div>
                              <div style={{ fontSize: `clamp(11px, 1.5vw, 13px)`, wordBreak: 'break-word' }}>{fund.name}</div>
                              <div style={{ fontSize: `clamp(10px, 1.3vw, 11px)`, color: '#64748B', marginTop: 2 }}>
                                ID: {fund.id}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 500,
                                color: fund.strategyColor,
                                backgroundColor: fund.strategyColor === '#1D4ED8' ? '#EFF6FF' :
                                  fund.strategyColor === '#B45309' ? '#FFF7ED' :
                                    fund.strategyColor === '#6B21A8' ? '#F3E8FF' :
                                      '#ECFDF5',
                                padding: '4px 8px',
                                borderRadius: 4
                              }}
                            >
                              {fund.strategy}
                            </span>
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                            <span
                              style={{
                                fontSize: `clamp(11px, 1.5vw, 12px)`,
                                fontWeight: 500,
                                color: fund.statusColor,
                                backgroundColor: fund.statusColor === '#047857' ? '#ECFDF5' :
                                  fund.statusColor === '#757575' ? '#F1F5F9' :
                                    '#FFFBEB',
                                padding: '4px 8px',
                                borderRadius: 4
                              }}
                            >
                              {fund.status}
                            </span>
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: '#64748B' }}>
                            {fund.targetIRR}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: '#64748B' }}>
                            {fund.lockUp}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                            <div style={{ marginBottom: 4 }}>
                              <span style={{ color: '#0F172A', fontWeight: 500 }}>{fund.aum}</span>
                              <span style={{ color: '#64748B' }}> / {fund.cap}</span>
                            </div>
                            <div
                              style={{
                                width: '100%',
                                height: 4,
                                backgroundColor: '#E2E8F0',
                                borderRadius: 2,
                                overflow: 'hidden'
                              }}
                            >
                              <div
                                style={{
                                  width: `${fund.aumPercent}%`,
                                  height: '100%',
                                  backgroundColor: fund.aumPercent === 100 ? '#10B981' : '#1D4ED8',
                                  transition: 'width 0.3s'
                                }}
                              />
                            </div>
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: '#64748B' }}>
                            {fund.capacity}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: '#64748B' }}>
                            {fund.investors}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                            <span
                              style={{
                                fontSize: `clamp(11px, 1.5vw, 13px)`,
                                fontWeight: 500,
                                color: fund.performanceColor
                              }}
                            >
                              {fund.performance}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Fund Details */}
          <div style={{ order: isMobileOrTablet ? -1 : 0 }}>
            {/* Fund Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 20
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: `clamp(16px, 2.5vw, 18px)`,
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: 4,
                    wordBreak: 'break-word'
                  }}
                >
                  {fundDetails.name}
                </div>
                <div
                  style={{
                    fontSize: `clamp(11px, 1.5vw, 12px)`,
                    color: '#64748B',
                    marginBottom: 8
                  }}
                >
                  ID: {fundDetails.id}
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: fundDetails.statusColor,
                    backgroundColor: '#ECFDF5',
                    padding: '4px 8px',
                    borderRadius: 4
                  }}
                >
                  {fundDetails.status}
                </span>
              </div>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: `clamp(6px, 1vh, 8px) clamp(10px, 1.5vw, 12px)`,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: `clamp(11px, 1.5vw, 12px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Edit style={{ width: `clamp(12px, 2vw, 14px)`, height: `clamp(12px, 2vw, 14px)` }} />
                Edit Fund
              </button>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                borderBottom: '1px solid #E2E8F0',
                marginBottom: 20,
                overflowX: isMobileOrTablet ? 'auto' : 'visible',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {fundDetails.tabs.map((tab) => {
                const isActive = tab === activeTab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: `clamp(8px, 1.2vh, 10px) clamp(10px, 1.5vw, 12px)`,
                      fontSize: `clamp(12px, 1.5vw, 13px)`,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#1E3A5F' : '#64748B',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: isActive ? '2px solid #1D4ED8' : '2px solid transparent',
                      cursor: 'pointer',
                      marginBottom: -1,
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Fund Performance Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: 16
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}
              >
                <div
                  style={{
                    fontSize: `clamp(13px, 2vw, 14px)`,
                    fontWeight: 600,
                    color: '#0F172A'
                  }}
                >
                  Fund Performance
                </div>
                <span
                  style={{
                    fontSize: `clamp(10px, 1.3vw, 11px)`,
                    fontWeight: 600,
                    color: fundDetails.fundPerformance.statusColor,
                    backgroundColor: fundDetails.fundPerformance.statusBg,
                    padding: `clamp(3px, 0.5vh, 4px) clamp(6px, 1vw, 8px)`,
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {fundDetails.fundPerformance.status}
                </span>
              </div>
              <div
                style={{
                  fontSize: `clamp(20px, 5vw, 24px)`,
                  fontWeight: 700,
                  color: fundDetails.fundPerformance.currentIRRColor,
                  marginBottom: 8
                }}
              >
                {fundDetails.fundPerformance.currentIRR}
              </div>
              <div
                style={{
                  fontSize: `clamp(11px, 1.5vw, 12px)`,
                  color: '#64748B',
                  marginBottom: 4
                }}
              >
                AUM: {fundDetails.fundPerformance.aum}
              </div>
              <div
                style={{
                  fontSize: `clamp(11px, 1.5vw, 12px)`,
                  color: '#64748B',
                  marginBottom: 4
                }}
              >
                Target IRR: {fundDetails.fundPerformance.targetIRR}
              </div>
              <div
                style={{
                  fontSize: `clamp(11px, 1.5vw, 12px)`,
                  color: '#64748B'
                }}
              >
                Distributions (YTD): {fundDetails.fundPerformance.distributionsYTD}
              </div>
            </div>

            {/* Investment Metrics Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: 16
              }}
            >
              <div
                style={{
                  fontSize: `clamp(13px, 2vw, 14px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: 12
                }}
              >
                Investment Metrics
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Hard Cap:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {fundDetails.investmentMetrics.hardCap}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Min Investment:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {fundDetails.investmentMetrics.minInvestment}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Lock-Up:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {fundDetails.investmentMetrics.lockUp}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Strategy:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {fundDetails.investmentMetrics.strategy}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                marginBottom: 16
              }}
            >
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 2vw, 16px)`,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#1D4ED8',
                  color: '#FFFFFF',
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                <FileText style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` }} />
                Record Contribution
              </button>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 2vw, 16px)`,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                <Share2 style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` }} />
                Distribute Profits
              </button>
            </div>

            {/* Tax Documents Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: 16
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}
              >
                <div
                  style={{
                    fontSize: `clamp(13px, 2vw, 14px)`,
                    fontWeight: 600,
                    color: '#0F172A'
                  }}
                >
                  Tax Documents ({fundDetails.taxDocuments.year})
                </div>
                <button
                  style={{
                    padding: `clamp(4px, 0.5vh, 6px) clamp(6px, 1vw, 8px)`,
                    fontSize: `clamp(10px, 1.3vw, 11px)`,
                    fontWeight: 500,
                    color: '#64748B',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  View All
                </button>
              </div>
              <div
                style={{
                  fontSize: `clamp(11px, 1.5vw, 12px)`,
                  color: '#64748B',
                  marginBottom: 8
                }}
              >
                K-1s Generated: {fundDetails.taxDocuments.k1sGenerated} / {fundDetails.taxDocuments.k1sTotal}
              </div>
              <div
                style={{
                  fontSize: `clamp(11px, 1.5vw, 12px)`,
                  fontWeight: 500,
                  color: fundDetails.taxDocuments.statusColor,
                  marginBottom: 12
                }}
              >
                Status: {fundDetails.taxDocuments.status}
              </div>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px)`,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: `clamp(11px, 1.5vw, 12px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                <FileDown style={{ width: `clamp(12px, 2vw, 14px)`, height: `clamp(12px, 2vw, 14px)` }} />
                Download K-1 Package
              </button>
            </div>

            {/* Accounting Snapshot Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: 16
              }}
            >
              <div
                style={{
                  fontSize: `clamp(13px, 2vw, 14px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: 12
                }}
              >
                Accounting Snapshot
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Total Assets:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {fundDetails.accountingSnapshot.totalAssets}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Cash on Hand:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {fundDetails.accountingSnapshot.cashOnHand}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Net Income (YTD):</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: fundDetails.accountingSnapshot.netIncomeColor, fontWeight: 500 }}>
                    {fundDetails.accountingSnapshot.netIncomeYTD}
                  </span>
                </div>
              </div>
            </div>

            {/* Depreciation Allocation Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px'
              }}
            >
              <div
                style={{
                  fontSize: `clamp(13px, 2vw, 14px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: 12
                }}
              >
                Depreciation Allocation
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Annual Depreciation:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {fundDetails.depreciationAllocation.annualDepreciation}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Method:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {fundDetails.depreciationAllocation.method}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: `clamp(10px, 1.3vw, 11px)`,
                    color: '#64748B',
                    fontStyle: 'italic',
                    marginTop: 4
                  }}
                >
                  {fundDetails.depreciationAllocation.note}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

