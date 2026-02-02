import React, { CSSProperties, useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  Loader2
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Download,
  Upload,
  Plus,
  FileText
};

interface SurplusHeader {
  title: string;
  subtitle: string;
}

interface SurplusActionButton {
  label: string;
  icon: string;
  action: string;
}

interface SurplusActionButtons {
  bulkImport: SurplusActionButton;
  export: SurplusActionButton;
  addRecord: SurplusActionButton;
}

interface SurplusAlertBanner {
  message: string;
  type: string;
  buttonLabel: string;
}

interface SurplusSummaryCard {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  icon?: string;
  color?: string;
  valueColor?: string;
}

interface SurplusFilter {
  label: string;
  selected: string;
  options: string[];
}

interface SurplusContactHistory {
  date: string;
  status: string;
  description: string;
}

interface SurplusOutreach {
  documentName: string;
  status: string;
  url?: string;
}

interface SurplusDocument {
    id: number;
    name: string;
    url: string;
    date: string;
}

type SurplusDocuments = SurplusDocument[] | { message: string };

interface SurplusRecipientInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
}

interface SurplusRecord {
  id: string;
  propertyId: number;
  caseNumber: string;
  fcsFile: string;
  county: string;
  parcelId: string;
  originalOwner: string;
  amount: number;
  collected: string;
  surplusCollected: string;
  paid: string;
  unclaimed: string;
  surplusUnclaimed: string;
  unclaimedColor: string;
  saleDate: string;
  status: string;
  statusColor: string;
  statusBg: string;
  recipientName: string;
  dateIdentified: string;
  claimDeadline: string;
  documents: SurplusDocuments;
  notes: string;
  contactHistory: SurplusContactHistory[];
  outreach: SurplusOutreach;
  recipientInfo: SurplusRecipientInfo;
}

interface GenerateLettersButton {
  label: string;
  icon?: string;
  action?: string;
}

interface SurplusData {
  header: SurplusHeader;
  actionButtons: SurplusActionButtons;
  alertBanner: SurplusAlertBanner;
  summaryCards: SurplusSummaryCard[];
  searchPlaceholder: string;
  filters: SurplusFilter[];
  generateLettersButton: GenerateLettersButton;
  tableHeaders: string[];
  records: SurplusRecord[];
  selectedRecord: SurplusRecord | null;
}

export default function SurplusFundsResearch() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  const [data, setData] = useState<SurplusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  
  // Recipient Edit State
  const [isEditingRecipient, setIsEditingRecipient] = useState(false);
  const [recipientForm, setRecipientForm] = useState<SurplusRecipientInfo>({
    name: '', address: '', city: '', state: '', phone: ''
  });

  // Contact Log State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ type: 'call', notes: '', date: new Date().toISOString().split('T')[0] });

  // Add Record State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecordForm, setNewRecordForm] = useState({ property_id: '', amount: '', notes: '' });
  const [properties, setProperties] = useState<any[]>([]);

  const handleAddRecord = async () => {
    try {
        await api.post('/admin/workflow/surplus', newRecordForm);
        // Refresh data
        const response = await api.get('/admin/workflow/surplus');
        if (response.data && response.data.surplusFundsResearch) {
            setData(response.data.surplusFundsResearch);
        }
        setIsAddModalOpen(false);
        setNewRecordForm({ property_id: '', amount: '', notes: '' });
        alert('Record created successfully');
    } catch (error) {
        console.error('Error creating record:', error);
        alert('Failed to create record');
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/workflow/surplus/export', {
        responseType: 'blob',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `surplus-funds-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  const handleImportClick = () => {
    if (importInputRef.current) {
        importInputRef.current.value = '';
        importInputRef.current.click();
    }
  };

  const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const token = localStorage.getItem('token');
        await api.post('/admin/workflow/surplus/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                 ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        });
        // Refresh data
        const response = await api.get('/admin/workflow/surplus');
        if (response.data && response.data.surplusFundsResearch) {
            setData(response.data.surplusFundsResearch);
        }
        alert('Data imported successfully');
    } catch (error) {
        console.error('Error importing data:', error);
        alert('Failed to import data');
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedRecord) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', 'surplus');

    try {
        await api.post(`/admin/properties/${selectedRecord.propertyId}/documents`, formData);
        // Refresh data
        const response = await api.get('/admin/workflow/surplus');
        if (response.data && response.data.surplusFundsResearch) {
            setData(response.data.surplusFundsResearch);
        }
        alert('Document uploaded successfully');
    } catch (error) {
        console.error('Error uploading document:', error);
        alert('Failed to upload document');
    }
  };

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [countyFilter, setCountyFilter] = useState('All');
  const [amountFilter, setAmountFilter] = useState('All');
  const [dateRange, setDateRange] = useState<{start: string | null, end: string | null}>({ start: null, end: null });
  const [showDateInputs, setShowDateInputs] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const fetchData = async () => {
      try {
        // Only set loading on initial load to avoid flickering on search
        if (!data) setLoading(true);
        
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const params: any = {};
        if (searchQuery) params.search = searchQuery;
        if (statusFilter !== 'All') params.status = statusFilter;
        if (countyFilter !== 'All') params.county = countyFilter;
        if (amountFilter !== 'All') params.amount = amountFilter;
        if (dateRange.start) params.date_from = dateRange.start;
        if (dateRange.end) params.date_to = dateRange.end;

        const [surplusResponse, propertiesResponse] = await Promise.all([
            api.get('/admin/workflow/surplus', { headers, params }),
            api.get('/admin/properties/dropdown', { headers })
        ]);

        if (surplusResponse.data && surplusResponse.data.surplusFundsResearch) {
          const surplusData = surplusResponse.data.surplusFundsResearch;
          setData(surplusData);
          
          if (!selectedRecordId) {
             if (surplusData.selectedRecord) {
                 setSelectedRecordId(surplusData.selectedRecord.id);
             } else if (surplusData.records && surplusData.records.length > 0) {
                 setSelectedRecordId(surplusData.records[0].id);
             }
          }
        } else {
          setError('Failed to load surplus funds data');
        }

        if (propertiesResponse.data) {
            setProperties(propertiesResponse.data);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter, countyFilter, amountFilter, dateRange]);

  const handleGenerateLetters = async () => {
    if (!selectedRecordId) {
        alert('Please select a record first.');
        return;
    }
    
    try {
        await api.post('/admin/workflow/surplus/generate-letters', {
            ids: [selectedRecordId] 
        });
        alert('Claim letters generated successfully.');
    } catch (error) {
        console.error('Error generating letters:', error);
        alert('Failed to generate letters.');
    }
  };

  const selectedRecord = data?.records?.find((r: SurplusRecord) => r.id === selectedRecordId) || data?.records?.[0] || data?.selectedRecord || null;

  useEffect(() => {
    if (selectedRecord) {
        setRecipientForm(selectedRecord.recipientInfo);
    }
  }, [selectedRecordId, data]);

  const handleUpdateRecipient = async () => {
    if (!selectedRecord) return;
    try {
        await api.post(`/admin/workflow/surplus/${selectedRecord.id}/recipient`, recipientForm);
        // Refresh data
        const response = await api.get('/admin/workflow/surplus');
        if (response.data && response.data.surplusFundsResearch) {
            setData(response.data.surplusFundsResearch);
        }
        setIsEditingRecipient(false);
        alert('Recipient info updated successfully');
    } catch (error) {
        console.error('Error updating recipient:', error);
        alert('Failed to update recipient info');
    }
  };

  const handleSendLetter = async () => {
    if (!selectedRecord) return;
    try {
        await api.post('/admin/workflow/surplus/generate-letters', {
            ids: [selectedRecord.id]
        });
        // Refresh data
        const response = await api.get('/admin/workflow/surplus');
        if (response.data && response.data.surplusFundsResearch) {
            setData(response.data.surplusFundsResearch);
        }
        alert('Letter generated and sent successfully');
    } catch (error) {
        console.error('Error sending letter:', error);
        alert('Failed to send letter');
    }
  };

  const handleViewOutreach = () => {
    if (selectedRecord?.outreach?.url && selectedRecord.outreach.url !== '#') {
        // Open the URL directly
        window.open(selectedRecord.outreach.url, '_blank');
    } else {
        alert('No document available to view yet. Please send a letter first.');
    }
  };

  const handleLogContact = async () => {
    if (!selectedRecord) return;
    try {
        await api.post(`/admin/workflow/surplus/${selectedRecord.id}/contact`, {
            type: contactForm.type,
            notes: contactForm.notes,
            contact_date: contactForm.date
        });
        // Refresh data
        const response = await api.get('/admin/workflow/surplus');
        if (response.data && response.data.surplusFundsResearch) {
            setData(response.data.surplusFundsResearch);
        }
        setIsContactModalOpen(false);
        setContactForm({ type: 'call', notes: '', date: new Date().toISOString().split('T')[0] });
        alert('Contact logged successfully');
    } catch (error) {
        console.error('Error logging contact:', error);
        alert('Failed to log contact');
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

  if (loading) {
    return (
      <div style={pageWrapperStyle}>
        <AdminNav />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p style={{ color: '#64748B' }}>Loading surplus funds research data...</p>
        </div>
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
  const surplusData = data || {};
  const header = surplusData.header || { title: '', subtitle: '' };
  
  const rawActionButtons = surplusData.actionButtons || {};
  const actionButtons = {
    bulkImport: rawActionButtons.bulkImport || { label: '', icon: '', action: '' },
    export: rawActionButtons.export || { label: '', icon: '', action: '' },
    addRecord: rawActionButtons.addRecord || { label: '', icon: '', action: '' }
  };
  
  const alertBanner = surplusData.alertBanner || { message: '', type: '', buttonLabel: '' };
  
  const rawSummaryCards = Array.isArray(surplusData.summaryCards) ? surplusData.summaryCards : [];
  const summaryCards = rawSummaryCards.map((card: any) => ({
    label: card?.label || '',
    value: card?.value || 0,
    subtext: card?.subtext || '',
    trend: card?.trend || '',
    icon: card?.icon || '',
    color: card?.color || '',
    valueColor: card?.valueColor || ''
  }));

  const searchPlaceholder = surplusData.searchPlaceholder || '';
  
  const rawFilters = Array.isArray(surplusData.filters) ? surplusData.filters : [];
  const filters = rawFilters.map((filter: any) => ({
    label: filter?.label || '',
    selected: filter?.selected || '',
    options: Array.isArray(filter?.options) ? filter.options : []
  }));

  const generateLettersButton = surplusData.generateLettersButton || { label: '', icon: '', action: '' };
  const tableHeaders = Array.isArray(surplusData.tableHeaders) ? surplusData.tableHeaders : [];
  
  const rawRecords = Array.isArray(surplusData.records) ? surplusData.records : [];
  const records = rawRecords.map((record: any) => ({
    id: record?.id || '',
    propertyId: record?.propertyId || 0,
    caseNumber: record?.caseNumber || '',
    fcsFile: record?.fcsFile || '',
    county: record?.county || '',
    parcelId: record?.parcelId || '',
    originalOwner: record?.originalOwner || '',
    amount: record?.amount || 0,
    collected: record?.collected || '',
    surplusCollected: record?.surplusCollected || '',
    paid: record?.paid || '',
    unclaimed: record?.unclaimed || '',
    surplusUnclaimed: record?.surplusUnclaimed || '',
    unclaimedColor: record?.unclaimedColor || '',
    saleDate: record?.saleDate || '',
    status: record?.status || '',
    statusColor: record?.statusColor || '',
    statusBg: record?.statusBg || '',
    recipientName: record?.recipientName || '',
    dateIdentified: record?.dateIdentified || '',
    claimDeadline: record?.claimDeadline || '',
    documents: record?.documents || { message: '' },
    notes: record?.notes || '',
    contactHistory: Array.isArray(record?.contactHistory) ? record.contactHistory.map((h: any) => ({
        date: h?.date || '',
        status: h?.status || '',
        description: h?.description || ''
    })) : [],
    outreach: record?.outreach || { documentName: '', status: '' },
    recipientInfo: record?.recipientInfo || { name: '', address: '', city: '', state: '', phone: '' }
  }));
  // Use selectedRecordId to find the current selected record from the records array
  // If not found, fallback to the first record or the one from data
  // const selectedRecord = records.find((r: SurplusRecord) => r.id === selectedRecordId) || records[0] || surplusData.selectedRecord || null;

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
                onClick={handleImportClick}
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
                {actionButtons.bulkImport?.icon && iconMap[actionButtons.bulkImport.icon] && React.createElement(iconMap[actionButtons.bulkImport.icon], { style: { width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` } })}
                {actionButtons.bulkImport?.label}
              </button>
              <button
                onClick={handleExport}
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
                {actionButtons.export?.icon && iconMap[actionButtons.export.icon] && React.createElement(iconMap[actionButtons.export.icon], { style: { width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` } })}
                {actionButtons.export?.label}
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
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
                {actionButtons.addRecord?.icon && iconMap[actionButtons.addRecord.icon] && React.createElement(iconMap[actionButtons.addRecord.icon], { style: { width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` } })}
                {actionButtons.addRecord?.label}
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
              {summaryCards.map((card: SurplusSummaryCard, idx: number) => (
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              {showFilters && filters.map((filter: SurplusFilter, idx: number) => {
                let currentValue = 'All';
                if (filter.label === 'Status') currentValue = statusFilter;
                else if (filter.label === 'County') currentValue = countyFilter;
                else if (filter.label === 'Amount') currentValue = amountFilter;

                return (
                  <select
                    key={idx}
                    value={currentValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (filter.label === 'Status') setStatusFilter(val);
                      else if (filter.label === 'County') setCountyFilter(val);
                      else if (filter.label === 'Amount') setAmountFilter(val);
                    }}
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
                  >
                    <option value="All">{filter.label}: All</option>
                    {filter.options.filter(opt => opt !== 'All').map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                );
              })}
              <button
                onClick={() => setShowDateInputs(!showDateInputs)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px)`,
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  backgroundColor: showDateInputs ? '#EFF6FF' : '#FFFFFF',
                  color: showDateInputs ? '#1E40AF' : '#64748B',
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                <Calendar style={{ width: `clamp(12px, 2vw, 14px)`, height: `clamp(12px, 2vw, 14px)` }} />
                Date Range
              </button>
              {showDateInputs && (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <input 
                          type="date" 
                          style={{ fontSize: '11px', padding: '4px', border: '1px solid #E2E8F0', borderRadius: '4px' }}
                          onChange={(e) => setDateRange({...dateRange, start: e.target.value})} 
                      />
                      <span style={{ fontSize: '11px' }}>-</span>
                      <input 
                          type="date" 
                          style={{ fontSize: '11px', padding: '4px', border: '1px solid #E2E8F0', borderRadius: '4px' }}
                          onChange={(e) => setDateRange({...dateRange, end: e.target.value})} 
                      />
                  </div>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px)`,
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  backgroundColor: showFilters ? '#EFF6FF' : '#FFFFFF',
                  color: showFilters ? '#1E40AF' : '#64748B',
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
                onClick={handleGenerateLetters}
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
                      {tableHeaders.map((header: string, idx: number) => (
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
                    {records.map((record: SurplusRecord) => {
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
            </div>

                {selectedRecord && (
                  <>
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
                          onClick={() => setIsContactModalOpen(true)}
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
                        {(selectedRecord.contactHistory || []).map((contact: SurplusContactHistory, idx: number) => (
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
                            {selectedRecord.outreach?.documentName || 'No document'}
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
                            {selectedRecord.outreach?.status || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={handleViewOutreach}
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
                          onClick={handleSendLetter}
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
                      <input 
                          type="file" 
                          ref={fileInputRef} 
                          style={{ display: 'none' }} 
                          onChange={handleFileChange} 
                      />
                      <input 
                          type="file" 
                          ref={importInputRef} 
                          style={{ display: 'none' }} 
                          onChange={handleImportFileChange}
                          accept=".csv,.txt"
                      />
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
                          onClick={handleUploadClick}
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
                        {Array.isArray(selectedRecord.documents) ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {selectedRecord.documents.map((doc: any) => (
                                    <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FileText size={14} color="#64748B" />
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0F172A', textDecoration: 'none', fontWeight: 500 }}>
                                                {doc.name}
                                            </a>
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>{doc.date}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // @ts-ignore
                            selectedRecord.documents?.message || 'No documents available'
                        )}
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
                          marginBottom: 12,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        RECIPIENT INFO
                        <button 
                            onClick={() => {
                                if (isEditingRecipient) {
                                    // Reset form on Cancel
                                    if (selectedRecord) {
                                        setRecipientForm(selectedRecord.recipientInfo);
                                    }
                                }
                                setIsEditingRecipient(!isEditingRecipient);
                            }}
                            style={{
                                fontSize: '11px',
                                color: '#1E3A5F',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            {isEditingRecipient ? 'Cancel' : 'Edit'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {isEditingRecipient ? (
                            <>
                                <input 
                                    value={recipientForm.name} 
                                    onChange={e => setRecipientForm({...recipientForm, name: e.target.value})}
                                    placeholder="Name/Company"
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}
                                />
                                <input 
                                    value={recipientForm.address} 
                                    onChange={e => setRecipientForm({...recipientForm, address: e.target.value})}
                                    placeholder="Address"
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <input 
                                        value={recipientForm.city} 
                                        onChange={e => setRecipientForm({...recipientForm, city: e.target.value})}
                                        placeholder="City"
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}
                                    />
                                    <input 
                                        value={recipientForm.state} 
                                        onChange={e => setRecipientForm({...recipientForm, state: e.target.value})}
                                        placeholder="State"
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <input 
                                    value={recipientForm.phone} 
                                    onChange={e => setRecipientForm({...recipientForm, phone: e.target.value})}
                                    placeholder="Phone"
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}
                                />
                                <button
                                  onClick={handleUpdateRecipient}
                                  style={{
                                    width: '100%',
                                    marginTop: '8px',
                                    padding: `clamp(8px, 1.2vh, 10px) clamp(12px, 2vw, 16px)`,
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
                            </>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Name/Company:</span>
                                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                                    {selectedRecord.recipientInfo?.name || 'Unknown'}
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
                            </>
                        )}
                      </div>
                    </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Record Modal */}
      {isAddModalOpen && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
                <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>New Surplus Fund Research</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <select 
                        value={newRecordForm.property_id}
                        onChange={e => setNewRecordForm({...newRecordForm, property_id: e.target.value})}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}
                    >
                        <option value="">Select Property</option>
                        {properties.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.address} ({p.parcel_id})</option>
                        ))}
                    </select>
                    <input 
                        type="number"
                        placeholder="Amount"
                        value={newRecordForm.amount}
                        onChange={e => setNewRecordForm({...newRecordForm, amount: e.target.value})}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}
                    />
                    <textarea 
                        placeholder="Notes"
                        value={newRecordForm.notes}
                        onChange={e => setNewRecordForm({...newRecordForm, notes: e.target.value})}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0', minHeight: '80px' }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                    <button onClick={() => setIsAddModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleAddRecord} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#1E3A5F', color: '#fff', cursor: 'pointer' }}>Create</button>
                </div>
            </div>
        </div>
      )}

      {/* Log Contact Modal */}
      {isContactModalOpen && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
                <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>Log Contact</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input 
                        type="date"
                        value={contactForm.date}
                        onChange={e => setContactForm({...contactForm, date: e.target.value})}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}
                    />
                    <select 
                        value={contactForm.type}
                        onChange={e => setContactForm({...contactForm, type: e.target.value})}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}
                    >
                        <option value="call">Call</option>
                        <option value="email">Email</option>
                        <option value="letter">Letter</option>
                        <option value="other">Other</option>
                    </select>
                    <textarea 
                        placeholder="Notes"
                        value={contactForm.notes}
                        onChange={e => setContactForm({...contactForm, notes: e.target.value})}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0', minHeight: '80px' }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                    <button onClick={() => setIsContactModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleLogContact} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#1E3A5F', color: '#fff', cursor: 'pointer' }}>Save</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
