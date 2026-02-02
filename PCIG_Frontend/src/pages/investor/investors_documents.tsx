import { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  CloudDownload,
  BarChart3,
  Receipt,
  Shield,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  Building2
} from 'lucide-react';
import InvestorNav from '../../components/investor/InvestorNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

// Types
interface Document {
  id: number;
  type: string;
  title: string;
  file_path: string;
  year: number;
  generated_at: string;
  created_at: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

// Icon mapping for documents
const documentIconMap: { [key: string]: any } = {
  FileText,
  FileCheck: CheckCircle2,
  PieChart: BarChart3,
  Receipt,
  Building2: Building2,
  Shield
};

// Categories
const CATEGORIES = [
  'All Documents',
  'Tax Documents',
  'Legal Agreements',
  'Investment Reports',
  'K-1s',
  'Subscription Agreements'
];

export default function InvestorsDocuments({ showNav = true }: { showNav?: boolean }) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    new_this_month: 0,
    tax_forms: 0,
    legal_docs: 0
  });

  const [activeCategory, setActiveCategory] = useState<string>('All Documents');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'All Documents'
  });
  const [generatingReport, setGeneratingReport] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const response = await api.post('/investor/documents/report', {
        start_date: reportFilters.startDate,
        end_date: reportFilters.endDate,
        type: reportFilters.type
      }, {
        responseType: 'blob'
      });

      // Verify content type
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        const text = await response.data.text();
        const json = JSON.parse(text);
        throw new Error(json.message || 'Failed to generate report');
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `documents_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup with delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      setShowReportModal(false);
    } catch (err: any) {
      console.error('Report generation failed:', err);
      alert(`Failed to generate report: ${err.message || 'Please try again.'}`);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
      };

      if (activeCategory !== 'All Documents') {
        params.type = activeCategory;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await api.get('/investor/documents', { params });
      
      if (response.data.success) {
        setDocuments(response.data.data.data);
        setPagination({
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          total: response.data.data.total,
          per_page: response.data.data.per_page
        });
      } else {
        setError('Failed to load documents');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, activeCategory]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchDocuments();
      } else {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDownload = async (id: number, title: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      const response = await api.get(`/investor/documents/${id}/download`, {
        responseType: 'blob'
      });
      
      // Verify content type
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        const text = await response.data.text();
        const json = JSON.parse(text);
        throw new Error(json.message || 'Failed to download document');
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Extract extension from content-disposition or default to pdf/txt based on context if possible
      // For now, let's assume the backend provides the correct filename in Content-Disposition
      // If not, we might need to guess. The backend does set Content-Disposition.
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = title;
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup with delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (err: any) {
      console.error('Download failed:', err);
      alert(`Failed to download document: ${err.message || 'Please try again.'}`);
    }
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Client-side filtering removed in favor of server-side search
  const filteredDocuments = documents;

  // Calculate summary statistics (approximated from current view + pagination total)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const totalDocuments = pagination?.total || 0;
  
  const newThisMonth = documents.filter(doc => {
    const d = new Date(doc.generated_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  return (
    <>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        overflowX: 'hidden',
        maxWidth: '100vw',
        boxSizing: 'border-box'
      }}>
        {showNav && <InvestorNav />}

        <div style={{
          padding: isMobile ? `clamp(12px, 1.5vw, 16px)` : `clamp(16px, 2vw, 32px)`,
          maxWidth: '100%',
          boxSizing: 'border-box',
          width: '100%',
          overflowX: 'hidden'
        }}>
          {/* Page Header */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'flex-start',
            marginBottom: `clamp(16px, 2vh, 24px)`,
            flexWrap: 'wrap',
            gap: `clamp(12px, 1.5vw, 16px)`,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
              <h1 style={{
                fontSize: `clamp(20px, 2.5vw, 28px)`,
                fontWeight: 700,
                color: '#0F172A',
                marginTop: 0,
                marginLeft: 0,
                marginRight: 0,
                marginBottom: `clamp(6px, 0.8vh, 8px)`,
                lineHeight: 1.2
              }}>
                Documents
              </h1>
              <p style={{
                fontSize: `clamp(13px, 1.5vw, 14px)`,
                color: '#64748B',
                margin: 0,
                lineHeight: 1.5
              }}>
                Access and manage your investment documents
              </p>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              style={{
                padding: `clamp(8px, 1vh, 10px) clamp(14px, 1.8vw, 20px)`,
                fontSize: `clamp(12px, 1.3vw, 13px)`,
                fontWeight: 500,
                color: '#FFFFFF',
                backgroundColor: '#1E3A5F',
                border: 'none',
                borderRadius: `clamp(4px, 0.6vw, 6px)`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                width: isMobile ? '100%' : 'auto'
              }}>
              Generate Custom Report
            </button>
          </div>

          {/* Category Tabs */}
          <div
            className="category-tabs-scroll"
            style={{
              display: 'flex',
              gap: `clamp(8px, 1vw, 12px)`,
              marginBottom: `clamp(16px, 2vh, 24px)`,
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '4px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
            {CATEGORIES.map((category) => {
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  style={{
                    padding: `clamp(6px, 0.8vh, 8px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(12px, 1.3vw, 13px)`,
                    fontWeight: activeCategory === category ? 600 : 500,
                    color: activeCategory === category ? '#1E3A5F' : '#64748B',
                    backgroundColor: activeCategory === category ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    borderRadius: `clamp(4px, 0.6vw, 6px)`,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    borderBottom: activeCategory === category ? '2px solid #1E3A5F' : 'none',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: `clamp(6px, 0.8vw, 8px)`
                  }}
                >
                  <span>{category}</span>
                </button>
              );
            })}
          </div>

          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: `clamp(12px, 1.5vw, 16px)`,
            marginBottom: `clamp(16px, 2vh, 24px)`,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {[
              {
                title: 'Total Documents',
                value: stats.total.toString(),
                icon: FileText,
                color: '#3B82F6',
                bgColor: '#EFF6FF'
              },
              {
                title: 'New This Month',
                value: stats.new_this_month.toString(),
                icon: BarChart3,
                color: '#10B981',
                bgColor: '#ECFDF5'
              },
              {
                title: 'Tax Forms',
                value: stats.tax_forms.toString(), 
                icon: Receipt,
                color: '#F59E0B',
                bgColor: '#FFFBEB'
              },
              {
                title: 'Legal Docs',
                value: stats.legal_docs.toString(),
                icon: Shield,
                color: '#8B5CF6',
                bgColor: '#F5F3FF'
              }
            ].map((stat, index) => (
              <div key={index} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: `clamp(8px, 1vw, 12px)`,
                padding: `clamp(12px, 1.5vw, 16px)`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                border: '1px solid #F1F5F9'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: `clamp(8px, 1vh, 12px)`
                }}>
                  <div style={{
                    backgroundColor: stat.bgColor,
                    padding: `clamp(6px, 0.8vw, 8px)`,
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <stat.icon size={isMobile ? 16 : 20} color={stat.color} />
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: `clamp(20px, 2.5vw, 24px)`,
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: '4px',
                    lineHeight: 1.2
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: `clamp(11px, 1.2vw, 12px)`,
                    color: '#64748B',
                    fontWeight: 500
                  }}>
                    {stat.title}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters and Search */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            marginBottom: `clamp(16px, 2vh, 24px)`,
            gap: `clamp(12px, 1.5vw, 16px)`,
            backgroundColor: '#FFFFFF',
            padding: `clamp(12px, 1.5vw, 16px)`,
            borderRadius: `clamp(8px, 1vw, 12px)`,
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
             <div style={{
                position: 'relative',
                flex: isMobile ? '1 1 100%' : 1,
                minWidth: isMobile ? '100%' : '250px',
                width: isMobile ? '100%' : 'auto'
              }}>
                <Search style={{
                  position: 'absolute',
                  left: `clamp(12px, 1.5vw, 16px)`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: `clamp(16px, 2vw, 18px)`,
                  height: `clamp(16px, 2vw, 18px)`,
                  color: '#64748B',
                  pointerEvents: 'none'
                }} />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(10px, 1.2vh, 12px) clamp(10px, 1.2vh, 12px) clamp(40px, 5vw, 48px)`,
                    fontSize: `clamp(13px, 1.4vw, 14px)`,
                    border: '1px solid #E2E8F0',
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
          </div>

          {/* Document List */}
          {loading ? (
             <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
               <Loader2 className="animate-spin" size={32} color="#1E3A5F" />
             </div>
          ) : error ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#EF4444' }}>
              {error}
              <button onClick={fetchDocuments} style={{ marginLeft: '10px', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer', color: '#1E3A5F' }}>Retry</button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              No documents found.
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `clamp(10px, 1.2vw, 12px)`
            }}>
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: `clamp(8px, 1vw, 12px)`,
                    border: '1px solid #E2E8F0',
                    padding: `clamp(12px, 1.5vw, 16px)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: `clamp(12px, 1.5vw, 16px)`,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(12px, 1.5vw, 16px)`, flex: 1 }}>
                    <div style={{
                      backgroundColor: '#EFF6FF',
                      padding: `clamp(8px, 1vw, 10px)`,
                      borderRadius: `clamp(6px, 0.8vw, 8px)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FileText size={isMobile ? 20 : 24} color="#1E3A5F" />
                    </div>
                    <div>
                      <h4 style={{
                        margin: 0,
                        fontSize: `clamp(14px, 1.5vw, 16px)`,
                        fontWeight: 600,
                        color: '#0F172A',
                        marginBottom: '4px'
                      }}>
                        {doc.title}
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: `clamp(12px, 1.3vw, 13px)`,
                        color: '#64748B'
                      }}>
                        {doc.type} • {formatDate(doc.generated_at)}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDownload(doc.id, doc.title)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: `clamp(6px, 0.8vh, 8px) clamp(10px, 1.2vw, 12px)`,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: `clamp(4px, 0.6vw, 6px)`,
                      color: '#1E3A5F',
                      fontSize: `clamp(12px, 1.3vw, 13px)`,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Download size={isMobile ? 14 : 16} />
                    {!isMobile && <span>Download</span>}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: `clamp(8px, 1vw, 12px)`,
              marginTop: `clamp(20px, 2.5vh, 24px)`
            }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: `clamp(32px, 4vw, 36px)`,
                  height: `clamp(32px, 4vw, 36px)`,
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: currentPage === 1 ? '#94A3B8' : '#1E3A5F',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={16} />
              </button>
              
              <span style={{
                fontSize: `clamp(13px, 1.5vw, 14px)`,
                color: '#64748B',
                fontWeight: 500
              }}>
                Page {currentPage} of {pagination.last_page}
              </span>
              
              <button
                disabled={currentPage === pagination.last_page}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: `clamp(32px, 4vw, 36px)`,
                  height: `clamp(32px, 4vw, 36px)`,
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: currentPage === pagination.last_page ? '#94A3B8' : '#1E3A5F',
                  cursor: currentPage === pagination.last_page ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {showReportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <h2 style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#0F172A',
              marginTop: 0,
              marginBottom: 16
            }}>Generate Custom Report</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) => setReportFilters(prev => ({ ...prev, startDate: e.target.value }))}
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

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) => setReportFilters(prev => ({ ...prev, endDate: e.target.value }))}
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

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>
                  Document Type
                </label>
                <select
                  value={reportFilters.type}
                  onChange={(e) => setReportFilters(prev => ({ ...prev, type: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    fontSize: 14,
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => setShowReportModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
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
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: '#1E3A5F',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: generatingReport ? 'not-allowed' : 'pointer',
                    opacity: generatingReport ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  {generatingReport && <Loader2 className="animate-spin" size={16} />}
                  Generate CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
