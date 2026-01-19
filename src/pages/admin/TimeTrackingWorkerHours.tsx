import { CSSProperties, useState } from 'react';
import {
  Clock,
  AlertCircle,
  Flag,
  Users,
  FileText,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Check,
  X,
  MessageCircle
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Clock,
  AlertCircle,
  Flag,
  Users,
  FileText,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Check,
  X,
  MessageCircle
};

export default function TimeTrackingWorkerHours() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  // Extract data from JSON
  const timeData = adminData.timeTrackingWorkerHours;
  const header = timeData.header;
  const summaryCards = timeData.summaryCards;
  const tabs = timeData.tabs;
  const searchAndFilters = timeData.searchAndFilters;
  const timeEntriesTable = timeData.timeEntriesTable;
  const detailPanel = timeData.detailPanel;

  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(
    new Set(timeEntriesTable.rows.filter((r: any) => r.selected).map((r: any) => r.id))
  );
  const [selectedEntryId, setSelectedEntryId] = useState<string>(
    timeEntriesTable.rows.find((r: any) => r.selected)?.id || timeEntriesTable.rows[0].id
  );
  const [activeTab, setActiveTab] = useState<string>(
    tabs.find((t: any) => t.active)?.id || 'all'
  );

  const handleCheckboxChange = (entryId: string) => {
    setSelectedEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntries(new Set(timeEntriesTable.rows.map((r: any) => r.id)));
    } else {
      setSelectedEntries(new Set());
    }
  };

  // const selectedEntry = timeEntriesTable.rows.find((r: any) => r.id === selectedEntryId) || timeEntriesTable.rows[0];

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
  const LogTimeIcon = iconMap[header.actionButtons[1].icon] || Plus;
  const VarianceIcon = iconMap[detailPanel.varianceWarning.icon] || AlertTriangle;
  // const StatusIcon = iconMap[selectedEntry.statusIcon] || AlertCircle;
  const ApproveIcon = iconMap[detailPanel.actions.approve.icon] || Check;
  const RejectIcon = iconMap[detailPanel.actions.reject.icon] || X;
  const RequestClarificationIcon = iconMap[detailPanel.actions.requestClarification.icon] || MessageCircle;

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
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '1fr 480px',
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
                    <LogTimeIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
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

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E2E8F0', overflowX: isMobileOrTablet ? 'auto' : 'visible', width: '100%' }}>
              {tabs.map((tab: any) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: isMobile ? '8px 16px' : '10px 20px',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #2563EB' : '2px solid transparent',
                    backgroundColor: 'transparent',
                    color: activeTab === tab.id ? '#2563EB' : '#64748B',
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    cursor: 'pointer',
                    marginBottom: -2,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {tab.label}
                </button>
              ))}
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

            {/* Time Entries Table */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 12 : 13, minWidth: isMobileOrTablet ? 1000 : 'auto' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: isMobile ? '10px 12px' : '12px 16px', textAlign: 'left', width: isMobile ? 32 : 40 }}>
                        <input
                          type="checkbox"
                          checked={selectedEntries.size === timeEntriesTable.rows.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          style={{
                            width: isMobile ? 16 : 18,
                            height: isMobile ? 16 : 18,
                            cursor: 'pointer'
                          }}
                        />
                      </th>
                      {timeEntriesTable.headers.slice(1).map((header: string) => (
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
                    {timeEntriesTable.rows.map((row: any) => {
                      const RowStatusIcon = iconMap[row.statusIcon] || AlertCircle;
                      return (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedEntryId(row.id)}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            cursor: 'pointer',
                            backgroundColor: selectedEntryId === row.id ? '#F0F9FF' : 'transparent',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                            <input
                              type="checkbox"
                              checked={selectedEntries.has(row.id)}
                              onChange={() => handleCheckboxChange(row.id)}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: isMobile ? 16 : 18,
                                height: isMobile ? 16 : 18,
                                cursor: 'pointer'
                              }}
                            />
                          </td>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px', minWidth: isMobile ? 120 : 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10 }}>
                              <div
                                style={{
                                  width: isMobile ? 32 : 36,
                                  height: isMobile ? 32 : 36,
                                  borderRadius: '50%',
                                  backgroundColor: '#EFF6FF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: isMobile ? 11 : 12,
                                  fontWeight: 600,
                                  color: '#2563EB',
                                  flexShrink: 0
                                }}
                              >
                                {row.worker.initials}
                              </div>
                              <span
                                style={{
                                  fontSize: isMobile ? 13 : 14,
                                  fontWeight: 500,
                                  color: '#0F172A',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {row.worker.name}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', fontSize: isMobile ? 12 : 13, whiteSpace: 'nowrap' }}>
                            {row.date}
                          </td>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', fontSize: isMobile ? 12 : 13, whiteSpace: 'nowrap' }}>
                            {row.timeRange}
                          </td>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#0F172A', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {row.hours}
                          </td>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                borderRadius: 999,
                                fontSize: isMobile ? 10 : 11,
                                fontWeight: 500,
                                backgroundColor: row.taskTypeBg,
                                color: row.taskTypeColor,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {row.taskType}
                            </span>
                          </td>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px', minWidth: isMobile ? 150 : 'auto' }}>
                            <div>
                              <div
                                style={{
                                  fontSize: isMobile ? 12 : 13,
                                  fontWeight: 500,
                                  color: '#0F172A',
                                  marginBottom: 2,
                                  wordBreak: 'break-word'
                                }}
                              >
                                {row.property.address}
                              </div>
                              {row.property.id && (
                                <div
                                  style={{
                                    fontSize: isMobile ? 10 : 11,
                                    color: '#64748B',
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  {row.property.id}
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', fontSize: isMobile ? 12 : 13, wordBreak: 'break-word' }}>
                            {row.description}
                          </td>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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
                              {row.statusIcon && (
                                <RowStatusIcon
                                  style={{
                                    width: isMobile ? 12 : 14,
                                    height: isMobile ? 12 : 14,
                                    color: row.statusColor,
                                    flexShrink: 0
                                  }}
                                />
                              )}
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

          {/* Right Sidebar - Detail Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 18 : 20, minWidth: 0, width: '100%', order: isMobileOrTablet ? -1 : 0 }}>
            {/* Entry Header */}
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
                <div
                  style={{
                    fontSize: isMobile ? 15 : 16,
                    fontWeight: 600,
                    color: '#0F172A',
                    wordBreak: 'break-word',
                    flex: 1,
                    minWidth: 0
                  }}
                >
                  {detailPanel.selectedEntry.title}
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
              {/* Approval Status Banner */}
              <div
                style={{
                  padding: isMobile ? '10px 14px' : '12px 16px',
                  borderRadius: 8,
                  backgroundColor: detailPanel.approvalStatus.statusBg,
                  border: `1px solid ${detailPanel.approvalStatus.statusColor}20`,
                  marginBottom: isMobile ? 10 : 12,
                  width: '100%',
                  minWidth: 0,
                  boxSizing: 'border-box'
                }}
              >
                <div
                  style={{
                    fontSize: isMobile ? 12 : 13,
                    fontWeight: 600,
                    color: detailPanel.approvalStatus.statusColor,
                    marginBottom: 4,
                    wordBreak: 'break-word'
                  }}
                >
                  {detailPanel.approvalStatus.status}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? 11 : 12,
                    color: '#64748B',
                    wordBreak: 'break-word'
                  }}
                >
                  {detailPanel.approvalStatus.submitted}
                </div>
              </div>
              {/* Variance Warning */}
              {detailPanel.varianceWarning.show && (
                <div
                  style={{
                    padding: isMobile ? '12px 14px' : '14px 16px',
                    borderRadius: 8,
                    backgroundColor: detailPanel.varianceWarning.bg,
                    border: `1px solid ${detailPanel.varianceWarning.color}20`,
                    display: 'flex',
                    gap: isMobile ? 10 : 12,
                    alignItems: 'flex-start',
                    marginBottom: isMobile ? 12 : 16,
                    width: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box'
                  }}
                >
                  <VarianceIcon
                    style={{
                      width: isMobile ? 18 : 20,
                      height: isMobile ? 18 : 20,
                      color: detailPanel.varianceWarning.color,
                      flexShrink: 0,
                      marginTop: 2
                    }}
                  />
                  <div
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: 500,
                      color: detailPanel.varianceWarning.color,
                      flex: 1,
                      minWidth: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.varianceWarning.message}
                  </div>
                </div>
              )}
            </div>

            {/* Worker Information */}
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
                Worker Information
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 12 }}>
                <div
                  style={{
                    width: isMobile ? 44 : 48,
                    height: isMobile ? 44 : 48,
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? 14 : 16,
                    fontWeight: 600,
                    color: '#2563EB',
                    flexShrink: 0
                  }}
                >
                  {detailPanel.workerInfo.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: isMobile ? 14 : 15,
                      fontWeight: 600,
                      color: '#0F172A',
                      marginBottom: 4,
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.workerInfo.name}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      color: '#64748B',
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.workerInfo.role}
                  </div>
                </div>
              </div>
            </div>

            {/* Time Details */}
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
                Time Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12 }}>
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 11 : 12,
                      fontWeight: 500,
                      color: '#64748B',
                      marginBottom: 6,
                      wordBreak: 'break-word'
                    }}
                  >
                    Date
                  </label>
                  <div
                    style={{
                      fontSize: isMobile ? 13 : 14,
                      color: '#0F172A',
                      fontWeight: 500,
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.timeDetails.date}
                  </div>
                </div>
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 11 : 12,
                      fontWeight: 500,
                      color: '#64748B',
                      marginBottom: 6,
                      wordBreak: 'break-word'
                    }}
                  >
                    Total Hours
                  </label>
                  <div
                    style={{
                      fontSize: isMobile ? 13 : 14,
                      color: '#0F172A',
                      fontWeight: 500,
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.timeDetails.totalHours}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 10 : 12 }}>
                  <div style={{ width: '100%', minWidth: 0 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: isMobile ? 11 : 12,
                        fontWeight: 500,
                        color: '#64748B',
                        marginBottom: 6,
                        wordBreak: 'break-word'
                      }}
                    >
                      Start Time
                    </label>
                    <div
                      style={{
                        fontSize: isMobile ? 13 : 14,
                        color: '#0F172A',
                        fontWeight: 500,
                        wordBreak: 'break-word'
                      }}
                    >
                      {detailPanel.timeDetails.startTime}
                    </div>
                  </div>
                  <div style={{ width: '100%', minWidth: 0 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: isMobile ? 11 : 12,
                        fontWeight: 500,
                        color: '#64748B',
                        marginBottom: 6,
                        wordBreak: 'break-word'
                      }}
                    >
                      End Time
                    </label>
                    <div
                      style={{
                        fontSize: isMobile ? 13 : 14,
                        color: '#0F172A',
                        fontWeight: 500,
                        wordBreak: 'break-word'
                      }}
                    >
                      {detailPanel.timeDetails.endTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Property */}
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
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  color: '#0F172A',
                  marginBottom: 4,
                  wordBreak: 'break-word'
                }}
              >
                {detailPanel.property.address}
              </div>
              <div
                style={{
                  fontSize: isMobile ? 11 : 12,
                  color: '#64748B',
                  wordBreak: 'break-word'
                }}
              >
                {detailPanel.property.id}
              </div>
            </div>

            {/* Description */}
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
                Description
              </h3>
              <p
                style={{
                  fontSize: isMobile ? 12 : 13,
                  color: '#1E293B',
                  lineHeight: 1.6,
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 0,
                  marginLeft: 0,
                  wordBreak: 'break-word'
                }}
              >
                {detailPanel.description}
              </p>
            </div>

            {/* Attachments */}
            {detailPanel.attachments && detailPanel.attachments.length > 0 && (
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
                  Attachments
                </h3>
                {detailPanel.attachments.map((attachment: any) => {
                  const AttachmentIcon = iconMap[attachment.icon] || FileText;
                  return (
                    <div
                      key={attachment.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: isMobile ? '8px 10px' : '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#F9FAFB',
                        cursor: 'pointer',
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box'
                      }}
                    >
                      <AttachmentIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, color: '#2563EB', flexShrink: 0 }} />
                      <span
                        style={{
                          fontSize: isMobile ? 12 : 13,
                          color: '#0F172A',
                          flex: 1,
                          minWidth: 0,
                          wordBreak: 'break-word'
                        }}
                      >
                        {attachment.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Activity Log */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  marginBottom: isMobile ? 12 : 16,
                  gap: isMobile ? 8 : 0
                }}
              >
                <h3
                  style={{
                    fontSize: isMobile ? 14 : 15,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 0,
                    marginLeft: 0,
                    wordBreak: 'break-word'
                  }}
                >
                  {detailPanel.activityLog.title}
                </h3>
                <span
                  style={{
                    fontSize: isMobile ? 11 : 12,
                    color: '#64748B',
                    fontWeight: 500,
                    wordBreak: 'break-word'
                  }}
                >
                  {detailPanel.activityLog.sessionHours}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
                {detailPanel.activityLog.activities.map((activity: any, idx: number) => (
                  <div key={activity.id} style={{ display: 'flex', gap: isMobile ? 10 : 12, width: '100%', minWidth: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div
                        style={{
                          width: isMobile ? 6 : 8,
                          height: isMobile ? 6 : 8,
                          borderRadius: '50%',
                          backgroundColor: activity.statusColor,
                          marginBottom: 4
                        }}
                      />
                      {idx < detailPanel.activityLog.activities.length - 1 && (
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
                        {activity.time}
                      </div>
                      <div
                        style={{
                          fontSize: isMobile ? 12 : 13,
                          color: '#1E293B',
                          wordBreak: 'break-word'
                        }}
                      >
                        {activity.activity}
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
                  backgroundColor: detailPanel.actions.approve.bg,
                  color: detailPanel.actions.approve.color,
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <ApproveIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>{detailPanel.actions.approve.label}</span>
              </button>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: detailPanel.actions.reject.bg,
                  color: detailPanel.actions.reject.color,
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <RejectIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>{detailPanel.actions.reject.label}</span>
              </button>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: detailPanel.actions.requestClarification.bg,
                  color: detailPanel.actions.requestClarification.color,
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <RequestClarificationIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>{detailPanel.actions.requestClarification.label}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

