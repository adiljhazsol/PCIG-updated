import { CSSProperties, useState, useEffect, useRef } from 'react';
import {
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  Search,
  User,
  Filter,
  Download,
  Plus,
  Edit,
  Upload,
  X
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  Search,
  User,
  Filter,
  Download,
  Plus,
  Edit,
  Upload,
  X
};

export default function PropertyTaxAppeal() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [activeView, setActiveView] = useState<string>('table');

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [countyFilter, setCountyFilter] = useState('All Counties');
  const [yearFilter, setYearFilter] = useState('All Years');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // New State for Details and Editing
  const [selectedAppealDetails, setSelectedAppealDetails] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [detailForm, setDetailForm] = useState<any>({
      status: 'draft',
      filed_date: '',
      current_assessment: '',
      proposed_assessment: '',
      outcome: '',
      savings: '',
      notes: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedAppealDetails) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', 'tax_appeal');

    try {
        await api.post(`/admin/tax-appeals/${selectedAppealDetails.id}/documents`, formData);
        // Refresh details to show new document
        fetchAppealDetails(selectedAppealDetails.id);
        alert('Document uploaded successfully');
    } catch (error) {
        console.error('Error uploading document:', error);
        alert('Failed to upload document');
    }
  };

  const [newNote, setNewNote] = useState('');

  const handleAddNote = async () => {
      if (!newNote.trim() || !selectedAppealDetails) return;
      
      try {
          // Assuming we update the appeal notes field or add to a log
          // For now, let's append to the notes field if it's simple string, or use a dedicated endpoint
          // Since the backend only has 'notes' field, we'll append with timestamp
          const timestamp = new Date().toISOString().split('T')[0];
          const updatedNotes = (detailForm.notes ? detailForm.notes + '\n\n' : '') + `[${timestamp}] ${newNote}`;
          
          await api.put(`/admin/tax-appeals/${selectedAppealDetails.id}`, {
              ...detailForm,
              notes: updatedNotes
          });
          
          setNewNote('');
          fetchAppealDetails(selectedAppealDetails.id);
      } catch (err) {
          console.error('Error adding note:', err);
          alert('Failed to add note');
      }
  };
  
  // New State for Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
      property_id: '',
      filed_date: new Date().toISOString().split('T')[0],
      current_assessment: '',
      proposed_assessment: '',
      notes: ''
  });
  const [propertiesList, setPropertiesList] = useState<any[]>([]); // For dropdown in create modal

  // Fetch full details when selectedPropertyId changes
  useEffect(() => {
      if (!selectedPropertyId || !data?.propertiesTable?.rows) return;
      
      const row = data.propertiesTable.rows.find((r: any) => r.id === selectedPropertyId);
      if (row && row.appealId) {
          fetchAppealDetails(row.appealId);
      }
  }, [selectedPropertyId, data]);

  const fetchAppealDetails = async (appealId: number) => {
      try {
          setDetailLoading(true);
          const response = await api.get(`/admin/tax-appeals/${appealId}`);
          if (response.data.success) {
              setSelectedAppealDetails(response.data.data);
              setDetailForm({
                  status: response.data.data.status,
                  filed_date: response.data.data.filed_date ? response.data.data.filed_date.split('T')[0] : '',
                  current_assessment: response.data.data.current_assessment,
                  proposed_assessment: response.data.data.proposed_assessment,
                  outcome: response.data.data.outcome || '',
                  savings: response.data.data.savings || '',
                  notes: response.data.data.notes || ''
              });
          }
      } catch (err) {
          console.error('Error fetching appeal details:', err);
      } finally {
          setDetailLoading(false);
      }
  };

  const handleUpdateAppeal = async () => {
      if (!selectedAppealDetails) return;
      try {
          await api.put(`/admin/tax-appeals/${selectedAppealDetails.id}`, detailForm);
          setIsEditingDetail(false);
          // Refresh main data to update list
          fetchDashboardData(); 
          // Refresh details
          fetchAppealDetails(selectedAppealDetails.id);
      } catch (err) {
          console.error('Error updating appeal:', err);
          alert('Failed to update appeal');
      }
  };

  const handleCreateAppeal = async () => {
      try {
          await api.post('/admin/tax-appeals', createForm);
          setIsCreateModalOpen(false);
          setCreateForm({
            property_id: '',
            filed_date: new Date().toISOString().split('T')[0],
            current_assessment: '',
            proposed_assessment: '',
            notes: ''
          });
          fetchDashboardData();
      } catch (err) {
          console.error('Error creating appeal:', err);
          alert('Failed to create appeal');
      }
  };

  const handleGeneratePackage = async () => {
      if (!selectedAppealDetails) return;
      try {
          const response = await api.get(`/admin/tax-appeals/${selectedAppealDetails.id}/package`, {
              responseType: 'blob'
          });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `tax-appeal-package-${selectedAppealDetails.id}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
      } catch (err) {
          console.error('Error generating package:', err);
          alert('Failed to generate package');
      }
  };

  const parseNotes = (notesStr: string) => {
    if (!notesStr) return [];
    return notesStr.split('\n\n').map((entry, index) => {
        const match = entry.match(/^\[(.*?)\] (.*)/s);
        if (match) {
            return {
                id: index,
                date: match[1],
                author: 'Admin',
                text: match[2]
            };
        }
        return {
            id: index,
            date: 'Unknown',
            author: 'Admin',
            text: entry
        };
    }).filter(n => n.text.trim() !== '').reverse();
  };


  const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (statusFilter !== 'All Statuses') params.append('status', statusFilter);
        if (countyFilter !== 'All Counties') params.append('county', countyFilter);
        if (yearFilter !== 'All Years') params.append('year', yearFilter);

        const response = await api.get(`/admin/tax-appeals/dashboard-data?${params.toString()}`);
        if (response.data && response.data.propertyTaxAppeal) {
          const appealData = response.data.propertyTaxAppeal;
          setData(appealData);
          
          // Initialize state from fetched data
          if (appealData.propertiesTable && appealData.propertiesTable.rows) {
             const initialSelected = appealData.propertiesTable.rows
                .filter((r: any) => r.selected)
                .map((r: any) => r.id);
             setSelectedProperties(new Set(initialSelected));
             
             if (appealData.propertiesTable.rows.length > 0 && !selectedPropertyId) {
                 setSelectedPropertyId(appealData.propertiesTable.rows[0].id);
             }
          }
          
          if (appealData.viewControls && appealData.viewControls.views) {
              const active = appealData.viewControls.views.find((v: any) => v.active)?.id || 'table';
              setActiveView(active);
          }

        } else {
          setError('Failed to load tax appeal data');
        }
      } catch (err) {
        console.error('Error fetching tax appeal data:', err);
        setError('An error occurred while loading data');
      } finally {
        setLoading(false);
      }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'Status') setStatusFilter(value);
    else if (filterType === 'County') setCountyFilter(value);
    else if (filterType === 'Year') setYearFilter(value);
  };

  // Debounce search
  useEffect(() => {
      const handler = setTimeout(() => {
          fetchDashboardData();
      }, 500);
      return () => clearTimeout(handler);
  }, [searchQuery]);

  // Trigger fetch when filters change
  useEffect(() => {
      fetchDashboardData();
  }, [statusFilter, countyFilter, yearFilter]);

  // Initial fetch is covered by the above useEffects (searchQuery starts empty, filters start with default)
  // But we need to be careful not to double fetch on mount.
  // Actually, useEffect on mount [] is present in line 174 (original file). I should remove it or merge.
  // The original file had:
  // useEffect(() => {
  //   fetchDashboardData();
  // }, []);
  //
  // If I have useEffects for dependencies, they will run on mount too.
  // So I can remove the [] useEffect.

  // Fetch properties for the dropdown

  // Fetch properties for the dropdown
  useEffect(() => {
      if (isCreateModalOpen) {
          api.get('/admin/properties').then(res => {
              setPropertiesList(res.data.data || []);
          });
      }
  }, [isCreateModalOpen]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            Loading...
        </div>
    );
  }

  if (error || !data) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>
            {error || 'No data available'}
        </div>
    );
  }

  // Extract data from JSON
  const appealData = data || {};
  const header = appealData?.header || { title: '', subtitle: '', backLink: { path: '#', label: '' } };
  const backLink = header.backLink || { path: '#', label: '' }; // Fallback if backLink is missing
  const summaryCards = appealData?.summaryCards || [];
  const alertBanner = appealData?.alertBanner || {};
  const searchAndFilters = appealData?.searchAndFilters || {};
  const viewControls = appealData?.viewControls || { actions: [], views: [] };
  const propertiesTable = appealData?.propertiesTable || { rows: [] };
  
  const rawDetailPanel = appealData?.detailPanel || {};
   const detailPanel = {
     appealInformation: rawDetailPanel.appealInformation || { title: 'Appeal Information', fields: [], editIcon: 'Edit' },
     valuationAnalysis: rawDetailPanel.valuationAnalysis || { 
       title: 'Valuation Analysis', 
       historicalData: [], 
       fields: [],
       savingsBanner: { bg: '#F0FDF4', color: '#166534', text: 'Potential Savings: $0.00' } 
     },
     evidenceDocs: rawDetailPanel.evidenceDocs || { 
       title: 'Evidence & Documents', 
       documents: [], 
       uploadButton: 'Upload' 
     },
     notesLog: rawDetailPanel.notesLog || { 
       title: 'Notes Log', 
       notes: [], 
       addNotePlaceholder: 'Add a note...', 
       addNoteButton: 'Add Note' 
     },
     actions: rawDetailPanel.actions || { 
       saveChanges: 'Save Changes', 
       generatePackage: 'Generate Package' 
     }
   };

  const handleCheckboxChange = (propertyId: string) => {
    setSelectedProperties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProperties(new Set(propertiesTable.rows?.map((r: any) => r.id) || []));
    } else {
      setSelectedProperties(new Set());
    }
  };

  const selectedProperty = propertiesTable.rows?.find((r: any) => r.id === selectedPropertyId) || propertiesTable.rows?.[0] || {};

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

  const ExportIcon = iconMap[viewControls.actions?.[0]?.icon] || Download;
  const CreateAppealIcon = iconMap[viewControls.actions?.[1]?.icon] || Plus;
  const EditIcon = iconMap[detailPanel.appealInformation?.editIcon] || Edit;
  const UploadIcon = iconMap[detailPanel.evidenceDocs?.uploadButton?.split(' ')[1]] || Upload;

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
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '1fr 420px',
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
              <a
                href={backLink.path}
                style={{
                  fontSize: isMobile ? 12 : 13,
                  color: '#2563EB',
                  textDecoration: 'none',
                  marginBottom: 8,
                  display: 'inline-block',
                  wordBreak: 'break-word'
                }}
              >
                {backLink.label}
              </a>
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
                const CardIcon = iconMap[card.icon] || FileText;
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
                            color: card.color
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

            {/* Alert Banner */}
            <div
              style={{
                padding: isMobile ? '12px 16px' : '14px 20px',
                borderRadius: 10,
                backgroundColor: alertBanner.bg,
                border: `1px solid ${alertBanner.color}20`,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? 12 : 0,
                width: '100%',
                minWidth: 0
              }}
            >
              <span
                style={{
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  color: alertBanner.color,
                  flex: 1,
                  minWidth: 0,
                  wordBreak: 'break-word'
                }}
              >
                {alertBanner.message}
              </span>
              <button
                style={{
                  padding: isMobile ? '6px 14px' : '6px 16px',
                  borderRadius: 8,
                  border: `1px solid ${alertBanner.color}`,
                  backgroundColor: alertBanner.color,
                  color: '#FFFFFF',
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  width: isMobile ? '100%' : 'auto',
                  boxSizing: 'border-box'
                }}
              >
                {alertBanner.button}
              </button>
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
                  value={searchQuery}
                  onChange={handleSearchChange}
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
                const getFilterValue = (label: string) => {
                    if (label === 'Status') return statusFilter;
                    if (label === 'County') return countyFilter;
                    if (label === 'Year') return yearFilter;
                    return filter.value;
                };
                
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
                      value={getFilterValue(filter.label)}
                      onChange={(e) => handleFilterChange(filter.label, e.target.value)}
                    >
                      <option value={`All ${filter.label === 'Status' ? 'Statuses' : filter.label === 'County' ? 'Counties' : 'Years'}`}>All {filter.label === 'Status' ? 'Statuses' : filter.label === 'County' ? 'Counties' : 'Years'}</option>
                      {filter.options && filter.options.filter((opt: string) => opt !== `All ${filter.label === 'Status' ? 'Statuses' : filter.label === 'County' ? 'Counties' : 'Years'}`).map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            {/* View Controls */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? 12 : 0
              }}
            >
              <div style={{ display: 'flex', gap: 0, width: isMobile ? '100%' : 'auto', overflowX: isMobileOrTablet ? 'auto' : 'visible' }}>
                {viewControls.views.map((view: any) => (
                  <button
                    key={view.id}
                    onClick={() => setActiveView(view.id)}
                    style={{
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      border: 'none',
                      borderBottom: activeView === view.id ? '2px solid #2563EB' : '2px solid transparent',
                      backgroundColor: 'transparent',
                      color: activeView === view.id ? '#2563EB' : '#64748B',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: activeView === view.id ? 600 : 500,
                      cursor: 'pointer',
                      marginBottom: -2,
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    {view.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: isMobile ? 8 : 12, width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
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
                  <ExportIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap' }}>{viewControls.actions?.[0]?.label || 'Export'}</span>
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
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
                  <CreateAppealIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap' }}>{viewControls.actions?.[1]?.label || 'Create Appeal'}</span>
                </button>
              </div>
            </div>

            {/* Properties Table */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 12 : 13, minWidth: isMobileOrTablet ? 900 : 'auto' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: isMobile ? '10px 12px' : '12px 16px', textAlign: 'left', width: isMobile ? 32 : 40 }}>
                        <input
                          type="checkbox"
                          checked={selectedProperties.size === propertiesTable.rows.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          style={{
                            width: isMobile ? 16 : 18,
                            height: isMobile ? 16 : 18,
                            cursor: 'pointer'
                          }}
                        />
                      </th>
                      {propertiesTable.headers.slice(1).map((header: string) => (
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
                    {propertiesTable.rows.map((row: any) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedPropertyId(row.id)}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          cursor: 'pointer',
                          backgroundColor: selectedPropertyId === row.id ? '#F8FAFC' : 'transparent',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                          <input
                            type="checkbox"
                            checked={selectedProperties.has(row.id)}
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
                              {row.address}
                            </div>
                            <div
                              style={{
                                fontSize: isMobile ? 11 : 12,
                                color: '#64748B',
                                wordBreak: 'break-word'
                              }}
                            >
                              {row.city}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', fontSize: isMobile ? 12 : 13, whiteSpace: 'nowrap' }}>
                          {row.parcelId}
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: 999,
                              fontSize: isMobile ? 10 : 11,
                              fontWeight: 500,
                              backgroundColor: row.typeBg,
                              color: row.typeColor,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {row.type}
                          </span>
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
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#0F172A', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {row.currentValue}
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#0F172A', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {row.appealValue}
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: row.potentialReductionColor, fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {row.potentialReduction}
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', fontSize: isMobile ? 12 : 13, whiteSpace: 'nowrap' }}>
                          {row.deadline}
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
            {/* Property Header */}
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
                      marginBottom: 4,
                      wordBreak: 'break-word'
                    }}
                  >
                    {selectedProperty.address}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      color: '#64748B',
                      marginBottom: 12,
                      wordBreak: 'break-word'
                    }}
                  >
                    {selectedProperty.parcelId}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: isMobile ? 10 : 11,
                        fontWeight: 500,
                        backgroundColor: selectedProperty.statusBg,
                        color: selectedProperty.statusColor,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {selectedProperty.status}
                    </span>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: isMobile ? 10 : 11,
                        fontWeight: 500,
                        backgroundColor: selectedProperty.typeBg,
                        color: selectedProperty.typeColor,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {selectedProperty.type}
                    </span>
                  </div>
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

            {/* Appeal Information */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: isMobile ? 12 : 16
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
                  {detailPanel.appealInformation.title}
                </h3>
                {!isEditingDetail && (
                    <EditIcon 
                        onClick={() => setIsEditingDetail(true)}
                        style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, color: '#64748B', cursor: 'pointer', flexShrink: 0 }} 
                    />
                )}
              </div>
              
              {detailLoading ? (
                  <div>Loading details...</div>
              ) : isEditingDetail ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 14 }}>
                      <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>Filed Date</label>
                          <input 
                            type="date"
                            value={detailForm.filed_date}
                            onChange={e => setDetailForm({...detailForm, filed_date: e.target.value})}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', backgroundColor: '#F9FAFB' }}
                          />
                      </div>
                      <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>Current Assessment</label>
                          <input 
                            type="number"
                            value={detailForm.current_assessment}
                            onChange={e => setDetailForm({...detailForm, current_assessment: e.target.value})}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', backgroundColor: '#F9FAFB' }}
                          />
                      </div>
                      <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>Proposed Assessment</label>
                          <input 
                            type="number"
                            value={detailForm.proposed_assessment}
                            onChange={e => setDetailForm({...detailForm, proposed_assessment: e.target.value})}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', backgroundColor: '#F9FAFB' }}
                          />
                      </div>
                      <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>Status</label>
                          <select 
                            value={detailForm.status}
                            onChange={e => setDetailForm({...detailForm, status: e.target.value})}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', backgroundColor: '#F9FAFB' }}
                          >
                            <option value="draft">Draft</option>
                            <option value="filed">Filed</option>
                            <option value="in_review">In Review</option>
                            <option value="hearing_scheduled">Hearing Scheduled</option>
                            <option value="won">Won</option>
                            <option value="lost">Lost</option>
                            <option value="settled">Settled</option>
                          </select>
                      </div>
                      <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>Outcome</label>
                          <input 
                            type="text"
                            value={detailForm.outcome}
                            onChange={e => setDetailForm({...detailForm, outcome: e.target.value})}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', backgroundColor: '#F9FAFB' }}
                          />
                      </div>
                      <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>Savings</label>
                          <input 
                            type="number"
                            value={detailForm.savings}
                            onChange={e => setDetailForm({...detailForm, savings: e.target.value})}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', backgroundColor: '#F9FAFB' }}
                          />
                      </div>
                       <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>Notes</label>
                          <textarea 
                            value={detailForm.notes}
                            onChange={e => setDetailForm({...detailForm, notes: e.target.value})}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', backgroundColor: '#F9FAFB', minHeight: 60 }}
                          />
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button onClick={() => setIsEditingDetail(false)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #E2E8F0', backgroundColor: 'white', cursor: 'pointer' }}>Cancel</button>
                          <button onClick={handleUpdateAppeal} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', backgroundColor: '#2563EB', color: 'white', cursor: 'pointer' }}>Save</button>
                      </div>
                  </div>
              ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 14 }}>
                    {selectedAppealDetails ? (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#64748B', marginBottom: 2 }}>Filed Date</label>
                                <div style={{ fontSize: 13, color: '#0F172A' }}>{selectedAppealDetails.filed_date}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#64748B', marginBottom: 2 }}>Current Assessment</label>
                                <div style={{ fontSize: 13, color: '#0F172A' }}>${selectedAppealDetails.current_assessment}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#64748B', marginBottom: 2 }}>Proposed Assessment</label>
                                <div style={{ fontSize: 13, color: '#0F172A' }}>${selectedAppealDetails.proposed_assessment}</div>
                            </div>
                             <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#64748B', marginBottom: 2 }}>Notes</label>
                                <div style={{ fontSize: 13, color: '#0F172A' }}>{selectedAppealDetails.notes || '-'}</div>
                            </div>
                        </>
                    ) : (
                        detailPanel.appealInformation.fields.map((field: any, idx: number) => (
                          <div key={idx} style={{ width: '100%', minWidth: 0 }}>
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
                              {field.label}
                            </label>
                            <div
                              style={{
                                width: '100%',
                                padding: isMobile ? '8px 10px' : '8px 12px',
                                borderRadius: 8,
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#F9FAFB',
                                fontSize: isMobile ? 12 : 13,
                                color: '#0F172A',
                                boxSizing: 'border-box'
                              }}
                            >
                                {field.value}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
              )}
            </div>

            {/* Valuation Analysis */}
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
                {detailPanel.valuationAnalysis.title}
              </h3>
              <div style={{ marginBottom: isMobile ? 12 : 16, width: '100%', minWidth: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 11 : 12, marginBottom: isMobile ? 12 : 16, minWidth: isMobile ? 250 : 'auto' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: isMobile ? '6px 10px' : '8px 12px', textAlign: 'left', fontSize: isMobile ? 9 : 10, fontWeight: 600, textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>
                        Year
                      </th>
                      <th style={{ padding: isMobile ? '6px 10px' : '8px 12px', textAlign: 'left', fontSize: isMobile ? 9 : 10, fontWeight: 600, textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>
                        Value
                      </th>
                      <th style={{ padding: isMobile ? '6px 10px' : '8px 12px', textAlign: 'left', fontSize: isMobile ? 9 : 10, fontWeight: 600, textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailPanel.valuationAnalysis.historicalData.map((data: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: idx === detailPanel.valuationAnalysis.historicalData.length - 1 ? 'none' : '1px solid #F1F5F9' }}>
                        <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', color: '#0F172A', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {data.year}
                        </td>
                        <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', color: '#0F172A', whiteSpace: 'nowrap' }}>{data.value}</td>
                        <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', color: '#64748B', whiteSpace: 'nowrap' }}>{data.change}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 14, marginBottom: isMobile ? 12 : 16 }}>
                {detailPanel.valuationAnalysis.fields.map((field: any, idx: number) => (
                  <div key={idx} style={{ width: '100%', minWidth: 0 }}>
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
                      {field.label}
                    </label>
                    <input
                      type="text"
                      defaultValue={field.value}
                      style={{
                        width: '100%',
                        padding: isMobile ? '8px 10px' : '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#F9FAFB',
                        fontSize: isMobile ? 12 : 13,
                        color: '#0F172A',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                ))}
              </div>
              <div
                style={{
                  padding: isMobile ? '10px 14px' : '12px 16px',
                  borderRadius: 8,
                  backgroundColor: detailPanel.valuationAnalysis.savingsBanner.bg,
                  border: `1px solid ${detailPanel.valuationAnalysis.savingsBanner.color}20`,
                  width: '100%',
                  minWidth: 0
                }}
              >
                <span
                  style={{
                    fontSize: isMobile ? 12 : 13,
                    fontWeight: 500,
                    color: detailPanel.valuationAnalysis.savingsBanner.color,
                    wordBreak: 'break-word'
                  }}
                >
                  {detailPanel.valuationAnalysis.savingsBanner.text}
                </span>
              </div>
            </div>

            {/* Evidence & Docs */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  marginBottom: isMobile ? 12 : 16,
                  gap: isMobile ? 12 : 0
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
                  {detailPanel.evidenceDocs.title}
                </h3>
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: isMobile ? '6px 10px' : '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: isMobile ? 11 : 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: isMobile ? 'center' : 'flex-start',
                    boxSizing: 'border-box',
                    flexShrink: 0
                  }}
                >
                  <UploadIcon style={{ width: isMobile ? 12 : 14, height: isMobile ? 12 : 14, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap' }}>{detailPanel.evidenceDocs.uploadButton}</span>
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12 }}>
                {(selectedAppealDetails?.documents?.map((doc: any) => ({
                    id: doc.id,
                    name: doc.name,
                    date: new Date(doc.created_at).toLocaleDateString(),
                    size: doc.size || 'Unknown',
                    status: 'Uploaded',
                    statusBg: '#D1FAE5',
                    statusColor: '#059669'
                })) || detailPanel.evidenceDocs.documents).map((doc: any) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: isMobile ? '10px' : '12px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F9FAFB',
                      width: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 6,
                        gap: 8
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: isMobile ? 12 : 13,
                            fontWeight: 500,
                            color: '#0F172A',
                            marginBottom: 4,
                            wordBreak: 'break-word'
                          }}
                        >
                          {doc.name}
                        </div>
                        <div
                          style={{
                            fontSize: isMobile ? 10 : 11,
                            color: '#64748B',
                            wordBreak: 'break-word'
                          }}
                        >
                          {doc.date} {doc.size && `• ${doc.size}`}
                        </div>
                      </div>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: 999,
                          fontSize: isMobile ? 9 : 10,
                          fontWeight: 500,
                          backgroundColor: doc.statusBg,
                          color: doc.statusColor,
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                      >
                        {doc.status === 'Uploaded' ? '✓ ' : ''}{doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes & Evidence Log */}
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
                {detailPanel.notesLog.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16, marginBottom: isMobile ? 12 : 16 }}>
                {(selectedAppealDetails?.notes ? parseNotes(selectedAppealDetails.notes) : detailPanel.notesLog.notes).map((note: any) => (
                  <div key={note.id} style={{ width: '100%', minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: isMobile ? 10 : 11,
                        fontWeight: 500,
                        color: '#64748B',
                        marginBottom: 6,
                        wordBreak: 'break-word'
                      }}
                    >
                      {note.date} • {note.author}
                    </div>
                    <p
                      style={{
                        fontSize: isMobile ? 12 : 13,
                        color: '#1E293B',
                        marginTop: 0,
                        marginRight: 0,
                        marginBottom: 0,
                        marginLeft: 0,
                        lineHeight: 1.5,
                        wordBreak: 'break-word'
                      }}
                    >
                      {note.text}
                    </p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 8, width: '100%' }}>
                <input
                  type="text"
                  placeholder={detailPanel.notesLog.addNotePlaceholder}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          handleAddNote();
                      }
                  }}
                  style={{
                    flex: 1,
                    padding: isMobile ? '8px 10px' : '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F9FAFB',
                    fontSize: isMobile ? 12 : 13,
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    minWidth: 0
                  }}
                />
                <button
                  onClick={handleAddNote}
                  style={{
                    padding: isMobile ? '8px 14px' : '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: isMobile ? 12 : 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    width: isMobile ? '100%' : 'auto',
                    boxSizing: 'border-box'
                  }}
                >
                  {detailPanel.notesLog.addNoteButton}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12, width: '100%' }}>
              <button
                onClick={handleUpdateAppeal}
                style={{
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#1E293B',
                  color: '#FFFFFF',
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {detailPanel.actions.saveChanges}
              </button>
              <button
                onClick={handleGeneratePackage}
                style={{
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  borderRadius: 8,
                  border: '1px solid #2563EB',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {detailPanel.actions.generatePackage}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Create Appeal Modal */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: 24, borderRadius: 12, width: '100%', maxWidth: 500,
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>File New Appeal</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Property</label>
                <select
                  value={createForm.property_id}
                  onChange={e => setCreateForm({...createForm, property_id: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0' }}
                >
                  <option value="">Select Property</option>
                  {propertiesList.map(p => (
                    <option key={p.id} value={p.id}>{p.address}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Filed Date</label>
                <input
                  type="date"
                  value={createForm.filed_date}
                  onChange={e => setCreateForm({...createForm, filed_date: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Current Value</label>
                  <input
                    type="number"
                    value={createForm.current_assessment}
                    onChange={e => setCreateForm({...createForm, current_assessment: e.target.value})}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Proposed Value</label>
                  <input
                    type="number"
                    value={createForm.proposed_assessment}
                    onChange={e => setCreateForm({...createForm, proposed_assessment: e.target.value})}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Notes</label>
                <textarea
                  value={createForm.notes}
                  onChange={e => setCreateForm({...createForm, notes: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0', minHeight: 80 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #E2E8F0', backgroundColor: 'white', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAppeal}
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', backgroundColor: '#2563EB', color: 'white', cursor: 'pointer' }}
                >
                  Create Appeal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

