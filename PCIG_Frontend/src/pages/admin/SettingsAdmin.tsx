import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { CSSProperties, useRef, useState, useEffect } from 'react';
import { Edit3, Trash2, ToggleRight, Loader2, AlertCircle, User, UserCircle, Shield, Lock, Camera, CheckCircle2 } from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import api from '../../services/api';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string>('County/State Config');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sectionParam = searchParams.get('section');
  const isProfileView = sectionParam === 'profile';

  // Profile State
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    photoUrl: null as string | null
  });
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isProfileView) {
        fetchProfile();
    }
  }, [isProfileView]);

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await api.get('/admin/settings/profile');
      if (response.data.success) {
        const { user, profile } = response.data.data;
        setProfileData({
          fullName: user.name,
          email: user.email,
          phone: profile?.phone || '',
          address: profile?.address || '',
          photoUrl: null
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfileError('Failed to load profile data.');
    } finally {
      setProfileLoading(false);
    }
  };

  const isMobile = useIsMobile();

  const renderProfileSection = () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>My Profile</h1>
            <p style={{ color: '#64748B' }}>Manage your account settings and preferences.</p>
        </div>

        {profileSuccess && (
            <div style={{ padding: '12px 16px', backgroundColor: '#F0FDF4', color: '#15803D', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={18} />
                {profileSuccess}
            </div>
        )}
        
        {profileError && (
            <div style={{ padding: '12px 16px', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={18} />
                {profileError}
            </div>
        )}

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
                <UserCircle size={24} color="#1E3A5F" />
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', margin: 0 }}>Personal Information</h2>
            </div>
            
            <div style={{ display: 'grid', gap: 16 }}>
                <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Full Name</label>
                    <input 
                        type="text" 
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Email Address</label>
                    <input 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Phone Number</label>
                    <input 
                        type="tel" 
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Address</label>
                    <input 
                        type="text" 
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                    />
                </div>
                
                <div style={{ marginTop: 8 }}>
                    <button 
                        onClick={handleUpdateProfile}
                        disabled={profileLoading}
                        style={{ 
                            padding: '10px 20px', 
                            backgroundColor: '#1E3A5F', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: 6, 
                            fontWeight: 500, 
                            cursor: profileLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            opacity: profileLoading ? 0.7 : 1
                        }}
                    >
                        {profileLoading && <Loader2 size={16} className="animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
                <Shield size={24} color="#1E3A5F" />
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', margin: 0 }}>Security</h2>
            </div>
            
            <div style={{ display: 'grid', gap: 16 }}>
                <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Current Password</label>
                    <input 
                        type="password" 
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 6 }}>New Password</label>
                    <input 
                        type="password" 
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Confirm New Password</label>
                    <input 
                        type="password" 
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                    />
                </div>
                
                <div style={{ marginTop: 8 }}>
                    <button 
                        onClick={handleChangePassword}
                        disabled={profileLoading}
                        style={{ 
                            padding: '10px 20px', 
                            backgroundColor: '#FFFFFF', 
                            color: '#1E3A5F', 
                            border: '1px solid #1E3A5F', 
                            borderRadius: 6, 
                            fontWeight: 500, 
                            cursor: profileLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            opacity: profileLoading ? 0.7 : 1
                        }}
                    >
                        {profileLoading && <Loader2 size={16} className="animate-spin" />}
                        Update Password
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  const handleUpdateProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      setProfileSuccess(null);

      const response = await api.put('/admin/settings/profile', {
        name: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address
      });

      if (response.data.success) {
        setProfileSuccess('Profile updated successfully.');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      setProfileError("New passwords do not match.");
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError(null);
      setProfileSuccess(null);

      const response = await api.put('/admin/settings/password', {
        current_password: securityData.currentPassword,
        password: securityData.newPassword,
        password_confirmation: securityData.confirmPassword
      });

      if (response.data.success) {
        setProfileSuccess('Password changed successfully.');
        setSecurityData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
      }
    } catch (err: any) {
      console.error('Error changing password:', err);
      setProfileError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setProfileLoading(false);
    }
  };
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  const countyRef = useRef<HTMLDivElement | null>(null);
  const interestRef = useRef<HTMLDivElement | null>(null);
  const workflowRef = useRef<HTMLDivElement | null>(null);
  const templatesRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<HTMLDivElement | null>(null);
  const shareRef = useRef<HTMLDivElement | null>(null);
  const depreciationRef = useRef<HTMLDivElement | null>(null);
  const systemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/settings/dashboard-data');
        if (response.data.success) {
          const data = response.data.data.settingsAdmin;
          setSettings(data);
          if (data.sidebar && data.sidebar.activeItem) {
            setActiveItem(data.sidebar.activeItem);
          }
        } else {
          setError('Failed to load settings data');
        }
      } catch (err) {
        console.error('Error fetching settings data:', err);
        setError('An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC' }}>
        <Loader2 className="animate-spin" size={48} color="#1E3A5F" />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC', gap: 16 }}>
        <AlertCircle size={48} color="#EF4444" />
        <p style={{ color: '#64748B', fontSize: 16 }}>{error || 'No data available'}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1E3A5F',
            color: 'white',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Safe data extraction
  const sidebar = settings?.sidebar || { sections: [] };
  const countyState = settings?.countyState || { 
    header: { title: 'County Configuration', subtitle: 'Manage county-specific settings' }, 
    tableHeaders: [], 
    rows: [], 
    editPanel: { 
      title: 'Edit Settings', 
      toggleLabel: 'Active', 
      fields: {}, 
      actions: { cancel: 'Cancel', save: 'Save Changes' } 
    },
    addButton: 'Add County'
  };

  const countyHeader = countyState?.header || { title: 'County Configuration', subtitle: '' };
  const countyTableHeaders = countyState?.tableHeaders || [];
  const countyRows = countyState?.rows || [];
  const countyEditPanel = countyState?.editPanel || { title: 'Edit Settings', toggleLabel: 'Active', fields: {} };
  const countyAddButton = countyState?.addButton || 'Add County';
  const interestModels = settings?.interestModels || { 
    header: { title: 'Interest Models', subtitle: 'Configure interest calculation' },
    methods: [],
    saveButton: 'Save'
  };
  const workflowConfig = settings?.workflowConfig || {
    header: { title: 'Workflow', subtitle: 'Configure workflow stages' },
    fifaStages: { title: 'FIFA Stages', stages: [], addStageButton: 'Add Stage', startButton: 'Save Workflow' }
  };
  const templatesLibrary = settings?.templatesLibrary || {};
  const apiIntegrations = settings?.apiIntegrations || {};
  const shareAllocations = settings?.shareAllocations || {};
  const depreciationSettings = settings?.depreciationSettings || {};
  const systemSettings = settings?.systemSettings || {};

  const scrollToSection = (item: string) => {
    setActiveItem(item);

    const refMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      'County/State Config': countyRef,
      'Interest Rates & Models': interestRef,
      'Workflow Configuration': workflowRef,
      'Templates Library': templatesRef,
      'API Integrations': apiRef,
      'Share & Allocations': shareRef,
      'Depreciation Settings': depreciationRef,
      'System Settings': systemRef
    };

    const ref = refMap[item];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const pageWrapperStyle: CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    width: '100%',
    maxWidth: '100vw',
    margin: 0,
    padding: 0,
    overflowX: 'hidden'
  };

  const mainContainerStyle: CSSProperties = {
    padding: isMobile ? '20px 16px' : isTablet ? '24px 24px' : '32px 48px',
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    boxSizing: 'border-box'
  };

  const cardStyle: CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E2E8F0',
    padding: 20,
    boxSizing: 'border-box'
  };

  if (isProfileView) {
    return (
      <div style={pageWrapperStyle}>
        <AdminNav />
        <div style={mainContainerStyle}>
          {renderProfileSection()}
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrapperStyle}>
      <AdminNav />

      <div style={mainContainerStyle}>
        {/* Main layout: sidebar + content */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '260px 1fr',
            gap: isMobileOrTablet ? 16 : 24,
            alignItems: 'flex-start',
            boxSizing: 'border-box'
          }}
        >
          {/* Left sidebar */}
          {!isMobileOrTablet && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 16,
                position: 'sticky',
                top: 24,
                alignSelf: 'flex-start'
              }}
            >
              {sidebar.sections.map((section: any) => (
                <div key={section.title} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#94A3B8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: 8
                    }}
                  >
                    {section.title}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {section.items.map((item: string) => {
                      const isActive = item === activeItem;
                      return (
                        <button
                          key={item}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 10px',
                            borderRadius: 8,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#1E3A5F' : '#64748B',
                            backgroundColor: isActive ? '#EFF6FF' : 'transparent'
                          }}
                          onClick={() => scrollToSection(item)}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Right content column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobileOrTablet ? 16 : 24,
              height: '100%',
              overflowY: isMobileOrTablet ? 'visible' : 'auto',
              paddingRight: isMobileOrTablet ? 0 : 4,
              minWidth: 0,
              boxSizing: 'border-box'
            }}
          >
            {/* County / State Configuration */}
            <div ref={countyRef} style={cardStyle}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#0F172A',
                      marginBottom: 4
                    }}
                  >
                    {countyHeader.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#64748B'
                    }}
                  >
                    {countyHeader.subtitle}
                  </div>
                </div>
                <button
                  style={{
                    padding: '9px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#1E3A5F',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  + {countyAddButton}
                </button>
              </div>

              {/* County table */}
              <div
                style={{
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  marginTop: 8,
                  marginBottom: 16
                }}
              >
                <div
                  style={{
                    width: '100%',
                    overflowX: isMobileOrTablet ? 'auto' : 'visible',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 13,
                      minWidth: isMobileOrTablet ? 600 : undefined
                    }}
                  >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB'
                      }}
                    >
                      {countyTableHeaders.map((h: string) => (
                        <th
                          key={h}
                          style={{
                            padding: '10px 14px',
                            textAlign: 'left',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: '#64748B',
                            fontWeight: 600
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {countyRows.map((row: any, idx: number) => (
                      <tr
                        key={row.id || idx}
                        style={{
                          borderBottom:
                            idx === countyRows.length - 1
                              ? 'none'
                              : '1px solid #E5E7EB',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        <td style={{ padding: '10px 14px' }}>{row?.county || '-'}</td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>{row?.state || '-'}</td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>
                          {row?.redemptionRate || '-'}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>
                          {row?.barmentPeriod || '-'}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 10px',
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 500,
                              backgroundColor: row?.status?.bg || '#F3F4F6',
                              color: row?.status?.color || '#374151'
                            }}
                          >
                            {row?.status?.label || 'Unknown'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 6,
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit3 style={{ width: 14, height: 14, color: '#64748B' }} />
                            </button>
                            <button
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 6,
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 style={{ width: 14, height: 14, color: '#64748B' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>

              {/* Edit configuration panel */}
              <div
                style={{
                  marginTop: 8,
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F9FAFB',
                  padding: 20
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0F172A'
                    }}
                  >
                    {countyEditPanel.title}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: '#64748B'
                    }}
                  >
                    <span>{countyEditPanel.toggleLabel}</span>
                    <ToggleRight style={{ width: 32, height: 32, color: '#15803D' }} />
                  </div>
                </div>

                {/* 2-column form layout */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1.2fr',
                    gap: 16,
                    marginBottom: 16
                  }}
                >
                  {/* Redemption rate */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#475569',
                        marginBottom: 4
                      }}
                    >
                      {countyEditPanel.fields?.redemptionInterestRate?.label || 'Interest Rate'}
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          padding: '9px 10px',
                          fontSize: 13,
                          color: '#0F172A',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        {countyEditPanel.fields?.redemptionInterestRate?.value || '0'}
                      </div>
                      <div
                        style={{
                          padding: '9px 12px',
                          fontSize: 12,
                          color: '#64748B',
                          backgroundColor: '#F9FAFB',
                          borderLeft: '1px solid #E2E8F0'
                        }}
                      >
                        {countyEditPanel.fields?.redemptionInterestRate?.suffix || '%'}
                      </div>
                    </div>
                  </div>

                  {/* Calculation method */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#475569',
                        marginBottom: 4
                      }}
                    >
                      {countyEditPanel.fields?.calculationMethod?.label || 'Method'}
                    </label>
                    <div
                      style={{
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        padding: '9px 10px',
                        fontSize: 13,
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      {countyEditPanel.fields?.calculationMethod?.options?.[0] || 'Standard'}
                    </div>
                  </div>

                  {/* Barment period */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#475569',
                        marginBottom: 4
                      }}
                    >
                      {countyEditPanel.fields?.barmentPeriod?.label || 'Barment Period'}
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          padding: '9px 10px',
                          fontSize: 13,
                          color: '#0F172A',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        {countyEditPanel.fields?.barmentPeriod?.value || '0'}
                      </div>
                      <div
                        style={{
                          padding: '9px 12px',
                          fontSize: 12,
                          color: '#64748B',
                          backgroundColor: '#F9FAFB',
                          borderLeft: '1px solid #E2E8F0'
                        }}
                      >
                        {countyState?.editPanel?.fields?.barmentPeriod?.suffix}
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                        color: '#94A3B8'
                      }}
                    >
                      Statutory penalty/interest rate per annum.
                    </div>
                  </div>

                  {/* Barment notice timing */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#475569',
                        marginBottom: 4
                      }}
                    >
                      {countyState?.editPanel?.fields?.barmentNotice?.label}
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          padding: '9px 10px',
                          fontSize: 13,
                          color: '#0F172A',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        {countyState?.editPanel?.fields?.barmentNotice?.value}
                      </div>
                      <div
                        style={{
                          padding: '9px 12px',
                          fontSize: 12,
                          color: '#64748B',
                          backgroundColor: '#F9FAFB',
                          borderLeft: '1px solid #E2E8F0'
                        }}
                      >
                        {countyState?.editPanel?.fields?.barmentNotice?.suffix}
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                        color: '#94A3B8'
                      }}
                    >
                      Days notice required before barment filing.
                    </div>
                  </div>

                  {/* QT deadline */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#475569',
                        marginBottom: 4
                      }}
                    >
                      {countyState?.editPanel?.fields?.quietTitleDeadline?.label}
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          padding: '9px 10px',
                          fontSize: 13,
                          color: '#0F172A',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        {countyState?.editPanel?.fields?.quietTitleDeadline?.value}
                      </div>
                      <div
                        style={{
                          padding: '9px 12px',
                          fontSize: 12,
                          color: '#64748B',
                          backgroundColor: '#F9FAFB',
                          borderLeft: '1px solid #E2E8F0'
                        }}
                      >
                        {countyState?.editPanel?.fields?.quietTitleDeadline?.suffix}
                      </div>
                    </div>
                  </div>

                  {/* Default attorney */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#475569',
                        marginBottom: 4
                      }}
                    >
                      {countyState?.editPanel?.fields?.defaultAttorney?.label}
                    </label>
                    <div
                      style={{
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        padding: '9px 10px',
                        fontSize: 13,
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      {countyState?.editPanel?.fields?.defaultAttorney?.value}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 10
                  }}
                >
                  <button
                    style={{
                      padding: '9px 14px',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#64748B',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {countyState.editPanel.actions.cancel}
                  </button>
                  <button
                    onClick={() => navigate('/admin/administration/county-state-config')}
                    style={{
                      padding: '9px 18px',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#FFFFFF',
                      backgroundColor: '#1E3A5F',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {countyState.editPanel.actions.save}
                  </button>
                </div>
              </div>
            </div>

            {/* Interest Rates & Models */}
            <div ref={interestRef} style={cardStyle}>
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: 4
                  }}
                >
                  {interestModels?.header?.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#64748B'
                  }}
                >
                  {interestModels?.header?.subtitle}
                </div>
              </div>

              {/* Method row */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#475569',
                    marginBottom: 6
                  }}
                >
                  {interestModels?.methodLabel}
                </div>
                <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                  {interestModels?.methods?.map((method: string, idx: number) => (
                    <div key={method} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          border: idx === 0 ? '4px solid #2563EB' : '1px solid #CBD5F5',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box'
                        }}
                      />
                      <span
                        style={{
                          fontWeight: idx === 0 ? 600 : 500,
                          color: idx === 0 ? '#0F172A' : '#64748B'
                        }}
                      >
                        {method}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1.2fr',
                  gap: 16,
                  marginBottom: 16
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 4
                    }}
                  >
                    {interestModels?.globalRate?.label}
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        padding: '9px 10px',
                        fontSize: 13,
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      {interestModels?.globalRate?.value}
                    </div>
                    <div
                      style={{
                        padding: '9px 12px',
                        fontSize: 12,
                        color: '#64748B',
                        backgroundColor: '#F9FAFB',
                        borderLeft: '1px solid #E2E8F0'
                      }}
                    >
                      {interestModels?.globalRate?.suffix}
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 4
                    }}
                  >
                    {interestModels?.accrualBasis?.label}
                  </label>
                  <div
                    style={{
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      padding: '9px 10px',
                      fontSize: 13,
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {interestModels?.accrualBasis?.value}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  style={{
                    padding: '9px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#1E3A5F',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {interestModels?.saveButton}
                </button>
              </div>
            </div>

            {/* Workflow Configuration */}
            <div ref={workflowRef} style={cardStyle}>
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: 4
                  }}
                >
                  {workflowConfig?.header?.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#64748B'
                  }}
                >
                  {workflowConfig?.header?.subtitle}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  padding: 16,
                  backgroundColor: '#F9FAFB',
                  marginBottom: 8
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0F172A'
                    }}
                  >
                    {workflowConfig?.fifaStages?.title}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      style={{
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer'
                      }}
                    >
                      {workflowConfig?.fifaStages?.addStageButton}
                    </button>
                    <button
                      style={{
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#FFFFFF',
                        backgroundColor: '#1E3A5F',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {workflowConfig?.fifaStages?.startButton}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 8,
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  {workflowConfig?.fifaStages?.stages?.map((stage: string, idx: number) => (
                    <div
                      key={stage}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderBottom:
                          idx === (workflowConfig?.fifaStages?.stages?.length || 0) - 1
                            ? 'none'
                            : '1px solid #E5E7EB'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 2,
                            border: '1px solid #CDD4E0',
                            backgroundColor: '#F9FAFB'
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            color: '#0F172A'
                          }}
                        >
                          {stage}
                        </span>
                      </div>
                      {idx === 2 && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: '#15803D',
                            backgroundColor: '#F0FDF4',
                            borderRadius: 999,
                            padding: '3px 9px'
                          }}
                        >
                          {workflowConfig?.fifaStages?.autoTriggerLabel}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Templates Library */}
            <div ref={templatesRef} style={cardStyle}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#0F172A',
                      marginBottom: 4
                    }}
                  >
                    {templatesLibrary?.header?.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#64748B'
                    }}
                  >
                    {templatesLibrary?.header?.subtitle}
                  </div>
                </div>
                <button
                  style={{
                    padding: '9px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#1E3A5F',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {templatesLibrary?.createButton}
                </button>
              </div>

              {/* Tabs row */}
              <div
                style={{
                  display: 'inline-flex',
                  borderRadius: 999,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F9FAFB',
                  marginBottom: 12,
                  overflow: 'hidden'
                }}
              >
                {templatesLibrary?.tabs?.map((tab: string, idx: number) => (
                  <button
                    key={tab}
                    style={{
                      padding: '7px 14px',
                      fontSize: 12,
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: idx === 0 ? '#FFFFFF' : 'transparent',
                      color: idx === 0 ? '#1E3A5F' : '#64748B'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Templates table */}
              <div
                style={{
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    overflowX: isMobileOrTablet ? 'auto' : 'visible',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 13,
                      minWidth: isMobileOrTablet ? 600 : undefined
                    }}
                  >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB'
                      }}
                    >
                      {templatesLibrary?.tableHeaders?.map((h: string) => (
                        <th
                          key={h}
                          style={{
                            padding: '10px 14px',
                            textAlign: 'left',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: '#64748B',
                            fontWeight: 600
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {templatesLibrary?.rows?.map((row: any, idx: number) => (
                      <tr
                        key={row.id}
                        style={{
                          borderBottom:
                            idx === (templatesLibrary?.rows?.length || 0) - 1
                              ? 'none'
                              : '1px solid #E5E7EB',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        <td style={{ padding: '10px 14px', color: '#0F172A' }}>{row?.name}</td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>{row?.type}</td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>{row?.county}</td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>{row?.updated}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 6,
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit3 style={{ width: 14, height: 14, color: '#64748B' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>

            {/* API Integrations */}
            <div ref={apiRef} style={cardStyle}>
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: 4
                  }}
                >
                  {apiIntegrations?.header?.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#64748B'
                  }}
                >
                  {apiIntegrations?.header?.subtitle}
                </div>
              </div>

              {apiIntegrations?.providers?.map((provider: any) => (
                <div
                  key={provider.id}
                  style={{
                    borderRadius: 10,
                    border: '1px solid #E2E8F0',
                    padding: 16,
                    marginBottom: 12,
                    backgroundColor: '#F9FAFB'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#0F172A',
                          marginBottom: 2
                        }}
                      >
                        {provider?.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#64748B'
                        }}
                      >
                        {provider?.description}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        padding: '4px 10px',
                        borderRadius: 999,
                        backgroundColor: provider?.statusBg,
                        color: provider?.statusColor
                      }}
                    >
                      {provider?.statusLabel}
                    </span>
                  </div>

                  {provider?.id === 'letterstream' && (
                    <>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1.2fr',
                          gap: 12,
                          marginBottom: 12
                        }}
                      >
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: 12,
                              fontWeight: 500,
                              color: '#475569',
                              marginBottom: 4
                            }}
                          >
                            {provider?.apiKeyLabel}
                          </label>
                          <div
                            style={{
                              borderRadius: 8,
                              border: '1px solid #E2E8F0',
                              padding: '9px 10px',
                              fontSize: 13,
                              color: '#0F172A',
                              backgroundColor: '#FFFFFF'
                            }}
                          >
                            {provider?.apiKeyValue}
                          </div>
                        </div>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: 12,
                              fontWeight: 500,
                              color: '#475569',
                              marginBottom: 4
                            }}
                          >
                            {provider?.environmentLabel}
                          </label>
                          <div
                            style={{
                              borderRadius: 8,
                              border: '1px solid #E2E8F0',
                              padding: '9px 10px',
                              fontSize: 13,
                              color: '#0F172A',
                              backgroundColor: '#FFFFFF'
                            }}
                          >
                            {provider?.environmentValue}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              marginTop: 8,
                              fontSize: 12,
                              color: '#475569'
                            }}
                          >
                            <span>{provider?.enableLabel}</span>
                            <ToggleRight style={{ width: 28, height: 28, color: '#15803D' }} />
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 4
                        }}
                      >
                        <button
                          style={{
                            padding: '8px 12px',
                            fontSize: 12,
                            fontWeight: 500,
                            color: '#0F172A',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 8,
                            border: '1px solid #E2E8F0',
                            cursor: 'pointer'
                          }}
                        >
                          {provider?.testButton}
                        </button>
                        <button
                          style={{
                            padding: '8px 14px',
                            fontSize: 12,
                            fontWeight: 500,
                            color: '#FFFFFF',
                            backgroundColor: '#1E3A5F',
                            borderRadius: 8,
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {provider?.saveButton}
                        </button>
                      </div>
                    </>
                  )}

                  {provider?.id === 'gscca' && (
                    <div
                      style={{
                        marginTop: 8,
                        display: 'flex',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <button
                        style={{
                          padding: '8px 14px',
                          fontSize: 12,
                          fontWeight: 500,
                          color: '#0F172A',
                          backgroundColor: '#FFFFFF',
                          borderRadius: 8,
                          border: '1px solid #E2E8F0',
                          cursor: 'pointer'
                        }}
                      >
                        {provider?.configureButton}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Share & Allocations */}
            <div ref={shareRef} style={cardStyle}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                  {shareAllocations?.header?.title}
                </div>
                <div style={{ fontSize: 13, color: '#64748B' }}>
                  {shareAllocations?.header?.subtitle}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1.2fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#475569', marginBottom: 4 }}>
                    {shareAllocations?.fields?.investorShare?.label}
                  </label>
                  <div style={{ display: 'flex', borderRadius: 8, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                    <div style={{ flex: 1, padding: '9px 10px', fontSize: 13, color: '#0F172A', backgroundColor: '#FFFFFF' }}>
                      {shareAllocations?.fields?.investorShare?.value}
                    </div>
                    <div style={{ padding: '9px 12px', fontSize: 12, color: '#64748B', backgroundColor: '#F9FAFB', borderLeft: '1px solid #E2E8F0' }}>
                      {shareAllocations?.fields?.investorShare?.suffix}
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#475569', marginBottom: 4 }}>
                    {shareAllocations?.fields?.companyShare?.label}
                  </label>
                  <div style={{ display: 'flex', borderRadius: 8, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                    <div style={{ flex: 1, padding: '9px 10px', fontSize: 13, color: '#0F172A', backgroundColor: '#FFFFFF' }}>
                      {shareAllocations?.fields?.companyShare?.value}
                    </div>
                    <div style={{ padding: '9px 12px', fontSize: 12, color: '#64748B', backgroundColor: '#F9FAFB', borderLeft: '1px solid #E2E8F0' }}>
                      {shareAllocations?.fields?.companyShare?.suffix}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ padding: '9px 16px', fontSize: 13, fontWeight: 500, color: '#FFFFFF', backgroundColor: '#1E3A5F', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                  {shareAllocations?.saveButton}
                </button>
              </div>
            </div>

            {/* Depreciation Settings */}
            <div ref={depreciationRef} style={cardStyle}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                  {depreciationSettings?.header?.title}
                </div>
                <div style={{ fontSize: 13, color: '#64748B' }}>
                  {depreciationSettings?.header?.subtitle}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1.2fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#475569', marginBottom: 4 }}>
                    {depreciationSettings?.fields?.method?.label}
                  </label>
                  <div style={{ borderRadius: 8, border: '1px solid #E2E8F0', padding: '9px 10px', fontSize: 13, color: '#0F172A', backgroundColor: '#FFFFFF' }}>
                    {depreciationSettings?.fields?.method?.value}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#475569', marginBottom: 4 }}>
                    {depreciationSettings?.fields?.usefulLife?.label}
                  </label>
                  <div style={{ display: 'flex', borderRadius: 8, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                    <div style={{ flex: 1, padding: '9px 10px', fontSize: 13, color: '#0F172A', backgroundColor: '#FFFFFF' }}>
                      {depreciationSettings?.fields?.usefulLife?.value}
                    </div>
                    <div style={{ padding: '9px 12px', fontSize: 12, color: '#64748B', backgroundColor: '#F9FAFB', borderLeft: '1px solid #E2E8F0' }}>
                      {depreciationSettings?.fields?.usefulLife?.suffix}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ padding: '9px 16px', fontSize: 13, fontWeight: 500, color: '#FFFFFF', backgroundColor: '#1E3A5F', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                  {depreciationSettings?.saveButton}
                </button>
              </div>
            </div>

            {/* System Settings */}
            <div ref={systemRef} style={cardStyle}>
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: 4
                  }}
                >
                  {systemSettings?.header?.title || ''}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#64748B'
                  }}
                >
                  {systemSettings?.header?.subtitle || ''}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1.2fr',
                  gap: 16,
                  marginBottom: 16
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 4
                    }}
                  >
                    {systemSettings?.fields?.platformName?.label}
                  </label>
                  <div
                    style={{
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      padding: '9px 10px',
                      fontSize: 13,
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {systemSettings?.fields?.platformName?.value}
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 4
                    }}
                  >
                    {systemSettings?.fields?.supportEmail?.label}
                  </label>
                  <div
                    style={{
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      padding: '9px 10px',
                      fontSize: 13,
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {systemSettings?.fields?.supportEmail?.value}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 4
                    }}
                  >
                    {systemSettings?.fields?.timeZone?.label}
                  </label>
                  <div
                    style={{
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      padding: '9px 10px',
                      fontSize: 13,
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {systemSettings?.fields?.timeZone?.value}
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 4
                    }}
                  >
                    {systemSettings?.fields?.currency?.label}
                  </label>
                  <div
                    style={{
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      padding: '9px 10px',
                      fontSize: 13,
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {systemSettings?.fields?.currency?.value}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 4
                    }}
                  >
                    {systemSettings?.fields?.sessionTimeout?.label}
                  </label>
                  <div
                    style={{
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      padding: '9px 10px',
                      fontSize: 13,
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {systemSettings?.fields?.sessionTimeout?.value}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 4
                    }}
                  >
                    {systemSettings?.twoFactor?.label}
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      fontSize: 13,
                      color: '#334155'
                    }}
                  >
                    {systemSettings?.twoFactor?.options?.map((opt: string, idx: number) => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="checkbox" defaultChecked={idx === 0} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  style={{
                    padding: '9px 18px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#1E3A5F',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {systemSettings?.saveButton}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


