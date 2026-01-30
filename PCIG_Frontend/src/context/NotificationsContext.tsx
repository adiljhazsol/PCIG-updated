import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string | number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: string;
  read: boolean;
  is_public?: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markAsRead: (id: string | number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string | number) => void;
  fetchNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load local notifications and read status from localStorage on mount
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        // 1. Load local notifications (client-side generated)
        const savedLocal = localStorage.getItem('local_notifications');
        let localNotifications: Notification[] = savedLocal ? JSON.parse(savedLocal) : [];

        // 2. Fetch public/server notifications
        // We handle this gracefully if the endpoint fails (e.g. if user is not logged in yet)
        let serverNotifications: Notification[] = [];
        try {
            // Only fetch if authenticated and user is an investor
            if (isAuthenticated && user?.role === 'investor') {
                const response = await api.get('/investor/notifications');
                if (response.data && response.data.success) {
                    serverNotifications = response.data.data.map((n: any) => ({
                        id: `server_${n.id}`, // Prefix ID to avoid collision
                        title: n.title,
                        message: n.message,
                        type: n.type,
                        date: n.created_at,
                        read: false, // Will be checked against read_receipts
                        is_public: n.is_public
                    }));
                }
            }
        } catch (error) {
            // Silent fail for 403/401 to avoid console spam if role check fails
            console.warn('Skipping server notifications fetch', error);
        }

        // 3. Merge and apply read status
        const readReceipts = JSON.parse(localStorage.getItem('notification_read_receipts') || '[]');
        
        const allNotifications = [...serverNotifications, ...localNotifications].map(n => ({
            ...n,
            read: n.read || readReceipts.includes(n.id)
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setNotifications(allNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Poll for new notifications every 60 seconds
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  // Save local notifications to localStorage whenever they change
  useEffect(() => {
    const localOnly = notifications.filter(n => !String(n.id).startsWith('server_'));
    localStorage.setItem('local_notifications', JSON.stringify(localOnly));
    
    // Save read receipts
    const readIds = notifications.filter(n => n.read).map(n => n.id);
    localStorage.setItem('notification_read_receipts', JSON.stringify(readIds));
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `local_${Date.now()}`,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string | number) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string | number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchNotifications = async () => {
     // Re-trigger the effect logic basically, but we can just duplicate the fetch part or make it a separate function
     // For simplicity, we'll let the polling handle it or user can refresh. 
     // But to implement "Refresh", let's copy the fetch logic here.
     try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await api.get('/investor/notifications');
        if (response.data && response.data.success) {
            const serverNotifications = response.data.data.map((n: any) => ({
                id: `server_${n.id}`,
                title: n.title,
                message: n.message,
                type: n.type,
                date: n.created_at,
                read: false,
                is_public: n.is_public
            }));

            setNotifications(prev => {
                const local = prev.filter(n => !String(n.id).startsWith('server_'));
                const readReceipts = JSON.parse(localStorage.getItem('notification_read_receipts') || '[]');
                
                const merged = [...serverNotifications, ...local].map(n => ({
                    ...n,
                    read: n.read || readReceipts.includes(n.id)
                })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                
                return merged;
            });
        }
     } catch (error) {
         console.error('Manual fetch failed', error);
     }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      fetchNotifications
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
