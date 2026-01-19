import { CSSProperties } from 'react';
import { Search, Filter, ChevronDown, MoreHorizontal } from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import adminData from '../../data/admin.json';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

export default function UserManagementAdmin() {
  const data = (adminData as any).userManagementAdmin;

  const header = data.header;
  const pendingBanner = data.pendingBanner;
  const bannerColumns = data.bannerColumns;
  const bannerRows = data.bannerRows;
  const search = data.search;
  const table = data.table;

  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

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
              value={search.filters.role.options[0]}
            />
            {/* Status */}
            <FilterSelect
              label={search.filters.status.label}
              value={search.filters.status.options[0]}
            />
            {/* KYC */}
            <FilterSelect label={search.filters.kyc.label} value={search.filters.kyc.options[0]} />

            <div style={{ flex: 1, minWidth: 0 }} />

            <button
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
                        {row.accessTags.map((tag: string) => (
                          <span
                            key={tag}
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
};

function FilterSelect({ label, value }: FilterSelectProps) {
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
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minWidth: 150,
          padding: '8px 10px',
          borderRadius: 8,
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          fontSize: 13,
          color: '#111827',
          cursor: 'pointer'
        }}
      >
        <span>{value}</span>
        <ChevronDown style={{ width: 14, height: 14, color: '#9CA3AF' }} />
      </button>
    </div>
  );
}


