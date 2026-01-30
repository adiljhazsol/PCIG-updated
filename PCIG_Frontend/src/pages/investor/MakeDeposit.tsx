import { useState } from 'react';
import {
  CreditCard,
  Building2,
  DollarSign,
  Info,
  CheckCircle,
  Copy,
  ArrowRight
} from 'lucide-react';
import InvestorNav from '../../components/investor/InvestorNav';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useNavigate } from 'react-router-dom';

export default function MakeDeposit() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('wire'); // 'wire' or 'ach'
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit the deposit notification to the backend
    setSubmitted(true);
    setTimeout(() => {
      navigate('/investor/transactions');
    }, 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  if (submitted) {
    return (
      <div style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
        width: '100%',
      }}>
        <InvestorNav />
        <div style={{
          padding: `clamp(16px, 2vh, 24px) clamp(16px, 2.5vw, 48px)`,
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <CheckCircle size={32} color="#166534" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
            Deposit Initiated Successfully
          </h2>
          <p style={{ fontSize: '16px', color: '#64748B', marginBottom: '32px', maxWidth: '500px' }}>
            We have received your deposit notification. Please ensure you have completed the transfer from your bank. Your funds will be credited once the transaction is verified.
          </p>
          <button
            onClick={() => navigate('/investor/transactions')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1E3A5F',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Go to Transactions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: '#F8FAFC',
      minHeight: '100vh',
      width: '100%',
    }}>
      <InvestorNav />
      
      <div style={{
        padding: `clamp(16px, 2vh, 24px) clamp(16px, 2.5vw, 48px)`,
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: `clamp(22px, 2.8vw, 28px)`,
            fontWeight: 700,
            color: '#0F172A',
            marginBottom: '8px'
          }}>
            Make a Deposit
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px' }}>
            Fund your account to start investing in properties and funds.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '24px'
        }}>
          {/* Left Column: Deposit Form */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', marginBottom: '20px' }}>
              Deposit Details
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>
                  Amount to Deposit
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748B'
                  }}>
                    <DollarSign size={18} />
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="100"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                  Minimum deposit amount: $100.00
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '12px' }}>
                  Payment Method
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div 
                    onClick={() => setMethod('wire')}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: `2px solid ${method === 'wire' ? '#1E3A5F' : '#E2E8F0'}`,
                      backgroundColor: method === 'wire' ? '#F0F9FF' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: '#E0F2FE',
                      color: '#0369A1'
                    }}>
                      <Building2 size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>Wire Transfer</div>
                      <div style={{ fontSize: '13px', color: '#64748B' }}>1-2 business days • No limit</div>
                    </div>
                    {method === 'wire' && <CheckCircle size={20} color="#1E3A5F" />}
                  </div>

                  <div 
                    onClick={() => setMethod('ach')}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: `2px solid ${method === 'ach' ? '#1E3A5F' : '#E2E8F0'}`,
                      backgroundColor: method === 'ach' ? '#F0F9FF' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: '#E0F2FE',
                      color: '#0369A1'
                    }}>
                      <CreditCard size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>ACH Transfer</div>
                      <div style={{ fontSize: '13px', color: '#64748B' }}>3-5 business days • Max $50,000</div>
                    </div>
                    {method === 'ach' && <CheckCircle size={20} color="#1E3A5F" />}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#1E3A5F',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                Initiate Deposit <ArrowRight size={18} />
              </button>
            </form>
          </div>

          {/* Right Column: Bank Instructions */}
          <div style={{
            backgroundColor: '#F1F5F9',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={20} color="#1E3A5F" />
              Banking Instructions
            </h2>
            
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px', lineHeight: '1.5' }}>
              Please use the details below to complete your transfer. Your account will be credited once we receive the funds.
            </p>

            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #E2E8F0',
              marginBottom: '20px'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Bank Name</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>First Republic Bank</div>
                  <Copy 
                    size={16} 
                    color="#64748B" 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => copyToClipboard('First Republic Bank')}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Account Holder Name</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>PCIG Holdings, LLC</div>
                  <Copy 
                    size={16} 
                    color="#64748B" 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => copyToClipboard('PCIG Holdings, LLC')}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Account Number</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>1234567890</div>
                  <Copy 
                    size={16} 
                    color="#64748B" 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => copyToClipboard('1234567890')}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Routing Number (ABA)</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>021000021</div>
                  <Copy 
                    size={16} 
                    color="#64748B" 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => copyToClipboard('021000021')}
                  />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Reference / Memo</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>INV-88392-DEP</div>
                  <Copy 
                    size={16} 
                    color="#64748B" 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => copyToClipboard('INV-88392-DEP')}
                  />
                </div>
                <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px' }}>
                  * Important: Include this reference code in your transfer description.
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <Info size={18} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: '1.4' }}>
                Deposits are typically processed within 1-3 business days. You will receive an email confirmation once the funds are available in your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
