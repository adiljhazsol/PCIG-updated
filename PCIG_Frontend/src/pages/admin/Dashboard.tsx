import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  Building2,
  Clock,
  Wrench,
  DollarSign,
  Gavel,
  TrendingUp,
  Calendar,
  FileWarning,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Plus,
  Filter,
  ArrowUpDown,
  ArrowRight,
  Circle,
  Users // Added Users icon just in case, though mapped to Circle in backend for safety
} from 'lucide-react';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import AdminNav from '../../components/admin/AdminNav';
import api from '../../services/api';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Building2,
  Clock,
  Wrench,
  DollarSign,
  Gavel,
  TrendingUp,
  Calendar,
  FileWarning,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Circle,
  Users
};

interface Alert {
  icon: string;
  color: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  count: string | number;
  message: string;
  action: string;
}

interface KeyMetric {
  icon: string;
  color: string;
  value: string;
  label: string;
  subtext: string;
}

interface WorkflowStage {
  value: string | number;
  label: string;
}

interface Deadline {
  property: string;
  type: string;
  date: string;
  days: string;
  color: string;
}

interface ActionItem {
  id?: string;
  status: string;
  days: string | number;
  property: string;
  propertyId?: string;
  type: string;
  action: string;
  deadline: string;
  assigned: string;
  priority: string;
  priorityColor: string;
  statusBg: string;
}

interface WorkflowAlert {
  icon: string;
  color: string;
  title: string;
  value: string;
  subtext: string;
}

interface Activity {
  icon: string;
  iconColor: string;
  text: string;
  time: string;
}

interface QuickStat {
  label: string;
  value: string;
}

interface DashboardData {
  header: {
    title: string;
    subtitle: string;
  };
  alerts: Alert[];
  keyMetrics: KeyMetric[];
  workflowPipeline: {
    title: string;
    action: string;
    stages: WorkflowStage[];
  };
  upcomingDeadlines: {
    title: string;
    action: string;
    deadlines: Deadline[];
  };
  actionItems: {
    title: string;
    subtitle: string;
    filterLabel: string;
    sortLabel: string;
    items: ActionItem[];
  };
  workflowAlerts: {
    title: string;
    subtitle: string;
    alerts: WorkflowAlert[];
  };
  recentActivity: {
    title: string;
    action: string;
    activities: Activity[];
  };
  quickStats: {
    title: string;
    stats: QuickStat[];
  };
}

export default function Dashboard() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const navigate = useNavigate();

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [sortType, setSortType] = useState('Default');

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/admin/dashboard-data');
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: '#64748B' }}>Loading Dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: '#EF4444' }}>Failed to load dashboard data. Please try again.</div>
      </div>
    );
  }

  // Extract data from State
  const header = dashboardData?.header || { title: '', subtitle: '' };
  const alerts = dashboardData?.alerts || [];
  const keyMetrics = dashboardData?.keyMetrics || [];
  const workflowPipeline = dashboardData?.workflowPipeline || { title: '', action: '', stages: [] };
  const upcomingDeadlines = dashboardData?.upcomingDeadlines || { title: '', action: '', deadlines: [] };
  const actionItems = dashboardData?.actionItems || { title: '', subtitle: '', filterLabel: '', sortLabel: '', items: [] };
  const workflowAlerts = dashboardData?.workflowAlerts || { title: '', subtitle: '', alerts: [] };
  const recentActivity = dashboardData?.recentActivity || { title: '', action: '', activities: [] };
  const quickStats = dashboardData?.quickStats || { title: '', stats: [] };

  // Filter and Sort Logic
  const filteredItems = actionItems.items ? actionItems.items.filter((item: ActionItem) => {
    if (filterType === 'All') return true;
    return item.status === filterType;
  }).sort((a: ActionItem, b: ActionItem) => {
    if (sortType === 'Deadline') {
      const daysA = typeof a.days === 'string' ? parseInt(a.days) : a.days || 0;
      const daysB = typeof b.days === 'string' ? parseInt(b.days) : b.days || 0;
      return daysA - daysB;
    }
    return 0;
  }) : [];

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100%', margin: 0, padding: 0, overflowX: 'hidden' }}>
      <style>{`
        @media (max-width: 639px) {
          /* Hide scrollbar for Chrome, Safari and Opera */
          .workflow-scroll::-webkit-scrollbar {
            display: none;
          }
          /* Hide scrollbar for IE, Edge and Firefox */
          .workflow-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }
      `}</style>
      <AdminNav />

      {/* Main Content */}
      <div style={{
        padding: `clamp(16px, 2vh, 24px) clamp(16px, 4vw, 48px)`,
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        maxWidth: '100vw'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: isMobileOrTablet ? 'flex-start' : 'center', justifyContent: 'space-between', marginBottom: `clamp(16px, 2vh, 24px)`, flexDirection: isMobileOrTablet ? 'column' : 'row', gap: `clamp(12px, 2vh, 16px)` }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: `clamp(20px, 2.5vw, 28px)`, fontWeight: 700, color: '#0F172A', marginBottom: `clamp(6px, 1vh, 8px)`, lineHeight: 1.2 }}>{header.title}</h1>
            <p style={{ fontSize: `clamp(11px, 1.2vw, 14px)`, color: '#64748B', lineHeight: 1.4 }}>{header.subtitle}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(8px, 1.5vw, 12px)`, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/admin/funds/create')}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                padding: `clamp(6px, 1vh, 8px) clamp(12px, 1.5vw, 16px)`,
                borderRadius: `clamp(4px, 0.5vw, 6px)`,
                border: '1px solid #E2E8F0',
                fontSize: `clamp(11px, 1.2vw, 14px)`,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(4px, 0.5vw, 6px)`,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                whiteSpace: 'nowrap'
              }}>
              <Plus style={{ width: `clamp(12px, 1.2vw, 16px)`, height: `clamp(12px, 1.2vw, 16px)` }} />
              {isMobile ? 'Fund' : 'Create Fund'}
            </button>
            <button
              onClick={() => navigate('/admin/properties/add')}
              style={{
                backgroundColor: '#1E3A5F',
                color: '#FFFFFF',
                padding: `clamp(6px, 1vh, 8px) clamp(12px, 1.5vw, 16px)`,
                borderRadius: `clamp(4px, 0.5vw, 6px)`,
                border: 'none',
                fontSize: `clamp(11px, 1.2vw, 14px)`,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(4px, 0.5vw, 6px)`,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                whiteSpace: 'nowrap'
              }}>
              <Plus style={{ width: `clamp(12px, 1.2vw, 16px)`, height: `clamp(12px, 1.2vw, 16px)` }} />
              {isMobile ? 'Property' : 'Add Property'}
            </button>
          </div>
        </div>

        {/* Alert Banners */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `clamp(8px, 1.2vw, 12px)`,
            marginBottom: `clamp(16px, 2vh, 24px)`,
            width: '100%',
          }}
        >
          {alerts.map((alert: Alert, idx: number) => {
            const AlertIcon = iconMap[alert.icon];
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: isMobile ? alert.color : alert.backgroundColor,
                  color: isMobile ? '#FFFFFF' : alert.textColor,
                  padding: isMobile
                    ? `clamp(12px, 1.5vh, 16px) clamp(14px, 2vw, 20px)`
                    : `10px clamp(16px, 2.2vw, 24px)`,
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  border: isMobile ? 'none' : `1px solid ${alert.borderColor}`,
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  justifyContent: 'space-between',
                  gap: `clamp(8px, 1.2vw, 12px)`,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: `clamp(8px, 1.2vw, 10px)`,
                    flex: 1,
                  }}
                >
                  <AlertIcon
                    style={{
                      width: `clamp(18px, 2vw, 20px)`,
                      height: `clamp(18px, 2vw, 20px)`,
                      flexShrink: 0,
                      color: isMobile ? '#FFFFFF' : alert.color,
                    }}
                  />
                  <span
                    style={{
                      fontSize: `clamp(12px, 1.2vw, 14px)`,
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{alert.count} items</span> {alert.message}
                  </span>
                </div>
                <button
                  style={{
                    backgroundColor: isMobile ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    color: isMobile ? '#FFFFFF' : alert.textColor,
                    padding: isMobile
                      ? `clamp(5px, 0.8vh, 6px) clamp(12px, 1.5vw, 16px)`
                      : '0',
                    borderRadius: isMobile ? `clamp(4px, 0.5vw, 6px)` : '0',
                    border: 'none',
                    fontSize: `clamp(12px, 1.2vw, 14px)`,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: `clamp(4px, 0.5vw, 6px)`,
                    whiteSpace: 'nowrap',
                    alignSelf: isMobile ? 'flex-start' : 'auto',
                  }}
                >
                  {alert.action}
                  <ArrowRight
                    style={{
                      width: `clamp(12px, 1.3vw, 14px)`,
                      height: `clamp(12px, 1.3vw, 14px)`,
                    }}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* Key Metrics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
          gap: `clamp(8px, 1.5vw, 16px)`,
          marginBottom: `clamp(16px, 2vh, 24px)`,
          width: '100%',
          gridAutoRows: '1fr'
        }}>
          {keyMetrics.map((metric: KeyMetric, idx: number) => {
            const MetricIcon = iconMap[metric.icon];
            return (
              <div key={idx} style={{
                backgroundColor: '#FFFFFF',
                padding: `clamp(12px, 1.5vw, 20px)`,
                borderRadius: `clamp(6px, 0.8vw, 8px)`,
                border: '1px solid #E2E8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                minWidth: 0,
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: `clamp(8px, 1.2vh, 12px)` }}>
                  <div style={{
                    width: `clamp(28px, 3.5vw, 40px)`,
                    height: `clamp(28px, 3.5vw, 40px)`,
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    backgroundColor: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <MetricIcon style={{ width: `clamp(14px, 1.8vw, 20px)`, height: `clamp(14px, 1.8vw, 20px)`, color: metric.color }} />
                  </div>
                </div>
                <div style={{ fontSize: `clamp(18px, 2.5vw, 24px)`, fontWeight: 700, color: '#0F172A', marginBottom: `clamp(3px, 0.5vh, 4px)`, lineHeight: 1.2 }}>{metric.value}</div>
                <div style={{ fontSize: `clamp(11px, 1.2vw, 13px)`, fontWeight: 500, color: '#64748B', marginBottom: `clamp(3px, 0.5vh, 4px)`, lineHeight: 1.3 }}>{metric.label}</div>
                <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B', lineHeight: 1.3 }}>{metric.subtext}</div>
              </div>
            );
          })}
        </div>

        {/* Workflow Pipeline + Upcoming Deadlines */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobileOrTablet ? 'column' : 'row',
            gap: `clamp(12px, 2vw, 24px)`,
            alignItems: 'stretch',
            width: '100%',
            marginBottom: `clamp(12px, 2vh, 24px)`
          }}
        >
          {/* Workflow Pipeline */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: `clamp(14px, 1.8vw, 20px)`,
              borderRadius: `clamp(6px, 0.8vw, 8px)`,
              border: '1px solid #E2E8F0',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden',
              flex: isMobileOrTablet ? '1 1 100%' : '2 1 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: `clamp(16px, 2vh, 20px)`, flexWrap: 'wrap', gap: `clamp(8px, 1vw, 12px)` }}>
              <h2 style={{ fontSize: `clamp(15px, 1.8vw, 18px)`, fontWeight: 600, color: '#0F172A', flexShrink: 0 }}>{workflowPipeline.title}</h2>
              <button style={{
                fontSize: `clamp(12px, 1.3vw, 14px)`,
                color: '#1E3A5F',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                padding: 0
              }}>
                <Link to="/admin/properties" style={{ textDecoration: 'none', color: 'inherit' }}>
                  {workflowPipeline.action}
                </Link>
              </button>
            </div>
            <div className="workflow-scroll" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMobile ? 'flex-start' : 'space-between',
              gap: `clamp(8px, 1.5vw, 16px)`,
              overflowX: 'auto',
              overflowY: 'hidden',
              paddingBottom: `clamp(6px, 1vh, 8px)`,
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: isMobile ? 'none' : 'thin',
              msOverflowStyle: isMobile ? 'none' : 'auto',
              scrollbarColor: '#CBD5E1 transparent'
            }}>
              {workflowPipeline.stages.map((stage: WorkflowStage, idx: number) => (
                <div key={idx} style={{
                  flexGrow: isMobile ? 0 : 1,
                  flexShrink: 0,
                  flexBasis: isMobile ? 'auto' : '0',
                  textAlign: 'center',
                  minWidth: isMobile ? `clamp(50px, 12vw, 70px)` : 'auto',
                  maxWidth: isMobile ? 'none' : '100%'
                }}>
                  <div style={{
                    width: `clamp(45px, 5vw, 60px)`,
                    height: `clamp(45px, 5vw, 60px)`,
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    border: `clamp(2px, 0.3vw, 3px) solid #1E3A5F`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: `0 auto clamp(6px, 1vh, 8px)`,
                    fontSize: `clamp(14px, 2vw, 20px)`,
                    fontWeight: 700,
                    color: '#1E3A5F',
                    flexShrink: 0
                  }}>
                    {stage.value}
                  </div>
                  <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B', fontWeight: 500, whiteSpace: 'nowrap' }}>{stage.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: `clamp(14px, 1.8vw, 20px)`,
              borderRadius: `clamp(6px, 0.8vw, 8px)`,
              border: '1px solid #E2E8F0',
              width: '100%',
              maxWidth: isMobileOrTablet ? '100%' : '360px',
              boxSizing: 'border-box',
              overflow: 'hidden',
              flex: isMobileOrTablet ? '1 1 100%' : '1 1 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: `clamp(16px, 2vh, 20px)`, flexWrap: 'wrap', gap: `clamp(6px, 1vw, 8px)` }}>
              <h2 style={{ fontSize: `clamp(15px, 1.8vw, 18px)`, fontWeight: 600, color: '#0F172A' }}>{upcomingDeadlines.title}</h2>
              <button style={{
                fontSize: `clamp(12px, 1.3vw, 14px)`,
                color: '#1E3A5F',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                padding: 0
              }}>
                <Link to="/admin/administration/calendar-deadline" style={{ textDecoration: 'none', color: 'inherit' }}>
                  {upcomingDeadlines.action}
                </Link>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `clamp(10px, 1.5vw, 12px)` }}>
              {upcomingDeadlines.deadlines.map((deadline: Deadline, idx: number) => (
                <div key={idx} style={{
                  padding: `clamp(10px, 1.3vw, 12px)`,
                  backgroundColor: '#F8FAFC',
                  borderRadius: `clamp(4px, 0.5vw, 6px)`,
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ fontSize: `clamp(12px, 1.3vw, 14px)`, fontWeight: 600, color: '#0F172A', marginBottom: `clamp(3px, 0.5vh, 4px)`, lineHeight: 1.3, wordBreak: 'break-word' }}>{deadline.property}</div>
                  <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B', marginBottom: `clamp(4px, 0.8vh, 6px)`, lineHeight: 1.3 }}>{deadline.type}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(6px, 1vw, 8px)` }}>
                    <span style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B' }}>{deadline.date}</span>
                    <span style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, fontWeight: 500, color: deadline.color }}>{deadline.days}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Items Table - full width */}
        <div style={{ backgroundColor: '#FFFFFF', padding: `clamp(14px, 1.8vw, 20px)`, borderRadius: `clamp(6px, 0.8vw, 8px)`, border: '1px solid #E2E8F0', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden', marginBottom: `clamp(12px, 2vh, 24px)` }}>
          <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', marginBottom: `clamp(16px, 2vh, 20px)`, flexDirection: isMobile ? 'column' : 'row', gap: `clamp(10px, 1.5vw, 12px)` }}>
            <div>
              <h2 style={{ fontSize: `clamp(15px, 1.8vw, 18px)`, fontWeight: 600, color: '#0F172A', marginBottom: `clamp(3px, 0.5vh, 4px)` }}>{actionItems.title}</h2>
              <p style={{ fontSize: `clamp(11px, 1.2vw, 13px)`, color: '#64748B' }}>{actionItems.subtitle}</p>
            </div>
            <div style={{ display: 'flex', gap: `clamp(6px, 1vw, 8px)`, flexWrap: 'wrap' }}>
              {/* Filter Dropdown */}
              <div ref={filterRef} style={{ position: 'relative' }}>
                <button 
                  onClick={() => setFilterOpen(!filterOpen)}
                  style={{
                    fontSize: `clamp(11px, 1.2vw, 13px)`,
                    color: filterType !== 'All' ? '#0F172A' : '#64748B',
                    backgroundColor: filterType !== 'All' ? '#E0F2FE' : '#F1F5F9',
                    padding: `clamp(5px, 0.8vh, 6px) clamp(10px, 1.3vw, 12px)`,
                    borderRadius: `clamp(4px, 0.5vw, 6px)`,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: `clamp(4px, 0.5vw, 6px)`,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Filter style={{ width: `clamp(12px, 1.3vw, 14px)`, height: `clamp(12px, 1.3vw, 14px)` }} />
                  {isMobile ? 'Filter' : (filterType !== 'All' ? filterType : actionItems.filterLabel)}
                </button>
                
                {filterOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 4,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 6,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    zIndex: 50,
                    minWidth: 160,
                    overflow: 'hidden'
                  }}>
                    <div 
                      onClick={() => { setFilterType('All'); setFilterOpen(false); }}
                      style={{ 
                        padding: '8px 12px', 
                        fontSize: 13, 
                        color: '#0F172A', 
                        cursor: 'pointer', 
                        backgroundColor: filterType === 'All' ? '#F1F5F9' : 'transparent', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = filterType === 'All' ? '#F1F5F9' : 'transparent'}
                    >
                      All Statuses
                      {filterType === 'All' && <CheckCircle2 size={14} color="#2563EB" />}
                    </div>
                    {Array.from(new Set(actionItems.items.map((i: ActionItem) => i.status))).map((status: string) => (
                      <div 
                        key={status}
                        onClick={() => { setFilterType(status); setFilterOpen(false); }}
                        style={{ 
                          padding: '8px 12px', 
                          fontSize: 13, 
                          color: '#0F172A', 
                          cursor: 'pointer', 
                          backgroundColor: filterType === status ? '#F1F5F9' : 'transparent', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = filterType === status ? '#F1F5F9' : 'transparent'}
                      >
                        {status}
                        {filterType === status && <CheckCircle2 size={14} color="#2563EB" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div ref={sortRef} style={{ position: 'relative' }}>
                <button 
                  onClick={() => setSortOpen(!sortOpen)}
                  style={{
                    fontSize: `clamp(11px, 1.2vw, 13px)`,
                    color: sortType !== 'Default' ? '#0F172A' : '#64748B',
                    backgroundColor: sortType !== 'Default' ? '#E0F2FE' : '#F1F5F9',
                    padding: `clamp(5px, 0.8vh, 6px) clamp(10px, 1.3vw, 12px)`,
                    borderRadius: `clamp(4px, 0.5vw, 6px)`,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: `clamp(4px, 0.5vw, 6px)`,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <ArrowUpDown style={{ width: `clamp(12px, 1.3vw, 14px)`, height: `clamp(12px, 1.3vw, 14px)` }} />
                  {isMobile ? 'Sort' : (sortType !== 'Default' ? sortType : actionItems.sortLabel)}
                </button>

                {sortOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 4,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 6,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    zIndex: 50,
                    minWidth: 160,
                    overflow: 'hidden'
                  }}>
                    {['Default', 'Deadline'].map((type) => (
                      <div 
                        key={type}
                        onClick={() => { setSortType(type); setSortOpen(false); }}
                        style={{ 
                          padding: '8px 12px', 
                          fontSize: 13, 
                          color: '#0F172A', 
                          cursor: 'pointer', 
                          backgroundColor: sortType === type ? '#F1F5F9' : 'transparent', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = sortType === type ? '#F1F5F9' : 'transparent'}
                      >
                        {type === 'Default' ? 'Default Sort' : `Sort by ${type}`}
                        {sortType === type && <CheckCircle2 size={14} color="#2563EB" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {isMobile ? (
            // Mobile: Card-based layout
            <div style={{ display: 'flex', flexDirection: 'column', gap: `clamp(10px, 1.5vw, 12px)` }}>
              {actionItems.items.map((row: ActionItem, idx: number) => (
                <div key={idx} style={{
                  padding: `clamp(10px, 1.5vw, 12px)`,
                  backgroundColor: '#F8FAFC',
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `clamp(6px, 1vw, 8px)`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(6px, 1vw, 8px)` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(4px, 0.5vw, 6px)` }}>
                      <Circle style={{ width: `clamp(7px, 0.8vw, 8px)`, height: `clamp(7px, 0.8vw, 8px)`, fill: row.priorityColor, color: row.priorityColor }} />
                      <span style={{ fontSize: `clamp(11px, 1.2vw, 12px)`, fontWeight: 600, color: row.priorityColor }}>{row.priority}</span>
                    </div>
                    <span style={{
                      fontSize: `clamp(10px, 1.1vw, 11px)`,
                      padding: `clamp(3px, 0.5vh, 4px) clamp(6px, 1vw, 8px)`,
                      borderRadius: `clamp(3px, 0.4vw, 4px)`,
                      backgroundColor: row.statusBg,
                      color: '#0F172A',
                      fontWeight: 500
                    }}>
                      {row.status}
                    </span>
                  </div>
                  <div style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, fontWeight: 600, color: '#0F172A' }}>{row.property}</div>
                  {row.propertyId && <div style={{ fontSize: `clamp(10px, 1.1vw, 11px)`, color: '#64748B' }}>{row.propertyId}</div>}
                  <div style={{ fontSize: `clamp(11px, 1.2vw, 12px)`, color: '#64748B' }}><strong>Type:</strong> {row.type}</div>
                  <div style={{ fontSize: `clamp(11px, 1.2vw, 12px)`, color: '#64748B' }}><strong>Action:</strong> {row.action}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: `clamp(6px, 1vw, 8px)`, marginTop: `clamp(3px, 0.5vh, 4px)` }}>
                    <div style={{ fontSize: `clamp(11px, 1.2vw, 12px)`, color: '#64748B' }}><strong>Deadline:</strong> {row.deadline} ({row.days})</div>
                    <div style={{ fontSize: `clamp(11px, 1.2vw, 12px)`, color: '#0F172A' }}><strong>Assigned:</strong> {row.assigned}</div>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/properties/${row.propertyId}`)}
                    style={{
                      marginTop: `clamp(6px, 1vh, 8px)`,
                      fontSize: `clamp(11px, 1.2vw, 13px)`,
                      color: '#1E3A5F',
                      backgroundColor: 'transparent',
                      border: '1px solid #1E3A5F',
                      borderRadius: `clamp(4px, 0.5vw, 6px)`,
                      padding: `clamp(6px, 1vh, 8px) clamp(10px, 1.3vw, 12px)`,
                      cursor: 'pointer',
                      fontWeight: 500,
                      alignSelf: 'flex-start'
                    }}>
                    {row.status === 'New' ? 'Assign' : row.status === 'In Progress' ? 'View' : 'Review'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            // Desktop/Tablet: Table layout
            <div style={{ overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    {['Priority', 'Type', 'Property', 'Action Required', 'Deadline', 'Assigned To', 'Status', 'Actions'].map((header) => (
                      <th key={header} style={{
                        padding: `clamp(8px, 1.2vw, 12px)`,
                        textAlign: 'left',
                        fontSize: `clamp(10px, 1.2vw, 12px)`,
                        fontWeight: 600,
                        color: '#64748B',
                        whiteSpace: 'nowrap'
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((row: ActionItem, idx: number) => {
                    const propertyDisplay = row.propertyId ? `${row.property} ${row.propertyId}` : row.property;
                    const deadlineDisplay = `${row.deadline} ${row.days}`;
                    return (
                      <tr key={idx} style={{ borderBottom: idx === filteredItems.length - 1 ? 'none' : '1px solid #E2E8F0' }}>
                        <td style={{ padding: `clamp(8px, 1.2vw, 12px)` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(4px, 0.5vw, 6px)` }}>
                            <Circle style={{ width: `clamp(7px, 0.8vw, 8px)`, height: `clamp(7px, 0.8vw, 8px)`, fill: row.priorityColor, color: row.priorityColor }} />
                            <span style={{ fontSize: `clamp(11px, 1.2vw, 13px)`, color: '#0F172A' }}>{row.priority}</span>
                          </div>
                        </td>
                        <td style={{ padding: `clamp(8px, 1.2vw, 12px)`, fontSize: `clamp(11px, 1.2vw, 13px)`, color: '#0F172A' }}>{row.type}</td>
                        <td style={{ padding: `clamp(8px, 1.2vw, 12px)`, fontSize: `clamp(11px, 1.2vw, 13px)`, color: '#0F172A', fontWeight: 500 }}>{propertyDisplay}</td>
                        <td style={{ padding: `clamp(8px, 1.2vw, 12px)`, fontSize: `clamp(11px, 1.2vw, 13px)`, color: '#64748B' }}>{row.action}</td>
                        <td style={{ padding: `clamp(8px, 1.2vw, 12px)`, fontSize: `clamp(11px, 1.2vw, 13px)`, color: '#64748B' }}>{deadlineDisplay}</td>
                        <td style={{ padding: `clamp(8px, 1.2vw, 12px)`, fontSize: `clamp(11px, 1.2vw, 13px)`, color: '#0F172A' }}>{row.assigned}</td>
                        <td style={{ padding: `clamp(8px, 1.2vw, 12px)` }}>
                          <span style={{
                            fontSize: `clamp(10px, 1.1vw, 12px)`,
                            padding: `clamp(3px, 0.5vh, 4px) clamp(6px, 1vw, 8px)`,
                            borderRadius: `clamp(3px, 0.4vw, 4px)`,
                            backgroundColor: row.statusBg,
                            color: '#0F172A',
                            fontWeight: 500
                          }}>
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: `clamp(8px, 1.2vw, 12px)` }}>
                          <button
                            onClick={() => navigate(`/admin/properties/${row.propertyId}`)}
                            style={{
                              fontSize: `clamp(11px, 1.2vw, 13px)`,
                              color: '#1E3A5F',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 500
                            }}>
                            {row.status === 'New' ? 'Assign' : row.status === 'In Progress' ? 'View' : 'Review'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Workflow Alerts - full width */}
        <div style={{ backgroundColor: '#FFFFFF', padding: `clamp(14px, 1.8vw, 20px)`, borderRadius: `clamp(6px, 0.8vw, 8px)`, border: '1px solid #E2E8F0', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden', marginBottom: `clamp(12px, 2vh, 24px)` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: `clamp(16px, 2vh, 20px)`, flexWrap: 'wrap', gap: `clamp(6px, 1vw, 8px)` }}>
            <h2 style={{ fontSize: `clamp(15px, 1.8vw, 18px)`, fontWeight: 600, color: '#0F172A' }}>{workflowAlerts.title}</h2>
            <span style={{ fontSize: `clamp(11px, 1.2vw, 13px)`, color: '#64748B' }}>{workflowAlerts.subtitle}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)', gap: `clamp(10px, 1.5vw, 16px)` }}>
            {workflowAlerts.alerts.map((alert: WorkflowAlert, idx: number) => {
              const AlertIcon = iconMap[alert.icon];
              return (
                <div key={idx} style={{
                  padding: `clamp(12px, 1.5vw, 16px)`,
                  backgroundColor: '#F8FAFC',
                  borderRadius: `clamp(4px, 0.5vw, 6px)`,
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(10px, 1.5vw, 12px)`, marginBottom: `clamp(10px, 1.5vw, 12px)`, flexWrap: 'wrap' }}>
                    <div style={{
                      width: `clamp(32px, 4vw, 40px)`,
                      height: `clamp(32px, 4vw, 40px)`,
                      borderRadius: `clamp(6px, 0.8vw, 8px)`,
                      backgroundColor: '#FEF2F2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <AlertIcon style={{ width: `clamp(16px, 2vw, 20px)`, height: `clamp(16px, 2vw, 20px)`, color: alert.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: `clamp(12px, 1.3vw, 14px)`, fontWeight: 600, color: '#0F172A', marginBottom: `clamp(1px, 0.3vh, 2px)`, lineHeight: 1.3 }}>{alert.title}</div>
                      <div style={{ fontSize: `clamp(16px, 2.2vw, 20px)`, fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>{alert.value}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B', marginBottom: `clamp(6px, 1vh, 8px)` }}>{alert.subtext}</div>
                  <button style={{
                    fontSize: `clamp(11px, 1.2vw, 13px)`,
                    color: '#1E3A5F',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: `clamp(3px, 0.5vw, 4px)`,
                    padding: 0
                  }}>
                    <Link
                      to={(() => {
                        const t = alert.title.toLowerCase();
                        if (t.includes('sheriff')) return '/admin/properties/sheriff-workflow';
                        if (t.includes('redemption')) return '/admin/properties/redemption-tracking';
                        if (t.includes('qt') || t.includes('quiet')) return '/admin/properties/quiet-title';
                        if (t.includes('barment')) return '/admin/properties/barment';
                        return '/admin/properties';
                      })()}
                      style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 'inherit' }}
                    >
                      View List <ArrowRight style={{ width: `clamp(10px, 1.2vw, 12px)`, height: `clamp(10px, 1.2vw, 12px)` }} />
                    </Link>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity + Quick Stats row */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobileOrTablet ? 'column' : 'row',
            gap: `clamp(12px, 2vw, 24px)`,
            alignItems: 'stretch',
            width: '100%'
          }}
        >
          {/* Recent Activity */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: `clamp(14px, 1.8vw, 20px)`,
            borderRadius: `clamp(6px, 0.8vw, 8px)`,
            border: '1px solid #E2E8F0',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            flex: isMobileOrTablet ? '1 1 100%' : '2 1 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: `clamp(16px, 2vh, 20px)`, flexWrap: 'wrap', gap: `clamp(6px, 1vw, 8px)` }}>
              <h2 style={{ fontSize: `clamp(15px, 1.8vw, 18px)`, fontWeight: 600, color: '#0F172A' }}>{recentActivity.title}</h2>
              <button style={{
                fontSize: `clamp(11px, 1.3vw, 14px)`,
                color: '#1E3A5F',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                padding: 0
              }}>
                <Link to="/admin/administration/audit-log" style={{ textDecoration: 'none', color: 'inherit' }}>
                  {recentActivity.action}
                </Link>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `clamp(10px, 1.5vw, 12px)` }}>
              {recentActivity.activities.map((activity: Activity, idx: number) => {
                const ActivityIcon = iconMap[activity.icon];
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: `clamp(10px, 1.5vw, 12px)`,
                    padding: `clamp(10px, 1.3vw, 12px)`,
                    backgroundColor: '#F8FAFC',
                    borderRadius: `clamp(4px, 0.5vw, 6px)`
                  }}>
                    <ActivityIcon style={{ width: `clamp(18px, 2.2vw, 20px)`, height: `clamp(18px, 2.2vw, 20px)`, color: activity.iconColor, marginTop: `clamp(1px, 0.3vh, 2px)`, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: `clamp(11px, 1.2vw, 13px)`, color: '#0F172A', marginBottom: `clamp(3px, 0.5vh, 4px)`, wordBreak: 'break-word' }}>{activity.text}</div>
                      <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B' }}>{activity.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats beside Recent Activity on desktop, stacked on mobile/tablet */}
          <div style={{
            width: '100%',
            maxWidth: isMobileOrTablet ? '100%' : '360px',
            minWidth: 0,
            flex: isMobileOrTablet ? '1 1 100%' : '1 1 0'
          }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: `clamp(14px, 1.8vw, 20px)`,
              borderRadius: `clamp(6px, 0.8vw, 8px)`,
              border: '1px solid #E2E8F0',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}>
              <h2 style={{ fontSize: `clamp(15px, 1.8vw, 18px)`, fontWeight: 600, color: '#0F172A', marginBottom: `clamp(16px, 2vh, 20px)` }}>{quickStats.title}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : '1fr', gap: `clamp(10px, 1.5vw, 16px)` }}>
                {quickStats.stats.map((stat: QuickStat, idx: number) => (
                  <div key={idx} style={{
                    padding: `clamp(10px, 1.3vw, 12px)`,
                    backgroundColor: '#F8FAFC',
                    borderRadius: `clamp(4px, 0.5vw, 6px)`,
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ fontSize: `clamp(10px, 1.1vw, 12px)`, color: '#64748B', marginBottom: `clamp(3px, 0.5vh, 4px)` }}>{stat.label}</div>
                    <div style={{ fontSize: `clamp(18px, 2.2vw, 20px)`, fontWeight: 700, color: '#0F172A' }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

