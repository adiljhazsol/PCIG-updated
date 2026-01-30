import { useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PendingApproval() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        width: '100%',
        maxWidth: '480px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#FEF3C7',
          color: '#D97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto'
        }}>
          <Clock size={40} />
        </div>

        <h1 style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#0F172A',
          marginBottom: '12px'
        }}>
          Verification Pending
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#64748B',
          lineHeight: 1.5,
          marginBottom: '32px'
        }}>
          Thank you for submitting your verification details. Your account is currently under review by our administrators.
          <br /><br />
          You will receive an email confirmation once your account has been approved. Please check back later.
        </p>

        <div style={{
          padding: '16px',
          backgroundColor: '#F1F5F9',
          borderRadius: '8px',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#0F172A',
            marginBottom: '8px'
          }}>
            What happens next?
          </h3>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '14px',
            color: '#475569',
            lineHeight: 1.6
          }}>
            <li>Admin reviews your documents</li>
            <li>Background check is performed</li>
            <li>Approval notification sent via email</li>
          </ul>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            color: '#64748B',
            border: '1px solid #E2E8F0',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%'
          }}
        >
          <LogOut size={16} />
          Return to Login
        </button>
      </div>
    </div>
  );
}
