import { CSSProperties, useState } from 'react';
import {
  CheckCircle2,
  Upload,
  Clock,
  FileText,
  CreditCard,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

export default function RequestPropertyPayoff() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const [relationship, setRelationship] = useState('I am the Property Owner');
  const [firstName, setFirstName] = useState('Jane');
  const [lastName, setLastName] = useState('Doe');
  const [email, setEmail] = useState('jane.doe@example.com');
  const [phone, setPhone] = useState('(555) 123-4567');
  const [mailingAddress, setMailingAddress] = useState('123 Main St');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [certifyChecked, setCertifyChecked] = useState(false);

  const pageWrapperStyle: CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
    overflowX: 'hidden'
  };

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
            Request Property Payoff
          </h1>
          <p
            style={{
              fontSize: `clamp(14px, 2vw, 16px)`,
              color: '#64748B',
              margin: 0
            }}
          >
            Submit your information to receive an official payoff quote and payment instructions.
          </p>
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
            <span style={{ fontSize: `clamp(12px, 1.5vw, 14px)`, fontWeight: 500, color: '#10B981', whiteSpace: 'nowrap' }}>1 Search</span>
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
              2
            </div>
            <span style={{ fontSize: `clamp(12px, 1.5vw, 14px)`, fontWeight: 500, color: '#1E3A5F', whiteSpace: 'nowrap' }}>Request Details</span>
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
              3
            </div>
            <span style={{ fontSize: `clamp(12px, 1.5vw, 14px)`, fontWeight: 500, color: '#64748B', whiteSpace: 'nowrap' }}>Confirmation</span>
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
            {/* Selected Property */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: isMobile ? '16px' : '24px',
                marginBottom: isMobile ? 20 : 24
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  flexWrap: 'wrap',
                  gap: 8
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 style={{ width: `clamp(18px, 2.5vw, 20px)`, height: `clamp(18px, 2.5vw, 20px)`, color: '#10B981' }} />
                  <h2
                    style={{
                      fontSize: `clamp(16px, 2.2vw, 18px)`,
                      fontWeight: 600,
                      color: '#0F172A',
                      margin: 0
                    }}
                  >
                    Selected Property
                  </h2>
                </div>
                <button
                  style={{
                    fontSize: `clamp(12px, 1.5vw, 14px)`,
                    fontWeight: 500,
                    color: '#1E3A5F',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Change Property
                </button>
              </div>
              <div style={{ fontSize: `clamp(14px, 2vw, 16px)`, fontWeight: 500, color: '#0F172A', marginBottom: 8 }}>
                1240 Oak Street, Miami, FL 33133
              </div>
              <div style={{ fontSize: `clamp(12px, 1.5vw, 14px)`, color: '#64748B' }}>
                Parcel ID: 01-4138-005-1230
              </div>
              <div style={{ fontSize: `clamp(12px, 1.5vw, 14px)`, color: '#64748B' }}>
                County: Miami-Dade
              </div>
            </div>

            {/* Owner Information */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: isMobile ? '16px' : '24px',
                marginBottom: isMobile ? 20 : 24
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: isMobile ? 20 : 24
                }}
              >
                <div
                  style={{
                    width: `clamp(26px, 3.5vw, 28px)`,
                    height: `clamp(26px, 3.5vw, 28px)`,
                    borderRadius: '50%',
                    backgroundColor: '#1E3A5F',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: `clamp(13px, 1.8vw, 14px)`,
                    fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  2
                </div>
                <h2
                  style={{
                    fontSize: `clamp(16px, 2.2vw, 18px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                    margin: 0
                  }}
                >
                  Owner Information
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 20 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: `clamp(13px, 1.5vw, 14px)`,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 8
                    }}
                  >
                    Relationship to Property
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    style={{
                      width: '100%',
                      padding: `clamp(10px, 1.2vh, 12px) clamp(10px, 1.5vw, 12px)`,
                      fontSize: `clamp(13px, 1.5vw, 14px)`,
                      border: '1px solid #CBD5E1',
                      borderRadius: 8,
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                      cursor: 'pointer'
                    }}
                  >
                    <option>I am the Property Owner</option>
                    <option>Authorized Representative</option>
                    <option>Lawyer</option>
                    <option>Other</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 16 : 16 }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: `clamp(13px, 1.5vw, 14px)`,
                        fontWeight: 500,
                        color: '#0F172A',
                        marginBottom: 8
                      }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: `clamp(10px, 1.2vh, 12px) clamp(10px, 1.5vw, 12px)`,
                        fontSize: `clamp(13px, 1.5vw, 14px)`,
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
                        fontSize: `clamp(13px, 1.5vw, 14px)`,
                        fontWeight: 500,
                        color: '#0F172A',
                        marginBottom: 8
                      }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: `clamp(10px, 1.2vh, 12px) clamp(10px, 1.5vw, 12px)`,
                        fontSize: `clamp(13px, 1.5vw, 14px)`,
                        border: '1px solid #CBD5E1',
                        borderRadius: 8,
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: `clamp(13px, 1.5vw, 14px)`,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 8
                    }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: `clamp(10px, 1.2vh, 12px) clamp(10px, 1.5vw, 12px)`,
                      fontSize: `clamp(13px, 1.5vw, 14px)`,
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
                      fontSize: `clamp(13px, 1.5vw, 14px)`,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 8
                    }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: `clamp(10px, 1.2vh, 12px) clamp(10px, 1.5vw, 12px)`,
                      fontSize: `clamp(13px, 1.5vw, 14px)`,
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
                      fontSize: `clamp(13px, 1.5vw, 14px)`,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 8
                    }}
                  >
                    Mailing Address
                  </label>
                  <input
                    type="text"
                    value={mailingAddress}
                    onChange={(e) => setMailingAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: `clamp(10px, 1.2vh, 12px) clamp(10px, 1.5vw, 12px)`,
                      fontSize: `clamp(13px, 1.5vw, 14px)`,
                      border: '1px solid #CBD5E1',
                      borderRadius: 8,
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '2fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: `clamp(13px, 1.5vw, 14px)`,
                        fontWeight: 500,
                        color: '#0F172A',
                        marginBottom: 8
                      }}
                    >
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: `clamp(10px, 1.2vh, 12px) clamp(10px, 1.5vw, 12px)`,
                        fontSize: `clamp(13px, 1.5vw, 14px)`,
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
                        fontSize: `clamp(13px, 1.5vw, 14px)`,
                        fontWeight: 500,
                        color: '#0F172A',
                        marginBottom: 8
                      }}
                    >
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="FL"
                      style={{
                        width: '100%',
                        padding: `clamp(10px, 1.2vh, 12px) clamp(10px, 1.5vw, 12px)`,
                        fontSize: `clamp(13px, 1.5vw, 14px)`,
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
                        fontSize: `clamp(13px, 1.5vw, 14px)`,
                        fontWeight: 500,
                        color: '#0F172A',
                        marginBottom: 8
                      }}
                    >
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: `clamp(10px, 1.2vh, 12px) clamp(10px, 1.5vw, 12px)`,
                        fontSize: `clamp(13px, 1.5vw, 14px)`,
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

            {/* Identity Verification */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: isMobile ? '16px' : '24px',
                marginBottom: isMobile ? 20 : 24
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16
                }}
              >
                <div
                  style={{
                    width: `clamp(26px, 3.5vw, 28px)`,
                    height: `clamp(26px, 3.5vw, 28px)`,
                    borderRadius: '50%',
                    backgroundColor: '#E6F6F2',
                    color: '#065F46',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: `clamp(13px, 1.8vw, 14px)`,
                    fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  3
                </div>
                <h2
                  style={{
                    fontSize: `clamp(16px, 2.2vw, 18px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                    margin: 0
                  }}
                >
                  Identity Verification
                </h2>
              </div>
              <p
                style={{
                  fontSize: `clamp(13px, 1.5vw, 14px)`,
                  color: '#64748B',
                  marginBottom: 8,
                  marginTop: 0
                }}
              >
                To protect property owners, we require a valid government-issued ID to process payoff requests.
              </p>
              <p
                style={{
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  fontWeight: 500,
                  color: '#475569',
                  marginBottom: 16,
                  marginTop: 0
                }}
              >
                Upload Driver's License or Government ID
              </p>
              <div
                style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: 12,
                  padding: isMobile ? '32px 16px' : '48px 24px',
                  textAlign: 'center',
                  backgroundColor: '#F8FAFC',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#94A3B8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
              >
                <Upload style={{ width: `clamp(40px, 5vw, 48px)`, height: `clamp(40px, 5vw, 48px)`, color: '#94A3B8', margin: '0 auto 16px' }} />
                <div style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, fontWeight: 500, color: '#475569', marginBottom: 4 }}>
                  Click to upload or drag and drop
                </div>
                <div style={{ fontSize: `clamp(11px, 1.3vw, 12px)`, color: '#94A3B8' }}>
                  PDF, PNG, JPG (Max 10MB)
                </div>
              </div>
            </div>

            {/* Review & Submit */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: isMobile ? '16px' : '24px',
                marginBottom: isMobile ? 20 : 24
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: isMobile ? 20 : 24
                }}
              >
                <div
                  style={{
                    width: `clamp(26px, 3.5vw, 28px)`,
                    height: `clamp(26px, 3.5vw, 28px)`,
                    borderRadius: '50%',
                    backgroundColor: '#E6F6F2',
                    color: '#065F46',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: `clamp(13px, 1.8vw, 14px)`,
                    fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  4
                </div>
                <h2
                  style={{
                    fontSize: `clamp(16px, 2.2vw, 18px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                    margin: 0
                  }}
                >
                  Review & Submit
                </h2>
              </div>

              <div style={{ marginBottom: isMobile ? 20 : 24 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: `clamp(13px, 1.5vw, 14px)`,
                    fontWeight: 500,
                    color: '#0F172A',
                    marginBottom: 8
                  }}
                >
                  Additional Notes / Purpose (Optional)
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="E.g., I need a quote for refinancing..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(10px, 1.5vw, 12px)`,
                    fontSize: `clamp(13px, 1.5vw, 14px)`,
                    border: '1px solid #CBD5E1',
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: isMobile ? 20 : 24 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={certifyChecked}
                    onChange={(e) => setCertifyChecked(e.target.checked)}
                    style={{
                      width: `clamp(16px, 2.2vw, 18px)`,
                      height: `clamp(16px, 2.2vw, 18px)`,
                      marginTop: 2,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  />
                  <span style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, color: '#475569', lineHeight: '1.5' }}>
                    I certify that I am the owner or authorized representative for this property. I understand that submitting this request does not stop any foreclosure proceedings until payment is received in full.
                  </span>
                </label>
              </div>

              <button
                style={{
                  width: '100%',
                  padding: `clamp(12px, 1.5vh, 14px) clamp(20px, 2.5vw, 24px)`,
                  fontSize: `clamp(14px, 2vw, 16px)`,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: '#1E3A5F',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  marginBottom: 12
                }}
              >
                Submit Payoff Request
              </button>
              <p style={{ fontSize: `clamp(11px, 1.3vw, 12px)`, color: '#94A3B8', textAlign: 'center', margin: 0 }}>
                Your information is secure and encrypted.
              </p>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div style={{ order: isMobileOrTablet ? -1 : 0 }}>
            {/* Need Help? */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: isMobile ? '16px' : '24px',
                marginBottom: isMobile ? 20 : 24
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div
                  style={{
                    width: `clamp(22px, 3vw, 24px)`,
                    height: `clamp(22px, 3vw, 24px)`,
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    color: '#1E3A5F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: `clamp(13px, 1.8vw, 14px)`,
                    fontWeight: 600
                  }}
                >
                  ?
                </div>
                <h3
                  style={{
                    fontSize: `clamp(16px, 2.2vw, 18px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                    margin: 0
                  }}
                >
                  Need Help?
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <Clock style={{ width: `clamp(16px, 2.2vw, 18px)`, height: `clamp(16px, 2.2vw, 18px)`, color: '#64748B', marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                        How long does it take?
                      </div>
                      <div style={{ fontSize: `clamp(12px, 1.5vw, 13px)`, color: '#64748B', lineHeight: '1.5' }}>
                        Most requests are reviewed within 1-2 business days.
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <FileText style={{ width: `clamp(16px, 2.2vw, 18px)`, height: `clamp(16px, 2.2vw, 18px)`, color: '#64748B', marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                        Documents Needed
                      </div>
                      <div style={{ fontSize: `clamp(12px, 1.5vw, 13px)`, color: '#64748B', lineHeight: '1.5' }}>
                        A valid government ID is required. If you are an heir or representative, additional docs may be needed.
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <CreditCard style={{ width: `clamp(16px, 2.2vw, 18px)`, height: `clamp(16px, 2.2vw, 18px)`, color: '#64748B', marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                        Payment Methods
                      </div>
                      <div style={{ fontSize: `clamp(12px, 1.5vw, 13px)`, color: '#64748B', lineHeight: '1.5' }}>
                        We accept Wire Transfer and Certified Checks. Instructions will be provided in the payoff letter.
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: 20,
                    borderTop: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>
                    Contact Support
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Phone style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)`, color: '#64748B', flexShrink: 0 }} />
                      <span style={{ fontSize: `clamp(12px, 1.5vw, 13px)`, color: '#475569' }}>(888) 555-0123</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Mail style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)`, color: '#64748B', flexShrink: 0 }} />
                      <span style={{ fontSize: `clamp(12px, 1.5vw, 13px)`, color: '#475569', wordBreak: 'break-word' }}>support@taxdeedinvest.com</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Clock style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)`, color: '#64748B', flexShrink: 0 }} />
                      <span style={{ fontSize: `clamp(12px, 1.5vw, 13px)`, color: '#475569' }}>Mon-Fri, 9am - 5pm EST</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Already Submitted? */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: isMobile ? '16px' : '24px'
              }}
            >
              <p
                style={{
                  fontSize: `clamp(13px, 1.5vw, 14px)`,
                  color: '#475569',
                  marginBottom: 16,
                  marginTop: 0,
                  lineHeight: '1.5'
                }}
              >
                Check the status of your existing payoff request.
              </p>
              <button
                style={{
                  width: '100%',
                  padding: `clamp(10px, 1.2vh, 12px) clamp(14px, 2vw, 16px)`,
                  fontSize: `clamp(13px, 1.5vw, 14px)`,
                  fontWeight: 500,
                  color: '#1E3A5F',
                  backgroundColor: 'transparent',
                  border: '1px solid #1E3A5F',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                Check Request Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

