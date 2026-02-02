import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, CheckCircle2, Building2, Wallet } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface BankAccount {
  id: number;
  bank_name: string;
  account_number_last_4: string;
  status: 'verified' | 'pending' | 'failed';
}

interface InvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string | number;
    address: string;
    price_per_share: number;
    available_shares: number;
  };
  onSuccess?: () => void;
}

export default function InvestModal({ isOpen, onClose, property, onSuccess }: InvestModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'details' | 'confirm' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [shares, setShares] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchBankAccounts();
      setStep('details');
      setShares(1);
      setError(null);
    }
  }, [isOpen]);

  const fetchBankAccounts = async () => {
    try {
      setFetchingAccounts(true);
      const response = await api.get('/investor/settings/bank-accounts');
      if (response.data.success) {
        setBankAccounts(response.data.data);
        // Auto-select first verified account
        const firstVerified = response.data.data.find((acc: any) => acc.status === 'verified');
        if (firstVerified) {
          setSelectedAccountId(firstVerified.id);
        }
      }
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
      setError('Failed to load bank accounts.');
    } finally {
      setFetchingAccounts(false);
    }
  };

  const handleInvest = async () => {
    if (!selectedAccountId) {
      setError('Please select a payment method.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(`/investor/properties/${property.id}/invest`, {
        shares: shares,
        bank_account_id: selectedAccountId
      });

      if (response.data.success) {
        setStep('success');
        if (onSuccess) onSuccess();
      } else {
        setError(response.data.message || 'Investment failed.');
      }
    } catch (err: any) {
      console.error('Investment error:', err);
      setError(err.response?.data?.message || 'Investment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = shares * property.price_per_share;
  const verifiedAccounts = bankAccounts.filter(acc => acc.status === 'verified');
  const hasVerifiedAccounts = verifiedAccounts.length > 0;

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>
            {step === 'success' ? 'Investment Successful' : 'Invest in Property'}
          </h3>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {step === 'success' ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ 
                width: '64px', height: '64px', backgroundColor: '#DCFCE7', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' 
              }}>
                <CheckCircle2 size={32} color="#10B981" />
              </div>
              <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Congratulations!
              </h4>
              <p style={{ color: '#64748B', marginBottom: '24px' }}>
                You have successfully invested in <strong>{property.address}</strong>.
              </p>
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748B' }}>Shares Purchased:</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{shares}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Total Amount:</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount)}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1E3A5F',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Property Summary */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <div style={{ 
                  width: '40px', height: '40px', backgroundColor: '#E2E8F0', borderRadius: '8px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                }}>
                  <Building2 size={20} color="#64748B" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '14px' }}>{property.address}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Price per Share: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(property.price_per_share)}
                  </div>
                </div>
              </div>

              {/* Investment Amount */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155', marginBottom: '8px' }}>
                  Number of Shares
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="number"
                    min="1"
                    max={property.available_shares}
                    value={shares}
                    onChange={(e) => setShares(parseInt(e.target.value) || 0)}
                    style={{
                      width: '100px',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      fontSize: '16px'
                    }}
                  />
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Total Investment</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount)}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Available Shares: {property.available_shares}
                </div>
              </div>

              {/* Payment Method */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155', marginBottom: '8px' }}>
                  Payment Method
                </label>
                
                {fetchingAccounts ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>
                    <Loader2 className="animate-spin" size={20} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
                    Loading accounts...
                  </div>
                ) : !hasVerifiedAccounts ? (
                  <div style={{ 
                    padding: '16px', 
                    backgroundColor: '#FEF2F2', 
                    border: '1px solid #FECACA', 
                    borderRadius: '8px',
                    textAlign: 'center' 
                  }}>
                    <AlertCircle size={24} color="#EF4444" style={{ marginBottom: '8px' }} />
                    <div style={{ color: '#991B1B', fontWeight: 600, marginBottom: '4px' }}>No Verified Bank Account</div>
                    <p style={{ fontSize: '13px', color: '#B91C1C', marginBottom: '12px' }}>
                      You need a verified bank account to invest. Please add one in your settings.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/investor/settings?section=payment');
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#fff',
                        border: '1px solid #B91C1C',
                        color: '#B91C1C',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Go to Settings
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {verifiedAccounts.map(account => (
                      <div
                        key={account.id}
                        onClick={() => setSelectedAccountId(account.id)}
                        style={{
                          padding: '12px',
                          border: `1px solid ${selectedAccountId === account.id ? '#1E3A5F' : '#E2E8F0'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: selectedAccountId === account.id ? '#F0F9FF' : '#fff'
                        }}
                      >
                        <div style={{ 
                          width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #CBD5E1', 
                          marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backgroundColor: selectedAccountId === account.id ? '#1E3A5F' : 'transparent'
                        }}>
                          {selectedAccountId === account.id && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, color: '#0F172A' }}>{account.bank_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>**** {account.account_number_last_4}</div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Verified
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div style={{ 
                  marginBottom: '16px', padding: '12px', backgroundColor: '#FEF2F2', 
                  border: '1px solid #FECACA', borderRadius: '6px', color: '#B91C1C', fontSize: '13px' 
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    color: '#64748B',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvest}
                  disabled={loading || !hasVerifiedAccounts || shares < 1 || shares > property.available_shares}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: loading || !hasVerifiedAccounts ? '#94A3B8' : '#1E3A5F',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: loading || !hasVerifiedAccounts ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading && <Loader2 className="animate-spin" size={16} />}
                  Confirm Investment
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
