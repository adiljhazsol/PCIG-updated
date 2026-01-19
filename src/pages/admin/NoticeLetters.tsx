import React, { CSSProperties, useState } from 'react';
import {
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Search,
  Calendar,
  Filter,
  Eye,
  Edit,
  X
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Search,
  Calendar,
  Filter,
  Eye,
  Edit,
  X
};

export default function NoticeLetters() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  // Extract data from JSON
  const noticeData = adminData.noticeLetters;
  const header = noticeData.header;
  const summaryCards = noticeData.summaryCards;
  const searchAndFilters = noticeData.searchAndFilters;
  const noticesTable = noticeData.noticesTable;
  const detailPanel = noticeData.detailPanel;

  const [selectedNotices, setSelectedNotices] = useState<Set<string>>(
    new Set(noticesTable.rows.filter((r: any) => r.selected).map((r: any) => r.id))
  );
  const [selectedNoticeId, setSelectedNoticeId] = useState<string>(
    noticesTable.rows.find((r: any) => r.selected)?.id || noticesTable.rows[0].id
  );

  const handleCheckboxChange = (noticeId: string) => {
    setSelectedNotices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(noticeId)) {
        newSet.delete(noticeId);
      } else {
        newSet.add(noticeId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotices(new Set(noticesTable.rows.map((r: any) => r.id)));
    } else {
      setSelectedNotices(new Set());
    }
  };

  const selectedNotice = noticesTable.rows.find((r: any) => r.id === selectedNoticeId) || noticesTable.rows[0];

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

  const cardStyle: CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E2E8F0',
    padding: isMobile ? 12 : isTablet ? 16 : 20,
    boxSizing: 'border-box'
  };

  const GenerateReportIcon = iconMap[header.actionButtons[0].icon] || FileText;
  const CreateNoticeIcon = iconMap[header.actionButtons[1].icon] || Plus;
  const SendIcon = iconMap[detailPanel.actions.send.icon] || Send;
  const PreviewIcon = iconMap[detailPanel.actions.preview.icon] || Eye;
  const EditIcon = iconMap[detailPanel.actions.edit.icon] || Edit;

  return (
    <div style={pageWrapperStyle}>
      <AdminNav />

      <div
        style={{
          padding: isMobile ? '16px 12px' : isTablet ? '20px 20px' : '32px 48px',
          width: '100%',
          maxWidth: '100vw',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {/* Main Layout: 2 columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '1fr 400px',
            gap: isMobile ? 16 : isTablet ? 20 : 24,
            alignItems: 'start',
            width: '100%',
            minWidth: 0
          }}
        >
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 20 : 24, minWidth: 0, width: '100%' }}>
            {/* Header */}
            <div style={{ width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'flex-start',
                  marginBottom: 8,
                  gap: isMobile ? 12 : 0
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1
                    style={{
                      fontSize: isMobile ? 22 : isTablet ? 24 : 28,
                      fontWeight: 700,
                      color: '#0F172A',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 8,
                      marginLeft: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {header.title}
                  </h1>
                  <p
                    style={{
                      fontSize: isMobile ? 13 : 14,
                      color: '#64748B',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 0,
                      marginLeft: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {header.subtitle}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: isMobile ? 8 : 12, flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto' }}>
                  <button
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: isMobile ? 'center' : 'flex-start',
                      boxSizing: 'border-box'
                    }}
                  >
                    <GenerateReportIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap' }}>{header.actionButtons[0].label}</span>
                  </button>
                  <button
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: isMobile ? 'center' : 'flex-start',
                      boxSizing: 'border-box'
                    }}
                  >
                    <CreateNoticeIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap' }}>{header.actionButtons[1].label}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: isMobile ? 12 : isTablet ? 14 : 16,
                width: '100%',
                minWidth: 0
              }}
            >
              {summaryCards.map((card: any, idx: number) => {
                const CardIcon = iconMap[card.icon] || Clock;
                return (
                  <div
                    key={idx}
                    style={{
                      ...cardStyle,
                      backgroundColor: card.bg,
                      border: `1px solid ${card.color}20`,
                      padding: isMobile ? 12 : isTablet ? 16 : 20,
                      width: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 12, marginBottom: isMobile ? 10 : 12 }}>
                      <div
                        style={{
                          width: isMobile ? 36 : isTablet ? 38 : 40,
                          height: isMobile ? 36 : isTablet ? 38 : 40,
                          borderRadius: 10,
                          backgroundColor: card.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          flexShrink: 0
                        }}
                      >
                        <CardIcon style={{ width: isMobile ? 18 : isTablet ? 19 : 20, height: isMobile ? 18 : isTablet ? 19 : 20 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: isMobile ? 10 : 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: '#64748B',
                            marginBottom: 4
                          }}
                        >
                          {card.label}
                        </div>
                        <div
                          style={{
                            fontSize: isMobile ? 20 : isTablet ? 22 : 24,
                            fontWeight: 700,
                            color: card.color,
                            wordBreak: 'break-word'
                          }}
                        >
                          {card.value}
                        </div>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: isMobile ? 11 : 12,
                        color: '#64748B',
                        marginTop: 0,
                        marginRight: 0,
                        marginBottom: 0,
                        marginLeft: 0,
                        wordBreak: 'break-word'
                      }}
                    >
                      {card.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Search and Filters */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 10 : 12,
                alignItems: 'stretch',
                flexWrap: 'wrap',
                width: '100%',
                minWidth: 0
              }}
            >
              <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : 200, width: isMobile ? '100%' : 'auto' }}>
                <Search
                  style={{
                    position: 'absolute',
                    left: isMobile ? 12 : 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: isMobile ? 16 : 18,
                    height: isMobile ? 16 : 18,
                    color: '#9CA3AF',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                />
                <input
                  type="text"
                  placeholder={searchAndFilters.searchPlaceholder}
                  style={{
                    width: '100%',
                    padding: isMobile ? '8px 12px 8px 36px' : '10px 14px 10px 40px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F9FAFB',
                    fontSize: isMobile ? 13 : 14,
                    color: '#111827',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {searchAndFilters.filters.map((filter: any, idx: number) => {
                const FilterIcon = filter.icon ? iconMap[filter.icon] : null;
                return (
                  <div key={idx} style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '0 1 auto', minWidth: isMobile ? '100%' : 120 }}>
                    {FilterIcon && (
                      <FilterIcon
                        style={{
                          position: 'absolute',
                          left: isMobile ? 10 : 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: isMobile ? 14 : 16,
                          height: isMobile ? 14 : 16,
                          color: '#9CA3AF',
                          pointerEvents: 'none',
                          zIndex: 1
                        }}
                      />
                    )}
                    <select
                      style={{
                        padding: isMobile ? '8px 12px' : '10px 14px',
                        paddingLeft: FilterIcon ? (isMobile ? '32px' : '36px') : (isMobile ? '12px' : '14px'),
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        fontSize: isMobile ? 12 : 13,
                        color: '#0F172A',
                        cursor: 'pointer',
                        minWidth: isMobile ? '100%' : 120,
                        width: '100%',
                        appearance: 'none',
                        backgroundImage: FilterIcon ? 'none' : 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%2364748B\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        paddingRight: '36px',
                        boxSizing: 'border-box'
                      }}
                      defaultValue={filter.value}
                    >
                      <option>{filter.label}: {filter.value}</option>
                      {filter.options && filter.options.filter((opt: string) => opt !== filter.value).map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            {/* Notices Table */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 12 : 13, minWidth: isMobileOrTablet ? 1000 : 'auto' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: isMobile ? '10px 12px' : '12px 16px', textAlign: 'left', width: isMobile ? 32 : 40 }}>
                        <input
                          type="checkbox"
                          checked={selectedNotices.size === noticesTable.rows.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          style={{
                            width: isMobile ? 16 : 18,
                            height: isMobile ? 16 : 18,
                            cursor: 'pointer'
                          }}
                        />
                      </th>
                      {noticesTable.headers.slice(1).map((header: string) => (
                        <th
                          key={header}
                          style={{
                            padding: isMobile ? '10px 12px' : '12px 16px',
                            textAlign: 'left',
                            fontSize: isMobile ? 10 : 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: '#64748B',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {noticesTable.rows.map((row: any) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedNoticeId(row.id)}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          cursor: 'pointer',
                          backgroundColor: selectedNoticeId === row.id ? '#F0F9FF' : 'transparent',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                          <input
                            type="checkbox"
                            checked={selectedNotices.has(row.id)}
                            onChange={() => handleCheckboxChange(row.id)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: isMobile ? 16 : 18,
                              height: isMobile ? 16 : 18,
                              cursor: 'pointer'
                            }}
                          />
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', minWidth: isMobile ? 150 : 'auto' }}>
                          <div>
                            <div
                              style={{
                                fontSize: isMobile ? 13 : 14,
                                fontWeight: 500,
                                color: '#0F172A',
                                marginBottom: 2,
                                wordBreak: 'break-word'
                              }}
                            >
                              {row.property.address}
                            </div>
                            <div
                              style={{
                                fontSize: isMobile ? 11 : 12,
                                color: '#64748B',
                                wordBreak: 'break-word'
                              }}
                            >
                              {row.property.parcel}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#0F172A', fontSize: isMobile ? 12 : 13, fontWeight: 500, wordBreak: 'break-word' }}>
                          {row.recipient}
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: 999,
                              fontSize: isMobile ? 10 : 11,
                              fontWeight: 500,
                              backgroundColor: row.noticeTypeBg,
                              color: row.noticeTypeColor,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {row.noticeType}
                          </span>
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', fontSize: isMobile ? 12 : 13, whiteSpace: 'nowrap' }}>
                          {row.createdDate}
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', fontSize: isMobile ? 12 : 13, whiteSpace: 'nowrap' }}>
                          {row.sendDate}
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: 999,
                              fontSize: isMobile ? 10 : 11,
                              fontWeight: 500,
                              backgroundColor: row.statusBg,
                              color: row.statusColor,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', fontSize: isMobile ? 12 : 13, whiteSpace: 'nowrap' }}>
                          {row.tracking}
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                          <button
                            style={{
                              padding: isMobile ? '5px 10px' : '6px 12px',
                              borderRadius: 6,
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#FFFFFF',
                              color: '#64748B',
                              fontSize: isMobile ? 11 : 12,
                              fontWeight: 500,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              boxSizing: 'border-box'
                            }}
                          >
                            {row.actions}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Detail Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 18 : 20, minWidth: 0, width: '100%', order: isMobileOrTablet ? -1 : 0 }}>
            {/* Notice Header */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: isMobile ? 12 : 16,
                  gap: 12
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: isMobile ? 10 : 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#64748B',
                      marginBottom: 8,
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.selectedNotice.title}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 15 : 16,
                      fontWeight: 600,
                      color: '#0F172A',
                      marginBottom: 8,
                      wordBreak: 'break-word'
                    }}
                  >
                    {selectedNotice.property.address}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 11 : 12,
                      color: '#64748B',
                      marginBottom: 12,
                      wordBreak: 'break-word'
                    }}
                  >
                    {selectedNotice.property.parcel}
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: isMobile ? 10 : 11,
                      fontWeight: 500,
                      backgroundColor: detailPanel.selectedNotice.statusBg,
                      color: detailPanel.selectedNotice.statusColor,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {detailPanel.selectedNotice.status}
                  </span>
                </div>
                <button
                  style={{
                    width: isMobile ? 28 : 32,
                    height: isMobile ? 28 : 32,
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <X style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, color: '#64748B' }} />
                </button>
              </div>
            </div>

            {/* Property Info */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <h3
                style={{
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: isMobile ? 10 : 12,
                  marginLeft: 0,
                  wordBreak: 'break-word'
                }}
              >
                Property
              </h3>
              <div
                style={{
                  fontSize: isMobile ? 12 : 13,
                  color: '#0F172A',
                  marginBottom: 4,
                  wordBreak: 'break-word'
                }}
              >
                {detailPanel.propertyInfo.address}
              </div>
              <div
                style={{
                  fontSize: isMobile ? 11 : 12,
                  color: '#64748B',
                  wordBreak: 'break-word'
                }}
              >
                {detailPanel.propertyInfo.parcel}
              </div>
            </div>

            {/* Recipient Info */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <h3
                style={{
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: isMobile ? 10 : 12,
                  marginLeft: 0,
                  wordBreak: 'break-word'
                }}
              >
                Recipient
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 8 }}>
                <div style={{ width: '100%', minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 4,
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.recipientInfo.name}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 11 : 12,
                      color: '#64748B',
                      marginBottom: 2,
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.recipientInfo.address}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 11 : 12,
                      color: '#64748B',
                      marginBottom: 2,
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.recipientInfo.email}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 11 : 12,
                      color: '#64748B',
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.recipientInfo.phone}
                  </div>
                </div>
              </div>
            </div>

            {/* Notice Details */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <h3
                style={{
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: isMobile ? 10 : 12,
                  marginLeft: 0,
                  wordBreak: 'break-word'
                }}
              >
                Notice Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 10 }}>
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 11 : 12,
                      fontWeight: 500,
                      color: '#64748B',
                      marginBottom: 4,
                      wordBreak: 'break-word'
                    }}
                  >
                    Notice Type
                  </label>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: isMobile ? 10 : 11,
                      fontWeight: 500,
                      backgroundColor: detailPanel.noticeDetails.noticeTypeBg,
                      color: detailPanel.noticeDetails.noticeTypeColor,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {detailPanel.noticeDetails.noticeType}
                  </span>
                </div>
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 11 : 12,
                      fontWeight: 500,
                      color: '#64748B',
                      marginBottom: 4,
                      wordBreak: 'break-word'
                    }}
                  >
                    Created Date
                  </label>
                  <div
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      color: '#0F172A',
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.noticeDetails.createdDate}
                  </div>
                </div>
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 11 : 12,
                      fontWeight: 500,
                      color: '#64748B',
                      marginBottom: 4,
                      wordBreak: 'break-word'
                    }}
                  >
                    Send Date
                  </label>
                  <div
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      color: '#0F172A',
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.noticeDetails.sendDate}
                  </div>
                </div>
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 11 : 12,
                      fontWeight: 500,
                      color: '#64748B',
                      marginBottom: 4,
                      wordBreak: 'break-word'
                    }}
                  >
                    Deadline
                  </label>
                  <div
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      color: '#0F172A',
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.noticeDetails.deadline}
                  </div>
                </div>
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 11 : 12,
                      fontWeight: 500,
                      color: '#64748B',
                      marginBottom: 4,
                      wordBreak: 'break-word'
                    }}
                  >
                    Method
                  </label>
                  <div
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      color: '#0F172A',
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.noticeDetails.method}
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <h3
                style={{
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: isMobile ? 10 : 12,
                  marginLeft: 0,
                  wordBreak: 'break-word'
                }}
              >
                {detailPanel.documents.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 8 }}>
                {detailPanel.documents.items.map((doc: any) => {
                  const DocIcon = iconMap[doc.icon] || FileText;
                  return (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: isMobile ? '8px 10px' : '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#F9FAFB',
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        gap: 8
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                        <DocIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, color: '#2563EB', flexShrink: 0 }} />
                        <span
                          style={{
                            fontSize: isMobile ? 12 : 13,
                            color: '#0F172A',
                            flex: 1,
                            minWidth: 0,
                            wordBreak: 'break-word'
                          }}
                        >
                          {doc.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: isMobile ? 10 : 11,
                          fontWeight: 500,
                          color: doc.statusColor,
                          flexShrink: 0,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {doc.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <h3
                style={{
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: isMobile ? 12 : 16,
                  marginLeft: 0,
                  wordBreak: 'break-word'
                }}
              >
                {detailPanel.timeline.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
                {detailPanel.timeline.events.map((event: any, idx: number) => (
                  <div key={event.id} style={{ display: 'flex', gap: isMobile ? 10 : 12, width: '100%', minWidth: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div
                        style={{
                          width: isMobile ? 6 : 8,
                          height: isMobile ? 6 : 8,
                          borderRadius: '50%',
                          backgroundColor: event.status === 'completed' ? event.statusColor : '#E2E8F0',
                          marginBottom: 4
                        }}
                      />
                      {idx < detailPanel.timeline.events.length - 1 && (
                        <div
                          style={{
                            width: 2,
                            height: isMobile ? 20 : 24,
                            backgroundColor: '#E2E8F0'
                          }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingTop: 2, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: isMobile ? 11 : 12,
                          fontWeight: 500,
                          color: '#64748B',
                          marginBottom: 4,
                          wordBreak: 'break-word'
                        }}
                      >
                        {event.date}
                      </div>
                      <div
                        style={{
                          fontSize: isMobile ? 12 : 13,
                          color: '#1E293B',
                          wordBreak: 'break-word'
                        }}
                      >
                        {event.event}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12, width: '100%' }}>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: detailPanel.actions.send.bg,
                  color: detailPanel.actions.send.color,
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <SendIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>{detailPanel.actions.send.label}</span>
              </button>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: detailPanel.actions.preview.bg,
                  color: detailPanel.actions.preview.color,
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <PreviewIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>{detailPanel.actions.preview.label}</span>
              </button>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: detailPanel.actions.edit.bg,
                  color: detailPanel.actions.edit.color,
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <EditIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>{detailPanel.actions.edit.label}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

