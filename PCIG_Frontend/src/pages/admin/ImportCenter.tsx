import { CSSProperties, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  Table,
  Clock,
  CheckCircle2,
  File
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

type ImportTabKey = string;

export default function ImportCenter() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/imports/dashboard-data');
        if (response.data && response.data.data && response.data.data.importCenter) {
          setData(response.data.data.importCenter);
        } else {
          setError('Failed to load import center data');
        }
      } catch (err) {
        console.error('Error fetching import center data:', err);
        setError('An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Safe data extraction
  const importData = data || {};
  const header = importData?.header || {
    title: 'Import Center',
    subtitle: 'Manage data imports and integrations',
    stats: []
  };
  
  // Normalize tabs to objects
  const rawTabs = importData?.tabs || ['fifa', 'excel', 'pdf', 'history'];
  const tabs = rawTabs.map((t: any) => 
    typeof t === 'string' 
      ? { id: t.toLowerCase().replace(/\s+/g, '_'), label: t, type: 'excel' } 
      : t
  );

  // Force 'fifa' tab to use 'fifa' panel config (which is now Excel-based)
  // Ensure the type matches the key in uploadPanels
  const refinedTabs = tabs.map((t: any) => {
      if (t.id === 'fifa') return { ...t, type: 'fifa' };
      return t;
  });

  const uploadPanels = importData?.uploadPanels || {
      fifa: {
          title: 'Upload FIFA List (Excel/CSV)',
          description: 'Upload FIFA property list for automated processing.',
          primaryButton: 'Upload Excel/CSV',
          helper: 'Supports .xlsx, .csv',
          acceptedFileTypes: '.csv,.xlsx,.xls'
      },
      excel: {
          title: 'Excel / CSV Import',
          description: 'Import property lists, financial data, or investor records',
          primaryButton: 'Select File',
          helper: 'Supports .xlsx, .csv',
          acceptedFileTypes: '.csv,.xlsx,.xls'
      },
      generic: {
          title: 'Upload Documents',
          description: 'Upload general documents',
          primaryButton: 'Select File',
          helper: 'Supports various formats',
          acceptedFileTypes: '*/*'
      }
  };
  const reviewQueue = importData?.reviewQueue || [];
  const recentBatches = importData?.recentBatches || [];
  const statusFilters: string[] = importData?.statusFilters || ['All', 'Processing', 'Completed', 'Error'];

  const [activeTab, setActiveTab] = useState<string>(refinedTabs[0]?.id || 'fifa');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>(statusFilters[0]);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
      name: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
      id: '',
      address: '',
      parcel_id: '',
      city: '',
      state: '',
      zip_code: ''
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Determine active panel config
  const activeTabConfig = refinedTabs.find((t: any) => t.id === activeTab) || refinedTabs[0];
  const panelType = activeTabConfig?.type || 'excel';
  const activePanel = uploadPanels[panelType] || uploadPanels['excel'];

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          // Select all IDs from current rows
          const allIds = reviewQueue.rows?.map((r: any) => String(r.id)) || [];
          setSelectedIds(allIds);
      } else {
          setSelectedIds([]);
      }
  };

  const handleSelectRow = (id: string | number) => {
      const idStr = String(id);
      setSelectedIds(prev => {
          if (prev.includes(idStr)) {
              return prev.filter(i => i !== idStr);
          } else {
              return [...prev, idStr];
          }
      });
  };

  const handleBulkConfirm = async () => {
      if (selectedIds.length === 0) return;
      
      try {
          await api.post('/admin/imports/review/confirm-batch', { ids: selectedIds });
          setSelectedIds([]);
          // Refresh data
          const response = await api.get('/admin/imports/dashboard-data');
          if (response.data && response.data.data && response.data.data.importCenter) {
              setData(response.data.data.importCenter);
          }
          alert('Selected properties confirmed successfully!');
      } catch (err) {
          console.error('Failed to confirm properties:', err);
          alert('Failed to confirm properties');
      }
  };

  const handleAction = async (action: string, row: any) => {
      if (action === 'Confirm') {
          try {
              await api.post(`/admin/imports/review/${row.id}/confirm`);
              // Refresh data
              const response = await api.get('/admin/imports/dashboard-data');
              if (response.data && response.data.data && response.data.data.importCenter) {
                setData(response.data.data.importCenter);
              }
              // alert('Property confirmed successfully!'); // Optional: suppress alert for smoother UX
          } catch (err) {
              console.error('Failed to confirm property:', err);
              alert('Failed to confirm property');
          }
      } else if (action === 'Edit') {
          // Populate form data from row
          // Based on AdminImportCenterController mapping:
          // extracted.primary = property.address
          // proposed.primary = property.parcel_id
          
          const address = row.extracted?.primary || '';
          const parcelId = row.proposed?.primary || ''; 
          
          setEditFormData({
              id: row.id,
              address: address,
              parcel_id: parcelId,
              city: '', // These might not be easily available from the dashboard view model
              state: '',
              zip_code: ''
          });
          setShowEditModal(true);
      }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await api.post(`/admin/imports/review/${editFormData.id}/update`, editFormData);
          setShowEditModal(false);
          
          // Refresh data
          const response = await api.get('/admin/imports/dashboard-data');
          if (response.data && response.data.data && response.data.data.importCenter) {
            setData(response.data.data.importCenter);
          }
          alert('Property updated successfully!');
      } catch (err) {
          console.error('Failed to update property:', err);
          alert('Failed to update property');
      }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
        alert('Please select a file');
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', uploadFormData.name);
    formData.append('description', uploadFormData.description);
    formData.append('date', uploadFormData.date);

    try {
      setLoading(true);
      await api.post(`/admin/imports/upload/${activeTab}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Refresh data after upload
      const response = await api.get('/admin/imports/dashboard-data');
      if (response.data && response.data.data && response.data.data.importCenter) {
        setData(response.data.data.importCenter);
      }
      alert('Upload successful!');
      setShowUploadModal(false);
      setUploadFormData({ name: '', description: '', date: new Date().toISOString().split('T')[0] });
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
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

  const mainContainerStyle: CSSProperties = {
    padding: isMobile ? '20px 16px' : isTablet ? '24px 24px' : '32px 48px',
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    boxSizing: 'border-box'
  };

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC' }}>
        <div style={{ color: '#64748B' }}>Loading import center...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC' }}>
        <div style={{ color: '#EF4444' }}>{error}</div>
      </div>
    );
  }

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
          {refinedTabs.map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: isMobile ? '10px 0' : '12px 0',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: 500,
                color: activeTab === tab.id ? '#1E3A5F' : '#64748B',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #1E3A5F' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-1px',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload panels row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr', // Single column for focused view
            gap: isMobile ? 16 : 24,
            marginBottom: isMobile ? 24 : 32
          }}
        >
          {/* Dynamic Panel based on Active Tab */}
          <div
            key={activeTab} // Force re-render on tab change for visual feedback
            style={{
              borderRadius: 12,
              border: '1px dashed #BFDBFE',
              backgroundColor: '#EFF6FF',
              padding: isMobile ? '20px' : '28px',
              minHeight: 220,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            <style>
              {`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(5px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}
            </style>
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
               {panelType === 'fifa' ? (
                  <FileText style={{ width: 28, height: 28, color: '#1E3A5F' }} />
               ) : panelType === 'generic' ? (
                  <File style={{ width: 28, height: 28, color: '#1E3A5F' }} />
               ) : (
                  <Table style={{ width: 28, height: 28, color: '#15803D' }} />
               )}
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
              {activePanel.title}
            </h2>
            <p
              style={{
                fontSize: isMobile ? '12px' : '13px',
                color: '#64748B',
                margin: 0,
                marginBottom: 20,
                maxWidth: 400
              }}
            >
              {activePanel.description}
            </p>
            
            <div style={{ display: 'flex', gap: 10, flexWrap: isMobile ? 'wrap' : 'nowrap', justifyContent: 'center' }}>
                <button
                    onClick={() => setShowUploadModal(true)}
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
                        cursor: 'pointer'
                    }}
                >
                    <UploadCloud style={{ width: 16, height: 16 }} />
                    {activePanel.primaryButton || activePanel.uploadButton}
                </button>
            </div>

            <div
              style={{
                fontSize: isMobile ? '11px' : '12px',
                color: '#64748B',
                marginTop: 8
              }}
            >
              {activePanel.helper}
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
                onClick={handleBulkConfirm}
                disabled={selectedIds.length === 0}
                style={{
                  padding: isMobile ? '8px 12px' : '8px 14px',
                  fontSize: isMobile ? '11px' : '12px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  backgroundColor: selectedIds.length > 0 ? '#1E3A5F' : '#94A3B8',
                  borderRadius: 8,
                  border: 'none',
                  cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                Confirm Selected ({selectedIds.length})
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
                    <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={reviewQueue.rows?.length > 0 && selectedIds.length === reviewQueue.rows.length}
                    />
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
                      <input 
                          type="checkbox" 
                          checked={selectedIds.includes(String(row.id))}
                          onChange={() => handleSelectRow(row.id)}
                      />
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
                          onClick={() => handleAction(action.label, row)}
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
              onClick={() => navigate('/admin/properties/fifa-import/batches')}
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
                        onClick={() => navigate(`/admin/properties/fifa-import/${row.id}`)}
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

      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 20, color: '#1E293B' }}>Edit Property</h2>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                  Address
                </label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                  Parcel ID
                </label>
                <input
                  type="text"
                  value={editFormData.parcel_id}
                  onChange={(e) => setEditFormData({...editFormData, parcel_id: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #CBD5E1', background: 'white', color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#1E3A5F', color: 'white', cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 20, color: '#1E293B' }}>Upload Import</h2>
            <form onSubmit={handleUploadSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                  Import Name (Batch Name)
                </label>
                <input
                  type="text"
                  required
                  value={uploadFormData.name}
                  onChange={(e) => setUploadFormData({...uploadFormData, name: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  placeholder="e.g. January 2026 List"
                />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                  Description (Optional)
                </label>
                <textarea
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData({...uploadFormData, description: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', boxSizing: 'border-box', minHeight: 80 }}
                  placeholder="Add notes about this import..."
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                  Import Date
                </label>
                <input
                  type="date"
                  value={uploadFormData.date}
                  onChange={(e) => setUploadFormData({...uploadFormData, date: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                  Select File
                </label>
                <input
                  type="file"
                  required
                  accept={activePanel.acceptedFileTypes || '*/*'}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #CBD5E1', background: 'white', color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#1E3A5F', color: 'white', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Uploading...' : 'Start Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


