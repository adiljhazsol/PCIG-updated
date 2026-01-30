import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, AuthState, UserRole } from '@/types';
import api from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  ssn?: string;
  bankAccount?: string;
}

export interface ResetPasswordData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const handleLoginResponse = (response: any) => {
    const { token, user: apiUser } = response.data.data;
    
    // Map API user to frontend User type
    const user: User = {
      id: apiUser.id.toString(),
      email: apiUser.email,
      firstName: apiUser.name ? apiUser.name.split(' ')[0] : '',
      lastName: apiUser.name ? apiUser.name.split(' ').slice(1).join(' ') : '',
      role: apiUser.role_type as UserRole,
      kycStatus: apiUser.kyc_status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Block login if account is pending or rejected (only for investors)
    if (user.role === 'investor') {
      if (user.kycStatus === 'pending') {
        throw new Error('Your account is pending approval. Please check your email for confirmation.');
      }
      if (user.kycStatus === 'rejected') {
        throw new Error('Your account application was rejected. Please contact support.');
      }
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: false, user: null }));
      return;
    }

    try {
      const response = await api.get('/auth/me');
      // Update user data from fresh response
      const apiUser = response.data.data.user;
      
      if (!apiUser) {
        throw new Error('User data not found in response');
      }

      const user: User = {
        id: apiUser.id ? apiUser.id.toString() : '',
        email: apiUser.email || '',
        firstName: apiUser.name ? apiUser.name.split(' ')[0] : '',
        lastName: apiUser.name ? apiUser.name.split(' ').slice(1).join(' ') : '',
        role: (apiUser.role_type || 'investor') as UserRole,
        kycStatus: apiUser.kyc_status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Block session if account is pending or rejected (only for investors)
      if (user.role === 'investor' && (user.kycStatus === 'pending' || user.kycStatus === 'rejected')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: false, user: null }));
        return;
      }

      localStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await api.post('/auth/login', { email, password });
      handleLoginResponse(response);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await api.post('/auth/admin-login', { email, password });
      handleLoginResponse(response);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API failed', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await api.post('/auth/register', {
        email: data.email,
        password: data.password,
        password_confirmation: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        address: data.address,
        ssn: data.ssn,
        bank_account: data.bankAccount
      });
      handleLoginResponse(response);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await api.post('/auth/forgot-password', { email });
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    await api.post('/auth/reset-password', data);
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, adminLogin, logout, register, forgotPassword, resetPassword, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
