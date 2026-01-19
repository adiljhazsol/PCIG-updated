import React, { CSSProperties, useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Calendar,
  FileText,
  Phone,
  Mail,
  X,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Download,
  Upload,
  Plus,
  FileText
};

export default function SurplusFundsResearch() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  // Extract data from JSON
  const surplusData = adminData.surplusFundsResearch;
  const header = surplusData.header;
  const actionButtons = surplusData.actionButtons;
  const alertBanner = surplusData.alertBanner;
  const summaryCards = surplusData.summaryCards;
  const searchPlaceholder = surplusData.searchPlaceholder;
  const filters = surplusData.filters;
  const generateLettersButton = surplusData.generateLettersButton;
  const tableHeaders = surplusData.tableHeaders;
  const records = surplusData.records;
  const selectedRecord = surplusData.selectedRecord;

  const [selectedRecordId, setSelectedRecordId] = useState<string>(selectedRecord.id);

  const pageWrapperStyle: CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
          maxWidth: '100%',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
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
          {/* Left Column - Records List */}
          <div>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 24
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: isMobile ? 'clamp(18px, 3vw, 24px)' : '24px',
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: 4,
                    margin: 0
                  }}
                >
                  {header.title}
                </h1>
                {!isMobile && (
                  <p
                    style={{
                      fontSize: 'clamp(11px, 1.5vw, 13px)',
                      color: '#64748B',
                      margin: 0,
                      marginTop: 4
                    }}
                  >
                    {header.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobileOrTablet ? 'column' : 'row',
                gap: 12,
                marginBottom: 20,
                justifyContent: isMobileOrTablet ? 'stretch' : 'flex-end'
              }}
            >
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: `clamp(8px, 1vh, 10px) clamp(12px, 2vw, 14px)`,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: isMobileOrTablet ? '100%' : 'auto'
                }}
              >
                {React.createElement(iconMap[actionButtons.bulkImport.icon], { style: { width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` } })}
                {actionButtons.bulkImport.label}
              </button>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: `clamp(8px, 1vh, 10px) clamp(12px, 2vw, 14px)`,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: isMobileOrTablet ? '100%' : 'auto'
                }}
              >
                {React.createElement(iconMap[actionButtons.export.icon], { style: { width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` } })}
                {actionButtons.export.label}
              </button>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: `clamp(8px, 1vh, 10px) clamp(12px, 2vw, 16px)`,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#1E3A5F',
                  color: '#FFFFFF',
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: isMobileOrTablet ? '100%' : 'auto'
                }}
              >
                {React.createElement(iconMap[actionButtons.addRecord.icon], { style: { width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` } })}
                {actionButtons.addRecord.label}
              </button>
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
                marginBottom: 20
              }}
            >
              {summaryCards.map((card, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div
                    style={{
                      fontSize: `clamp(10px, 1.3vw, 11px)`,
                      fontWeight: 500,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: 8
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      fontSize: `clamp(18px, 4.5vw, 20px)`,
                      fontWeight: 700,
                      color: card.valueColor || '#0F172A',
                      marginBottom: 4
                    }}
                  >
                    {card.value}
                  </div>
                  <div
                    style={{
                      fontSize: `clamp(11px, 1.5vw, 12px)`,
                      color: '#64748B'
                    }}
                  >
                    {card.subtext}
                  </div>
                </div>
              ))}
            </div>

            {/* Alert Banner */}
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 8,
                padding: isMobile ? '10px 12px' : '12px 16px',
                marginBottom: 20,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? 8 : 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <AlertCircle style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)`, color: '#DC2626', flexShrink: 0 }} />
                <span style={{ fontSize: `clamp(11px, 1.5vw, 13px)`, color: '#991B1B', fontWeight: 500 }}>
                  {alertBanner.message}
                </span>
              </div>
              <button
                style={{
                  padding: `clamp(6px, 1vh, 8px) clamp(10px, 1.5vw, 12px)`,
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: `clamp(11px, 1.5vw, 12px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  flexShrink: 0,
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                {alertBanner.buttonLabel}
              </button>
            </div>

            {/* Search and Filters */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 12,
                marginBottom: 12,
                flexWrap: isMobile ? 'nowrap' : 'wrap',
                alignItems: isMobile ? 'stretch' : 'center'
              }}
            >
              <div
                style={{
                  position: 'relative',
                  flex: 1,
                  minWidth: isMobile ? '100%' : '200px'
                }}
              >
                <Search
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: `clamp(14px, 2vw, 16px)`,
                    height: `clamp(14px, 2vw, 16px)`,
                    color: '#64748B'
                  }}
                />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  style={{
                    width: '100%',
                    padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px) clamp(8px, 1vh, 10px) ${isMobileOrTablet ? 'clamp(36px, 5vw, 40px)' : '36px'}`,
                    fontSize: `clamp(12px, 1.5vw, 13px)`,
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A'
                  }}
                />
              </div>
              {filters.map((filter, idx) => (
                <select
                  key={idx}
                  style={{
                    padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px)`,
                    fontSize: `clamp(12px, 1.5vw, 13px)`,
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    cursor: 'pointer',
                    minWidth: isMobile ? '100%' : '120px',
                    width: isMobile ? '100%' : 'auto'
                  }}
                  defaultValue={`${filter.selected}`}
                >
                  <option value={filter.selected}>{filter.label}: {filter.selected}</option>
                  {filter.options.filter(opt => opt !== filter.selected).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ))}
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px)`,
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                <Calendar style={{ width: `clamp(12px, 2vw, 14px)`, height: `clamp(12px, 2vw, 14px)` }} />
                Date Range
              </button>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px)`,
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                <Filter style={{ width: `clamp(12px, 2vw, 14px)`, height: `clamp(12px, 2vw, 14px)` }} />
                Filters
              </button>
            </div>

            {/* Generate Letters Button */}
            <div style={{ marginBottom: 16 }}>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 2vw, 16px)`,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#1E3A5F',
                  color: '#FFFFFF',
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: isMobileOrTablet ? '100%' : 'auto'
                }}
              >
                <FileText style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` }} />
                {generateLettersButton.label}
              </button>
            </div>

            {/* Records Table */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                overflow: isMobileOrTablet ? 'auto' : 'hidden',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div style={{ minWidth: isMobileOrTablet ? '800px' : 'auto', overflowX: isMobileOrTablet ? 'auto' : 'visible' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: `clamp(11px, 1.5vw, 13px)`,
                    minWidth: isMobileOrTablet ? '800px' : 'auto'
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderBottom: '1px solid #E2E8F0'
                      }}
                    >
                      {tableHeaders.map((header, idx) => (
                        <th
                          key={header || `header-${idx}`}
                          style={{
                            padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`,
                            textAlign: 'left',
                            fontSize: `clamp(10px, 1.3vw, 11px)`,
                            fontWeight: 600,
                            color: '#64748B',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => {
                      const isSelected = record.id === selectedRecordId;
                      return (
                        <tr
                          key={record.id}
                          onClick={() => setSelectedRecordId(record.id)}
                          style={{
                            backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                            borderBottom: '1px solid #E2E8F0',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#F8FAFC';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#FFFFFF';
                            }
                          }}
                        >
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => setSelectedRecordId(record.id)}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: `clamp(14px, 2vw, 16px)`,
                                height: `clamp(14px, 2vw, 16px)`,
                                cursor: 'pointer'
                              }}
                            />
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, fontWeight: 500, color: '#0F172A' }}>
                            {record.fcsFile}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: '#0F172A' }}>
                            {record.parcelId}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: '#64748B' }}>
                            {record.saleDate}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: '#0F172A', fontWeight: 500 }}>
                            {record.collected}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: '#0F172A' }}>
                            {record.paid}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: record.unclaimedColor || '#0F172A', fontWeight: 500 }}>
                            {record.unclaimed}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                            <span
                              style={{
                                fontSize: `clamp(11px, 1.5vw, 12px)`,
                                fontWeight: 500,
                                color: record.statusColor,
                                backgroundColor: record.statusBg,
                                padding: '4px 8px',
                                borderRadius: 4
                              }}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: '#64748B', fontSize: `clamp(11px, 1.5vw, 12px)` }}>
                            {record.recipientName}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Phone style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)`, color: '#64748B', cursor: 'pointer' }} />
                              <Mail style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)`, color: '#64748B', cursor: 'pointer' }} />
                              <FileText style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)`, color: '#64748B', cursor: 'pointer' }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Record Details */}
          <div style={{ order: isMobileOrTablet ? -1 : 0 }}>
            {/* Record Details Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20
              }}
            >
              <div
                style={{
                  fontSize: `clamp(16px, 2.5vw, 18px)`,
                  fontWeight: 700,
                  color: '#0F172A'
                }}
              >
                Surplus Record Details
              </div>
              <button
                style={{
                  padding: '4px',
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X style={{ width: `clamp(18px, 2.5vw, 20px)`, height: `clamp(18px, 2.5vw, 20px)` }} />
              </button>
            </div>

            {/* FILE INFORMATION */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: 16
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}
              >
                <div
                  style={{
                    fontSize: `clamp(12px, 1.5vw, 13px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  FILE INFORMATION
                </div>
                <span
                  style={{
                    fontSize: `clamp(10px, 1.3vw, 11px)`,
                    fontWeight: 600,
                    color: selectedRecord.statusColor,
                    backgroundColor: selectedRecord.statusBg,
                    padding: `clamp(3px, 0.5vh, 4px) clamp(6px, 1vw, 8px)`,
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {selectedRecord.status}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>FCSO File #:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {selectedRecord.fcsFile}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Parcel ID:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                      {selectedRecord.parcelId}
                    </span>
                    <ExternalLink style={{ width: `clamp(12px, 2vw, 14px)`, height: `clamp(12px, 2vw, 14px)`, color: '#64748B', cursor: 'pointer' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Surplus Collected:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {selectedRecord.surplusCollected}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Surplus Unclaimed:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {selectedRecord.surplusUnclaimed}
                  </span>
                </div>
              </div>
            </div>

            {/* CONTACT HISTORY */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: 16
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  CONTACT HISTORY
                </div>
                <button
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#1E3A5F',
                    backgroundColor: 'transparent',
                    border: '1px solid #1E3A5F',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  + Log Contact
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedRecord.contactHistory.map((contact, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>{contact.date}</span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 500,
                          color: '#64748B',
                          backgroundColor: '#F1F5F9',
                          padding: '2px 6px',
                          borderRadius: 3
                        }}
                      >
                        {contact.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#0F172A' }}>
                      {contact.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OUTREACH */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: 16
              }}
            >
              <div
                style={{
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 12
                }}
              >
                OUTREACH
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <FileText style={{ width: `clamp(18px, 2.5vw, 20px)`, height: `clamp(18px, 2.5vw, 20px)`, color: '#64748B' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500, marginBottom: 2, wordBreak: 'break-word' }}>
                    {selectedRecord.outreach.documentName}
                  </div>
                  <span
                    style={{
                      fontSize: `clamp(9px, 1.2vw, 10px)`,
                      fontWeight: 500,
                      color: '#15803D',
                      backgroundColor: '#F0FDF4',
                      padding: '2px 6px',
                      borderRadius: 3,
                      whiteSpace: 'nowrap',
                      display: 'inline-block'
                    }}
                  >
                    {selectedRecord.outreach.status}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={{
                    flex: 1,
                    padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px)`,
                    fontSize: `clamp(11px, 1.5vw, 12px)`,
                    fontWeight: 500,
                    color: '#64748B',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                >
                  View
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px)`,
                    fontSize: `clamp(11px, 1.5vw, 12px)`,
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#1E3A5F',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                >
                  Send Letter
                </button>
              </div>
            </div>

            {/* DOCUMENTS */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: 16
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}
              >
                <div
                  style={{
                    fontSize: `clamp(12px, 1.5vw, 13px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  DOCUMENTS
                </div>
                <button
                  style={{
                    padding: `clamp(4px, 0.5vh, 6px) clamp(6px, 1vw, 8px)`,
                    fontSize: `clamp(10px, 1.3vw, 11px)`,
                    fontWeight: 500,
                    color: '#1E3A5F',
                    backgroundColor: 'transparent',
                    border: '1px solid #1E3A5F',
                    borderRadius: 4,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  Upload
                </button>
              </div>
              <div style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>
                {selectedRecord.documents.message}
              </div>
            </div>

            {/* RECIPIENT INFO */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: 16
              }}
            >
              <div
                style={{
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 12
                }}
              >
                RECIPIENT INFO
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Name/Company:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {selectedRecord.recipientInfo.name}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Address:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {selectedRecord.recipientInfo.address}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>City:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {selectedRecord.recipientInfo.city}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>State:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {selectedRecord.recipientInfo.state}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Phone:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {selectedRecord.recipientInfo.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Save Changes Button */}
            <button
              style={{
                width: '100%',
                padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`,
                fontSize: `clamp(12px, 1.5vw, 13px)`,
                fontWeight: 500,
                color: '#FFFFFF',
                backgroundColor: '#1E3A5F',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

