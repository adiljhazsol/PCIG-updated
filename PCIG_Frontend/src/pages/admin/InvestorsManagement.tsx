import React, {
  CSSProperties,
  useState,
  useEffect
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
  ChevronDown,
  Loader2,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Download,
  Plus
};

interface SummaryCard {
  label: string;
  value: string;
  subtext: string;
  subtextColor?: string;
}

interface TableRow {
  id: number;
  name: string;
  email: string;
  status: string;
  statusBg: string;
  statusColor: string;
  kyc: string;
  kycBg: string;
  kycColor: string;
  funding: string;
  fundingBg: string;
  fundingColor: string;
  method: string;
  total: string;
  registration: string;
  lastActivity: string;
}

interface Activity {
  date: string;
  action: string;
}

interface ContactInfo {
  email: string;
  emailVerified: boolean;
  phone: string;
  address: {
    line1: string;
    line2: string;
  };
}

interface FundingRequest {
  title: string;
  amount: string;
  method: string;
  bank: string;
  date: string;
}

interface KycStatus {
  status: string;
  statusColor: string;
  statusBg: string;
  submitted: string;
  approvedBy: string;
}

interface InvestmentSummary {
  totalInvested: string;
  currentBalance: string;
  properties: string | number;
  funds: string | number;
}

interface SelectedInvestor {
  name: string;
  id: string;
  type: string;
  status: string;
  statusBg: string;
  statusColor: string;
  sidebarTabs: string[];
  contactInfo: ContactInfo;
  recentActivity: Activity[];
  fundingRequest?: FundingRequest;
  kycStatus?: KycStatus;
  investmentSummary?: InvestmentSummary;
}

interface ActionButton {
  label: string;
  icon: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: string[];
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface InvestorsData {
  header: {
    title: string;
    breadcrumb?: string;
    subtitle?: string;
  };
  actionButtons: {
    invite: ActionButton;
    export: ActionButton;
  };
  summaryCards: SummaryCard[];
  tabs: string[];
  searchPlaceholder: string;
  filters: FilterConfig[];
  moreFiltersLabel: string;
  tableHeaders: string[];
  tableRows: TableRow[];
  selectedInvestor: SelectedInvestor | null;
  pagination?: PaginationMeta;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: 'none',
          padding: '6px 30px 6px 10px',
          borderRadius: 8,
          border: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          fontSize: 12,
          color: '#475569',
          cursor: 'pointer',
          outline: 'none',
          minWidth: 120
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown 
        style={{ 
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 14, 
          height: 14, 
          color: '#94A3B8',
          pointerEvents: 'none'
        }} 
      />
    </div>
  );
}

export default function InvestorsManagement() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const navigate = useNavigate();
  const isMobileOrTablet = isMobile || isTablet;

  const [data, setData] = useState<InvestorsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Investors');
  const [kycFilter, setKycFilter] = useState('All Levels');
  const [accreditationFilter, setAccreditationFilter] = useState('All Types');
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/investors/dashboard-data', {
        params: {
          search: searchTerm,
          status: statusFilter,
          kyc: kycFilter,
          accreditation: accreditationFilter,
          page: page
        }
      });

      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError('Failed to load investor data');
      }
    } catch (err) {
      console.error('Error fetching investor data:', err);
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
  }, [searchTerm, statusFilter, kycFilter, accreditationFilter, page]);

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/investors/export', {
        responseType: 'blob',
        params: {
          search: searchTerm,
          status: statusFilter,
          kyc: kycFilter,
          accreditation: accreditationFilter,
        }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `investors_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export investors.');
    }
  };

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC' }}>
        <Loader2 className="animate-spin" size={48} color="#1E3A5F" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC', gap: 16 }}>
        <AlertCircle size={48} color="#EF4444" />
        <p style={{ color: '#64748B', fontSize: 16 }}>{error || 'No data available'}</p>
        <button 
          onClick={fetchData}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1E3A5F',
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

  // Extract data from API response
  const header = data?.header || { title: '', subtitle: '' };
  const actionButtons = data?.actionButtons || { invite: { label: 'Invite Investor', icon: 'Plus' }, export: { label: 'Export', icon: 'Download' } };
  const summaryCards = data?.summaryCards || [];
  const tabs = data?.tabs || [];
  const tableHeaders = data?.tableHeaders || [];
  const tableRows = data?.tableRows || [];
  // const selectedInvestor = data?.selectedInvestor || null; // Not used in this view yet
  const pagination = data?.pagination;
  const filterConfigs = data?.filters || [];

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
              onClick={handleExport}
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
              {React.createElement(iconMap[actionButtons?.invite?.icon] || Plus, { style: { width: 16, height: 16 } })}
              {actionButtons?.invite?.label || 'Invite Investor'}
            </button>
          </div>
        </div>

        {/* Main Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
              {summaryCards.map((card: SummaryCard, idx: number) => (
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
              {/* Tabs (Mapped to Status Filter) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  fontSize: 13,
                  flexWrap: 'wrap'
                }}
              >
                {tabs.map((tab: string) => {
                  const isActive = statusFilter === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                          setStatusFilter(tab);
                          setPage(1);
                      }}
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
                    placeholder={data?.searchPlaceholder || 'Search...'}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                    }}
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
                    {/* Render dynamic filters from backend */}
                    {filterConfigs.map((config) => {
                        // Skip 'status' as it's handled by tabs
                        if (config.key === 'status') return null;

                        let currentValue = 'All';
                        let onChangeHandler = (val: string) => {};

                        if (config.key === 'kyc') {
                            currentValue = kycFilter;
                            onChangeHandler = (val) => { setKycFilter(val); setPage(1); };
                        } else if (config.key === 'accreditation') {
                            currentValue = accreditationFilter;
                            onChangeHandler = (val) => { setAccreditationFilter(val); setPage(1); };
                        }

                        return (
                            <FilterSelect 
                                key={config.key}
                                label={config.label}
                                value={currentValue}
                                options={config.options}
                                onChange={onChangeHandler}
                            />
                        );
                    })}
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
                        {tableHeaders.map((header: string, idx: number) => (
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
                      {loading ? (
                          <tr>
                              <td colSpan={tableHeaders.length} style={{ padding: 40, textAlign: 'center' }}>
                                  <Loader2 className="animate-spin" style={{ margin: '0 auto', color: '#94A3B8' }} />
                              </td>
                          </tr>
                      ) : tableRows.length === 0 ? (
                          <tr>
                              <td colSpan={tableHeaders.length} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                                  No investors found.
                              </td>
                          </tr>
                      ) : (
                          tableRows.map((row: TableRow, idx: number) => (
                            <tr
                              key={row.id}
                              style={{
                                backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                                borderBottom: '1px solid #E2E8F0',
                                cursor: 'pointer'
                              }}
                              onClick={() => navigate(`/admin/investors/${row.id}`)}
                            >
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
                                      backgroundColor: '#CBD5E1'
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
                              <td style={{ padding: '10px 12px', color: '#64748B' }}>{row.method}</td>
                              <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0F172A' }}>{row.total}</td>
                              <td style={{ padding: '10px 12px', color: '#64748B' }}>{row.registration}</td>
                              <td style={{ padding: '10px 12px', color: '#64748B' }}>{row.lastActivity}</td>
                              <td style={{ padding: '10px 12px' }}>
                                <MoreHorizontal style={{ width: 16, height: 16, color: '#94A3B8' }} />
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            borderTop: '1px solid #E2E8F0',
                            backgroundColor: '#FFFFFF'
                        }}
                    >
                        <div style={{ fontSize: 13, color: '#64748B' }}>
                            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                disabled={pagination.current_page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #E2E8F0',
                                    backgroundColor: pagination.current_page === 1 ? '#F1F5F9' : '#FFFFFF',
                                    color: pagination.current_page === 1 ? '#94A3B8' : '#475569',
                                    cursor: pagination.current_page === 1 ? 'not-allowed' : 'pointer',
                                    fontSize: 13
                                }}
                            >
                                <ChevronLeft size={14} /> Previous
                            </button>
                            <button
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #E2E8F0',
                                    backgroundColor: pagination.current_page === pagination.last_page ? '#F1F5F9' : '#FFFFFF',
                                    color: pagination.current_page === pagination.last_page ? '#94A3B8' : '#475569',
                                    cursor: pagination.current_page === pagination.last_page ? 'not-allowed' : 'pointer',
                                    fontSize: 13
                                }}
                            >
                                Next <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                            </button>
                        </div>
                    </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
