import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import { useAuth } from '../../context/AuthContext';

export default function ResetPassword() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const token = searchParams.get('token') || '';

  useEffect(() => {
    // If email is passed in query params, pre-fill it
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const FeatureItem = ({ text }: { text: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Check style={{ width: '10px', height: '10px', color: '#ffffff' }} />
      </div>
      <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{text}</span>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      await resetPassword({
        email,
        token,
        password,
        password_confirmation: confirmPassword
      });
      setMessage('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/auth/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobileOrTablet ? 'column' : 'row',
        width: '100%',
        height: '100vh',
        minHeight: '100vh',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: isMobileOrTablet ? '#ffffff' : 'transparent',
      }}
    >
      {/* Mobile/Tablet Logo */}
      {isMobileOrTablet && (
        <div style={{
          padding: `clamp(16px, 2vh, 20px) clamp(20px, 2.5vw, 24px)`,
          borderBottom: 'none',
          backgroundColor: '#1E3A5F',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div
            style={{
              width: `clamp(24px, 3vw, 28px)`,
              height: `clamp(24px, 3vw, 28px)`,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Building2 style={{ width: `clamp(14px, 1.8vw, 16px)`, height: `clamp(14px, 1.8vw, 16px)`, color: '#FFFFFF' }} />
          </div>
          <div style={{ 
            fontSize: `clamp(18px, 2.2vw, 22px)`, 
            fontWeight: 700, 
            color: '#FFFFFF' 
          }}>
            TaxDeedInvest
          </div>
        </div>
      )}

      {/* ==================== LEFT PANEL - BRANDING (Desktop Only) ==================== */}
      {!isMobileOrTablet && (
        <div
          style={{
            flex: 1,
            position: 'relative',
            backgroundColor: '#0f172a',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px',
            color: '#ffffff',
            overflow: 'hidden',
          }}
        >
          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1641760378661-6f290a50a62d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYyMDB8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3Jwb3JhdGUlMjBvZmZpY2UlMjBidWlsZGluZyUyMHNreXNjcmFwZXIlMjBnbGFzcyUyMGFyY2hpdGVjdHVyZXxlbnwwfHx8fDE3NjY5NTcwMzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Corporate Office Building"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.6,
              mixBlendMode: 'overlay',
              zIndex: 0,
            }}
          />

          {/* Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom right, rgba(30, 58, 138, 0.9), rgba(15, 23, 42, 0.95))',
              zIndex: 1,
            }}
          />

          {/* Content Wrapper */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Logo Section - Top */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  backgroundColor: '#ffffff',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 style={{ width: '16px', height: '16px', color: '#1e3a8a' }} />
              </div>
              <span
                style={{
                  fontSize: '19px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                }}
              >
                TaxDeedInvest
              </span>
            </div>

            {/* Hero Section - Center */}
            <div style={{ maxWidth: '420px' }}>
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  marginBottom: '12px',
                  color: '#ffffff',
                  marginTop: 0,
                }}
              >
                Set New Password
              </h1>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginBottom: '20px',
                  marginTop: 0,
                }}
              >
                Create a strong password to secure your account and investment portfolio.
              </p>

              {/* Feature List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <FeatureItem text="Use at least 8 characters" />
                <FeatureItem text="Include special characters" />
                <FeatureItem text="Keep your account secure" />
              </div>
            </div>

            {/* Footer Section - Bottom */}
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
              © 2025 TaxDeedInvest. All rights reserved.
            </div>
          </div>
        </div>
      )}

      {/* ==================== RIGHT PANEL - FORM ==================== */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isMobileOrTablet ? 'flex-start' : 'center',
          alignItems: 'center',
          padding: isMobileOrTablet ? `0 clamp(20px, 2.5vw, 24px)` : '5%',
          overflowY: 'auto',
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        <div 
          style={{ 
            width: isMobileOrTablet ? '100%' : '95%',
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: isMobileOrTablet ? 'clamp(20px, 2.5vh, 24px)' : '0',
            paddingBottom: isMobileOrTablet ? 'clamp(20px, 2.5vh, 24px)' : '0',
            paddingLeft: isMobileOrTablet ? 'clamp(20px, 2.5vw, 24px)' : '0',
            paddingRight: isMobileOrTablet ? 'clamp(20px, 2.5vw, 24px)' : '0',
            minHeight: isMobileOrTablet ? 'auto' : '95%',
            justifyContent: 'center',
          }}
        >
          {/* Form Header */}
          <div style={{ textAlign: 'center', marginBottom: 'clamp(20px, 2.5vh, 24px)' }}>
            {/* Logo Icon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'clamp(16px, 2vh, 20px)' }}>
              <div
                style={{
                  width: `clamp(28px, 4vw, 32px)`,
                  height: `clamp(28px, 4vw, 32px)`,
                  backgroundColor: '#f1f5f9',
                  borderRadius: '7px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 style={{ width: `clamp(15px, 2vw, 17px)`, height: `clamp(15px, 2vw, 17px)`, color: '#1e3a8a' }} />
              </div>
            </div>
            
            {/* Title */}
            <h2
              style={{
                fontSize: `clamp(20px, 2.5vw, 23px)`,
                fontWeight: 600,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                marginBottom: 'clamp(8px, 1vh, 10px)',
                marginTop: 0,
                marginLeft: 0,
                marginRight: 0,
              }}
            >
              Reset Password
            </h2>
            
            {/* Subtitle */}
            <p style={{ 
              fontSize: `clamp(12px, 1.5vw, 13px)`, 
              color: '#64748b', 
              margin: 0, 
              marginBottom: 'clamp(20px, 2.5vh, 24px)',
              lineHeight: 1.5
            }}>
              Enter your new password below.
            </p>
          </div>

          {/* Reset Password Form */}
          {error && (
            <div style={{
              backgroundColor: '#FEE2E2',
              border: '1px solid #EF4444',
              color: '#B91C1C',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{
              backgroundColor: '#D1FAE5',
              border: '1px solid #10B981',
              color: '#065F46',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Email (Hidden or Readonly) */}
              <input type="hidden" value={email} />

              {/* Password Input */}
              <div style={{ marginBottom: '2vh' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontWeight: 500,
                    color: '#0f172a',
                    marginBottom: '1vh',
                  }}
                >
                  New Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '1vw',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Lock style={{ width: 'clamp(12px, 1.5vw, 14px)', height: 'clamp(12px, 1.5vw, 14px)' }} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    style={{
                      width: '100%',
                      height: 'clamp(36px, 5vh, 40px)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '7px',
                      paddingLeft: 'clamp(30px, 4vw, 34px)',
                      paddingRight: 'clamp(30px, 4vw, 38px)',
                      fontSize: 'clamp(12px, 1.5vw, 13px)',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1vw',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                    }}
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: 'clamp(12px, 1.5vw, 14px)', height: 'clamp(12px, 1.5vw, 14px)' }} />
                    ) : (
                      <Eye style={{ width: 'clamp(12px, 1.5vw, 14px)', height: 'clamp(12px, 1.5vw, 14px)' }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div style={{ marginBottom: '2vh' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontWeight: 500,
                    color: '#0f172a',
                    marginBottom: '1vh',
                  }}
                >
                  Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '1vw',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Lock style={{ width: 'clamp(12px, 1.5vw, 14px)', height: 'clamp(12px, 1.5vw, 14px)' }} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    style={{
                      width: '100%',
                      height: 'clamp(36px, 5vh, 40px)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '7px',
                      paddingLeft: 'clamp(30px, 4vw, 34px)',
                      paddingRight: 'clamp(30px, 4vw, 38px)',
                      fontSize: 'clamp(12px, 1.5vw, 13px)',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '1vw',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                    }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff style={{ width: 'clamp(12px, 1.5vw, 14px)', height: 'clamp(12px, 1.5vw, 14px)' }} />
                    ) : (
                      <Eye style={{ width: 'clamp(12px, 1.5vw, 14px)', height: 'clamp(12px, 1.5vw, 14px)' }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  height: `clamp(38px, 4.5vh, 42px)`,
                  backgroundColor: '#1E3A5F',
                  color: '#ffffff',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: `clamp(14px, 1.7vw, 16px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  marginBottom: 'clamp(20px, 2.5vh, 24px)',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a3250';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1E3A5F';
                }}
              >
                Reset Password
              </button>
            </div>

            {/* Secondary Actions - Back to Sign In */}
            <div style={{ textAlign: 'center', fontSize: `clamp(12px, 1.5vw, 13px)`, color: '#64748b', marginBottom: 'clamp(20px, 2.5vh, 24px)' }}>
              Remember your password?{' '}
              <Link
                to="/auth/login"
                style={{
                  fontWeight: 500,
                  color: '#1E3A5F',
                  textDecoration: 'none',
                  marginLeft: '3px',
                }}
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}