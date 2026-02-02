import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  MoreVertical,
  Plus,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile } from '../../hooks/useMediaQuery';
import api from '../../services/api';

interface BankAccount {
  id: number;
  bank_name: string;
  account_type: string;
  account_number_last_4: string;
  status: 'verified' | 'pending' | 'rejected';
  is_primary: boolean;
}

interface Investor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status?: string;
  bank_accounts?: BankAccount[];
  created_at?: string;
}

const AdminInvestorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null); // ID of account being processed

  useEffect(() => {
    fetchInvestor();
  }, [id]);

  const fetchInvestor = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/investors/${id}`);
      if (response.data && response.data.success) {
        setInvestor(response.data.data);
      } else {
        setError('Failed to load investor details');
      }
    } catch (err) {
      console.error('Error fetching investor:', err);
      setError('An error occurred while fetching investor details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccount = async (accountId: number) => {
    try {
      setActionLoading(accountId);
      const response = await api.post(`/admin/investors/${id}/bank-accounts/${accountId}/verify`);
      if (response.data && response.data.success) {
        // Update local state
        setInvestor(prev => {
          if (!prev || !prev.bank_accounts) return prev;
          return {
            ...prev,
            bank_accounts: prev.bank_accounts.map(acc => 
              acc.id === accountId ? { ...acc, status: 'verified' } : acc
            )
          };
        });
      }
    } catch (err) {
      console.error('Error verifying account:', err);
      alert('Failed to verify account');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    if (!window.confirm('Are you sure you want to remove this bank account?')) return;
    
    try {
      setActionLoading(accountId);
      const response = await api.delete(`/admin/investors/${id}/bank-accounts/${accountId}`);
      if (response.data && response.data.success) {
        // Update local state
        setInvestor(prev => {
          if (!prev || !prev.bank_accounts) return prev;
          return {
            ...prev,
            bank_accounts: prev.bank_accounts.filter(acc => acc.id !== accountId)
          };
        });
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Failed to delete account');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        <AdminNav />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Loader2 className="animate-spin" size={32} color="#1E3A5F" />
        </div>
      </div>
    );
  }

  if (error || !investor) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        <AdminNav />
        <div style={{ flex: 1, padding: 40 }}>
          <div style={{ color: '#DC2626', marginBottom: 20 }}>{error || 'Investor not found'}</div>
          <button 
            onClick={() => navigate('/admin/investors')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} /> Back to Investors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh', 
      backgroundColor: '#F8FAFC',
      fontFamily: "'Inter', sans-serif" 
    }}>
      <AdminNav />
      
      <div style={{ 
        flex: 1, 
        padding: isMobile ? '20px' : '32px 40px',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button 
            onClick={() => navigate('/admin/investors')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              marginBottom: 16,
              fontSize: 14,
              padding: 0
            }}
          >
            <ArrowLeft size={16} /> Back to Investors
          </button>
          
          <h1 style={{ 
            fontSize: 24, 
            fontWeight: 700, 
            color: '#0F172A',
            margin: 0
          }}>
            {investor.name}
          </h1>
          <div style={{ color: '#64748B', marginTop: 4 }}>{investor.email}</div>
        </div>

        {/* Bank Accounts Section */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          padding: 24,
          marginBottom: 24,
          maxWidth: 800
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 24
          }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', margin: 0 }}>
                Bank Accounts
              </h2>
              <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0 0' }}>
                Manage your linked bank accounts
              </p>
            </div>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}
              onClick={() => alert('Add account functionality would open a modal here')}
            >
              <Plus size={16} /> Add Account
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {investor.bank_accounts && investor.bank_accounts.length > 0 ? (
              investor.bank_accounts.map(account => (
                <div 
                  key={account.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 16,
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    backgroundColor: '#F8FAFC'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: '#E2E8F0',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: '#64748B'
                    }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>
                          {account.bank_name || 'Bank Account'}
                        </span>
                        {account.status === 'verified' ? (
                          <span style={{
                            fontSize: 12,
                            padding: '2px 8px',
                            borderRadius: 12,
                            backgroundColor: '#DCFCE7',
                            color: '#166534',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <CheckCircle2 size={12} /> Verified
                          </span>
                        ) : (
                          <span style={{
                            fontSize: 12,
                            padding: '2px 8px',
                            borderRadius: 12,
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <AlertCircle size={12} /> Pending
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 14, color: '#64748B', marginTop: 2 }}>
                        {account.account_type} **** {account.account_number_last_4}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {account.status !== 'verified' && (
                      <button
                        onClick={() => handleVerifyAccount(account.id)}
                        disabled={actionLoading === account.id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#DCFCE7',
                          color: '#166534',
                          border: '1px solid #86EFAC',
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: actionLoading === account.id ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        {actionLoading === account.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <ShieldCheck size={14} />
                        )}
                        Verify
                      </button>
                    )}
                    
                    <button
                      onClick={() => alert('Edit functionality would go here')}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#FFFFFF',
                        color: '#64748B',
                        border: '1px solid #E2E8F0',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      disabled={actionLoading === account.id}
                      style={{
                        padding: 8,
                        backgroundColor: '#FEE2E2',
                        color: '#991B1B',
                        border: 'none',
                        borderRadius: 6,
                        cursor: actionLoading === account.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {actionLoading === account.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                padding: 32, 
                textAlign: 'center', 
                color: '#64748B',
                backgroundColor: '#F8FAFC',
                borderRadius: 8,
                border: '1px dashed #E2E8F0'
              }}>
                No bank accounts linked yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInvestorDetail;
