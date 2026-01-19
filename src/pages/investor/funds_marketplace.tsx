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
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import investorsData from '../../data/investors.json';
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
  const [funds] = useState<Fund[]>(investorsData.funds.items);
  const [filteredFunds, setFilteredFunds] = useState<Fund[]>(investorsData.funds.items);
  const [activeFilter, setActiveFilter] = useState<string>(investorsData.funds.defaultFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>(investorsData.funds.defaultSort);
  const [viewMode, setViewMode] = useState<string>(investorsData.funds.defaultView);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  // Filter and search funds
  useEffect(() => {
    let filtered = [...funds];

    // Apply filter
    if (activeFilter !== 'All') {
      if (activeFilter === 'Redemption Fund') {
        filtered = filtered.filter(fund => fund.tag === 'Redemption');
      } else if (activeFilter === 'Auction Fund') {
        filtered = filtered.filter(fund => fund.tag === 'Auction');
      } else if (activeFilter === 'REO Fund') {
        filtered = filtered.filter(fund => fund.tag === 'REO');
      } else if (activeFilter === 'Blended Fund') {
        filtered = filtered.filter(fund => fund.tag === 'Blended');
      }
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(fund =>
        fund.name.toLowerCase().includes(query) ||
        fund.id.toLowerCase().includes(query)
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Highest IRR':
          const irrA = parseFloat(a.targetIRR?.split('-')[0] || a.realizedIRR?.replace('%', '') || '0');
          const irrB = parseFloat(b.targetIRR?.split('-')[0] || b.realizedIRR?.replace('%', '') || '0');
          return irrB - irrA;
        case 'Lowest IRR':
          const irrA2 = parseFloat(a.targetIRR?.split('-')[0] || a.realizedIRR?.replace('%', '') || '0');
          const irrB2 = parseFloat(b.targetIRR?.split('-')[0] || b.realizedIRR?.replace('%', '') || '0');
          return irrA2 - irrB2;
        default:
          return 0;
      }
    });

    setFilteredFunds(filtered);
    setCurrentPage(1);
  }, [activeFilter, searchQuery, sortBy, funds]);

  // Pagination
  const itemsPerPage = investorsData.funds.itemsPerPage;
  const totalPages = Math.ceil(filteredFunds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFunds = filteredFunds.slice(startIndex, endIndex);

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
              <h2 style={{ fontSize: `clamp(18px, 2.2vw, 24px)`, fontWeight: 600, color: '#0F172A', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: `clamp(4px, 0.5vh, 6px)` }}>{investorsData.investYourCapital.title}</h2>
              <p style={{ fontSize: `clamp(12px, 1.3vw, 14px)`, color: '#64748B', margin: 0 }}>{investorsData.investYourCapital.subtitle}</p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : 'repeat(2, 1fr)',
              gap: `clamp(16px, 2vw, 24px)`
            }}>
              {investorsData.investYourCapital.options.map((option) => {
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
              <h2 style={{ fontSize: `clamp(20px, 2.5vw, 28px)`, fontWeight: 600, color: '#0F172A', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: `clamp(4px, 0.5vh, 6px)` }}>{investorsData.funds.title}</h2>
              <p style={{ fontSize: `clamp(13px, 1.4vw, 15px)`, color: '#64748B', margin: 0 }}>{investorsData.funds.subtitle}</p>
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
                  placeholder={investorsData.funds.searchPlaceholder}
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
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  fontSize: `clamp(13px, 1.4vw, 15px)`,
                  fontWeight: 500,
                  color: '#0F172A',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center'
                }}
              >
                Advanced Filters
                <ChevronDown style={{ width: `clamp(16px, 1.8vw, 18px)`, height: `clamp(16px, 1.8vw, 18px)` }} />
              </button>
            </div>

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
              {investorsData.funds.filters.map((filter) => (
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
              <div style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: isMobile ? '100%' : 'auto',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(32px, 4vw, 40px) clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(13px, 1.4vw, 15px)`,
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
                  {investorsData.funds.sortOptions.map((option) => (
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

              {/* Fund Count */}
              <div style={{
                fontSize: `clamp(12px, 1.3vw, 14px)`,
                color: '#64748B',
                whiteSpace: isMobile ? 'normal' : 'nowrap',
                textAlign: isMobile ? 'center' : 'left',
                width: isMobile ? '100%' : 'auto'
              }}>
                Showing {investorsData.funds.count.showing} of {investorsData.funds.count.total} funds
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
                {currentFunds.map((fund) => (
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
                        Details
                      </button>
                      <button
                        style={{
                          flex: 1,
                          padding: `clamp(10px, 1.2vh, 12px) clamp(16px, 2vw, 20px)`,
                          fontSize: `clamp(13px, 1.4vw, 14px)`,
                          fontWeight: 500,
                          color: fund.button.type === 'primary' ? '#FFFFFF' : '#1E3A5F',
                          backgroundColor: fund.button.type === 'primary' ? '#1E3A5F' : '#FFFFFF',
                          border: fund.button.type === 'primary' ? 'none' : `1px solid #1E3A5F`,
                          borderRadius: `clamp(6px, 0.8vw, 8px)`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {fund.button.text}
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
                      {currentFunds.map((fund, index) => (
                        <tr
                          key={fund.id}
                          style={{
                            borderBottom: index < currentFunds.length - 1 ? '1px solid #E2E8F0' : 'none'
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
                                Details
                              </button>
                              <button
                                style={{
                                  padding: `clamp(6px, 0.8vh, 8px) clamp(10px, 1.3vw, 12px)`,
                                  borderRadius: `clamp(4px, 0.6vw, 6px)`,
                                  border: fund.button.type === 'primary' ? 'none' : '1px solid #1E3A5F',
                                  backgroundColor: fund.button.type === 'primary' ? '#1E3A5F' : '#FFFFFF',
                                  color: fund.button.type === 'primary' ? '#FFFFFF' : '#1E3A5F',
                                  fontSize: `clamp(12px, 1.3vw, 13px)`,
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {fund.button.text}
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
                    {currentFunds.map((fund) => (
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
                              Details
                            </button>
                            <button
                              style={{
                                flex: 1,
                                padding: `clamp(10px, 1.2vh, 12px) clamp(16px, 2vw, 20px)`,
                                borderRadius: `clamp(4px, 0.6vw, 6px)`,
                                border: fund.button.type === 'primary' ? 'none' : '1px solid #1E3A5F',
                                backgroundColor: fund.button.type === 'primary' ? '#1E3A5F' : '#FFFFFF',
                                color: fund.button.type === 'primary' ? '#FFFFFF' : '#1E3A5F',
                                fontSize: `clamp(13px, 1.4vw, 14px)`,
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {fund.button.text}
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
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
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
        </div>

        {/* Right Side Drawer for Mobile/Tablet */}

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

