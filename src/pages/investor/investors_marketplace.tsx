import { useState, useEffect } from 'react';
import {
  Building2,
  Clock,
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react';
import InvestorNav from '../../components/investor/InvestorNav';
import { useNavigate } from 'react-router-dom';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import investorsData from '../../data/investors.json';

interface Property {
  id: string;
  address: string;
  location: string;
  tag: string;
  tagColor: string;
  deadline?: string;
  deadlineColor?: string;
  interestRate?: string;
  payoffToday?: string;
  minInvest?: string;
  status: string;
  redeemedOn?: string;
  roi?: string;
  finalPayoff?: string;
  duration?: string;
  processStage?: string;
  legalCost?: string;
  estValue?: string;
  statusLabel?: string;
  holdValue?: string;
  resolution?: string;
  buttons: Array<{ text: string; type: string }>;
}

export default function InvestorsMarketplace() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const navigate = useNavigate();

  const [properties] = useState<Property[]>(investorsData.properties.items);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(investorsData.properties.items);
  const [activeFilter, setActiveFilter] = useState<string>(investorsData.properties.defaultFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy] = useState<string>(investorsData.properties.defaultSort);
  const [viewMode, setViewMode] = useState<string>(investorsData.properties.defaultView);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);



  // Filter and search properties
  useEffect(() => {
    let filtered = [...properties];

    // Apply filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter(prop => prop.tag === activeFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prop =>
        prop.address.toLowerCase().includes(query) ||
        prop.id.toLowerCase().includes(query) ||
        prop.location.toLowerCase().includes(query)
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Newest':
          return b.id.localeCompare(a.id);
        case 'Oldest':
          return a.id.localeCompare(b.id);
        case 'Interest Rate':
          return parseFloat(b.interestRate || '0') - parseFloat(a.interestRate || '0');
        case 'Value':
          const aValue = parseFloat(a.payoffToday?.replace(/[^0-9.]/g, '') || a.finalPayoff?.replace(/[^0-9.]/g, '') || '0');
          const bValue = parseFloat(b.payoffToday?.replace(/[^0-9.]/g, '') || b.finalPayoff?.replace(/[^0-9.]/g, '') || '0');
          return bValue - aValue;
        default:
          return 0;
      }
    });

    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [activeFilter, searchQuery, sortBy, properties]);

  // Pagination
  const itemsPerPage = investorsData.properties.pagination.itemsPerPage;
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);
  const showingCount = `${startIndex + 1}-${Math.min(endIndex, filteredProperties.length)}`;

  const getTagBackgroundColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      '#1E3A5F': '#EFF6FF',
      '#F59E0B': '#FEF3C7',
      '#10B981': '#DCFCE7',
      '#7C3AED': '#F5F3FF',
      '#DC2626': '#FEE2E2',
      '#64748B': '#F1F5F9'
    };
    return colorMap[color] || '#F1F5F9';
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
        {/* Top Navigation Bar */}
        <InvestorNav />

        {/* Main Content */}
        <div style={{
          padding: `clamp(16px, 2vh, 32px) clamp(16px, 4vw, 48px)`,
          width: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          maxWidth: '100vw'
        }}>
          {/* Invest Your Capital Section */}
          <div style={{ marginBottom: `clamp(24px, 3vh, 48px)` }}>
            <h2 style={{ fontSize: `clamp(20px, 2.5vw, 24px)`, fontWeight: 700, color: '#0F172A', marginBottom: `clamp(6px, 0.8vh, 8px)` }}>
              {investorsData.investYourCapital.title}
            </h2>
            <p style={{ fontSize: `clamp(12px, 1.3vw, 14px)`, color: '#64748B', marginBottom: `clamp(16px, 2vh, 24px)`, lineHeight: 1.5 }}>
              {investorsData.investYourCapital.subtitle}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : 'repeat(2, 1fr)',
              gap: `clamp(16px, 2vw, 24px)`
            }}>
              {investorsData.investYourCapital.options.map((option) => {
                const IconComponent = option.icon === 'Building2' ? Building2 : Clock;
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
                      textAlign: 'center',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{
                      width: `clamp(48px, 6vw, 64px)`,
                      height: `clamp(48px, 6vw, 64px)`,
                      borderRadius: `clamp(8px, 1vw, 12px)`,
                      backgroundColor: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: `clamp(16px, 2vh, 24px)`,
                      flexShrink: 0
                    }}>
                      <IconComponent style={{ width: `clamp(24px, 3vw, 32px)`, height: `clamp(24px, 3vw, 32px)`, color: '#1E3A5F' }} />
                    </div>
                    <h3 style={{ fontSize: `clamp(16px, 2vw, 20px)`, fontWeight: 600, color: '#0F172A', marginBottom: `clamp(8px, 1vh, 12px)`, lineHeight: 1.3 }}>
                      {option.title}
                    </h3>
                    <p style={{ fontSize: `clamp(12px, 1.3vw, 14px)`, color: '#64748B', marginBottom: `clamp(16px, 2vh, 24px)`, lineHeight: 1.5 }}>
                      {option.description}
                    </p>
                    <button
                      onClick={() => {
                        if (option.id === 'individual-properties') {
                          // Already on properties page, just scroll or highlight
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
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

          {/* Properties Section */}
          <div>
            <div style={{ marginBottom: `clamp(16px, 2vh, 24px)` }}>
              <h1 style={{ fontSize: `clamp(22px, 2.8vw, 28px)`, fontWeight: 700, color: '#0F172A', marginBottom: `clamp(4px, 0.6vh, 6px)`, lineHeight: 1.2 }}>
                {investorsData.properties.title}
              </h1>
              <p style={{ fontSize: `clamp(12px, 1.3vw, 14px)`, color: '#64748B', lineHeight: 1.5 }}>
                {investorsData.properties.subtitle}
              </p>
            </div>

            {/* Search and Filters */}
            <div style={{ marginBottom: `clamp(16px, 2vh, 24px)` }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: `clamp(12px, 1.5vw, 16px)`, marginBottom: `clamp(12px, 1.5vh, 16px)` }}>
                {/* Search Bar */}
                <div style={{
                  position: 'relative',
                  flex: isMobile ? '0 1 auto' : 1,
                  width: isMobile ? '100%' : 'auto',
                  minWidth: isMobile ? 'auto' : '200px',
                  maxWidth: isMobile ? '100%' : '600px'
                }}>
                  <Search style={{
                    position: 'absolute',
                    left: `clamp(10px, 1.2vw, 12px)`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: `clamp(16px, 1.8vw, 18px)`,
                    height: `clamp(16px, 1.8vw, 18px)`,
                    color: '#64748B',
                    pointerEvents: 'none'
                  }} />
                  <input
                    type="text"
                    placeholder={investorsData.properties.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      height: `clamp(40px, 5vh, 44px)`,
                      paddingLeft: `clamp(36px, 4vw, 40px)`,
                      paddingRight: `clamp(12px, 1.5vw, 16px)`,
                      border: '1px solid #E2E8F0',
                      borderRadius: `clamp(6px, 0.8vw, 8px)`,
                      fontSize: `clamp(12px, 1.3vw, 14px)`,
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
                    gap: `clamp(6px, 1vw, 8px)`,
                    flexWrap: isMobile ? 'nowrap' : 'wrap',
                    width: isMobile ? '100%' : 'auto',
                    overflowX: isMobile ? 'auto' : 'visible',
                    WebkitOverflowScrolling: 'touch',
                    paddingBottom: isMobile ? '4px' : '0'
                  }}
                >
                  {investorsData.properties.filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      style={{
                        padding: `clamp(6px, 1vh, 8px) clamp(12px, 1.5vw, 16px)`,
                        borderRadius: `clamp(6px, 0.8vw, 8px)`,
                        border: 'none',
                        fontSize: `clamp(11px, 1.2vw, 14px)`,
                        fontWeight: activeFilter === filter ? 600 : 500,
                        color: activeFilter === filter ? '#FFFFFF' : '#64748B',
                        backgroundColor: activeFilter === filter ? '#1E3A5F' : '#F1F5F9',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
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
                    gap: `clamp(6px, 1vw, 8px)`,
                    padding: `clamp(8px, 1.2vh, 10px) clamp(12px, 1.5vw, 16px)`,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    fontSize: `clamp(12px, 1.3vw, 14px)`,
                    color: '#64748B',
                    cursor: 'pointer',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  Advanced Filters
                  <ChevronDown style={{
                    width: `clamp(14px, 1.6vw, 16px)`,
                    height: `clamp(14px, 1.6vw, 16px)`,
                    transform: advancedFiltersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} />
                </button>
              </div>
            </div>

            {/* Property Count and View Options */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              marginBottom: `clamp(16px, 2vh, 24px)`,
              flexWrap: 'wrap',
              gap: `clamp(12px, 1.5vw, 16px)`
            }}>
              <div style={{ fontSize: `clamp(12px, 1.3vw, 14px)`, color: '#64748B', lineHeight: 1.5 }}>
                Showing {showingCount} of {filteredProperties.length} properties.
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(8px, 1.2vw, 12px)`,
                width: isMobile ? '100%' : 'auto',
                flexWrap: 'wrap'
              }}>
                {/* View Mode Toggle */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: `clamp(3px, 0.5vw, 4px)`,
                  backgroundColor: '#F1F5F9',
                  padding: `clamp(3px, 0.5vh, 4px)`,
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  flexShrink: 0
                }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{
                      padding: `clamp(5px, 0.8vh, 6px) clamp(8px, 1.2vw, 10px)`,
                      borderRadius: `clamp(4px, 0.6vw, 6px)`,
                      border: 'none',
                      backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'
                    }}
                  >
                    <LayoutGrid style={{ width: `clamp(16px, 1.8vw, 18px)`, height: `clamp(16px, 1.8vw, 18px)`, color: '#64748B' }} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{
                      padding: `clamp(5px, 0.8vh, 6px) clamp(8px, 1.2vw, 10px)`,
                      borderRadius: `clamp(4px, 0.6vw, 6px)`,
                      border: 'none',
                      backgroundColor: viewMode === 'list' ? '#FFFFFF' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'
                    }}
                  >
                    <List style={{ width: `clamp(16px, 1.8vw, 18px)`, height: `clamp(16px, 1.8vw, 18px)`, color: '#64748B' }} />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div style={{ position: 'relative', flex: isMobile ? 1 : '0 1 auto', minWidth: isMobile ? '0' : 'auto' }}>
                  <button
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
                    <ChevronDown style={{ width: `clamp(14px, 1.6vw, 16px)`, height: `clamp(14px, 1.6vw, 16px)`, flexShrink: 0 }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Properties Grid View */}
            {viewMode === 'grid' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: `clamp(16px, 2vw, 24px)`,
                marginBottom: `clamp(32px, 4vh, 48px)`,
                width: '100%',
                boxSizing: 'border-box'
              }}>
                {currentProperties.map((property) => {
                  return (
                    <div
                      key={property.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: `clamp(8px, 1.2vw, 12px)`,
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        boxSizing: 'border-box',
                        minWidth: 0
                      }}
                    >
                      {/* Property Header */}
                      <div style={{
                        padding: `clamp(14px, 1.8vw, 20px)`,
                        borderBottom: '1px solid #E2E8F0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: `clamp(10px, 1.3vh, 12px)`, gap: `clamp(8px, 1vw, 12px)`, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: `clamp(14px, 1.8vw, 16px)`, fontWeight: 600, color: '#0F172A', marginBottom: `clamp(4px, 0.6vh, 6px)`, lineHeight: 1.3, wordBreak: 'break-word' }}>
                              {property.address}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(4px, 0.6vw, 6px)`, fontSize: `clamp(11px, 1.3vw, 13px)`, color: '#64748B', lineHeight: 1.4, flexWrap: 'wrap' }}>
                              <MapPin style={{ width: `clamp(12px, 1.4vw, 14px)`, height: `clamp(12px, 1.4vw, 14px)`, flexShrink: 0 }} />
                              <span>{property.location}</span>
                            </div>
                          </div>
                          <span style={{
                            fontSize: `clamp(9px, 1.1vw, 11px)`,
                            fontWeight: 600,
                            color: property.tagColor,
                            backgroundColor: getTagBackgroundColor(property.tagColor),
                            padding: `clamp(3px, 0.5vh, 4px) clamp(8px, 1.2vw, 10px)`,
                            borderRadius: '12px',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }}>
                            {property.tag}
                          </span>
                        </div>
                        <div style={{ fontSize: `clamp(11px, 1.2vw, 12px)`, color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>
                          {property.id}
                        </div>
                      </div>

                      {/* Property Details */}
                      <div style={{ padding: `clamp(14px, 1.8vw, 20px)`, flex: 1, display: 'flex', flexDirection: 'column', gap: `clamp(10px, 1.3vh, 12px)` }}>
                        {/* Dynamic content based on property status */}
                        {property.status === 'active' && (
                          <>
                            {property.deadline && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(4px, 0.6vw, 6px)` }}>
                                <span style={{ fontSize: `clamp(10px, 1.2vw, 12px)`, color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>DEADLINE</span>
                                <span style={{ fontSize: `clamp(11px, 1.3vw, 13px)`, fontWeight: 600, color: property.deadlineColor, display: 'flex', alignItems: 'center', gap: `clamp(4px, 0.6vw, 6px)`, flexShrink: 0 }}>
                                  <div style={{ width: `clamp(5px, 0.6vw, 6px)`, height: `clamp(5px, 0.6vw, 6px)`, borderRadius: '50%', backgroundColor: property.deadlineColor, flexShrink: 0 }}></div>
                                  {property.deadline}
                                </span>
                              </div>
                            )}
                            {property.interestRate && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(4px, 0.6vw, 6px)` }}>
                                <span style={{ fontSize: `clamp(10px, 1.2vw, 12px)`, color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>INTEREST RATE</span>
                                <span style={{ fontSize: `clamp(11px, 1.3vw, 13px)`, fontWeight: 600, color: '#0F172A', lineHeight: 1.4, textAlign: 'right' }}>{property.interestRate}</span>
                              </div>
                            )}
                            {property.payoffToday && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(4px, 0.6vw, 6px)` }}>
                                <span style={{ fontSize: `clamp(10px, 1.2vw, 12px)`, color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>PAYOFF TODAY</span>
                                <span style={{ fontSize: `clamp(11px, 1.3vw, 13px)`, fontWeight: 600, color: '#0F172A', lineHeight: 1.4, textAlign: 'right', wordBreak: 'break-word' }}>{property.payoffToday}</span>
                              </div>
                            )}
                            {property.minInvest && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(4px, 0.6vw, 6px)` }}>
                                <span style={{ fontSize: `clamp(10px, 1.2vw, 12px)`, color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>MIN. INVEST</span>
                                <span style={{ fontSize: `clamp(11px, 1.3vw, 13px)`, fontWeight: 600, color: '#0F172A', lineHeight: 1.4, textAlign: 'right' }}>{property.minInvest}</span>
                              </div>
                            )}
                            {property.processStage && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(4px, 0.6vw, 6px)` }}>
                                <span style={{ fontSize: `clamp(10px, 1.2vw, 12px)`, color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>PROCESS STAGE</span>
                                <span style={{ fontSize: `clamp(11px, 1.3vw, 13px)`, fontWeight: 600, color: '#0F172A', lineHeight: 1.4, textAlign: 'right' }}>{property.processStage}</span>
                              </div>
                            )}
                            {property.legalCost && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(4px, 0.6vw, 6px)` }}>
                                <span style={{ fontSize: `clamp(10px, 1.2vw, 12px)`, color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>LEGAL COST</span>
                                <span style={{ fontSize: `clamp(11px, 1.3vw, 13px)`, fontWeight: 600, color: '#0F172A', lineHeight: 1.4, textAlign: 'right' }}>{property.legalCost}</span>
                              </div>
                            )}
                            {property.estValue && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(4px, 0.6vw, 6px)` }}>
                                <span style={{ fontSize: `clamp(10px, 1.2vw, 12px)`, color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>EST. VALUE</span>
                                <span style={{ fontSize: `clamp(11px, 1.3vw, 13px)`, fontWeight: 600, color: '#0F172A', lineHeight: 1.4, textAlign: 'right', wordBreak: 'break-word' }}>{property.estValue}</span>
                              </div>
                            )}
                            {property.statusLabel && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(4px, 0.6vw, 6px)` }}>
                                <span style={{ fontSize: `clamp(10px, 1.2vw, 12px)`, color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>STATUS</span>
                                <span style={{ fontSize: `clamp(11px, 1.3vw, 13px)`, fontWeight: 600, color: '#0F172A', lineHeight: 1.4, textAlign: 'right' }}>{property.statusLabel}</span>
                              </div>
                            )}
                            {property.holdValue && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(4px, 0.6vw, 6px)` }}>
                                <span style={{ fontSize: `clamp(10px, 1.2vw, 12px)`, color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>HOLD VALUE</span>
                                <span style={{ fontSize: `clamp(11px, 1.3vw, 13px)`, fontWeight: 600, color: '#0F172A', lineHeight: 1.4, textAlign: 'right', wordBreak: 'break-word' }}>{property.holdValue}</span>
                              </div>
                            )}
                            {property.resolution && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(4px, 0.6vw, 6px)` }}>
                                <span style={{ fontSize: `clamp(10px, 1.2vw, 12px)`, color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>RESOLUTION</span>
                                <span style={{ fontSize: `clamp(11px, 1.3vw, 13px)`, fontWeight: 600, color: '#0F172A', lineHeight: 1.4, textAlign: 'right' }}>{property.resolution}</span>
                              </div>
                            )}
                          </>
                        )}

                        {property.status === 'redeemed' && (
                          <>
                            {property.redeemedOn && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(4px, 0.6vw, 6px)` }}>
                                <span style={{ fontSize: `clamp(10px, 1.2vw, 12px)`, color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>REDEEMED ON</span>
                                <span style={{ fontSize: `clamp(11px, 1.3vw, 13px)`, fontWeight: 600, color: '#0F172A', lineHeight: 1.4, textAlign: 'right' }}>{property.redeemedOn}</span>
                              </div>
                            )}
                            {property.roi && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(4px, 0.6vw, 6px)` }}>
                                <span style={{ fontSize: `clamp(10px, 1.2vw, 12px)`, color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>ROI</span>
                                <span style={{ fontSize: `clamp(11px, 1.3vw, 13px)`, fontWeight: 600, color: '#10B981', lineHeight: 1.4, textAlign: 'right' }}>{property.roi}</span>
                              </div>
                            )}
                            {property.finalPayoff && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(4px, 0.6vw, 6px)` }}>
                                <span style={{ fontSize: `clamp(10px, 1.2vw, 12px)`, color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>FINAL PAYOFF</span>
                                <span style={{ fontSize: `clamp(11px, 1.3vw, 13px)`, fontWeight: 600, color: '#0F172A', lineHeight: 1.4, textAlign: 'right', wordBreak: 'break-word' }}>{property.finalPayoff}</span>
                              </div>
                            )}
                            {property.duration && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(4px, 0.6vw, 6px)` }}>
                                <span style={{ fontSize: `clamp(10px, 1.2vw, 12px)`, color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>DURATION</span>
                                <span style={{ fontSize: `clamp(11px, 1.3vw, 13px)`, fontWeight: 600, color: '#0F172A', lineHeight: 1.4, textAlign: 'right' }}>{property.duration}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{
                        padding: `clamp(12px, 1.5vw, 16px) clamp(14px, 1.8vw, 20px) clamp(14px, 1.8vw, 20px)`,
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: `clamp(10px, 1.3vw, 12px)`,
                        borderTop: '1px solid #E2E8F0'
                      }}>
                        {property.buttons.map((btn, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (btn.text === 'Details') {
                                navigate(`/investor/properties/${property.id}`);
                              } else if (btn.text === 'Invest') {
                                navigate(`/investor/properties/${property.id}`);
                              }
                            }}
                            style={{
                              flex: btn.type === 'primary' && !isMobile ? 1 : '0 1 auto',
                              padding: `clamp(8px, 1.2vh, 10px) clamp(12px, 1.5vw, 16px)`,
                              borderRadius: `clamp(6px, 0.8vw, 8px)`,
                              border: btn.type === 'primary' ? 'none' : '1px solid #E2E8F0',
                              backgroundColor: btn.type === 'primary' ? '#1E3A5F' : '#FFFFFF',
                              color: btn.type === 'primary' ? '#FFFFFF' : '#0F172A',
                              fontSize: `clamp(12px, 1.3vw, 14px)`,
                              fontWeight: 500,
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                              width: isMobile ? '100%' : 'auto',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {btn.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Properties Table View */}
            {viewMode === 'list' && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: `clamp(8px, 1vw, 12px)`,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                overflowX: 'auto',
                marginBottom: `clamp(32px, 4vh, 48px)`
              }}>
                {!isMobile ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tag</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'left', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Details</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'right', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Value</th>
                        <th style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'center', fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProperties.map((property, index) => (
                        <tr
                          key={property.id}
                          style={{
                            borderBottom: index < currentProperties.length - 1 ? '1px solid #E2E8F0' : 'none'
                          }}
                        >
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#0F172A', fontWeight: 500 }}>{property.id}</td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#0F172A', fontWeight: 500 }}>{property.address}</td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#64748B' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(4px, 0.6vw, 6px)` }}>
                              <MapPin style={{ width: `clamp(12px, 1.4vw, 14px)`, height: `clamp(12px, 1.4vw, 14px)`, color: '#64748B', flexShrink: 0 }} />
                              <span>{property.location}</span>
                            </div>
                          </td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)` }}>
                            <span style={{
                              display: 'inline-block',
                              padding: `clamp(4px, 0.5vh, 6px) clamp(10px, 1.3vw, 12px)`,
                              fontSize: `clamp(11px, 1.2vw, 12px)`,
                              fontWeight: 600,
                              color: property.tagColor,
                              backgroundColor: getTagBackgroundColor(property.tagColor),
                              borderRadius: `clamp(12px, 1.5vw, 16px)`,
                              textTransform: 'uppercase',
                              whiteSpace: 'nowrap'
                            }}>
                              {property.tag}
                            </span>
                          </td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)` }}>
                            <span style={{
                              display: 'inline-block',
                              padding: `clamp(4px, 0.5vh, 6px) clamp(10px, 1.3vw, 12px)`,
                              fontSize: `clamp(11px, 1.2vw, 12px)`,
                              fontWeight: 500,
                              color: property.status === 'active' ? '#166534' : property.status === 'redeemed' ? '#10B981' : '#64748B',
                              backgroundColor: property.status === 'active' ? '#DCFCE7' : property.status === 'redeemed' ? '#ECFDF5' : '#F1F5F9',
                              borderRadius: `clamp(10px, 1.2vw, 12px)`,
                              textTransform: 'capitalize'
                            }}>
                              {property.status}
                            </span>
                          </td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#64748B' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: `clamp(4px, 0.5vh, 6px)` }}>
                              {property.status === 'active' && (
                                <>
                                  {property.deadline && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(4px, 0.6vw, 6px)` }}>
                                      <div style={{ width: `clamp(5px, 0.6vw, 6px)`, height: `clamp(5px, 0.6vw, 6px)`, borderRadius: '50%', backgroundColor: property.deadlineColor || '#10B981', flexShrink: 0 }}></div>
                                      <span>Deadline: {property.deadline}</span>
                                    </div>
                                  )}
                                  {property.interestRate && <span>Rate: {property.interestRate}</span>}
                                  {property.minInvest && <span>Min: {property.minInvest}</span>}
                                </>
                              )}
                              {property.status === 'redeemed' && (
                                <>
                                  {property.roi && <span>ROI: <span style={{ color: '#10B981', fontWeight: 600 }}>{property.roi}</span></span>}
                                  {property.duration && <span>Duration: {property.duration}</span>}
                                  {property.redeemedOn && <span>Redeemed: {property.redeemedOn}</span>}
                                </>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'right', fontSize: `clamp(13px, 1.4vw, 14px)`, fontWeight: 600, color: '#0F172A' }}>
                            {property.status === 'active' && property.payoffToday && (
                              <div>{property.payoffToday}</div>
                            )}
                            {property.status === 'redeemed' && property.finalPayoff && (
                              <div style={{ color: '#10B981' }}>{property.finalPayoff}</div>
                            )}
                          </td>
                          <td style={{ padding: `clamp(12px, 1.5vw, 16px)`, textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: `clamp(6px, 0.8vw, 8px)`, flexWrap: 'wrap' }}>
                              {property.buttons.map((btn, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (btn.text === 'Details') {
                                      navigate(`/investor/properties/${property.id}`);
                                    } else if (btn.text === 'Invest') {
                                      // For now also go to details, or handle invest logic
                                      navigate(`/investor/properties/${property.id}`);
                                    }
                                  }}
                                  style={{
                                    padding: `clamp(6px, 0.8vh, 8px) clamp(10px, 1.3vw, 12px)`,
                                    borderRadius: `clamp(4px, 0.6vw, 6px)`,
                                    border: btn.type === 'primary' ? 'none' : '1px solid #E2E8F0',
                                    backgroundColor: btn.type === 'primary' ? '#1E3A5F' : '#FFFFFF',
                                    color: btn.type === 'primary' ? '#FFFFFF' : '#0F172A',
                                    fontSize: `clamp(12px, 1.3vw, 13px)`,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  {btn.text}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  // Mobile card view for list mode
                  <div style={{ display: 'flex', flexDirection: 'column', gap: `clamp(12px, 1.5vw, 16px)`, padding: `clamp(12px, 1.5vw, 16px)` }}>
                    {currentProperties.map((property) => (
                      <div
                        key={property.id}
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
                            <div style={{ fontSize: `clamp(13px, 1.4vw, 14px)`, color: '#0F172A', fontWeight: 500, marginBottom: '4px' }}>{property.id}</div>
                            <div style={{ fontSize: `clamp(14px, 1.6vw, 16px)`, fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>{property.address}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(4px, 0.6vw, 6px)`, fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B' }}>
                              <MapPin style={{ width: `clamp(12px, 1.4vw, 14px)`, height: `clamp(12px, 1.4vw, 14px)`, flexShrink: 0 }} />
                              <span>{property.location}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                            <span style={{
                              padding: `clamp(4px, 0.5vh, 6px) clamp(10px, 1.3vw, 12px)`,
                              fontSize: `clamp(11px, 1.2vw, 12px)`,
                              fontWeight: 600,
                              color: property.tagColor,
                              backgroundColor: getTagBackgroundColor(property.tagColor),
                              borderRadius: `clamp(12px, 1.5vw, 16px)`,
                              textTransform: 'uppercase'
                            }}>
                              {property.tag}
                            </span>
                            <span style={{
                              padding: `clamp(4px, 0.5vh, 6px) clamp(10px, 1.3vw, 12px)`,
                              fontSize: `clamp(11px, 1.2vw, 12px)`,
                              fontWeight: 500,
                              color: property.status === 'active' ? '#166534' : property.status === 'redeemed' ? '#10B981' : '#64748B',
                              backgroundColor: property.status === 'active' ? '#DCFCE7' : property.status === 'redeemed' ? '#ECFDF5' : '#F1F5F9',
                              borderRadius: `clamp(10px, 1.2vw, 12px)`,
                              textTransform: 'capitalize'
                            }}>
                              {property.status}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: `clamp(8px, 1vh, 10px)`, fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B' }}>
                          {property.status === 'active' && (
                            <>
                              {property.deadline && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(4px, 0.6vw, 6px)` }}>
                                  <div style={{ width: `clamp(5px, 0.6vw, 6px)`, height: `clamp(5px, 0.6vw, 6px)`, borderRadius: '50%', backgroundColor: property.deadlineColor || '#10B981', flexShrink: 0 }}></div>
                                  <span>Deadline: {property.deadline}</span>
                                </div>
                              )}
                              {property.interestRate && <div>Interest Rate: {property.interestRate}</div>}
                              {property.payoffToday && <div style={{ fontWeight: 600, color: '#0F172A' }}>Payoff Today: {property.payoffToday}</div>}
                              {property.minInvest && <div>Min. Invest: {property.minInvest}</div>}
                            </>
                          )}
                          {property.status === 'redeemed' && (
                            <>
                              {property.roi && <div>ROI: <span style={{ color: '#10B981', fontWeight: 600 }}>{property.roi}</span></div>}
                              {property.finalPayoff && <div style={{ fontWeight: 600, color: '#10B981' }}>Final Payoff: {property.finalPayoff}</div>}
                              {property.duration && <div>Duration: {property.duration}</div>}
                              {property.redeemedOn && <div>Redeemed On: {property.redeemedOn}</div>}
                            </>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: `clamp(8px, 1vw, 10px)`, paddingTop: `clamp(8px, 1vh, 12px)`, borderTop: '1px solid #E2E8F0', flexWrap: 'wrap' }}>
                          {property.buttons.map((btn, idx) => (
                            <button
                              key={idx}
                              style={{
                                flex: btn.type === 'primary' ? 1 : '0 1 auto',
                                padding: `clamp(8px, 1.2vh, 10px) clamp(12px, 1.5vw, 16px)`,
                                borderRadius: `clamp(4px, 0.6vw, 6px)`,
                                border: btn.type === 'primary' ? 'none' : '1px solid #E2E8F0',
                                backgroundColor: btn.type === 'primary' ? '#1E3A5F' : '#FFFFFF',
                                color: btn.type === 'primary' ? '#FFFFFF' : '#0F172A',
                                fontSize: `clamp(12px, 1.3vw, 13px)`,
                                fontWeight: 500,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {btn.text}
                            </button>
                          ))}
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
                alignItems: 'center',
                justifyContent: 'center',
                gap: `clamp(6px, 1vw, 8px)`,
                marginTop: `clamp(32px, 4vh, 48px)`,
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: `clamp(6px, 1vh, 8px) clamp(10px, 1.3vw, 12px)`,
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: currentPage === 1 ? '#CBD5E1' : '#64748B',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <ChevronLeft style={{ width: `clamp(16px, 1.8vw, 18px)`, height: `clamp(16px, 1.8vw, 18px)` }} />
                </button>

                {/* Page Numbers */}
                {(() => {
                  const pages: (number | string)[] = [];

                  if (totalPages <= 7) {
                    // Show all pages if 7 or fewer
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Always show first page
                    pages.push(1);

                    if (currentPage > 3) {
                      pages.push('...');
                    }

                    // Show pages around current page
                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);

                    for (let i = start; i <= end; i++) {
                      if (i !== 1 && i !== totalPages) {
                        pages.push(i);
                      }
                    }

                    if (currentPage < totalPages - 2) {
                      pages.push('...');
                    }

                    // Always show last page
                    pages.push(totalPages);
                  }

                  return pages.map((page, idx) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} style={{ padding: `0 clamp(6px, 1vw, 8px)`, color: '#64748B', fontSize: `clamp(12px, 1.3vw, 14px)`, flexShrink: 0 }}>
                          ...
                        </span>
                      );
                    }

                    const pageNum = page as number;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          padding: `clamp(6px, 1vh, 8px) clamp(10px, 1.3vw, 12px)`,
                          borderRadius: `clamp(6px, 0.8vw, 8px)`,
                          border: '1px solid #E2E8F0',
                          backgroundColor: currentPage === pageNum ? '#1E3A5F' : '#FFFFFF',
                          color: currentPage === pageNum ? '#FFFFFF' : '#64748B',
                          fontSize: `clamp(12px, 1.3vw, 14px)`,
                          fontWeight: currentPage === pageNum ? 600 : 500,
                          cursor: 'pointer',
                          minWidth: `clamp(36px, 4vw, 40px)`,
                          flexShrink: 0,
                          boxSizing: 'border-box'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  });
                })()}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: `clamp(6px, 1vh, 8px) clamp(10px, 1.3vw, 12px)`,
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: currentPage === totalPages ? '#CBD5E1' : '#64748B',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <ChevronRight style={{ width: `clamp(16px, 1.8vw, 18px)`, height: `clamp(16px, 1.8vw, 18px)` }} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Drawer for Mobile/Tablet */}


        {/* CSS for hiding scrollbars on mobile */}
        <style>
          {`
            @media (max-width: 639px) {
              /* Hide scrollbar for Chrome, Safari and Opera */
              .filter-buttons-scroll::-webkit-scrollbar {
                display: none;
              }
              /* Hide scrollbar for IE, Edge and Firefox */
              .filter-buttons-scroll {
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
              }
            }
          `}
        </style>
      </div>
    </>
  );
}

