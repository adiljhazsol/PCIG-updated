import { useState, useEffect } from 'react';
import {
  Building2,
  Clock,
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  Calendar,
  DollarSign,
  Briefcase,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  X,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';
import InvestorNav from '../../components/investor/InvestorNav';

interface Fund {
  id: string;
  name: string;
  tag: string;
  tagColor: string;
  tagBgColor: string;
  targetIRR?: string;
  realizedIRR?: string;
  returnType: string;
  lockUpPeriod: string;
  minInvestment: string;
  fundSize: string;
  remainingCapacity: string;
  capacityPercent: number;
  capacityColor: string;
  riskProfile: string;
  riskLevel: number;
  riskMaxLevel: number;
  riskColor: string;
  status: string;
  button: { text: string; type: string };
  pricePerShare: number;
  description: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Icon mapping
const iconMap: { [key: string]: any } = {
  Building2,
  Clock
};

export default function FundsMarketplace() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const navigate = useNavigate();
  // const [drawerOpen, setDrawerOpen] = useState(false); // Unused
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter States
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [viewMode, setViewMode] = useState<string>('grid');
  
  // Pagination State
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  // Advanced Filter States
  const [minInvest, setMinInvest] = useState('');
  const [minIRR, setMinIRR] = useState('');
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Investment Modal State
  const [investmentModalOpen, setInvestmentModalOpen] = useState(false);
  const [selectedFundForInvestment, setSelectedFundForInvestment] = useState<Fund | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investmentStep, setInvestmentStep] = useState(1); // 1: Input, 2: Success


  const parseCurrency = (val: string | undefined) => parseFloat(val?.replace(/[^0-9.]/g, '') || '0');
  const parsePercentage = (val: string | undefined) => parseFloat(val?.replace(/[^0-9.]/g, '') || '0');

  // Helper to map API data to UI Fund interface
  const mapApiFundToUi = (apiFund: any): Fund => {
    // Determine tag based on name or description (Mock logic as backend doesn't have tag yet)
    let tag = 'Blended';
    if (apiFund.name.toLowerCase().includes('redemption')) tag = 'Redemption';
    else if (apiFund.name.toLowerCase().includes('auction')) tag = 'Auction';
    else if (apiFund.name.toLowerCase().includes('reo')) tag = 'REO';

    const tagColors: {[key: string]: {color: string, bg: string}} = {
      'Redemption': { color: 'text-blue-600', bg: 'bg-blue-50' },
      'Auction': { color: 'text-orange-600', bg: 'bg-orange-50' },
      'REO': { color: 'text-purple-600', bg: 'bg-purple-50' },
      'Blended': { color: 'text-emerald-600', bg: 'bg-emerald-50' }
    };

    const colors = tagColors[tag] || tagColors['Blended'];
    
    // Calculate capacity percent
    const capacityPercent = apiFund.total_shares > 0 
      ? Math.round(((apiFund.total_shares - apiFund.available_shares) / apiFund.total_shares) * 100) 
      : 0;
      
    let capacityColor = 'bg-blue-500';
    if (capacityPercent > 90) capacityColor = 'bg-red-500';
    else if (capacityPercent > 75) capacityColor = 'bg-orange-500';

    return {
      id: apiFund.id.toString(),
      name: apiFund.name,
      tag: tag,
      tagColor: colors.color,
      tagBgColor: colors.bg,
      targetIRR: '12-15%', // Mock data
      realizedIRR: 'N/A', // Mock data
      returnType: 'Quarterly', // Mock data
      lockUpPeriod: '12 Months', // Mock data
      minInvestment: `$${new Intl.NumberFormat('en-US').format(apiFund.min_investment)}`,
      fundSize: `$${new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(apiFund.total_assets)}`,
      remainingCapacity: `$${new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(apiFund.available_shares * apiFund.price_per_share)}`,
      capacityPercent: capacityPercent,
      capacityColor: capacityColor,
      riskProfile: 'Moderate', // Mock data
      riskLevel: 3, // Mock data
      riskMaxLevel: 5, // Mock data
      riskColor: 'bg-yellow-500', // Mock data
      status: apiFund.status,
      button: { text: 'View Details', type: 'primary' },
      pricePerShare: apiFund.price_per_share,
      description: apiFund.description || ''
    };
  };

  const fetchFunds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      if (searchQuery) params.search = searchQuery;
      if (minInvest) params.max_min_investment = minInvest.replace(/[^0-9.]/g, '');

      const response = await api.get('/investor/funds', { params });

      if (response.data.success) {
        const mappedFunds = response.data.data.map(mapApiFundToUi);
        setFunds(mappedFunds);
        setPagination({
          current_page: response.data.meta.current_page,
          last_page: response.data.meta.last_page,
          per_page: response.data.meta.per_page,
          total: response.data.meta.total
        });
      } else {
        setError('Failed to load funds');
      }
    } catch (err) {
      console.error('Error fetching funds:', err);
      setError('Failed to load funds. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunds();
  }, [pagination.current_page, sortBy, sortOrder, minInvest]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.current_page !== 1) {
        setPagination(prev => ({ ...prev, current_page: 1 }));
      } else {
        fetchFunds();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter funds client-side for unsupported filters (e.g. Tag, MinIRR)
  // Note: ideally these should be server-side, but for now we filter the displayed list if needed.
  // However, since we are paging, client-side filtering on a single page is weird.
  // For 'Tag' filter (activeFilter), we can probably map it to a search term or add backend support later.
  // For now, let's just filter the *fetched* funds, which is imperfect but safe.
  const displayedFunds = funds.filter(fund => {
    // Tag Filter
    if (activeFilter !== 'All') {
      if (activeFilter === 'Redemption Fund' && fund.tag !== 'Redemption') return false;
      if (activeFilter === 'Auction Fund' && fund.tag !== 'Auction') return false;
      if (activeFilter === 'REO Fund' && fund.tag !== 'REO') return false;
      if (activeFilter === 'Blended Fund' && fund.tag !== 'Blended') return false;
    }
    
    // Min IRR Filter (Mock check since IRR is mock)
    if (minIRR) {
       // Just pass for now as IRR is mocked
    }
    
    return true;
  });

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setPagination(prev => ({ ...prev, current_page: newPage }));
      window.scrollTo(0, 0);
    }
  };

  // Static Content
  const staticContent = {
    investYourCapital: {
      title: "Invest Your Capital",
      subtitle: "Choose from our curated selection of high-yield investment opportunities.",
      options: [
        {
          id: "individual-properties",
          title: "Individual Properties",
          description: "Browse and invest in specific tax deed and foreclosure properties with detailed due diligence reports.",
          icon: "Building2",
          buttonText: "View Properties",
          buttonType: "secondary"
        },
        {
          id: "diversified-funds",
          title: "Diversified Funds",
          description: "Invest in professionally managed funds that pool capital across multiple high-performing assets.",
          icon: "Clock",
          buttonText: "View Funds",
          buttonType: "primary"
        }
      ]
    },
    funds: {
      title: "Available Funds",
      subtitle: "Explore our professionally managed investment funds.",
      searchPlaceholder: "Search funds...",
      filters: ["All", "Redemption Fund", "Auction Fund", "REO Fund", "Blended Fund"],
      sortOptions: ["Highest Target IRR", "Lowest Target IRR", "Highest Min. Investment", "Lowest Min. Investment", "Newest", "Oldest"]
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
          {/* Invest Your Capital Section */}
          <div style={{ marginBottom: `clamp(24px, 3vh, 32px)` }}>
            <div style={{ marginBottom: `clamp(16px, 2vh, 20px)` }}>
              <h2 style={{ fontSize: `clamp(18px, 2.2vw, 24px)`, fontWeight: 600, color: '#0F172A', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: `clamp(4px, 0.5vh, 6px)` }}>{staticContent.investYourCapital.title}</h2>
              <p style={{ fontSize: `clamp(12px, 1.3vw, 14px)`, color: '#64748B', margin: 0 }}>{staticContent.investYourCapital.subtitle}</p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : 'repeat(2, 1fr)',
              gap: `clamp(16px, 2vw, 24px)`
            }}>
              {staticContent.investYourCapital.options.map((option) => {
                const IconComponent = iconMap[option.icon] || Building2;
                return (
                  <div
                    key={option.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      padding: `clamp(20px, 2.5vw, 32px)`,
                      borderRadius: `clamp(8px, 1vw, 12px)`,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{
                      width: `clamp(40px, 5vw, 48px)`,
                      height: `clamp(40px, 5vw, 48px)`,
                      borderRadius: `clamp(8px, 1vw, 10px)`,
                      backgroundColor: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: `clamp(16px, 2vh, 20px)`
                    }}>
                      <IconComponent style={{ width: `clamp(24px, 3vw, 32px)`, height: `clamp(24px, 3vw, 32px)`, color: '#1E3A5F' }} />
                    </div>
                    <h3 style={{ fontSize: `clamp(16px, 2vw, 20px)`, fontWeight: 600, color: '#0F172A', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: `clamp(8px, 1vh, 12px)` }}>{option.title}</h3>
                    <p style={{ fontSize: `clamp(13px, 1.4vw, 15px)`, color: '#64748B', marginBottom: `clamp(16px, 2vh, 24px)`, lineHeight: 1.5, flex: 1 }}>{option.description}</p>
                    <button
                      onClick={() => {
                        if (option.id === 'individual-properties') {
                          navigate('/investor/properties');
                        } else if (option.id === 'diversified-funds') {
                          navigate('/investor/funds');
                        }
                      }}
                      style={{
                        backgroundColor: option.buttonType === 'primary' ? '#1E3A5F' : '#FFFFFF',
                        color: option.buttonType === 'primary' ? '#FFFFFF' : '#0F172A',
                        padding: `clamp(10px, 1.5vh, 12px) clamp(16px, 2vw, 24px)`,
                        borderRadius: `clamp(6px, 0.8vw, 8px)`,
                        border: option.buttonType === 'primary' ? 'none' : '1px solid #E2E8F0',
                        fontSize: `clamp(12px, 1.3vw, 14px)`,
                        fontWeight: 500,
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        width: '100%',
                        maxWidth: '400px'
                      }}
                    >
                      {option.buttonText}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Funds Section */}
          <div>
            {/* Section Header */}
            <div style={{ marginBottom: `clamp(16px, 2vh, 24px)` }}>
              <h2 style={{ fontSize: `clamp(20px, 2.5vw, 28px)`, fontWeight: 600, color: '#0F172A', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: `clamp(4px, 0.5vh, 6px)` }}>{staticContent.funds.title}</h2>
              <p style={{ fontSize: `clamp(13px, 1.4vw, 15px)`, color: '#64748B', margin: 0 }}>{staticContent.funds.subtitle}</p>
            </div>

            {/* Search and Filter Bar */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: `clamp(12px, 1.5vw, 16px)`,
              marginBottom: `clamp(16px, 2vh, 20px)`,
              flexWrap: 'wrap'
            }}>
              {/* Search Input */}
              <div style={{
                position: 'relative',
                flex: isMobile ? '0 1 auto' : '1 1 300px',
                width: isMobile ? '100%' : 'auto',
                minWidth: isMobile ? 'auto' : '250px',
                maxWidth: isMobile ? '100%' : '600px'
              }}>
                <Search style={{
                  position: 'absolute',
                  left: `clamp(12px, 1.5vw, 16px)`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: `clamp(16px, 2vw, 20px)`,
                  height: `clamp(16px, 2vw, 20px)`,
                  color: '#64748B'
                }} />
                <input
                  type="text"
                  placeholder={staticContent.funds.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(10px, 1.2vh, 12px) clamp(10px, 1.2vh, 12px) clamp(40px, 5vw, 48px)`,
                    fontSize: `clamp(13px, 1.4vw, 15px)`,
                    border: '1px solid #E2E8F0',
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Advanced Filters Button */}
              <button
                onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: `clamp(6px, 0.8vw, 8px)`,
                  padding: `clamp(10px, 1.2vh, 12px) clamp(16px, 2vw, 20px)`,
                  backgroundColor: advancedFiltersOpen ? '#EFF6FF' : '#FFFFFF',
                  border: advancedFiltersOpen ? '1px solid #1E3A5F' : '1px solid #E2E8F0',
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  fontSize: `clamp(13px, 1.4vw, 15px)`,
                  fontWeight: 500,
                  color: advancedFiltersOpen ? '#1E3A5F' : '#0F172A',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center'
                }}
              >
                Advanced Filters
                <ChevronDown style={{ 
                  width: `clamp(16px, 1.8vw, 18px)`, 
                  height: `clamp(16px, 1.8vw, 18px)`,
                  transform: advancedFiltersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} />
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {advancedFiltersOpen && (
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr) auto',
                gap: '16px',
                alignItems: 'end',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                    Min Investment ($)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={minInvest}
                    onChange={(e) => setMinInvest(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                    Min Target IRR (%)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    value={minIRR}
                    onChange={(e) => setMinIRR(e.target.value)}
                    style={{
                      width: '100%',

                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                   {/* Spacer */}
                </div>
                <button
                  onClick={() => {
                    setMinInvest('');
                    setMinIRR('');
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#F1F5F9',
                    color: '#64748B',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    height: '38px'
                  }}
                >
                  Reset
                </button>
              </div>
            )}

            {/* Filter Buttons */}
            <div
              className="filter-buttons-scroll"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(8px, 1.2vw, 12px)`,
                marginBottom: `clamp(16px, 2vh, 20px)`,
                flexWrap: isMobile ? 'nowrap' : 'wrap',
                width: isMobile ? '100%' : 'auto',
                overflowX: isMobile ? 'auto' : 'visible',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: isMobile ? '4px' : '0'
              }}
            >
              {staticContent.funds.filters.map((filter) => (
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

            {/* Display Options and Sort */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              justifyContent: isMobile ? 'flex-start' : 'space-between',
              marginBottom: `clamp(16px, 2vh, 20px)`,
              flexWrap: 'wrap',
              gap: `clamp(12px, 1.5vw, 16px)`
            }}>
              {/* View Mode Icons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(4px, 0.5vw, 6px)`,
                backgroundColor: '#F1F5F9',
                padding: '4px',
                borderRadius: `clamp(6px, 0.8vw, 8px)`,
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'center' : 'flex-start'
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: `clamp(6px, 0.8vh, 8px)`,
                    backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    borderRadius: `clamp(4px, 0.5vw, 6px)`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <LayoutGrid style={{ width: `clamp(16px, 2vw, 18px)`, height: `clamp(16px, 2vw, 18px)`, color: viewMode === 'grid' ? '#1E3A5F' : '#64748B' }} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: `clamp(6px, 0.8vh, 8px)`,
                    backgroundColor: viewMode === 'list' ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    borderRadius: `clamp(4px, 0.5vw, 6px)`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <List style={{ width: `clamp(16px, 2vw, 18px)`, height: `clamp(16px, 2vw, 18px)`, color: viewMode === 'list' ? '#1E3A5F' : '#64748B' }} />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div style={{ position: 'relative', flex: isMobile ? 1 : '0 1 auto', minWidth: isMobile ? '0' : 'auto' }}>
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: `clamp(6px, 1vw, 8px)`,
                    padding: `clamp(6px, 1vh, 8px) clamp(10px, 1.3vw, 12px)`,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    fontSize: `clamp(12px, 1.3vw, 14px)`,
                    color: '#64748B',
                    cursor: 'pointer',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap' }}>Sort by: {sortBy}</span>
                  <ChevronDown style={{
                    width: `clamp(14px, 1.6vw, 16px)`,
                    height: `clamp(14px, 1.6vw, 16px)`,
                    flexShrink: 0,
                    transform: showSortMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} />
                </button>

                {/* Dropdown Menu */}
                {showSortMenu && (
                  <>
                    <div
                      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
                      onClick={() => setShowSortMenu(false)}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '4px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      zIndex: 20,
                      minWidth: '160px',
                      overflow: 'hidden'
                    }}>
                      {staticContent.funds.sortOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setShowSortMenu(false);
                          }}
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            padding: '10px 16px',
                            border: 'none',
                            backgroundColor: sortBy === option ? '#EFF6FF' : '#FFFFFF',
                            color: sortBy === option ? '#1E3A5F' : '#64748B',
                            fontWeight: sortBy === option ? 600 : 400,
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Fund Count */}
              <div style={{
                fontSize: `clamp(12px, 1.3vw, 14px)`,
                color: '#64748B',
                whiteSpace: isMobile ? 'normal' : 'nowrap',
                textAlign: isMobile ? 'center' : 'left',
                width: isMobile ? '100%' : 'auto'
              }}>
                Showing {pagination.per_page * (pagination.current_page - 1) + 1} - {Math.min(pagination.per_page * pagination.current_page, pagination.total)} of {pagination.total} funds
              </div>
            </div>

            {/* Funds Grid View */}
            {viewMode === 'grid' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: `clamp(16px, 2vw, 24px)`,
                marginBottom: `clamp(24px, 3vh, 32px)`
              }}>
                {displayedFunds.map((fund) => (
                  <div
                    key={fund.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      padding: `clamp(16px, 2vw, 24px)`,
                      borderRadius: `clamp(8px, 1vw, 12px)`,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Tag and Fund Name */}
                    <div style={{ marginBottom: `clamp(16px, 2vh, 20px)` }}>
                      <span style={{
                        display: 'inline-block',
                        padding: `clamp(4px, 0.5vh, 6px) clamp(10px, 1.3vw, 12px)`,
                        fontSize: `clamp(11px, 1.2vw, 12px)`,
                        fontWeight: 500,
                        color: fund.tagColor,
                        backgroundColor: fund.tagBgColor,
                        borderRadius: `clamp(12px, 1.5vw, 16px)`,
                        marginBottom: `clamp(12px, 1.5vh, 16px)`
                      }}>
                        {fund.tag}
                      </span>
                      <div style={{ fontSize: `clamp(14px, 1.6vw, 16px)`, fontWeight: 600, color: '#0F172A', lineHeight: 1.4 }}>
                        {fund.name} ({fund.id})
                      </div>
                    </div>

                    {/* IRR */}
                    <div style={{ marginBottom: `clamp(16px, 2vh, 20px)` }}>
                      <div style={{ fontSize: `clamp(28px, 3.5vw, 32px)`, fontWeight: 700, color: '#0F172A', marginBottom: `clamp(4px, 0.5vh, 6px)`, lineHeight: 1.2 }}>
                        {fund.targetIRR || fund.realizedIRR}
                      </div>
                      <div style={{ fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B' }}>
                        {fund.returnType}
                      </div>
                    </div>

                    {/* Details */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: `clamp(12px, 1.5vh, 16px)`,
                      marginBottom: `clamp(16px, 2vh, 20px)`,
                      flex: 1
                    }}>
                      {/* Lock-Up Period */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(8px, 1vw, 10px)` }}>
                        <Calendar style={{ width: `clamp(16px, 2vw, 18px)`, height: `clamp(16px, 2vw, 18px)`, color: '#64748B', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: `clamp(12px, 1.3vw, 13px)`, fontWeight: 500, color: '#0F172A' }}>Lock-Up Period</div>
                          <div style={{ fontSize: `clamp(11px, 1.2vw, 12px)`, color: '#64748B' }}>{fund.lockUpPeriod}</div>
                        </div>
                      </div>

                      {/* Min. Investment */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(8px, 1vw, 10px)` }}>
                        <DollarSign style={{ width: `clamp(16px, 2vw, 18px)`, height: `clamp(16px, 2vw, 18px)`, color: '#64748B', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: `clamp(12px, 1.3vw, 13px)`, fontWeight: 500, color: '#0F172A' }}>Min. Investment</div>
                          <div style={{ fontSize: `clamp(11px, 1.2vw, 12px)`, color: '#64748B' }}>{fund.minInvestment}</div>
                        </div>
                      </div>

                      {/* Fund Size */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(8px, 1vw, 10px)` }}>
                        <Briefcase style={{ width: `clamp(16px, 2vw, 18px)`, height: `clamp(16px, 2vw, 18px)`, color: '#64748B', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: `clamp(12px, 1.3vw, 13px)`, fontWeight: 500, color: '#0F172A' }}>Fund Size</div>
                          <div style={{ fontSize: `clamp(11px, 1.2vw, 12px)`, color: '#64748B' }}>{fund.fundSize}</div>
                        </div>
                      </div>

                      {/* Remaining Capacity */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(8px, 1vw, 10px)` }}>
                        <DollarSign style={{ width: `clamp(16px, 2vw, 18px)`, height: `clamp(16px, 2vw, 18px)`, color: '#64748B', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: `clamp(12px, 1.3vw, 13px)`, fontWeight: 500, color: '#0F172A', marginBottom: `clamp(4px, 0.5vh, 6px)` }}>Remaining Capacity</div>
                          <div style={{ fontSize: `clamp(11px, 1.2vw, 12px)`, color: '#64748B', marginBottom: `clamp(6px, 0.8vh, 8px)` }}>{fund.remainingCapacity}</div>
                          {/* Progress Bar */}
                          <div style={{
                            width: '100%',
                            height: `clamp(6px, 0.8vh, 8px)`,
                            backgroundColor: '#E2E8F0',
                            borderRadius: `clamp(3px, 0.4vw, 4px)`,
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${fund.capacityPercent}%`,
                              height: '100%',
                              backgroundColor: fund.capacityColor,
                              borderRadius: `clamp(3px, 0.4vw, 4px)`,
                              transition: 'width 0.3s ease'
                            }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Risk Profile */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(8px, 1vw, 10px)` }}>
                        <TrendingUp style={{ width: `clamp(16px, 2vw, 18px)`, height: `clamp(16px, 2vw, 18px)`, color: '#64748B', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: `clamp(12px, 1.3vw, 13px)`, fontWeight: 500, color: '#0F172A', marginBottom: `clamp(6px, 0.8vh, 8px)` }}>Risk Profile</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(4px, 0.5vw, 6px)` }}>
                            <span style={{ fontSize: `clamp(11px, 1.2vw, 12px)`, color: '#64748B', marginRight: `clamp(4px, 0.5vw, 6px)` }}>{fund.riskProfile}</span>
                            {Array.from({ length: fund.riskMaxLevel }).map((_, idx) => (
                              <div
                                key={idx}
                                style={{
                                  width: `clamp(10px, 1.2vw, 12px)`,
                                  height: `clamp(10px, 1.2vw, 12px)`,
                                  borderRadius: '2px',
                                  backgroundColor: idx < fund.riskLevel ? fund.riskColor : '#E2E8F0'
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Button */}
                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/investor/funds/${fund.id}`);
                        }}
                        style={{
                          flex: 1,
                          padding: `clamp(10px, 1.2vh, 12px) clamp(16px, 2vw, 20px)`,
                          fontSize: `clamp(13px, 1.4vw, 14px)`,
                          fontWeight: 500,
                          color: '#1E3A5F',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #1E3A5F',
                          borderRadius: `clamp(6px, 0.8vw, 8px)`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFundForInvestment(fund);
                          setInvestmentStep(1);
                          setInvestmentAmount('');
                          setInvestmentModalOpen(true);
                        }}
                        style={{
                          flex: 1,
                          padding: `clamp(10px, 1.2vh, 12px) clamp(16px, 2vw, 20px)`,
                          fontSize: `clamp(13px, 1.4vw, 14px)`,
                          fontWeight: 500,
                          color: '#FFFFFF',
                          backgroundColor: '#1E3A5F',
                          border: 'none',
                          borderRadius: `clamp(6px, 0.8vw, 8px)`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Invest
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Funds Table View */}
            {viewMode === 'list' && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: `clamp(8px, 1vw, 12px)`,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                overflowX: 'auto',
                marginBottom: `clamp(24px, 3vh, 32px)`
              }}>
                {!isMobile ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fund Name</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tag</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>IRR</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lock-Up</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'right', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Min. Investment</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'right', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fund Size</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Capacity</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Risk</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'center', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'center', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedFunds.map((fund, index) => (
                        <tr
                          key={fund.id}
                          style={{
                            borderBottom: index < displayedFunds.length - 1 ? '1px solid #E2E8F0' : 'none'
                          }}
                        >
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#0F172A', fontWeight: 500 }}>{fund.id}</td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#0F172A', fontWeight: 500 }}>{fund.name}</td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)` }}>
                            <span style={{
                              display: 'inline-block',
                              padding: `clamp(4px, 0.5vh, 6px) clamp(10px, 1.3vw, 12px)`,
                              fontSize: `clamp(11px, 1.2vw, 12px)`,
                              fontWeight: 500,
                              color: fund.tagColor,
                              backgroundColor: fund.tagBgColor,
                              borderRadius: `clamp(12px, 1.5vw, 16px)`,
                              whiteSpace: 'nowrap'
                            }}>
                              {fund.tag}
                            </span>
                          </td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)` }}>
                            <div>
                              <div style={{ fontSize: `clamp(16px, 2vw, 18px)`, fontWeight: 700, color: '#0F172A', marginBottom: `clamp(2px, 0.3vh, 4px)` }}>
                                {fund.targetIRR || fund.realizedIRR}
                              </div>
                              <div style={{ fontSize: `clamp(11px, 1.2vw, 12px)`, color: '#64748B' }}>
                                {fund.returnType}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#64748B' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(6px, 0.8vw, 8px)` }}>
                              <Calendar style={{ width: `clamp(14px, 1.6vw, 16px)`, height: `clamp(14px, 1.6vw, 16px)`, color: '#64748B', flexShrink: 0 }} />
                              <span>{fund.lockUpPeriod}</span>
                            </div>
                          </td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'right', fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#0F172A', fontWeight: 500 }}>
                            {fund.minInvestment}
                          </td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'right', fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#0F172A', fontWeight: 500 }}>
                            {fund.fundSize}
                          </td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)` }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: `clamp(4px, 0.5vh, 6px)` }}>
                              <div style={{ fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B' }}>{fund.remainingCapacity}</div>
                              <div style={{
                                width: '100%',
                                height: `clamp(6px, 0.8vh, 8px)`,
                                backgroundColor: '#E2E8F0',
                                borderRadius: `clamp(3px, 0.4vw, 4px)`,
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${fund.capacityPercent}%`,
                                  height: '100%',
                                  backgroundColor: fund.capacityColor,
                                  borderRadius: `clamp(3px, 0.4vw, 4px)`,
                                  transition: 'width 0.3s ease'
                                }}></div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(4px, 0.5vw, 6px)` }}>
                              <span style={{ fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B', marginRight: `clamp(4px, 0.5vw, 6px)` }}>{fund.riskProfile}</span>
                              {Array.from({ length: fund.riskMaxLevel }).map((_, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    width: `clamp(8px, 1vw, 10px)`,
                                    height: `clamp(8px, 1vw, 10px)`,
                                    borderRadius: '2px',
                                    backgroundColor: idx < fund.riskLevel ? fund.riskColor : '#E2E8F0'
                                  }}
                                ></div>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: `clamp(4px, 0.5vh, 6px) clamp(10px, 1.3vw, 12px)`,
                              fontSize: `clamp(11px, 1.2vw, 12px)`,
                              fontWeight: 500,
                              color: fund.status === 'active' ? '#166534' : '#64748B',
                              backgroundColor: fund.status === 'active' ? '#DCFCE7' : '#F1F5F9',
                              borderRadius: `clamp(10px, 1.2vw, 12px)`,
                              textTransform: 'capitalize'
                            }}>
                              {fund.status}
                            </span>
                          </td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/investor/funds/${fund.id}`);
                                }}
                                style={{
                                  padding: `clamp(6px, 0.8vh, 8px) clamp(10px, 1.3vw, 12px)`,
                                  borderRadius: `clamp(4px, 0.6vw, 6px)`,
                                  border: '1px solid #1E3A5F',
                                  backgroundColor: '#FFFFFF',
                                  color: '#1E3A5F',
                                  fontSize: `clamp(12px, 1.3vw, 13px)`,
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                View Details
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFundForInvestment(fund);
                                  setInvestmentStep(1);
                                  setInvestmentAmount('');
                                  setInvestmentModalOpen(true);
                                }}
                                style={{
                                  padding: `clamp(6px, 0.8vh, 8px) clamp(10px, 1.3vw, 12px)`,
                                  borderRadius: `clamp(4px, 0.6vw, 6px)`,
                                  border: 'none',
                                  backgroundColor: '#1E3A5F',
                                  color: '#FFFFFF',
                                  fontSize: `clamp(12px, 1.3vw, 13px)`,
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                Invest
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  // Mobile card view for list mode
                  <div style={{ display: 'flex', flexDirection: 'column', gap: `clamp(12px, 1.5vw, 16px)`, padding: `clamp(12px, 1.5vw, 16px)` }}>
                    {displayedFunds.map((fund) => (
                      <div
                        key={fund.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: `clamp(8px, 1vw, 12px)`,
                          padding: `clamp(16px, 2vw, 20px)`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: `clamp(12px, 1.5vh, 16px)`
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#0F172A', fontWeight: 500, marginBottom: '4px' }}>{fund.id}</div>
                            <div style={{ fontSize: `clamp(14px, 1.6vw, 16px)`, fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>{fund.name}</div>
                            <div style={{ fontSize: `clamp(20px, 2.5vw, 24px)`, fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                              {fund.targetIRR || fund.realizedIRR}
                            </div>
                            <div style={{ fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B' }}>{fund.returnType}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                            <span style={{
                              padding: `clamp(4px, 0.5vh, 6px) clamp(10px, 1.3vw, 12px)`,
                              fontSize: `clamp(11px, 1.2vw, 12px)`,
                              fontWeight: 500,
                              color: fund.tagColor,
                              backgroundColor: fund.tagBgColor,
                              borderRadius: `clamp(12px, 1.5vw, 16px)`
                            }}>
                              {fund.tag}
                            </span>
                            <span style={{
                              padding: `clamp(4px, 0.5vh, 6px) clamp(10px, 1.3vw, 12px)`,
                              fontSize: `clamp(11px, 1.2vw, 12px)`,
                              fontWeight: 500,
                              color: fund.status === 'active' ? '#166534' : '#64748B',
                              backgroundColor: fund.status === 'active' ? '#DCFCE7' : '#F1F5F9',
                              borderRadius: `clamp(10px, 1.2vw, 12px)`,
                              textTransform: 'capitalize'
                            }}>
                              {fund.status}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: `clamp(10px, 1.2vh, 12px)`, fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(6px, 0.8vw, 8px)` }}>
                            <Calendar style={{ width: `clamp(14px, 1.6vw, 16px)`, height: `clamp(14px, 1.6vw, 16px)`, flexShrink: 0 }} />
                            <span>Lock-Up Period: {fund.lockUpPeriod}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(6px, 0.8vw, 8px)` }}>
                            <DollarSign style={{ width: `clamp(14px, 1.6vw, 16px)`, height: `clamp(14px, 1.6vw, 16px)`, flexShrink: 0 }} />
                            <span>Min. Investment: {fund.minInvestment}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(6px, 0.8vw, 8px)` }}>
                            <Briefcase style={{ width: `clamp(14px, 1.6vw, 16px)`, height: `clamp(14px, 1.6vw, 16px)`, flexShrink: 0 }} />
                            <span>Fund Size: {fund.fundSize}</span>
                          </div>
                          <div>
                            <div style={{ marginBottom: '4px' }}>Remaining Capacity: {fund.remainingCapacity}</div>
                            <div style={{
                              width: '100%',
                              height: `clamp(6px, 0.8vh, 8px)`,
                              backgroundColor: '#E2E8F0',
                              borderRadius: `clamp(3px, 0.4vw, 4px)`,
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${fund.capacityPercent}%`,
                                height: '100%',
                                backgroundColor: fund.capacityColor,
                                borderRadius: `clamp(3px, 0.4vw, 4px)`
                              }}></div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(6px, 0.8vw, 8px)` }}>
                            <TrendingUp style={{ width: `clamp(14px, 1.6vw, 16px)`, height: `clamp(14px, 1.6vw, 16px)`, flexShrink: 0 }} />
                            <span>Risk Profile: {fund.riskProfile}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(3px, 0.4vw, 4px)`, marginLeft: '4px' }}>
                              {Array.from({ length: fund.riskMaxLevel }).map((_, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    width: `clamp(8px, 1vw, 10px)`,
                                    height: `clamp(8px, 1vw, 10px)`,
                                    borderRadius: '2px',
                                    backgroundColor: idx < fund.riskLevel ? fund.riskColor : '#E2E8F0'
                                  }}
                                ></div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div style={{ paddingTop: `clamp(8px, 1vh, 12px)`, borderTop: '1px solid #E2E8F0' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/investor/funds/${fund.id}`);
                              }}
                              style={{
                                flex: 1,
                                padding: `clamp(10px, 1.2vh, 12px) clamp(16px, 2vw, 20px)`,
                                borderRadius: `clamp(4px, 0.6vw, 6px)`,
                                border: '1px solid #1E3A5F',
                                backgroundColor: '#FFFFFF',
                                color: '#1E3A5F',
                                fontSize: `clamp(13px, 1.4vw, 14px)`,
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              View Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFundForInvestment(fund);
                                setInvestmentStep(1);
                                setInvestmentAmount('');
                                setInvestmentModalOpen(true);
                              }}
                              style={{
                                flex: 1,
                                padding: `clamp(10px, 1.2vh, 12px) clamp(16px, 2vw, 20px)`,
                                borderRadius: `clamp(4px, 0.6vw, 6px)`,
                                border: 'none',
                                backgroundColor: '#1E3A5F',
                                color: '#FFFFFF',
                                fontSize: `clamp(13px, 1.4vw, 14px)`,
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              Invest
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `clamp(8px, 1vw, 12px)`,
                marginTop: `clamp(24px, 3vh, 32px)`
              }}>
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.current_page - 1))}
                  disabled={pagination.current_page === 1}
                  style={{
                    padding: `clamp(8px, 1vh, 10px)`,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    cursor: pagination.current_page === 1 ? 'not-allowed' : 'pointer',
                    opacity: pagination.current_page === 1 ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ChevronLeft style={{ width: `clamp(16px, 2vw, 18px)`, height: `clamp(16px, 2vw, 18px)`, color: '#64748B' }} />
                </button>
                {Array.from({ length: pagination.last_page }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      padding: `clamp(8px, 1vh, 10px) clamp(12px, 1.5vw, 16px)`,
                      fontSize: `clamp(12px, 1.3vw, 14px)`,
                      fontWeight: pagination.current_page === pageNum ? 600 : 500,
                      color: pagination.current_page === pageNum ? '#FFFFFF' : '#64748B',
                      backgroundColor: pagination.current_page === pageNum ? '#1E3A5F' : '#FFFFFF',
                      border: pagination.current_page === pageNum ? 'none' : '1px solid #E2E8F0',
                      borderRadius: `clamp(6px, 0.8vw, 8px)`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minWidth: `clamp(32px, 4vw, 40px)`
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(Math.min(pagination.last_page, pagination.current_page + 1))}
                  disabled={pagination.current_page === pagination.last_page}
                  style={{
                    padding: `clamp(8px, 1vh, 10px)`,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    cursor: pagination.current_page === pagination.last_page ? 'not-allowed' : 'pointer',
                    opacity: pagination.current_page === pagination.last_page ? 0.5 : 1,
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
        </div>

        {/* Right Side Drawer for Mobile/Tablet */}


        {/* Investment Modal */}
        {investmentModalOpen && selectedFundForInvestment && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
              padding: '32px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              position: 'relative'
            }}>
              <button
                onClick={() => setInvestmentModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B'
                }}
              >
                <X size={24} />
              </button>

              {investmentStep === 1 ? (
                <>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: 0, marginBottom: '8px' }}>
                    Invest in {selectedFundForInvestment.name}
                  </h2>
                  <p style={{ color: '#64748B', fontSize: '15px', marginBottom: '24px' }}>
                    Minimum investment: {selectedFundForInvestment.minInvestment}
                  </p>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                      Investment Amount ($)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter amount..."
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '16px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => setInvestmentModalOpen(false)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setInvestmentStep(2)}
                      disabled={!investmentAmount}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#1E3A5F',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        cursor: investmentAmount ? 'pointer' : 'not-allowed',
                        opacity: investmentAmount ? 1 : 0.7
                      }}
                    >
                      Continue
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    backgroundColor: '#DCFCE7', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 24px'
                  }}>
                    <CheckCircle2 size={32} color="#166534" />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px' }}>
                    Investment Request Sent!
                  </h3>
                  <p style={{ color: '#64748B', fontSize: '15px', lineHeight: 1.5, marginBottom: '32px' }}>
                    Thank you for your interest in <strong>{selectedFundForInvestment.name}</strong>. 
                    <br />
                    Our team has been notified and will contact you shortly with the next steps.
                  </p>
                  <button
                    onClick={() => setInvestmentModalOpen(false)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#1E3A5F',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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

