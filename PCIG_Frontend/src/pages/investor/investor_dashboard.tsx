
import { useState, useEffect } from 'react';
import {
  Building2,
  Coins,
  TrendingUp,
  DollarSign,
  Clock,
  Percent,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import InvestorNav from '../../components/investor/InvestorNav';
import InvestorsDocuments from './investors_documents';
import api from '../../services/api';

// Icon mapping
const iconMap: { [key: string]: any } = {
  Building2,
  Coins,
  TrendingUp,
  DollarSign,
  Clock,
  Percent,
};

// Types
interface DashboardData {
  total_investment_value: number;
  active_properties_count: number;
  ytd_returns: number;
  all_time_returns: number;
  pending_distributions: number;
  available_cash: number;
  property_investments: PropertyInvestment[];
  fund_investments: FundInvestment[];
  depreciation_breakdown: any[];
}

interface PropertyInvestment {
  id: number;
  name: string;
  details: string;
  status: string;
  statusBgColor: string;
  statusColor: string;
  currentValue: string;
  interest: string;
  interestColor: string;
  depreciation: string;
  depreciationColor: string;
}

interface FundInvestment {
  id: number;
  name: string;
  details: string;
  currentValue: string;
  returns: string;
  returnsColor: string;
  depreciation: string;
  depreciationColor: string;
}

// Static content for headers/labels
const staticContent = {
  header: {
    title: 'Investor Dashboard',
    subtitle: 'Welcome back, Investor'
  },
  propertyInvestments: {
    title: 'Property Investments',
    viewMoreText: 'View All'
  },
  fundInvestments: {
    title: 'Fund Investments',
    viewMoreText: 'View All'
  },
  depreciationBreakdown: {
    title: 'Depreciation Breakdown',
    subtitle: 'Annual and cumulative depreciation for your portfolio',
    columns: ['Property', 'Annual Depreciation', 'Cumulative', 'Ownership %', 'Schedule', 'K-1 Status']
  }
};

export default function InvestorDashboard() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [activeDepreciationTab, setActiveDepreciationTab] = useState<string>('2025');
  const [availableYears, setAvailableYears] = useState<string[]>(['2025']);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/investor/dashboard-data');
        if (response.data.success) {
          const data = response.data.data;
          setDashboardData(data);
          
          // Extract unique years from depreciation breakdown and sort descending
          if (data.depreciation_breakdown && data.depreciation_breakdown.length > 0) {
            const years = Array.from(new Set(data.depreciation_breakdown.map((item: any) => item.year)))
              .sort((a: any, b: any) => b - a) as string[];
            
            if (years.length > 0) {
              setAvailableYears(years);
              // Set active tab to most recent year if current active tab is not in list
              if (!years.includes(activeDepreciationTab)) {
                setActiveDepreciationTab(years[0]);
              }
            }
          }
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Construct overview cards from data
  const getOverviewCards = () => {
    if (!dashboardData) return [];

    return [
      {
        id: 'total-investment',
        label: 'Total Investment Value',
        value: formatCurrency(dashboardData.total_investment_value),
        icon: 'Building2',
        iconBgColor: '#EFF6FF',
        iconColor: '#3B82F6',
        change: '+12.5% from last month',
        changeColor: '#10B981'
      },
      {
        id: 'active-properties',
        label: 'Active Properties',
        value: dashboardData.active_properties_count.toString(),
        icon: 'Coins',
        iconBgColor: '#F0FDF4',
        iconColor: '#10B981',
        subtext: 'Across 4 states'
      },
      {
        id: 'ytd-returns',
        label: 'YTD Returns',
        value: formatCurrency(dashboardData.ytd_returns),
        icon: 'TrendingUp',
        iconBgColor: '#FEF3C7',
        iconColor: '#F59E0B',
        change: '+8.2% vs last year',
        changeColor: '#10B981'
      },
      {
        id: 'all-time-returns',
        label: 'All-Time Returns',
        value: formatCurrency(dashboardData.all_time_returns),
        icon: 'DollarSign',
        iconBgColor: '#F5F3FF',
        iconColor: '#8B5CF6',
        subtext: 'Since inception'
      },
      {
        id: 'pending-distributions',
        label: 'Pending Distributions',
        value: formatCurrency(dashboardData.pending_distributions),
        icon: 'Clock',
        iconBgColor: '#FFF7ED',
        iconColor: '#F97316',
        subtext: 'Expected within 30 days'
      },
      {
        id: 'available-cash',
        label: 'Available Cash',
        value: formatCurrency(dashboardData.available_cash),
        icon: 'Percent',
        iconBgColor: '#ECFEFF',
        iconColor: '#06B6D4',
        subtext: 'Ready to invest'
      }
    ];
  };

  const overviewCards = getOverviewCards();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#F8FAFC'
      }}>
        <Loader2 className="animate-spin" style={{ width: 48, height: 48, color: '#3B82F6' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '24px', 
        textAlign: 'center', 
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <AlertCircle style={{ width: 48, height: 48, color: '#EF4444', marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1F2937', marginBottom: 8 }}>Error Loading Dashboard</h2>
        <p style={{ color: '#6B7280' }}>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: 16,
            padding: '8px 16px',
            backgroundColor: '#3B82F6',
            color: 'white',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const renderCard = (card: any) => {
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
        <div style={{ fontSize: `clamp(18px, 2.5vw, 24px)`, fontWeight: 700, color: '#0F172A', marginBottom: `clamp(3px, 0.5vh, 4px)`, lineHeight: 1.2 }}>{card.value}</div>
        {card.change && (
          <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: card.changeColor || '#64748B', fontWeight: 500, lineHeight: 1.3 }}>{card.change}</div>
        )}
        {card.subtext && (
          <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B', lineHeight: 1.3 }}>{card.subtext}</div>
        )}
      </div>
    );
  };

  const renderInvestments = () => (
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
          <h2 style={{ fontSize: `clamp(15px, 1.8vw, 18px)`, fontWeight: 600, color: '#0F172A', margin: 0, flexShrink: 0 }}>{staticContent.propertyInvestments.title}</h2>
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
          {dashboardData?.property_investments.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
              No active property investments.
            </div>
          ) : (
            dashboardData?.property_investments.map((property) => (
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
            ))
          )}
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
          <h2 style={{ fontSize: `clamp(15px, 1.8vw, 18px)`, fontWeight: 600, color: '#0F172A', margin: 0, flexShrink: 0 }}>{staticContent.fundInvestments.title}</h2>
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
          {dashboardData?.fund_investments.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
              No active fund investments.
            </div>
          ) : (
            dashboardData?.fund_investments.map((fund) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );

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
              <h1 style={{ fontSize: `clamp(20px, 2.5vw, 28px)`, fontWeight: 700, color: '#0F172A', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: `clamp(4px, 0.5vh, 4px)`, lineHeight: 1.2 }}>{staticContent.header.title}</h1>
              <p style={{ fontSize: `clamp(11px, 1.2vw, 14px)`, color: '#64748B', margin: 0, lineHeight: 1.4 }}>{staticContent.header.subtitle}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(8px, 1.5vw, 12px)`, flexWrap: 'wrap' }}>
              <button 
                onClick={() => navigate('/investor/documents')}
                style={{
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
              <button 
                onClick={() => navigate('/investor/deposit')}
                style={{
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

          {/* Main Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '24px', 
            borderBottom: '1px solid #E2E8F0', 
            marginBottom: '24px',
            overflowX: 'auto'
          }}>
            {['Overview', 'Performance', 'Portfolio', 'Documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #1E3A5F' : '2px solid transparent',
                  color: activeTab === tab ? '#1E3A5F' : '#64748B',
                  fontWeight: activeTab === tab ? 600 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Overview' && (
            <>
              {/* Dashboard Overview - 6 Summary Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
                gap: `clamp(8px, 1.5vw, 16px)`,
                marginBottom: `clamp(16px, 2vh, 32px)`,
                width: '100%',
                gridAutoRows: '1fr'
              }}>
                {overviewCards.map(renderCard)}
              </div>

              {/* Property and Fund Investments Grid */}
              {renderInvestments()}

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
                  <h2 style={{ fontSize: `clamp(15px, 1.8vw, 18px)`, fontWeight: 600, color: '#0F172A', marginBottom: `clamp(3px, 0.5vh, 4px)`, lineHeight: 1.2 }}>{staticContent.depreciationBreakdown.title}</h2>
                  <p style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B', margin: 0, lineHeight: 1.4 }}>{staticContent.depreciationBreakdown.subtitle}</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(6px, 1vw, 8px)`, marginBottom: `clamp(16px, 2vh, 20px)`, borderBottom: '1px solid #E2E8F0', overflowX: 'auto', flexWrap: 'nowrap' }}>
                  {availableYears.map((tab) => (
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
                        {staticContent.depreciationBreakdown.columns.map((column, idx) => (
                          <th
                            key={column}
                            style={{
                              padding: `clamp(8px, 1.2vw, 12px)`,
                              textAlign: idx === 0 ? 'left' : idx === staticContent.depreciationBreakdown.columns.length - 2 || idx === staticContent.depreciationBreakdown.columns.length - 1 ? 'center' : 'right',
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
                      {/* Filter data based on active tab */}
                      {dashboardData?.depreciation_breakdown && dashboardData.depreciation_breakdown.filter((row: any) => row.year === activeDepreciationTab).length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
                            No depreciation data available for {activeDepreciationTab}.
                          </td>
                        </tr>
                      ) : (
                        dashboardData?.depreciation_breakdown
                          .filter((row: any) => row.year === activeDepreciationTab)
                          .map((row: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                            <td style={{ padding: `clamp(8px, 1.2vw, 12px)`, fontSize: `clamp(11px, 1.2vw, 14px)`, color: '#0F172A', fontWeight: 500 }}>
                                {row.property}
                            </td>
                            <td style={{ padding: `clamp(8px, 1.2vw, 12px)`, textAlign: 'right', fontSize: `clamp(11px, 1.2vw, 14px)`, color: '#64748B' }}>
                                {row.annual}
                            </td>
                            <td style={{ padding: `clamp(8px, 1.2vw, 12px)`, textAlign: 'right', fontSize: `clamp(11px, 1.2vw, 14px)`, color: '#64748B' }}>
                                {row.cumulative}
                            </td>
                            <td style={{ padding: `clamp(8px, 1.2vw, 12px)`, textAlign: 'right', fontSize: `clamp(11px, 1.2vw, 14px)`, color: '#64748B' }}>
                                {row.ownership}
                            </td>
                            <td style={{ padding: `clamp(8px, 1.2vw, 12px)`, textAlign: 'center', fontSize: `clamp(11px, 1.2vw, 14px)`, color: '#64748B' }}>
                                {row.schedule}
                            </td>
                            <td style={{ padding: `clamp(8px, 1.2vw, 12px)`, textAlign: 'center' }}>
                                <span style={{ 
                                    padding: '2px 8px', 
                                    borderRadius: '9999px', 
                                    fontSize: '12px', 
                                    fontWeight: 500,
                                    backgroundColor: row.k1_status === 'Ready' ? '#DCFCE7' : '#FEF3C7',
                                    color: row.k1_status === 'Ready' ? '#166534' : '#B45309'
                                }}>
                                    {row.k1_status}
                                </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Performance' && (
             <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
               {overviewCards.filter(c => ['ytd-returns', 'all-time-returns', 'total-investment', 'pending-distributions'].includes(c.id)).map(renderCard)}
            </div>
          )}

          {activeTab === 'Portfolio' && (
             renderInvestments()
          )}

          {activeTab === 'Documents' && (
            <InvestorsDocuments showNav={false} />
          )}

        </div>
      </div>
    </>
  );
}
