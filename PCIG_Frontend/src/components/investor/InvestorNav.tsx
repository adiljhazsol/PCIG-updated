import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationsContext';
import { 
    Menu, 
    Bell, 
    User, 
    LogOut,
    ChevronDown,
    PieChart,
    Building,
    Briefcase,
    FileText,
    Settings,
    X,
    LayoutDashboard
} from 'lucide-react';

export default function InvestorNav() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const isMobileOrTablet = isMobile || isTablet;
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const userDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setUserDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth/login');
        } catch (error) {
            console.error('Logout failed', error);
            navigate('/auth/login');
        }
    };

    const isActive = (path: string) => location.pathname === path;
    const isFundsActive = location.pathname.includes('/investor/funds') || location.pathname.includes('/investor/share-marketplace');

    return (
        <>
            <div style={{
                backgroundColor: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
                padding: `clamp(12px, 1.5vh, 16px) clamp(16px, 2.5vw, 48px)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(8px, 1.5vw, 12px)`, flexShrink: 0 }}>
                    <div style={{ fontSize: `clamp(16px, 2vw, 20px)`, fontWeight: 700, color: '#0F172A' }}>TaxDeedInvest</div>
                </div>

                {/* Desktop Navigation - Centered */}
                {!isMobileOrTablet && (
                    <nav style={{
                        display: 'flex',
                        gap: `clamp(24px, 3vw, 40px)`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1
                    }}>
                        <Link
                            to="/investor/dashboard"
                            style={{
                                fontSize: '14px',
                                fontWeight: isActive('/investor/dashboard') ? 600 : 500,
                                color: isActive('/investor/dashboard') ? '#1E3A5F' : '#64748B',
                                textDecoration: 'none',
                                paddingBottom: '4px',
                                borderBottom: isActive('/investor/dashboard') ? '2px solid #1E3A5F' : 'none',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Dashboard
                        </Link>

                        <Link
                            to="/investor/properties"
                            style={{
                                fontSize: '14px',
                                fontWeight: isActive('/investor/properties') ? 600 : 500,
                                color: isActive('/investor/properties') ? '#1E3A5F' : '#64748B',
                                textDecoration: 'none',
                                paddingBottom: '4px',
                                borderBottom: isActive('/investor/properties') ? '2px solid #1E3A5F' : 'none',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Properties Marketplace
                        </Link>

                        <Link
                            to="/investor/funds"
                            style={{
                                fontSize: '14px',
                                fontWeight: isActive('/investor/funds') ? 600 : 500,
                                color: isActive('/investor/funds') ? '#1E3A5F' : '#64748B',
                                textDecoration: 'none',
                                paddingBottom: '4px',
                                borderBottom: isActive('/investor/funds') ? '2px solid #1E3A5F' : 'none',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Funds Marketplace
                        </Link>

                        <Link
                            to="/investor/share-marketplace"
                            style={{
                                fontSize: '14px',
                                fontWeight: isActive('/investor/share-marketplace') ? 600 : 500,
                                color: isActive('/investor/share-marketplace') ? '#1E3A5F' : '#64748B',
                                textDecoration: 'none',
                                paddingBottom: '4px',
                                borderBottom: isActive('/investor/share-marketplace') ? '2px solid #1E3A5F' : 'none',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Shares Marketplace
                        </Link>

                        <Link
                            to="/investor/transactions"
                            style={{
                                fontSize: '14px',
                                fontWeight: isActive('/investor/transactions') ? 600 : 500,
                                color: isActive('/investor/transactions') ? '#1E3A5F' : '#64748B',
                                textDecoration: 'none',
                                paddingBottom: '4px',
                                borderBottom: isActive('/investor/transactions') ? '2px solid #1E3A5F' : 'none',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Transactions
                        </Link>

                        <Link
                            to="/investor/documents"
                            style={{
                                fontSize: '14px',
                                fontWeight: isActive('/investor/documents') ? 600 : 500,
                                color: isActive('/investor/documents') ? '#1E3A5F' : '#64748B',
                                textDecoration: 'none',
                                paddingBottom: '4px',
                                borderBottom: isActive('/investor/documents') ? '2px solid #1E3A5F' : 'none',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Documents
                        </Link>

                        <Link
                            to="/investor/settings"
                            style={{
                                fontSize: '14px',
                                fontWeight: isActive('/investor/settings') ? 600 : 500,
                                color: isActive('/investor/settings') ? '#1E3A5F' : '#64748B',
                                textDecoration: 'none',
                                paddingBottom: '4px',
                                borderBottom: isActive('/investor/settings') ? '2px solid #1E3A5F' : 'none',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Settings
                        </Link>
                    </nav>
                )}

                {/* Right Side Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(8px, 1.5vw, 16px)`, flexShrink: 0, justifyContent: 'flex-end' }}>
                    <Link to="/investor/notifications" style={{
                        position: 'relative',
                        padding: '8px',
                        borderRadius: '6px',
                        backgroundColor: location.pathname === '/investor/notifications' ? '#F1F5F9' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Bell style={{ width: `clamp(18px, 1.5vw, 20px)`, height: `clamp(18px, 1.5vw, 20px)`, color: '#64748B' }} />
                        {unreadCount > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#DC2626',
                                borderRadius: '50%',
                                border: '2px solid #FFFFFF'
                            }}></div>
                        )}
                    </Link>

                    {isMobileOrTablet && (
                        <button
                            onClick={() => setDrawerOpen(true)}
                            style={{
                                padding: '8px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}
                        >
                            <Menu style={{ width: `clamp(20px, 2vw, 24px)`, height: `clamp(20px, 2vw, 24px)`, color: '#64748B' }} />
                        </button>
                    )}

                    <div 
                        ref={userDropdownRef}
                        style={{ position: 'relative' }}
                    >
                        <div 
                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                width: `clamp(36px, 3vw, 40px)`,
                                height: `clamp(36px, 3vw, 40px)`,
                                borderRadius: '50%',
                                backgroundColor: '#EFF6FF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                flexShrink: 0
                            }}>
                                <User style={{ width: `clamp(20px, 2vw, 24px)`, height: `clamp(20px, 2vw, 24px)`, color: '#1E3A5F' }} />
                            </div>
                            <ChevronDown style={{ width: `clamp(16px, 1.5vw, 18px)`, height: `clamp(16px, 1.5vw, 18px)`, color: '#64748B' }} />
                        </div>

                        {/* Dropdown Menu */}
                        {userDropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '120%',
                                right: 0,
                                width: '200px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                zIndex: 1000,
                                padding: '4px 0',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <Link 
                                    to="/investor/settings?section=profile" 
                                    onClick={() => setUserDropdownOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 16px',
                                        color: '#0F172A',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        transition: 'background-color 0.2s',
                                        width: '100%',
                                        boxSizing: 'border-box'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <User style={{ width: '16px', height: '16px', color: '#64748B' }} />
                                    Profile
                                </Link>
                                <Link 
                                    to="/investor/notifications" 
                                    onClick={() => setUserDropdownOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 16px',
                                        color: '#0F172A',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        transition: 'background-color 0.2s',
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        justifyContent: 'space-between'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Bell style={{ width: '16px', height: '16px', color: '#64748B' }} />
                                        Notifications
                                    </div>
                                    {unreadCount > 0 && (
                                        <span style={{
                                            backgroundColor: '#DC2626',
                                            color: '#FFFFFF',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            padding: '2px 6px',
                                            borderRadius: '10px',
                                            lineHeight: 1
                                        }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>
                                <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0' }}></div>
                                <button 
                                    onClick={handleLogout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 16px',
                                        color: '#DC2626',
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        width: '100%',
                                        textAlign: 'left',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <LogOut style={{ width: '16px', height: '16px' }} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile/Tablet Drawer - rudimentary implementation for now */}
            {isMobileOrTablet && drawerOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 200,
                    display: 'flex',
                    justifyContent: 'flex-end'
                }} onClick={() => setDrawerOpen(false)}>
                    <div style={{
                        width: '80%',
                        maxWidth: '300px',
                        backgroundColor: '#fff',
                        height: '100%',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ margin: 0, marginBottom: 16 }}>Menu</h3>
                        <Link to="/investor/dashboard" style={{ textDecoration: 'none', color: '#0F172A', fontSize: 16, fontWeight: 500 }}>Dashboard</Link>
                        <Link to="/investor/properties" style={{ textDecoration: 'none', color: '#0F172A', fontSize: 16, fontWeight: 500 }}>Properties Marketplace</Link>
                        <Link to="/investor/funds" style={{ textDecoration: 'none', color: '#0F172A', fontSize: 16, fontWeight: 500 }}>Funds Marketplace</Link>
                        <Link to="/investor/share-marketplace" style={{ textDecoration: 'none', color: '#0F172A', fontSize: 16, fontWeight: 500 }}>Shares Marketplace</Link>
                        <Link to="/investor/transactions" style={{ textDecoration: 'none', color: '#0F172A', fontSize: 16, fontWeight: 500 }}>Transactions</Link>
                        <Link to="/investor/documents" style={{ textDecoration: 'none', color: '#0F172A', fontSize: 16, fontWeight: 500 }}>Documents</Link>
                        <Link to="/investor/settings" style={{ textDecoration: 'none', color: '#0F172A', fontSize: 16, fontWeight: 500 }}>Settings</Link>
                        <Link to="/investor/notifications" style={{ textDecoration: 'none', color: '#0F172A', fontSize: 16, fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            Notifications
                            {unreadCount > 0 && (
                                <span style={{
                                    backgroundColor: '#DC2626',
                                    color: '#FFFFFF',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    borderRadius: '12px'
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
