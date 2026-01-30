import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  User,
  CheckCircle2,
  FileText,
  Upload,
  Eye,
  Trash2,
  Lightbulb,
  Camera,
  ArrowLeft,
  ArrowRight,
  MapPin,
  CreditCard,
  Lock
} from 'lucide-react';
import InvestorNav from '../../components/investor/InvestorNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

export default function KYCVerification() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [ssnTaxId, setSsnTaxId] = useState('');
  const [citizenship, setCitizenship] = useState('');

  // Address Verification state
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Financial Information state
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/investor/kyc/status');
      if (response.data.success) {
        const { verification, profile } = response.data.data;
        
        if (profile) {
          if (profile.dob) setDateOfBirth(profile.dob);
          if (profile.citizenship) setCitizenship(profile.citizenship);
          if (profile.ssn_encrypted) setSsnTaxId(profile.ssn_encrypted);
          
          if (profile.address_street) setStreetAddress(profile.address_street);
          if (profile.address_city) setCity(profile.address_city);
          if (profile.address_state) setAddressState(profile.address_state);
          if (profile.address_zip) setZipCode(profile.address_zip);
          if (profile.address_country) setCountry(profile.address_country);
          
          if (profile.employment_status) setEmploymentStatus(profile.employment_status);
          if (profile.annual_income) setAnnualIncome(profile.annual_income);
          if (profile.source_of_funds) setSourceOfFunds(profile.source_of_funds);
          if (profile.bank_account_encrypted) setBankAccountNumber(profile.bank_account_encrypted);
          if (profile.routing_number) setRoutingNumber(profile.routing_number);
        }
        
        if (verification && verification.documents && verification.documents.length > 0) {
           setUploadedFile({ name: verification.documents[0].type, size: 'Unknown' });
        }
      }
    } catch (err) {
      console.error('Failed to fetch KYC status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadedFile({
        name: file.name,
        size: `${fileSizeMB} MB`
      });
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadedFile(null);
  };

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const payload = {
        dob: dateOfBirth,
        citizenship,
        address_street: streetAddress,
        address_city: city,
        address_state: addressState,
        address_zip: zipCode,
        address_country: country,
        employment_status: employmentStatus,
        annual_income: annualIncome,
        source_of_funds: sourceOfFunds,
        ssn: ssnTaxId,
        bank_account_number: bankAccountNumber,
        routing_number: routingNumber
      };

      // 1. Submit Profile Data
      await api.post('/investor/kyc/submit', payload);
      
      // 2. Upload Document if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('type', 'driver_license'); // Defaulting to driver_license
        
        await api.post('/investor/kyc/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
      }

      navigate('/investor/pending-approval');
    } catch (err: any) {
      console.error('Failed to submit KYC:', err);
      setError(err.response?.data?.message || 'Failed to submit verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      overflowX: 'hidden',
      maxWidth: '100vw'
    }}>
      {/* Header */}
      <InvestorNav />

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: `clamp(24px, 3vh, 32px) clamp(20px, 2.5vw, 32px)`,
      }}>
        {/* Title Section */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 4vh, 40px)' }}>
          <h1 style={{
            fontSize: `clamp(24px, 3vw, 32px)`,
            fontWeight: 600,
            color: '#0F172A',
            marginTop: 0,
            marginLeft: 0,
            marginRight: 0,
            marginBottom: 'clamp(8px, 1vh, 12px)'
          }}>
            Identity Verification
          </h1>
          <p style={{
            fontSize: `clamp(13px, 1.6vw, 15px)`,
            color: '#64748B',
            margin: 0
          }}>
            To comply with regulatory requirements, please verify your identity.
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{
          marginBottom: 'clamp(32px, 4vh, 40px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(8px, 1vw, 12px)',
          flexWrap: 'wrap'
        }}>
          {/* Step 1 - Personal Info (Completed) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1vw, 12px)' }}>
            <div style={{
              width: 'clamp(32px, 4vw, 40px)',
              height: 'clamp(32px, 4vw, 40px)',
              borderRadius: '50%',
              backgroundColor: '#1E3A5F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CheckCircle2 style={{ width: 'clamp(18px, 2.2vw, 22px)', height: 'clamp(18px, 2.2vw, 22px)', color: '#FFFFFF' }} />
            </div>
            <span style={{
              fontSize: `clamp(12px, 1.4vw, 14px)`,
              fontWeight: 500,
              color: '#0F172A',
              whiteSpace: 'nowrap'
            }}>
              Personal Info
            </span>
          </div>

          {/* Connector Line 1 */}
          <div style={{
            width: 'clamp(40px, 5vw, 60px)',
            height: '2px',
            backgroundColor: '#1E3A5F',
            flexShrink: 0
          }} />

          {/* Step 2 - Address */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1vw, 12px)' }}>
            <div style={{
              width: 'clamp(32px, 4vw, 40px)',
              height: 'clamp(32px, 4vw, 40px)',
              borderRadius: '50%',
              backgroundColor: '#1E3A5F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{
                fontSize: `clamp(14px, 1.6vw, 16px)`,
                fontWeight: 600,
                color: '#FFFFFF'
              }}>
                2
              </span>
            </div>
            <span style={{
              fontSize: `clamp(12px, 1.4vw, 14px)`,
              fontWeight: 500,
              color: '#0F172A',
              whiteSpace: 'nowrap'
            }}>
              Address
            </span>
          </div>

          {/* Connector Line 2 */}
          <div style={{
            width: 'clamp(40px, 5vw, 60px)',
            height: '2px',
            backgroundColor: '#E2E8F0',
            flexShrink: 0
          }} />

          {/* Step 3 - Financials */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1vw, 12px)' }}>
            <div style={{
              width: 'clamp(32px, 4vw, 40px)',
              height: 'clamp(32px, 4vw, 40px)',
              borderRadius: '50%',
              backgroundColor: '#E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{
                fontSize: `clamp(14px, 1.6vw, 16px)`,
                fontWeight: 600,
                color: '#64748B'
              }}>
                3
              </span>
            </div>
            <span style={{
              fontSize: `clamp(12px, 1.4vw, 14px)`,
              fontWeight: 500,
              color: '#64748B',
              whiteSpace: 'nowrap'
            }}>
              Financials
            </span>
          </div>

          {/* Connector Line 3 */}
          <div style={{
            width: 'clamp(40px, 5vw, 60px)',
            height: '2px',
            backgroundColor: '#E2E8F0',
            flexShrink: 0
          }} />

          {/* Step 4 - Review */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1vw, 12px)' }}>
            <div style={{
              width: 'clamp(32px, 4vw, 40px)',
              height: 'clamp(32px, 4vw, 40px)',
              borderRadius: '50%',
              backgroundColor: '#E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{
                fontSize: `clamp(14px, 1.6vw, 16px)`,
                fontWeight: 600,
                color: '#64748B'
              }}>
                4
              </span>
            </div>
            <span style={{
              fontSize: `clamp(12px, 1.4vw, 14px)`,
              fontWeight: 500,
              color: '#64748B',
              whiteSpace: 'nowrap'
            }}>
              Review
            </span>
          </div>

          {/* Connector Line 4 */}
          <div style={{
            width: 'clamp(40px, 5vw, 60px)',
            height: '2px',
            backgroundColor: '#E2E8F0',
            flexShrink: 0
          }} />

          {/* Step 5 - Review */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1vw, 12px)' }}>
            <div style={{
              width: 'clamp(32px, 4vw, 40px)',
              height: 'clamp(32px, 4vw, 40px)',
              borderRadius: '50%',
              backgroundColor: '#E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{
                fontSize: `clamp(14px, 1.6vw, 16px)`,
                fontWeight: 600,
                color: '#64748B'
              }}>
                5
              </span>
            </div>
            <span style={{
              fontSize: `clamp(12px, 1.4vw, 14px)`,
              fontWeight: 500,
              color: '#64748B',
              whiteSpace: 'nowrap'
            }}>
              Review
            </span>
          </div>
        </div>

        {/* Content Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 2.5vh, 24px)' }}>
          {/* Personal Information Section (Completed) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: 'clamp(20px, 2.5vh, 24px)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(16px, 2vh, 20px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 'clamp(32px, 4vw, 40px)',
                  height: 'clamp(32px, 4vw, 40px)',
                  borderRadius: '8px',
                  backgroundColor: '#E6EEF9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User style={{ width: 'clamp(18px, 2.2vw, 20px)', height: 'clamp(18px, 2.2vw, 20px)', color: '#1E3A5F' }} />
                </div>
                <h3 style={{
                  fontSize: `clamp(16px, 2vw, 18px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  margin: 0
                }}>
                  Personal Information
                </h3>
              </div>
              <span style={{
                padding: '4px 12px',
                fontSize: `clamp(12px, 1.3vw, 13px)`,
                fontWeight: 500,
                color: '#10B981',
                backgroundColor: '#E6EEF9',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                Completed
              </span>
            </div>

            {/* Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobileOrTablet ? '1fr' : '1fr 1fr',
              gap: 'clamp(16px, 2vh, 20px)'
            }}>
              <div>
                <label style={{
                  fontSize: `clamp(12px, 1.4vw, 13px)`,
                  color: '#64748B',
                  marginBottom: 'clamp(6px, 0.8vh, 8px)',
                  display: 'block',
                  fontWeight: 500
                }}>
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(14px, 1.6vw, 16px)`,
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1E3A5F';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                  }}
                />
              </div>
              <div>
                <label style={{
                  fontSize: `clamp(12px, 1.4vw, 13px)`,
                  color: '#64748B',
                  marginBottom: 'clamp(6px, 0.8vh, 8px)',
                  display: 'block',
                  fontWeight: 500
                }}>
                  Date of Birth
                </label>
                <input
                  type="text"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  placeholder="MM/DD/YYYY"
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(14px, 1.6vw, 16px)`,
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1E3A5F';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                  }}
                />
              </div>
              <div>
                <label style={{
                  fontSize: `clamp(12px, 1.4vw, 13px)`,
                  color: '#64748B',
                  marginBottom: 'clamp(6px, 0.8vh, 8px)',
                  display: 'block',
                  fontWeight: 500
                }}>
                  SSN / Tax ID
                </label>
                <input
                  type="text"
                  value={ssnTaxId}
                  onChange={(e) => setSsnTaxId(e.target.value)}
                  placeholder="XXX-XX-XXXX"
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(14px, 1.6vw, 16px)`,
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1E3A5F';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                  }}
                />
              </div>
              <div>
                <label style={{
                  fontSize: `clamp(12px, 1.4vw, 13px)`,
                  color: '#64748B',
                  marginBottom: 'clamp(6px, 0.8vh, 8px)',
                  display: 'block',
                  fontWeight: 500
                }}>
                  Citizenship
                </label>
                <input
                  type="text"
                  value={citizenship}
                  onChange={(e) => setCitizenship(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(14px, 1.6vw, 16px)`,
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1E3A5F';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Identity Documents Section (In Progress) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: 'clamp(20px, 2.5vh, 24px)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(20px, 2.5vh, 24px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 'clamp(32px, 4vw, 40px)',
                  height: 'clamp(32px, 4vw, 40px)',
                  borderRadius: '8px',
                  backgroundColor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FileText style={{ width: 'clamp(18px, 2.2vw, 20px)', height: 'clamp(18px, 2.2vw, 20px)', color: '#64748B' }} />
                </div>
                <h3 style={{
                  fontSize: `clamp(16px, 2vw, 18px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  margin: 0
                }}>
                  Identity Documents
                </h3>
              </div>
              <span style={{
                padding: '4px 12px',
                fontSize: `clamp(12px, 1.3vw, 13px)`,
                fontWeight: 500,
                color: '#64748B',
                backgroundColor: '#F1F5F9',
                borderRadius: '12px'
              }}>
                In Progress
              </span>
            </div>

            {/* Government-Issued Photo ID */}
            <div style={{ marginBottom: 'clamp(24px, 3vh, 32px)' }}>
              <div style={{
                fontSize: `clamp(14px, 1.6vw, 16px)`,
                fontWeight: 500,
                color: '#0F172A',
                marginBottom: 'clamp(8px, 1vh, 12px)'
              }}>
                Government-Issued Photo ID
              </div>
              <p style={{
                fontSize: `clamp(13px, 1.5vw, 14px)`,
                color: '#64748B',
                marginBottom: 'clamp(16px, 2vh, 20px)',
                marginTop: 0
              }}>
                Please upload a clear copy of your Driver's License, Passport, or State ID.
              </p>

              {/* Upload Area */}
              <div style={{
                border: '2px dashed #E2E8F0',
                borderRadius: '8px',
                padding: 'clamp(32px, 4vh, 48px)',
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                marginBottom: 'clamp(12px, 1.5vh, 16px)',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                position: 'relative'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1E3A5F';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept="image/jpeg,image/png,image/pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <Upload style={{
                  width: 'clamp(40px, 5vw, 48px)',
                  height: 'clamp(40px, 5vw, 48px)',
                  color: '#64748B',
                  margin: '0 auto clamp(12px, 1.5vh, 16px)',
                  display: 'block'
                }} />
                <div style={{
                  fontSize: `clamp(14px, 1.6vw, 16px)`,
                  fontWeight: 500,
                  color: '#0F172A',
                  marginBottom: '8px'
                }}>
                  Click to upload or drag and drop
                </div>
                <div style={{
                  fontSize: `clamp(12px, 1.4vw, 13px)`,
                  color: '#64748B'
                }}>
                  JPG, PNG or PDF (max 10MB)
                </div>
              </div>

              {/* Uploaded File */}
              {uploadedFile && (
                <div style={{
                  display: 'flex',
                  flexDirection: isMobileOrTablet ? 'column' : 'row',
                  alignItems: isMobileOrTablet ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  padding: 'clamp(12px, 1.5vh, 16px)',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  gap: isMobileOrTablet ? 'clamp(12px, 1.5vh, 16px)' : '0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flex: 1,
                    minWidth: 0,
                    flexDirection: isMobileOrTablet ? 'row' : 'row'
                  }}>
                    <FileText style={{
                      width: 'clamp(20px, 2.5vw, 24px)',
                      height: 'clamp(20px, 2.5vw, 24px)',
                      color: '#64748B',
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: `clamp(13px, 1.5vw, 14px)`,
                        fontWeight: 500,
                        color: '#0F172A',
                        marginBottom: '4px',
                        wordWrap: 'break-word',
                        wordBreak: 'break-word'
                      }}>
                        {uploadedFile.name}
                      </div>
                      <div style={{
                        fontSize: `clamp(12px, 1.3vw, 13px)`,
                        color: '#64748B'
                      }}>
                        {uploadedFile.size}
                      </div>
                    </div>
                    {!isMobileOrTablet && (
                      <span style={{
                        padding: '4px 12px',
                        fontSize: `clamp(11px, 1.2vw, 12px)`,
                        fontWeight: 500,
                        color: '#10B981',
                        backgroundColor: '#E6EEF9',
                        borderRadius: '12px',
                        marginRight: '12px',
                        flexShrink: 0,
                        whiteSpace: 'nowrap'
                      }}>
                        Ready to upload
                      </span>
                    )}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexShrink: 0,
                    justifyContent: isMobileOrTablet ? 'space-between' : 'flex-end',
                    width: isMobileOrTablet ? '100%' : 'auto'
                  }}>
                    {isMobileOrTablet && (
                      <span style={{
                        padding: '4px 12px',
                        fontSize: `clamp(11px, 1.2vw, 12px)`,
                        fontWeight: 500,
                        color: '#10B981',
                        backgroundColor: '#E6EEF9',
                        borderRadius: '12px',
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        Ready to upload
                      </span>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{
                        width: 'clamp(32px, 4vw, 36px)',
                        height: 'clamp(32px, 4vw, 36px)',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}>
                        <Eye style={{ width: 'clamp(16px, 2vw, 18px)', height: 'clamp(16px, 2vw, 18px)', color: '#64748B' }} />
                      </button>
                      <button
                        onClick={handleRemoveFile}
                        style={{
                          width: 'clamp(32px, 4vw, 36px)',
                          height: 'clamp(32px, 4vw, 36px)',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        <Trash2 style={{ width: 'clamp(16px, 2vw, 18px)', height: 'clamp(16px, 2vw, 18px)', color: '#DC2626' }} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tips Section */}
              <div style={{
                marginTop: 'clamp(20px, 2.5vh, 24px)',
                padding: 'clamp(16px, 2vh, 20px)',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: 'clamp(12px, 1.5vh, 16px)'
                }}>
                  <Lightbulb style={{
                    width: 'clamp(18px, 2.2vw, 20px)',
                    height: 'clamp(18px, 2.2vw, 20px)',
                    color: '#F59E0B',
                    flexShrink: 0,
                    marginTop: '2px'
                  }} />
                  <div style={{
                    fontSize: `clamp(13px, 1.5vw, 14px)`,
                    fontWeight: 500,
                    color: '#0F172A'
                  }}>
                    Tips for successful verification
                  </div>
                </div>
                <ul style={{
                  margin: 0,
                  paddingLeft: 'clamp(32px, 4vw, 40px)',
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(8px, 1vh, 10px)'
                }}>
                  <li style={{
                    fontSize: `clamp(13px, 1.5vw, 14px)`,
                    color: '#64748B',
                    position: 'relative'
                  }}>
                    <span style={{ position: 'absolute', left: '-20px' }}>•</span>
                    Make sure all 4 corners of the document are visible
                  </li>
                  <li style={{
                    fontSize: `clamp(13px, 1.5vw, 14px)`,
                    color: '#64748B',
                    position: 'relative'
                  }}>
                    <span style={{ position: 'absolute', left: '-20px' }}>•</span>
                    Avoid glare and ensure text is readable
                  </li>
                  <li style={{
                    fontSize: `clamp(13px, 1.5vw, 14px)`,
                    color: '#64748B',
                    position: 'relative'
                  }}>
                    <span style={{ position: 'absolute', left: '-20px' }}>•</span>
                    Document must be valid and not expired
                  </li>
                </ul>
              </div>
            </div>

            {/* Selfie Verification */}
            <div style={{
              borderTop: '1px solid #E2E8F0',
              paddingTop: 'clamp(20px, 2.5vh, 24px)',
              marginTop: 'clamp(20px, 2.5vh, 24px)'
            }}>
              <div style={{
                fontSize: `clamp(14px, 1.6vw, 16px)`,
                fontWeight: 500,
                color: '#0F172A',
                marginBottom: 'clamp(8px, 1vh, 12px)'
              }}>
                Selfie Verification (Liveness Check)
              </div>
              <p style={{
                fontSize: `clamp(13px, 1.5vw, 14px)`,
                color: '#64748B',
                marginBottom: 'clamp(16px, 2vh, 20px)',
                marginTop: 0,
                lineHeight: '1.5'
              }}>
                Take a selfie holding your ID next to your face to verify ownership.
              </p>
              <button style={{
                padding: `clamp(12px, 1.5vh, 14px) clamp(20px, 2.5vw, 24px)`,
                fontSize: `clamp(14px, 1.6vw, 16px)`,
                fontWeight: 500,
                color: '#1E3A5F',
                backgroundColor: '#FFFFFF',
                border: '1px solid #1E3A5F',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: isMobileOrTablet ? '100%' : 'auto'
              }}>
                <Camera style={{ width: 'clamp(18px, 2.2vw, 20px)', height: 'clamp(18px, 2.2vw, 20px)' }} />
                Open Camera
              </button>
            </div>
          </div>

          {/* Address Verification Section */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: 'clamp(20px, 2.5vh, 24px)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(20px, 2.5vh, 24px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 'clamp(32px, 4vw, 40px)',
                  height: 'clamp(32px, 4vw, 40px)',
                  borderRadius: '8px',
                  backgroundColor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <MapPin style={{ width: 'clamp(18px, 2.2vw, 20px)', height: 'clamp(18px, 2.2vw, 20px)', color: '#64748B' }} />
                </div>
                <h3 style={{
                  fontSize: `clamp(16px, 2vw, 18px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  margin: 0
                }}>
                  Address Verification
                </h3>
              </div>
              <span style={{
                padding: '4px 12px',
                fontSize: `clamp(12px, 1.3vw, 13px)`,
                fontWeight: 500,
                color: '#64748B',
                backgroundColor: '#F1F5F9',
                borderRadius: '12px'
              }}>
                In Progress
              </span>
            </div>

            {/* Address Fields */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobileOrTablet ? '1fr' : '1fr 1fr',
              gap: 'clamp(16px, 2vh, 20px)'
            }}>
              <div style={{ gridColumn: isMobileOrTablet ? '1' : '1 / -1' }}>
                <label style={{
                  fontSize: `clamp(12px, 1.4vw, 13px)`,
                  color: '#64748B',
                  marginBottom: 'clamp(6px, 0.8vh, 8px)',
                  display: 'block',
                  fontWeight: 500
                }}>
                  Street Address
                </label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="123 Main Street"
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(14px, 1.6vw, 16px)`,
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1E3A5F';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                  }}
                />
              </div>
              <div>
                <label style={{
                  fontSize: `clamp(12px, 1.4vw, 13px)`,
                  color: '#64748B',
                  marginBottom: 'clamp(6px, 0.8vh, 8px)',
                  display: 'block',
                  fontWeight: 500
                }}>
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(14px, 1.6vw, 16px)`,
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1E3A5F';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                  }}
                />
              </div>
              <div>
                <label style={{
                  fontSize: `clamp(12px, 1.4vw, 13px)`,
                  color: '#64748B',
                  marginBottom: 'clamp(6px, 0.8vh, 8px)',
                  display: 'block',
                  fontWeight: 500
                }}>
                  State
                </label>
                <input
                  type="text"
                  value={addressState}
                  onChange={(e) => setAddressState(e.target.value)}
                  placeholder="NY"
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(14px, 1.6vw, 16px)`,
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1E3A5F';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                  }}
                />
              </div>
              <div>
                <label style={{
                  fontSize: `clamp(12px, 1.4vw, 13px)`,
                  color: '#64748B',
                  marginBottom: 'clamp(6px, 0.8vh, 8px)',
                  display: 'block',
                  fontWeight: 500
                }}>
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="10001"
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(14px, 1.6vw, 16px)`,
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1E3A5F';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                  }}
                />
              </div>
              <div>
                <label style={{
                  fontSize: `clamp(12px, 1.4vw, 13px)`,
                  color: '#64748B',
                  marginBottom: 'clamp(6px, 0.8vh, 8px)',
                  display: 'block',
                  fontWeight: 500
                }}>
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="United States"
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(14px, 1.6vw, 16px)`,
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1E3A5F';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Financial Information Section */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: 'clamp(20px, 2.5vh, 24px)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(20px, 2.5vh, 24px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 'clamp(32px, 4vw, 40px)',
                  height: 'clamp(32px, 4vw, 40px)',
                  borderRadius: '8px',
                  backgroundColor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <CreditCard style={{ width: 'clamp(18px, 2.2vw, 20px)', height: 'clamp(18px, 2.2vw, 20px)', color: '#64748B' }} />
                </div>
                <h3 style={{
                  fontSize: `clamp(16px, 2vw, 18px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  margin: 0
                }}>
                  Financial Information
                </h3>
              </div>
              <span style={{
                padding: '4px 12px',
                fontSize: `clamp(12px, 1.3vw, 13px)`,
                fontWeight: 500,
                color: '#64748B',
                backgroundColor: '#F1F5F9',
                borderRadius: '12px'
              }}>
                In Progress
              </span>
            </div>

            {/* Financial Fields */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobileOrTablet ? '1fr' : '1fr 1fr',
              gap: 'clamp(16px, 2vh, 20px)'
            }}>
              <div>
                <label style={{
                  fontSize: `clamp(12px, 1.4vw, 13px)`,
                  color: '#64748B',
                  marginBottom: 'clamp(6px, 0.8vh, 8px)',
                  display: 'block',
                  fontWeight: 500
                }}>
                  Employment Status
                </label>
                <input
                  type="text"
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value)}
                  placeholder="Employed / Self-Employed / Retired"
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(14px, 1.6vw, 16px)`,
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1E3A5F';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                  }}
                />
              </div>
              <div>
                <label style={{
                  fontSize: `clamp(12px, 1.4vw, 13px)`,
                  color: '#64748B',
                  marginBottom: 'clamp(6px, 0.8vh, 8px)',
                  display: 'block',
                  fontWeight: 500
                }}>
                  Annual Income
                </label>
                <input
                  type="text"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(e.target.value)}
                  placeholder="$50,000 - $100,000"
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(14px, 1.6vw, 16px)`,
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1E3A5F';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                  }}
                />
              </div>
              <div style={{ gridColumn: isMobileOrTablet ? '1' : '1 / -1' }}>
                <label style={{
                  fontSize: `clamp(12px, 1.4vw, 13px)`,
                  color: '#64748B',
                  marginBottom: 'clamp(6px, 0.8vh, 8px)',
                  display: 'block',
                  fontWeight: 500
                }}>
                  Source of Funds
                </label>
                <input
                  type="text"
                  value={sourceOfFunds}
                  onChange={(e) => setSourceOfFunds(e.target.value)}
                  placeholder="Salary, Investments, Inheritance, etc."
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(14px, 1.6vw, 16px)`,
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1E3A5F';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                  }}
                />
              </div>
              <div>
                <label style={{
                  fontSize: `clamp(12px, 1.4vw, 13px)`,
                  color: '#64748B',
                  marginBottom: 'clamp(6px, 0.8vh, 8px)',
                  display: 'block',
                  fontWeight: 500
                }}>
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="**** **** ****"
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(14px, 1.6vw, 16px)`,
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1E3A5F';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                  }}
                />
              </div>
              <div>
                <label style={{
                  fontSize: `clamp(12px, 1.4vw, 13px)`,
                  color: '#64748B',
                  marginBottom: 'clamp(6px, 0.8vh, 8px)',
                  display: 'block',
                  fontWeight: 500
                }}>
                  Routing Number
                </label>
                <input
                  type="text"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  placeholder="123456789"
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(14px, 1.6vw, 16px)`,
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1E3A5F';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'clamp(32px, 4vh, 40px)',
          gap: 'clamp(16px, 2vw, 20px)',
          flexDirection: isMobileOrTablet ? 'column-reverse' : 'row'
        }}>
          <button
            onClick={() => navigate('/auth/register')}
            style={{
              padding: `clamp(12px, 1.5vh, 14px) clamp(20px, 2.5vw, 24px)`,
              fontSize: `clamp(14px, 1.6vw, 16px)`,
              fontWeight: 500,
              color: '#1E3A5F',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: isMobileOrTablet ? '100%' : 'auto'
            }}
          >
            <ArrowLeft style={{ width: 'clamp(18px, 2.2vw, 20px)', height: 'clamp(18px, 2.2vw, 20px)' }} />
            Back
          </button>
          <button
            onClick={handleContinue}
            style={{
              padding: `clamp(12px, 1.5vh, 14px) clamp(20px, 2.5vw, 24px)`,
              fontSize: `clamp(14px, 1.6vw, 16px)`,
              fontWeight: 500,
              color: '#FFFFFF',
              backgroundColor: '#1E3A5F',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: isMobileOrTablet ? '100%' : 'auto'
            }}
          >
            Continue
            <ArrowRight style={{ width: 'clamp(18px, 2.2vw, 20px)', height: 'clamp(18px, 2.2vw, 20px)' }} />
          </button>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 'clamp(40px, 5vh, 48px)',
          paddingTop: 'clamp(20px, 2.5vh, 24px)',
          borderTop: '1px solid #E2E8F0',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(8px, 1vw, 12px)',
          flexWrap: 'wrap'
        }}>
          <Lock style={{ width: 'clamp(14px, 1.6vw, 16px)', height: 'clamp(14px, 1.6vw, 16px)', color: '#64748B', flexShrink: 0 }} />
          <span style={{
            fontSize: `clamp(12px, 1.4vw, 13px)`,
            color: '#64748B'
          }}>
            Your information is encrypted with 256-bit SSL security.{' '}
            <Link to="/privacy" style={{ color: '#1E3A5F', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            {' • '}
            <Link to="/terms" style={{ color: '#1E3A5F', textDecoration: 'none' }}>
              Terms of Service
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

