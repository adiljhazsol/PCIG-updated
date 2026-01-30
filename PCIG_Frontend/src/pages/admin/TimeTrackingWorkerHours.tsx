import { CSSProperties, useState, useEffect } from 'react';
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
  MessageCircle,
  Loader2
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

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

  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/time-tracking/dashboard-data');
        setAdminData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching time tracking data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Extract data from API response
  const timeData = (adminData as any)?.timeTrackingWorkerHours || {};
  const rawHeader = timeData.header || {};
  const header = {
    title: rawHeader.title || '',
    subtitle: rawHeader.subtitle || '',
    actionButtons: rawHeader.actionButtons || { export: { label: '', icon: '' }, logHours: { label: '', icon: '' } }
  };

  const rawSummaryCards = Array.isArray(timeData.summaryCards) ? timeData.summaryCards : [];
  const summaryCards = rawSummaryCards.map((card: any) => ({
    label: card?.label || '',
    value: card?.value || '',
    subtext: card?.subtext || '',
    icon: card?.icon || '',
    trend: card?.trend || '',
    trendDirection: card?.trendDirection || ''
  }));

  const rawTabs = Array.isArray(timeData.tabs) ? timeData.tabs : [];
  const tabs = rawTabs.map((tab: any) => ({
    id: tab?.id || '',
    label: tab?.label || '',
    count: tab?.count || 0,
    active: !!tab?.active
  }));
  
  const rawSearchAndFilters = timeData.searchAndFilters || {};
  const searchAndFilters = {
    searchPlaceholder: rawSearchAndFilters.searchPlaceholder || 'Search...',
    filters: Array.isArray(rawSearchAndFilters.filters) ? rawSearchAndFilters.filters.map((f: any) => ({
        label: f?.label || '',
        options: Array.isArray(f?.options) ? f.options : []
    })) : []
  };

  const rawTimeEntriesTable = timeData.timeEntriesTable || {};
  const timeEntriesTable = {
    rows: Array.isArray(rawTimeEntriesTable.rows) ? rawTimeEntriesTable.rows.map((row: any) => ({
        id: row?.id || '',
        worker: row?.worker || '',
        workerAvatar: row?.workerAvatar || '',
        task: row?.task || '',
        project: row?.project || '',
        hours: typeof row?.hours === 'number' ? row.hours : parseFloat(row?.hours || '0'),
        rate: typeof row?.rate === 'number' ? row.rate : parseFloat(row?.rate || '0'),
        total: typeof row?.total === 'number' ? row.total : parseFloat(row?.total || '0'),
        date: row?.date || '',
        status: row?.status || '',
        statusBg: row?.statusBg || '',
        statusColor: row?.statusColor || '',
        selected: !!row?.selected,
        description: row?.description || '',
        images: Array.isArray(row?.images) ? row.images : []
    })) : [],
    headers: Array.isArray(rawTimeEntriesTable.headers) ? rawTimeEntriesTable.headers : []
  };

  const detailPanel = timeData.detailPanel || { varianceWarning: { icon: '' }, actions: { approve: { icon: '' }, reject: { icon: '' }, requestClarification: { icon: '' } } };

  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [selectedEntryId, setSelectedEntryId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Update state when data loads
  useEffect(() => {
    if (timeEntriesTable.rows.length > 0) {
       const initialSelected = timeEntriesTable.rows.filter((r: any) => r.selected).map((r: any) => r.id);
       setSelectedEntries(new Set(initialSelected));
       
       const initialSelectedId = timeEntriesTable.rows.find((r: any) => r.selected)?.id || timeEntriesTable.rows[0]?.id;
       setSelectedEntryId(initialSelectedId);
    }
    if (tabs.length > 0) {
        setActiveTab(tabs.find((t: any) => t.active)?.id || 'all');
    }
  }, [adminData]); // Re-run when adminData changes

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
      setSelectedEntries(new Set((timeEntriesTable.rows || []).map((r: any) => r.id)));
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

  if (loading) {
    return (
      <div style={pageWrapperStyle}>
        <AdminNav />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p style={{ color: '#64748B' }}>Loading time tracking data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageWrapperStyle}>
        <AdminNav />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
          <AlertCircle className="text-red-500" size={32} />
          <p style={{ color: '#EF4444' }}>{error}</p>
        </div>
      </div>
    );
  }

  const GenerateReportIcon = iconMap[header.actionButtons?.export?.icon] || FileText;
  const LogTimeIcon = iconMap[header.actionButtons?.logHours?.icon] || Plus;
  const VarianceIcon = iconMap[detailPanel.varianceWarning?.icon] || AlertTriangle;
  // const StatusIcon = iconMap[selectedEntry.statusIcon] || AlertCircle;
  const ApproveIcon = iconMap[detailPanel.actions?.approve?.icon] || Check;
  const RejectIcon = iconMap[detailPanel.actions?.reject?.icon] || X;
  const RequestClarificationIcon = iconMap[detailPanel.actions?.requestClarification?.icon] || MessageCircle;

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
                    <span style={{ whiteSpace: 'nowrap' }}>{header.actionButtons.export.label}</span>
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
                    <span style={{ whiteSpace: 'nowrap' }}>{header.actionButtons.logHours.label}</span>
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
                            color: '#0F172A'
                          }}
                        >
                          {card.value}
                        </div>
                      </div>
                    </div>
                    {card.trend && (
                      <div
                        style={{
                          fontSize: isMobile ? 12 : 13,
                          color: '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <span style={{ color: card.trend.includes('+') ? '#10B981' : '#64748B', fontWeight: 500 }}>
                          {card.trend}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                gap: isMobile ? 16 : 24,
                borderBottom: '1px solid #E2E8F0',
                overflowX: 'auto',
                paddingBottom: 1,
                marginBottom: isMobile ? 16 : 24
              }}
            >
              {tabs.map((tab: any) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: isMobile ? '0 0 12px' : '0 0 16px',
                    border: 'none',
                    background: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
                    color: activeTab === tab.id ? '#3B82F6' : '#64748B',
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobileOrTablet ? 'column' : 'row',
                gap: 16,
                marginBottom: isMobile ? 16 : 24
              }}
            >
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 16,
                    height: 16,
                    color: '#94A3B8'
                  }}
                />
                <input
                  type="text"
                  placeholder={searchAndFilters.searchPlaceholder}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: isMobile ? 4 : 0 }}>
                {searchAndFilters.filters.map((filter: any, idx: number) => (
                  <button
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontSize: 13,
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }}
                  >
                    <Filter style={{ width: 14, height: 14 }} />
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Entries Table */}
            <div
              style={{
                ...cardStyle,
                padding: 0,
                overflow: 'hidden'
              }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                      <th style={{ padding: '12px 16px', width: 40 }}>
                        <input
                          type="checkbox"
                          checked={selectedEntries.size === timeEntriesTable.rows.length && timeEntriesTable.rows.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: '1px solid #CBD5E1',
                            cursor: 'pointer'
                          }}
                        />
                      </th>
                      {timeEntriesTable.headers.slice(1).map((header: string, idx: number) => (
                        <th
                          key={idx}
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#64748B',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeEntriesTable.rows.map((row: any) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedEntryId(row.id)}
                        style={{
                          borderBottom: '1px solid #E2E8F0',
                          backgroundColor: selectedEntryId === row.id ? '#F8FAFC' : 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        <td style={{ padding: '16px', width: 40 }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedEntries.has(row.id)}
                            onChange={() => handleCheckboxChange(row.id)}
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 4,
                              border: '1px solid #CBD5E1',
                              cursor: 'pointer'
                            }}
                          />
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                              src={row.workerAvatar}
                              alt={row.worker}
                              style={{ width: 32, height: 32, borderRadius: '50%' }}
                            />
                            <span style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>{row.worker}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: 14, color: '#64748B' }}>{row.task}</td>
                        <td style={{ padding: '16px', fontSize: 14, color: '#64748B' }}>{row.project}</td>
                        <td style={{ padding: '16px', fontSize: 14, fontWeight: 500, color: '#0F172A' }}>
                          {row.hours}h
                        </td>
                        <td style={{ padding: '16px', fontSize: 14, color: '#64748B' }}>${row.rate}/h</td>
                        <td style={{ padding: '16px', fontSize: 14, fontWeight: 500, color: '#0F172A' }}>
                          ${row.total.toFixed(2)}
                        </td>
                        <td style={{ padding: '16px', fontSize: 14, color: '#64748B' }}>{row.date}</td>
                        <td style={{ padding: '16px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 10px',
                              borderRadius: 999,
                              backgroundColor: row.statusBg,
                              color: row.statusColor,
                              fontSize: 12,
                              fontWeight: 500
                            }}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Panel - Detail View */}
          {selectedEntryId && (
            <div
               style={{
                  ...cardStyle,
                  position: isMobileOrTablet ? 'static' : 'sticky',
                  top: 24,
                  height: 'fit-content',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24
               }}
            >
              {(() => {
                 const selectedEntry = timeEntriesTable.rows.find((r: any) => r.id === selectedEntryId);
                 if (!selectedEntry) return null;

                 return (
                    <>
                      {/* Worker Header */}
                      <div style={{ textAlign: 'center' }}>
                        <img
                          src={selectedEntry.workerAvatar}
                          alt={selectedEntry.worker}
                          style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 16 }}
                        />
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                          {selectedEntry.worker}
                        </h2>
                        <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
                          {selectedEntry.task} • {selectedEntry.project}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div
                          style={{
                            padding: 12,
                            backgroundColor: '#F8FAFC',
                            borderRadius: 8,
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Hours Logged</div>
                          <div style={{ fontSize: 18, fontWeight: 600, color: '#0F172A' }}>{selectedEntry.hours}h</div>
                        </div>
                        <div
                          style={{
                            padding: 12,
                            backgroundColor: '#F8FAFC',
                            borderRadius: 8,
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Total Cost</div>
                          <div style={{ fontSize: 18, fontWeight: 600, color: '#0F172A' }}>
                            ${selectedEntry.total.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Variance Warning */}
                      {selectedEntry.hours > 8 && (
                        <div
                          style={{
                            display: 'flex',
                            gap: 12,
                            padding: 12,
                            backgroundColor: '#FFFBEB',
                            borderRadius: 8,
                            border: '1px solid #FEF3C7'
                          }}
                        >
                          <VarianceIcon style={{ width: 20, height: 20, color: '#D97706', flexShrink: 0 }} />
                          <div style={{ fontSize: 13, color: '#92400E', lineHeight: 1.5 }}>
                            {detailPanel.varianceWarning.message}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>
                          Description
                        </h3>
                        <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                          {selectedEntry.description}
                        </p>
                      </div>

                      {/* Images */}
                      {selectedEntry.images && selectedEntry.images.length > 0 && (
                        <div>
                          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>
                            Photos ({selectedEntry.images.length})
                          </h3>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {selectedEntry.images.map((img: string, idx: number) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Work ${idx + 1}`}
                                style={{
                                  width: '100%',
                                  height: 100,
                                  objectFit: 'cover',
                                  borderRadius: 8,
                                  border: '1px solid #E2E8F0'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 'auto' }}>
                        <button
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            padding: '10px',
                            borderRadius: 8,
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#FFFFFF',
                            color: '#EF4444',
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          <RejectIcon style={{ width: 16, height: 16 }} />
                          {detailPanel.actions.reject.label}
                        </button>
                        <button
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            padding: '10px',
                            borderRadius: 8,
                            border: 'none',
                            backgroundColor: '#10B981',
                            color: '#FFFFFF',
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          <ApproveIcon style={{ width: 16, height: 16 }} />
                          {detailPanel.actions.approve.label}
                        </button>
                        <button
                          style={{
                            gridColumn: '1 / -1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            padding: '10px',
                            borderRadius: 8,
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#F8FAFC',
                            color: '#64748B',
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          <RequestClarificationIcon style={{ width: 16, height: 16 }} />
                          {detailPanel.actions.requestClarification.label}
                        </button>
                      </div>
                    </>
                 );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
