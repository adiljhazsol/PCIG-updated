import React, { CSSProperties, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Clock,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Eye,
  Settings,
  FileCheck,
  X
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Clock,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Eye,
  Settings,
  FileCheck,
  X
};

export default function EFileCancellations() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Date filter state if needed, though backend support might be limited
  // const [dateFilter, setDateFilter] = useState('Last 30 Days');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.append('search', searchQuery);
        if (statusFilter !== 'All Statuses') queryParams.append('status', statusFilter);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/admin/efile/dashboard-data?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, refreshTrigger]);

  // Extract data from state with safe defaults
  const header = data?.header || {
    title: 'E-File & Cancellations',
    subtitle: 'Manage electronic filings and cancellation requests',
    actionButtons: []
  };
  const summaryCards = data?.summaryCards || [];
  const alertBanners = data?.alertBanners || [];
  const searchAndFilters = data?.searchAndFilters || {
    searchPlaceholder: 'Search...',
    filters: []
  };
  const cancellationsTable = data?.cancellationsTable || {
    headers: [],
    rows: []
  };

  const [selectedCancellations, setSelectedCancellations] = useState<Set<string>>(new Set());
  const [selectedCancellationId, setSelectedCancellationId] = useState<string>('');
  
  const selectedCancellation = cancellationsTable.rows.find((r: any) => r.id === selectedCancellationId) || null;

  const [searchParams] = useSearchParams();
  const urlCancellationId = searchParams.get('cancellation_id');

  useEffect(() => {
    if (cancellationsTable.rows.length > 0) {
      // Prioritize URL param if present and valid
      if (urlCancellationId && cancellationsTable.rows.some((r: any) => r.id === urlCancellationId)) {
        if (selectedCancellationId !== urlCancellationId) {
             setSelectedCancellationId(urlCancellationId);
        }
      } 
      // Else if no selection or current selection not in new list, select first
      else if (!selectedCancellationId || !cancellationsTable.rows.find((r: any) => r.id === selectedCancellationId)) {
        setSelectedCancellationId(cancellationsTable.rows[0].id);
      }
    } else {
        setSelectedCancellationId('');
    }
  }, [cancellationsTable.rows, selectedCancellationId, urlCancellationId]);

  const handleCheckboxChange = (cancellationId: string) => {
    setSelectedCancellations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cancellationId)) {
        newSet.delete(cancellationId);
      } else {
        newSet.add(cancellationId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCancellations(new Set((cancellationsTable.rows || []).map((r: any) => r.id)));
    } else {
      setSelectedCancellations(new Set());
    }
  };

  const handleRowClick = (cancellationId: string) => {
    setSelectedCancellationId(cancellationId);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBatchClick = () => {
    fileInputRef.current?.click();
  };

  const handleBatchFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/admin/efile/batch-efile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert('Failed to upload batch file');
      }
    } catch (error) {
      console.error('Error uploading batch file:', error);
      alert('Error uploading batch file');
    }
  };

  const handleSubmitToGsccca = async () => {
    if (!selectedCancellationId) return;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/admin/efile/${selectedCancellationId}/submit-gsccca`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            setRefreshTrigger(prev => prev + 1);
        }
    } catch (e) {
        console.error(e);
    }
  };

  const handleCheckStatus = async () => {
    if (!selectedCancellationId) return;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/admin/efile/${selectedCancellationId}/check-status`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            setRefreshTrigger(prev => prev + 1);
        }
    } catch (e) {
        console.error(e);
    }
  };

  const handleViewXml = async () => {
    if (!selectedCancellationId) return;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/admin/efile/${selectedCancellationId}/view-xml`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            const blob = new Blob([data.xml_content], { type: 'text/xml' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } else {
            alert(data.message || 'Failed to retrieve XML');
        }
    } catch (error) {
        console.error(error);
        alert('Error fetching XML');
    }
  };

  const detailPanel = {
    title: 'Request Details',
    cancellationDetails: { 
        title: 'Cancellation Details', 
        fields: [
            { label: 'Request ID', value: selectedCancellation?.detail_id || '-' },
            { label: 'Request Date', value: selectedCancellation?.detail_requested_at || '-' },
            { label: 'Reason', value: selectedCancellation?.detail_reason || '-' },
            { label: 'Requested By', value: selectedCancellation?.detail_requested_by || '-' }
        ] 
    },
    requiredDocuments: { 
        title: 'Required Documents', 
        status: 'Pending Upload',
        statusBg: '#FEF3C7',
        statusColor: '#D97706',
        uploadButton: 'Upload Document',
        documents: [
            { id: 1, name: 'Cancellation Request Form', icon: 'FileText' },
            { id: 2, name: 'Proof of Payment', icon: 'FileCheck' }
        ]
    },
    efileStatus: { 
        title: 'E-File Status', 
        timeline: [
            { id: 1, label: 'Request Created', date: selectedCancellation?.created_at_fmt || '-', status: 'completed', statusColor: '#2563EB' },
            { id: 2, label: 'Submitted to County', date: selectedCancellation?.submitted_at || 'Pending', status: selectedCancellation?.gsccca_status === 'submitted' || selectedCancellation?.gsccca_status === 'accepted' ? 'completed' : 'pending', statusColor: '#2563EB' },
            { id: 3, label: 'County Accepted', date: selectedCancellation?.status === 'cancelled' ? 'Accepted' : 'Pending', status: selectedCancellation?.status === 'cancelled' ? 'completed' : 'pending', statusColor: '#16A34A' }
        ]
    },
    gscccaIntegration: { 
        title: 'GSCCCA Integration', 
        apiStatus: selectedCancellation?.gsccca_status === 'submitted' ? 'Submitted' : selectedCancellation?.gsccca_status === 'accepted' ? 'Accepted' : 'Pending',
        apiStatusBg: selectedCancellation?.gsccca_status === 'submitted' ? '#EFF6FF' : selectedCancellation?.gsccca_status === 'accepted' ? '#DCFCE7' : '#F1F5F9',
        apiStatusColor: selectedCancellation?.gsccca_status === 'submitted' ? '#2563EB' : selectedCancellation?.gsccca_status === 'accepted' ? '#16A34A' : '#64748B',
        primaryAction: { 
            label: selectedCancellation?.gsccca_status === 'pending' ? 'Submit to GSCCCA' : selectedCancellation?.gsccca_status === 'submitted' ? 'Check Status' : 'View Status',
            bg: '#2563EB',
            color: '#FFFFFF',
            onClick: selectedCancellation?.gsccca_status === 'pending' ? handleSubmitToGsccca : handleCheckStatus
        }, 
        secondaryActions: [
            { label: 'View XML Preview', icon: 'FileText', bg: '#FFFFFF', color: '#64748B', onClick: handleViewXml },
            { label: 'Check Status', icon: 'Clock', bg: '#FFFFFF', color: '#64748B', onClick: handleCheckStatus }
        ]
    }
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

  const cardStyle: CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E2E8F0',
    padding: isMobile ? 12 : isTablet ? 16 : 20,
    boxSizing: 'border-box'
  };

  if (loading) {
    return (
      <div style={{ ...pageWrapperStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#64748B', fontSize: 16, fontWeight: 500 }}>Loading dashboard data...</div>
      </div>
    );
  }

  const SettingsIcon = (header.actionButtons && header.actionButtons[0] && iconMap[header.actionButtons[0].icon]) || Settings;
  const BatchEFileIcon = (header.actionButtons && header.actionButtons[1] && iconMap[header.actionButtons[1].icon]) || Upload;
  const EyeIcon = iconMap['Eye'] || Eye;
  const UploadIcon = iconMap['Upload'] || Upload;

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
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleBatchFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={handleBatchClick}
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
                    <BatchEFileIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap' }}>Batch E-File</span>
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
              {(summaryCards || []).map((card: any, idx: number) => {
                const CardIcon = iconMap[card.icon] || FileText;
                return (
                  <div
                    key={card.id || idx}
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
                          {card.title || card.label}
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

            {/* Alert Banners */}
            {(alertBanners || []).map((alert: any) => (
              <div
                key={alert.id}
                style={{
                  padding: isMobile ? '12px 16px' : '14px 20px',
                  borderRadius: 8,
                  backgroundColor: alert.bg,
                  border: `1px solid ${alert.color}40`,
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: isMobile ? 10 : 0,
                  width: '100%',
                  minWidth: 0,
                  boxSizing: 'border-box'
                }}
              >
                <span
                  style={{
                    fontSize: isMobile ? 13 : 14,
                    color: alert.color,
                    fontWeight: 500,
                    wordBreak: 'break-word',
                    flex: 1,
                    minWidth: 0
                  }}
                >
                  {alert.message}
                </span>
                <button
                  style={{
                    padding: isMobile ? '6px 14px' : '6px 16px',
                    borderRadius: 6,
                    border: `1px solid ${alert.color}`,
                    backgroundColor: '#FFFFFF',
                    color: alert.color,
                    fontSize: isMobile ? 12 : 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    boxSizing: 'border-box'
                  }}
                >
                  {alert.button}
                </button>
              </div>
            ))}

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              {(searchAndFilters.filters || []).map((filter: any, idx: number) => {
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
                      value={filter.value}
                      onChange={(e) => {
                        if (filter.label === 'Status') setStatusFilter(e.target.value);
                      }}
                    >
                      {filter.options && filter.options.map((opt: string) => (
                        <option key={opt} value={opt}>
                           {filter.label}: {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            {/* Cancellations Table */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 12 : 13, minWidth: isMobileOrTablet ? 1000 : 'auto' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: isMobile ? '10px 12px' : '12px 16px', textAlign: 'left', width: isMobile ? 32 : 40 }}>
                        <input
                          type="checkbox"
                          checked={selectedCancellations.size === cancellationsTable.rows.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          style={{
                            width: isMobile ? 16 : 18,
                            height: isMobile ? 16 : 18,
                            cursor: 'pointer'
                          }}
                        />
                      </th>
                      {(cancellationsTable.headers || []).slice(1).map((header: string) => (
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
                    {(cancellationsTable.rows || []).map((row: any) => (
                      <tr
                        key={row.id}
                        onClick={() => handleRowClick(row.id)}
                        style={{
                          borderBottom: '1px solid #E2E8F0',
                          cursor: 'pointer',
                          backgroundColor: selectedCancellationId === row.id ? '#EFF6FF' : 'transparent',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedCancellationId !== row.id) {
                            e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedCancellationId !== row.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                          <input
                            type="checkbox"
                            checked={selectedCancellations.has(row.id)}
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
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', minWidth: isMobile ? 120 : 'auto' }}>
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
                              {row.lienInfo.fileNumber}
                            </div>
                            <div
                              style={{
                                fontSize: isMobile ? 11 : 12,
                                color: '#64748B',
                                wordBreak: 'break-word'
                              }}
                            >
                              {row.lienInfo.taxYear}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', fontSize: isMobile ? 12 : 13, whiteSpace: 'nowrap' }}>
                          {row.payoffDate}
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
                          {row.fileDate}
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', fontSize: isMobile ? 12 : 13, wordBreak: 'break-word' }}>
                          {row.confirmation}
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                          {row.issues !== '-' ? (
                            <span
                              style={{
                                fontSize: isMobile ? 11 : 12,
                                color: row.issuesColor,
                                fontWeight: 500,
                                wordBreak: 'break-word'
                              }}
                            >
                              {row.issues}
                            </span>
                          ) : (
                            <span style={{ color: '#64748B' }}>-</span>
                          )}
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
            {/* Cancellation Header */}
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
                      fontSize: isMobile ? 15 : 16,
                      fontWeight: 600,
                      color: '#0F172A',
                      marginBottom: 8,
                      wordBreak: 'break-word'
                    }}
                  >
                    {selectedCancellation?.property?.address || '-'}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 11 : 12,
                      color: '#64748B',
                      marginBottom: 12,
                      wordBreak: 'break-word'
                    }}
                  >
                    {selectedCancellation?.property?.parcel || '-'}
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: isMobile ? 10 : 11,
                      fontWeight: 500,
                      backgroundColor: selectedCancellation?.statusBg || '#E2E8F0',
                      color: selectedCancellation?.statusColor || '#64748B',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {selectedCancellation?.status || '-'}
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

            {/* Cancellation Details */}
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
                {detailPanel.cancellationDetails.title}
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
                      Request ID
                    </label>
                    <div
                      style={{
                        fontSize: isMobile ? 12 : 13,
                        color: '#0F172A',
                        fontWeight: 500,
                        wordBreak: 'break-word'
                      }}
                    >
                      {selectedCancellation?.detail_id || '-'}
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
                      Request Date
                    </label>
                    <div
                      style={{
                        fontSize: isMobile ? 12 : 13,
                        color: '#0F172A',
                        fontWeight: 500,
                        wordBreak: 'break-word'
                      }}
                    >
                      {selectedCancellation?.detail_requested_at || '-'}
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
                      Reason
                    </label>
                    <div
                      style={{
                        fontSize: isMobile ? 12 : 13,
                        color: '#0F172A',
                        fontWeight: 500,
                        wordBreak: 'break-word'
                      }}
                    >
                      {selectedCancellation?.detail_reason || '-'}
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
                      Requested By
                    </label>
                    <div
                      style={{
                        fontSize: isMobile ? 12 : 13,
                        color: '#0F172A',
                        fontWeight: 500,
                        wordBreak: 'break-word'
                      }}
                    >
                      {selectedCancellation?.detail_requested_by || '-'}
                    </div>
                  </div>
              </div>
            </div>

            {/* Required Documents */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: isMobile ? 10 : 12,
                  gap: 8,
                  flexWrap: 'wrap'
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
                  {detailPanel.requiredDocuments.title}
                </h3>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: isMobile ? 10 : 11,
                    fontWeight: 500,
                    backgroundColor: detailPanel.requiredDocuments.statusBg,
                    color: detailPanel.requiredDocuments.statusColor,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {detailPanel.requiredDocuments.status}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 8 }}>
                {(detailPanel.requiredDocuments?.documents || []).map((doc: any) => {
                  const DocIcon = iconMap[doc.icon] || Eye;
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
                      <button
                        style={{
                          width: isMobile ? 26 : 28,
                          height: isMobile ? 26 : 28,
                          borderRadius: 6,
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        <DocIcon style={{ width: isMobile ? 13 : 14, height: isMobile ? 13 : 14, color: '#64748B' }} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                style={{
                  marginTop: isMobile ? 10 : 12,
                  padding: isMobile ? '8px 14px' : '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {detailPanel.requiredDocuments.uploadButton}
              </button>
            </div>

            {/* eFile Status */}
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
                {detailPanel.efileStatus.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
                {(detailPanel.efileStatus?.timeline || []).map((step: any, idx: number) => (
                  <div key={step.id} style={{ display: 'flex', gap: isMobile ? 10 : 12, width: '100%', minWidth: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div
                        style={{
                          width: isMobile ? 6 : 8,
                          height: isMobile ? 6 : 8,
                          borderRadius: '50%',
                          backgroundColor: step.status === 'completed' ? step.statusColor : '#E2E8F0',
                          marginBottom: 4
                        }}
                      />
                      {idx < detailPanel.efileStatus.timeline.length - 1 && (
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
                          color: step.status === 'completed' ? step.statusColor : '#64748B',
                          marginBottom: 4,
                          wordBreak: 'break-word'
                        }}
                      >
                        {step.label}
                      </div>
                      <div
                        style={{
                          fontSize: isMobile ? 11 : 12,
                          color: '#64748B',
                          wordBreak: 'break-word'
                        }}
                      >
                        {step.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GSCCCA Integration */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: isMobile ? 12 : 16,
                  gap: 8,
                  flexWrap: 'wrap'
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
                  {detailPanel.gscccaIntegration.title}
                </h3>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: isMobile ? 10 : 11,
                    fontWeight: 500,
                    backgroundColor: detailPanel.gscccaIntegration.apiStatusBg,
                    color: detailPanel.gscccaIntegration.apiStatusColor,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {detailPanel.gscccaIntegration.apiStatus}
                </span>
              </div>
              <button
                onClick={detailPanel.gscccaIntegration.primaryAction.onClick}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: detailPanel.gscccaIntegration.primaryAction.bg,
                  color: detailPanel.gscccaIntegration.primaryAction.color,
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  marginBottom: isMobile ? 10 : 12
                }}
              >
                <UploadIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>{detailPanel.gscccaIntegration.primaryAction.label}</span>
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 8 }}>
                {(detailPanel.gscccaIntegration?.secondaryActions || []).map((action: any, idx: number) => {
                  const ActionIcon = iconMap[action.icon] || FileText;
                  return (
                    <button
                      key={idx}
                      onClick={action.onClick}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: isMobile ? '8px 14px' : '10px 16px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: action.bg,
                        color: action.color,
                        fontSize: isMobile ? 12 : 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        width: '100%',
                        justifyContent: 'center',
                        boxSizing: 'border-box'
                      }}
                    >
                      <ActionIcon style={{ width: isMobile ? 13 : 14, height: isMobile ? 13 : 14, flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap' }}>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

