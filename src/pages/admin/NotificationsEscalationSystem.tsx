import { CSSProperties, useState } from 'react';
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
  Plus
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

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
  Plus
};

export default function NotificationsEscalationSystem() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  // Extract data from JSON
  const notificationsData = adminData.notificationsEscalationSystem;
  const header = notificationsData.header;
  const actionButtons = notificationsData.actionButtons;
  const summaryCards = notificationsData.summaryCards;
  const tabs = notificationsData.tabs;
  const notificationCenter = notificationsData.notificationCenter;
  const rightSidebar = notificationsData.rightSidebar;

  const [activeTab, setActiveTab] = useState<string>(
    tabs.find((t: any) => t.active)?.id || 'notification-center'
  );
  const [preferences, setPreferences] = useState<{ [key: string]: boolean }>(
    rightSidebar.preferences.items.reduce((acc: any, item: any) => {
      acc[item.id] = item.enabled;
      return acc;
    }, {})
  );

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

  const MarkAllReadIcon = iconMap[actionButtons.markAllRead.icon] || Check;
  const SettingsIcon = iconMap[actionButtons.settings.icon] || Settings;

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
                          {notification.actions.length > 0 && (
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
                  {rightSidebar.escalationRules.title}
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
                  {rightSidebar.escalationRules.addButton}
                </button>
              </div>

              {/* Rules Table */}
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0, maxWidth: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 11 : isTablet ? 12 : 13, minWidth: isMobile ? 350 : isTablet ? 400 : 'auto' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      {rightSidebar.escalationRules.tableHeaders.map((header: string) => (
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
                    {rightSidebar.escalationRules.rules.map((rule: any) => (
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
                {rightSidebar.preferences.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 18 : 20 }}>
                {rightSidebar.preferences.items.map((pref: any) => (
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
                {rightSidebar.deliveryStatus.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 16 }}>
                {rightSidebar.deliveryStatus.metrics.map((metric: any, idx: number) => (
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
                {rightSidebar.deliveryStatus.viewLogLink}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

