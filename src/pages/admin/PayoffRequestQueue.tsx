import { CSSProperties, useState } from 'react';
import {
  Search,
  Download,
  Plus,
  Clock,
  FileText,
  DollarSign,
  XCircle,
  RefreshCw,
  MoreVertical,
  X,
  Eye,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

// Icon mapping
const iconMap: { [key: string]: any } = {
  Clock,
  FileText,
  DollarSign,
  XCircle,
  Download,
  Plus
};

export default function PayoffRequestQueue() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  
  const queueData = adminData.payoffRequestQueue;
  const header = queueData.header;
  const actionButtons = queueData.actionButtons;
  const summaryCards = queueData.summaryCards;
  const searchPlaceholder = queueData.searchPlaceholder;
  const filters = queueData.filters;
  const tableHeaders = queueData.tableHeaders;
  const requests = queueData.requests;
  const selectedRequest = queueData.selectedRequest;

  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(
    new Set(requests.filter(r => r.selected).map(r => r.id))
  );

  const handleCheckboxChange = (requestId: string) => {
    setSelectedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(new Set(requests.map(r => r.id)));
    } else {
      setSelectedRequests(new Set());
    }
  };

  const pageWrapperStyle: CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
    overflowX: 'hidden'
  };

  const ExportIcon = iconMap[actionButtons.exportCSV.icon] || Download;
  const ManualRequestIcon = iconMap[actionButtons.manualRequest.icon] || Plus;

  return (
    <div style={pageWrapperStyle}>
      <AdminNav />

      <div
        style={{
          padding: isMobile ? '20px 16px' : isTablet ? '24px 24px' : '32px 48px',
          width: '100%',
          maxWidth: '100vw',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {/* Main 2-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: isMobile ? 20 : 24,
            alignItems: 'flex-start',
            width: '100%',
            minWidth: 0
          }}
        >
          {/* Left Column - Main Content */}
          <div style={{ minWidth: 0, width: '100%', overflowX: 'hidden' }}>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'flex-start',
                marginBottom: isMobile ? 24 : 32,
                gap: isMobile ? 16 : 0,
                width: '100%',
                minWidth: 0
              }}
            >
              <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
                <h1
                  style={{
                    fontSize: isMobile ? 'clamp(24px, 5vw, 32px)' : '32px',
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: 8,
                    margin: 0,
                    lineHeight: 1.2,
                    wordBreak: 'break-word'
                  }}
                >
                  {header.title}
                </h1>
                {!isMobile && (
                  <p
                    style={{
                      fontSize: `clamp(14px, 2vw, 16px)`,
                      color: '#64748B',
                      margin: 0
                    }}
                  >
                    {header.subtitle}
                  </p>
                )}
              </div>
              <div style={{ 
                display: 'flex', 
                gap: 12, 
                flexWrap: isMobile ? 'wrap' : 'nowrap', 
                width: isMobile ? '100%' : 'auto',
                minWidth: 0
              }}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: `clamp(10px, 1.2vh, 12px) clamp(14px, 2vw, 16px)`,
                    fontSize: `clamp(13px, 1.8vw, 14px)`,
                    fontWeight: 500,
                    color: '#334155',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    flex: isMobile ? 1 : 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <ExportIcon style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` }} />
                  {actionButtons.exportCSV.label}
                </button>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: `clamp(10px, 1.2vh, 12px) clamp(14px, 2vw, 16px)`,
                    fontSize: `clamp(13px, 1.8vw, 14px)`,
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#1E3A5F',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    flex: isMobile ? 1 : 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <ManualRequestIcon style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` }} />
                  {actionButtons.manualRequest.label}
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: isMobile ? 12 : 16,
                marginBottom: isMobile ? 24 : 32,
                width: '100%',
                minWidth: 0
              }}
            >
              {summaryCards.map((card, idx) => {
                const Icon = iconMap[card.icon] || Clock;
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      padding: isMobile ? '16px' : '20px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: `clamp(11px, 1.5vw, 12px)`,
                          fontWeight: 600,
                          color: '#64748B',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}
                      >
                        {card.label}
                      </span>
                      <Icon style={{ width: `clamp(16px, 2.2vw, 18px)`, height: `clamp(16px, 2.2vw, 18px)`, color: '#94A3B8', flexShrink: 0 }} />
                    </div>
                    <div
                      style={{
                        fontSize: `clamp(24px, 3.5vw, 28px)`,
                        fontWeight: 700,
                        color: '#0F172A'
                      }}
                    >
                      {card.value}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Search and Filters */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 12 : 12,
                alignItems: isMobile ? 'stretch' : 'center',
                marginBottom: isMobile ? 20 : 24,
                width: '100%',
                minWidth: 0
              }}
            >
              <div style={{ position: 'relative', flex: 1, minWidth: 0, width: '100%' }}>
                <Search
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: `clamp(16px, 2.2vw, 18px)`,
                    height: `clamp(16px, 2.2vw, 18px)`,
                    color: '#94A3B8'
                  }}
                />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px) clamp(10px, 1.2vh, 12px) clamp(40px, 5vw, 44px)`,
                    fontSize: `clamp(13px, 1.8vw, 14px)`,
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    maxWidth: '100%'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', minWidth: 0 }}>
                {filters.map((filter, idx) => (
                  filter.type === 'button' ? (
                    <button
                      key={idx}
                      style={{
                        padding: `clamp(10px, 1.2vh, 12px) clamp(14px, 2vw, 16px)`,
                        fontSize: `clamp(13px, 1.8vw, 14px)`,
                        fontWeight: 500,
                        color: '#FFFFFF',
                        backgroundColor: '#1E3A5F',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flex: isMobile ? 1 : 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      {filter.label}
                    </button>
                  ) : (
                    <select
                      key={idx}
                      style={{
                        padding: `clamp(10px, 1.2vh, 12px) clamp(14px, 2vw, 16px)`,
                        fontSize: `clamp(13px, 1.8vw, 14px)`,
                        fontWeight: 500,
                        color: '#334155',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flex: isMobile ? 1 : 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      {filter.options?.map((option, optIdx) => (
                        <option key={optIdx} value={option}>{option}</option>
                      ))}
                    </select>
                  )
                ))}
                <button
                  style={{
                    padding: `clamp(10px, 1.2vh, 12px)`,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <RefreshCw style={{ width: `clamp(16px, 2.2vw, 18px)`, height: `clamp(16px, 2.2vw, 18px)`, color: '#64748B' }} />
                </button>
              </div>
            </div>

            {/* Pending Requests Table */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                width: '100%',
                minWidth: 0
              }}
            >
              <div
                style={{
                  padding: isMobile ? '16px' : '20px',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 12 : 0
                }}
              >
                <h2
                  style={{
                    fontSize: `clamp(16px, 2.2vw, 18px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                    margin: 0
                  }}
                >
                  Pending Requests ({requests.length})
                </h2>
                <button
                  style={{
                    padding: `clamp(8px, 1vh, 10px) clamp(14px, 2vw, 16px)`,
                    fontSize: `clamp(13px, 1.8vw, 14px)`,
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#1E3A5F',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  Generate Letters
                </button>
              </div>
              <div style={{ 
                overflowX: isMobileOrTablet ? 'auto' : 'visible',
                width: '100%',
                WebkitOverflowScrolling: 'touch'
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  minWidth: isMobileOrTablet ? 800 : 'auto',
                  tableLayout: 'auto'
                }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    {tableHeaders.map((header, idx) => (
                      <th
                        key={header || `header-${idx}`}
                        style={{
                          padding: isMobile ? '10px 12px' : '12px 16px',
                          textAlign: 'left',
                          fontSize: `clamp(10px, 1.5vw, 12px)`,
                          fontWeight: 600,
                          color: '#64748B',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {header === '' && idx === 0 ? (
                          <input
                            type="checkbox"
                            checked={selectedRequests.size === requests.length && requests.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            style={{ cursor: 'pointer', width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` }}
                          />
                        ) : header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => {
                    const isSelected = selectedRequests.has(request.id);
                    return (
                      <tr
                        key={request.id}
                        style={{
                          backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                          borderBottom: '1px solid #E2E8F0',
                          cursor: 'pointer'
                        }}
                      >
                        <td style={{ padding: '16px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCheckboxChange(request.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                            {request.id}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 4 }}>
                              {request.property}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                              {request.parcelId}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 4 }}>
                              {request.requester}
                            </div>
                            {request.requesterFirm && (
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                {request.requesterFirm}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 500,
                              color: request.sourceColor,
                              backgroundColor: request.sourceBg,
                              padding: '4px 8px',
                              borderRadius: 4
                            }}
                          >
                            {request.source}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ fontSize: '14px', color: '#64748B' }}>
                            {request.date}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {request.statuses.map((status, statusIdx) => (
                              <span
                                key={statusIdx}
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: status.color,
                                  backgroundColor: status.bg,
                                  padding: '4px 8px',
                                  borderRadius: 4
                                }}
                              >
                                {status.label}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <button
                            style={{
                              padding: '4px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <MoreVertical style={{ width: 18, height: 18, color: '#64748B' }} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          </div>

          {/* Right Column - Selected Request Details */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              padding: isMobile ? '20px' : '24px',
              position: isMobileOrTablet ? 'relative' : 'sticky',
              top: isMobileOrTablet ? 0 : 24,
              order: isMobileOrTablet ? -1 : 0,
              minWidth: 0,
              width: '100%',
              boxSizing: 'border-box',
              overflowX: 'hidden'
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 16
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: 4,
                    margin: 0
                  }}
                >
                  {selectedRequest.id}
                </h3>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#64748B',
                    margin: 0
                  }}
                >
                  Submitted {selectedRequest.date}
                </p>
              </div>
              <button
                style={{
                  padding: '4px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X style={{ width: 18, height: 18, color: '#64748B' }} />
              </button>
            </div>

            {/* Alert Banner */}
            <div
              style={{
                backgroundColor: selectedRequest.alert.bg,
                border: `1px solid ${selectedRequest.alert.borderColor}`,
                borderRadius: 8,
                padding: 12,
                marginBottom: 24,
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start'
              }}
            >
              <AlertCircle style={{ width: 18, height: 18, color: selectedRequest.alert.textColor, flexShrink: 0, marginTop: 2 }} />
              <p
                style={{
                  fontSize: '13px',
                  color: selectedRequest.alert.textColor,
                  margin: 0,
                  lineHeight: '1.5'
                }}
              >
                {selectedRequest.alert.message}
              </p>
            </div>

            {/* Property Details */}
            <div style={{ marginBottom: isMobile ? 20 : 24 }}>
              <h4
                style={{
                  fontSize: `clamp(12px, 1.8vw, 14px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                PROPERTY DETAILS
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, color: '#64748B' }}>Address: </span>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, fontWeight: 500, color: '#0F172A', wordBreak: 'break-word' }}>
                    {selectedRequest.propertyDetails.address}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, color: '#64748B' }}>Parcel ID: </span>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, fontWeight: 500, color: '#0F172A' }}>
                    {selectedRequest.propertyDetails.parcelId}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, color: '#64748B' }}>County: </span>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, fontWeight: 500, color: '#0F172A' }}>
                    {selectedRequest.propertyDetails.county}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, color: '#64748B' }}>Tax Year: </span>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, fontWeight: 500, color: '#0F172A' }}>
                    {selectedRequest.propertyDetails.taxYear}
                  </span>
                </div>
                <a
                  href="#"
                  style={{
                    fontSize: `clamp(13px, 1.8vw, 14px)`,
                    fontWeight: 500,
                    color: '#1E3A5F',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 4
                  }}
                >
                  View Property Details <ArrowRight style={{ width: `clamp(12px, 1.8vw, 14px)`, height: `clamp(12px, 1.8vw, 14px)` }} />
                </a>
              </div>
            </div>

            {/* Requester Information */}
            <div style={{ marginBottom: isMobile ? 20 : 24 }}>
              <h4
                style={{
                  fontSize: `clamp(12px, 1.8vw, 14px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                REQUESTER INFORMATION
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, color: '#64748B' }}>Name: </span>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, fontWeight: 500, color: '#0F172A', wordBreak: 'break-word' }}>
                    {selectedRequest.requesterInfo.name}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, color: '#64748B' }}>Firm: </span>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, fontWeight: 500, color: '#0F172A', wordBreak: 'break-word' }}>
                    {selectedRequest.requesterInfo.firm}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, color: '#64748B' }}>Role: </span>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, fontWeight: 500, color: '#0F172A' }}>
                    {selectedRequest.requesterInfo.role}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, color: '#64748B' }}>Client: </span>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, fontWeight: 500, color: '#0F172A' }}>
                    {selectedRequest.requesterInfo.client}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, color: '#64748B' }}>Email: </span>
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, fontWeight: 500, color: '#0F172A', wordBreak: 'break-word' }}>
                    {selectedRequest.requesterInfo.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Supporting Documents */}
            <div style={{ marginBottom: 24 }}>
              <h4
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                SUPPORTING DOCUMENTS
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedRequest.supportingDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 12,
                      backgroundColor: '#F8FAFC',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <FileText style={{ width: 18, height: 18, color: '#64748B', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>
                          {doc.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          {doc.date} • {doc.size}
                        </div>
                      </div>
                    </div>
                    <button
                      style={{
                        padding: '4px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Eye style={{ width: 18, height: 18, color: '#64748B' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Payoff Estimation */}
            <div style={{ marginBottom: 24 }}>
              <h4
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                PAYOFF ESTIMATION
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748B' }}>Principal:</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>
                    {selectedRequest.payoffEstimation.principal}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748B' }}>Interest:</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>
                    {selectedRequest.payoffEstimation.interest}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748B' }}>Fees:</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>
                    {selectedRequest.payoffEstimation.fees}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 12,
                    borderTop: '1px solid #E2E8F0',
                    marginTop: 4
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Total Estimate:</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                    {selectedRequest.payoffEstimation.total}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: selectedRequest.actionButtons.approve.color,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                {selectedRequest.actionButtons.approve.label}
              </button>
              <button
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: selectedRequest.actionButtons.reject.color,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                {selectedRequest.actionButtons.reject.label}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

