import React, { CSSProperties, useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  FileText,
  Edit,
  X,
  Image as ImageIcon,
  Eye,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  User
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Download,
  Plus,
  Edit,
  Eye
};

interface SelectedDocument {
  name: string;
  size: string;
  date: string;
}

interface SelectedActivity {
  author: string;
  date: string;
  action: string;
}

interface SelectedPropertyData {
  id: string;
  address: string;
  city: string;
  status: string;
  statusBg: string;
  statusColor: string;
  listingType: string;
  images: number;
  propertyInfo: {
    type: string;
    status: string;
    listPrice: string;
    daysListed: number;
  };
  listingDetails: {
    listedDate: string;
    views: number;
    inquiries: number;
  };
  documents: SelectedDocument[];
  activityLog: SelectedActivity[];
  actionButtons: {
    edit: { icon: string; label: string };
    viewPublic: { icon: string; label: string };
  };
}

interface REOHeader {
  title: string;
  subtitle: string;
}

interface REOActionButton {
  label: string;
  icon: string;
}

interface REOActionButtons {
  export: REOActionButton;
  createListing: REOActionButton;
}

interface REOSummaryCard {
  label: string;
  value: string | number;
  subtext: string;
}

interface REOTab {
  key: string;
  label: string;
}

interface REOSearchPlaceholder {
  mobile: string;
  desktop: string;
}

interface REOFilterOption {
  label: string;
  options: string[];
}

interface REOFilters {
  status: REOFilterOption;
  type: REOFilterOption;
  moreFilters: string;
}

interface REOProperty {
  id: string;
  address: string;
  city: string;
  type: string;
  status: string;
  statusColor: string;
  price: string;
  daysOnMarket: number;
  strategy?: string;
  listPrice?: string;
  currentOffer?: string;
  listing_agent?: string;
  listing_date?: string;
  acquisition_date?: string;
  image?: string;
}

interface REOData {
  header: REOHeader;
  actionButtons: REOActionButtons;
  summaryCards: REOSummaryCard[];
  tabs: REOTab[];
  searchPlaceholder: REOSearchPlaceholder;
  filters: REOFilters;
  tableHeaders: string[];
  properties: REOProperty[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export default function REODisposition() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  
  const [data, setData] = useState<REOData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'for-sale' | 'for-lease' | 'all'>('all');
  const [selectedProperty, setSelectedProperty] = useState<REOProperty | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [moreFilters, setMoreFilters] = useState({
      city: '',
      minPrice: '',
      maxPrice: ''
  });

  // Modal State
  const [showListModal, setShowListModal] = useState(false);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [listingForm, setListingForm] = useState({
      id: '',
      listed_price: '',
      listing_agent: '',
      listing_date: new Date().toISOString().split('T')[0],
      disposition_strategy: 'sale'
  });
  const [listingLoading, setListingLoading] = useState(false);
  
  const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
            tab: selectedTab,
            search: searchTerm,
            status: statusFilter,
            type: typeFilter,
            city: moreFilters.city,
            min_price: moreFilters.minPrice,
            max_price: moreFilters.maxPrice
        };
        const response = await api.get('/admin/reo/dashboard-data', { params });
        if (response.data && response.data.reoDisposition) {
          setData(response.data.reoDisposition);
          // Auto-select first property if available and none selected
          if (!selectedProperty && response.data.reoDisposition.properties && response.data.reoDisposition.properties.length > 0) {
              // setSelectedProperty(response.data.reoDisposition.properties[0]);
          }
        } else {
          setError('Failed to load REO disposition data');
        }
      } catch (err) {
        console.error('Error fetching REO disposition data:', err);
        setError('An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        fetchData();
    }, 500); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [selectedTab, statusFilter, typeFilter, searchTerm, moreFilters]);

  useEffect(() => {
      if (showListModal) {
          const fetchAllProperties = async () => {
              try {
                  const response = await api.get('/admin/reo/all-properties');
                  setAllProperties(response.data);
              } catch (err) {
                  console.error('Failed to fetch all properties:', err);
              }
          };
          fetchAllProperties();
      }
  }, [showListModal]);

  const handleExport = async () => {
      try {
          const params = {
            tab: selectedTab,
            status: statusFilter,
            type: typeFilter,
            city: moreFilters.city,
            min_price: moreFilters.minPrice,
            max_price: moreFilters.maxPrice
        };
          const response = await api.get('/admin/reo/export', { 
              params,
              responseType: 'blob' 
          });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `reo-disposition-${new Date().toISOString().split('T')[0]}.csv`);
          document.body.appendChild(link);
          link.click();
          link.remove();
      } catch (err) {
          console.error('Export failed:', err);
          alert('Failed to export report');
      }
  };

  const handleListProperty = async () => {
      if (!listingForm.id || !listingForm.listed_price || !listingForm.listing_date) {
          alert('Please fill in all required fields');
          return;
      }
      setListingLoading(true);
      try {
          await api.post('/admin/reo/list-property', listingForm);
          setShowListModal(false);
          setListingForm({
            id: '',
            listed_price: '',
            listing_agent: '',
            listing_date: new Date().toISOString().split('T')[0],
            disposition_strategy: 'sale'
        });
          fetchData();
          alert('Property listed successfully');
      } catch (err) {
          console.error('Listing failed:', err);
          alert('Failed to list property');
      } finally {
          setListingLoading(false);
      }
  };

  if (loading && !data) {
    return (
      <div style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        padding: 0,
        overflowX: 'hidden'
      }}>
        <AdminNav />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
          flexDirection: 'column',
          gap: 16
        }}>
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <div style={{ color: '#64748B' }}>Loading REO properties...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        padding: 0,
        overflowX: 'hidden'
      }}>
        <AdminNav />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
          flexDirection: 'column',
          gap: 16
        }}>
          <AlertCircle className="text-red-500" size={32} />
          <div style={{ color: '#EF4444' }}>{error}</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Extract data from JSON
  const reoData = data;
  const header = reoData.header || { title: '', subtitle: '' };
  
  const rawActionButtons = reoData.actionButtons || {};
  const actionButtons = {
      export: rawActionButtons?.export || { label: 'Export', icon: 'Download' },
      createListing: rawActionButtons?.createListing || { label: 'Create Listing', icon: 'Plus' }
  };

  const rawSummaryCards = Array.isArray(reoData.summaryCards) ? reoData.summaryCards : [];
  const summaryCards = rawSummaryCards.map((card: any) => ({
    label: card?.label || '',
    value: card?.value || 0,
    subtext: card?.subtext || ''
  }));

  const rawTabs = Array.isArray(reoData.tabs) ? reoData.tabs : [];
  const tabs = rawTabs.map((tab: any) => ({
    key: tab?.key || '',
    label: tab?.label || ''
  }));
  
  const rawSearchPlaceholder = reoData.searchPlaceholder || {};
  const searchPlaceholder = {
      mobile: rawSearchPlaceholder?.mobile || 'Search...',
      desktop: rawSearchPlaceholder?.desktop || 'Search properties...'
  };

  const rawFilters = reoData.filters || {};
  const filters = {
      status: {
          label: rawFilters?.status?.label || 'Status',
          options: Array.isArray(rawFilters?.status?.options) ? rawFilters.status.options : []
      },
      type: {
          label: rawFilters?.type?.label || 'Type',
          options: Array.isArray(rawFilters?.type?.options) ? rawFilters.type.options : []
      },
      moreFilters: rawFilters?.moreFilters || 'More Filters'
  };

  const tableHeaders = Array.isArray(reoData.tableHeaders) ? reoData.tableHeaders : [];
  
  const rawProperties = Array.isArray(reoData.properties) ? reoData.properties : [];
  const properties = rawProperties.map((property: any) => ({
    id: property?.id || '',
    address: property?.address || '',
    city: property?.city || '',
    type: property?.type || '',
    status: property?.status || '',
    statusColor: property?.statusColor || '',
    price: property?.price || '',
    daysOnMarket: property?.daysOnMarket || 0,
    strategy: property?.strategy || '',
    listPrice: property?.listPrice || '',
    listing_agent: property?.listing_agent || '',
    listing_date: property?.listing_date || '',
    acquisition_date: property?.acquisition_date || '',
    image: property?.image || ''
  }));
  
  // Construct selectedPropertyData dynamically
  const selectedPropertyData: SelectedPropertyData | null = selectedProperty ? {
    id: selectedProperty.id,
    address: selectedProperty.address,
    city: selectedProperty.city,
    status: selectedProperty.status,
    statusBg: `${selectedProperty.statusColor}15`, // 10% opacity
    statusColor: selectedProperty.statusColor,
    listingType: selectedProperty.strategy === 'sale' ? 'For Sale' : (selectedProperty.strategy === 'lease' ? 'For Lease' : 'Hold'),
    images: selectedProperty.image ? 1 : 0,
    propertyInfo: {
        type: selectedProperty.type,
        status: selectedProperty.status,
        listPrice: selectedProperty.listPrice ? `$${Number(selectedProperty.listPrice).toLocaleString()}` : 'N/A',
        daysListed: selectedProperty.daysOnMarket || 0
    },
    listingDetails: {
        listedDate: selectedProperty.listing_date || 'N/A',
        views: 24, // Mock
        inquiries: 3 // Mock
    },
    documents: [ // Mock
        { name: 'Listing Agreement.pdf', size: '2.4 MB', date: 'Oct 24, 2023' },
        { name: 'Property Disclosures.pdf', size: '1.8 MB', date: 'Oct 24, 2023' }
    ],
    activityLog: [ // Mock
        { author: 'System', date: '2 hours ago', action: 'Listing status updated to Active' },
        { author: 'Sarah Wilson', date: '1 day ago', action: 'Updated listing price' }
    ],
    actionButtons: {
        edit: { icon: 'Edit', label: 'Edit Listing' },
        viewPublic: { icon: 'Eye', label: 'View Public Page' }
    }
  } : null;

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
          maxWidth: isMobile ? '100%' : '100%',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Page Header */}
        <div style={{ marginBottom: isMobile ? 16 : 24 }}>
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
            marginBottom: isMobile ? 16 : 24
          }}
        >
          {(summaryCards || []).map((card: REOSummaryCard, idx: number) => (
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
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
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
                    fontSize: isMobile ? 'clamp(20px, 5vw, 24px)' : '24px',
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
                  color: '#64748B'
                }}
              >
                {card.subtext}
              </div>
            </div>
          ))}
        </div>

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Filter Tabs */}
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
              {(tabs || []).map((tab: REOTab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  style={{
                    padding: isMobile ? '8px 12px' : '10px 16px',
                    fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                    fontWeight: selectedTab === tab.key ? 600 : 500,
                    color: selectedTab === tab.key ? '#1E3A5F' : '#64748B',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: selectedTab === tab.key ? '2px solid #1E3A5F' : '2px solid transparent',
                    cursor: 'pointer',
                    marginBottom: -1,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search and Filter Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? 8 : 12,
                    flexWrap: isMobile ? 'wrap' : 'nowrap'
                }}
                >
                <div
                    style={{
                    flexGrow: 1,
                    flexShrink: 1,
                    flexBasis: 0,
                    position: 'relative'
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={isMobile ? searchPlaceholder.mobile : searchPlaceholder.desktop}
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
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
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
                    {(filters.status.options || []).map((option: string) => (
                    <option key={option} value={option}>{option === 'All' ? filters.status.label : option}</option>
                    ))}
                </select>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
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
                    {(filters.type.options || []).map((option: string) => (
                    <option key={option} value={option}>{option === 'All' ? filters.type.label : option}</option>
                    ))}
                </select>
                <button
                    onClick={() => setShowMoreFilters(!showMoreFilters)}
                    style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: isMobile ? '8px 10px' : '8px 12px',
                    fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    backgroundColor: showMoreFilters ? '#EFF6FF' : '#FFFFFF',
                    color: showMoreFilters ? '#1E3A5F' : '#0F172A',
                    cursor: 'pointer',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: isMobile ? 'center' : 'flex-start',
                    whiteSpace: 'nowrap'
                    }}
                >
                    <Filter style={{ width: 14, height: 14, flexShrink: 0 }} />
                    <span>{filters.moreFilters}</span>
                    {showMoreFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                </div>
                
                {/* More Filters Panel */}
                {showMoreFilters && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: 12,
                        padding: 16,
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8
                    }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>City</label>
                            <input 
                                type="text" 
                                placeholder="Filter by City"
                                value={moreFilters.city}
                                onChange={(e) => setMoreFilters({...moreFilters, city: e.target.value})}
                                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 13 }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>Min Price</label>
                            <input 
                                type="number" 
                                placeholder="Min Price"
                                value={moreFilters.minPrice}
                                onChange={(e) => setMoreFilters({...moreFilters, minPrice: e.target.value})}
                                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 13 }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>Max Price</label>
                            <input 
                                type="number" 
                                placeholder="Max Price"
                                value={moreFilters.maxPrice}
                                onChange={(e) => setMoreFilters({...moreFilters, maxPrice: e.target.value})}
                                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 13 }}
                            />
                        </div>
                    </div>
                )}
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
                onClick={handleExport}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: isMobile ? '10px 14px' : '8px 14px',
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  color: '#0F172A',
                  fontSize: isMobile ? '13px' : '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  justifyContent: 'center'
                }}
              >
                <Download style={{ width: 14, height: 14 }} />
                <span>{actionButtons.export.label}</span>
              </button>
              <button
                onClick={() => setShowListModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: isMobile ? '10px 14px' : '8px 14px',
                  borderRadius: 8,
                  backgroundColor: '#1E3A5F',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: isMobile ? '13px' : '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  justifyContent: 'center',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
              >
                <Plus style={{ width: 14, height: 14 }} />
                <span>{actionButtons.createListing.label}</span>
              </button>
            </div>

            {/* Properties Table */}
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
                    {(tableHeaders || []).map((header: string, idx: number) => (
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
                          minWidth: isMobile 
                            ? (idx === 0 ? 40 : idx === 1 ? 100 : idx === 2 ? 150 : idx === 3 ? 100 : idx === 4 ? 80 : idx === 5 ? 100 : idx === 6 ? 90 : 60)
                            : 'auto'
                        }}
                      >
                        {header === '' ? <input type="checkbox" /> : header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(properties || []).map((property: REOProperty, idx: number) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedProperty(property)}
                      style={{
                        borderBottom: idx < properties.length - 1 ? '1px solid #E2E8F0' : 'none',
                        cursor: 'pointer',
                        backgroundColor: selectedProperty?.address === property.address ? '#F8FAFC' : '#FFFFFF',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      <td style={{ padding: isMobile ? '12px' : '16px' }}>
                        <input type="checkbox" />
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '16px' }}>
                        <div
                          style={{
                            fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                            fontWeight: 500,
                            color: '#0F172A',
                            marginBottom: 2,
                            wordBreak: 'break-word'
                          }}
                        >
                          {property.address}
                        </div>
                        <div
                          style={{
                            fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px',
                            color: '#64748B'
                          }}
                        >
                          {property.city} • {property.id}
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px',
                            fontWeight: 600,
                            borderRadius: 4,
                            backgroundColor: `${property.statusColor}15`,
                            color: property.statusColor,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {property.status}
                        </span>
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '16px' }}>
                        <div
                          style={{
                            fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                            color: '#0F172A',
                            wordBreak: 'break-word'
                          }}
                        >
                          {property.type}
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '16px' }}>
                        <div
                          style={{
                            fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                            fontWeight: 600,
                            color: '#0F172A',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {property.price}
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '16px' }}>
                        <div
                          style={{
                            fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                            fontWeight: 600,
                            color: '#0F172A',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {property.currentOffer || '$0'}
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '16px' }}>
                        <div
                          style={{
                            fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                            color: '#64748B'
                          }}
                        >
                          {property.daysOnMarket}
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '16px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          style={{
                            padding: '4px 8px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            color: '#64748B'
                          }}
                        >
                          <MoreHorizontal style={{ width: 16, height: 16 }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar */}
          {selectedPropertyData && (
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
              {/* Property Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 16
                }}
              >
                <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 8
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 4,
                        backgroundColor: selectedPropertyData.statusBg,
                        color: selectedPropertyData.statusColor
                      }}
                    >
                      {selectedPropertyData.status}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#64748B'
                      }}
                    >
                      {selectedPropertyData.listingType}
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
                    {selectedPropertyData.address}
                  </h3>
                  <p
                    style={{
                      fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px',
                      color: '#64748B',
                      marginBottom: 4
                    }}
                  >
                    {selectedPropertyData.id}
                  </p>
                  <p
                    style={{
                      fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px',
                      color: '#64748B'
                    }}
                  >
                    {selectedPropertyData.city}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProperty(null)}
                  style={{
                    padding: 4,
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: '#64748B'
                  }}
                >
                  <X style={{ width: 18, height: 18 }} />
                </button>
              </div>

              {/* Property Image Gallery */}
              <div
                style={{
                  width: '100%',
                  height: isMobile ? 150 : 200,
                  backgroundColor: '#F1F5F9',
                  borderRadius: 8,
                  marginBottom: isMobile ? 12 : 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <ImageIcon style={{ width: 48, height: 48, color: '#CBD5E1' }} />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: '#FFFFFF',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 500
                }}
              >
                {selectedPropertyData.images} photos
              </div>
              </div>

              {/* Property Details */}
              <div style={{ marginBottom: isMobile ? 16 : 20 }}>
                <h4
                  style={{
                    fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: isMobile ? 10 : 12
                  }}
                >
                  Property Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 10 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Type</span>
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A' }}>
                      {selectedPropertyData.propertyInfo.type}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Status</span>
                    <span
                      style={{
                        fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: selectedPropertyData.statusBg,
                        color: selectedPropertyData.statusColor
                      }}
                    >
                      {selectedPropertyData.propertyInfo.status}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>List Price</span>
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 600, color: '#0F172A' }}>
                      {selectedPropertyData.propertyInfo.listPrice}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Days Listed</span>
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A' }}>{selectedPropertyData.propertyInfo.daysListed}</span>
                  </div>
                </div>
              </div>

              {/* Listing Details */}
              <div style={{ marginBottom: isMobile ? 16 : 20 }}>
                <h4
                  style={{
                    fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: isMobile ? 10 : 12
                  }}
                >
                  Listing Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 10 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Listed Date</span>
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A' }}>
                      {selectedPropertyData.listingDetails.listedDate}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Views</span>
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A' }}>{selectedPropertyData.listingDetails.views}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Inquiries</span>
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A' }}>{selectedPropertyData.listingDetails.inquiries}</span>
                  </div>
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
                      fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                      fontWeight: 600,
                      color: '#0F172A'
                    }}
                  >
                    Documents
                  </h4>
                  <button
                    style={{
                      padding: '4px 8px',
                      fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px',
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
                  {(selectedPropertyData.documents || []).map((doc: SelectedDocument, idx: number) => (
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
                      <FileText style={{ width: 16, height: 16, color: '#64748B' }} />
                      <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: '#0F172A' }}>
                          {doc.name}
                        </div>
                        <div style={{ fontSize: 10, color: '#64748B' }}>{doc.size} • {doc.date}</div>
                      </div>
                      <Download style={{ width: 14, height: 14, color: '#64748B', cursor: 'pointer' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Log */}
              <div>
                <h4
                  style={{
                    fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: isMobile ? 10 : 12
                  }}
                >
                  Activity Log
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12 }}>
                  {(selectedPropertyData.activityLog || []).map((activity: SelectedActivity, idx: number) => (
                    <div key={idx}>
                      <div
                        style={{
                          fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px',
                          fontWeight: 600,
                          color: '#0F172A',
                          marginBottom: 4
                        }}
                      >
                        {activity.author}
                      </div>
                      <div style={{ fontSize: isMobile ? 'clamp(8px, 1.8vw, 10px)' : '10px', color: '#64748B', marginBottom: 4 }}>
                        {activity.date}
                      </div>
                      <div style={{ fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px', color: '#64748B', wordBreak: 'break-word' }}>
                        {activity.action}
                      </div>
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
                      fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px',
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
                      fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px',
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
                  marginTop: isMobile ? 16 : 20,
                  paddingTop: isMobile ? 16 : 20,
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? 8 : 8
                }}
              >
                <button
                  style={{
                    width: '100%',
                    padding: isMobile ? '10px 14px' : '10px 16px',
                    fontSize: isMobile ? 'clamp(12px, 3vw, 13px)' : '13px',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#1E3A5F',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  {React.createElement(iconMap[selectedPropertyData.actionButtons.edit.icon], { style: { width: 16, height: 16, flexShrink: 0 } })}
                  {selectedPropertyData.actionButtons.edit.label}
                </button>
                <button
                  style={{
                    width: '100%',
                    padding: isMobile ? '10px 14px' : '10px 16px',
                    fontSize: isMobile ? 'clamp(12px, 3vw, 13px)' : '13px',
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  {React.createElement(iconMap[selectedPropertyData.actionButtons.viewPublic.icon], { style: { width: 16, height: 16, flexShrink: 0 } })}
                  {selectedPropertyData.actionButtons.viewPublic.label}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* List Property Modal */}
      {showListModal && (
          <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20
          }}>
              <div style={{
                  backgroundColor: '#fff', borderRadius: 12, padding: 24,
                  width: '100%', maxWidth: 500, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>List Property</h3>
                      <button onClick={() => setShowListModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <X size={20} color="#64748B" />
                      </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4 }}>Select Property</label>
                          <select
                              value={listingForm.id}
                              onChange={(e) => setListingForm({...listingForm, id: e.target.value})}
                              style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14 }}
                          >
                              <option value="">Select a property...</option>
                              {/* Use properties from data or fallback to empty array */}
                              {allProperties.map((p: any) => (
                                  <option key={p.id} value={p.id}>{p.address}</option>
                              ))}
                          </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div>
                              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4 }}>List Price</label>
                              <div style={{ position: 'relative' }}>
                                  <DollarSign size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                                  <input 
                                      type="number" 
                                      value={listingForm.listed_price}
                                      onChange={(e) => setListingForm({...listingForm, listed_price: e.target.value})}
                                      style={{ width: '100%', padding: '10px 10px 10px 30px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14 }}
                                      placeholder="0.00"
                                  />
                              </div>
                          </div>
                          <div>
                              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4 }}>Listing Date</label>
                              <div style={{ position: 'relative' }}>
                                  <Calendar size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                                  <input 
                                      type="date" 
                                      value={listingForm.listing_date}
                                      onChange={(e) => setListingForm({...listingForm, listing_date: e.target.value})}
                                      style={{ width: '100%', padding: '10px 10px 10px 30px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14 }}
                                  />
                              </div>
                          </div>
                      </div>

                      <div>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4 }}>Listing Agent</label>
                          <div style={{ position: 'relative' }}>
                              <User size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                              <input 
                                  type="text" 
                                  value={listingForm.listing_agent}
                                  onChange={(e) => setListingForm({...listingForm, listing_agent: e.target.value})}
                                  placeholder="Agent Name"
                                  style={{ width: '100%', padding: '10px 10px 10px 30px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14 }}
                              />
                          </div>
                      </div>
                      
                      <div>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4 }}>Strategy</label>
                          <div style={{ display: 'flex', gap: 12 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                                  <input 
                                      type="radio" 
                                      name="strategy" 
                                      value="sale" 
                                      checked={listingForm.disposition_strategy === 'sale'} 
                                      onChange={(e) => setListingForm({...listingForm, disposition_strategy: e.target.value})}
                                  /> Sale
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                                  <input 
                                      type="radio" 
                                      name="strategy" 
                                      value="lease" 
                                      checked={listingForm.disposition_strategy === 'lease'} 
                                      onChange={(e) => setListingForm({...listingForm, disposition_strategy: e.target.value})}
                                  /> Lease
                              </label>
                          </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                          <button 
                              onClick={() => setShowListModal(false)}
                              style={{
                                  padding: '10px 16px', borderRadius: 8, border: '1px solid #E2E8F0', backgroundColor: '#fff',
                                  color: '#64748B', fontSize: 14, fontWeight: 500, cursor: 'pointer'
                              }}
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={handleListProperty}
                              disabled={listingLoading}
                              style={{
                                  padding: '10px 16px', borderRadius: 8, border: 'none', backgroundColor: '#1E3A5F',
                                  color: '#fff', fontSize: 14, fontWeight: 500, cursor: listingLoading ? 'not-allowed' : 'pointer',
                                  opacity: listingLoading ? 0.7 : 1
                              }}
                          >
                              {listingLoading ? 'Listing...' : 'Confirm Listing'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

