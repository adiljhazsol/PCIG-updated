import { CSSProperties, useState } from 'react';
import {
  UploadCloud,
  FileText,
  Table,
  Clock,
  CheckCircle2
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

type ImportTabKey = string;

export default function ImportCenter() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  const importData = (adminData as any).importCenter;

  const header = importData.header;
  const tabs: ImportTabKey[] = importData.tabs;
  const uploadPanels = importData.uploadPanels;
  const reviewQueue = importData.reviewQueue;
  const recentBatches = importData.recentBatches;
  const statusFilters: string[] = importData.statusFilters;

  const [activeTab, setActiveTab] = useState<ImportTabKey>(tabs[0]);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>(statusFilters[0]);

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
        {/* Header */}
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
                fontSize: isMobile ? 'clamp(22px, 5vw, 28px)' : '28px',
                fontWeight: 700,
                color: '#0F172A',
                marginTop: 0,
                marginRight: 0,
                marginBottom: 6,
                marginLeft: 0,
                lineHeight: 1.2
              }}
            >
              {header.title}
            </h1>
            <p
              style={{
                fontSize: isMobile ? '13px' : '14px',
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
                fontSize: isMobile ? '12px' : '13px',
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
              <Clock style={{ width: 16, height: 16, color: '#64748B' }} />
              {importData.headerButtons.importHistory}
            </button>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: isMobile ? '8px 12px' : '10px 16px',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: 500,
                color: '#FFFFFF',
                backgroundColor: '#1E3A5F',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                flex: isMobile ? 1 : 'none',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}
            >
              <UploadCloud style={{ width: 16, height: 16 }} />
              {importData.headerButtons.downloadTemplates}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: isMobile ? 16 : 32,
            borderBottom: '1px solid #E2E8F0',
            marginBottom: isMobile ? 20 : 24,
            overflowX: isMobileOrTablet ? 'auto' : 'visible',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: isMobile ? '10px 0' : '12px 0',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: 500,
                color: activeTab === tab ? '#1E3A5F' : '#64748B',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #1E3A5F' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-1px'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Upload panels row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '1.3fr 1fr',
            gap: isMobile ? 16 : 24,
            marginBottom: isMobile ? 24 : 32
          }}
        >
          {/* Left - FIFA PDFs upload */}
          <div
            style={{
              borderRadius: 12,
              border: '1px dashed #BFDBFE',
              backgroundColor: '#EFF6FF',
              padding: isMobile ? '20px' : '28px',
              minHeight: 220,
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                width: isMobile ? 48 : 56,
                height: isMobile ? 48 : 56,
                borderRadius: 999,
                backgroundColor: '#DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}
            >
              <FileText style={{ width: 28, height: 28, color: '#1E3A5F' }} />
            </div>
            <h2
              style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: 600,
                color: '#0F172A',
                margin: 0,
                marginBottom: 4
              }}
            >
              {uploadPanels.fifa.title}
            </h2>
            <p
              style={{
                fontSize: isMobile ? '12px' : '13px',
                color: '#64748B',
                margin: 0,
                marginBottom: 20
              }}
            >
              {uploadPanels.fifa.description}
            </p>
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: isMobile ? '9px 16px' : '10px 18px',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: 500,
                color: '#FFFFFF',
                backgroundColor: '#1E3A5F',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                marginBottom: 8
              }}
            >
              <UploadCloud style={{ width: 16, height: 16 }} />
              {uploadPanels.fifa.primaryButton}
            </button>
            <div
              style={{
                fontSize: isMobile ? '11px' : '12px',
                color: '#64748B'
              }}
            >
              {uploadPanels.fifa.helper}
            </div>
          </div>

          {/* Right - Excel/CSV upload */}
          <div
            style={{
              borderRadius: 12,
              border: '1px dashed #BBF7D0',
              backgroundColor: '#ECFDF5',
              padding: isMobile ? '20px' : '28px',
              minHeight: 220,
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                width: isMobile ? 48 : 56,
                height: isMobile ? 48 : 56,
                borderRadius: 999,
                backgroundColor: '#BBF7D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}
            >
              <Table style={{ width: 28, height: 28, color: '#15803D' }} />
            </div>
            <h2
              style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: 600,
                color: '#064E3B',
                margin: 0,
                marginBottom: 4
              }}
            >
              {uploadPanels.excel.title}
            </h2>
            <p
              style={{
                fontSize: isMobile ? '12px' : '13px',
                color: '#166534',
                margin: 0,
                marginBottom: 16
              }}
            >
              {uploadPanels.excel.description}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
              <button
                style={{
                  padding: isMobile ? '8px 12px' : '9px 14px',
                  fontSize: isMobile ? '12px' : '13px',
                  fontWeight: 500,
                  color: '#166534',
                  backgroundColor: '#DCFCE7',
                  borderRadius: 999,
                  border: '1px solid #BBF7D0',
                  cursor: 'pointer'
                }}
              >
                {uploadPanels.excel.templateButton}
              </button>
              <button
                style={{
                  padding: isMobile ? '8px 14px' : '9px 16px',
                  fontSize: isMobile ? '12px' : '13px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  backgroundColor: '#16A34A',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <UploadCloud style={{ width: 16, height: 16 }} />
                {uploadPanels.excel.uploadButton}
              </button>
            </div>
          </div>
        </div>

        {/* Review Queue */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            marginBottom: isMobile ? 20 : 24,
            overflow: 'hidden'
          }}
        >
          {/* Review Queue Header */}
          <div
            style={{
              padding: isMobile ? '12px 14px' : '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <CheckCircle2 style={{ width: 18, height: 18, color: '#1E3A5F' }} />
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0F172A'
                  }}
                >
                  {reviewQueue.title}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#64748B'
                  }}
                >
                  {reviewQueue.subtitle}
                </div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: isMobile ? 'wrap' : 'nowrap',
                justifyContent: isMobile ? 'flex-start' : 'flex-end'
              }}
            >
              {statusFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveStatusFilter(filter)}
                  style={{
                    padding: isMobile ? '6px 10px' : '6px 12px',
                    fontSize: isMobile ? '11px' : '12px',
                    fontWeight: 500,
                    borderRadius: 999,
                    border:
                      activeStatusFilter === filter ? '1px solid #1E3A5F' : '1px solid #E2E8F0',
                    backgroundColor:
                      activeStatusFilter === filter ? '#EFF6FF' : '#FFFFFF',
                    color: activeStatusFilter === filter ? '#1E3A5F' : '#64748B',
                    cursor: 'pointer'
                  }}
                >
                  {filter}
                </button>
              ))}
              <button
                style={{
                  padding: isMobile ? '8px 12px' : '8px 14px',
                  fontSize: isMobile ? '11px' : '12px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  backgroundColor: '#1E3A5F',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {reviewQueue.confirmButton}
              </button>
            </div>
          </div>

          {/* Review Table */}
          <div
            style={{
              padding: isMobile ? '8px 12px 16px 12px' : '12px 20px 20px 20px',
              overflowX: isMobileOrTablet ? 'auto' : 'visible',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px'
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderBottom: '1px solid #E2E8F0'
                  }}
                >
                  <th style={{ width: 32, padding: '10px 8px', textAlign: 'left' }}>
                    <input type="checkbox" />
                  </th>
                  {reviewQueue.tableHeaders.map((headerLabel: string) => (
                    <th
                      key={headerLabel}
                      style={{
                        padding: isMobile ? '8px 10px' : '10px 12px',
                        textAlign: headerLabel === 'Confidence' ? 'center' : 'left',
                        fontSize: '11px',
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
                {reviewQueue.rows.map((row: any, idx: number) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom:
                        idx === reviewQueue.rows.length - 1 ? 'none' : '1px solid #E2E8F0'
                    }}
                  >
                    <td style={{ padding: isMobile ? '8px 6px' : '10px 8px' }}>
                      <input type="checkbox" />
                    </td>
                    {/* Extracted data */}
                    <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', verticalAlign: 'top' }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#1E3A5F',
                          marginBottom: 2
                        }}
                      >
                        {row.extracted.primary}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        {row.extracted.secondary}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{row.extracted.meta}</div>
                    </td>

                    {/* Proposed match */}
                    <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', verticalAlign: 'top' }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: row.proposed.accentColor || '#1E3A5F',
                          marginBottom: 2
                        }}
                      >
                        {row.proposed.primary}
                      </div>
                      {row.proposed.secondary && (
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          {row.proposed.secondary}
                        </div>
                      )}
                      {row.proposed.link && (
                        <button
                          style={{
                            marginTop: 2,
                            padding: 0,
                            border: 'none',
                            background: 'none',
                            fontSize: '11px',
                            fontWeight: 500,
                            color: '#2563EB',
                            cursor: 'pointer'
                          }}
                        >
                          {row.proposed.link}
                        </button>
                      )}
                    </td>

                    {/* Confidence */}
                    <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', verticalAlign: 'top' }}>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#0F172A',
                          marginBottom: 4
                        }}
                      >
                        {row.confidence.value}
                      </div>
                      <div
                        style={{
                          height: 6,
                          width: 80,
                          borderRadius: 999,
                          backgroundColor: '#E5E7EB',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: row.confidence.barPercent,
                            height: '100%',
                            backgroundColor: row.confidence.color
                          }}
                        />
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', verticalAlign: 'top' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: '11px',
                          fontWeight: 500,
                          color: row.status.color,
                          backgroundColor: row.status.bg
                        }}
                      >
                        {row.status.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td
                      style={{
                        padding: isMobile ? '8px 10px' : '10px 12px',
                        textAlign: 'right',
                        verticalAlign: 'top'
                      }}
                    >
                      {row.actions.map((action: any) => (
                        <button
                          key={action.label}
                          style={{
                            padding: '8px 12px',
                            fontSize: isMobile ? '11px' : '12px',
                            fontWeight: 500,
                            borderRadius: 8,
                            border: action.variant === 'primary' ? 'none' : '1px solid #E2E8F0',
                            backgroundColor:
                              action.variant === 'primary' ? '#16A34A' : '#FFFFFF',
                            color: action.variant === 'primary' ? '#FFFFFF' : '#0F172A',
                            cursor: 'pointer',
                            marginLeft: 8
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Import Batches */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0'
          }}
        >
          <div
            style={{
              padding: isMobile ? '12px 14px' : '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock style={{ width: 16, height: 16, color: '#64748B' }} />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0F172A'
                }}
              >
                {recentBatches.title}
              </span>
            </div>
            <button
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: 500,
                borderRadius: 6,
                border: 'none',
                backgroundColor: 'transparent',
                color: '#2563EB',
                cursor: 'pointer'
              }}
            >
              {recentBatches.viewAllLabel}
            </button>
          </div>

          <div style={{ padding: '12px 20px 20px 20px' }}>
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
                fontSize: '13px'
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderBottom: '1px solid #E2E8F0'
                  }}
                >
                  {recentBatches.tableHeaders.map((headerLabel: string) => (
                    <th
                      key={headerLabel}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: '#64748B',
                        fontWeight: 600
                      }}
                    >
                      {headerLabel}
                    </th>
                  ))}
                  <th
                    style={{
                      padding: '10px 12px',
                      textAlign: 'right',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: '#64748B',
                      fontWeight: 600
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentBatches.rows.map((row: any, idx: number) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom:
                        idx === recentBatches.rows.length - 1
                          ? 'none'
                          : '1px solid #E2E8F0'
                    }}
                  >
                    <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', fontSize: '13px', color: '#0F172A' }}>
                      {row.batchName}
                    </td>
                    <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', fontSize: '13px', color: '#64748B' }}>
                      {row.type}
                    </td>
                    <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', fontSize: '13px', color: '#64748B' }}>
                      {row.date}
                    </td>
                    <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', fontSize: '13px', color: '#64748B' }}>
                      {row.items}
                    </td>
                    <td style={{ padding: isMobile ? '8px 10px' : '10px 12px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: 999,
                          fontSize: '11px',
                          fontWeight: 500,
                          backgroundColor: row.statusBg,
                          color: row.statusColor
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', textAlign: 'right' }}>
                      <button
                        style={{
                          padding: isMobile ? '8px 10px' : '8px 12px',
                          fontSize: isMobile ? '11px' : '12px',
                          fontWeight: 500,
                          borderRadius: 8,
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#FFFFFF',
                          color: '#0F172A',
                          cursor: 'pointer'
                        }}
                      >
                        {row.actionLabel}
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
    </div>
  );
}


