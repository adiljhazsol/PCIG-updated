import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

export default function Login() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add actual authentication logic here
    // For now, redirect to investor dashboard on any login attempt
    navigate('/investor/dashboard');
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
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <button
            onClick={() => navigate('/auth/admin-login')}
            style={{
              padding: `clamp(6px, 1vh, 8px) clamp(12px, 1.5vw, 16px)`,
              fontSize: `clamp(12px, 1.3vw, 14px)`,
              fontWeight: 500,
              color: '#FFFFFF',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            Admin
          </button>
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
              Professional Investment Management
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
              Manage your tax deed investments with institutional-grade tools built for scale, security, and performance.
            </p>

            {/* Feature List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <FeatureItem text="Secure & Regulated Platform" />
              <FeatureItem text="Real-time Portfolio Analytics" />
              <FeatureItem text="Institutional Reporting" />
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
          position: 'relative',
        }}
      >
        {/* Admin Button - Desktop Top Right */}
        {!isMobileOrTablet && (
          <button
            onClick={() => navigate('/auth/admin-login')}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#FFFFFF',
              backgroundColor: '#1E3A5F',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
          >
            Admin
          </button>
        )}
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
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            {/* Logo Icon - Above Welcome Back */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '7px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 style={{ width: '17px', height: '17px', color: '#1e3a8a' }} />
              </div>
            </div>
            
            {/* Title */}
            <h2
              style={{
                fontSize: '23px',
                fontWeight: 600,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                marginBottom: '10px',
                marginTop: 0,
              }}
            >
              Welcome Back
            </h2>
            
            {/* Subtitle */}
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, marginBottom: '20px' }}>
              Enter your credentials to access your investor portal
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Email Input */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#0f172a',
                    marginBottom: '8px',
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Mail style={{ width: '14px', height: '14px' }} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    style={{
                      width: '100%',
                      height: '38px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '7px',
                      paddingLeft: '34px',
                      paddingRight: '11px',
                      fontSize: '13px',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#0f172a',
                    marginBottom: '8px',
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Lock style={{ width: '14px', height: '14px' }} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      height: '38px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '7px',
                      paddingLeft: '34px',
                      paddingRight: '38px',
                      fontSize: '13px',
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
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? (
                      <Eye style={{ width: '14px', height: '14px' }} />
                    ) : (
                      <EyeOff style={{ width: '14px', height: '14px' }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Row Actions - Remember Me & Forgot Password */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                {/* Remember Me Checkbox */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: rememberMe ? '1px solid #1e3a8a' : '1px solid #e2e8f0',
                      backgroundColor: rememberMe ? '#1e3a8a' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {rememberMe && <Check style={{ width: '9px', height: '9px', color: '#ffffff' }} />}
                  </div>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Remember me</span>
                </label>

                {/* Forgot Password Link */}
                <Link
                  to="/auth/forgot-password"
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#1e3a8a',
                    textDecoration: 'none',
                  }}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  height: '38px',
                  backgroundColor: '#1e3a8a',
                  color: '#ffffff',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  marginBottom: '20px',
                }}
              >
                Sign In
              </button>
            </div>

            {/* Secondary Actions - Sign Up */}
            <div style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Don't have an account?{' '}
              <Link
                to="/auth/register"
                style={{
                  fontWeight: 500,
                  color: '#1e3a8a',
                  textDecoration: 'none',
                  marginLeft: '3px',
                }}
              >
                Sign up
              </Link>
            </div>

            {/* Footer Links */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '13px',
                fontSize: '12px',
                color: '#64748b',
              }}
            >
              <Link to="/privacy" style={{ color: '#64748b', textDecoration: 'none' }}>
                Privacy Policy
              </Link>
              <Link to="/terms" style={{ color: '#64748b', textDecoration: 'none' }}>
                Terms of Service
              </Link>
              <Link to="/support" style={{ color: '#64748b', textDecoration: 'none' }}>
                Contact Support
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* Feature Item Component */
function FeatureItem({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: '19px',
          height: '19px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Check style={{ width: '11px', height: '11px', color: '#ffffff' }} />
      </div>
      <span
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        {text}
      </span>
    </div>
  );
}
