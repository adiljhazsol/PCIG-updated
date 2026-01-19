import { CSSProperties } from 'react';
import {
  Search,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

export default function AuditLog() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const auditData = (adminData as any).auditLog;

  const header = auditData.header;
  const searchPlaceholder = auditData.searchPlaceholder;
  const filters = auditData.filters;
  const summary = auditData.summary;
  const tableHeaders = auditData.tableHeaders;
  const rows = auditData.rows;

  const pageWrapperStyle: CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    width: '100%',
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

  return (
    <div style={pageWrapperStyle}>
      <AdminNav />

      <div style={mainContainerStyle}>
        {/* Header row with title and actions */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'flex-start',
            marginBottom: isMobile ? 20 : 24,
            gap: isMobile ? 12 : 0
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: isMobile ? 24 : 28,
                fontWeight: 700,
                color: '#0F172A',
                marginTop: 0,
                marginRight: 0,
                marginBottom: 6,
                marginLeft: 0
              }}
            >
              {header.title}
            </h1>
            <p
              style={{
                fontSize: isMobile ? 13 : 14,
                color: '#64748B',
                margin: 0
              }}
            >
              {header.subtitle}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexShrink: 0,
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              justifyContent: isMobile ? 'flex-start' : 'flex-end'
            }}
          >
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: isMobile ? '8px 12px' : '10px 16px',
                fontSize: isMobile ? 12 : 13,
                fontWeight: 500,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                flex: isMobile ? 1 : 'none',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}
            >
              <RefreshCw style={{ width: 16, height: 16, color: '#64748B' }} />
              Refresh
            </button>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: isMobile ? '8px 12px' : '10px 16px',
                fontSize: isMobile ? 12 : 13,
                fontWeight: 500,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                flex: isMobile ? 1 : 'none',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}
            >
              <Download style={{ width: 16, height: 16, color: '#64748B' }} />
              Export Log
            </button>
          </div>
        </div>

        {/* Search and filters panel */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: isMobile ? 16 : 20,
            marginBottom: isMobile ? 20 : 24
          }}
        >
          {/* Search bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ position: 'relative' }}>
              <Search
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 18,
                  height: 18,
                  color: '#94A3B8'
                }}
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px 12px 10px 38px' : '11px 14px 11px 40px',
                  fontSize: isMobile ? 13 : 14,
                  borderRadius: 999,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  color: '#0F172A',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Filter row */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              flexWrap: isMobile ? 'wrap' : 'nowrap'
            }}
          >
            {filters.map((filter: any, idx: number) => (
              <button
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: isMobile ? '8px 12px' : '9px 14px',
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 500,
                  color: '#0F172A',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 999,
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer'
                }}
              >
                {filter.label}
                <ChevronDown style={{ width: 14, height: 14, color: '#94A3B8' }} />
              </button>
            ))}
            <div style={{ flex: 1, minWidth: 0 }} />
            <button
              style={{
                padding: isMobile ? '8px 12px' : '9px 16px',
                fontSize: isMobile ? 12 : 13,
                fontWeight: 500,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                cursor: 'pointer'
              }}
            >
              Search
            </button>
            <button
              style={{
                padding: isMobile ? '8px 10px' : '9px 14px',
                fontSize: isMobile ? 12 : 13,
                fontWeight: 500,
                color: '#64748B',
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Summary and pager row */}
        <div
          style={{
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            fontSize: 13,
            color: '#64748B',
            marginBottom: 8,
            gap: isMobile ? 8 : 0
          }}
        >
          <span>{summary.label}</span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <button
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft style={{ width: 16, height: 16, color: '#94A3B8' }} />
            </button>
            <button
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronRight style={{ width: 16, height: 16, color: '#94A3B8' }} />
            </button>
          </div>
        </div>

        {/* Audit log table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            overflow: 'hidden'
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
                {tableHeaders.map((headerLabel: string) => (
                    <th
                    key={headerLabel}
                    style={{
                      padding: '12px 16px',
                      textAlign: headerLabel === '' ? 'right' : 'left',
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: '#64748B',
                      fontWeight: 600
                    }}
                  >
                    {headerLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, idx: number) => {
                const isLast = idx === rows.length - 1;
                const isError = row.status.label === 'Failed';
                return (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: isLast ? 'none' : '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {/* Timestamp */}
                    <td style={{ padding: isMobile ? '10px 12px' : '12px 16px', verticalAlign: 'top' }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: '#0F172A'
                        }}
                      >
                        {row.timestamp.date}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: '#64748B'
                        }}
                      >
                        {row.timestamp.time}
                      </div>
                    </td>

                    {/* User */}
                    <td style={{ padding: isMobile ? '10px 12px' : '12px 16px', verticalAlign: 'top' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 999,
                            backgroundColor: row.user.bg,
                            color: row.user.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 600
                          }}
                        >
                          {row.user.initials}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: '#0F172A',
                            fontWeight: 500
                          }}
                        >
                          {row.user.name}
                        </div>
                      </div>
                    </td>

                    {/* Action Type */}
                    <td style={{ padding: isMobile ? '10px 12px' : '12px 16px', verticalAlign: 'top' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 500,
                          backgroundColor: row.actionType.bg,
                          color: row.actionType.color
                        }}
                      >
                        {row.actionType.label}
                      </span>
                    </td>

                    {/* Description */}
                    <td style={{ padding: isMobile ? '10px 12px' : '12px 16px', verticalAlign: 'top' }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: '#0F172A',
                          marginBottom: 2
                        }}
                      >
                        {row.description.title}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: '#64748B'
                        }}
                      >
                        {row.description.subtitle}
                      </div>
                    </td>

                    {/* Entity / Property */}
                    <td style={{ padding: isMobile ? '10px 12px' : '12px 16px', verticalAlign: 'top' }}>
                      <div
                        style={{
                          fontSize: 13,
                          color: '#0F172A',
                          marginBottom: 2
                        }}
                      >
                        {row.entity.primary}
                      </div>
                      {row.entity.secondary && (
                        <div
                          style={{
                            fontSize: 11,
                            color: '#64748B'
                          }}
                        >
                          {row.entity.secondary}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 13,
                          color: row.status.color,
                          fontWeight: 500
                        }}
                      >
                        {isError ? (
                          <AlertCircle style={{ width: 16, height: 16, color: '#DC2626' }} />
                        ) : (
                          <CheckCircle2 style={{ width: 16, height: 16, color: '#16A34A' }} />
                        )}
                        {row.status.label}
                      </div>
                    </td>

                    {/* Chevron */}
                    <td
                      style={{
                        padding: isMobile ? '10px 12px' : '12px 16px',
                        textAlign: 'right',
                        verticalAlign: 'top'
                      }}
                    >
                      <ChevronDown style={{ width: 16, height: 16, color: '#94A3B8' }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}


