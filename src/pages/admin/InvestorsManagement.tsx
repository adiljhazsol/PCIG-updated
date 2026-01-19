import React, {
  CSSProperties,
  useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Download,
  Plus,
  ChevronDown
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Download,
  Plus
};

export default function InvestorsManagement() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const navigate = useNavigate();
  const isMobileOrTablet = isMobile || isTablet;

  // Extract data from JSON
  const investorsData = adminData.investorsManagement;
  const header = investorsData.header;
  const actionButtons = investorsData.actionButtons;
  const summaryCards = investorsData.summaryCards;
  const tabs = investorsData.tabs;
  const tableHeaders = investorsData.tableHeaders;
  const tableRows = investorsData.tableRows;
  const selectedInvestor = investorsData.selectedInvestor;

  const pageWrapperStyle: CSSProperties = {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
          maxWidth: isMobile ? '100%' : '1280px',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Header Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 12 : 0,
            marginBottom: isMobile ? 16 : 24
          }}
        >
          <div>
            <h1
              style={{
                fontSize: isMobile ? 20 : 24,
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
                  fontSize: 13,
                  color: '#64748B'
                }}
              >
                {header.subtitle}
              </p>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: isMobile ? 'wrap' : 'nowrap'
            }}
          >
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center'
              }}
            >
              {React.createElement(iconMap[actionButtons.export.icon], { style: { width: 16, height: 16 } })}
              {actionButtons.export.label}
            </button>
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#1E3A5F',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.15)',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center'
              }}
              onClick={() => navigate('/admin/invite-investor')}
            >
              {React.createElement(iconMap[actionButtons.invite.icon], { style: { width: 16, height: 16 } })}
              {actionButtons.invite.label}
            </button>
          </div>
        </div>

        {/* Main 2-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet
              ? 'minmax(0, 1fr)'
              : 'minmax(0, 2.1fr) minmax(0, 1fr)',
            gap: isMobile ? 20 : 24,
            alignItems: 'flex-start'
          }}
        >
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stat cards row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? 'minmax(0, 1fr)'
                  : isTablet
                    ? 'repeat(2, minmax(0, 1fr))'
                    : 'repeat(4, minmax(0, 1fr))',
                gap: 16
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
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#64748B',
                      marginBottom: 8
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 8,
                      marginBottom: 4
                    }}
                  >
                    <span
                      style={{
                        fontSize: isMobile ? 'clamp(20px, 5vw, 24px)' : 24,
                        fontWeight: 700,
                        color: '#0F172A'
                      }}
                    >
                      {card.value}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: card.subtextColor || '#64748B',
                      fontWeight: card.subtextColor ? 500 : 400
                    }}
                  >
                    {card.subtext}
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs + search / filters */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              {/* Tabs */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  fontSize: 13,
                  flexWrap: 'wrap'
                }}
              >
                {tabs.map((tab, index) => {
                  const isActive = index === 0;
                  return (
                    <button
                      key={tab}
                      style={{
                        border: 'none',
                        backgroundColor: 'transparent',
                        padding: '4px 0',
                        borderBottom: isActive
                          ? '2px solid #1E3A5F'
                          : '2px solid transparent',
                        color: isActive ? '#1E3A5F' : '#64748B',
                        fontWeight: isActive ? 600 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Search + filters */}
              <div
                style={{
                  display: 'flex',
                  alignItems: isMobile ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexDirection: isMobile ? 'column' : 'row'
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    padding: '6px 10px',
                    backgroundColor: '#F8FAFC'
                  }}
                >
                  <Search style={{ width: 16, height: 16, color: '#94A3B8' }} />
                  <input
                    placeholder={investorsData.searchPlaceholder}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: 13,
                      flex: 1,
                      color: '#0F172A'
                    }}
                  />
                </div>

                {/* Filters */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                    justifyContent: isMobile ? 'flex-start' : 'flex-end'
                  }}
                >
                  {investorsData.filters.map((label) => (
                    <button
                      key={label}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        color: '#475569',
                        fontSize: 12,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {label}
                      <ChevronDown style={{ width: 14, height: 14 }} />
                    </button>
                  ))}

                  <button
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#F8FAFC',
                      color: '#475569',
                      fontSize: 12,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Filter style={{ width: 14, height: 14 }} />
                    {investorsData.moreFiltersLabel}
                  </button>
                </div>
              </div>

              {/* Table */}
              <div
                style={{
                  marginTop: 8,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    overflowX: 'auto'
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      minWidth: 800,
                      borderCollapse: 'collapse',
                      fontSize: 12
                    }}
                  >
                    <thead
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderBottom: '1px solid #E2E8F0'
                      }}
                    >
                      <tr>
                        {tableHeaders.map((header, idx) => (
                          <th
                            key={header + idx}
                            style={{
                              textAlign: idx === 0 ? 'center' : 'left',
                              padding: '10px 12px',
                              color: '#64748B',
                              fontWeight: 600,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {header}
                            {idx > 0 && idx < 9 && (
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
                      {tableRows.map((row, idx) => (
                        <tr
                          key={row.email}
                          style={{
                            backgroundColor: idx === 0 ? '#F8FAFC' : '#FFFFFF',
                            borderBottom: '1px solid #E2E8F0'
                          }}
                        >
                          <td
                            style={{
                              padding: '10px 12px',
                              textAlign: 'center'
                            }}
                          >
                            <input type="checkbox" />
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                              }}
                            >
                              <div
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: idx === 0 ? '#2563EB' : '#CBD5E1'
                                }}
                              />
                              <div>
                                <div
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#0F172A'
                                  }}
                                >
                                  {row.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: '#64748B'
                                  }}
                                >
                                  {row.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          {/* Status */}
                          <td style={{ padding: '10px 12px' }}>
                            <span
                              style={{
                                fontSize: 11,
                                padding: '4px 8px',
                                borderRadius: 999,
                                backgroundColor: row.statusBg,
                                color: row.statusColor,
                                fontWeight: 500
                              }}
                            >
                              {row.status}
                            </span>
                          </td>
                          {/* KYC */}
                          <td style={{ padding: '10px 12px' }}>
                            <span
                              style={{
                                fontSize: 11,
                                padding: '4px 8px',
                                borderRadius: 999,
                                backgroundColor: row.kycBg,
                                color: row.kycColor,
                                fontWeight: 500
                              }}
                            >
                              {row.kyc}
                            </span>
                          </td>
                          {/* Funding */}
                          <td style={{ padding: '10px 12px' }}>
                            <span
                              style={{
                                fontSize: 11,
                                padding: '4px 8px',
                                borderRadius: 999,
                                backgroundColor: row.fundingBg,
                                color: row.fundingColor,
                                fontWeight: 500
                              }}
                            >
                              {row.funding}
                            </span>
                          </td>
                          {/* Methods */}
                          <td style={{ padding: '10px 12px', fontSize: 12, color: '#475569' }}>
                            {row.method}
                          </td>
                          {/* Total Investments */}
                          <td style={{ padding: '10px 12px', fontSize: 12, color: '#0F172A' }}>
                            {row.total}
                          </td>
                          {/* Registration */}
                          <td style={{ padding: '10px 12px', fontSize: 12, color: '#64748B' }}>
                            {row.registration}
                          </td>
                          {/* Last Activity */}
                          <td style={{ padding: '10px 12px', fontSize: 12, color: '#64748B' }}>
                            {row.lastActivity}
                          </td>
                          {/* Actions */}
                          <td
                            style={{
                              padding: '10px 12px',
                              textAlign: 'right'
                            }}
                          >
                            {idx === 0 ? (
                              <button
                                style={{
                                  fontSize: 12,
                                  padding: '6px 12px',
                                  borderRadius: 999,
                                  border: 'none',
                                  backgroundColor: '#1E3A5F',
                                  color: '#FFFFFF',
                                  fontWeight: 500,
                                  cursor: 'pointer'
                                }}
                              >
                                Details
                              </button>
                            ) : idx === 1 ? (
                              <button
                                style={{
                                  fontSize: 12,
                                  padding: '6px 12px',
                                  borderRadius: 999,
                                  border: 'none',
                                  backgroundColor: '#0F172A',
                                  color: '#FFFFFF',
                                  fontWeight: 500,
                                  cursor: 'pointer'
                                }}
                              >
                                Review
                              </button>
                            ) : (
                              <button
                                style={{
                                  fontSize: 12,
                                  padding: '6px 12px',
                                  borderRadius: 999,
                                  border: '1px solid #E2E8F0',
                                  backgroundColor: '#FFFFFF',
                                  color: '#475569',
                                  fontWeight: 500,
                                  cursor: 'pointer'
                                }}
                              >
                                Details
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Investor detail panel */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              marginTop: isMobileOrTablet ? 8 : 0
            }}
          >
            {/* Main investor card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: 16,
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#0F172A',
                      marginBottom: 4
                    }}
                  >
                    {selectedInvestor.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    ID: {selectedInvestor.id} • {selectedInvestor.type}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: selectedInvestor.statusColor,
                    backgroundColor: selectedInvestor.statusBg,
                    padding: '4px 10px',
                    borderRadius: 999
                  }}
                >
                  {selectedInvestor.status}
                </span>
              </div>

              {/* Tabs + summary */}
              <div style={{ padding: 16, borderBottom: '1px solid #E2E8F0' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 12
                  }}
                >
                  {selectedInvestor.sidebarTabs.map((tab, index) => {
                    const isActive = index === 0;
                    return (
                      <button
                        key={tab}
                        style={{
                          borderRadius: 999,
                          border: isActive ? '1px solid #1E3A5F' : '1px solid #E2E8F0',
                          backgroundColor: isActive ? '#EFF6FF' : '#FFFFFF',
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 500,
                          color: isActive ? '#1E3A5F' : '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        {tab}
                      </button>
                    );
                  })}
                  <button
                    style={{
                      marginLeft: 'auto',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      padding: 4
                    }}
                  >
                    <MoreHorizontal style={{ width: 18, height: 18, color: '#94A3B8' }} />
                  </button>
                </div>

                {/* Funding summary */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#B45309',
                        marginBottom: 8
                      }}
                    >
                      {selectedInvestor.fundingRequest.title}
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: '#0F172A',
                        marginBottom: 4
                      }}
                    >
                      {selectedInvestor.fundingRequest.amount}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#475569',
                        marginBottom: 8
                      }}
                    >
                      Method: {selectedInvestor.fundingRequest.method}
                      <br />
                      Bank: {selectedInvestor.fundingRequest.bank}
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: 'right',
                      fontSize: 11,
                      color: '#64748B'
                    }}
                  >
                    <div>{selectedInvestor.fundingRequest.date}</div>
                  </div>
                </div>

                {/* Approve / Reject buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 12
                  }}
                >
                  <button
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 999,
                      border: 'none',
                      backgroundColor: '#1E3A5F',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Approve
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 999,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* KYC Status */}
              <div
                style={{
                  padding: 16,
                  borderBottom: '1px solid #E2E8F0'
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
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#0F172A'
                    }}
                  >
                    KYC Status
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: selectedInvestor.kycStatus.statusColor,
                      backgroundColor: selectedInvestor.kycStatus.statusBg,
                      padding: '4px 10px',
                      borderRadius: 999
                    }}
                  >
                    {selectedInvestor.kycStatus.status}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: '#64748B',
                    marginBottom: 10
                  }}
                >
                  <div>
                    <div style={{ marginBottom: 2 }}>Submitted</div>
                    <div style={{ color: '#0F172A' }}>{selectedInvestor.kycStatus.submitted}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: 2 }}>Approved By</div>
                    <div style={{ color: '#0F172A' }}>{selectedInvestor.kycStatus.approvedBy}</div>
                  </div>
                </div>
                <button
                  style={{
                    marginTop: 4,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    fontSize: 11,
                    color: '#1E3A5F',
                    cursor: 'pointer'
                  }}
                >
                  View KYC Documents
                  <ArrowRight style={{ width: 12, height: 12 }} />
                </button>
              </div>

              {/* Investment Summary */}
              <div
                style={{
                  padding: 16,
                  borderBottom: '1px solid #E2E8F0'
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: 12
                  }}
                >
                  Investment Summary
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    rowGap: 8,
                    columnGap: 24,
                    fontSize: 11
                  }}
                >
                  <div>
                    <div style={{ color: '#64748B', marginBottom: 2 }}>
                      Total Invested
                    </div>
                    <div style={{ color: '#0F172A', fontWeight: 600 }}>{selectedInvestor.investmentSummary.totalInvested}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748B', marginBottom: 2 }}>
                      Current Balance
                    </div>
                    <div style={{ color: '#0F172A', fontWeight: 600 }}>{selectedInvestor.investmentSummary.currentBalance}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748B', marginBottom: 2 }}>Properties</div>
                    <div style={{ color: '#0F172A', fontWeight: 600 }}>{selectedInvestor.investmentSummary.properties}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748B', marginBottom: 2 }}>Funds</div>
                    <div style={{ color: '#0F172A', fontWeight: 600 }}>{selectedInvestor.investmentSummary.funds}</div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div
                style={{
                  padding: 16,
                  borderBottom: '1px solid #E2E8F0'
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
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#0F172A'
                    }}
                  >
                    Contact Information
                  </div>
                  <button
                    style={{
                      fontSize: 11,
                      color: '#1E3A5F',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#64748B',
                    display: 'grid',
                    rowGap: 8
                  }}
                >
                  <div>
                    <div style={{ marginBottom: 2 }}>Email</div>
                    <div style={{ color: '#0F172A' }}>
                      {selectedInvestor.contactInfo.email}{' '}
                      {selectedInvestor.contactInfo.emailVerified && (
                        <span
                          style={{
                            fontSize: 10,
                            color: '#047857',
                            backgroundColor: '#ECFDF5',
                            padding: '2px 6px',
                            borderRadius: 999,
                            fontWeight: 500,
                            marginLeft: 4
                          }}
                        >
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div style={{ marginBottom: 2 }}>Phone</div>
                    <div style={{ color: '#0F172A' }}>{selectedInvestor.contactInfo.phone}</div>
                  </div>
                  <div>
                    <div style={{ marginBottom: 2 }}>Address</div>
                    <div style={{ color: '#0F172A' }}>
                      {selectedInvestor.contactInfo.address.line1}
                      <br />
                      {selectedInvestor.contactInfo.address.line2}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{ padding: 16 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: 8
                  }}
                >
                  Recent Activity
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    fontSize: 11,
                    color: '#64748B',
                    display: 'grid',
                    rowGap: 6
                  }}
                >
                  {selectedInvestor.recentActivity.map((activity, idx) => (
                    <li key={idx}>
                      <span style={{ color: '#0F172A', fontWeight: 500 }}>
                        {activity.date}
                      </span>{' '}
                      {activity.action}
                    </li>
                  ))}
                </ul>
                <button
                  style={{
                    marginTop: 10,
                    fontSize: 11,
                    color: '#1E3A5F',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  View Full Log
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


