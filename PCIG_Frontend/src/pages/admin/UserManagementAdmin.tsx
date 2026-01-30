import { CSSProperties, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, MoreHorizontal, Loader2, AlertCircle } from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import api from '../../services/api';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

export default function UserManagementAdmin() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [kycFilter, setKycFilter] = useState('All');
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  const fetchData = async (query = searchQuery, role = roleFilter, status = statusFilter, kyc = kycFilter) => {
    try {
      // setLoading(true); // Optional: keep previous data while loading or show spinner
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (role && role !== 'All Roles') params.append('role', role);
      if (status && status !== 'All Statuses') params.append('status', status);
      if (kyc && kyc !== 'All') params.append('kyc', kyc);

      const response = await api.get(`/admin/users/dashboard-data?${params.toString()}`);
      if (response.data.success) {
        setData(response.data.data.userManagementAdmin);
      } else {
        setError('Failed to load user management data');
      }
    } catch (err) {
      console.error('Error fetching user management data:', err);
      setError('An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [roleFilter, statusFilter, kycFilter]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Skip initial empty search if loading initially
    if (loading && !searchQuery) return;

    searchTimeoutRef.current = setTimeout(() => {
      fetchData(searchQuery);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC' }}>
        <Loader2 className="animate-spin" size={48} color="#1E3A5F" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC', gap: 16 }}>
        <AlertCircle size={48} color="#EF4444" />
        <p style={{ color: '#64748B', fontSize: 16 }}>{error || 'No data available'}</p>
        <button 
          onClick={() => window.location.reload()}
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

  const header = data?.header || {};
  const pendingBanner = data?.pendingBanner || { label: 'Pending KYC Verifications', count: 0, buttonText: 'View All' };
  const bannerColumns = data?.bannerColumns || [];
  const bannerRows = data?.bannerRows || [];
  const search = data?.search || {
    placeholder: 'Search users...',
    filters: {
      role: { label: 'Role', options: ['All Roles'] },
      status: { label: 'Status', options: ['All Statuses'] },
      kyc: { label: 'KYC', options: ['All'] }
    },
    clearFilters: 'Clear Filters'
  };
  const table = data?.table || {
    headers: [],
    rows: [],
    title: 'Users',
    countLabel: '',
    columnsButton: 'Columns'
  };

  const pageWrapperStyle: CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    width: '100%',
    maxWidth: '100vw',
    margin: 0,
    padding: 0,
    overflowX: 'hidden'
  };

  const mainContainerStyle: CSSProperties = {
    padding: isMobile ? '20px 16px' : isTablet ? '24px 24px' : '32px 48px',
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    boxSizing: 'border-box'
  };

  const cardStyle: CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E5E7EB',
    boxSizing: 'border-box'
  };

  return (
    <div style={pageWrapperStyle}>
      <AdminNav />

      <div style={mainContainerStyle}>
        {/* Header */}
        <div style={{ marginBottom: isMobileOrTablet ? 16 : 24 }}>
          <h1
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 700,
              color: '#0F172A',
              marginTop: 0,
              marginRight: 0,
              marginBottom: 4,
              marginLeft: 0
            }}
          >
            {header.title}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: '#64748B',
              margin: 0
            }}
          >
            {header.subtitle}
          </p>
        </div>

        {/* Pending banner and actions row */}
        <div
          style={{
            ...cardStyle,
            borderColor: '#FCD34D',
            backgroundColor: '#FFFBEB',
            padding: isMobileOrTablet ? 12 : 16,
            marginBottom: isMobileOrTablet ? 16 : 24
          }}
        >
          {/* Banner header */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              marginBottom: 8,
              gap: isMobile ? 8 : 0
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 14,
                fontWeight: 500,
                color: '#92400E'
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: '#F59E0B'
                }}
              />
              <span>
                {pendingBanner.label}{' '}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 20,
                    padding: '2px 8px',
                    borderRadius: 999,
                    backgroundColor: '#F97316',
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 600
                  }}
                >
                  {pendingBanner.count}
                </span>
              </span>
            </div>
            <button
              onClick={() => {
                setKycFilter('Pending');
                // Scroll to table
                document.querySelector('input[type="text"]')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#2563EB',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {pendingBanner.action}
            </button>
          </div>

          {/* Banner table */}
          <div
            style={{
              marginTop: 4,
              borderRadius: 10,
              border: '1px solid #FCD34D',
              overflow: 'hidden',
              backgroundColor: '#FEF3C7'
            }}
          >
            <div
              style={{
                width: '100%',
                overflowX: isMobileOrTablet ? 'auto' : 'visible',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13,
                  minWidth: isMobileOrTablet ? 700 : undefined
                }}
              >
              <thead>
                <tr
                  style={{
                    backgroundColor: '#FEF3C7',
                    borderBottom: '1px solid #FDE68A'
                  }}
                >
                  {bannerColumns.map((col: string) => (
                    <th
                      key={col}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: '#92400E'
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bannerRows.map((row: any, idx: number) => (
                  <tr
                    key={row.id}
                    style={{
                      backgroundColor: idx === 0 ? '#FEF9C3' : '#FEF3C7',
                      borderBottom:
                        idx === bannerRows.length - 1 ? 'none' : '1px solid #FDE68A'
                    }}
                  >
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '999px',
                            backgroundColor: '#FDE68A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#92400E'
                          }}
                        >
                          {row.name
                            .split(' ')
                            .map((p: string) => p[0])
                            .join('')}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: '#0F172A'
                            }}
                          >
                            {row.name}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: '#6B7280'
                            }}
                          >
                            {row.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: '#1F2937',
                          backgroundColor: '#DBEAFE',
                          borderRadius: 999,
                          padding: '2px 10px'
                        }}
                      >
                        {row.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: '#374151' }}>
                      {row.submitted}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: '#374151' }}>
                      {row.documentsLabel}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <button
                        onClick={() => {
                          setSearchQuery(row.email);
                          document.querySelector('input[type="text"]')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 999,
                          border: '1px solid #FACC15',
                          backgroundColor: '#F97316',
                          color: '#FFFFFF',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Search and filters card */}
        <div
          style={{
            ...cardStyle,
            padding: isMobileOrTablet ? 12 : 16,
            marginBottom: isMobileOrTablet ? 16 : 24
          }}
        >
          {/* Search bar */}
          <div
            style={{
              marginBottom: 16
            }}
          >
            <div style={{ position: 'relative' }}>
              <Search
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 18,
                  height: 18,
                  color: '#9CA3AF'
                }}
              />
              <input
                type="text"
                placeholder={search.placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  borderRadius: 999,
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#F9FAFB',
                  fontSize: 14,
                  color: '#111827',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Filters row */}
          <div
            style={{
              display: 'flex',
              alignItems: isMobile ? 'stretch' : 'center',
              flexWrap: isMobileOrTablet ? 'wrap' : 'nowrap',
              gap: 12
            }}
          >
            {/* Role */}
            <FilterSelect
              label={search.filters.role.label}
              value={roleFilter}
              options={search.filters.role.options}
              onChange={(val) => setRoleFilter(val)}
            />
            {/* Status */}
            <FilterSelect
              label={search.filters.status.label}
              value={statusFilter}
              options={search.filters.status.options}
              onChange={(val) => setStatusFilter(val)}
            />
            {/* KYC */}
            <FilterSelect 
              label={search.filters.kyc.label} 
              value={kycFilter}
              options={search.filters.kyc.options}
              onChange={(val) => setKycFilter(val)}
            />

            <div style={{ flex: 1, minWidth: 0 }} />

            <button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('All Roles');
                setStatusFilter('All Statuses');
                setKycFilter('All');
              }}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 13,
                fontWeight: 500,
                color: '#6B7280',
                cursor: 'pointer'
              }}
            >
              {search.clearFilters}
            </button>
          </div>
        </div>

        {/* Main table card */}
        <div
          style={{
            ...cardStyle,
            padding: 0
          }}
        >
          {/* Table header row */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#111827'
              }}
            >
              {table.title}{' '}
              <span style={{ color: '#6B7280', fontWeight: 500 }}>{table.countLabel}</span>
            </div>
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 10px',
                borderRadius: 999,
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                fontSize: 12,
                fontWeight: 500,
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              <Filter style={{ width: 14, height: 14, color: '#6B7280' }} />
              {table.columnsButton}
            </button>
          </div>

          {/* Table */}
          <div
            style={{
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
                minWidth: 900
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderBottom: '1px solid #E5E7EB'
                  }}
                >
                  {table.headers.map((h: string, index: number) => (
                    <th
                      key={h + index}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: '#6B7280',
                        fontWeight: 600
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row: any, idx: number) => (
                  <tr
                    key={row.id}
                    style={{
                      backgroundColor: row.rowHighlightBg || '#FFFFFF',
                      borderBottom:
                        idx === table.rows.length - 1 ? 'none' : '1px solid #E5E7EB'
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: '10px 16px' }}>
                      <input type="checkbox" />
                    </td>

                    {/* User */}
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '999px',
                            backgroundColor: '#DBEAFE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#1E3A8A'
                          }}
                        >
                          {row.name
                            .split(' ')
                            .map((p: string) => p[0])
                            .join('')}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: '#111827'
                            }}
                          >
                            {row.name}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: '#6B7280'
                            }}
                          >
                            {row.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '10px 16px' }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          padding: '2px 10px',
                          borderRadius: 999,
                          backgroundColor: '#EFF6FF',
                          color: row.roleColor
                        }}
                      >
                        {row.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '10px 16px' }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          padding: '2px 10px',
                          borderRadius: 999,
                          backgroundColor: row.statusBg,
                          color: row.statusColor
                        }}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* KYC Status */}
                    <td style={{ padding: '10px 16px' }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          padding: '2px 10px',
                          borderRadius: 999,
                          backgroundColor: row.kycBg,
                          color: row.kycColor
                        }}
                      >
                        {row.kycStatus}
                      </span>
                    </td>

                    {/* Access */}
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {row.accessTags.map((tag: string, index: number) => (
                          <span
                            key={`${tag}-${index}`}
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              padding: '2px 8px',
                              borderRadius: 999,
                              backgroundColor: '#F3F4F6',
                              color: '#4B5563'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Last Active */}
                    <td
                      style={{
                        padding: '10px 16px',
                        fontSize: 13,
                        color: '#4B5563'
                      }}
                    >
                      {row.lastActive}
                    </td>

                    {/* Registered */}
                    <td
                      style={{
                        padding: '10px 16px',
                        fontSize: 13,
                        color: '#4B5563'
                      }}
                    >
                      {row.registered}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => console.log('Action clicked for user:', row.id)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 999,
                          border: '1px solid #E5E7EB',
                          backgroundColor: '#FFFFFF',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <MoreHorizontal style={{ width: 16, height: 16, color: '#6B7280' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
};

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: '#6B7280'
        }}
      >
        {label}:
      </span>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            appearance: 'none',
            width: '100%',
            minWidth: 150,
            padding: '8px 30px 8px 10px',
            borderRadius: 8,
            border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            fontSize: 13,
            color: '#111827',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
            {options.map((opt, index) => (
                <option key={`${opt}-${index}`} value={opt}>{opt}</option>
            ))}
        </select>
        <ChevronDown 
            style={{ 
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 14, 
                height: 14, 
                color: '#9CA3AF',
                pointerEvents: 'none'
            }} 
        />
      </div>
    </div>
  );
}


