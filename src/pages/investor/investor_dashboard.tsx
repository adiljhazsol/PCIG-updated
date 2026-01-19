
import { useState } from 'react';
import {
  Building2,
  Coins,
  TrendingUp,
  DollarSign,
  Clock,
  Percent,
  Eye,
  ArrowDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import investorsData from '../../data/investors.json';
import InvestorNav from '../../components/investor/InvestorNav';

// Icon mapping
const iconMap: { [key: string]: any } = {
  Building2,
  Coins,
  TrendingUp,
  DollarSign,
  Clock,
  Percent,
  ArrowDown
};

export default function InvestorDashboard() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const navigate = useNavigate();
  // const [drawerOpen, setDrawerOpen] = useState(false); // Unused
  const [activeDepreciationTab, setActiveDepreciationTab] = useState<string>(investorsData.dashboard.depreciationBreakdown.defaultTab);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(investorsData.dashboard.portfolioPerformance.defaultPeriod);

  // navItems removed as they are now in InvestorNav

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
        <InvestorNav />

        {/* Main Content */}
        <div style={{
          padding: `clamp(16px, 2vh, 24px) clamp(16px, 4vw, 48px)`,
          width: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          maxWidth: '100vw'
        }}>
          {/* Header with Action Buttons */}
          <div style={{ display: 'flex', alignItems: isMobileOrTablet ? 'flex-start' : 'center', justifyContent: 'space-between', marginBottom: `clamp(16px, 2vh, 32px)`, flexDirection: isMobileOrTablet ? 'column' : 'row', gap: `clamp(12px, 2vh, 16px)` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: `clamp(20px, 2.5vw, 28px)`, fontWeight: 700, color: '#0F172A', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: `clamp(4px, 0.5vh, 4px)`, lineHeight: 1.2 }}>{investorsData.dashboard.header.title}</h1>
              <p style={{ fontSize: `clamp(11px, 1.2vw, 14px)`, color: '#64748B', margin: 0, lineHeight: 1.4 }}>{investorsData.dashboard.header.subtitle}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(8px, 1.5vw, 12px)`, flexWrap: 'wrap' }}>
              <button style={{
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                padding: `clamp(6px, 1vh, 8px) clamp(12px, 1.5vw, 16px)`,
                borderRadius: `clamp(4px, 0.5vw, 6px)`,
                border: '1px solid #E2E8F0',
                fontSize: `clamp(11px, 1.2vw, 14px)`,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(4px, 0.5vw, 6px)`,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                whiteSpace: 'nowrap'
              }}>
                <Eye style={{ width: `clamp(14px, 1.2vw, 16px)`, height: `clamp(14px, 1.2vw, 16px)` }} />
                {isMobile ? 'Reports' : 'View Reports'}
              </button>
              <button style={{
                backgroundColor: '#1E3A5F',
                color: '#FFFFFF',
                padding: `clamp(6px, 1vh, 8px) clamp(12px, 1.5vw, 16px)`,
                borderRadius: `clamp(4px, 0.5vw, 6px)`,
                border: 'none',
                fontSize: `clamp(11px, 1.2vw, 14px)`,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(4px, 0.5vw, 6px)`,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                whiteSpace: 'nowrap'
              }}>
                + {isMobile ? 'Deposit' : 'Make Deposit'}
              </button>
            </div>
          </div>

          {/* Dashboard Overview - 6 Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
            gap: `clamp(8px, 1.5vw, 16px)`,
            marginBottom: `clamp(16px, 2vh, 32px)`,
            width: '100%',
            gridAutoRows: '1fr'
          }}>
            {investorsData.dashboard.overviewCards.map((card) => {
              const IconComponent = iconMap[card.icon] || Building2;
              return (
                <div
                  key={card.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: `clamp(12px, 1.5vw, 20px)`,
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    minWidth: 0,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: `clamp(8px, 1.2vh, 12px)` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(8px, 1vw, 10px)` }}>
                      <div style={{
                        width: `clamp(28px, 3.5vw, 40px)`,
                        height: `clamp(28px, 3.5vw, 40px)`,
                        borderRadius: `clamp(6px, 0.8vw, 8px)`,
                        backgroundColor: card.iconBgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <IconComponent style={{ width: `clamp(14px, 1.8vw, 20px)`, height: `clamp(14px, 1.8vw, 20px)`, color: card.iconColor }} />
                      </div>
                      <div style={{ fontSize: `clamp(11px, 1.2vw, 13px)`, fontWeight: 500, color: '#64748B', lineHeight: 1.3 }}>{card.label}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: `clamp(18px, 2.5vw, 24px)`, fontWeight: 700, color: card.valueColor || '#0F172A', marginBottom: `clamp(3px, 0.5vh, 4px)`, lineHeight: 1.2 }}>{card.value}</div>
                  {card.change && (
                    <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: card.changeColor || '#64748B', fontWeight: 500, lineHeight: 1.3 }}>{card.change}</div>
                  )}
                  {card.subtext && (
                    <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B', lineHeight: 1.3 }}>{card.subtext}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Property and Fund Investments Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '1fr 1fr',
            gap: `clamp(12px, 2vw, 24px)`,
            marginBottom: `clamp(16px, 2vh, 24px)`,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            {/* Property Investments Section */}
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: `clamp(14px, 1.8vw, 20px)`,
              borderRadius: `clamp(6px, 0.8vw, 8px)`,
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden',
              minWidth: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: `clamp(16px, 2vh, 20px)`, flexWrap: 'wrap', gap: `clamp(8px, 1vw, 12px)` }}>
                <h2 style={{ fontSize: `clamp(15px, 1.8vw, 18px)`, fontWeight: 600, color: '#0F172A', margin: 0, flexShrink: 0 }}>{investorsData.dashboard.propertyInvestments.title}</h2>
                <Link to="/investor/properties" style={{
                  fontSize: `clamp(12px, 1.3vw, 14px)`,
                  color: '#1E3A5F',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  textDecoration: 'none'
                }}>
                  View All
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: `clamp(10px, 1.5vw, 12px)` }}>
                {investorsData.dashboard.propertyInvestments.items.map((property) => (
                  <div
                    key={property.id}
                    style={{
                      padding: `clamp(12px, 1.5vw, 16px)`,
                      backgroundColor: '#F8FAFC',
                      borderRadius: `clamp(4px, 0.5vw, 6px)`,
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: `clamp(6px, 1vh, 8px)`, flexWrap: 'wrap', gap: `clamp(8px, 1vw, 12px)` }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: `clamp(12px, 1.3vw, 14px)`, fontWeight: 600, color: '#0F172A', marginBottom: `clamp(3px, 0.5vh, 4px)`, lineHeight: 1.3, wordBreak: 'break-word' }}>{property.name}</div>
                        <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B', lineHeight: 1.3 }}>{property.details}</div>
                      </div>
                      <span style={{
                        fontSize: `clamp(10px, 1.1vw, 11px)`,
                        padding: `clamp(3px, 0.5vh, 4px) clamp(8px, 1.2vw, 10px)`,
                        borderRadius: '12px',
                        backgroundColor: property.statusBgColor,
                        color: property.statusColor,
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}>
                        {property.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(8px, 1.2vw, 12px)` }}>
                      <div>
                        <div style={{ fontSize: `clamp(14px, 1.8vw, 16px)`, fontWeight: 700, color: '#0F172A', marginBottom: `clamp(2px, 0.3vh, 2px)`, lineHeight: 1.2 }}>{property.currentValue}</div>
                        <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: property.interestColor, lineHeight: 1.3 }}>{property.interest}</div>
                      </div>
                      <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: property.depreciationColor, lineHeight: 1.3 }}>{property.depreciation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fund Investments Section */}
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: `clamp(14px, 1.8vw, 20px)`,
              borderRadius: `clamp(6px, 0.8vw, 8px)`,
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden',
              minWidth: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: `clamp(16px, 2vh, 20px)`, flexWrap: 'wrap', gap: `clamp(8px, 1vw, 12px)` }}>
                <h2 style={{ fontSize: `clamp(15px, 1.8vw, 18px)`, fontWeight: 600, color: '#0F172A', margin: 0, flexShrink: 0 }}>{investorsData.dashboard.fundInvestments.title}</h2>
                <Link to="/investor/funds" style={{
                  fontSize: `clamp(12px, 1.3vw, 14px)`,
                  color: '#1E3A5F',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  textDecoration: 'none'
                }}>
                  View All
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: `clamp(10px, 1.5vw, 12px)` }}>
                {investorsData.dashboard.fundInvestments.items.map((fund) => (
                  <div
                    key={fund.id}
                    style={{
                      padding: `clamp(12px, 1.5vw, 16px)`,
                      backgroundColor: '#F8FAFC',
                      borderRadius: `clamp(4px, 0.5vw, 6px)`,
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <div style={{ marginBottom: `clamp(6px, 1vh, 8px)` }}>
                      <div style={{ fontSize: `clamp(12px, 1.3vw, 14px)`, fontWeight: 600, color: '#0F172A', marginBottom: `clamp(3px, 0.5vh, 4px)`, lineHeight: 1.3, wordBreak: 'break-word' }}>{fund.name}</div>
                      <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B', lineHeight: 1.3 }}>{fund.details}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(8px, 1.2vw, 12px)` }}>
                      <div>
                        <div style={{ fontSize: `clamp(14px, 1.8vw, 16px)`, fontWeight: 700, color: '#0F172A', marginBottom: `clamp(2px, 0.3vh, 2px)`, lineHeight: 1.2 }}>{fund.currentValue}</div>
                        <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: fund.returnsColor, lineHeight: 1.3 }}>{fund.returns}</div>
                      </div>
                      <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: fund.depreciationColor, lineHeight: 1.3 }}>{fund.depreciation}</div>
                    </div>
                  </div>
                ))}

                {/* View More Link */}
                <div style={{ paddingTop: `clamp(6px, 1vh, 8px)` }}>
                  <button style={{
                    fontSize: `clamp(12px, 1.3vw, 14px)`,
                    color: '#1E3A5F',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                    padding: 0
                  }}>
                    {investorsData.dashboard.fundInvestments.viewMoreText}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Depreciation Breakdown Section */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: `clamp(14px, 1.8vw, 20px)`,
            borderRadius: `clamp(6px, 0.8vw, 8px)`,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            marginTop: `clamp(16px, 2vh, 24px)`,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            <div style={{ marginBottom: `clamp(16px, 2vh, 20px)` }}>
              <h2 style={{ fontSize: `clamp(15px, 1.8vw, 18px)`, fontWeight: 600, color: '#0F172A', marginBottom: `clamp(3px, 0.5vh, 4px)`, lineHeight: 1.2 }}>{investorsData.dashboard.depreciationBreakdown.title}</h2>
              <p style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B', margin: 0, lineHeight: 1.4 }}>{investorsData.dashboard.depreciationBreakdown.subtitle}</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(6px, 1vw, 8px)`, marginBottom: `clamp(16px, 2vh, 20px)`, borderBottom: '1px solid #E2E8F0', overflowX: 'auto', flexWrap: 'nowrap' }}>
              {investorsData.dashboard.depreciationBreakdown.tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveDepreciationTab(tab)}
                  style={{
                    fontSize: `clamp(12px, 1.3vw, 14px)`,
                    fontWeight: activeDepreciationTab === tab ? 600 : 500,
                    color: activeDepreciationTab === tab ? '#1E3A5F' : '#64748B',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeDepreciationTab === tab ? '2px solid #1E3A5F' : 'none',
                    padding: `clamp(6px, 1vh, 8px) clamp(12px, 1.5vw, 16px) ${activeDepreciationTab === tab ? 'clamp(6px, 1vh, 8px) 0' : 'clamp(6px, 1vh, 8px) clamp(12px, 1.5vw, 16px)'} `,
                    cursor: 'pointer',
                    marginBottom: activeDepreciationTab === tab ? '-1px' : '0',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    {investorsData.dashboard.depreciationBreakdown.columns.map((column, idx) => (
                      <th
                        key={column}
                        style={{
                          padding: `clamp(8px, 1.2vw, 12px)`,
                          textAlign: idx === 0 ? 'left' : idx === investorsData.dashboard.depreciationBreakdown.columns.length - 2 || idx === investorsData.dashboard.depreciationBreakdown.columns.length - 1 ? 'center' : 'right',
                          fontSize: `clamp(10px, 1.2vw, 12px)`,
                          fontWeight: 600,
                          color: '#64748B',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {investorsData.dashboard.depreciationBreakdown.rows.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: idx < investorsData.dashboard.depreciationBreakdown.rows.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
                      <td style={{ padding: `clamp(8px, 1.2vw, 12px)` }}>
                        <div>
                          <div style={{ fontSize: `clamp(12px, 1.3vw, 14px)`, fontWeight: 600, color: '#0F172A', marginBottom: `clamp(2px, 0.3vh, 2px)`, lineHeight: 1.3, wordBreak: 'break-word' }}>{row.property}</div>
                          <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B', lineHeight: 1.3 }}>{row.propertyId}</div>
                        </div>
                      </td>
                      <td style={{ padding: `clamp(8px, 1.2vw, 12px)`, textAlign: 'right', fontSize: `clamp(12px, 1.3vw, 14px)`, color: '#0F172A', fontWeight: 500 }}>
                        {row.annualDepreciation}
                      </td>
                      <td style={{ padding: `clamp(8px, 1.2vw, 12px)`, textAlign: 'right', fontSize: `clamp(12px, 1.3vw, 14px)`, color: '#0F172A', fontWeight: 500 }}>
                        {row.cumulativeDepreciation}
                      </td>
                      <td style={{ padding: `clamp(8px, 1.2vw, 12px)`, textAlign: 'right', fontSize: `clamp(12px, 1.3vw, 14px)`, color: row.ownership === '--' ? '#64748B' : '#0F172A' }}>
                        {row.ownership}
                      </td>
                      <td style={{ padding: `clamp(8px, 1.2vw, 12px)`, textAlign: 'center', fontSize: `clamp(12px, 1.3vw, 14px)`, color: '#0F172A' }}>
                        {row.taxYear}
                      </td>
                      <td style={{ padding: `clamp(8px, 1.2vw, 12px)`, textAlign: 'center' }}>
                        <button style={{
                          fontSize: `clamp(12px, 1.3vw, 14px)`,
                          color: '#1E3A5F',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 500,
                          whiteSpace: 'nowrap'
                        }}>
                          {row.actionText}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Returns Summary - Full Width */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: `clamp(14px, 1.8vw, 20px)`,
            borderRadius: `clamp(6px, 0.8vw, 8px)`,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            marginTop: `clamp(16px, 2vh, 24px)`,
            marginBottom: `clamp(16px, 2vh, 24px)`
          }}>
            <h2 style={{ fontSize: `clamp(15px, 1.8vw, 18px)`, fontWeight: 600, color: '#0F172A', marginBottom: `clamp(16px, 2vh, 20px)` }}>{investorsData.dashboard.returnsSummary.title}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: `clamp(8px, 1.5vw, 16px)` }}>
              {investorsData.dashboard.returnsSummary.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: `clamp(12px, 1.5vw, 16px)`,
                    backgroundColor: '#F8FAFC',
                    borderRadius: `clamp(4px, 0.5vw, 6px)`,
                    border: '1px solid #E2E8F0',
                    minWidth: 0,
                    width: '100%'
                  }}
                >
                  <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B', marginBottom: `clamp(6px, 1vh, 8px)`, lineHeight: 1.3 }}>{item.label}</div>
                  <div style={{ fontSize: `clamp(18px, 2.5vw, 24px)`, fontWeight: 700, color: item.valueColor, marginBottom: `clamp(3px, 0.5vh, 4px)`, lineHeight: 1.2 }}>{item.value}</div>
                  <div style={{ fontSize: `clamp(9px, 1vw, 11px)`, color: '#64748B', lineHeight: 1.3 }}>{item.description}</div>
                  {item.formula && (
                    <div style={{ fontSize: `clamp(8px, 0.9vw, 10px)`, color: '#64748B', marginTop: `clamp(3px, 0.5vh, 4px)`, fontStyle: 'italic', lineHeight: 1.3 }}>{item.formula}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section - Grid Layout: Recent Transactions and Quick Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '2fr 1fr',
            gap: `clamp(12px, 2vw, 24px)`,
            marginBottom: `clamp(16px, 2vh, 24px)`,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            {/* Left Column - Recent Transactions */}
            <div>
              {/* Recent Transactions */}
              <div style={{
                backgroundColor: '#FFFFFF',
                padding: `clamp(14px, 1.8vw, 20px)`,
                borderRadius: `clamp(6px, 0.8vw, 8px)`,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: `clamp(16px, 2vh, 20px)`, flexWrap: 'wrap', gap: `clamp(8px, 1vw, 12px)` }}>
                  <h2 style={{ fontSize: `clamp(15px, 1.8vw, 18px)`, fontWeight: 600, color: '#0F172A', margin: 0, flexShrink: 0 }}>{investorsData.dashboard.recentTransactions.title}</h2>
                  <Link to="/investor/transactions" style={{
                    fontSize: `clamp(12px, 1.3vw, 14px)`,
                    color: '#1E3A5F',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    textDecoration: 'none'
                  }}>
                    View All
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: `clamp(10px, 1.5vw, 12px)` }}>
                  {investorsData.dashboard.recentTransactions.items.map((transaction) => {
                    const IconComponent = iconMap[transaction.icon] || Building2;
                    return (
                      <div
                        key={transaction.id}
                        style={{
                          padding: `clamp(12px, 1.5vw, 16px)`,
                          backgroundColor: '#F8FAFC',
                          borderRadius: `clamp(4px, 0.5vw, 6px)`,
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: isMobile ? 'wrap' : 'nowrap',
                          gap: `clamp(10px, 1.5vw, 12px)`
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(10px, 1.5vw, 12px)`, flex: 1, minWidth: 0 }}>
                          <div style={{
                            width: `clamp(32px, 4vw, 40px)`,
                            height: `clamp(32px, 4vw, 40px)`,
                            borderRadius: `clamp(6px, 0.8vw, 8px)`,
                            backgroundColor: transaction.iconBgColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <IconComponent style={{ width: `clamp(16px, 2vw, 20px)`, height: `clamp(16px, 2vw, 20px)`, color: transaction.iconColor }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: `clamp(12px, 1.3vw, 14px)`, fontWeight: 600, color: '#0F172A', marginBottom: `clamp(2px, 0.3vh, 2px)`, lineHeight: 1.3, wordBreak: 'break-word' }}>{transaction.type}</div>
                            <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B', lineHeight: 1.3 }}>{transaction.details}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: `clamp(14px, 1.8vw, 16px)`, fontWeight: 700, color: transaction.amountColor, marginBottom: `clamp(2px, 0.3vh, 2px)`, lineHeight: 1.2 }}>{transaction.amount}</div>
                          <span style={{
                            fontSize: `clamp(10px, 1.1vw, 11px)`,
                            padding: `clamp(3px, 0.5vh, 4px) clamp(6px, 1vw, 8px)`,
                            borderRadius: '12px',
                            backgroundColor: transaction.statusBgColor,
                            color: transaction.statusColor,
                            fontWeight: 500,
                            whiteSpace: 'nowrap'
                          }}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Quick Actions */}
            <div>
              {/* Quick Actions */}
              <div style={{
                backgroundColor: '#FFFFFF',
                padding: `clamp(14px, 1.8vw, 20px)`,
                borderRadius: `clamp(6px, 0.8vw, 8px)`,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}>
                <h2 style={{ fontSize: `clamp(15px, 1.8vw, 18px)`, fontWeight: 600, color: '#0F172A', marginBottom: `clamp(16px, 2vh, 20px)` }}>{investorsData.dashboard.quickActions.title}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `clamp(10px, 1.5vw, 12px)` }}>
                  {investorsData.dashboard.quickActions.items.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        if (action.id === 'make-deposit') {
                          // navigate('/investor/deposit'); // Placeholder for future deposit modal/page
                        } else if (action.id === 'browse-properties') {
                          navigate('/investor/properties');
                        } else if (action.id === 'browse-funds') {
                          navigate('/investor/funds');
                        } else if (action.id === 'view-documents') {
                          navigate('/investor/documents');
                        } else if (action.id === 'tax-documents') {
                          navigate('/investor/documents'); // Could navigate to a specific tax documents view
                        }
                      }}
                      style={{
                        backgroundColor: action.type === 'primary' ? '#1E3A5F' : '#FFFFFF',
                        color: action.type === 'primary' ? '#FFFFFF' : '#0F172A',
                        padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 1.5vw, 16px)`,
                        borderRadius: `clamp(4px, 0.5vw, 6px)`,
                        border: action.type === 'primary' ? 'none' : '1px solid #E2E8F0',
                        fontSize: `clamp(12px, 1.3vw, 14px)`,
                        fontWeight: 500,
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      {action.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Performance - Full Width Below Grid */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: `clamp(14px, 1.8vw, 20px)`,
            borderRadius: `clamp(6px, 0.8vw, 8px)`,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            marginBottom: `clamp(16px, 2vh, 24px)`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: `clamp(16px, 2vh, 20px)`, flexWrap: 'wrap', gap: `clamp(8px, 1vw, 12px)` }}>
              <h2 style={{ fontSize: `clamp(15px, 1.8vw, 18px)`, fontWeight: 600, color: '#0F172A', margin: 0, flexShrink: 0 }}>{investorsData.dashboard.portfolioPerformance.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(6px, 1vw, 8px)`, flexWrap: 'wrap' }}>
                {investorsData.dashboard.portfolioPerformance.periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    style={{
                      fontSize: `clamp(10px, 1.1vw, 12px)`,
                      fontWeight: selectedPeriod === period ? 600 : 500,
                      color: selectedPeriod === period ? '#1E3A5F' : '#64748B',
                      backgroundColor: selectedPeriod === period ? '#EFF6FF' : 'transparent',
                      border: 'none',
                      padding: `clamp(5px, 0.8vh, 6px) clamp(10px, 1.3vw, 12px)`,
                      borderRadius: `clamp(4px, 0.5vw, 6px)`,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(12px, 2vw, 20px)`, marginBottom: `clamp(16px, 2vh, 20px)`, flexWrap: 'wrap' }}>
              {investorsData.dashboard.portfolioPerformance.legend.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: `clamp(6px, 1vw, 8px)` }}>
                  <div style={{
                    width: `clamp(14px, 1.8vw, 16px)`,
                    height: '2px',
                    backgroundColor: item.style === 'solid' ? item.color : 'transparent',
                    borderTop: item.style === 'dashed' ? `2px dashed ${item.color} ` : 'none'
                  }}></div>
                  <span style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Graph Area */}
            <div style={{
              height: `clamp(200px, 25vh, 250px)`,
              backgroundColor: '#F8FAFC',
              borderRadius: `clamp(4px, 0.5vw, 6px)`,
              border: '1px solid #E2E8F0',
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: `clamp(14px, 1.8vw, 20px)`
            }}>
              {/* Graph lines - placeholder visualization */}
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                position: 'relative'
              }}>
                {/* Portfolio Value Line (solid blue) */}
                <div style={{
                  position: 'absolute',
                  bottom: `clamp(14px, 1.8vw, 20px)`,
                  left: `clamp(14px, 1.8vw, 20px)`,
                  right: `clamp(14px, 1.8vw, 20px)`,
                  height: '2px',
                  backgroundColor: '#1E3A5F',
                  opacity: 0.3
                }}></div>
                {/* Depreciation Line (dashed gray) */}
                <div style={{
                  position: 'absolute',
                  bottom: `clamp(34px, 3.6vw, 40px)`,
                  left: `clamp(14px, 1.8vw, 20px)`,
                  right: `clamp(14px, 1.8vw, 20px)`,
                  height: '2px',
                  borderTop: '2px dashed #64748B',
                  opacity: 0.3
                }}></div>
                {/* Y-axis labels placeholder */}
                <div style={{
                  position: 'absolute',
                  left: `clamp(8px, 1vw, 10px)`,
                  top: `clamp(14px, 1.8vw, 20px)`,
                  bottom: `clamp(14px, 1.8vw, 20px)`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontSize: `clamp(8px, 0.9vw, 10px)`,
                  color: '#64748B'
                }}>
                  {investorsData.dashboard.portfolioPerformance.yAxisLabels.map((label, idx) => (
                    <span key={idx}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Drawer for Mobile/Tablet */}

      </div>
    </>
  );
}

