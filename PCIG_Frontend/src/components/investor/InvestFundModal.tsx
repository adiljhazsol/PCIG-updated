import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface BankAccount {
  id: number;
  bank_name: string;
  account_number_last_4: string;
  status: 'verified' | 'pending' | 'failed';
}

interface InvestFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  fund: {
    id: string | number;
    name: string;
    minInvestment: string; // formatted string like "$10,000"
  };
  onSuccess?: () => void;
}

export default function InvestFundModal({ isOpen, onClose, fund, onSuccess }: InvestFundModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Parse minInvestment string to number
  const parseCurrency = (val: string) => parseFloat(val.replace(/[^0-9.]/g, '') || '0');
  const minInvestValue = parseCurrency(fund.minInvestment);

  useEffect(() => {
    if (isOpen) {
      fetchBankAccounts();
      setStep('details');
      setAmount('');
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
    if (!amount) {
      setError('Please enter an investment amount.');
      return;
    }

    const investAmount = parseFloat(amount);
    if (investAmount < minInvestValue) {
      setError(`Minimum investment is ${fund.minInvestment}`);
      return;
    }

    if (!selectedAccountId) {
      setError('Please select a payment method.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(`/investor/funds/${fund.id}/invest`, {
        amount: investAmount,
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
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            {step === 'details' ? `Invest in ${fund.name}` : 'Investment Successful'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {step === 'details' ? (
            <>
              {error && (
                <div style={{ 
                  marginBottom: '20px', 
                  padding: '12px', 
                  backgroundColor: '#FEF2F2', 
                  border: '1px solid #FECACA', 
                  borderRadius: '8px',
                  color: '#991B1B',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <p style={{ color: '#64748B', fontSize: '15px', marginTop: 0, marginBottom: '24px' }}>
                Minimum investment: <span style={{ fontWeight: 600, color: '#0F172A' }}>{fund.minInvestment}</span>
              </p>

              {/* Investment Amount */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155', marginBottom: '8px' }}>
                  Investment Amount ($)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
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
                    <AlertCircle size={24} color="#EF4444" style={{ marginBottom: '8px', display: 'inline-block' }} />
                    <div style={{ color: '#991B1B', fontWeight: 600, marginBottom: '4px' }}>No Verified Bank Account</div>
                    <p style={{ fontSize: '13px', color: '#B91C1C', marginBottom: '12px', marginTop: 0 }}>
                      You need a verified bank account to invest.
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
                        <div>
                          <div style={{ fontWeight: 500, color: '#0F172A', fontSize: '14px' }}>{account.bank_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>•••• {account.account_number_last_4}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvest}
                  disabled={loading || !amount || !selectedAccountId}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#1E3A5F',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    cursor: (loading || !amount || !selectedAccountId) ? 'not-allowed' : 'pointer',
                    opacity: (loading || !amount || !selectedAccountId) ? 0.7 : 1,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} style={{ marginRight: '8px' }} />
                      Processing...
                    </>
                  ) : 'Continue'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#DCFCE7', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <CheckCircle2 size={32} color="#166534" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px' }}>
                Investment Successful!
              </h3>
              <p style={{ color: '#64748B', fontSize: '15px', lineHeight: 1.5, marginBottom: '32px' }}>
                You have successfully invested <strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount))}</strong> in <strong>{fund.name}</strong>.
                <br />
                You can view your investment in your portfolio.
              </p>
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#1E3A5F',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
