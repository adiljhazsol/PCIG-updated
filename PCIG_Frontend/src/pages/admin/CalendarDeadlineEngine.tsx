import { CSSProperties, useState, useEffect } from 'react';
import {
  Download,
  Plus,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Trash2
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import api from '../../services/api';
import adminData from '../../data/admin.json';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Download,
  Plus,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle2
};

export default function CalendarDeadlineEngine() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedView, setSelectedView] = useState<string>('Calendar');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('All Workflows');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    type: 'filing',
    deadline_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [selectedDeadline, setSelectedDeadline] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    type: '',
    deadline_date: '',
    description: '',
    status: ''
  });

  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  useEffect(() => {
    fetchDashboardData();
  }, [currentDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const dateStr = currentDate.toISOString().split('T')[0];
      const response = await api.get(`/admin/deadlines/dashboard-data?date=${dateStr}`);
      if (response.data.success) {
        setDashboardData(response.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeadlineClick = (deadline: any) => {
    // Find full event data if possible
    const fullEvent = dashboardData?.calendarEvents?.find((e: any) => e.id === deadline.id) 
                      || dashboardData?.upcomingDeadlines?.find((e: any) => e.id === deadline.id)
                      || deadline;

    setSelectedDeadline(fullEvent);
    setEditForm({
      type: fullEvent.type || 'filing',
      deadline_date: fullEvent.deadline_date ? fullEvent.deadline_date.split('T')[0] : '',
      description: fullEvent.description || fullEvent.task_name || '',
      status: fullEvent.status || 'pending'
    });
    setIsEditing(false);
    setIsEditModalOpen(true);
  };

  const handleUpdateDeadline = async () => {
    if (!selectedDeadline) return;
    try {
      setLoading(true);
      await api.put(`/admin/deadlines/${selectedDeadline.id}`, editForm);
      setIsEditModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating deadline:', err);
      alert('Failed to update deadline');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedDeadline) return;
    try {
      setLoading(true);
      await api.put(`/admin/deadlines/${selectedDeadline.id}`, { status });
      setIsEditModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating deadline:', err);
      alert('Failed to update deadline');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeadline = async () => {
    if (!selectedDeadline || !window.confirm('Are you sure you want to delete this deadline?')) return;
    try {
      setLoading(true);
      await api.delete(`/admin/deadlines/${selectedDeadline.id}`);
      setIsEditModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting deadline:', err);
      alert('Failed to delete deadline');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const handleSaveDeadline = async () => {
    if (!newDeadline.deadline_date || !newDeadline.description) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      await api.post('/admin/deadlines', {
        ...newDeadline,
        status: 'pending'
      });
      setIsAddModalOpen(false);
      setNewDeadline({ type: 'filing', deadline_date: new Date().toISOString().split('T')[0], description: '' });
      fetchDashboardData();
    } catch (err) {
      console.error('Error creating deadline:', err);
      alert('Failed to create deadline');
    } finally {
      setLoading(false);
    }
  };

  // Static data fallbacks
  const staticData = adminData?.calendarDeadlineEngine || {};
  
  const header = staticData?.header || {
    title: 'Calendar & Deadline Engine',
    subtitle: 'Manage critical dates and deadlines',
    stats: []
  };

  const actionButtons = staticData?.actionButtons || {
    export: { label: 'Export', icon: 'Download' },
    addManual: { label: 'Add Manual', icon: 'Plus' }
  };

  const leftSidebar = staticData?.leftSidebar || {
    views: { label: 'Views', options: ['Calendar', 'List', 'Timeline'], selected: 'Calendar' },
    workflows: { label: 'Workflows', options: ['All Workflows', 'Tax Sale', 'Foreclosure'], selected: 'All Workflows' },
    deadlineType: { label: 'Deadline Type', value: 'All Types' },
    dateRange: { label: 'Date Range', value: currentDate.toLocaleString('default', { month: 'short', year: 'numeric' }) },
    county: { label: 'County', value: 'All Counties' },
    legend: { 
      label: 'Legend', 
      items: [
        { label: 'Completed', color: '#10B981' },
        { label: 'Pending', color: '#F59E0B' },
        { label: 'Overdue', color: '#EF4444' }
      ] 
    },
    upcomingDeadlines: []
  };

  // Use API data if available
  const summaryCards = dashboardData?.summaryCards || [];
  const upcomingDeadlines = dashboardData?.upcomingDeadlines || [];

  // Create a map of deadlines by date for quick lookup
  const deadlinesByDate = new Map<number, any[]>();
  
  if (dashboardData?.calendarEvents) {
    dashboardData.calendarEvents.forEach((event: any) => {
      const dateStr = event.deadline_date.split('T')[0];
      const [y, m, d] = dateStr.split('-').map(Number);
      
      if (y === currentDate.getFullYear() && m - 1 === currentDate.getMonth()) {
        const existing = deadlinesByDate.get(d) || [];
        
        // Determine colors based on status and date
        let bg = '#FFFBEB';
        let color = '#F59E0B';
        const eventDate = new Date(event.deadline_date);
        const now = new Date();
        
        if (event.status === 'completed') {
           bg = '#ECFDF5';
           color = '#10B981';
        } else if (eventDate < now && eventDate.getDate() !== now.getDate()) { // Overdue if strictly past
           bg = '#FEF2F2';
           color = '#EF4444';
        }

        existing.push({
          id: event.id,
          title: event.property ? `${event.property.address} - ${event.task_name}` : event.task_name,
          type: event.task_name || 'Deadline', // Displayed text in calendar cell
          status: event.status,
          bg,
          color,
          time: 'Due Day'
        });
        deadlinesByDate.set(d, existing);
      }
    });
  }

  // Generate calendar grid dynamically based on currentDate
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  
  const weeks: Array<Array<{ date: number | null; isCurrentMonth: boolean; deadlines: any[] }>> = [];
  let currentWeek: Array<{ date: number | null; isCurrentMonth: boolean; deadlines: any[] }> = [];
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    currentWeek.push({ date: null, isCurrentMonth: false, deadlines: [] });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    currentWeek.push({
      date: i,
      isCurrentMonth: true,
      deadlines: deadlinesByDate.get(i) || []
    });
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  while (currentWeek.length < 7 && currentWeek.length > 0) {
    currentWeek.push({ date: null, isCurrentMonth: false, deadlines: [] });
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const calendar = {
   month: currentDate.toLocaleString('default', { month: 'long' }),
   year: currentDate.getFullYear(),
   daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
   footerText: staticData?.calendar?.footerText || 'Showing deadlines for current month',
   viewAsListLink: staticData?.calendar?.viewAsListLink || 'View as List'
  };

  const rightSidebar = {
   title: staticData?.rightSidebar?.title || 'Upcoming Deadlines',
   filter: staticData?.rightSidebar?.filter || 'All Types',
   deadlines: upcomingDeadlines.map((d: any) => ({
     id: d.id,
     status: d.status,
     description: d.description,
     barColor: d.status === 'completed' ? '#10B981' : new Date(d.deadline_date) < new Date() ? '#EF4444' : '#F59E0B',
     type: d.type,
     propertyId: d.property_id ? `Prop #${d.property_id}` : 'General',
     property: d.property?.address || 'No Address',
     county: d.property?.county,
     dueIn: d.deadline_date ? new Date(d.deadline_date).toLocaleDateString() : 'N/A',
     link: 'View'
   }))
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
    padding: 20
  };

  const ExportIcon = iconMap[actionButtons.export?.icon] || Download;
  const AddManualIcon = iconMap[actionButtons.addManual?.icon] || Plus;

  if (loading) {
    return (
      <div style={{ ...pageWrapperStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AdminNav />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <Loader2 className="animate-spin" size={48} color="#2563EB" />
          <p style={{ color: '#64748B', fontSize: 16 }}>Loading calendar data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...pageWrapperStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AdminNav />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <AlertCircle size={48} color="#EF4444" />
          <p style={{ color: '#EF4444', fontSize: 16 }}>{error}</p>
          <button 
            onClick={fetchDashboardData}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrapperStyle}>
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
        {/* Main Layout: 3 columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '280px 1.6fr 320px',
            gap: isMobileOrTablet ? 16 : 24,
            alignItems: 'start',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0
          }}
        >
          {/* Left Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobileOrTablet ? 16 : 24, minWidth: 0 }}>
            {/* Views */}
            <div style={cardStyle}>
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
                {leftSidebar.views.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {leftSidebar.views.options.map((view: string) => (
                  <button
                    key={view}
                    onClick={() => setSelectedView(view)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: selectedView === view ? '#2563EB' : 'transparent',
                      color: selectedView === view ? '#FFFFFF' : '#64748B',
                      fontSize: 14,
                      fontWeight: selectedView === view ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>

            {/* Workflows */}
            <div style={cardStyle}>
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
                {leftSidebar.workflows.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {leftSidebar.workflows.options.map((workflow: string) => (
                  <button
                    key={workflow}
                    onClick={() => setSelectedWorkflow(workflow)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: selectedWorkflow === workflow ? '#2563EB' : 'transparent',
                      color: selectedWorkflow === workflow ? '#FFFFFF' : '#64748B',
                      fontSize: 14,
                      fontWeight: selectedWorkflow === workflow ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    {workflow}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline Type */}
            <div style={cardStyle}>
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
                {leftSidebar.deadlineType.label}
              </div>
              <input
                type="text"
                value={leftSidebar.deadlineType.value}
                readOnly
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F9FAFB',
                  fontSize: 14,
                  color: '#0F172A',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Date Range */}
            <div style={cardStyle}>
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
                {leftSidebar.dateRange.label}
              </div>
              <input
                type="text"
                value={leftSidebar.dateRange.value}
                readOnly
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F9FAFB',
                  fontSize: 14,
                  color: '#0F172A',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* County */}
            <div style={cardStyle}>
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
                {leftSidebar.county.label}
              </div>
              <input
                type="text"
                value={leftSidebar.county.value}
                readOnly
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F9FAFB',
                  fontSize: 14,
                  color: '#0F172A',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Legend */}
            <div style={cardStyle}>
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
                {leftSidebar.legend.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {leftSidebar.legend.items.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: item.color,
                        flexShrink: 0
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: '#64748B'
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobileOrTablet ? 16 : 24, minWidth: 0 }}>
            {/* Header */}
            <div>
              <h1
                style={{
                  fontSize: isMobile ? 22 : 28,
                  fontWeight: 700,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 8,
                  marginLeft: 0
                }}
              >
                {header.title}
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: '#64748B',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 0,
                  marginLeft: 0
                }}
              >
                {header.subtitle}
              </p>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 12,
                justifyContent: 'flex-end',
                alignItems: isMobile ? 'stretch' : 'center'
              }}
            >
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                <ExportIcon style={{ width: 16, height: 16 }} />
                {actionButtons.export.label}
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                <AddManualIcon style={{ width: 16, height: 16 }} />
                {actionButtons.addManual.label}
              </button>
            </div>

            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? '1fr'
                  : isTablet
                  ? 'repeat(2, minmax(0, 1fr))'
                  : 'repeat(4, minmax(0, 1fr))',
                gap: 16
              }}
            >
              {summaryCards.map((card: any, idx: number) => {
                const CardIcon = iconMap[card.icon] || AlertCircle;
                return (
                  <div
                    key={idx}
                    style={{
                      ...cardStyle,
                      backgroundColor: card.bg,
                      border: `1px solid ${card.color}20`,
                      padding: 20
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          backgroundColor: card.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF'
                        }}
                      >
                        <CardIcon style={{ width: 20, height: 20 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: card.color,
                            marginBottom: 4
                          }}
                        >
                          {card.label}
                        </div>
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: '#0F172A'
                          }}
                        >
                          {card.value}
                        </div>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: '#64748B',
                        marginTop: 0,
                        marginRight: 0,
                        marginBottom: 0,
                        marginLeft: 0,
                        lineHeight: 1.5
                      }}
                    >
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Calendar */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              padding: isMobile ? 16 : isTablet ? 18 : 20,
              minWidth: 0,
              overflowX: 'auto'
            }}>
              {/* Calendar Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: isMobile ? 16 : isTablet ? 20 : 24
                }}
              >
                <div
                  style={{
                    fontSize: isMobile ? 18 : isTablet ? 19 : 20,
                    fontWeight: 700,
                    color: '#0F172A'
                  }}
                >
                  {calendar.month} {calendar.year}
                </div>
                <div style={{ display: 'flex', gap: isMobile ? 6 : 8 }}>
                  <button
                    onClick={handlePrevMonth}
                    style={{
                      width: isMobile ? 28 : isTablet ? 30 : 32,
                      height: isMobile ? 28 : isTablet ? 30 : 32,
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
                    <ChevronLeft style={{ width: isMobile ? 14 : isTablet ? 15 : 16, height: isMobile ? 14 : isTablet ? 15 : 16, color: '#64748B' }} />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    style={{
                      width: isMobile ? 28 : isTablet ? 30 : 32,
                      height: isMobile ? 28 : isTablet ? 30 : 32,
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
                    <ChevronRight style={{ width: isMobile ? 14 : isTablet ? 15 : 16, height: isMobile ? 14 : isTablet ? 15 : 16, color: '#64748B' }} />
                  </button>
                </div>
              </div>

              {/* Calendar Grid Container */}
              <div style={{ minWidth: 0, width: '100%' }}>
                {/* Days of Week Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: isMobile ? 4 : isTablet ? 6 : 8,
                    marginBottom: 12
                  }}
                >
                  {calendar.daysOfWeek.map((day: string) => (
                    <div
                      key={day}
                      style={{
                        fontSize: isMobile ? 10 : isTablet ? 11 : 12,
                        fontWeight: 600,
                        color: '#64748B',
                        textAlign: 'center',
                        padding: isMobile ? '6px 0' : '8px 0'
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 4 : isTablet ? 6 : 8 }}>
                {weeks.map((week, weekIdx) => (
                  <div
                    key={weekIdx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: isMobile ? 4 : isTablet ? 6 : 8
                    }}
                  >
                    {week.map((day, dayIdx) => (
                      <div
                        key={dayIdx}
                        style={{
                          aspectRatio: '1',
                          padding: isMobile ? '6px' : isTablet ? '7px' : '8px',
                          borderRadius: 8,
                          border: '1px solid #E2E8F0',
                          backgroundColor: day.date ? '#FFFFFF' : '#F8FAFC',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: isMobile ? 3 : isTablet ? 4 : 6,
                          boxSizing: 'border-box',
                          overflow: 'hidden'
                        }}
                      >
                        {day.date && (
                          <>
                            <div
                              style={{
                                fontSize: isMobile ? 12 : isTablet ? 13 : 14,
                                fontWeight: 600,
                                color: '#0F172A',
                                lineHeight: 1.2
                              }}
                            >
                              {day.date}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 2 : isTablet ? 3 : 4, flex: 1, minHeight: 0 }}>
                              {day.deadlines.map((deadline: any, deadlineIdx: number) => (
                                <div
                                  key={deadlineIdx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeadlineClick(deadline);
                                  }}
                                  style={{
                                    padding: isMobile ? '2px 6px' : isTablet ? '3px 7px' : '4px 8px',
                                    borderRadius: isMobile ? 4 : isTablet ? 5 : 6,
                                    backgroundColor: deadline.bg,
                                    color: deadline.color,
                                    fontSize: isMobile ? 9 : isTablet ? 10 : 11,
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    lineHeight: 1.2,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {deadline.type}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
                </div>
              </div>

              {/* Calendar Footer */}
              <div
                style={{
                  marginTop: isMobile ? 16 : isTablet ? 18 : 20,
                  paddingTop: isMobile ? 16 : isTablet ? 18 : 20,
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: isMobile ? 8 : 0
                }}
              >
                <span
                  style={{
                    fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
                    color: '#64748B'
                  }}
                >
                  {calendar.footerText}
                </span>
                <button
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#2563EB',
                    fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  {calendar.viewAsListLink}
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobileOrTablet ? 16 : 24, minWidth: 0 }}>
            <div style={cardStyle}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 0,
                    marginLeft: 0
                  }}
                >
                  {rightSidebar.title}
                </h3>
                <select
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F9FAFB',
                    fontSize: 12,
                    color: '#64748B',
                    cursor: 'pointer'
                  }}
                  defaultValue={rightSidebar.filter}
                >
                  <option>{rightSidebar.filter}</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {rightSidebar.deadlines.map((deadline: any) => (
                  <div
                    key={deadline.id}
                    onClick={() => handleDeadlineClick(deadline)}
                    style={{
                      padding: 16,
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      gap: 12,
                      cursor: 'pointer'
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        borderRadius: 2,
                        backgroundColor: deadline.barColor,
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#0F172A',
                          marginBottom: 4
                        }}
                      >
                        {deadline.type} - {deadline.propertyId}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#64748B',
                          marginBottom: 8
                        }}
                      >
                        {deadline.property}
                        {deadline.county && ` • ${deadline.county}`}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: '#64748B',
                          marginBottom: 8
                        }}
                      >
                        Due in {deadline.dueIn}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeadlineClick(deadline);
                        }}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#2563EB',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0
                        }}
                      >
                        {deadline.link}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Add Manual Deadline</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Type</label>
                <select 
                  value={newDeadline.type}
                  onChange={e => setNewDeadline({...newDeadline, type: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0' }}
                >
                  <option value="filing">Filing</option>
                  <option value="payment">Payment</option>
                  <option value="tax_appeal">Tax Appeal</option>
                  <option value="redemption">Redemption</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Date</label>
                <input 
                  type="date"
                  value={newDeadline.deadline_date}
                  onChange={e => setNewDeadline({...newDeadline, deadline_date: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Description</label>
                <input 
                  type="text"
                  value={newDeadline.description}
                  onChange={e => setNewDeadline({...newDeadline, description: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #E2E8F0', backgroundColor: 'white', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveDeadline}
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', backgroundColor: '#2563EB', color: 'white', cursor: 'pointer' }}
                >
                  Save Deadline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedDeadline && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                {isEditing ? 'Edit Deadline' : 'Deadline Details'}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {isEditing ? (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Type</label>
                    <select 
                      value={editForm.type}
                      onChange={e => setEditForm({...editForm, type: e.target.value})}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0' }}
                    >
                      <option value="filing">Filing</option>
                      <option value="payment">Payment</option>
                      <option value="tax_appeal">Tax Appeal</option>
                      <option value="redemption">Redemption</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Date</label>
                    <input 
                      type="date"
                      value={editForm.deadline_date}
                      onChange={e => setEditForm({...editForm, deadline_date: e.target.value})}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Description</label>
                    <input 
                      type="text"
                      value={editForm.description}
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                    <button 
                      onClick={() => setIsEditing(false)}
                      style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #E2E8F0', backgroundColor: 'white', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdateDeadline}
                      style={{ padding: '8px 16px', borderRadius: 6, border: 'none', backgroundColor: '#2563EB', color: 'white', cursor: 'pointer' }}
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Type</span>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>{selectedDeadline.type}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Description</span>
                    <div style={{ fontSize: 14, color: '#0F172A' }}>{selectedDeadline.title || selectedDeadline.description || 'No description'}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Date</span>
                    <div style={{ fontSize: 14, color: '#0F172A' }}>
                      {selectedDeadline.deadline_date ? new Date(selectedDeadline.deadline_date).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Status</span>
                    <div style={{ 
                      marginTop: 4,
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: selectedDeadline.status === 'completed' ? '#ECFDF5' : selectedDeadline.status === 'overdue' ? '#FEF2F2' : '#FFFBEB',
                      color: selectedDeadline.status === 'completed' ? '#10B981' : selectedDeadline.status === 'overdue' ? '#EF4444' : '#F59E0B'
                    }}>
                      {selectedDeadline.status ? selectedDeadline.status.charAt(0).toUpperCase() + selectedDeadline.status.slice(1) : 'Unknown'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 12, paddingTop: 12, borderTop: '1px solid #E2E8F0' }}>
                    <button 
                      onClick={() => setIsEditing(true)}
                      style={{ 
                        flex: 1,
                        padding: '8px 16px', 
                        borderRadius: 6, 
                        border: '1px solid #E2E8F0', 
                        backgroundColor: 'white', 
                        color: '#0F172A', 
                        cursor: 'pointer',
                        fontWeight: 500
                      }}
                    >
                      Edit
                    </button>

                    {selectedDeadline.status !== 'completed' && (
                      <button 
                        onClick={() => handleUpdateStatus('completed')}
                        style={{ 
                          flex: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '8px 16px', 
                          borderRadius: 6, 
                          border: 'none', 
                          backgroundColor: '#10B981', 
                          color: 'white', 
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        <CheckCircle2 size={16} />
                        Complete
                      </button>
                    )}
                    
                    <button 
                      onClick={handleDeleteDeadline}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '8px', 
                        borderRadius: 6, 
                        border: '1px solid #EF4444', 
                        backgroundColor: 'white', 
                        color: '#EF4444', 
                        cursor: 'pointer' 
                      }}
                      title="Delete Deadline"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

