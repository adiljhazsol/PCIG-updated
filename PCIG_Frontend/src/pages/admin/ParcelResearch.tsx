import React, { CSSProperties, useState, useEffect, useRef } from 'react';
import {
  Clock,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  Package,
  Grid,
  X,
  Edit
} from 'lucide-react';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminNav from '../../components/admin/AdminNav';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Clock,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  Package,
  Grid,
  X,
  Edit
};

interface ParcelRow {
  id: string;
  selected: boolean;
  parcelId: string;
  situsAddress: string;
  county: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  mailingAddress: string;
  contactHistory?: {
      lastContact: string;
      summary: string;
  };
  [key: string]: any;
}

export default function ParcelResearch() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('All Counties');
  const [selectedBuyDecision, setSelectedBuyDecision] = useState('All');
  
  const [selectedParcelId, setSelectedParcelId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('Owner Contact');
  const [interactionType, setInteractionType] = useState<string>('Call (Outbound)');
  const [interactionNotes, setInteractionNotes] = useState<string>('');
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [isLoggingInteraction, setIsLoggingInteraction] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [editedRows, setEditedRows] = useState<{ [key: string]: Partial<ParcelRow> }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
        const params: any = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (selectedCounty !== 'All Counties') params.county = selectedCounty;
        if (selectedBuyDecision !== 'All') params.buy_decision = selectedBuyDecision;

        const response = await api.get('/admin/parcel/dashboard-data', { params });
        const result = response.data;
        setData(result);
        
        // Initialize visible columns if not set
        if (visibleColumns.length === 0 && result.dataGrid && result.dataGrid.headers) {
            setVisibleColumns(result.dataGrid.headers);
        }
        
        // Initialize selected parcel if not set or if current selection is gone
        if (result.dataGrid && result.dataGrid.rows && result.dataGrid.rows.length > 0) {
            // Keep current selection if valid
            const currentExists = result.dataGrid.rows.find((r: ParcelRow) => r.id === selectedParcelId);
            if (!selectedParcelId || !currentExists) {
                const initialSelected = result.dataGrid.rows.find((r: ParcelRow) => r.selected) || result.dataGrid.rows[0];
                setSelectedParcelId(initialSelected.id);
            }
        }
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, selectedCounty, selectedBuyDecision]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return null;

  // Extract data from fetched result
  const header = data.header;
  const summaryCards = data.summaryCards;
  const searchAndFilters = data.searchAndFilters;
  const gridActions = data.gridActions;
  const dataGrid = data.dataGrid;
  const detailView = data.detailView;
  const quickContact = data.quickContact;

  const handleRowClick = (parcelId: string) => {
    setSelectedParcelId(parcelId);
  };

  const selectedParcel = dataGrid.rows.find((r: any) => r.id === selectedParcelId) || dataGrid.rows[0] || {};

  const handleHeaderAction = async (label: string) => {
    switch (label) {
      case '+ Add Parcel':
        navigate('/admin/properties/parcel-research/add');
        break;
      case '↑ Bulk Import':
        navigate('/admin/properties/parcel-research/import');
        break;
      case 'Export':
        try {
            const params: any = {};
            if (debouncedSearch) params.search = debouncedSearch;
            if (selectedCounty !== 'All Counties') params.county = selectedCounty;
            if (selectedBuyDecision !== 'All') params.buy_decision = selectedBuyDecision;
            
            const response = await api.get('/admin/parcel/export', { 
                params,
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `parcel_research_data_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed', err);
            alert('Failed to export data');
        }
        break;
      default:
        console.log(`Action ${label} not implemented`);
    }
  };

  const handleGridAction = async (label: string) => {
    switch (label) {
      case 'Bulk Edit':
        setIsBulkEditMode(!isBulkEditMode);
        if (!isBulkEditMode) setEditedRows({}); // Reset on enter
        break;
      case 'Save Changes':
        if (Object.keys(editedRows).length === 0) {
            setIsBulkEditMode(false);
            return;
        }
        
        try {
            const changes = Object.entries(editedRows).map(([id, updates]) => ({
                id,
                ...updates
            }));
            
            await api.post('/admin/parcel/bulk-update', { changes });
            
            // Refresh data
            fetchData();
            setIsBulkEditMode(false);
            setEditedRows({});
            alert('Changes saved successfully!');
        } catch (err) {
            console.error('Failed to save changes', err);
            alert('Failed to save changes');
        }
        break;
      case 'Undo':
        setIsBulkEditMode(false);
        setEditedRows({});
        break;
      case 'Columns':
        setShowColumnSelector(!showColumnSelector);
        break;
      default:
        console.log(`Grid action ${label} not implemented`);
    }
  };

  const handleCellEdit = (id: string, field: string, value: string) => {
    setEditedRows(prev => ({
        ...prev,
        [id]: {
            ...prev[id],
            [field]: value
        }
    }));
    
    // Optimistic update
    if (data && data.dataGrid && data.dataGrid.rows) {
        const newRows = data.dataGrid.rows.map((r: ParcelRow) => {
            if (r.id === id) return { ...r, [field]: value };
            return r;
        });
        setData({
            ...data,
            dataGrid: {
                ...data.dataGrid,
                rows: newRows
            }
        });
    }
  };

  const handleContactAction = (label: string, value?: string) => {
    if (!value && !selectedParcel) return;
    
    // Use selected parcel data if value not provided directly
    // This is a simplification; in real app we'd need to map buttons to specific fields
    
    switch (label) {
      case 'Call':
        if (selectedParcel.ownerPhone) window.location.href = `tel:${selectedParcel.ownerPhone}`;
        break;
      case 'Text':
        if (selectedParcel.ownerPhone) window.location.href = `sms:${selectedParcel.ownerPhone}`;
        break;
      case 'Email':
        if (selectedParcel.ownerEmail && selectedParcel.ownerEmail !== '-') {
            window.location.href = `mailto:${selectedParcel.ownerEmail}?subject=Regarding Parcel ${selectedParcel.parcelId}`;
        } else {
            // Fallback
            window.location.href = `mailto:?subject=Regarding Parcel ${selectedParcel.parcelId}`;
        }
        break;
    }
  };

  const handleLogInteraction = async () => {
    if (!selectedParcelId || !interactionNotes) return;
    
    setIsLoggingInteraction(true);
    try {
        await api.post(`/admin/parcel/${selectedParcelId}/interaction`, {
            type: interactionType,
            notes: interactionNotes
        });
        setInteractionNotes('');
        alert('Interaction logged successfully');
        fetchData();
    } catch (err) {
        console.error('Failed to log interaction', err);
        alert('Failed to log interaction');
    } finally {
        setIsLoggingInteraction(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedParcelId) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        await api.post(`/admin/parcel/${selectedParcelId}/document`, formData);
        alert('Document uploaded successfully');
        // Refresh data to show new document
        fetchData();
    } catch (err) {
        console.error('Failed to upload document', err);
        alert('Failed to upload document');
    } finally {
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
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

  const cardStyle: CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E2E8F0',
    padding: `clamp(16px, 2vh, 20px)`,
    boxSizing: 'border-box'
  };

  const AddParcelIcon = iconMap[header.actionButtons[0].icon] || Plus;
  const BulkImportIcon = iconMap[header.actionButtons[1].icon] || Upload;
  const ExportIcon = iconMap[header.actionButtons[2].icon] || Download;
  const ColumnsIcon = iconMap['Grid'] || Grid;

  return (
    <div style={pageWrapperStyle}>
      <AdminNav />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      <div
        style={{
          padding: isMobile ? '16px 16px 24px' : isTablet ? '20px 24px 32px' : '24px 40px',
          width: '100%',
          maxWidth: '100%',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Main Layout: Responsive Grid/Flex */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet
              ? 'minmax(0, 1fr)'
              : '1fr 380px',
            gap: isMobile ? 16 : 24,
            alignItems: 'start'
          }}
        >
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: isMobileOrTablet ? 'flex-start' : 'center',
                  flexDirection: isMobileOrTablet ? 'column' : 'row',
                  gap: `clamp(12px, 1.5vh, 16px)`,
                  marginBottom: `clamp(8px, 1vh, 12px)`
                }}
              >
                <div>
                  <h1
                    style={{
                      fontSize: `clamp(20px, 2.5vw, 28px)`,
                      fontWeight: 700,
                      color: '#0F172A',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: `clamp(4px, 0.5vh, 8px)`,
                      marginLeft: 0,
                      lineHeight: 1.2
                    }}
                  >
                    {header.title}
                  </h1>
                  <p
                    style={{
                      fontSize: `clamp(12px, 1.2vw, 14px)`,
                      color: '#64748B',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 0,
                      marginLeft: 0,
                      lineHeight: 1.4
                    }}
                  >
                    {header.subtitle}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: `clamp(8px, 1vw, 12px)`, flexWrap: 'wrap' }}>
                  {header.actionButtons.map((button: any, idx: number) => {
                    const ButtonIcon = iconMap[button.icon] || FileText;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleHeaderAction(button.label)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: `clamp(8px, 1vh, 10px) clamp(12px, 1.5vw, 20px)`,
                          borderRadius: 8,
                          border: button.variant === 'primary' ? 'none' : '1px solid #E2E8F0',
                          backgroundColor: button.variant === 'primary' ? '#2563EB' : '#FFFFFF',
                          color: button.variant === 'primary' ? '#FFFFFF' : '#64748B',
                          fontSize: `clamp(12px, 1.2vw, 14px)`,
                          fontWeight: 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flex: isMobile ? '1' : 'none',
                          justifyContent: 'center'
                        }}
                      >
                        <ButtonIcon style={{ width: 16, height: 16 }} />
                        {button.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: `clamp(12px, 1.5vh, 16px)`
              }}
            >
              {summaryCards.map((card: any) => {
                const CardIcon = iconMap[card.icon] || FileText;
                return (
                  <div
                    key={card.label}
                    style={{
                      ...cardStyle,
                      backgroundColor: card.bg,
                      border: `1px solid ${card.color}20`,
                      padding: `clamp(16px, 2vh, 20px)`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div
                        style={{
                          width: `clamp(36px, 4vw, 40px)`,
                          height: `clamp(36px, 4vw, 40px)`,
                          borderRadius: 10,
                          backgroundColor: card.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF'
                        }}
                      >
                        <CardIcon style={{ width: `clamp(18px, 2vw, 20px)`, height: `clamp(18px, 2vw, 20px)` }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 11,
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
                            fontSize: `clamp(20px, 2.5vw, 24px)`,
                            fontWeight: 700,
                            color: card.color
                          }}
                        >
                          {card.value}
                        </div>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: `clamp(11px, 1.1vw, 12px)`,
                        color: '#64748B',
                        marginTop: 0,
                        marginRight: 0,
                        marginBottom: 0,
                        marginLeft: 0
                      }}
                    >
                      {card.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Search and Filters */}
            <div style={cardStyle}>
              <div
                style={{
                  display: 'flex',
                  gap: `clamp(8px, 1vw, 12px)`,
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '1', minWidth: isMobile ? '100%' : 200 }}>
                  <Search
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 18,
                      height: 18,
                      color: '#9CA3AF',
                      pointerEvents: 'none'
                    }}
                  />
                  <input
                    type="text"
                    placeholder={searchAndFilters.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 40px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F9FAFB',
                      fontSize: 14,
                      color: '#111827',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                {searchAndFilters.filters.map((filter: any, idx: number) => (
                  <select
                    key={idx}
                    value={
                      filter.label === 'County' ? selectedCounty :
                      filter.label === 'Buy Decision' ? selectedBuyDecision :
                      filter.value // fallback
                    }
                    onChange={(e) => {
                      if (filter.label === 'County') setSelectedCounty(e.target.value);
                      else if (filter.label === 'Buy Decision') setSelectedBuyDecision(e.target.value);
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: 13,
                      color: '#0F172A',
                      cursor: 'pointer',
                      minWidth: isMobile ? '100%' : 120,
                      flex: isMobile ? '1 1 100%' : 'none',
                      appearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%2364748B\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '36px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option>{filter.label}: {filter.value}</option>
                    {filter.options && filter.options.filter((opt: string) => opt !== filter.value).map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ))}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCounty('All Counties');
                    setSelectedBuyDecision('All');
                  }}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    flex: isMobile ? '1 1 100%' : 'none',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  {searchAndFilters.clearButton}
                </button>
              </div>
            </div>

            {/* Grid Actions */}
            <div style={{ position: 'relative', display: 'flex', gap: `clamp(8px, 1vw, 12px)`, alignItems: 'center', flexWrap: 'wrap' }}>
              {gridActions.map((action: any, idx: number) => {
                const ActionIcon = action.icon ? iconMap[action.icon] : null;
                return (
                  <button
                    key={idx}
                    onClick={() => handleGridAction(action.label)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 20px',
                      borderRadius: 8,
                      border: action.variant === 'primary' ? 'none' : '1px solid #E2E8F0',
                      backgroundColor: action.variant === 'primary' ? '#10B981' : '#FFFFFF',
                      color: action.variant === 'primary' ? '#FFFFFF' : '#64748B',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      flex: isMobile ? '1 1 auto' : 'none',
                      justifyContent: 'center'
                    }}
                  >
                    {ActionIcon && <ActionIcon style={{ width: 16, height: 16 }} />}
                    {action.label}
                  </button>
                );
              })}

              {/* Column Selector Dropdown */}
              {showColumnSelector && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: 16,
                  zIndex: 50,
                  minWidth: 200
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 12, color: '#0F172A' }}>Visible Columns</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {dataGrid.headers.map((header: string) => (
                      <label key={header} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748B', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={visibleColumns.includes(header)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setVisibleColumns([...visibleColumns, header]);
                            } else {
                              if (visibleColumns.length > 1) {
                                setVisibleColumns(visibleColumns.filter(h => h !== header));
                              }
                            }
                          }}
                        />
                        {header}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Data Grid */}
            <div style={cardStyle}>
              <div style={{
                overflowX: isMobileOrTablet ? 'auto' : 'visible',
                minWidth: isMobileOrTablet ? '100%' : 'auto',
                WebkitOverflowScrolling: 'touch'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13,
                  minWidth: isMobileOrTablet ? '800px' : 'auto'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      {visibleColumns.map((header: string) => (
                        <th
                          key={header}
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: '#64748B'
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataGrid.rows.map((row: any) => (
                      <tr
                        key={row.id}
                        onClick={() => handleRowClick(row.id)}
                        style={{
                          borderBottom: '1px solid #E2E8F0',
                          cursor: 'pointer',
                          backgroundColor: selectedParcelId === row.id ? '#EFF6FF' : 'transparent',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedParcelId !== row.id) {
                            e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedParcelId !== row.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {visibleColumns.includes('File #') && (
                            <td style={{ padding: '14px 16px', color: '#0F172A', fontWeight: 500 }}>
                            {row.fileNumber}
                            </td>
                        )}
                        {visibleColumns.includes('Parcel ID') && (
                            <td style={{ padding: '14px 16px', color: '#0F172A' }}>
                            {row.parcelId}
                            </td>
                        )}
                        {visibleColumns.includes('Address') && (
                            <td style={{ padding: '14px 16px', color: '#0F172A' }}>
                            {row.situsAddress}
                            </td>
                        )}
                        {visibleColumns.includes('County') && (
                            <td style={{ padding: '14px 16px', color: '#64748B' }}>
                            {row.county}
                            </td>
                        )}
                        {visibleColumns.includes('Owner Name') && (
                            <td style={{ padding: '14px 16px', color: '#0F172A', fontWeight: 500 }}>
                                {isBulkEditMode ? (
                                    <input
                                        type="text"
                                        value={editedRows[row.id]?.ownerName ?? row.ownerName ?? ''}
                                        onChange={(e) => handleCellEdit(row.id, 'ownerName', e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ width: '100%', padding: '4px', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                                    />
                                ) : (
                                    row.ownerName
                                )}
                            </td>
                        )}
                        {visibleColumns.includes('Phone') && (
                            <td style={{ padding: '14px 16px', color: '#64748B' }}>
                                {isBulkEditMode ? (
                                    <input
                                        type="text"
                                        value={editedRows[row.id]?.ownerPhone ?? row.ownerPhone ?? ''}
                                        onChange={(e) => handleCellEdit(row.id, 'ownerPhone', e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ width: '100%', padding: '4px', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                                    />
                                ) : (
                                    row.ownerPhone
                                )}
                            </td>
                        )}
                        {visibleColumns.includes('Mailing Address') && (
                            <td style={{ padding: '14px 16px', color: '#64748B' }}>
                                {isBulkEditMode ? (
                                    <input
                                        type="text"
                                        value={editedRows[row.id]?.mailingAddress ?? row.mailingAddress ?? ''}
                                        onChange={(e) => handleCellEdit(row.id, 'mailingAddress', e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ width: '100%', padding: '4px', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                                    />
                                ) : (
                                    row.mailingAddress
                                )}
                            </td>
                        )}
                        {visibleColumns.includes('Status') && (
                            <td style={{ padding: '14px 16px', color: '#64748B' }}>
                                {isBulkEditMode ? (
                                    <select
                                        value={editedRows[row.id]?.status ?? row.status ?? 'New'}
                                        onChange={(e) => handleCellEdit(row.id, 'status', e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ width: '100%', padding: '4px', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                                    >
                                        <option value="New">New</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="On Hold">On Hold</option>
                                    </select>
                                ) : (
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '4px', 
                                        backgroundColor: row.status === 'Completed' ? '#F0FDF4' : row.status === 'In Progress' ? '#EFF6FF' : '#F1F5F9',
                                        color: row.status === 'Completed' ? '#166534' : row.status === 'In Progress' ? '#1E40AF' : '#64748B',
                                        fontSize: '12px',
                                        fontWeight: 500
                                    }}>
                                        {row.status || 'New'}
                                    </span>
                                )}
                            </td>
                        )}
                        {visibleColumns.includes('Notes') && (
                            <td style={{ padding: '14px 16px', color: '#64748B' }}>
                                {isBulkEditMode ? (
                                    <input
                                        type="text"
                                        value={editedRows[row.id]?.notes ?? row.notes ?? ''}
                                        onChange={(e) => handleCellEdit(row.id, 'notes', e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ width: '100%', padding: '4px', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                                    />
                                ) : (
                                    <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.notes}>
                                        {row.notes}
                                    </div>
                                )}
                            </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail View */}
            {selectedParcel && (
              <div style={cardStyle}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #E2E8F0', overflowX: 'auto' }}>
                  {detailView.tabs.map((tab: string) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 0,
                        border: 'none',
                        borderBottom: activeTab === tab ? '2px solid #2563EB' : '2px solid transparent',
                        backgroundColor: 'transparent',
                        color: activeTab === tab ? '#2563EB' : '#64748B',
                        fontSize: 14,
                        fontWeight: activeTab === tab ? 600 : 500,
                        cursor: 'pointer',
                        marginBottom: '-1px'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                {activeTab === 'Owner Contact' && (
                  <div>
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#0F172A',
                        marginTop: 0,
                        marginRight: 0,
                        marginBottom: 16,
                        marginLeft: 0
                      }}
                    >
                      {detailView.ownerContact.title}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>Owner Name</label>
                            <input
                                type="text"
                                value={editedRows[selectedParcel.id]?.ownerName ?? selectedParcel.ownerName ?? ''}
                                onChange={(e) => handleCellEdit(selectedParcel.id, 'ownerName', e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: 14, color: '#0F172A', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>Phone 1 (Primary)</label>
                            <input
                                type="tel"
                                value={editedRows[selectedParcel.id]?.ownerPhone ?? selectedParcel.ownerPhone ?? ''}
                                onChange={(e) => handleCellEdit(selectedParcel.id, 'ownerPhone', e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: 14, color: '#0F172A', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>Mailing Address</label>
                            <input
                                type="text"
                                value={editedRows[selectedParcel.id]?.mailingAddress ?? selectedParcel.mailingAddress ?? ''}
                                onChange={(e) => handleCellEdit(selectedParcel.id, 'mailingAddress', e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: 14, color: '#0F172A', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>Email</label>
                            <input
                                type="email"
                                value={editedRows[selectedParcel.id]?.ownerEmail ?? selectedParcel.ownerEmail ?? ''}
                                onChange={(e) => handleCellEdit(selectedParcel.id, 'ownerEmail', e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: 14, color: '#0F172A', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ marginTop: 8 }}>
                           <button 
                               onClick={() => handleGridAction('Save Changes')}
                               style={{
                                   padding: '8px 16px',
                                   backgroundColor: '#2563EB',
                                   color: 'white',
                                   border: 'none',
                                   borderRadius: 6,
                                   fontSize: 13,
                                   fontWeight: 500,
                                   cursor: 'pointer',
                                   display: Object.keys(editedRows).length > 0 ? 'inline-block' : 'none'
                               }}
                           >
                               Save Changes
                           </button>
                        </div>
                    </div>
                  </div>
                )}
                {activeTab === 'Activity Log' && (
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>Activity History</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {selectedParcel.interactions && selectedParcel.interactions.length > 0 ? (
                            selectedParcel.interactions.map((interaction: any, idx: number) => (
                                <div key={idx} style={{ padding: 12, border: '1px solid #E2E8F0', borderRadius: 8, backgroundColor: '#F8FAFC' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontWeight: 600, fontSize: 13, color: '#0F172A' }}>{interaction.type}</span>
                                        <span style={{ fontSize: 12, color: '#64748B' }}>{interaction.date}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>{interaction.notes}</p>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', color: '#64748B', padding: 20 }}>No activity recorded</div>
                        )}
                    </div>
                  </div>
                )}
                {activeTab === 'Documents' && (
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>Documents</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {selectedParcel.documents && selectedParcel.documents.length > 0 ? (
                            selectedParcel.documents.map((doc: any, idx: number) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid #E2E8F0', borderRadius: 8 }}>
                                    <FileText size={18} color="#64748B" />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{doc.name}</div>
                                        <div style={{ fontSize: 11, color: '#64748B' }}>{doc.date}</div>
                                    </div>
                                    <button style={{ border: 'none', background: 'none', color: '#2563EB', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                                        View
                                    </button>
                                </div>
                            ))
                        ) : (
                             <div style={{ textAlign: 'center', color: '#64748B', padding: 20 }}>No documents found</div>
                        )}
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            style={{ marginTop: 8, padding: '8px 12px', border: '1px dashed #CBD5E1', borderRadius: 8, backgroundColor: '#F8FAFC', color: '#64748B', fontSize: 13, cursor: 'pointer', width: '100%' }}
                        >
                            + Upload Document
                        </button>
                    </div>
                  </div>
                )}
                {activeTab === 'Notes' && (
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>Research Notes</h3>
                    <textarea
                        value={editedRows[selectedParcel.id]?.notes ?? selectedParcel.notes ?? ''}
                        onChange={(e) => handleCellEdit(selectedParcel.id, 'notes', e.target.value)}
                        placeholder="Add research notes..."
                        style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }}
                    />
                    <div style={{ marginTop: 12 }}>
                        <button 
                           onClick={() => handleGridAction('Save Changes')}
                           style={{
                               padding: '8px 16px',
                               backgroundColor: '#2563EB',
                               color: 'white',
                               border: 'none',
                               borderRadius: 6,
                               fontSize: 13,
                               fontWeight: 500,
                               cursor: 'pointer',
                               display: Object.keys(editedRows).length > 0 ? 'inline-block' : 'none'
                           }}
                       >
                           Save Notes
                       </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Quick Contact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', minWidth: 0 }}>
            <div style={cardStyle}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20
                }}
              >
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 0,
                    marginLeft: 0
                  }}
                >
                  {quickContact.title}
                </h2>
                <button
                  style={{
                    width: 32,
                    height: 32,
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
                  <X style={{ width: 16, height: 16, color: '#64748B' }} />
                </button>
              </div>

              {/* Selected Parcel */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#64748B',
                    marginBottom: 12
                  }}
                >
                  SELECTED PARCEL
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#64748B',
                        marginBottom: 4
                      }}
                    >
                      Parcel ID
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#0F172A'
                      }}
                    >
                      {selectedParcel.parcelId}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#64748B',
                        marginBottom: 4
                      }}
                    >
                      Address
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#0F172A'
                      }}
                    >
                      {selectedParcel.situsAddress}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#64748B',
                        marginBottom: 4
                      }}
                    >
                      OWNER
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#0F172A'
                      }}
                    >
                      {selectedParcel.ownerName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
                  gap: 12,
                  marginBottom: 24
                }}
              >
                {quickContact.contactButtons.map((button: any, idx: number) => {
                  const ButtonIcon = iconMap[button.icon] || Phone;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleContactAction(button.label)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        padding: '16px',
                        borderRadius: 12,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer'
                      }}
                    >
                      <div
                        style={{
                          width: `clamp(40px, 5vw, 48px)`,
                          height: `clamp(40px, 5vw, 48px)`,
                          borderRadius: 12,
                          backgroundColor: `${button.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <ButtonIcon style={{ width: `clamp(20px, 2.5vw, 24px)`, height: `clamp(20px, 2.5vw, 24px)`, color: button.color }} />
                      </div>
                      <span
                        style={{
                          fontSize: `clamp(11px, 1.2vw, 12px)`,
                          fontWeight: 500,
                          color: '#0F172A'
                        }}
                      >
                        {button.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Contact History */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#64748B',
                    marginBottom: 12
                  }}
                >
                  CONTACT HISTORY
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#0F172A'
                    }}
                  >
                    Last contact: {selectedParcel?.contactHistory?.lastContact || quickContact.contactHistory.lastContact}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#64748B'
                    }}
                  >
                    {selectedParcel?.contactHistory?.summary || quickContact.contactHistory.summary}
                  </div>
                </div>
              </div>

              {/* Log Interaction */}
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#64748B',
                    marginBottom: 12
                  }}
                >
                  {quickContact.logInteraction.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#64748B',
                        marginBottom: 6
                      }}
                    >
                      {quickContact.logInteraction.typeLabel}
                    </label>
                    <select
                      value={interactionType}
                      onChange={(e) => setInteractionType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        fontSize: 13,
                        color: '#0F172A',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%2364748B\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        paddingRight: '36px',
                        boxSizing: 'border-box'
                      }}
                    >
                      {quickContact.logInteraction.typeOptions.map((option: string) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#64748B',
                        marginBottom: 6
                      }}
                    >
                      {quickContact.logInteraction.notesLabel}
                    </label>
                    <textarea
                      rows={4}
                      value={interactionNotes}
                      onChange={(e) => setInteractionNotes(e.target.value)}
                      placeholder={quickContact.logInteraction.notesLabel}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        fontSize: 14,
                        color: '#0F172A',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                        minHeight: '80px',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <button
                    onClick={handleLogInteraction}
                    disabled={isLoggingInteraction}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: isLoggingInteraction ? '#94A3B8' : '#2563EB',
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: isLoggingInteraction ? 'not-allowed' : 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    {isLoggingInteraction ? 'Logging...' : (
                      <>
                        <MessageSquare style={{ width: 16, height: 16 }} />
                        {quickContact.logInteraction.buttonLabel}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

