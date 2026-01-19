import { CSSProperties, useState } from 'react';
import {
  CheckCircle2,
  Lock,
  CreditCard,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

export default function LawyerPayoffPortal() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [nameOnCard, setNameOnCard] = useState('James Smith');
  const [billingAddress, setBillingAddress] = useState('123 Legal Ave, Ste 400');
  const [billingCity, setBillingCity] = useState('Miami');
  const [billingState, setBillingState] = useState('FL');
  const [billingZip, setBillingZip] = useState('33131');

  const pageWrapperStyle: CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
    overflowX: 'hidden'
  };

  const recentRequests = [
    {
      id: '1',
      address: '4500 NW 27th Ave',
      status: 'Ready',
      statusColor: '#10B981',
      statusBg: '#DCFCE7'
    },
    {
      id: '2',
      address: '8921 SW 40th St',
      status: 'Review',
      statusColor: '#8B5CF6',
      statusBg: '#E0E7FF'
    },
    {
      id: '3',
      address: '123 Biscayne Blvd',
      status: 'Pending',
      statusColor: '#F59E0B',
      statusBg: '#FEF3C7'
    }
  ];

  return (
    <div style={pageWrapperStyle}>
      <AdminNav />

      <div
        style={{
          padding: isMobile ? '20px 16px' : isTablet ? '24px 24px' : '32px 48px',
          maxWidth: '1400px',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: isMobile ? 24 : 32 }}>
          <h1
            style={{
              fontSize: isMobile ? 'clamp(24px, 5vw, 32px)' : '32px',
              fontWeight: 700,
              color: '#0F172A',
              marginBottom: 8,
              margin: 0
            }}
          >
            New Payoff Request
          </h1>
          {!isMobile && (
            <p
              style={{
                fontSize: `clamp(14px, 2vw, 16px)`,
                color: '#64748B',
                margin: 0
              }}
            >
              Complete the payment below to process your payoff request.
            </p>
          )}
        </div>

        {/* Step Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 8 : 24,
            marginBottom: isMobile ? 24 : 40,
            paddingBottom: 24,
            borderBottom: '1px solid #E2E8F0',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            overflowX: isMobileOrTablet ? 'auto' : 'visible'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <CheckCircle2 style={{ width: `clamp(18px, 2.5vw, 20px)`, height: `clamp(18px, 2.5vw, 20px)`, color: '#10B981' }} />
            <span style={{ fontSize: `clamp(12px, 1.5vw, 14px)`, fontWeight: 500, color: '#10B981', whiteSpace: 'nowrap' }}>Property</span>
          </div>
          {!isMobile && <ChevronRight style={{ width: 16, height: 16, color: '#CBD5E1', flexShrink: 0 }} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <CheckCircle2 style={{ width: `clamp(18px, 2.5vw, 20px)`, height: `clamp(18px, 2.5vw, 20px)`, color: '#10B981' }} />
            <span style={{ fontSize: `clamp(12px, 1.5vw, 14px)`, fontWeight: 500, color: '#10B981', whiteSpace: 'nowrap' }}>Client Info</span>
          </div>
          {!isMobile && <ChevronRight style={{ width: 16, height: 16, color: '#CBD5E1', flexShrink: 0 }} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div
              style={{
                width: `clamp(22px, 3vw, 24px)`,
                height: `clamp(22px, 3vw, 24px)`,
                borderRadius: '50%',
                backgroundColor: '#1E3A5F',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: `clamp(11px, 1.5vw, 12px)`,
                fontWeight: 600
              }}
            >
              3
            </div>
            <span style={{ fontSize: `clamp(12px, 1.5vw, 14px)`, fontWeight: 500, color: '#1E3A5F', whiteSpace: 'nowrap' }}>Payment</span>
          </div>
          {!isMobile && <ChevronRight style={{ width: 16, height: 16, color: '#CBD5E1', flexShrink: 0 }} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div
              style={{
                width: `clamp(22px, 3vw, 24px)`,
                height: `clamp(22px, 3vw, 24px)`,
                borderRadius: '50%',
                backgroundColor: '#F1F5F9',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: `clamp(11px, 1.5vw, 12px)`,
                fontWeight: 600
              }}
            >
              4
            </div>
            <span style={{ fontSize: `clamp(12px, 1.5vw, 14px)`, fontWeight: 500, color: '#64748B', whiteSpace: 'nowrap' }}>Submit</span>
          </div>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '1fr 380px',
            gap: isMobile ? 24 : 32,
            alignItems: 'flex-start'
          }}
        >
          {/* Left Column - Form */}
          <div>
            {/* Property Identified */}
            <div
              style={{
                backgroundColor: '#F0FDF4',
                borderRadius: 12,
                border: '1px solid #BBF7D0',
                padding: isMobile ? '16px' : '20px',
                marginBottom: isMobile ? 20 : 24,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12
              }}
            >
              <CheckCircle2 style={{ width: `clamp(18px, 2.5vw, 20px)`, height: `clamp(18px, 2.5vw, 20px)`, color: '#10B981', marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: `clamp(13px, 1.8vw, 14px)`,
                    fontWeight: 600,
                    color: '#166534',
                    marginBottom: 8
                  }}
                >
                  Property Identified
                </div>
                <div style={{ fontSize: `clamp(14px, 2vw, 16px)`, fontWeight: 500, color: '#0F172A', marginBottom: 4 }}>
                  1240 Oak Street, Miami, FL 33133
                </div>
                <div style={{ fontSize: `clamp(12px, 1.8vw, 14px)`, color: '#64748B', wordBreak: 'break-word' }}>
                  Parcel ID: 01-4138-005-1230
                  <button
                    style={{
                      marginLeft: 8,
                      fontSize: `clamp(12px, 1.8vw, 14px)`,
                      fontWeight: 500,
                      color: '#1E3A5F',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div
              style={{
                backgroundColor: '#F0FDF4',
                borderRadius: 12,
                border: '1px solid #BBF7D0',
                padding: isMobile ? '16px' : '20px',
                marginBottom: isMobile ? 20 : 24,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12
              }}
            >
              <CheckCircle2 style={{ width: `clamp(18px, 2.5vw, 20px)`, height: `clamp(18px, 2.5vw, 20px)`, color: '#10B981', marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: `clamp(13px, 1.8vw, 14px)`,
                    fontWeight: 600,
                    color: '#166534',
                    marginBottom: 8
                  }}
                >
                  Client Information
                </div>
                <div style={{ fontSize: `clamp(14px, 2vw, 16px)`, fontWeight: 500, color: '#0F172A', marginBottom: 4 }}>
                  John Doe (Owner)
                </div>
                <div style={{ fontSize: `clamp(12px, 1.8vw, 14px)`, color: '#64748B', wordBreak: 'break-word' }}>
                  Represented by: James Smith, Esq.
                  <button
                    style={{
                      marginLeft: 8,
                      fontSize: `clamp(12px, 1.8vw, 14px)`,
                      fontWeight: 500,
                      color: '#1E3A5F',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Pay Request Fee */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: isMobile ? '20px' : '24px',
                marginBottom: isMobile ? 20 : 24
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 20,
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                  gap: isMobile ? 12 : 0
                }}
              >
                <h2
                  style={{
                    fontSize: `clamp(16px, 2.2vw, 18px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                    margin: 0
                  }}
                >
                  Pay Request Fee
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <Lock style={{ width: `clamp(12px, 1.8vw, 14px)`, height: `clamp(12px, 1.8vw, 14px)`, color: '#64748B' }} />
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    Secure Payment via Stripe
                  </span>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: '#DBEAFE',
                  borderRadius: 8,
                  padding: isMobile ? '12px 16px' : '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                  gap: isMobile ? 8 : 0
                }}
              >
                <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, fontWeight: 500, color: '#1E40AF' }}>
                  Administrative Processing Fee
                </span>
                <span style={{ fontSize: `clamp(16px, 2.2vw, 18px)`, fontWeight: 700, color: '#1E3A5F' }}>
                  $50.00
                </span>
              </div>
            </div>

            {/* Card Information */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 24,
                marginBottom: 24
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: 20,
                  margin: 0
                }}
              >
                Card Information
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 8
                    }}
                  >
                    Card number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 20,
                        height: 20,
                        color: '#94A3B8'
                      }}
                    />
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 44px',
                        fontSize: '14px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 8,
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A'
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#0F172A',
                        marginBottom: 8
                      }}
                    >
                      MM / YY
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM / YY"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '14px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 8,
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A'
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#0F172A',
                        marginBottom: 8
                      }}
                    >
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value)}
                      placeholder="CVC"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '14px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 8,
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Name on Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 24,
                marginBottom: 24
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: 20,
                  margin: 0
                }}
              >
                Name on Card
              </h2>
              <input
                type="text"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #CBD5E1',
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A'
                }}
              />
            </div>

            {/* Billing Address */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 24,
                marginBottom: 24
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: 20,
                  margin: 0
                }}
              >
                Billing Address
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <input
                    type="text"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #CBD5E1',
                      borderRadius: 8,
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A'
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <input
                      type="text"
                      value={billingCity}
                      onChange={(e) => setBillingCity(e.target.value)}
                      placeholder="City"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '14px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 8,
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A'
                      }}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={billingState}
                      onChange={(e) => setBillingState(e.target.value)}
                      placeholder="State"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '14px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 8,
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A'
                      }}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={billingZip}
                      onChange={(e) => setBillingZip(e.target.value)}
                      placeholder="ZIP"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '14px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 8,
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: '#1E3A5F',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              Pay $50.00 & Continue
            </button>
          </div>

          {/* Right Column - Sidebar */}
          <div style={{ order: isMobileOrTablet ? -1 : 0 }}>
            {/* Recent Requests */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: isMobile ? '20px' : '24px',
                marginBottom: isMobile ? 20 : 24
              }}
            >
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
                    fontSize: `clamp(16px, 2.2vw, 18px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                    margin: 0
                  }}
                >
                  Recent Requests
                </h3>
                <button
                  style={{
                    fontSize: `clamp(13px, 1.8vw, 14px)`,
                    fontWeight: 500,
                    color: '#1E3A5F',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  View All
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC'
                    }}
                  >
                    <div style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, fontWeight: 500, color: '#0F172A', marginBottom: 8 }}>
                      {request.address}
                    </div>
                    <span
                      style={{
                        fontSize: `clamp(11px, 1.5vw, 12px)`,
                        fontWeight: 500,
                        color: request.statusColor,
                        backgroundColor: request.statusBg,
                        padding: '4px 8px',
                        borderRadius: 4,
                        display: 'inline-block'
                      }}
                    >
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Need Assistance? */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: isMobile ? '20px' : '24px'
              }}
            >
              <h3
                style={{
                  fontSize: `clamp(16px, 2.2vw, 18px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: 12,
                  margin: 0
                }}
              >
                Need Assistance?
              </h3>
              <p
                style={{
                  fontSize: `clamp(13px, 1.8vw, 14px)`,
                  color: '#64748B',
                  marginBottom: 20,
                  marginTop: 0,
                  lineHeight: '1.5'
                }}
              >
                Contact our legal support team for expedited requests or payment issues.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Phone style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)`, color: '#64748B', flexShrink: 0 }} />
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, color: '#475569', wordBreak: 'break-word' }}>(888) 555-LAW1</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Mail style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)`, color: '#64748B', flexShrink: 0 }} />
                  <span style={{ fontSize: `clamp(13px, 1.8vw, 14px)`, color: '#475569', wordBreak: 'break-word' }}>legal@taxdeedinvest.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

