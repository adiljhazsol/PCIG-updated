import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Shield, FileText, Send } from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

// Mock options
const INVESTOR_TYPES = ['Individual', 'Joint', 'Entity (LLC)', 'Trust', 'IRA'];
const ROLES = ['Primary Investor', 'Joint Holder', 'Authorized Signatory'];
const FUNDS = ['Tax Deed Redemption Fund I', 'High Yield Auction Fund II', 'Legacy Opportunity Fund', 'REO Stabilization Fund'];

export default function InviteInvestor() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        type: 'Individual',
        isAccredited: false,
        assignedFund: '',
        role: 'Primary Investor',
        sendWelcomeEmail: true,
        notes: ''
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            navigate('/admin/investors');
        }, 1500);
    };

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100%', margin: 0, padding: 0 }}>
            <AdminNav />

            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
                padding: isMobile ? '16px 16px 80px' : isTablet ? '24px 32px 40px' : '32px 40px',
                boxSizing: 'border-box'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginLeft: -8,
                            color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: `clamp(20px, 2.5vw, 24px)`, fontWeight: 700, color: '#0F172A', margin: 0 }}>Invite New Investor</h1>
                        <p style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, color: '#64748B', margin: '4px 0 0 0' }}>Send an invitation to onboard a new investor.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>

                    {/* Section 1: Personal Details */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 16, backgroundColor: '#1E3A5F', borderRadius: 2 }}></div>
                            <User size={18} color="#64748B" /> Personal Details
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>First Name</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                    placeholder="Jane"
                                    required
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Last Name</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                    placeholder="Doe"
                                    required
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="jane.doe@example.com"
                                    required
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    placeholder="(555) 123-4567"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Account Configuration */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 16, backgroundColor: '#1E3A5F', borderRadius: 2 }}></div>
                            <Shield size={18} color="#64748B" /> Account Configuration
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Investor Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => handleChange('type', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}
                                >
                                    {INVESTOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => handleChange('role', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}
                                >
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Assign to Fund (Optional)</label>
                                <select
                                    value={formData.assignedFund}
                                    onChange={(e) => handleChange('assignedFund', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}
                                >
                                    <option value="">-- No fund assignment --</option>
                                    {FUNDS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div style={{ gridColumn: isMobile ? '1' : '1 / -1', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
                                <input
                                    type="checkbox"
                                    id="accredited"
                                    checked={formData.isAccredited}
                                    onChange={(e) => handleChange('isAccredited', e.target.checked)}
                                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                                />
                                <label htmlFor="accredited" style={{ fontSize: 14, color: '#334155', cursor: 'pointer' }}>
                                    This investor is <strong>Accredited</strong>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Notes & Delivery */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 16, backgroundColor: '#1E3A5F', borderRadius: 2 }}></div>
                            <FileText size={18} color="#64748B" /> Notes & Delivery
                        </h2>
                        <div style={{ display: 'grid', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Internal Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    placeholder="Add any context, referral source, or special handling instructions..."
                                    rows={4}
                                    style={{ width: '100%', padding: '12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', backgroundColor: '#F1F5F9', borderRadius: 8 }}>
                                <input
                                    type="checkbox"
                                    id="sendEmail"
                                    checked={formData.sendWelcomeEmail}
                                    onChange={(e) => handleChange('sendWelcomeEmail', e.target.checked)}
                                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                                />
                                <label htmlFor="sendEmail" style={{ fontSize: 14, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Mail size={16} /> Send welcome email with login instructions immediately
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column-reverse' : 'row',
                        justifyContent: 'flex-end',
                        gap: 12,
                        marginTop: 8
                    }}>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: 8,
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                color: '#64748B',
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: 'pointer',
                                width: isMobile ? '100%' : 'auto'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                padding: '10px 24px',
                                borderRadius: 8,
                                border: 'none',
                                backgroundColor: '#1E3A5F',
                                color: '#FFFFFF',
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                opacity: isSubmitting ? 0.7 : 1,
                                width: isMobile ? '100%' : 'auto'
                            }}
                        >
                            {isSubmitting ? (
                                <>Sending...</>
                            ) : (
                                <>
                                    <Send size={16} /> Send Invitation
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
