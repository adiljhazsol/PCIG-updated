import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  FileText,
  Inbox,
  UploadCloud,
  Search,
  Filter,
  ArrowUpDown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import AdminNav from '../../components/admin/AdminNav';
import api from '../../services/api';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  UploadCloud,
  Inbox,
  FileText
};

interface Header {
  title: string;
  subtitle: string;
}

interface LifecycleWorkflowStage {
  label: string;
  value: string;
  status: string;
  statusColor: string;
  bg: string;
}

interface LifecycleWorkflow {
  title: string;
  buttonText: string;
  stages: LifecycleWorkflowStage[];
}

interface StagePanelItem {
  label: string;
  value: string;
}

interface StagePanel {
  name: string;
}

interface ExportsLettersUploadsCard {
  title: string;
  value: string;
  icon: string;
}

interface PropertiesTableRow {
  id: string;
  address: string;
  stage: string;
  days: string;
  assigned: string;
  action: string;
  deadline: string;
}

interface PropertiesTable {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  headers: string[];
  rows: PropertiesTableRow[];
}

interface ActionItemsSummary {
  title: string;
  subtitle: string;
  buttonText: string;
  actionItems: string[];
}

interface WorkflowData {
  header: Header;
  workflowPath: string[];
  lifecycleWorkflow: LifecycleWorkflow;
  stagePanels: StagePanel[];
  stagePanelItems: StagePanelItem[];
  exportsLettersUploads: ExportsLettersUploadsCard[];
  propertiesTable: PropertiesTable;
  actionItemsSummary: ActionItemsSummary;
}

export default function PropertiesWorkflowHub() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const navigate = useNavigate();

  // State for Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStage, setFilterStage] = useState('All');
  const [page, setPage] = useState(1);
  const tableRef = useRef<HTMLDivElement>(null);

  // State for Data Fetching
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for Properties Table
  const [properties, setProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [pagination, setPagination] = useState<any>(null);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Properties List (Server-side Search/Filter/Paginate)
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoadingProperties(true);
        const params: any = {
          page: page,
          per_page: 20
        };

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        if (filterStage && filterStage !== 'All') {
            let stageValue = filterStage.toLowerCase().replace(/ /g, '_');
            // Map frontend filter labels to backend values if needed
            if (filterStage === 'Parcel Research') stageValue = 'research';
            if (filterStage === 'FIFA Processing') stageValue = 'fifa_processing';
            if (filterStage === 'Auction Research') stageValue = 'auction';
            if (filterStage === 'Redemption Tracking') stageValue = 'redemption';
            
            params.workflow_stage = stageValue;
        }

        const response = await api.get('/admin/properties', { params });
        
        if (response.data.success) {
          setProperties(response.data.data);
          setPagination(response.data.meta);
        }
      } catch (err) {
        console.error('Error fetching properties list:', err);
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, [debouncedSearch, filterStage, page]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/properties/workflow-hub');
        setWorkflowData(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching workflow data:', err);
        setError('Failed to load workflow data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading workflow data...</p>
        </div>
      </div>
    );
  }

  if (error || !workflowData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border border-slate-200">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Data</h3>
          <p className="text-slate-600 mb-6">{error || 'Something went wrong'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const header = workflowData?.header || { title: '', subtitle: '' };
  const workflowPath = workflowData?.workflowPath || [];
  const lifecycleWorkflow = workflowData?.lifecycleWorkflow || { title: '', buttonText: '', stages: [] };
  const stagePanels = workflowData?.stagePanels || [];
  const stagePanelItems = workflowData?.stagePanelItems || [];
  const exportsLettersUploads = workflowData?.exportsLettersUploads || [];
  const propertiesTable = workflowData?.propertiesTable || { title: '', subtitle: '', searchPlaceholder: '', headers: [], rows: [] };


  // NOTE: Layout is optimized for desktop; mobile/tablet will gracefully stack but
  // is not yet fully polished.

  return (
    <div
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        padding: 0,
        overflowX: 'hidden',
      }}
    >
      <AdminNav />

      {/* Main Content - desktop-focused, full width */}
      <div
        style={{
          padding: `clamp(16px, 2vh, 24px) clamp(16px, 4vw, 48px)`,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Page header */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobileOrTablet ? 'column' : 'row',
            alignItems: isMobileOrTablet ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            marginBottom: `clamp(16px, 2vh, 24px)`,
            gap: `clamp(12px, 2vh, 16px)`,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: `clamp(20px, 2.5vw, 28px)`,
                fontWeight: 700,
                color: '#0F172A',
                marginBottom: `clamp(4px, 0.5vh, 6px)`,
                lineHeight: 1.2,
              }}
            >
              {header.title}
            </h1>
            <p
              style={{
                fontSize: `clamp(11px, 1.2vw, 14px)`,
                color: '#64748B',
                lineHeight: 1.4,
              }}
            >
              {header.subtitle}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: `clamp(6px, 1vw, 8px)`,
              flexWrap: 'wrap',
              width: isMobileOrTablet ? '100%' : 'auto',
            }}
          >
            <button
              onClick={() => {
                setFilterStage('All');
                setPage(1);
                tableRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                fontSize: `clamp(11px, 1.2vw, 14px)`,
                color: '#64748B',
                backgroundColor: '#F1F5F9',
                padding: `clamp(6px, 1vh, 8px) clamp(12px, 1.5vw, 16px)`,
                borderRadius: `clamp(4px, 0.5vw, 6px)`,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              {isMobile ? 'View All' : 'View All Properties'}
            </button>
            <button
              onClick={() => navigate('/admin/properties/fifa-import/new')}
              style={{
                fontSize: `clamp(11px, 1.2vw, 14px)`,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                padding: `clamp(6px, 1vh, 8px) clamp(12px, 1.5vw, 16px)`,
                borderRadius: `clamp(4px, 0.5vw, 6px)`,
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(4px, 0.5vw, 6px)`,
                width: isMobile ? '100%' : 'auto',
              }}
            >
              <UploadCloud style={{ width: `clamp(12px, 1.2vw, 16px)`, height: `clamp(12px, 1.2vw, 16px)` }} />
              {isMobile ? 'Import FIFA' : 'Bulk Import FIFA'}
            </button>
            <button
              onClick={() => navigate('/admin/properties/add')}
              style={{
                fontSize: `clamp(11px, 1.2vw, 14px)`,
                color: '#FFFFFF',
                backgroundColor: '#1E3A5F',
                padding: `clamp(6px, 1vh, 8px) clamp(12px, 1.5vw, 16px)`,
                borderRadius: `clamp(4px, 0.5vw, 6px)`,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(4px, 0.5vw, 6px)`,
                width: isMobile ? '100%' : 'auto',
              }}
            >
              +
              {isMobile ? 'Add' : 'Add Property'}
            </button>
          </div>
        </div>

        {/* Property lifecycle workflow row */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: `clamp(6px, 0.8vw, 8px)`,
            border: '1px solid #E2E8F0',
            padding: `clamp(14px, 1.8vw, 20px)`,
            marginBottom: `clamp(12px, 2vw, 24px)`,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: `clamp(8px, 1.2vw, 12px)`,
              flexWrap: 'wrap',
              gap: `clamp(8px, 1vw, 12px)`,
            }}
          >
            <div
              style={{
                fontSize: `clamp(13px, 1.5vw, 15px)`,
                fontWeight: 600,
                color: '#0F172A',
                flexShrink: 0,
              }}
            >
              {lifecycleWorkflow.title}
            </div>
          </div>
          <div
            style={{
              fontSize: `clamp(11px, 1.2vw, 13px)`,
              color: '#64748B',
              marginBottom: `clamp(12px, 1.5vw, 16px)`,
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: `clamp(2px, 0.3vw, 4px)`,
              overflowX: isMobile ? 'auto' : 'visible',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {workflowPath.map((stage: string, idx: number) => (
              <React.Fragment key={idx}>
                <span>{stage}</span>
                {idx < workflowPath.length - 1 && (
                  <ChevronRight size={10} style={{ margin: '0 4px' }} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobileOrTablet ? `clamp(12px, 2vw, 16px)` : `clamp(16px, 3vw, 28px)`,
              overflowX: isMobileOrTablet ? 'auto' : 'hidden',
              overflowY: 'hidden',
              paddingBottom: `clamp(6px, 1vh, 8px)`,
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: isMobile ? 'thin' : 'auto',
            }}
          >
            {lifecycleWorkflow.stages.map((stage: LifecycleWorkflowStage, index: number) => (
          <div
            key={`${stage.label}-${index}`}
                style={{
                  backgroundColor: stage.bg,
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  border: '1px solid #E2E8F0',
                  padding: `clamp(10px, 1.3vw, 14px)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: `clamp(5px, 0.8vh, 7px)`,
                  minWidth: isMobileOrTablet ? `clamp(140px, 40vw, 180px)` : `clamp(130px, 16vw, 180px)`,
                  flex: isMobileOrTablet ? '0 0 auto' : '1 1 0',
                  flexShrink: 0,
                  textAlign: 'center',
                  maxWidth: isMobileOrTablet ? 'none' : '100%',
                }}
              >
                <div
                  style={{
                    fontSize: `clamp(13px, 1.5vw, 15px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                  }}
                >
                  {stage.label}
                </div>
                <div
                  style={{
                    fontSize: `clamp(12px, 1.3vw, 14px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                  }}
                >
                  {stage.value}
                </div>
                <div
                  style={{
                    fontSize: `clamp(10px, 1.1vw, 12px)`,
                    color: stage.statusColor,
                    fontWeight: 500,
                  }}
                >
                  {stage.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage panels grid (2 columns) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            gap: `clamp(12px, 2vw, 24px)`,
            marginBottom: `clamp(12px, 2vw, 24px)`,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Stage Panels */}
          {stagePanels.filter((p: StagePanel) => p.name !== 'Tax Appeal').map((stagePanel: StagePanel, idx: number) => {
            // Calculate dynamic count based on actual table rows
            const dynamicCount = propertiesTable.rows.filter((r: PropertiesTableRow) => r.stage === stagePanel.name).length;
            return (
              <div
                key={`${stagePanel.name}-${idx}`}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  border: '1px solid #E2E8F0',
                  padding: `clamp(14px, 1.8vw, 20px)`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `clamp(10px, 1.5vw, 12px)`,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: `clamp(10px, 1.1vw, 11px)`,
                        color: '#64748B',
                        marginBottom: `clamp(2px, 0.3vh, 3px)`,
                        lineHeight: 1.3,
                      }}
                    >
                      {dynamicCount} items
                    </div>
                    <div
                      style={{
                        fontSize: `clamp(12px, 1.3vw, 13px)`,
                        fontWeight: 600,
                        color: '#16A34A',
                        lineHeight: 1.3,
                        wordBreak: 'break-word',
                      }}
                    >
                      {stagePanel.name}
                    </div>
                  </div>
                  <Search
                    style={{
                      width: `clamp(14px, 1.5vw, 16px)`,
                      height: `clamp(14px, 1.5vw, 16px)`,
                      color: '#94A3B8',
                      flexShrink: 0,
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `clamp(2px, 0.3vh, 3px)`,
                    fontSize: `clamp(10px, 1.1vw, 11px)`,
                    color: '#64748B',
                  }}
                >
                  {stagePanelItems.map((item: StagePanelItem, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: `clamp(8px, 1vw, 12px)`,
                        alignItems: 'center',
                        padding: `clamp(6px, 0.8vh, 8px) clamp(8px, 1vw, 10px)`,
                        borderRadius: `clamp(3px, 0.4vw, 4px)`,
                        backgroundColor: idx % 2 === 0 ? '#F8FAFC' : 'transparent',
                        lineHeight: 1.3,
                      }}
                    >
                      <div style={{ minWidth: 0, wordBreak: 'break-word' }}>{item.label}</div>
                      <div style={{ textAlign: 'right', fontWeight: 500, flexShrink: 0 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <button
                  style={{
                    marginTop: `clamp(6px, 1vh, 8px)`,
                    width: '100%',
                    backgroundColor: '#1E3A5F',
                    color: '#FFFFFF',
                    borderRadius: `clamp(4px, 0.5vw, 6px)`,
                    padding: `clamp(8px, 1.2vh, 10px) clamp(12px, 1.5vw, 16px)`,
                    border: 'none',
                    fontSize: `clamp(11px, 1.2vw, 13px)`,
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    textDecoration: 'none',
                    display: 'block',
                    textAlign: 'center'
                  }}
                >
                  <Link
                    to={(() => {
                      const name = stagePanel.name.toLowerCase();
                      if (name.includes('research')) return '/admin/properties/parcel-research';
                      if (name.includes('fifa')) return '/admin/properties/fifa-processing';
                      if (name.includes('auction')) return '/admin/properties/auction';
                      if (name.includes('redemption')) return '/admin/properties/redemption-tracking';
                      if (name.includes('barment')) return '/admin/properties/barment';
                      if (name.includes('quiet')) return '/admin/properties/quiet-title';
                      if (name.includes('reo')) return '/admin/properties/reo-disposition';
                      if (name.includes('surplus')) return '/admin/operations/surplus-funds-research';
                      return '/admin/properties';
                    })()}
                    style={{ color: 'inherit', textDecoration: 'none', display: 'block', width: '100%', height: '100%' }}
                  >
                    View {stagePanel.name} Module
                  </Link>
                </button>
              </div>
            );
          })}
        </div>

        {/* Exports / Letters / Uploads row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))',
            gap: `clamp(12px, 2vw, 24px)`,
            marginBottom: `clamp(12px, 2vw, 24px)`,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {exportsLettersUploads.map((card: ExportsLettersUploadsCard) => {
            const CardIcon = iconMap[card.icon];
            return (
              <div
                key={card.title}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  border: '1px solid #E2E8F0',
                  padding: `clamp(14px, 1.8vw, 20px)`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `clamp(6px, 1vh, 8px)`,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: `clamp(4px, 0.5vh, 6px)`,
                    flexWrap: 'wrap',
                    gap: `clamp(4px, 0.5vw, 6px)`,
                  }}
                >
                  <div
                    style={{
                      fontSize: `clamp(10px, 1.1vw, 11px)`,
                      color: '#64748B',
                      lineHeight: 1.3,
                      flexGrow: 1,
                      flexShrink: 1,
                      flexBasis: 0,
                      minWidth: 0,
                    }}
                  >
                    {card.title}
                  </div>
                  {CardIcon && React.createElement(CardIcon, {
                    style: {
                      width: `clamp(14px, 1.5vw, 16px)`,
                      height: `clamp(14px, 1.5vw, 16px)`,
                      color: '#64748B',
                      flexShrink: 0,
                    }
                  })}
                </div>
                <div
                  style={{
                    fontSize: `clamp(12px, 1.3vw, 13px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                    lineHeight: 1.2,
                    marginBottom: `clamp(4px, 0.5vh, 6px)`,
                  }}
                >
                  {card.value}
                </div>
                <button
                  onClick={() => {
                    if (card.title === 'Sheriff Exports') navigate('/admin/administration/reports-center');
                    if (card.title === 'Notice Letters') navigate('/admin/operations/notice-letters');
                    if (card.title === 'Document Uploads') navigate('/admin/administration/import-center');
                  }}
                  style={{
                    marginTop: `clamp(4px, 0.5vh, 6px)`,
                    fontSize: `clamp(11px, 1.2vw, 13px)`,
                    color: '#1E3A5F',
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: `clamp(4px, 0.5vw, 6px)`,
                    cursor: 'pointer',
                    fontWeight: 500,
                    alignSelf: 'flex-start',
                  }}
                >
                  View Details
                  <ArrowRight style={{ width: `clamp(12px, 1.3vw, 14px)`, height: `clamp(12px, 1.3vw, 14px)` }} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Properties by Workflow Stage table */}
        <div
          ref={tableRef}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: `clamp(6px, 0.8vw, 8px)`,
            border: '1px solid #E2E8F0',
            padding: `clamp(14px, 1.8vw, 20px)`,
            marginBottom: `clamp(12px, 2vw, 24px)`,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              marginBottom: `clamp(12px, 1.5vw, 16px)`,
              gap: `clamp(12px, 1.5vw, 16px)`,
            }}
          >
            <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
              <div
                style={{
                  fontSize: `clamp(13px, 1.5vw, 15px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: `clamp(3px, 0.5vh, 4px)`,
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                }}
              >
                {propertiesTable.title}
              </div>
              <div
                style={{
                  fontSize: `clamp(11px, 1.2vw, 13px)`,
                  color: '#64748B',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                }}
              >
                {propertiesTable.subtitle}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(6px, 1vw, 8px)`,
                flexWrap: 'wrap',
                width: isMobile ? '100%' : 'auto',
                flexShrink: 0,
              }}
            >
              <button
                style={{
                  fontSize: `clamp(11px, 1.2vw, 13px)`,
                  color: '#64748B',
                  backgroundColor: '#F1F5F9',
                  padding: `clamp(5px, 0.8vh, 6px) clamp(10px, 1.3vw, 12px)`,
                  borderRadius: `clamp(4px, 0.5vw, 6px)`,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: `clamp(4px, 0.5vw, 6px)`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  minWidth: 0,
                }}
              >
                <Filter style={{
                  width: `clamp(12px, 1.3vw, 14px)`,
                  height: `clamp(12px, 1.3vw, 14px)`,
                  flexShrink: 0,
                }} />
                {/* Simple dropdown for filter mockup since we don't have a UI library */}
                <select
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontWeight: 500,
                    color: '#64748B',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  value={filterStage}
                  onChange={(e) => {
                    setFilterStage(e.target.value);
                    setPage(1);
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="All">All Stages</option>
                  <option value="Parcel Research">Parcel Research</option>
                  <option value="FIFA Processing">FIFA Processing</option>
                  <option value="Auction Research">Auction Research</option>
                  <option value="Redemption Tracking">Redemption Tracking</option>
                  <option value="Barment">Barment</option>
                  <option value="Quiet Title">Quiet Title</option>
                  <option value="REO Disposition">REO Disposition</option>
                </select>
              </button>
              <div
                style={{
                  position: 'relative',
                  width: isMobile ? '100%' : `clamp(160px, 20vw, 180px)`,
                  fontSize: `clamp(11px, 1.2vw, 13px)`,
                  color: '#64748B',
                  flex: isMobile ? '1 1 100%' : '0 0 auto',
                  minWidth: 0,
                  flexShrink: isMobile ? 1 : 0,
                }}
              >
                <Search
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: `clamp(8px, 1vw, 10px)`,
                    transform: 'translateY(-50%)',
                    width: `clamp(14px, 1.5vw, 16px)`,
                    height: `clamp(14px, 1.5vw, 16px)`,
                    color: '#94A3B8',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  placeholder={propertiesTable.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `clamp(6px, 1vh, 8px) clamp(8px, 1vw, 10px) clamp(6px, 1vh, 8px) clamp(26px, 3vw, 32px)`,
                    borderRadius: `clamp(4px, 0.5vw, 6px)`,
                    border: '1px solid #E2E8F0',
                    fontSize: `clamp(11px, 1.2vw, 13px)`,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            width: '100%',
          }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: `clamp(11px, 1.2vw, 13px)`,
                minWidth: isMobile ? '600px' : 'auto',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                  }}
                >
                  {propertiesTable.headers.map((header: string) => (
                    <th
                      key={header}
                      style={{
                        textAlign: 'left',
                        padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                        fontWeight: 600,
                        color: '#64748B',
                        whiteSpace: 'nowrap',
                        fontSize: `clamp(10px, 1.2vw, 12px)`,
                        minWidth: header === 'Property Address' || header === 'Next Action' ? `clamp(120px, 15vw, 180px)` : 'auto',
                      }}
                    >
                      {header === 'Deadline' ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: `clamp(4px, 0.5vw, 6px)`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span>{header}</span>
                          <ArrowUpDown style={{
                            width: `clamp(12px, 1.3vw, 14px)`,
                            height: `clamp(12px, 1.3vw, 14px)`,
                            flexShrink: 0,
                          }} />
                        </span>
                      ) : (
                        header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingProperties ? (
                  <tr>
                    <td colSpan={propertiesTable.headers.length} style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin h-4 w-4" /> Loading properties...
                      </div>
                    </td>
                  </tr>
                ) : properties.length === 0 ? (
                  <tr>
                    <td colSpan={propertiesTable.headers.length} style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>
                      No properties found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  properties.map((row: any) => {
                    // Normalize data from API (Resource) vs propertiesTable.rows
                    // The API returns PropertyResource structure
                    const id = row.parcel_id || `PROP-${row.id}`;
                    const stage = row.workflow_stage ? row.workflow_stage.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Unassigned';
                    
                    return (
                      <tr
                        key={row.id}
                        onClick={() => navigate(`/admin/properties/${row.id}`)}
                        style={{
                          borderBottom: '1px solid #E2E8F0',
                          cursor: 'pointer',
                          transition: 'background-color 0.1s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={{
                          padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                          whiteSpace: 'nowrap',
                          fontSize: `clamp(11px, 1.2vw, 13px)`,
                        }}>
                          {id}
                        </td>
                        <td style={{
                          padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                          fontSize: `clamp(11px, 1.2vw, 13px)`,
                          wordBreak: 'break-word',
                        }}>{row.address}</td>
                        <td style={{
                          padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                          whiteSpace: 'nowrap',
                          fontSize: `clamp(11px, 1.2vw, 13px)`,
                        }}>
                          {stage}
                        </td>
                        <td style={{
                          padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                          whiteSpace: 'nowrap',
                          fontSize: `clamp(11px, 1.2vw, 13px)`,
                        }}>
                          {row.days_in_stage || '0 days'}
                        </td>
                        <td style={{
                          padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                          whiteSpace: 'nowrap',
                          fontSize: `clamp(11px, 1.2vw, 13px)`,
                        }}>
                          {row.assigned_to || 'Unassigned'}
                        </td>
                        <td style={{
                          padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                          fontSize: `clamp(11px, 1.2vw, 13px)`,
                          wordBreak: 'break-word',
                        }}>{'View'}</td>
                        <td style={{
                          padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                          whiteSpace: 'nowrap',
                          fontSize: `clamp(11px, 1.2vw, 13px)`,
                        }}>
                          {/* Mock deadline or from API */}
                          Oct 24, 2025
                        </td>
                        <td style={{
                          padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                          whiteSpace: 'nowrap',
                        }}>
                          <button
                            style={{
                              fontSize: `clamp(11px, 1.2vw, 13px)`,
                              color: '#1E3A5F',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              fontWeight: 500,
                            }}
                          >
                            <Link
                              to={`/admin/properties/${row.id}`}
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              {isMobile ? 'View' : 'View Property'}
                            </Link>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.last_page > 1 && (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderTop: '1px solid #E2E8F0',
                    marginTop: 12
                }}
            >
                <div style={{ fontSize: 13, color: '#64748B' }}>
                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        disabled={pagination.current_page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: '1px solid #E2E8F0',
                            backgroundColor: pagination.current_page === 1 ? '#F1F5F9' : '#FFFFFF',
                            color: pagination.current_page === 1 ? '#94A3B8' : '#475569',
                            cursor: pagination.current_page === 1 ? 'not-allowed' : 'pointer',
                            fontSize: 13
                        }}
                    >
                        <ChevronLeft size={14} /> Previous
                    </button>
                    <button
                        disabled={pagination.current_page === pagination.last_page}
                        onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: '1px solid #E2E8F0',
                            backgroundColor: pagination.current_page === pagination.last_page ? '#F1F5F9' : '#FFFFFF',
                            color: pagination.current_page === pagination.last_page ? '#94A3B8' : '#475569',
                            cursor: pagination.current_page === pagination.last_page ? 'not-allowed' : 'pointer',
                            fontSize: 13
                        }}
                    >
                        Next <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                    </button>
                </div>
            </div>
          )}
        </div>


      </div>
    </div >
  );
}



