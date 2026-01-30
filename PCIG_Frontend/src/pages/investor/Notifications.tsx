import { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Clock,
  Check,
  Loader2
} from 'lucide-react';
import InvestorNav from '../../components/investor/InvestorNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import { useNotifications } from '../../context/NotificationsContext';

export default function Notifications() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    loading 
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);
  
  // Format date helper if date-fns not installed
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return dateString;
    }
  };


  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 style={{ width: '20px', height: '20px', color: '#10B981' }} />;
      case 'warning':
        return <AlertCircle style={{ width: '20px', height: '20px', color: '#F59E0B' }} />;
      case 'info':
      default:
        return <Info style={{ width: '20px', height: '20px', color: '#3B82F6' }} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#ECFDF5';
      case 'warning':
        return '#FFFBEB';
      case 'info':
      default:
        return '#EFF6FF';
    }
  };

  return (
    <>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#F8FAFC',
        overflowX: 'hidden',
        maxWidth: '100vw'
      }}>
        <InvestorNav />

        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: isMobileOrTablet ? `clamp(16px, 2vh, 20px) clamp(16px, 2vw, 20px)` : `clamp(24px, 3vh, 32px) clamp(20px, 2.5vw, 32px)`,
        }}>
          
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '24px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '16px' : '0',
            alignItems: isMobile ? 'flex-start' : 'center'
          }}>
            <div>
              <h1 style={{ 
                fontSize: `clamp(20px, 2.5vw, 24px)`, 
                fontWeight: 600, 
                color: '#0F172A',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#DC2626',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {unreadCount} New
                  </span>
                )}
              </h1>
              <p style={{ 
                fontSize: `clamp(13px, 1.5vw, 14px)`, 
                color: '#64748B', 
                margin: '4px 0 0 0' 
              }}>
                Stay updated with your investment activities
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={markAllAsRead}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#64748B',
                  cursor: 'pointer'
                }}
              >
                <Check style={{ width: '16px', height: '16px' }} />
                Mark all as read
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '24px',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '1px'
          }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: filter === 'all' ? '2px solid #1E3A5F' : '2px solid transparent',
                fontSize: '14px',
                fontWeight: filter === 'all' ? 600 : 500,
                color: filter === 'all' ? '#1E3A5F' : '#64748B',
                cursor: 'pointer',
                marginBottom: '-1px'
              }}
            >
              All Notifications
            </button>
            <button
              onClick={() => setFilter('unread')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: filter === 'unread' ? '2px solid #1E3A5F' : '2px solid transparent',
                fontSize: '14px',
                fontWeight: filter === 'unread' ? 600 : 500,
                color: filter === 'unread' ? '#1E3A5F' : '#64748B',
                cursor: 'pointer',
                marginBottom: '-1px'
              }}
            >
              Unread
            </button>
          </div>

          {/* Notifications List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                <Loader2 className="animate-spin" style={{ width: '24px', height: '24px', margin: '0 auto 12px' }} />
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                backgroundColor: '#FFFFFF', 
                borderRadius: '8px',
                border: '1px solid #E2E8F0'
              }}>
                <Bell style={{ width: '48px', height: '48px', color: '#CBD5E1', marginBottom: '16px' }} />
                <h3 style={{ margin: '0 0 8px 0', color: '#0F172A' }}>No notifications</h3>
                <p style={{ margin: 0, color: '#64748B' }}>You're all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  style={{
                    backgroundColor: notification.read ? '#FFFFFF' : '#F0F9FF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    gap: '16px',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    boxShadow: notification.read ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: getBgColor(notification.type),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getIcon(notification.type)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '4px'
                    }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '16px', 
                        fontWeight: 600, 
                        color: '#0F172A' 
                      }}>
                        {notification.title}
                      </h3>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px' 
                      }}>
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Clock style={{ width: '12px', height: '12px' }} />
                          {formatDate(notification.date)}
                        </span>
                        {!notification.read && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#3B82F6'
                          }} />
                        )}
                      </div>
                    </div>
                    
                    <p style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '14px', 
                      color: '#475569',
                      lineHeight: '1.5'
                    }}>
                      {notification.message}
                    </p>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#1E3A5F',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Mark as read
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#DC2626',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
}