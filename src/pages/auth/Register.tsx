import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, Check, Phone, User } from 'lucide-react';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

export default function Register() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [confirmAge, setConfirmAge] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ firstName, lastName, email, phone, password, agreeTerms, confirmAge });
    // Redirect to KYC verification after registration
    navigate('/investor/kyc-verification');
  };

  // Password strength checker
  const checkPasswordStrength = (pwd: string) => {
    const checks = {
      length: pwd.length >= 8,
      number: /\d/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    const strength = Object.values(checks).filter(Boolean).length;
    return { checks, strength, label: strength === 4 ? 'Strong' : strength >= 2 ? 'Medium' : 'Weak' };
  };

  const passwordStrength = checkPasswordStrength(password);

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
              Start Your Investment Journey
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
              Access exclusive tax deed opportunities and professional management tools designed for institutional growth.
            </p>

            {/* Feature List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <FeatureItem text="Create your free investor account" />
              <FeatureItem text="Verify your identity securely" />
              <FeatureItem text="Start browsing portfolio options" />
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
            paddingTop: isMobileOrTablet ? 'clamp(20px, 2.5vh, 24px)' : '5vh',
            paddingBottom: isMobileOrTablet ? 'clamp(20px, 2.5vh, 24px)' : '5vh',
            paddingLeft: isMobileOrTablet ? 'clamp(20px, 2.5vw, 24px)' : '0',
            paddingRight: isMobileOrTablet ? 'clamp(20px, 2.5vw, 24px)' : '0',
            minHeight: isMobileOrTablet ? 'auto' : '90vh',
            justifyContent: 'space-between',
          }}
        >
          {/* Form Header */}
          <div style={{ textAlign: 'center', marginBottom: '2vh' }}>
            {/* Logo Icon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2vh' }}>
              <div
                style={{
                  width: 'clamp(28px, 4vw, 32px)',
                  height: 'clamp(28px, 4vw, 32px)',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '7px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 style={{ width: 'clamp(15px, 2vw, 17px)', height: 'clamp(15px, 2vw, 17px)', color: '#1e3a8a' }} />
              </div>
            </div>
            
            {/* Title */}
            <h2
              style={{
                fontSize: 'clamp(20px, 2.5vw, 23px)',
                fontWeight: 600,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                marginBottom: '1vh',
                marginTop: 0,
              }}
            >
              Create Investor's Account
            </h2>
            
            {/* Subtitle */}
            <p style={{ fontSize: 'clamp(12px, 1.5vw, 13px)', color: '#64748b', margin: 0, marginBottom: '2vh' }}>
              Join TaxDeedInvest to start building your portfolio
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit}>
            {/* First Name & Last Name Row */}
            <div style={{ display: 'flex', gap: '1.5vw', marginBottom: '2vh' }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontWeight: 500,
                    color: '#0f172a',
                    marginBottom: '1vh',
                  }}
                >
                  First Name <span style={{ color: '#ef4444' }}>*</span>
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
                    <User style={{ width: 'clamp(12px, 1.5vw, 14px)', height: 'clamp(12px, 1.5vw, 14px)' }} />
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                    style={{
                      width: '100%',
                      height: 'clamp(36px, 5vh, 40px)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '7px',
                      paddingLeft: 'clamp(30px, 4vw, 34px)',
                      paddingRight: '1.5vw',
                      fontSize: 'clamp(12px, 1.5vw, 13px)',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontWeight: 500,
                    color: '#0f172a',
                    marginBottom: '1vh',
                  }}
                >
                  Last Name <span style={{ color: '#ef4444' }}>*</span>
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
                    <User style={{ width: 'clamp(12px, 1.5vw, 14px)', height: 'clamp(12px, 1.5vw, 14px)' }} />
                  </div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                    style={{
                      width: '100%',
                      height: 'clamp(36px, 5vh, 40px)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '7px',
                      paddingLeft: 'clamp(30px, 4vw, 34px)',
                      paddingRight: '1.5vw',
                      fontSize: 'clamp(12px, 1.5vw, 13px)',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Email Input */}
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
                Email Address <span style={{ color: '#ef4444' }}>*</span>
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
                  <Mail style={{ width: 'clamp(12px, 1.5vw, 14px)', height: 'clamp(12px, 1.5vw, 14px)' }} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  required
                  style={{
                    width: '100%',
                    height: 'clamp(36px, 5vh, 40px)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '7px',
                    paddingLeft: 'clamp(30px, 4vw, 34px)',
                    paddingRight: '1.5vw',
                    fontSize: 'clamp(12px, 1.5vw, 13px)',
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Phone Input */}
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
                Phone Number
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
                  <Phone style={{ width: 'clamp(12px, 1.5vw, 14px)', height: 'clamp(12px, 1.5vw, 14px)' }} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  style={{
                    width: '100%',
                    height: 'clamp(36px, 5vh, 40px)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '7px',
                    paddingLeft: 'clamp(30px, 4vw, 34px)',
                    paddingRight: '1.5vw',
                    fontSize: 'clamp(12px, 1.5vw, 13px)',
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

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
                Password <span style={{ color: '#ef4444' }}>*</span>
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
                  placeholder="Enter your password"
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
                    <Eye style={{ width: 'clamp(12px, 1.5vw, 14px)', height: 'clamp(12px, 1.5vw, 14px)' }} />
                  ) : (
                    <EyeOff style={{ width: 'clamp(12px, 1.5vw, 14px)', height: 'clamp(12px, 1.5vw, 14px)' }} />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div style={{ marginTop: '1vh' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1vh' }}>
                    <span style={{ fontSize: 'clamp(11px, 1.3vw, 12px)', color: '#64748b' }}>Password Strength:</span>
                    <span style={{ fontSize: 'clamp(11px, 1.3vw, 12px)', fontWeight: 500, color: passwordStrength.strength === 4 ? '#10b981' : passwordStrength.strength >= 2 ? '#f59e0b' : '#ef4444' }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div style={{ height: 'clamp(3px, 0.5vh, 4px)', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden', marginBottom: '1vh' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(passwordStrength.strength / 4) * 100}%`,
                        backgroundColor: passwordStrength.strength === 4 ? '#10b981' : passwordStrength.strength >= 2 ? '#f59e0b' : '#ef4444',
                        transition: 'all 300ms ease',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vh' }}>
                    {[
                      { label: '8+ characters', met: passwordStrength.checks.length },
                      { label: 'Number', met: passwordStrength.checks.number },
                      { label: 'Uppercase letter', met: passwordStrength.checks.uppercase },
                      { label: 'Special character', met: passwordStrength.checks.special },
                    ].map((check, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.8vw', fontSize: 'clamp(10px, 1.2vw, 11px)' }}>
                        {check.met ? (
                          <Check style={{ width: 'clamp(10px, 1.3vw, 12px)', height: 'clamp(10px, 1.3vw, 12px)', color: '#10b981' }} />
                        ) : (
                          <div style={{ width: 'clamp(10px, 1.3vw, 12px)', height: 'clamp(10px, 1.3vw, 12px)', borderRadius: '50%', border: '1px solid #e2e8f0' }} />
                        )}
                        <span style={{ color: check.met ? '#10b981' : '#64748b' }}>{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Terms Checkboxes */}
            <div style={{ marginBottom: '2vh' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1vw',
                  cursor: 'pointer',
                  userSelect: 'none',
                  marginBottom: '1.5vh',
                }}
              >
                <div
                  onClick={() => setAgreeTerms(!agreeTerms)}
                  style={{
                    width: 'clamp(12px, 1.5vw, 14px)',
                    height: 'clamp(12px, 1.5vw, 14px)',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: agreeTerms ? '1px solid #1e3a8a' : '1px solid #e2e8f0',
                    backgroundColor: agreeTerms ? '#1e3a8a' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    marginTop: '0.3vh',
                    flexShrink: 0,
                  }}
                >
                  {agreeTerms && <Check style={{ width: 'clamp(7px, 1vw, 9px)', height: 'clamp(7px, 1vw, 9px)', color: '#ffffff' }} />}
                </div>
                <span style={{ fontSize: 'clamp(12px, 1.5vw, 13px)', color: '#64748b', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  <Link to="/terms" style={{ color: '#1e3a8a', textDecoration: 'none', fontWeight: 500 }}>
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" style={{ color: '#1e3a8a', textDecoration: 'none', fontWeight: 500 }}>
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1vw',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div
                  onClick={() => setConfirmAge(!confirmAge)}
                  style={{
                    width: 'clamp(12px, 1.5vw, 14px)',
                    height: 'clamp(12px, 1.5vw, 14px)',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: confirmAge ? '1px solid #1e3a8a' : '1px solid #e2e8f0',
                    backgroundColor: confirmAge ? '#1e3a8a' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    marginTop: '0.3vh',
                    flexShrink: 0,
                  }}
                >
                  {confirmAge && <Check style={{ width: 'clamp(7px, 1vw, 9px)', height: 'clamp(7px, 1vw, 9px)', color: '#ffffff' }} />}
                </div>
                <span style={{ fontSize: 'clamp(12px, 1.5vw, 13px)', color: '#64748b', lineHeight: 1.5 }}>
                  I confirm that I am 18 years or older.
                </span>
              </label>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={!agreeTerms || !confirmAge}
              style={{
                width: '100%',
                height: 'clamp(36px, 5vh, 40px)',
                backgroundColor: agreeTerms && confirmAge ? '#1e3a8a' : '#94a3b8',
                color: '#ffffff',
                borderRadius: '7px',
                border: 'none',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontWeight: 500,
                cursor: agreeTerms && confirmAge ? 'pointer' : 'not-allowed',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                marginBottom: '2vh',
                transition: 'all 150ms ease',
              }}
            >
              Create Account
            </button>
          </form>

          {/* Secondary Actions - Sign In */}
          <div style={{ textAlign: 'center', fontSize: 'clamp(12px, 1.5vw, 13px)', color: '#64748b', marginTop: 'auto', paddingTop: '5vh', paddingBottom: '5vh' }}>
            Already have an account?{' '}
            <Link
              to="/auth/login"
              style={{
                fontWeight: 500,
                color: '#1e3a8a',
                textDecoration: 'none',
                marginLeft: '3px',
              }}
            >
              Sign in
            </Link>
          </div>
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

