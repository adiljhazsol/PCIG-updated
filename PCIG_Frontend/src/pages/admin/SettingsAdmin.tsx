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

  // Local state for form inputs
  const [letterstreamForm, setLetterstreamForm] = useState({
      apiKey: '',
      environment: 'Production',
      enabled: false
  });
  const [shareForm, setShareForm] = useState({
      investorShare: '',
      companyShare: ''
  });
  const [depreciationForm, setDepreciationForm] = useState({
      method: '',
      usefulLife: ''
  });
  const [systemForm, setSystemForm] = useState({
      platformName: '',
      supportEmail: '',
      timeZone: '',
      currency: '',
      sessionTimeout: '',
      twoFactor: [] as string[]
  });
  const [interestForm, setInterestForm] = useState({
      method: '',
      globalRate: ''
  });
  const [workflowStages, setWorkflowStages] = useState<string[]>([]);
  const [newStage, setNewStage] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

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

  // Template State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'notice',
    content: ''
  });
  const [templateLoading, setTemplateLoading] = useState(false);

  // County State
  const [showCountyModal, setShowCountyModal] = useState(false);
  const [editingCounty, setEditingCounty] = useState<any>(null);
  const [countyForm, setCountyForm] = useState({
      county: '',
      state: '',
      redemptionInterestRate: '20',
      barmentPeriod: '365',
      barmentNotice: '30',
      quietTitleDeadline: '45',
      defaultAttorney: 'Legal Partners LLC',
      calculationMethod: 'Flat Penalty + Interest'
  });
  const [countyLoading, setCountyLoading] = useState(false);

  // Stripe State
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeForm, setStripeForm] = useState({
      publishableKey: '',
      secretKey: '',
      webhookSecret: ''
  });
  const [stripeLoading, setStripeLoading] = useState(false);

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

  const handleOpenTemplateModal = async (template: any = null) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        type: template.type,
        content: 'Loading...'
      });
      setShowTemplateModal(true);
      
      try {
          const res = await api.get(`/admin/templates/${template.id}`);
          if (res.data.data) {
              setTemplateForm({
                  name: res.data.data.name,
                  type: res.data.data.type,
                  content: res.data.data.content || ''
              });
          }
      } catch (err) {
          console.error("Failed to load template details", err);
      }
    } else {
      setEditingTemplate(null);
      setTemplateForm({
        name: '',
        type: 'notice',
        content: ''
      });
      setShowTemplateModal(true);
    }
  };

  const handleCloseTemplateModal = () => {
    setShowTemplateModal(false);
    setEditingTemplate(null);
    setTemplateForm({
      name: '',
      type: 'notice',
      content: ''
    });
  };

  const handleSaveTemplate = async () => {
    try {
      setTemplateLoading(true);
      if (editingTemplate) {
        await api.put(`/admin/templates/${editingTemplate.id}`, templateForm);
      } else {
        await api.post('/admin/templates', templateForm);
      }
      
      // Refresh data
      const response = await api.get('/admin/settings/dashboard-data');
      if (response.data.success) {
        setSettings((prev: any) => ({
            ...prev,
            templatesLibrary: response.data.data.settingsAdmin.templatesLibrary
        }));
      }
      
      handleCloseTemplateModal();
    } catch (err) {
      console.error('Error saving template:', err);
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await api.delete(`/admin/templates/${id}`);
      // Refresh data
      const response = await api.get('/admin/settings/dashboard-data');
      if (response.data.success) {
        setSettings((prev: any) => ({
            ...prev,
            templatesLibrary: response.data.data.settingsAdmin.templatesLibrary
        }));
      }
    } catch (err) {
      console.error('Error deleting template:', err);
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
          
          // Initialize form states
          if (data.apiIntegrations?.providers) {
              const letterstream = data.apiIntegrations.providers.find((p: any) => p.id === 'letterstream');
              if (letterstream) {
                  setLetterstreamForm({
                      apiKey: letterstream.apiKeyValue || '',
                      environment: letterstream.environmentValue || 'Production',
                      enabled: letterstream.enabled || false
                  });
              }

              const stripe = data.apiIntegrations.providers.find((p: any) => p.id === 'stripe');
              if (stripe) {
                  setStripeForm({
                      publishableKey: stripe.publishableKey || '',
                      secretKey: stripe.secretKey || '',
                      webhookSecret: stripe.webhookSecret || ''
                  });
              }
          }

          if (data.shareAllocations?.fields) {
              setShareForm({
                  investorShare: data.shareAllocations.fields.investorShare?.value || '',
                  companyShare: data.shareAllocations.fields.companyShare?.value || ''
              });
          }

          if (data.depreciationSettings?.fields) {
              setDepreciationForm({
                  method: data.depreciationSettings.fields.method?.value || '',
                  usefulLife: data.depreciationSettings.fields.usefulLife?.value || ''
              });
          }

          if (data.systemSettings?.fields) {
              setSystemForm({
                  platformName: data.systemSettings.fields.platformName?.value || '',
                  supportEmail: data.systemSettings.fields.supportEmail?.value || '',
                  timeZone: data.systemSettings.fields.timeZone?.value || '',
                  currency: data.systemSettings.fields.currency?.value || '',
                  sessionTimeout: data.systemSettings.fields.sessionTimeout?.value || '',
                  twoFactor: data.systemSettings.twoFactor?.selected || []
              });
          }

          if (data.interestModels) {
              setInterestForm({
                  method: data.interestModels.selectedMethod || 'Simple Interest',
                  globalRate: data.interestModels.globalRate?.value || ''
              });
          }

          if (data.workflowConfig?.fifaStages?.stages) {
              setWorkflowStages(data.workflowConfig.fifaStages.stages);
          }

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

  // County Handlers
  const handleOpenCountyModal = (county: any = null) => {
    if (county) {
        setEditingCounty(county);
        setCountyForm({
            county: county.county || '',
            state: county.state || '',
            redemptionInterestRate: county.redemptionRate ? county.redemptionRate.replace('%', '') : '20',
            barmentPeriod: county.barmentPeriod ? county.barmentPeriod.replace(' Days', '') : '365',
            barmentNotice: '30', // Default or fetch from rules
            quietTitleDeadline: '45', // Default or fetch from rules
            defaultAttorney: 'Legal Partners LLC', // Default
            calculationMethod: 'Flat Penalty + Interest' // Default
        });
    } else {
        setEditingCounty(null);
        setCountyForm({
            county: '',
            state: '',
            redemptionInterestRate: '20',
            barmentPeriod: '365',
            barmentNotice: '30',
            quietTitleDeadline: '45',
            defaultAttorney: 'Legal Partners LLC',
            calculationMethod: 'Flat Penalty + Interest'
        });
    }
    setShowCountyModal(true);
  };

  const handleCloseCountyModal = () => {
    setShowCountyModal(false);
    setEditingCounty(null);
  };

  const handleSaveCounty = async () => {
    try {
        setCountyLoading(true);
        const payload = {
            county: countyForm.county,
            state: countyForm.state,
            type: 'County',
            rules: {
                redemption: {
                    statutoryInterestRate: countyForm.redemptionInterestRate,
                    interestMethod: countyForm.calculationMethod
                },
                barment: {
                    barmentPeriod: countyForm.barmentPeriod,
                    noticeRequired: countyForm.barmentNotice
                },
                quiet_title: {
                    waitingPeriod: countyForm.quietTitleDeadline
                },
                legal: {
                    defaultAttorney: countyForm.defaultAttorney
                }
            }
        };

        if (editingCounty) {
            await api.put(`/admin/settings/locations/${editingCounty.id}`, payload);
        } else {
            await api.post('/admin/settings/locations', payload);
        }

        // Refresh data
        const response = await api.get('/admin/settings/dashboard-data');
        if (response.data.success) {
            setSettings((prev: any) => ({
                ...prev,
                countyState: response.data.data.settingsAdmin.countyState
            }));
        }
        
        handleCloseCountyModal();
    } catch (err) {
        console.error('Error saving county:', err);
    } finally {
        setCountyLoading(false);
    }
  };

  const handleDeleteCounty = async (id: any) => {
      if (!window.confirm('Are you sure you want to delete this location?')) return;
      try {
          await api.delete(`/admin/settings/locations/${id}`);
          // Refresh data
          const response = await api.get('/admin/settings/dashboard-data');
          if (response.data.success) {
              setSettings((prev: any) => ({
                  ...prev,
                  countyState: response.data.data.settingsAdmin.countyState
              }));
          }
      } catch (err) {
          console.error('Error deleting location:', err);
      }
  };

  // Stripe Handlers
  const handleOpenStripeModal = () => {
      setShowStripeModal(true);
  };

  const handleCloseStripeModal = () => {
      setShowStripeModal(false);
  };

  const handleSaveStripe = async () => {
      try {
          setStripeLoading(true);
          await api.post('/admin/settings', {
              settings: [
                  { key: 'stripe_publishable_key', value: stripeForm.publishableKey },
                  { key: 'stripe_secret_key', value: stripeForm.secretKey },
                  { key: 'stripe_webhook_secret', value: stripeForm.webhookSecret }
              ]
          });
          handleCloseStripeModal();
      } catch (err) {
          console.error('Error saving Stripe settings:', err);
      } finally {
          setStripeLoading(false);
      }
  };

  const handleSaveGeneric = async (section: string, updates: { key: string; value: any }[]) => {
      try {
          setSaving(section);
          await api.post('/admin/settings', { settings: updates });
          // Success message could be added here
      } catch (err) {
          console.error('Error saving settings:', err);
      } finally {
          setSaving(null);
      }
  };

  const handleSaveLetterstream = () => {
      handleSaveGeneric('letterstream', [
          { key: 'letterstream_api_key', value: letterstreamForm.apiKey },
          { key: 'letterstream_env', value: letterstreamForm.environment },
          { key: 'letterstream_enabled', value: letterstreamForm.enabled }
      ]);
  };

  const handleSaveShare = () => {
      handleSaveGeneric('share', [
          { key: 'investor_share', value: shareForm.investorShare },
          { key: 'company_share', value: shareForm.companyShare }
      ]);
  };

  const handleSaveDepreciation = () => {
      handleSaveGeneric('depreciation', [
          { key: 'depreciation_method', value: depreciationForm.method },
          { key: 'depreciation_useful_life', value: depreciationForm.usefulLife }
      ]);
  };

  const handleSaveSystem = () => {
      handleSaveGeneric('system', [
          { key: 'platform_name', value: systemForm.platformName },
          { key: 'support_email', value: systemForm.supportEmail },
          { key: 'time_zone', value: systemForm.timeZone },
          { key: 'currency', value: systemForm.currency },
          { key: 'session_timeout', value: systemForm.sessionTimeout },
          { key: 'two_factor_methods', value: systemForm.twoFactor }
      ]);
  };

  const handleSaveInterest = async () => {
      try {
          setSaving('interest');
          await api.post('/admin/settings/interest', interestForm);
      } catch (err) {
          console.error('Error saving interest settings:', err);
      } finally {
          setSaving(null);
      }
  };

  const handleSaveWorkflow = async () => {
      try {
          setSaving('workflow');
          await api.post('/admin/settings/workflow', { stages: workflowStages });
      } catch (err) {
          console.error('Error saving workflow settings:', err);
      } finally {
          setSaving(null);
      }
  };

  const handleAddStage = () => {
      if (!newStage.trim()) return;
      setWorkflowStages([...workflowStages, newStage.trim()]);
      setNewStage('');
  };

  const handleDeleteStage = (index: number) => {
      const newStages = [...workflowStages];
      newStages.splice(index, 1);
      setWorkflowStages(newStages);
  };

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
    padding: 24, // Increased padding
    boxSizing: 'border-box'
  };

  const inputStyle: CSSProperties = {
      width: '100%',
      padding: '12px 14px',
      borderRadius: 8,
      border: '1px solid #E2E8F0',
      fontSize: 14,
      color: '#0F172A',
      backgroundColor: '#FFFFFF',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
  };

  const labelStyle: CSSProperties = {
      display: 'block',
      fontSize: 14, // Increased font size
      fontWeight: 500,
      color: '#475569',
      marginBottom: 6
  };

  const buttonPrimaryStyle: CSSProperties = {
      padding: '12px 20px', // Increased padding
      fontSize: 14,
      fontWeight: 500,
      color: '#FFFFFF',
      backgroundColor: '#1E3A5F',
      borderRadius: 8,
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 8
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
                            padding: '10px 12px',
                            borderRadius: 8,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 14,
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
              {/* Existing County Code - abbreviated for brevity as it was working */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>{countyHeader.title}</div>
                  <div style={{ fontSize: 14, color: '#64748B' }}>{countyHeader.subtitle}</div>
                </div>
                <button onClick={() => handleOpenCountyModal()} style={buttonPrimaryStyle}>+ {countyAddButton}</button>
              </div>
              
               {/* County table (simplified rendering for this file write) */}
               <div style={{ borderRadius: 10, border: '1px solid #E2E8F0', overflow: 'hidden', marginTop: 16, marginBottom: 16 }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        <tr>
                            {countyTableHeaders.map((h: string) => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {countyRows.map((row: any, idx: number) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
                                <td style={{ padding: '12px 16px' }}>{row.county}</td>
                                <td style={{ padding: '12px 16px' }}>{row.state}</td>
                                <td style={{ padding: '12px 16px' }}>{row.redemptionRate}</td>
                                <td style={{ padding: '12px 16px' }}>{row.barmentPeriod}</td>
                                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 8px', borderRadius: 99, fontSize: 12, backgroundColor: row.status.bg, color: row.status.color }}>{row.status.label}</span></td>
                                <td style={{ padding: '12px 16px' }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => handleOpenCountyModal(row)} style={{ border: '1px solid #E2E8F0', background: 'white', borderRadius: 6, padding: 4, cursor: 'pointer' }}><Edit3 size={14} color="#64748B" /></button>
                                        <button onClick={() => handleDeleteCounty(row.id)} style={{ border: '1px solid #E2E8F0', background: 'white', borderRadius: 6, padding: 4, cursor: 'pointer' }}><Trash2 size={14} color="#64748B" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
               </div>
            </div>

            {/* Interest Rates & Models */}
            <div ref={interestRef} style={cardStyle}>
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>{interestModels?.header?.title}</div>
                    <div style={{ fontSize: 14, color: '#64748B' }}>{interestModels?.header?.subtitle}</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24, marginBottom: 24 }}>
                    <div>
                        <label style={labelStyle}>{interestModels?.methodLabel}</label>
                        <select
                            style={inputStyle}
                            value={interestForm.method}
                            onChange={(e) => setInterestForm({...interestForm, method: e.target.value})}
                        >
                            {interestModels?.methods?.map((m: string) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>{interestModels?.globalRate?.label}</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="number"
                                style={{ ...inputStyle, paddingRight: 40 }}
                                value={interestForm.globalRate}
                                onChange={(e) => setInterestForm({...interestForm, globalRate: e.target.value})}
                            />
                            <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: 14 }}>
                                {interestModels?.globalRate?.suffix}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                        onClick={handleSaveInterest}
                        disabled={saving === 'interest'}
                        style={buttonPrimaryStyle}
                    >
                        {saving === 'interest' && <Loader2 size={16} className="animate-spin" />}
                        {interestModels?.saveButton}
                    </button>
                </div>
            </div>

            {/* Workflow Configuration */}
            <div ref={workflowRef} style={cardStyle}>
                 <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>{workflowConfig?.header?.title}</div>
                    <div style={{ fontSize: 14, color: '#64748B' }}>{workflowConfig?.header?.subtitle}</div>
                </div>
                
                <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#334155', marginBottom: 16 }}>{workflowConfig?.fifaStages?.title}</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                        {workflowStages.map((stage, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#E0E7FF', color: '#4338CA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
                                    {index + 1}
                                </div>
                                <div style={{ flex: 1, fontSize: 14, color: '#334155', fontWeight: 500 }}>{stage}</div>
                                <button 
                                    onClick={() => handleDeleteStage(index)}
                                    style={{ padding: 6, borderRadius: 6, color: '#94A3B8', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <input 
                            type="text"
                            placeholder="Enter new stage name"
                            value={newStage}
                            onChange={(e) => setNewStage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
                            style={{ flex: 1, ...inputStyle }}
                        />
                        <button 
                            onClick={handleAddStage}
                            style={{ ...buttonPrimaryStyle, backgroundColor: '#FFFFFF', color: '#1E3A5F', border: '1px solid #1E3A5F' }}
                        >
                            {workflowConfig?.fifaStages?.addStageButton}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid #E2E8F0' }}>
                    <button 
                        onClick={handleSaveWorkflow}
                        disabled={saving === 'workflow'}
                        style={buttonPrimaryStyle}
                    >
                        {saving === 'workflow' && <Loader2 size={16} className="animate-spin" />}
                        {workflowConfig?.fifaStages?.startButton}
                    </button>
                </div>
            </div>

            {/* Templates Library */}
            <div ref={templatesRef} style={cardStyle}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>{templatesLibrary?.header?.title}</div>
                        <div style={{ fontSize: 14, color: '#64748B' }}>{templatesLibrary?.header?.subtitle}</div>
                    </div>
                    <button onClick={() => handleOpenTemplateModal()} style={buttonPrimaryStyle}>
                        + {templatesLibrary?.createButton}
                    </button>
                </div>
                
                <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #E2E8F0', marginBottom: 20 }}>
                    {templatesLibrary?.tabs?.map((tab: string) => (
                        <div key={tab} style={{ paddingBottom: 12, fontSize: 14, fontWeight: 500, color: tab === 'All Templates' ? '#1E3A5F' : '#64748B', borderBottom: tab === 'All Templates' ? '2px solid #1E3A5F' : 'none', cursor: 'pointer' }}>
                            {tab}
                        </div>
                    ))}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                                {templatesLibrary?.tableHeaders?.map((h: string) => (
                                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {templatesLibrary?.rows?.length > 0 ? (
                                templatesLibrary.rows.map((row: any) => (
                                    <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 500, color: '#0F172A' }}>{row.name}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: 99, backgroundColor: '#F1F5F9', color: '#475569', fontSize: 12, fontWeight: 500, textTransform: 'capitalize' }}>
                                                {row.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', color: '#64748B' }}>{row.county}</td>
                                        <td style={{ padding: '16px', color: '#64748B' }}>{row.updated}</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button onClick={() => handleOpenTemplateModal(row)} style={{ padding: 6, borderRadius: 6, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', color: '#64748B' }}>
                                                    <Edit3 size={14} />
                                                </button>
                                                <button onClick={() => handleDeleteTemplate(row.id)} style={{ padding: 6, borderRadius: 6, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', color: '#EF4444' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                                        No templates found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* API Integrations - FIXED */}
            <div ref={apiRef} style={cardStyle}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                  {apiIntegrations?.header?.title}
                </div>
                <div style={{ fontSize: 14, color: '#64748B' }}>
                  {apiIntegrations?.header?.subtitle}
                </div>
              </div>

              {apiIntegrations?.providers?.map((provider: any) => (
                <div key={provider.id} style={{ borderRadius: 12, border: '1px solid #E2E8F0', padding: 20, marginBottom: 16, backgroundColor: '#F9FAFB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>{provider?.name}</div>
                      <div style={{ fontSize: 13, color: '#64748B' }}>{provider?.description}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, padding: '4px 12px', borderRadius: 999, backgroundColor: provider?.statusBg, color: provider?.statusColor }}>
                      {provider?.statusLabel}
                    </span>
                  </div>

                  {provider?.id === 'letterstream' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div>
                          <label style={labelStyle}>{provider?.apiKeyLabel}</label>
                          <input 
                             type="text"
                             style={inputStyle}
                             value={letterstreamForm.apiKey}
                             onChange={(e) => setLetterstreamForm({...letterstreamForm, apiKey: e.target.value})}
                             placeholder="Enter API Key"
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>{provider?.environmentLabel}</label>
                          <select 
                            style={inputStyle}
                            value={letterstreamForm.environment}
                            onChange={(e) => setLetterstreamForm({...letterstreamForm, environment: e.target.value})}
                          >
                              <option value="Production">Production</option>
                              <option value="Sandbox">Sandbox</option>
                          </select>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={letterstreamForm.enabled} 
                                onChange={(e) => setLetterstreamForm({...letterstreamForm, enabled: e.target.checked})}
                                style={{ width: 18, height: 18 }}
                              />
                              <span style={{ fontSize: 14, fontWeight: 500, color: '#475569' }}>{provider?.enableLabel}</span>
                          </label>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
                        <button style={{ padding: '10px 16px', fontSize: 13, fontWeight: 500, color: '#0F172A', backgroundColor: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', cursor: 'pointer' }}>
                          {provider?.testButton}
                        </button>
                        <button 
                            onClick={handleSaveLetterstream}
                            disabled={saving === 'letterstream'}
                            style={buttonPrimaryStyle}
                        >
                          {saving === 'letterstream' && <Loader2 size={16} className="animate-spin" />}
                          {provider?.saveButton}
                        </button>
                      </div>
                    </>
                  )}

                  {provider?.id === 'stripe' && (
                    <div style={{ marginTop: 8 }}>
                      <button onClick={handleOpenStripeModal} style={{ padding: '10px 16px', fontSize: 13, fontWeight: 500, color: '#0F172A', backgroundColor: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', cursor: 'pointer' }}>
                        {provider?.configureButton}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Share & Allocations - FIXED */}
            <div ref={shareRef} style={cardStyle}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                  {shareAllocations?.header?.title}
                </div>
                <div style={{ fontSize: 14, color: '#64748B' }}>
                  {shareAllocations?.header?.subtitle}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={labelStyle}>
                    {shareAllocations?.fields?.investorShare?.label}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                        type="number"
                        style={{ ...inputStyle, paddingRight: 40 }}
                        value={shareForm.investorShare}
                        onChange={(e) => setShareForm({...shareForm, investorShare: e.target.value})}
                    />
                    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: 14 }}>
                        {shareAllocations?.fields?.investorShare?.suffix}
                    </div>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>
                    {shareAllocations?.fields?.companyShare?.label}
                  </label>
                   <div style={{ position: 'relative' }}>
                    <input 
                        type="number"
                        style={{ ...inputStyle, paddingRight: 40 }}
                        value={shareForm.companyShare}
                        onChange={(e) => setShareForm({...shareForm, companyShare: e.target.value})}
                    />
                    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: 14 }}>
                        {shareAllocations?.fields?.companyShare?.suffix}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    onClick={handleSaveShare}
                    disabled={saving === 'share'}
                    style={buttonPrimaryStyle}
                >
                  {saving === 'share' && <Loader2 size={16} className="animate-spin" />}
                  {shareAllocations?.saveButton}
                </button>
              </div>
            </div>

            {/* Depreciation Settings - FIXED */}
            <div ref={depreciationRef} style={cardStyle}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                  {depreciationSettings?.header?.title}
                </div>
                <div style={{ fontSize: 14, color: '#64748B' }}>
                  {depreciationSettings?.header?.subtitle}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={labelStyle}>
                    {depreciationSettings?.fields?.method?.label}
                  </label>
                  <select
                    style={inputStyle}
                    value={depreciationForm.method}
                    onChange={(e) => setDepreciationForm({...depreciationForm, method: e.target.value})}
                  >
                      <option value="Straight Line">Straight Line</option>
                      <option value="Double Declining Balance">Double Declining Balance</option>
                      <option value="Sum of Years">Sum of Years</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>
                    {depreciationSettings?.fields?.usefulLife?.label}
                  </label>
                   <div style={{ position: 'relative' }}>
                    <input 
                        type="number"
                        style={{ ...inputStyle, paddingRight: 60 }}
                        value={depreciationForm.usefulLife}
                        onChange={(e) => setDepreciationForm({...depreciationForm, usefulLife: e.target.value})}
                    />
                    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: 14 }}>
                        {depreciationSettings?.fields?.usefulLife?.suffix}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    onClick={handleSaveDepreciation}
                    disabled={saving === 'depreciation'}
                    style={buttonPrimaryStyle}
                >
                  {saving === 'depreciation' && <Loader2 size={16} className="animate-spin" />}
                  {depreciationSettings?.saveButton}
                </button>
              </div>
            </div>

            {/* System Settings - FIXED */}
            <div ref={systemRef} style={cardStyle}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                  {systemSettings?.header?.title || ''}
                </div>
                <div style={{ fontSize: 14, color: '#64748B' }}>
                  {systemSettings?.header?.subtitle || ''}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={labelStyle}>
                    {systemSettings?.fields?.platformName?.label}
                  </label>
                  <input 
                    type="text"
                    style={inputStyle}
                    value={systemForm.platformName}
                    onChange={(e) => setSystemForm({...systemForm, platformName: e.target.value})}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    {systemSettings?.fields?.supportEmail?.label}
                  </label>
                  <input 
                    type="email"
                    style={inputStyle}
                    value={systemForm.supportEmail}
                    onChange={(e) => setSystemForm({...systemForm, supportEmail: e.target.value})}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    {systemSettings?.fields?.timeZone?.label}
                  </label>
                  <select
                    style={inputStyle}
                    value={systemForm.timeZone}
                    onChange={(e) => setSystemForm({...systemForm, timeZone: e.target.value})}
                  >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>
                    {systemSettings?.fields?.currency?.label}
                  </label>
                  <select
                    style={inputStyle}
                    value={systemForm.currency}
                    onChange={(e) => setSystemForm({...systemForm, currency: e.target.value})}
                  >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    {systemSettings?.fields?.sessionTimeout?.label}
                  </label>
                  <select
                    style={inputStyle}
                    value={systemForm.sessionTimeout}
                    onChange={(e) => setSystemForm({...systemForm, sessionTimeout: e.target.value})}
                  >
                      <option value="15 Minutes">15 Minutes</option>
                      <option value="30 Minutes">30 Minutes</option>
                      <option value="1 Hour">1 Hour</option>
                      <option value="4 Hours">4 Hours</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    {systemSettings?.twoFactor?.label || 'Two-Factor Authentication'}
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    {systemSettings?.twoFactor?.options?.map((option: string) => (
                        <label key={option} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#0F172A' }}>
                            <input 
                                type="checkbox"
                                checked={systemForm.twoFactor.includes(option)}
                                onChange={(e) => {
                                    const newSelection = e.target.checked 
                                        ? [...systemForm.twoFactor, option]
                                        : systemForm.twoFactor.filter((item: string) => item !== option);
                                    setSystemForm({...systemForm, twoFactor: newSelection});
                                }}
                                style={{ width: 16, height: 16 }}
                            />
                            {option}
                        </label>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    onClick={handleSaveSystem}
                    disabled={saving === 'system'}
                    style={buttonPrimaryStyle}
                >
                  {saving === 'system' && <Loader2 size={16} className="animate-spin" />}
                  {systemSettings?.saveButton}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTemplateModal && (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 50
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 24,
                width: '100%',
                maxWidth: 600,
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>
                    {editingTemplate ? 'Edit Template' : 'New Template'}
                </h3>
                
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Name</label>
                    <input 
                        type="text" 
                        value={templateForm.name}
                        onChange={e => setTemplateForm({...templateForm, name: e.target.value})}
                        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #E2E8F0' }}
                    />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Type</label>
                    <select
                        value={templateForm.type}
                        onChange={e => setTemplateForm({...templateForm, type: e.target.value})}
                        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #E2E8F0' }}
                    >
                        <option value="notice">Notice</option>
                        <option value="email">Email</option>
                        <option value="document">Document</option>
                    </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Content</label>
                    <textarea 
                        value={templateForm.content}
                        onChange={e => setTemplateForm({...templateForm, content: e.target.value})}
                        style={{ width: '100%', height: 200, padding: 8, borderRadius: 6, border: '1px solid #E2E8F0' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button 
                        onClick={handleCloseTemplateModal}
                        style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSaveTemplate}
                        disabled={templateLoading}
                        style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#1E3A5F', color: 'white', cursor: 'pointer' }}
                    >
                        {templateLoading ? 'Saving...' : 'Save Template'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {showCountyModal && (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 50
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 24,
                width: '100%',
                maxWidth: 600,
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>
                    {editingCounty ? 'Edit Location' : 'Add Location'}
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>County Name</label>
                        <input 
                            type="text" 
                            value={countyForm.county}
                            onChange={e => setCountyForm({...countyForm, county: e.target.value})}
                            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #E2E8F0', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>State</label>
                        <input 
                            type="text" 
                            value={countyForm.state}
                            onChange={e => setCountyForm({...countyForm, state: e.target.value})}
                            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #E2E8F0', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Calculation Method</label>
                    <select
                        value={countyForm.calculationMethod}
                        onChange={e => setCountyForm({...countyForm, calculationMethod: e.target.value})}
                        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #E2E8F0', boxSizing: 'border-box' }}
                    >
                        <option value="Flat Penalty + Interest">Flat Penalty + Interest</option>
                        <option value="Simple Interest">Simple Interest</option>
                        <option value="Compounded Interest">Compounded Interest</option>
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Redemption Rate (%)</label>
                        <input 
                            type="number" 
                            value={countyForm.redemptionInterestRate}
                            onChange={e => setCountyForm({...countyForm, redemptionInterestRate: e.target.value})}
                            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #E2E8F0', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Barment Period (Days)</label>
                        <input 
                            type="number" 
                            value={countyForm.barmentPeriod}
                            onChange={e => setCountyForm({...countyForm, barmentPeriod: e.target.value})}
                            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #E2E8F0', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                     <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Barment Notice (Days)</label>
                        <input 
                            type="number" 
                            value={countyForm.barmentNotice}
                            onChange={e => setCountyForm({...countyForm, barmentNotice: e.target.value})}
                            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #E2E8F0', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Quiet Title Deadline (Days)</label>
                        <input 
                            type="number" 
                            value={countyForm.quietTitleDeadline}
                            onChange={e => setCountyForm({...countyForm, quietTitleDeadline: e.target.value})}
                            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #E2E8F0', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button 
                        onClick={handleCloseCountyModal}
                        style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSaveCounty}
                        disabled={countyLoading}
                        style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#1E3A5F', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        {countyLoading && <Loader2 size={14} className="animate-spin" />}
                        Save Location
                    </button>
                </div>
            </div>
        </div>
      )}

      {showStripeModal && (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 50
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 24,
                width: '100%',
                maxWidth: 500,
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>
                    Configure Stripe
                </h3>
                
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Publishable Key</label>
                    <input 
                        type="text" 
                        value={stripeForm.publishableKey}
                        onChange={e => setStripeForm({...stripeForm, publishableKey: e.target.value})}
                        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #E2E8F0', boxSizing: 'border-box' }}
                        placeholder="pk_test_..."
                    />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Secret Key</label>
                    <input 
                        type="password" 
                        value={stripeForm.secretKey}
                        onChange={e => setStripeForm({...stripeForm, secretKey: e.target.value})}
                        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #E2E8F0', boxSizing: 'border-box' }}
                        placeholder="sk_test_..."
                    />
                </div>

                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Webhook Secret</label>
                    <input 
                        type="password" 
                        value={stripeForm.webhookSecret}
                        onChange={e => setStripeForm({...stripeForm, webhookSecret: e.target.value})}
                        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #E2E8F0', boxSizing: 'border-box' }}
                        placeholder="whsec_..."
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button 
                        onClick={handleCloseStripeModal}
                        style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSaveStripe}
                        disabled={stripeLoading}
                        style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#1E3A5F', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        {stripeLoading && <Loader2 size={14} className="animate-spin" />}
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
