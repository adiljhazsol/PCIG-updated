import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  User,
  UserCircle,
  Shield,
  Settings,
  CreditCard,
  Lock,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Info,
  Bell,
  Loader2
} from 'lucide-react';
import InvestorNav from '../../components/investor/InvestorNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

export default function InvestorsSettings() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const [searchParams] = useSearchParams();

  const [activeSection, setActiveSection] = useState<string>(searchParams.get('section') || 'profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interfaces
  interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }

  interface ProfileData {
    fullName: string;
    email: string;
    emailVerified?: boolean;
    phone: string;
    address: Address;
    photoUrl: string | null;
    dateOfBirth?: string;
    taxId?: string;
  }

  interface Session {
    id: number;
    device: string;
    location: string;
    time: string;
    isCurrent: boolean;
  }

  interface SecurityData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    twoFactorEnabled: boolean;
    activeSessions: Session[];
  }

  interface BankAccount {
    id: number;
    bankName: string;
    accountNumber: string;
    type: string;
    isPrimary: boolean;
    status: 'verified' | 'pending' | 'failed';
    statusLabel: string;
  }

  interface PrivacyData {
    profileVisibility: string;
    showNetWorth: boolean;
    shareDataWithThirdParties: boolean;
    marketingEmails: boolean;
  }

  // Form state
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', zipCode: '' },
    photoUrl: null
  });

  const [securityData, setSecurityData] = useState<SecurityData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    activeSessions: [
      { id: 1, device: 'Chrome on Windows', location: 'New York, USA', time: 'Active now', isCurrent: true },
      { id: 2, device: 'Safari on iPhone', location: 'New York, USA', time: '2 hours ago', isCurrent: false }
    ]
  });

  // These might still be static/mocked if backend doesn't support them yet
  const [notificationData, setNotificationData] = useState({
    emailNotificationsEnabled: true,
    inAppNotificationsEnabled: true,
    emailNotificationTypes: [
      { id: 'new_investment', label: 'New Investment Opportunities', enabled: true },
      { id: 'distributions', label: 'Distribution Alerts', enabled: true },
      { id: 'documents', label: 'New Documents Available', enabled: true },
      { id: 'news', label: 'Platform News & Updates', enabled: false }
    ]
  });
  
  const [bankAccounts] = useState<BankAccount[]>([
    { id: 1, bankName: 'Chase Bank', accountNumber: '**** 4589', type: 'Checking', isPrimary: true, status: 'verified', statusLabel: 'Verified' },
    { id: 2, bankName: 'Wells Fargo', accountNumber: '**** 2231', type: 'Savings', isPrimary: false, status: 'pending', statusLabel: 'Pending' }
  ]);
  
  const [privacyData, setPrivacyData] = useState<PrivacyData>({
    profileVisibility: 'private',
    showNetWorth: false,
    shareDataWithThirdParties: false,
    marketingEmails: true
  });

  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/investor/settings/profile');
      if (response.data.success) {
        const { user, profile } = response.data.data;
        
        let addressObj = { street: '', city: '', state: '', zipCode: '' };
        try {
          if (profile?.address) {
             // Try to parse if it's JSON, otherwise treat as street
             if (profile.address.startsWith('{')) {
               const parsed = JSON.parse(profile.address);
               addressObj = { ...addressObj, ...parsed };
             } else {
               addressObj.street = profile.address;
             }
          }
        } catch (e) {
          addressObj.street = profile?.address || '';
        }

        setProfileData({
          fullName: user.name,
          email: user.email,
          phone: profile?.phone || '',
          address: addressObj,
          photoUrl: profile?.photo_url || null,
          dateOfBirth: '', // Backend might not send this, keep empty or add to profile table
          taxId: '' // Backend might not send this
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post('/investor/settings/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setProfileData(prev => ({ ...prev, photoUrl: response.data.data.photo_url }));
        setSuccessMessage('Profile photo updated successfully');
      }
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      setError(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setLoading(false);
      // Reset input value to allow selecting same file again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const addressJson = JSON.stringify(profileData.address);

      const response = await api.put('/investor/settings/profile', {
        name: profileData.fullName,
        phone: profileData.phone,
        address: addressJson
      });

      if (response.data.success) {
        setSuccessMessage('Profile updated successfully.');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await api.put('/investor/settings/password', {
        current_password: securityData.currentPassword,
        password: securityData.newPassword,
        password_confirmation: securityData.confirmPassword
      });

      if (response.data.success) {
        setSuccessMessage('Password changed successfully.');
        setSecurityData({
          ...securityData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const settingsSections = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'bank-accounts', label: 'Bank Accounts', icon: CreditCard },
    { id: 'privacy', label: 'Privacy', icon: Lock },
  ];

  const handleToggle = (section: string, field: string) => {
    if (section === 'security') {
      setSecurityData({ ...securityData, [field]: !securityData[field as keyof typeof securityData] });
    } else if (section === 'notifications') {
      if (field === 'emailEnabled') {
        setNotificationData({ ...notificationData, emailNotificationsEnabled: !notificationData.emailNotificationsEnabled });
      } else if (field === 'inAppEnabled') {
        setNotificationData({ ...notificationData, inAppNotificationsEnabled: !notificationData.inAppNotificationsEnabled });
      } else {
        const updatedTypes = notificationData.emailNotificationTypes.map(type =>
          type.id === field ? { ...type, enabled: !type.enabled } : type
        );
        setNotificationData({ ...notificationData, emailNotificationTypes: updatedTypes });
      }
    } else if (section === 'privacy') {
      setPrivacyData({ ...privacyData, [field]: !privacyData[field as keyof typeof privacyData] });
    }
  };

  const renderProfileSection = () => (
    <div>
      <div style={{ marginBottom: 'clamp(24px, 3vh, 32px)' }}>
        <h2 style={{ fontSize: `clamp(20px, 2.5vw, 24px)`, fontWeight: 600, color: '#0F172A', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: '8px' }}>
          Profile Information
        </h2>
        <p style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, color: '#64748B', margin: 0 }}>
          Update your personal information
        </p>
      </div>

      {/* Profile Picture */}
      <div style={{ marginBottom: 'clamp(24px, 3vh, 32px)' }}>
        <div style={{
          display: 'flex',
          alignItems: isMobileOrTablet ? 'flex-start' : 'center',
          gap: 'clamp(16px, 2vw, 24px)',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <div style={{
            width: isMobile ? 'clamp(80px, 20vw, 100px)' : 'clamp(80px, 10vw, 120px)',
            height: isMobile ? 'clamp(80px, 20vw, 100px)' : 'clamp(80px, 10vw, 120px)',
            borderRadius: '50%',
            backgroundColor: '#E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: '3px solid #FFFFFF',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            flexShrink: 0
          }}>
            {profileData.photoUrl ? (
                <img src={profileData.photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <User style={{ width: '60%', height: '60%', color: '#64748B' }} />
            )}
          </div>
          <div style={{
            display: 'flex',
            gap: 'clamp(8px, 1vw, 12px)',
            flexDirection: isMobile ? 'column' : 'column',
            width: isMobile ? '100%' : 'auto'
          }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{
              padding: `clamp(8px, 1vh, 10px) clamp(16px, 2vw, 20px)`,
              fontSize: `clamp(13px, 1.5vw, 14px)`,
              fontWeight: 500,
              color: '#1E3A5F',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: isMobile ? '100%' : 'auto'
            }}>
              <Camera style={{ width: '16px', height: '16px' }} />
              Change Photo
            </button>
            <button style={{
              padding: `clamp(8px, 1vh, 10px) clamp(16px, 2vw, 20px)`,
              fontSize: `clamp(13px, 1.5vw, 14px)`,
              fontWeight: 500,
              color: '#DC2626',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              cursor: 'pointer',
              width: isMobile ? '100%' : 'auto'
            }}>
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 2.5vh, 24px)' }}>
        {/* Full Name */}
        <div>
          <label style={{
            display: 'block',
            fontSize: `clamp(13px, 1.5vw, 14px)`,
            fontWeight: 500,
            color: '#0F172A',
            marginBottom: '8px'
          }}>
            Full Name <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <input
            type="text"
            value={profileData.fullName}
            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
            style={{
              width: '100%',
              padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
              fontSize: `clamp(13px, 1.5vw, 14px)`,
              color: '#0F172A',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Email Address */}
        <div>
          <label style={{
            display: 'block',
            fontSize: `clamp(13px, 1.5vw, 14px)`,
            fontWeight: 500,
            color: '#0F172A',
            marginBottom: '8px'
          }}>
            Email Address <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <div style={{
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: '12px',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <input
              type="email"

              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              style={{
                flex: 1,
                width: isMobile ? '100%' : 'auto',
                padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                fontSize: `clamp(13px, 1.5vw, 14px)`,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {profileData.emailVerified && (
              <span style={{
                padding: '4px 12px',
                fontSize: `clamp(12px, 1.3vw, 13px)`,
                fontWeight: 500,
                color: '#166534',
                backgroundColor: '#DCFCE7',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
                width: isMobile ? 'fit-content' : 'auto'
              }}>
                <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label style={{
            display: 'block',
            fontSize: `clamp(13px, 1.5vw, 14px)`,
            fontWeight: 500,
            color: '#0F172A',
            marginBottom: '8px'
          }}>
            Phone Number <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <div style={{
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: '12px',
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: isTablet ? 'wrap' : 'nowrap'
          }}>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              style={{
                flex: isMobile ? 'none' : 1,
                width: isMobile ? '100%' : 'auto',
                padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                fontSize: `clamp(13px, 1.5vw, 14px)`,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <span style={{
              padding: '4px 12px',
              fontSize: `clamp(12px, 1.3vw, 13px)`,
              fontWeight: 500,
              color: '#92400E',
              backgroundColor: '#FEF3C7',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0,
              width: isMobile ? 'fit-content' : 'auto'
            }}>
              <AlertCircle style={{ width: '14px', height: '14px' }} />
              Unverified
            </span>
            <button style={{
              padding: `clamp(8px, 1vh, 10px) clamp(16px, 2vw, 20px)`,
              fontSize: `clamp(13px, 1.5vw, 14px)`,
              fontWeight: 500,
              color: '#1E3A5F',
              backgroundColor: '#FFFFFF',
              border: '1px solid #1E3A5F',
              borderRadius: '6px',
              cursor: 'pointer',
              width: isMobile ? '100%' : 'auto',
              flexShrink: 0
            }}>
              Verify
            </button>
          </div>
        </div>

        {/* Mailing Address */}
        <div>
          <label style={{
            display: 'block',
            fontSize: `clamp(13px, 1.5vw, 14px)`,
            fontWeight: 500,
            color: '#0F172A',
            marginBottom: '8px'
          }}>
            Mailing Address <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <input
            type="text"
            value={profileData.address.street}
            onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, street: e.target.value } })}
            placeholder="Street Address"
            style={{
              width: '100%',
              padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
              fontSize: `clamp(13px, 1.5vw, 14px)`,
              color: '#0F172A',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '12px'
            }}
          />
          <div style={{
            display: 'flex',
            gap: '12px',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <input
              type="text"
              value={profileData.address.city}
              onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, city: e.target.value } })}
              placeholder="City"
              style={{
                flex: isMobile ? 'none' : 2,
                width: isMobile ? '100%' : 'auto',
                padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                fontSize: `clamp(13px, 1.5vw, 14px)`,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="text"
              value={profileData.address.state}
              onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, state: e.target.value } })}
              placeholder="State"
              style={{
                flex: isMobile ? 'none' : 1,
                width: isMobile ? '100%' : 'auto',
                padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                fontSize: `clamp(13px, 1.5vw, 14px)`,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="text"
              value={profileData.address.zipCode}
              onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, zipCode: e.target.value } })}
              placeholder="ZIP Code"
              style={{
                flex: isMobile ? 'none' : 1,
                width: isMobile ? '100%' : 'auto',
                padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                fontSize: `clamp(13px, 1.5vw, 14px)`,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: 'clamp(8px, 1vh, 12px)',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <button style={{
            padding: `clamp(10px, 1.2vh, 12px) clamp(20px, 2.5vw, 24px)`,
            fontSize: `clamp(13px, 1.5vw, 14px)`,
            fontWeight: 500,
            color: '#1E3A5F',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            cursor: 'pointer',
            width: isMobile ? '100%' : 'auto'
          }}>
            Cancel
          </button>
          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            style={{
              padding: `clamp(10px, 1.2vh, 12px) clamp(20px, 2.5vw, 24px)`,
              fontSize: `clamp(13px, 1.5vw, 14px)`,
              fontWeight: 500,
              color: '#FFFFFF',
              backgroundColor: '#1E3A5F',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              width: isMobile ? '100%' : 'auto'
            }}>
            {loading ? <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div>
      <div style={{ marginBottom: 'clamp(24px, 3vh, 32px)' }}>
        <h2 style={{ fontSize: `clamp(20px, 2.5vw, 24px)`, fontWeight: 600, color: '#0F172A', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: '8px' }}>
          Security Settings
        </h2>
        <p style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, color: '#64748B', margin: 0 }}>
          Manage your account security
        </p>
      </div>

      {/* Password */}
      <div style={{
        padding: isMobileOrTablet ? 'clamp(16px, 2vh, 20px)' : 'clamp(20px, 2.5vh, 24px)',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        marginBottom: 'clamp(16px, 2vh, 20px)'
      }}>
        <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: `clamp(14px, 1.6vw, 16px)`, fontWeight: 500, color: '#0F172A', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: '4px' }}>
              Change Password
            </h3>
            <p style={{ fontSize: `clamp(12px, 1.4vw, 13px)`, color: '#64748B', margin: 0 }}>
              Ensure your account is using a long, random password to stay secure.
            </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Current Password</label>
            <input
              type="password"
              value={securityData.currentPassword}
              onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>New Password</label>
            <input
              type="password"
              value={securityData.newPassword}
              onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>Confirm New Password</label>
            <input
              type="password"
              value={securityData.confirmPassword}
              onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
             <button
              onClick={handleChangePassword}
              disabled={loading || !securityData.currentPassword || !securityData.newPassword}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#FFFFFF',
                backgroundColor: '#1E3A5F',
                border: 'none',
                borderRadius: '6px',
                cursor: (loading || !securityData.currentPassword) ? 'not-allowed' : 'pointer',
                opacity: (loading || !securityData.currentPassword) ? 0.7 : 1
              }}>
              {loading ? <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} /> : 'Update Password'}
            </button>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div style={{
        padding: isMobileOrTablet ? 'clamp(16px, 2vh, 20px)' : 'clamp(20px, 2.5vh, 24px)',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        marginBottom: 'clamp(16px, 2vh, 20px)'
      }}>
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ fontSize: `clamp(14px, 1.6vw, 16px)`, fontWeight: 500, color: '#0F172A', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: '4px' }}>
            Two-factor Authentication
          </h3>
          <p style={{ fontSize: `clamp(12px, 1.4vw, 13px)`, color: '#64748B', margin: 0 }}>
            Add an extra layer of security to your account
          </p>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: `clamp(14px, 1.6vw, 16px)`, fontWeight: 500, color: '#0F172A', marginBottom: '4px' }}>
              Enable 2FA
            </div>
            <div style={{ fontSize: `clamp(12px, 1.4vw, 13px)`, color: '#64748B' }}>
              Use an authenticator app to generate codes
            </div>
          </div>
          <button
            onClick={() => handleToggle('security', 'twoFactorEnabled')}
            style={{
              width: isMobile ? '44px' : '48px',
              height: isMobile ? '26px' : '28px',
              borderRadius: '14px',
              backgroundColor: securityData.twoFactorEnabled ? '#1E3A5F' : '#E2E8F0',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.2s',
              padding: 0,
              flexShrink: 0
            }}
          >
            <div style={{
              width: isMobile ? '22px' : '24px',
              height: isMobile ? '22px' : '24px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              position: 'absolute',
              top: '2px',
              left: securityData.twoFactorEnabled ? (isMobile ? '20px' : '22px') : '2px',
              transition: 'left 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div style={{
        padding: isMobileOrTablet ? 'clamp(16px, 2vh, 20px)' : 'clamp(20px, 2.5vh, 24px)',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px'
      }}>
        <h3 style={{ fontSize: `clamp(14px, 1.6vw, 16px)`, fontWeight: 500, color: '#0F172A', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: 'clamp(16px, 2vh, 20px)' }}>
          Active Sessions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          {securityData.activeSessions.map((session) => (
            <div key={session.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '12px' : '0',
              padding: isMobileOrTablet ? 'clamp(12px, 1.5vh, 16px)' : '16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '6px'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, fontWeight: 500, color: '#0F172A' }}>
                    {session.device}
                  </div>
                  {session.isCurrent && (
                    <span style={{
                      padding: '2px 8px',
                      fontSize: `clamp(11px, 1.2vw, 12px)`,
                      fontWeight: 500,
                      color: '#166534',
                      backgroundColor: '#DCFCE7',
                      borderRadius: '10px'
                    }}>
                      Current
                    </span>
                  )}
                </div>
                <div style={{ fontSize: `clamp(12px, 1.4vw, 13px)`, color: '#64748B' }}>
                  {session.location} • {session.time}
                </div>
              </div>
              <button style={{
                padding: `clamp(6px, 0.8vh, 8px) clamp(12px, 1.5vw, 16px)`,
                fontSize: `clamp(12px, 1.4vw, 13px)`,
                fontWeight: 500,
                color: '#DC2626',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
                flexShrink: 0
              }}>
                End Session
              </button>
            </div>
          ))}
        </div>
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#EFF6FF',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <Info style={{ width: '18px', height: '18px', color: '#0075FF', marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: `clamp(12px, 1.4vw, 13px)`, color: '#0075FF' }}>
            If you see an unfamiliar session, end it immediately and change your password.
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div>
      <div style={{ marginBottom: 'clamp(24px, 3vh, 32px)' }}>
        <h2 style={{ fontSize: `clamp(20px, 2.5vw, 24px)`, fontWeight: 600, color: '#0F172A', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: '8px' }}>
          Notification Preferences
        </h2>
        <p style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, color: '#64748B', margin: 0 }}>
          Choose how you want to be notified
        </p>
      </div>

      {/* Email Notifications */}
      <div style={{
        padding: isMobileOrTablet ? 'clamp(16px, 2vh, 20px)' : 'clamp(20px, 2.5vh, 24px)',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        marginBottom: 'clamp(16px, 2vh, 20px)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'flex-start',
          marginBottom: '16px',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '0'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: `clamp(14px, 1.6vw, 16px)`, fontWeight: 500, color: '#0F172A', marginBottom: '12px' }}>
              Email Notifications
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notificationData.emailNotificationTypes.map((type) => (
                <label key={type.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={type.enabled}
                    onChange={() => handleToggle('notifications', type.id)}
                    disabled={!notificationData.emailNotificationsEnabled}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: notificationData.emailNotificationsEnabled ? 'pointer' : 'not-allowed',
                      accentColor: '#1E3A5F',
                      flexShrink: 0
                    }}
                  />
                  <span style={{
                    fontSize: `clamp(13px, 1.5vw, 14px)`,
                    color: notificationData.emailNotificationsEnabled ? '#0F172A' : '#94A3B8'
                  }}>
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={() => handleToggle('notifications', 'emailEnabled')}
            style={{
              width: isMobile ? '44px' : '48px',
              height: isMobile ? '26px' : '28px',
              borderRadius: '14px',
              backgroundColor: notificationData.emailNotificationsEnabled ? '#1E3A5F' : '#E2E8F0',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.2s',
              padding: 0,
              flexShrink: 0,
              alignSelf: isMobile ? 'flex-start' : 'flex-start'
            }}
          >
            <div style={{
              width: isMobile ? '22px' : '24px',
              height: isMobile ? '22px' : '24px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              position: 'absolute',
              top: '2px',
              left: notificationData.emailNotificationsEnabled ? (isMobile ? '20px' : '22px') : '2px',
              transition: 'left 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>
      </div>

      {/* In-App Notifications */}
      <div style={{
        padding: isMobileOrTablet ? 'clamp(16px, 2vh, 20px)' : 'clamp(20px, 2.5vh, 24px)',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        marginBottom: 'clamp(16px, 2vh, 20px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: `clamp(14px, 1.6vw, 16px)`, fontWeight: 500, color: '#0F172A', marginBottom: '4px' }}>
            In-App Notifications
          </div>
        </div>
        <button
          onClick={() => handleToggle('notifications', 'inAppEnabled')}
          style={{
            width: isMobile ? '44px' : '48px',
            height: isMobile ? '26px' : '28px',
            borderRadius: '14px',
            backgroundColor: notificationData.inAppNotificationsEnabled ? '#1E3A5F' : '#E2E8F0',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background-color 0.2s',
            padding: 0,
            flexShrink: 0
          }}
        >
          <div style={{
            width: isMobile ? '22px' : '24px',
            height: isMobile ? '22px' : '24px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            position: 'absolute',
            top: '2px',
            left: notificationData.inAppNotificationsEnabled ? (isMobile ? '20px' : '22px') : '2px',
            transition: 'left 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }} />
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        <button style={{
          padding: `clamp(10px, 1.2vh, 12px) clamp(20px, 2.5vw, 24px)`,
          fontSize: `clamp(13px, 1.5vw, 14px)`,
          fontWeight: 500,
          color: '#1E3A5F',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          cursor: 'pointer',
          width: isMobile ? '100%' : 'auto'
        }}>
          Reset
        </button>
        <button style={{
          padding: `clamp(10px, 1.2vh, 12px) clamp(20px, 2.5vw, 24px)`,
          fontSize: `clamp(13px, 1.5vw, 14px)`,
          fontWeight: 500,
          color: '#FFFFFF',
          backgroundColor: '#1E3A5F',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          width: isMobile ? '100%' : 'auto'
        }}>
          Save Preferences
        </button>
      </div>
    </div>
  );

  const renderBankAccountsSection = () => (
    <div>
      <div style={{
        marginBottom: 'clamp(20px, 2.5vh, 24px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0'
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: `clamp(20px, 2.5vw, 24px)`, fontWeight: 600, color: '#0F172A', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: '8px' }}>
            Bank Accounts
          </h2>
          <p style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, color: '#64748B', margin: 0 }}>
            Manage your linked bank accounts
          </p>
        </div>
        <button style={{
          padding: `clamp(10px, 1.2vh, 12px) clamp(16px, 2vw, 20px)`,
          fontSize: `clamp(13px, 1.5vw, 14px)`,
          fontWeight: 500,
          color: '#FFFFFF',
          backgroundColor: '#1E3A5F',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: isMobile ? '100%' : 'auto',
          flexShrink: 0
        }}>
          <Plus style={{ width: '18px', height: '18px' }} />
          Add Account
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {bankAccounts.map((account) => (
          <div key={account.id} style={{
            padding: isMobileOrTablet ? 'clamp(16px, 2vh, 20px)' : 'clamp(20px, 2.5vh, 24px)',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '12px' : '0'
          }}>
            <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
                flexWrap: 'wrap'
              }}>
                <div style={{ fontSize: `clamp(14px, 1.6vw, 16px)`, fontWeight: 500, color: '#0F172A' }}>
                  {account.bankName}
                </div>
                <span style={{
                  padding: '4px 12px',
                  fontSize: `clamp(11px, 1.2vw, 12px)`,
                  fontWeight: 500,
                  color: account.status === 'verified' ? '#166534' : '#92400E',
                  backgroundColor: account.status === 'verified' ? '#DCFCE7' : '#FEF3C7',
                  borderRadius: '12px',
                  flexShrink: 0
                }}>
                  {account.statusLabel}
                </span>
              </div>
              <div style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, color: '#64748B', marginBottom: '4px' }}>
                {account.type}
              </div>
              <div style={{ fontSize: `clamp(12px, 1.4vw, 13px)`, color: '#64748B' }}>
                {account.accountNumber}
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexDirection: isMobile ? 'column' : 'row',
              width: isMobile ? '100%' : 'auto',
              flexShrink: 0
            }}>
              {account.status === 'pending' && (
                <button style={{
                  padding: `clamp(8px, 1vh, 10px) clamp(12px, 1.5vw, 16px)`,
                  fontSize: `clamp(12px, 1.4vw, 13px)`,
                  fontWeight: 500,
                  color: '#1E3A5F',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #1E3A5F',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto'
                }}>
                  Verify
                </button>
              )}
              <button style={{
                padding: `clamp(8px, 1vh, 10px) clamp(12px, 1.5vw, 16px)`,
                fontSize: `clamp(12px, 1.4vw, 13px)`,
                fontWeight: 500,
                color: '#1E3A5F',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: isMobile ? '100%' : 'auto'
              }}>
                <Edit style={{ width: '14px', height: '14px' }} />
                Edit
              </button>
              <button style={{
                padding: `clamp(8px, 1vh, 10px) clamp(12px, 1.5vw, 16px)`,
                fontSize: `clamp(12px, 1.4vw, 13px)`,
                fontWeight: 500,
                color: '#DC2626',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: isMobile ? '100%' : 'auto'
              }}>
                <Trash2 style={{ width: '14px', height: '14px' }} />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div>
      <div style={{ marginBottom: 'clamp(24px, 3vh, 32px)' }}>
        <h2 style={{ fontSize: `clamp(20px, 2.5vw, 24px)`, fontWeight: 600, color: '#0F172A', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: '8px' }}>
          Privacy Settings
        </h2>
        <p style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, color: '#64748B', margin: 0 }}>
          Control your privacy and data
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Share data with third parties */}
        <div style={{
          padding: isMobileOrTablet ? 'clamp(16px, 2vh, 20px)' : 'clamp(20px, 2.5vh, 24px)',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: `clamp(14px, 1.6vw, 16px)`, fontWeight: 500, color: '#0F172A', marginBottom: '4px' }}>
              Share data with third parties
            </div>
            <div style={{ fontSize: `clamp(12px, 1.4vw, 13px)`, color: '#64748B' }}>
              Allow sharing anonymized data for analytics
            </div>
          </div>
          <button
            onClick={() => handleToggle('privacy', 'shareDataWithThirdParties')}
            style={{
              width: isMobile ? '44px' : '48px',
              height: isMobile ? '26px' : '28px',
              borderRadius: '14px',
              backgroundColor: privacyData.shareDataWithThirdParties ? '#1E3A5F' : '#E2E8F0',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.2s',
              padding: 0,
              flexShrink: 0
            }}
          >
            <div style={{
              width: isMobile ? '22px' : '24px',
              height: isMobile ? '22px' : '24px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              position: 'absolute',
              top: '2px',
              left: privacyData.shareDataWithThirdParties ? (isMobile ? '20px' : '22px') : '2px',
              transition: 'left 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>

        {/* Marketing emails */}
        <div style={{
          padding: isMobileOrTablet ? 'clamp(16px, 2vh, 20px)' : 'clamp(20px, 2.5vh, 24px)',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: `clamp(14px, 1.6vw, 16px)`, fontWeight: 500, color: '#0F172A', marginBottom: '4px' }}>
              Marketing emails
            </div>
            <div style={{ fontSize: `clamp(12px, 1.4vw, 13px)`, color: '#64748B' }}>
              Receive emails about new investment opportunities
            </div>
          </div>
          <button
            onClick={() => handleToggle('privacy', 'marketingEmails')}
            style={{
              width: isMobile ? '44px' : '48px',
              height: isMobile ? '26px' : '28px',
              borderRadius: '14px',
              backgroundColor: privacyData.marketingEmails ? '#1E3A5F' : '#E2E8F0',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.2s',
              padding: 0,
              flexShrink: 0
            }}
          >
            <div style={{
              width: isMobile ? '22px' : '24px',
              height: isMobile ? '22px' : '24px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              position: 'absolute',
              top: '2px',
              left: privacyData.marketingEmails ? (isMobile ? '20px' : '22px') : '2px',
              transition: 'left 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div>
      <div style={{ marginBottom: 'clamp(24px, 3vh, 32px)' }}>
        <h2 style={{ fontSize: `clamp(20px, 2.5vw, 24px)`, fontWeight: 600, color: '#0F172A', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: '8px' }}>
          Preferences
        </h2>
        <p style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, color: '#64748B', margin: 0 }}>
          Customize your application preferences
        </p>
      </div>
      <div style={{
        padding: 'clamp(40px, 5vh, 60px)',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: `clamp(14px, 1.6vw, 16px)`, color: '#64748B', margin: 0 }}>
          Preferences section coming soon...
        </p>
      </div>
    </div>
  );

  const renderDangerZone = () => (
    <div style={{
      padding: isMobileOrTablet ? 'clamp(16px, 2vh, 20px)' : 'clamp(20px, 2.5vh, 24px)',
      backgroundColor: '#FFFFFF',
      border: '1px solid #DC2626',
      borderRadius: '8px',
      marginTop: 'clamp(24px, 3vh, 32px)'
    }}>
      <h3 style={{ fontSize: `clamp(16px, 2vw, 18px)`, fontWeight: 600, color: '#DC2626', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: '12px' }}>
        Danger Zone
      </h3>
      <p style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, color: '#64748B', marginBottom: '16px', marginTop: 0, marginLeft: 0, marginRight: 0 }}>
        Once you delete your account, there is no going back. Please be certain.
      </p>
      <button
        onClick={() => { /* Implement Request Account Deletion Function */ }}
        style={{
          padding: `clamp(10px, 1.2vh, 12px) clamp(20px, 2.5vw, 24px)`,
          fontSize: `clamp(13px, 1.5vw, 14px)`,
          fontWeight: 500,
          color: '#FFFFFF',
          backgroundColor: '#DC2626',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          width: isMobile ? '100%' : 'auto'
        }}>
        Request Account Deletion
      </button>
    </div>
  );

  const renderMainContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'security':
        return renderSecuritySection();
      case 'notifications':
        return renderNotificationsSection();
      case 'preferences':
        return renderPreferencesSection();
      case 'bank-accounts':
        return renderBankAccountsSection();
      case 'privacy':
        return renderPrivacySection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        overflowX: 'hidden',
        maxWidth: '100vw'
      }}>
        {/* Navbar */}
        <InvestorNav />

        {/* Main Content */}
        <div style={{
          display: 'flex',
          flexDirection: isMobileOrTablet ? 'column' : 'row',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobileOrTablet ? `clamp(16px, 2vh, 20px) clamp(16px, 2vw, 20px)` : `clamp(24px, 3vh, 32px) clamp(20px, 2.5vw, 32px)`,
          gap: isMobileOrTablet ? 'clamp(16px, 2vh, 20px)' : 'clamp(24px, 3vw, 32px)'
        }}>
          {/* Left Sidebar - Desktop Only */}
          {!isMobileOrTablet && (
            <div style={{
              width: 'clamp(200px, 25vw, 260px)',
              flexShrink: 0,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: 'clamp(16px, 2vh, 20px)',
              height: 'fit-content',
              position: 'sticky',
              top: 'clamp(80px, 10vh, 100px)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {settingsSections.map((section) => {
                  const IconComponent = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                        fontSize: `clamp(13px, 1.5vw, 14px)`,
                        fontWeight: isActive ? 500 : 400,
                        color: isActive ? '#1E3A5F' : '#64748B',
                        backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                    >
                      <IconComponent style={{
                        width: '18px',
                        height: '18px',
                        flexShrink: 0
                      }} />
                      {section.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mobile/Tablet Section Selector */}
          {isMobileOrTablet && (
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: 'clamp(12px, 1.5vh, 16px)',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch'
            }} className="settings-sections-scroll">
              <div style={{
                display: 'flex',
                gap: '8px',
                minWidth: 'fit-content'
              }}>
                {settingsSections.map((section) => {
                  const IconComponent = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: `clamp(8px, 1vh, 10px) clamp(12px, 2vw, 16px)`,
                        fontSize: `clamp(12px, 1.4vw, 14px)`,
                        fontWeight: isActive ? 500 : 400,
                        color: isActive ? '#1E3A5F' : '#64748B',
                        backgroundColor: isActive ? '#EFF6FF' : '#F8FAFC',
                        border: `1px solid ${isActive ? '#1E3A5F' : '#E2E8F0'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        transition: 'all 0.2s'
                      }}
                    >
                      <IconComponent style={{
                        width: '16px',
                        height: '16px',
                        flexShrink: 0
                      }} />
                      {section.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {error && (
              <div style={{
                padding: '12px 16px',
                marginBottom: '16px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                color: '#991B1B',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            {successMessage && (
              <div style={{
                padding: '12px 16px',
                marginBottom: '16px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '6px',
                color: '#166534',
                fontSize: '14px'
              }}>
                {successMessage}
              </div>
            )}
            {renderMainContent()}
            {activeSection !== 'preferences' && renderDangerZone()}
          </div>
        </div>
      </div>



      <style>
        {`
          @media (max-width: 768px) {
            /* Hide scrollbar for settings sections on mobile */
            .settings-sections-scroll::-webkit-scrollbar {
              display: none;
            }
            .settings-sections-scroll {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          }
        `}
      </style>
    </>
  );
}

