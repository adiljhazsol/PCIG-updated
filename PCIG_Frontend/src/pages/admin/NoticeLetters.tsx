import React, { CSSProperties, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X,
  List // Added List icon for View Logs
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

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
  X,
  List
};

// Define interfaces for type safety
interface NoticeProperty {
  address: string;
  city: string;
  state: string;
  zip: string;
  parcel: string;
  county: string;
}

interface NoticeRow {
  id: string;
  status: string;
  statusBg: string;
  statusColor: string;
  property: NoticeProperty;
  recipient: string;
  noticeType: string;
  noticeTypeBg: string;
  noticeTypeColor: string;
  createdDate: string;
  tracking: string;
  detail?: any;
}

interface NoticeHeader {
  title: string;
  subtitle: string;
  actionButtons: Array<{ label: string; icon: string }>;
}

interface ActionButton {
  label: string;
  icon: string;
  bg?: string;
  color?: string;
  [key: string]: any;
}

interface PropertyInfo {
  address: string;
  city: string;
  state: string;
  zip: string;
  apn: string;
  county: string;
}

interface RecipientInfo {
  name: string;
  relation: string;
  address: string;
  email: string;
  phone: string;
}

interface NoticeDetails {
  noticeType: string;
  noticeTypeBg: string;
  noticeTypeColor: string;
  status: string;
  statusBg: string;
  statusColor: string;
  date: string;
  trackingNumber: string;
}

interface DocumentItem {
  name: string;
  size: string;
  type: string;
}

interface DocumentSection {
  title: string;
  items: DocumentItem[];
}

interface TimelineEvent {
  date: string;
  event: string;
}

interface TimelineSection {
  title: string;
  events: TimelineEvent[];
}

interface NoticeDetailPanel {
  title: string;
  status: string;
  statusBg: string;
  statusColor: string;
  actions: {
    send: ActionButton;
    preview: ActionButton;
    edit: ActionButton;
  };
  propertyInfo: PropertyInfo;
  recipientInfo: RecipientInfo;
  noticeDetails: NoticeDetails;
  documents: DocumentSection;
  timeline: TimelineSection;
}

interface NoticeData {
  header?: NoticeHeader;
  summaryCards?: any[];
  searchAndFilters?: {
    searchPlaceholder?: string;
    filters?: any[];
  };
  noticesTable?: {
    headers?: string[];
    rows?: NoticeRow[];
  };
  detailPanel?: any;
}

interface PropertyOption {
  id: number;
  address: string;
  parcel_id: string;
}

interface TemplateOption {
  id: number;
  name: string;
}

export default function NoticeLetters() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  const [data, setData] = useState<NoticeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotices, setSelectedNotices] = useState<Set<string>>(new Set());
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [newNotice, setNewNotice] = useState({
    property_id: '',
    template_id: '',
    recipient_name: '',
    recipient_address: ''
  });
  const [editNotice, setEditNotice] = useState({
    id: '',
    property_id: '',
    template_id: '',
    recipient_name: '',
    recipient_address: ''
  });

  // Filters & Search State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateRangeFilter, setDateRangeFilter] = useState('Last 30 Days');
  const [sortCol, setSortCol] = useState('Created');
  const [sortDir, setSortDir] = useState('desc');

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Data
  const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
            search: debouncedSearch,
            status: statusFilter,
            date_range: dateRangeFilter,
            sort_col: sortCol,
            sort_dir: sortDir
        };
        const response = await api.get('/admin/notices/dashboard-data', { params });
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notices data:', err);
        setError('Failed to load notices data. Please try again later.');
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, statusFilter, dateRangeFilter, sortCol, sortDir]);

  // Handlers
  const handleGenerateReport = async () => {
      try {
          const response = await api.post('/admin/notices/export');
          if (response.data.success) {
              alert(response.data.message); // Ideally use a toast notification
          }
      } catch (err) {
          console.error('Export failed', err);
          alert('Failed to start export.');
      }
  };

  const handleViewLogs = () => {
    navigate('/admin/administration/audit-log');
  };

  const handleCreateNotice = () => {
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setNewNotice({
        property_id: '',
        template_id: '',
        recipient_name: '',
        recipient_address: ''
    });
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditNotice({
        id: '',
        property_id: '',
        template_id: '',
        recipient_name: '',
        recipient_address: ''
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
        const response = await api.put(`/admin/notices/${editNotice.id}`, {
            property_id: editNotice.property_id,
            template_id: editNotice.template_id,
            recipient_name: editNotice.recipient_name,
            recipient_address: editNotice.recipient_address
        });
        if (response.data.success) {
            alert('Notice updated successfully');
            handleEditModalClose();
            fetchData();
        }
    } catch (err) {
        console.error('Failed to update notice', err);
        alert('Failed to update notice');
    } finally {
        setProcessing(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
        const response = await api.post('/admin/notices', newNotice);
        if (response.data.success) {
            alert('Notice created successfully');
            handleModalClose();
            fetchData();
        }
    } catch (err) {
        console.error('Failed to create notice', err);
        alert('Failed to create notice');
    } finally {
        setProcessing(false);
    }
  };

  useEffect(() => {
    if (isCreateModalOpen || isEditModalOpen) {
        const fetchDropdowns = async () => {
            try {
                const [propsRes, tempsRes] = await Promise.all([
                    api.get('/admin/properties/dropdown'),
                    api.get('/admin/notices/templates')
                ]);
                setProperties(propsRes.data);
                setTemplates(tempsRes.data.data);
            } catch (err) {
                console.error('Failed to load dropdowns', err);
            }
        };
        fetchDropdowns();
    }
  }, [isCreateModalOpen, isEditModalOpen]);

  const handleGenerateSingle = async (id: string) => {
    if (!window.confirm('Generate letter for this notice?')) return;
    
    setProcessing(true);
    try {
        const response = await api.post('/admin/notices/bulk-generate', {
            notice_ids: [id]
        });
        if (response.data.success) {
            alert(response.data.message);
            fetchData(); // Refresh data
        }
    } catch (err) {
        console.error('Generate failed', err);
        alert('Failed to generate letter.');
    } finally {
        setProcessing(false);
    }
  };

  const handleBulkGenerate = async () => {
      if (selectedNotices.size === 0) return;
      if (!window.confirm(`Generate letters for ${selectedNotices.size} selected notices?`)) return;

      setProcessing(true);
      try {
          const response = await api.post('/admin/notices/bulk-generate', {
              notice_ids: Array.from(selectedNotices)
          });
          if (response.data.success) {
              alert(response.data.message);
              setSelectedNotices(new Set());
              fetchData(); // Refresh data
          }
      } catch (err) {
          console.error('Bulk generate failed', err);
          alert('Failed to process bulk generation.');
      } finally {
          setProcessing(false);
      }
  };

  const handleSort = (column: string) => {
      if (sortCol === column) {
          setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
      } else {
          setSortCol(column);
          setSortDir('asc'); // Default to asc for new column
      }
  };

  const handleFilterChange = (filterLabel: string, value: string) => {
      if (filterLabel === 'Status') setStatusFilter(value);
      if (filterLabel === 'Date Range') setDateRangeFilter(value);
  };

  const handleSend = async (id: string) => {
      if (!window.confirm('Mark this notice as sent?')) return;
      try {
          const response = await api.post(`/admin/notices/${id}/send`);
          if (response.data.success) {
              alert(response.data.message);
              fetchData();
          }
      } catch (err) {
          console.error('Send failed', err);
          alert('Failed to mark as sent.');
      }
  };

  const handlePreview = async (id: string) => {
      try {
          const response = await api.get(`/admin/notices/${id}/preview`);
          if (response.data.url) {
              window.open(response.data.url, '_blank');
          } else {
              alert('Preview not available.');
          }
      } catch (err) {
          console.error('Preview failed', err);
          alert('Failed to preview.');
      }
  };

  const handleEdit = async (id: string) => {
      setProcessing(true);
      try {
          const response = await api.get(`/admin/notices/${id}`);
          if (response.data.success) {
              const notice = response.data.data;
              setEditNotice({
                  id: notice.id,
                  property_id: notice.property_id,
                  template_id: notice.template_id,
                  recipient_name: notice.recipient_name,
                  recipient_address: notice.recipient_address
              });
              setIsEditModalOpen(true);
          }
      } catch (err) {
          console.error('Failed to fetch notice details', err);
          alert('Failed to load notice details.');
      } finally {
          setProcessing(false);
      }
  };

  // Set initial selected notice when data loads
  useEffect(() => {
    if (data?.noticesTable?.rows && data.noticesTable.rows.length > 0 && !selectedNoticeId) {
      setSelectedNoticeId(data.noticesTable.rows[0].id);
    }
  }, [data]);

  const noticeData = data || {};
  
  const rawHeader = noticeData.header || {} as NoticeHeader;
  const header = {
    title: rawHeader.title || 'Notice Letters',
    subtitle: rawHeader.subtitle || 'Manage your notice letters',
    actionButtons: Array.isArray(rawHeader.actionButtons) ? rawHeader.actionButtons : []
  };
  
  const getSafeButton = (index: number, defaultLabel: string, defaultIcon: string) => {
    const btn = header.actionButtons[index] || {};
    return {
      label: btn.label || defaultLabel,
      icon: btn.icon || defaultIcon
    };
  };

  const actionButton1 = getSafeButton(0, 'Export Logs', 'FileText');
  const actionButton2 = getSafeButton(1, 'Create Notice', 'Plus');
  const actionButton3 = { label: 'View Logs', icon: 'List' }; // New Logs button

  const ViewLogsIcon = iconMap[actionButton3.icon] || List;

  const summaryCards = Array.isArray(noticeData.summaryCards) ? noticeData.summaryCards : [];
  
  const rawSearchAndFilters = noticeData.searchAndFilters || {};
  const searchAndFilters = {
    searchPlaceholder: rawSearchAndFilters.searchPlaceholder || 'Search...',
    filters: Array.isArray(rawSearchAndFilters.filters) ? rawSearchAndFilters.filters : []
  };

  const rawNoticesTable = noticeData.noticesTable || {};
  const noticesTable = {
    headers: Array.isArray(rawNoticesTable.headers) ? rawNoticesTable.headers : [],
    rows: (Array.isArray(rawNoticesTable.rows) ? rawNoticesTable.rows : []) as NoticeRow[]
  };

  // Find the selected row to derive detail panel data
  const selectedRow = noticesTable.rows.find((r: NoticeRow) => r.id === selectedNoticeId) || noticesTable.rows[0];
  const rawDetailPanel = selectedRow?.detail || noticeData.detailPanel || {};

  // Construct safe detail panel object
  const detailPanel: NoticeDetailPanel = {
    title: rawDetailPanel.title || 'Notice Details',
    status: rawDetailPanel.status || selectedRow?.status || 'Unknown',
    statusBg: rawDetailPanel.statusBg || selectedRow?.statusBg || '#F1F5F9',
    statusColor: rawDetailPanel.statusColor || selectedRow?.statusColor || '#64748B',
    actions: {
      send: { label: 'Send', icon: 'Send', bg: '#2563EB', color: '#FFFFFF', ...rawDetailPanel.actions?.send },
      preview: { label: 'Preview', icon: 'Eye', bg: '#FFFFFF', color: '#64748B', ...rawDetailPanel.actions?.preview },
      edit: { label: 'Edit', icon: 'Edit', bg: '#FFFFFF', color: '#64748B', ...rawDetailPanel.actions?.edit }
    },
    propertyInfo: {
        address: rawDetailPanel.propertyInfo?.address || selectedRow?.property?.address || '',
        city: rawDetailPanel.propertyInfo?.city || selectedRow?.property?.city || '',
        state: rawDetailPanel.propertyInfo?.state || selectedRow?.property?.state || '',
        zip: rawDetailPanel.propertyInfo?.zip || selectedRow?.property?.zip || '',
        apn: rawDetailPanel.propertyInfo?.apn || selectedRow?.property?.parcel || '',
        county: rawDetailPanel.propertyInfo?.county || selectedRow?.property?.county || ''
    },
    recipientInfo: {
        name: rawDetailPanel.recipientInfo?.name || selectedRow?.recipient || '',
        relation: rawDetailPanel.recipientInfo?.relation || 'Owner',
        address: rawDetailPanel.recipientInfo?.address || '',
        email: rawDetailPanel.recipientInfo?.email || 'N/A',
        phone: rawDetailPanel.recipientInfo?.phone || 'N/A'
    },
    noticeDetails: {
        noticeType: rawDetailPanel.noticeDetails?.noticeType || selectedRow?.noticeType || '',
        noticeTypeBg: rawDetailPanel.noticeDetails?.noticeTypeBg || selectedRow?.noticeTypeBg || '#F1F5F9',
        noticeTypeColor: rawDetailPanel.noticeDetails?.noticeTypeColor || selectedRow?.noticeTypeColor || '#64748B',
        status: rawDetailPanel.noticeDetails?.status || selectedRow?.status || '',
        statusBg: rawDetailPanel.noticeDetails?.statusBg || selectedRow?.statusBg || '#F1F5F9',
        statusColor: rawDetailPanel.noticeDetails?.statusColor || selectedRow?.statusColor || '#64748B',
        date: rawDetailPanel.noticeDetails?.date || selectedRow?.createdDate || '',
        trackingNumber: rawDetailPanel.noticeDetails?.trackingNumber || selectedRow?.tracking || '-'
    },
    documents: {
        title: rawDetailPanel.documents?.title || 'Documents',
        items: Array.isArray(rawDetailPanel.documents?.items) ? rawDetailPanel.documents.items : []
    },
    timeline: {
        title: rawDetailPanel.timeline?.title || 'History',
        events: Array.isArray(rawDetailPanel.timeline?.events) ? rawDetailPanel.timeline.events : []
    }
  };

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
      setSelectedNotices(new Set((noticesTable.rows || []).map((r: NoticeRow) => r.id)));
    } else {
      setSelectedNotices(new Set());
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

  const GenerateReportIcon = iconMap[actionButton1.icon] || FileText;
  const CreateNoticeIcon = iconMap[actionButton2.icon] || Plus;
  const SendIcon = iconMap[detailPanel.actions.send.icon] || Send;
  const PreviewIcon = iconMap[detailPanel.actions.preview.icon] || Eye;
  const EditIcon = iconMap[detailPanel.actions.edit.icon] || Edit;

  if (loading) {
    return (
      <div style={pageWrapperStyle}>
        <AdminNav />
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
          Loading notice letters...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageWrapperStyle}>
        <AdminNav />
        <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
          {error}
        </div>
      </div>
    );
  }

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
                    onClick={handleGenerateReport}
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
                    <span style={{ whiteSpace: 'nowrap' }}>{actionButton1.label}</span>
                  </button>
                  <button
                    onClick={handleViewLogs}
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
                    <ViewLogsIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap' }}>{actionButton3.label}</span>
                  </button>
                  <button
                    onClick={handleCreateNotice}
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
                    <span style={{ whiteSpace: 'nowrap' }}>{actionButton2.label}</span>
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
              
              {/* Bulk Actions (conditionally rendered) */}
              {selectedNotices.size > 0 && (
                <button
                    onClick={handleBulkGenerate}
                    disabled={processing}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: isMobile ? '8px 16px' : '10px 16px',
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: '#8B5CF6',
                        color: '#FFFFFF',
                        fontSize: isMobile ? 13 : 14,
                        fontWeight: 500,
                        cursor: processing ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                        opacity: processing ? 0.7 : 1
                    }}
                >
                    <FileText style={{ width: 16, height: 16 }} />
                    {processing ? 'Processing...' : `Generate (${selectedNotices.size})`}
                </button>
              )}

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
                      value={filter.label === 'Status' ? statusFilter : dateRangeFilter}
                      onChange={(e) => handleFilterChange(filter.label, e.target.value)}
                    >
                      <option disabled>{filter.label}</option>
                      {filter.options && filter.options.map((opt: string) => (
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
                          checked={noticesTable.rows.length > 0 && selectedNotices.size === noticesTable.rows.length}
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
                          onClick={() => header !== 'Actions' && handleSort(header)}
                          style={{
                            padding: isMobile ? '10px 12px' : '12px 16px',
                            textAlign: 'left',
                            fontSize: isMobile ? 10 : 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: '#64748B',
                            whiteSpace: 'nowrap',
                            cursor: header !== 'Actions' ? 'pointer' : 'default',
                            userSelect: 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              {header}
                              {header !== 'Actions' && sortCol === header && (
                                  <span style={{ fontSize: 10 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
                              )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {noticesTable.rows.length === 0 ? (
                        <tr>
                            <td colSpan={noticesTable.headers.length} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                                No notices found.
                            </td>
                        </tr>
                    ) : (
                        noticesTable.rows.map((row: any) => (
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
                                {row.property?.address || 'Unknown'}
                                </div>
                                <div
                                style={{
                                    fontSize: isMobile ? 11 : 12,
                                    color: '#64748B',
                                    wordBreak: 'break-word'
                                }}
                                >
                                {row.property?.parcel || ''}
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
                            {row.status === 'Draft' ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleGenerateSingle(row.id);
                                    }}
                                    style={{
                                    padding: isMobile ? '5px 10px' : '6px 12px',
                                    borderRadius: 6,
                                    border: 'none',
                                    backgroundColor: '#8B5CF6',
                                    color: '#FFFFFF',
                                    fontSize: isMobile ? 11 : 12,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    boxSizing: 'border-box'
                                    }}
                                >
                                    Generate
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNoticeId(row.id);
                                    }}
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
                                    View
                                </button>
                            )}
                            </td>
                        </tr>
                        ))
                    )}
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
                    {detailPanel.title}
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
                    {detailPanel.propertyInfo.address}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 11 : 12,
                      color: '#64748B',
                      marginBottom: 12,
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.propertyInfo.apn}
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: isMobile ? 10 : 11,
                      fontWeight: 500,
                      backgroundColor: detailPanel.statusBg,
                      color: detailPanel.statusColor,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {detailPanel.status}
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
                  fontSize: isMobile ? 12 : 13,
                  color: '#64748B',
                  wordBreak: 'break-word'
                }}
              >
                {detailPanel.propertyInfo.city}, {detailPanel.propertyInfo.state} {detailPanel.propertyInfo.zip}
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
              <div
                style={{
                  fontSize: isMobile ? 12 : 13,
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
                  marginBottom: 8,
                  wordBreak: 'break-word'
                }}
              >
                {detailPanel.recipientInfo.relation}
              </div>
              <div
                style={{
                  fontSize: isMobile ? 12 : 13,
                  color: '#64748B',
                  marginBottom: 2,
                  wordBreak: 'break-word'
                }}
              >
                {detailPanel.recipientInfo.address}
              </div>
              <div
                style={{
                  fontSize: isMobile ? 12 : 13,
                  color: '#64748B',
                  wordBreak: 'break-word'
                }}
              >
                {detailPanel.recipientInfo.email} • {detailPanel.recipientInfo.phone}
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
                Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 12 : 16 }}>
                <div>
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
                    Type
                  </div>
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
                <div>
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
                    Status
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: isMobile ? 10 : 11,
                      fontWeight: 500,
                      backgroundColor: detailPanel.noticeDetails.statusBg,
                      color: detailPanel.noticeDetails.statusColor,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {detailPanel.noticeDetails.status}
                  </span>
                </div>
                <div>
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
                    Date
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      color: '#0F172A',
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.noticeDetails.date}
                  </div>
                </div>
                <div>
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
                    Tracking
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      color: '#0F172A',
                      fontFamily: 'monospace',
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.noticeDetails.trackingNumber}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12 }}>
                {detailPanel.documents.items.map((doc: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: isMobile ? 10 : 12,
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC'
                    }}
                  >
                    <FileText style={{ width: isMobile ? 18 : 20, height: isMobile ? 18 : 20, color: '#64748B', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: isMobile ? 12 : 13,
                          fontWeight: 500,
                          color: '#0F172A',
                          marginBottom: 2,
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
                        {doc.size} • {doc.type}
                      </div>
                    </div>
                  </div>
                ))}
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
                  marginBottom: isMobile ? 10 : 12,
                  marginLeft: 0,
                  wordBreak: 'break-word'
                }}
              >
                {detailPanel.timeline.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {detailPanel.timeline.events.map((event: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: idx === 0 ? '#3B82F6' : '#E2E8F0',
                          marginTop: 6
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
              {detailPanel.status === 'Draft' ? (
                  <button
                    onClick={() => selectedNoticeId && handleGenerateSingle(selectedNoticeId)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: isMobile ? '10px 20px' : '12px 24px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: '#8B5CF6',
                      color: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: '100%',
                      justifyContent: 'center',
                      boxSizing: 'border-box'
                    }}
                  >
                    <FileText style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap' }}>Generate Letter</span>
                  </button>
              ) : (
                  <button
                    onClick={() => selectedNoticeId && handleSend(selectedNoticeId)}
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
              )}
              <button
                onClick={() => selectedNoticeId && handlePreview(selectedNoticeId)}
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
                onClick={() => selectedNoticeId && handleEdit(selectedNoticeId)}
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
      
      {/* Create Notice Modal */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#0F172A' }}>Create New Notice</h3>
              <button onClick={handleModalClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X style={{ width: 20, height: 20, color: '#64748B' }} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>
                  Property <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  required
                  value={newNotice.property_id}
                  onChange={(e) => setNewNotice({...newNotice, property_id: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    fontSize: 14,
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="">Select Property</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.address} ({p.parcel_id})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>
                  Notice Template <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  required
                  value={newNotice.template_id}
                  onChange={(e) => setNewNotice({...newNotice, template_id: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    fontSize: 14,
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="">Select Template</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>
                  Recipient Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newNotice.recipient_name}
                  onChange={(e) => setNewNotice({...newNotice, recipient_name: e.target.value})}
                  placeholder="e.g. John Doe"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>
                  Recipient Address <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newNotice.recipient_address}
                  onChange={(e) => setNewNotice({...newNotice, recipient_address: e.target.value})}
                  placeholder="e.g. 123 Main St, City, State 12345"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleModalClose}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: '#8B5CF6',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: processing ? 'not-allowed' : 'pointer',
                    opacity: processing ? 0.7 : 1
                  }}
                >
                  {processing ? 'Creating...' : 'Create Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Notice Modal */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#0F172A' }}>Edit Notice</h3>
              <button onClick={handleEditModalClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X style={{ width: 20, height: 20, color: '#64748B' }} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>
                  Property <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  required
                  value={editNotice.property_id}
                  onChange={(e) => setEditNotice({...editNotice, property_id: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    fontSize: 14,
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="">Select Property</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.address} ({p.parcel_id})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>
                  Notice Template <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  required
                  value={editNotice.template_id}
                  onChange={(e) => setEditNotice({...editNotice, template_id: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    fontSize: 14,
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="">Select Template</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>
                  Recipient Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editNotice.recipient_name}
                  onChange={(e) => setEditNotice({...editNotice, recipient_name: e.target.value})}
                  placeholder="e.g. John Doe"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>
                  Recipient Address <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editNotice.recipient_address}
                  onChange={(e) => setEditNotice({...editNotice, recipient_address: e.target.value})}
                  placeholder="e.g. 123 Main St, City, State 12345"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleEditModalClose}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: '#8B5CF6',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: processing ? 'not-allowed' : 'pointer',
                    opacity: processing ? 0.7 : 1
                  }}
                >
                  {processing ? 'Updating...' : 'Update Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}