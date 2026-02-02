import { CSSProperties, useState, useEffect } from 'react';
import {
  Check,
  Settings,
  Bell,
  AlertTriangle,
  Clock,
  BarChart3,
  AlertCircle,
  User,
  FileText,
  CheckCircle2,
  Plus,
  Loader2,
  ChevronDown,
  ChevronUp,
  Filter,
  Search
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Check,
  Settings,
  Bell,
  AlertTriangle,
  Clock,
  BarChart3,
  AlertCircle,
  User,
  FileText,
  CheckCircle2,
  Plus,
  Filter,
  Search
};

export default function NotificationsEscalationSystem() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('notification-center');
  const [preferences, setPreferences] = useState<{ [key: string]: boolean }>({});
  
  // New state for tabs
  const [escalationRules, setEscalationRules] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingTab, setLoadingTab] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/notifications/dashboard-data');
        setData(response.data);
        
        // Initialize tab if data has tabs
        if (response.data?.tabs && Array.isArray(response.data.tabs)) {
             const active = response.data.tabs.find((t: any) => t.active)?.id || response.data.tabs[0]?.id || 'notification-center';
             setActiveTab(active);
        }

        // Initialize preferences
        if (response.data?.rightSidebar?.preferences?.items) {
             const prefs = response.data.rightSidebar.preferences.items.reduce((acc: any, item: any) => {
                acc[item.id] = item.enabled;
                return acc;
              }, {});
             setPreferences(prefs);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again later.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch tab specific data
  useEffect(() => {
    const fetchTabData = async () => {
        if (activeTab === 'escalation-matrix' && escalationRules.length === 0) {
            setLoadingTab(true);
            try {
                const res = await api.get('/admin/notifications/escalations');
                setEscalationRules(res.data.data || []);
            } catch (err) {
                console.error('Error fetching escalations:', err);
            } finally {
                setLoadingTab(false);
            }
        } else if (activeTab === 'logs' && logs.length === 0) {
            setLoadingTab(true);
            try {
                const res = await api.get('/admin/logs');
                // AdminLogsController returns { success: true, data: Paginator }
                // So we need res.data.data.data for the array
                setLogs(res.data.data?.data || []);
            } catch (err) {
                console.error('Error fetching logs:', err);
            } finally {
                setLoadingTab(false);
            }
        }
    };
    fetchTabData();
  }, [activeTab]);

  const handleMarkAllRead = async () => {
      try {
          await api.post('/admin/notifications/read-all');
          // Refresh data or update local state
          setData((prev: any) => ({
              ...prev,
              notificationCenter: {
                  ...prev.notificationCenter,
                  notifications: prev.notificationCenter.notifications.map((n: any) => ({ ...n, isUnread: false }))
              },
              summaryCards: prev.summaryCards.map((c: any) => c.label === 'Unread Notifications' ? { ...c, value: '0' } : c)
          }));
      } catch (err) {
          console.error('Error marking all read:', err);
      }
  };

  const handleUpdatePreference = async (id: string, enabled: boolean) => {
      // Optimistic update
      setPreferences(prev => ({ ...prev, [id]: enabled }));
      
      try {
          // Find channel and type from id or data structure (simplified here assuming id contains info or backend handles it)
          // We'll send the whole updated preferences list or just the change
          const prefItem = data.rightSidebar.preferences.items.find((p: any) => p.id === id);
          if (prefItem) {
              // Map id to channel/type logic if needed, or backend handles "email_deadline" -> channel=email, type=deadline
              // For now assuming backend can parse or we send raw structure
              // Let's send a specific structure if backend requires it.
              // Looking at backend AdminNotificationSettingsController, it expects array of {channel, type, enabled}
              // We need to parse "email_deadline" -> channel=email, type=deadline
              const [channel, ...typeParts] = id.split('_');
              const type = typeParts.join('_');
              
              await api.post('/admin/notifications/preferences', {
                  preferences: [{ channel, type, enabled }]
              });
          }
      } catch (err) {
          console.error('Error updating preference:', err);
          // Revert on error
          setPreferences(prev => ({ ...prev, [id]: !enabled }));
      }
  };

  // Extract data with safe fallbacks
  const notificationsData = data || {};
  const header = notificationsData.header || { title: 'Notifications & Escalation', subtitle: 'Manage alerts and workflows' };
  
  const rawActionButtons = notificationsData.actionButtons || {};
  const actionButtons = {
    markAllRead: rawActionButtons.markAllRead || { label: 'Mark all as read', icon: 'Check' },
    settings: rawActionButtons.settings || { label: 'Settings', icon: 'Settings' }
  };

  const summaryCards = Array.isArray(notificationsData.summaryCards) ? notificationsData.summaryCards : [];
  const tabs = Array.isArray(notificationsData.tabs) ? notificationsData.tabs : [];
  
  const rawNotificationCenter = notificationsData.notificationCenter || {};
  const notificationCenter = {
    filter: rawNotificationCenter.filter || { label: 'All Notifications', options: ['All Notifications', 'Unread', 'High Priority'] },
    notifications: Array.isArray(rawNotificationCenter.notifications) ? rawNotificationCenter.notifications : [],
    loadMoreLabel: rawNotificationCenter.loadMoreLabel || 'Load More'
  };

  const rightSidebar = notificationsData.rightSidebar || { preferences: { items: [] } };

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


  if (loading) {
    return (
      <div style={pageWrapperStyle}>
        <AdminNav />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p style={{ color: '#64748B' }}>Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageWrapperStyle}>
        <AdminNav />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
          <AlertCircle className="text-red-500" size={32} />
          <p style={{ color: '#EF4444' }}>{error}</p>
        </div>
      </div>
    );
  }

  const MarkAllReadIcon = iconMap[actionButtons.markAllRead?.icon] || Check;
  const SettingsIcon = iconMap[actionButtons.settings?.icon] || Settings;

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
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '1fr 380px',
            gap: isMobileOrTablet ? 16 : 24,
            alignItems: 'start',
            width: '100%',
            minWidth: 0
          }}
        >
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 20 : 24, minWidth: 0, width: '100%' }}>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'flex-start',
                marginBottom: 8,
                gap: isMobile ? 16 : 0
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
                    marginLeft: 0
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
                    marginLeft: 0
                  }}
                >
                  {header.subtitle}
                </p>
              </div>
              <div style={{ display: 'flex', gap: isMobile ? 8 : 12, flexWrap: isMobile ? 'wrap' : 'nowrap', width: isMobile ? '100%' : 'auto' }}>
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
                    flex: isMobile ? 1 : 'none',
                    minWidth: isMobile ? 0 : 'auto',
                    boxSizing: 'border-box',
                    width: isMobile ? 'auto' : 'auto'
                  }}
                >
                  <MarkAllReadIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{actionButtons.markAllRead.label}</span>
                </button>
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
                    flex: isMobile ? 1 : 'none',
                    minWidth: isMobile ? 0 : 'auto',
                    boxSizing: 'border-box',
                    width: isMobile ? 'auto' : 'auto'
                  }}
                >
                  <SettingsIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{actionButtons.settings.label}</span>
                </button>
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
                const CardIcon = iconMap[card.icon] || Bell;
                return (
                  <div
                    key={idx}
                    style={{
                      ...cardStyle,
                      backgroundColor: card.bg,
                      border: `1px solid ${card.color}20`,
                      padding: isMobile ? 12 : isTablet ? 16 : 20
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
                  </div>
                );
              })}
            </div>

            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 0,
                borderBottom: '2px solid #E2E8F0',
                overflowX: isMobileOrTablet ? 'auto' : 'visible',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                width: '100%',
                minWidth: 0
              }}
            >
              <style>{`
                .tabs-scroll::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="tabs-scroll" style={{ display: 'flex', gap: 0, minWidth: isMobileOrTablet ? 'max-content' : 'auto', width: isMobileOrTablet ? 'auto' : '100%' }}>
                {tabs.map((tab: any) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: isMobile ? '10px 16px' : isTablet ? '11px 20px' : '12px 24px',
                      border: 'none',
                      borderBottom: activeTab === tab.id ? '2px solid #2563EB' : '2px solid transparent',
                      backgroundColor: 'transparent',
                      color: activeTab === tab.id ? '#2563EB' : '#64748B',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: activeTab === tab.id ? 600 : 500,
                      cursor: 'pointer',
                      marginBottom: -2,
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content - Notification Center */}
            {activeTab === 'notification-center' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16, width: '100%', minWidth: 0 }}>
                {/* Filter */}
                <div style={{ display: 'flex', justifyContent: isMobile ? 'flex-start' : 'flex-end', marginBottom: 8 }}>
                  <select
                    style={{
                      padding: isMobile ? '6px 10px' : '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: isMobile ? 12 : 13,
                      color: '#0F172A',
                      cursor: 'pointer',
                      minWidth: isMobile ? '100%' : 120,
                      width: isMobile ? '100%' : 'auto',
                      boxSizing: 'border-box'
                    }}
                    defaultValue={notificationCenter.filter.label}
                  >
                    {notificationCenter.filter.options.map((option: string) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notifications List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12, width: '100%', minWidth: 0 }}>
                  {notificationCenter.notifications.map((notification: any) => {
                    const NotificationIcon = iconMap[notification.icon] || AlertCircle;
                    return (
                      <div
                        key={notification.id}
                        style={{
                          ...cardStyle,
                          display: 'flex',
                          flexDirection: isMobile ? 'column' : 'row',
                          gap: isMobile ? 12 : 16,
                          alignItems: 'flex-start',
                          width: '100%',
                          minWidth: 0,
                          boxSizing: 'border-box'
                        }}
                      >
                        {/* Icon */}
                        <div
                          style={{
                            width: isMobile ? 36 : isTablet ? 38 : 40,
                            height: isMobile ? 36 : isTablet ? 38 : 40,
                            borderRadius: '50%',
                            backgroundColor: notification.iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <NotificationIcon
                            style={{
                              width: isMobile ? 18 : isTablet ? 19 : 20,
                              height: isMobile ? 18 : isTablet ? 19 : 20,
                              color: notification.iconColor
                            }}
                          />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: isMobile ? 'column' : 'row',
                              justifyContent: 'space-between',
                              alignItems: isMobile ? 'flex-start' : 'flex-start',
                              marginBottom: 8,
                              gap: isMobile ? 4 : 0
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h3
                                style={{
                                  fontSize: isMobile ? 14 : isTablet ? 14.5 : 15,
                                  fontWeight: 600,
                                  color: '#0F172A',
                                  marginTop: 0,
                                  marginRight: 0,
                                  marginBottom: 4,
                                  marginLeft: 0,
                                  wordBreak: 'break-word'
                                }}
                              >
                                {notification.title}
                              </h3>
                              <p
                                style={{
                                  fontSize: isMobile ? 12 : 13,
                                  color: '#64748B',
                                  marginTop: 0,
                                  marginRight: 0,
                                  marginBottom: 0,
                                  marginLeft: 0
                                }}
                              >
                                {notification.time}
                              </p>
                            </div>
                          </div>
                          <p
                            style={{
                              fontSize: isMobile ? 13 : 14,
                              color: '#1E293B',
                              marginTop: 0,
                              marginRight: 0,
                              marginBottom: 12,
                              marginLeft: 0,
                              lineHeight: 1.5,
                              wordBreak: 'break-word'
                            }}
                          >
                            {notification.message}
                          </p>
                          {Array.isArray(notification.actions) && notification.actions.length > 0 && (
                            <div style={{ display: 'flex', gap: isMobile ? 6 : 8, flexWrap: 'wrap', width: '100%' }}>
                              {notification.actions.map((action: any, actionIdx: number) => (
                                <button
                                  key={actionIdx}
                                  style={{
                                    padding: isMobile ? '6px 12px' : '8px 16px',
                                    borderRadius: 8,
                                    border: action.type === 'primary' ? 'none' : '1px solid #E2E8F0',
                                    backgroundColor:
                                      action.type === 'primary' ? '#2563EB' : '#FFFFFF',
                                    color: action.type === 'primary' ? '#FFFFFF' : '#64748B',
                                    fontSize: isMobile ? 12 : 13,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    boxSizing: 'border-box',
                                    flexShrink: 0
                                  }}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                  <button
                    style={{
                      padding: isMobile ? '8px 20px' : '10px 24px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    {notificationCenter.loadMoreLabel}
                  </button>
                </div>
              </div>
            )}

            {/* Tab Content - Escalation Matrix */}
            {activeTab === 'escalation-matrix' && (
              <div style={{ ...cardStyle, width: '100%', minWidth: 0, overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0F172A' }}>Escalation Rules</h3>
                    <button style={{ 
                        display: 'flex', alignItems: 'center', gap: 6, 
                        padding: '8px 12px', borderRadius: 8, 
                        backgroundColor: '#2563EB', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 
                    }}>
                        <Plus size={16} /> Add Rule
                    </button>
                </div>
                
                {loadingTab ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#64748B', display: 'flex', justifyContent: 'center' }}>
                      <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 12 : 14 }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                            <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Trigger</th>
                            <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Delay</th>
                            <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Escalate To</th>
                            <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {escalationRules.map((rule: any) => (
                            <tr key={rule.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '12px 16px', color: '#0F172A', fontWeight: 500 }}>{rule.trigger_type}</td>
                                <td style={{ padding: '12px 16px', color: '#64748B' }}>{rule.delay_hours} hours</td>
                                <td style={{ padding: '12px 16px', color: '#64748B' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={14} color="#64748B" />
                                        </div>
                                        {rule.escalate_to_user?.name || 'Unknown'}
                                    </div>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                    <span style={{ 
                                        padding: '4px 10px', 
                                        borderRadius: 999, 
                                        backgroundColor: rule.is_active ? '#ECFDF5' : '#F1F5F9',
                                        color: rule.is_active ? '#10B981' : '#64748B',
                                        fontSize: 12,
                                        fontWeight: 500
                                    }}>
                                        {rule.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                    <button style={{ padding: 6, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        <Settings size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {escalationRules.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                                    No escalation rules configured yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Tab Content - System Logs */}
            {activeTab === 'logs' && (
              <div style={{ ...cardStyle, width: '100%', minWidth: 0, overflowX: 'auto' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0F172A' }}>System Activity Logs</h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                         <button style={{ 
                            display: 'flex', alignItems: 'center', gap: 6, 
                            padding: '8px 12px', borderRadius: 8, 
                            backgroundColor: '#FFFFFF', color: '#64748B', border: '1px solid #E2E8F0', cursor: 'pointer', fontSize: 13, fontWeight: 500 
                        }}>
                            <Filter size={14} /> Filter
                        </button>
                        <button style={{ 
                            display: 'flex', alignItems: 'center', gap: 6, 
                            padding: '8px 12px', borderRadius: 8, 
                            backgroundColor: '#FFFFFF', color: '#64748B', border: '1px solid #E2E8F0', cursor: 'pointer', fontSize: 13, fontWeight: 500 
                        }}>
                            <FileText size={14} /> Export
                        </button>
                    </div>
                </div>

                 {loadingTab ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#64748B', display: 'flex', justifyContent: 'center' }}>
                      <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 12 : 14 }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                            <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Timestamp</th>
                            <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>User</th>
                            <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Action</th>
                            <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log: any) => (
                            <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#64748B' }}>
                                    {new Date(log.created_at).toLocaleString()}
                                </td>
                                <td style={{ padding: '12px 16px', color: '#0F172A', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {log.causer ? (
                                             <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>
                                                {log.causer.name.charAt(0)}
                                            </div>
                                        ) : (
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Settings size={14} />
                                            </div>
                                        )}
                                        {log.causer?.name || 'System'}
                                    </div>
                                </td>
                                <td style={{ padding: '12px 16px', color: '#64748B' }}>
                                    <span style={{ 
                                        padding: '2px 8px', 
                                        borderRadius: 4, 
                                        backgroundColor: '#F8FAFC',
                                        border: '1px solid #E2E8F0',
                                        fontSize: 12 
                                    }}>
                                        {log.log_name || 'default'}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 16px', color: '#334155' }}>{log.description}</td>
                            </tr>
                        ))}
                         {logs.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                                    No activity logs recorded.
                                </td>
                            </tr>
                        )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 20 : 24, minWidth: 0, width: '100%', order: isMobileOrTablet ? -1 : 0 }}>
            {/* Active Escalation Rules */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
                  gap: isMobile ? 12 : 0
                }}
              >
                <h3
                  style={{
                    fontSize: isMobile ? 15 : 16,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 0,
                    marginLeft: 0
                  }}
                >
                  {rightSidebar.escalationRules?.title}
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
                    color: '#2563EB',
                    fontSize: isMobile ? 11 : 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: isMobile ? 'center' : 'flex-start'
                  }}
                >
                  <Plus style={{ width: isMobile ? 12 : 14, height: isMobile ? 12 : 14 }} />
                  {rightSidebar.escalationRules?.addButton}
                </button>
              </div>

              {/* Rules Table */}
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0, maxWidth: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 11 : isTablet ? 12 : 13, minWidth: isMobile ? 350 : isTablet ? 400 : 'auto' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      {rightSidebar.escalationRules?.tableHeaders?.map((header: string) => (
                        <th
                          key={header}
                          style={{
                            padding: isMobile ? '8px 10px' : '10px 12px',
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
                    {rightSidebar.escalationRules?.rules?.map((rule: any) => (
                      <tr key={rule.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: isMobile ? '10px' : '12px', color: '#0F172A', fontWeight: 500, wordBreak: 'break-word' }}>
                          {rule.name}
                        </td>
                        <td style={{ padding: isMobile ? '10px' : '12px', color: '#64748B', whiteSpace: 'nowrap' }}>{rule.trigger}</td>
                        <td style={{ padding: isMobile ? '10px' : '12px', color: '#64748B', whiteSpace: 'nowrap' }}>{rule.level1}</td>
                        <td style={{ padding: isMobile ? '10px' : '12px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: 999,
                              fontSize: isMobile ? 10 : 11,
                              fontWeight: 500,
                              backgroundColor: rule.statusBg,
                              color: rule.statusColor,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {rule.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notification Preferences */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
              <h3
                style={{
                  fontSize: isMobile ? 15 : 16,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
                  marginLeft: 0
                }}
              >
                {rightSidebar.preferences?.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 18 : 20 }}>
                {rightSidebar.preferences?.items?.map((pref: any) => (
                  <div key={pref.id}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 12,
                        marginBottom: 4
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: isMobile ? 13 : 14,
                            fontWeight: 500,
                            color: '#0F172A',
                            marginBottom: 4,
                            wordBreak: 'break-word'
                          }}
                        >
                          {pref.label}
                        </div>
                        <div
                          style={{
                            fontSize: isMobile ? 11 : 12,
                            color: '#64748B',
                            wordBreak: 'break-word'
                          }}
                        >
                          {pref.description}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setPreferences((prev) => ({
                            ...prev,
                            [pref.id]: !prev[pref.id]
                          }))
                        }
                        style={{
                          width: isMobile ? 40 : 44,
                          height: isMobile ? 22 : 24,
                          borderRadius: 12,
                          border: 'none',
                          backgroundColor: preferences[pref.id] ? '#2563EB' : '#E2E8F0',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          padding: 0,
                          flexShrink: 0
                        }}
                      >
                        <div
                          style={{
                            width: isMobile ? 18 : 20,
                            height: isMobile ? 18 : 20,
                            borderRadius: '50%',
                            backgroundColor: '#FFFFFF',
                            position: 'absolute',
                            top: 2,
                            left: preferences[pref.id] ? (isMobile ? 20 : 22) : 2,
                            transition: 'left 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Status */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
              <h3
                style={{
                  fontSize: isMobile ? 15 : 16,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
                  marginLeft: 0
                }}
              >
                {rightSidebar.deliveryStatus?.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 16 }}>
                {rightSidebar.deliveryStatus?.metrics?.map((metric: any, idx: number) => (
                  <div key={idx}>
                    <div
                      style={{
                        fontSize: isMobile ? 20 : isTablet ? 22 : 24,
                        fontWeight: 700,
                        color: metric.color,
                        marginBottom: 4
                      }}
                    >
                      {metric.value}
                    </div>
                    <div
                      style={{
                        fontSize: isMobile ? 11 : 12,
                        color: '#64748B'
                      }}
                    >
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
              <button
                style={{
                  marginTop: isMobile ? 14 : 16,
                  border: 'none',
                  background: 'transparent',
                  color: '#2563EB',
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  textAlign: 'left'
                }}
              >
                {rightSidebar.deliveryStatus?.viewLogLink}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

