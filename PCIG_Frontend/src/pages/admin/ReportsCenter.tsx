import { CSSProperties, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Clock,
  TrendingUp,
  Settings,
  RefreshCw,
  ClipboardList,
  Percent,
  Book,
  Plus,
  Trash2,
  Star,
  X
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  FileText,
  Clock,
  TrendingUp,
  Settings,
  RefreshCw,
  Clipboard: ClipboardList,
  Percent,
  Book
};

export default function ReportsCenter() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/reports/dashboard-data');
        if (response.data && response.data.data && response.data.data.reportsCenter) {
          setData(response.data.data.reportsCenter);
        } else {
          setError('Failed to load reports data');
        }
      } catch (err) {
        console.error('Error fetching reports data:', err);
        setError('An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Safe data extraction
  const reportsData = data || {};
  const [activeTab, setActiveTab] = useState<string>(reportsData.activeTab || 'all');
  const header = reportsData.header || { title: 'Reports Center', subtitle: 'Access financial and operational reports' };
  const searchPlaceholder = reportsData.searchPlaceholder || 'Search reports...';
  const taxSeasonBanner = reportsData.taxSeasonBanner || { 
    title: 'Tax Season 2024', 
    description: 'Prepare K-1s and review allocations.', 
    buttons: { 
      reviewAllocations: { label: 'Review Allocations', icon: 'Settings' }, 
      generateK1: { label: 'Generate K-1s', icon: 'FileText' } 
    } 
  };
  const tabs = reportsData.tabs || ['All Reports', 'Financial', 'Operational', 'Tax'];
  const allCategories = reportsData.reportCategories || [];
  
  const reportCategories = activeTab === 'All Reports' || activeTab === 'all' 
    ? allCategories 
    : allCategories.filter((cat: any) => {
        if (activeTab === 'Financial') return cat.title === 'Financial Reports';
        if (activeTab === 'Operational') return cat.title === 'Operational Reports';
        if (activeTab === 'Tax') return cat.title === 'Tax & Compliance';
        return true;
      });

  const sidebar = reportsData.sidebar || { recentReports: [], scheduledReports: [], favorites: [] };

  const pageWrapperStyle: CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
    overflowX: 'hidden'
  };

  const ReviewAllocationsIcon = iconMap[taxSeasonBanner.buttons?.reviewAllocations?.icon] || Settings;
  const GenerateK1Icon = iconMap[taxSeasonBanner.buttons?.generateK1?.icon] || FileText;

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  interface ScheduleForm {
    type: string;
    frequency: string;
    recipients: string;
    parameters: {
      startDate: string;
      endDate: string;
      propertyId: string;
    };
  }

  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({
    type: '',
    frequency: 'weekly',
    recipients: '',
    parameters: {
      startDate: '',
      endDate: '',
      propertyId: ''
    }
  });

  const handleToggleFavorite = async (reportId: string) => {
    try {
      const response = await api.post('/admin/reports/favorite', { report_type: reportId });
      if (response.data.success) {
        // Refresh data to update sidebar and icons
        const newData = await api.get('/admin/reports/dashboard-data');
        if (newData.data && newData.data.data && newData.data.data.reportsCenter) {
          setData(newData.data.data.reportsCenter);
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleDeleteScheduled = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this scheduled report?')) return;
    
    try {
      await api.delete(`/admin/reports/schedule/${id}`);
      // Refresh data
      const newData = await api.get('/admin/reports/dashboard-data');
      if (newData.data && newData.data.data && newData.data.data.reportsCenter) {
        setData(newData.data.data.reportsCenter);
      }
    } catch (err) {
      console.error('Error deleting scheduled report:', err);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/reports/schedule', scheduleForm);
      setShowScheduleModal(false);
      setScheduleForm({
        type: '',
        frequency: 'weekly',
        recipients: '',
        parameters: {
          startDate: '',
          endDate: '',
          propertyId: ''
        }
      });
      // Refresh data
      const newData = await api.get('/admin/reports/dashboard-data');
      if (newData.data && newData.data.data && newData.data.data.reportsCenter) {
        setData(newData.data.data.reportsCenter);
      }
    } catch (err) {
      console.error('Error scheduling report:', err);
    }
  };

  const handleGenerateReport = async (reportId: string) => {
    try {
      // Show loading indicator if desired (optional)
      const response = await api.post('/admin/reports/generate', { type: reportId });
      
      if (response.data.success && response.data.data.id) {
        const reportId = response.data.data.id;
        
        // Download the generated report
        const downloadRes = await api.get(`/admin/reports/download/${reportId}`, { 
          responseType: 'blob' 
        });
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([downloadRes.data]));
        const link = document.createElement('a');
        link.href = url;
        // Use the filename from the response or generate one
        const filename = `${reportId}_${new Date().toISOString().split('T')[0]}.csv`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error generating report:', err);
      // Ideally show a toast notification here
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC' }}>
        <div style={{ color: '#64748B' }}>Loading reports...</div>
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
      <style>{`
        .tabs-scroll::-webkit-scrollbar {
          display: none;
        }
        .tabs-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <AdminNav />

      <div
        style={{
          padding: isMobile ? '20px 16px' : isTablet ? '24px 24px' : '32px 48px',
          width: '100%',
          maxWidth: '100vw',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {/* Header Section - Full Width */}
        <div style={{ minWidth: 0, width: '100%', overflowX: 'hidden', marginBottom: isMobile ? 24 : 32 }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'flex-start',
              marginBottom: isMobile ? 24 : 32,
              gap: isMobile ? 16 : 0,
              width: '100%',
              minWidth: 0
            }}
          >
            <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
              <h1
                style={{
                  fontSize: isMobile ? 'clamp(24px, 5vw, 32px)' : '32px',
                  fontWeight: 700,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 8,
                  marginLeft: 0,
                  lineHeight: 1.2,
                  wordBreak: 'break-word'
                }}
              >
                {header.title}
              </h1>
              {!isMobile && (
                <p
                  style={{
                    fontSize: `clamp(14px, 2vw, 16px)`,
                    color: '#64748B',
                    margin: 0
                  }}
                >
                  {header.subtitle}
                </p>
              )}
            </div>
            <div style={{ position: 'relative', width: isMobile ? '100%' : '320px', minWidth: 0, maxWidth: '100%' }}>
              <Search
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: `clamp(16px, 2.2vw, 18px)`,
                  height: `clamp(16px, 2.2vw, 18px)`,
                  color: '#94A3B8',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                style={{
                  width: '100%',
                  padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px) clamp(10px, 1.2vh, 12px) clamp(40px, 5vw, 44px)`,
                  fontSize: `clamp(13px, 1.8vw, 14px)`,
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  boxSizing: 'border-box',
                  maxWidth: '100%'
                }}
              />
            </div>
          </div>

          {/* Tax Season Banner */}
          <div
            style={{
              backgroundColor: '#1E3A5F',
              borderRadius: 12,
              padding: isMobile ? '20px' : '24px',
              marginBottom: isMobile ? 24 : 32,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? 16 : 0
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  fontSize: `clamp(16px, 2.2vw, 18px)`,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 8,
                  marginLeft: 0,
                  lineHeight: 1.3,
                  wordBreak: 'break-word'
                }}
              >
                {taxSeasonBanner.title}
              </h3>
              <p
                style={{
                  fontSize: `clamp(13px, 1.8vw, 14px)`,
                  color: '#E2E8F0',
                  margin: 0,
                  lineHeight: 1.5,
                  wordBreak: 'break-word'
                }}
              >
                {taxSeasonBanner.description}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: isMobile ? 'wrap' : 'nowrap', width: isMobile ? '100%' : 'auto', marginTop: isMobile ? 8 : 0, minWidth: 0 }}>
              <button
                onClick={() => navigate('/admin/payments/depreciation-tax-allocation')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: `clamp(10px, 1.2vh, 12px) clamp(14px, 2vw, 16px)`,
                  fontSize: `clamp(13px, 1.8vw, 14px)`,
                  fontWeight: 500,
                  color: '#1E3A5F',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  flex: isMobile ? 1 : 'none',
                  boxSizing: 'border-box',
                  justifyContent: 'center',
                  minWidth: 0,
                  whiteSpace: isMobile ? 'normal' : 'nowrap'
                }}
              >
                <ReviewAllocationsIcon style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)`, flexShrink: 0 }} />
                <span style={{ wordBreak: 'break-word' }}>{taxSeasonBanner?.buttons?.reviewAllocations?.label || 'Review Allocations'}</span>
              </button>
              <button
                onClick={() => navigate('/admin/payments/k1-generation')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: `clamp(10px, 1.2vh, 12px) clamp(14px, 2vw, 16px)`,
                  fontSize: `clamp(13px, 1.8vw, 14px)`,
                  fontWeight: 500,
                  color: '#1E3A5F',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  flex: isMobile ? 1 : 'none',
                  boxSizing: 'border-box',
                  justifyContent: 'center',
                  minWidth: 0,
                  whiteSpace: isMobile ? 'normal' : 'nowrap'
                }}
              >
                <GenerateK1Icon style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)`, flexShrink: 0 }} />
                <span style={{ wordBreak: 'break-word' }}>{taxSeasonBanner.buttons.generateK1.label}</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: isMobile ? 16 : isTablet ? 24 : 32,
              marginBottom: isMobile ? 24 : 32,
              borderBottom: '1px solid #E2E8F0',
              overflowX: isMobileOrTablet ? 'auto' : 'visible',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              width: '100%',
              minWidth: 0
            }}
            className="tabs-scroll"
          >
            {tabs.map((tab: string) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: `clamp(10px, 1.2vh, 12px) 0`,
                  fontSize: `clamp(13px, 1.8vw, 14px)`,
                  fontWeight: 500,
                  color: activeTab === tab ? '#1E3A5F' : '#64748B',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #1E3A5F' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: '-1px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Report Cards and Sidebar - Side by Side */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '2fr 1fr',
            gap: isMobile ? 20 : 24,
            alignItems: 'flex-start',
            width: '100%',
            minWidth: 0
          }}
        >
          {/* Report Categories - Left Column */}
          <div style={{ minWidth: 0, width: '100%', overflowX: 'hidden' }}>
            {reportCategories.map((category: any, categoryIdx: number) => (
              <div key={categoryIdx} style={{ marginBottom: categoryIdx < reportCategories.length - 1 ? (isMobile ? 32 : 48) : 0, width: '100%', minWidth: 0 }}>
                <h2
                  style={{
                    fontSize: `clamp(16px, 2.2vw, 18px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: isMobile ? 16 : 20,
                    marginLeft: 0
                  }}
                >
                  {category.title}
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                    gap: isMobile ? 16 : 20,
                    width: '100%',
                    minWidth: 0
                  }}
                >
                  {category.reports.map((report: any) => {
                    const ReportIcon = iconMap[report.icon] || FileText;
                    return (
                      <div
                        key={report.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 12,
                          border: '1px solid #E2E8F0',
                          padding: isMobile ? '16px' : '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          minWidth: 0,
                          width: '100%',
                          boxSizing: 'border-box',
                          position: 'relative'
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(report.id);
                          }}
                          style={{
                            position: 'absolute',
                            top: isMobile ? 16 : 20,
                            right: isMobile ? 16 : 20,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 4,
                            zIndex: 2
                          }}
                        >
                          <Star
                            size={20}
                            fill={report.is_favorite ? "#F59E0B" : "none"}
                            color={report.is_favorite ? "#F59E0B" : "#94A3B8"}
                          />
                        </button>
                        <div
                          style={{
                            width: `clamp(36px, 4.5vw, 40px)`,
                            height: `clamp(36px, 4.5vw, 40px)`,
                            borderRadius: 8,
                            backgroundColor: '#F8FAFC',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: isMobile ? 12 : 16,
                            flexShrink: 0
                          }}
                        >
                          <ReportIcon style={{ width: `clamp(18px, 2.2vw, 20px)`, height: `clamp(18px, 2.2vw, 20px)`, color: '#1E3A5F' }} />
                        </div>
                        <h3
                          style={{
                            fontSize: `clamp(14px, 1.8vw, 16px)`,
                            fontWeight: 600,
                            color: '#0F172A',
                            marginTop: 0,
                            marginRight: 0,
                            marginBottom: 8,
                            marginLeft: 0,
                            lineHeight: 1.3,
                            wordBreak: 'break-word'
                          }}
                        >
                          {report.title}
                        </h3>
                        <p
                          style={{
                            fontSize: `clamp(12px, 1.6vw, 13px)`,
                            color: '#64748B',
                            lineHeight: 1.5,
                            marginTop: 0,
                            marginRight: 0,
                            marginBottom: isMobile ? 12 : 16,
                            marginLeft: 0,
                            wordBreak: 'break-word'
                          }}
                        >
                          {report.description}
                        </p>
                        <div style={{ marginBottom: isMobile ? 12 : 16, flex: 1 }}>
                          <p
                            style={{
                              fontSize: `clamp(11px, 1.5vw, 12px)`,
                              fontWeight: 600,
                              color: '#64748B',
                              marginTop: 0,
                              marginRight: 0,
                              marginBottom: 8,
                              marginLeft: 0
                            }}
                          >
                            Includes:
                          </p>
                          <ul style={{ margin: 0, paddingLeft: 16, fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B', lineHeight: 1.6, wordBreak: 'break-word' }}>
                            {report.includes.map((item: string, itemIdx: number) => (
                              <li key={itemIdx} style={{ wordBreak: 'break-word' }}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <button
                          onClick={() => handleGenerateReport(report.id)}
                          style={{
                            width: '100%',
                            padding: `clamp(10px, 1.2vh, 12px) clamp(14px, 2vw, 16px)`,
                            fontSize: `clamp(13px, 1.8vw, 14px)`,
                            fontWeight: 500,
                            color: '#FFFFFF',
                            backgroundColor: '#1E3A5F',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            marginTop: 'auto',
                            boxSizing: 'border-box',
                            minWidth: 0,
                            wordBreak: 'break-word'
                          }}
                        >
                          Generate Report
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar - Right Column */}
          <div style={{ minWidth: 0, width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
            {/* Recent Reports */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: isMobile ? '20px' : '24px',
                marginBottom: isMobile ? 20 : 24
              }}
            >
              <h3
                style={{
                  fontSize: `clamp(14px, 1.8vw, 16px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: isMobile ? 12 : 16,
                  marginLeft: 0
                }}
              >
                Recent Reports
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
                {sidebar.recentReports.map((report: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      paddingBottom: idx < sidebar.recentReports.length - 1 ? (isMobile ? 12 : 16) : 0,
                      borderBottom: idx < sidebar.recentReports.length - 1 ? '1px solid #E2E8F0' : 'none'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: `clamp(13px, 1.8vw, 14px)`,
                          fontWeight: 500,
                          color: '#0F172A',
                          marginBottom: 4,
                          wordBreak: 'break-word'
                        }}
                      >
                        {report.title}
                      </div>
                      <div
                        style={{
                          fontSize: `clamp(11px, 1.5vw, 12px)`,
                          color: '#64748B'
                        }}
                      >
                        {report.generated} • {report.format}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduled Reports */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: isMobile ? '20px' : '24px',
                marginBottom: isMobile ? 20 : 24
              }}
            >
              <h3
                style={{
                  fontSize: `clamp(14px, 1.8vw, 16px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: isMobile ? 12 : 16,
                  marginLeft: 0
                }}
              >
                Scheduled Reports
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
                {sidebar.scheduledReports?.map((report: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      paddingBottom: idx < sidebar.scheduledReports.length - 1 ? (isMobile ? 12 : 16) : 0,
                      borderBottom: idx < sidebar.scheduledReports.length - 1 ? '1px solid #E2E8F0' : 'none'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: `clamp(13px, 1.8vw, 14px)`,
                          fontWeight: 500,
                          color: '#0F172A',
                          marginBottom: 4,
                          wordBreak: 'break-word'
                        }}
                      >
                        {report.title}
                      </div>
                      <div
                        style={{
                          fontSize: `clamp(11px, 1.5vw, 12px)`,
                          color: '#64748B'
                        }}
                      >
                        {report.frequency} • Next: {report.next_run}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteScheduled(report.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        color: '#EF4444'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setShowScheduleModal(true)}
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(14px, 2vw, 16px)`,
                    fontSize: `clamp(13px, 1.8vw, 14px)`,
                    fontWeight: 500,
                    color: '#1E3A5F',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 8,
                    boxSizing: 'border-box',
                    minWidth: 0
                  }}
                >
                  <Plus style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)`, flexShrink: 0 }} />
                  <span>Schedule New</span>
                </button>
              </div>
            </div>

            {/* Favorites */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: isMobile ? '20px' : '24px'
              }}
            >
              <h3
                style={{
                  fontSize: `clamp(14px, 1.8vw, 16px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: isMobile ? 12 : 16,
                  marginLeft: 0
                }}
              >
                Favorites
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 6 : 8, width: '100%', minWidth: 0 }}>
                {sidebar.favorites.map((favorite: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleGenerateReport(favorite.id)}
                    style={{
                      padding: `clamp(6px, 0.8vh, 8px) clamp(10px, 1.5vw, 12px)`,
                      fontSize: `clamp(12px, 1.6vw, 13px)`,
                      fontWeight: 500,
                      color: '#1E3A5F',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Star size={14} fill="#F59E0B" color="#F59E0B" />
                    {favorite.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Report Modal */}
      {showScheduleModal && (
        <div
          style={{
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
            padding: 20
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Schedule Report</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Report Type</label>
                <select
                  value={scheduleForm.type}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    fontSize: 14
                  }}
                >
                  <option value="">Select a report...</option>
                  <option value="financial_summary">Financial Summary</option>
                  <option value="investor_activity">Investor Activity</option>
                  <option value="property_performance">Property Performance</option>
                  <option value="workflow_efficiency">Workflow Efficiency</option>
                  <option value="tax_report">Annual Tax Report</option>
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Frequency</label>
                <select
                  value={scheduleForm.frequency}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    fontSize: 14
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Recipients (comma separated emails)</label>
                <input
                  type="text"
                  value={scheduleForm.recipients}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, recipients: e.target.value })}
                  placeholder="email1@example.com, email2@example.com"
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Date Range (Optional)</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="date"
                    value={scheduleForm.parameters.startDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, parameters: { ...scheduleForm.parameters, startDate: e.target.value } })}
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                  <input
                    type="date"
                    value={scheduleForm.parameters.endDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, parameters: { ...scheduleForm.parameters, endDate: e.target.value } })}
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Property (Optional)</label>
                <select
                  value={scheduleForm.parameters.propertyId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, parameters: { ...scheduleForm.parameters, propertyId: e.target.value } })}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select a property...</option>
                  {reportsData.properties?.map((prop: any) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#1E3A5F',
                    color: '#FFFFFF',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
