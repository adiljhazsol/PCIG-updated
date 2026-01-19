import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, DollarSign, Calendar, Target, FileText } from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

// Mock data for dropdowns
const STRATEGIES = ['Growth', 'Income', 'Balanced', 'Opportunistic', 'Distressed Assets'];
const STATUSES = ['Launching Soon', 'Open', 'Closed', 'Liquidating'];

export default function CreateFund() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    // const isMobileOrTablet = isMobile || isTablet; // Not strictly needed if we chain ternaries, but good for potential future use
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        id: 'PCIG-FUND-' + Math.floor(100 + Math.random() * 900), // Auto-generate ID suggestion
        strategy: 'Growth',
        status: 'Launching Soon',
        targetIRR: '',
        hardCap: '',
        minInvestment: '',
        lockUp: '',
        description: '',
        managementFee: '2.0%',
        performanceFee: '20%'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            navigate('/admin/funds'); // Redirect back to fund list (or dashboard if funds list doesn't exist as dedicated page)
        }, 1500);
    };

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100%', margin: 0, padding: 0 }}>
            <AdminNav />

            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
                padding: isMobile ? '16px 16px 32px' : isTablet ? '24px 32px' : '32px 40px',
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
                        <h1 style={{ fontSize: `clamp(20px, 2.5vw, 24px)`, fontWeight: 700, color: '#0F172A', margin: 0 }}>Create New Fund</h1>
                        <p style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, color: '#64748B', margin: '4px 0 0 0' }}>Set up a new investment vehicle for investors.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>

                    {/* Section 1: General Info */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 16, backgroundColor: '#1E3A5F', borderRadius: 2 }}></div>
                            General Information
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Fund Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="e.g. PCIG Income Fund II"
                                    required
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Fund ID</label>
                                <input
                                    type="text"
                                    value={formData.id}
                                    onChange={(e) => handleChange('id', e.target.value)}
                                    placeholder="e.g. PCIG-FUND-00X"
                                    required
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Strategy</label>
                                <select
                                    value={formData.strategy}
                                    onChange={(e) => handleChange('strategy', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}
                                >
                                    {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Initial Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}
                                >
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Investment Parameters */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 16, backgroundColor: '#1E3A5F', borderRadius: 2 }}></div>
                            Investment Parameters
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 20 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Target size={14} /> Target IRR
                                </label>
                                <input
                                    type="text"
                                    value={formData.targetIRR}
                                    onChange={(e) => handleChange('targetIRR', e.target.value)}
                                    placeholder="e.g. 12-15%"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <DollarSign size={14} /> Hard Cap
                                </label>
                                <input
                                    type="text"
                                    value={formData.hardCap}
                                    onChange={(e) => handleChange('hardCap', e.target.value)}
                                    placeholder="e.g. $50M"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <DollarSign size={14} /> Min Investment
                                </label>
                                <input
                                    type="text"
                                    value={formData.minInvestment}
                                    onChange={(e) => handleChange('minInvestment', e.target.value)}
                                    placeholder="e.g. $25,000"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Calendar size={14} /> Lock-up Period
                                </label>
                                <input
                                    type="text"
                                    value={formData.lockUp}
                                    onChange={(e) => handleChange('lockUp', e.target.value)}
                                    placeholder="e.g. 12 Months"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Management Fee</label>
                                <input
                                    type="text"
                                    value={formData.managementFee}
                                    onChange={(e) => handleChange('managementFee', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Performance Fee</label>
                                <input
                                    type="text"
                                    value={formData.performanceFee}
                                    onChange={(e) => handleChange('performanceFee', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Description & Documents */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 16, backgroundColor: '#1E3A5F', borderRadius: 2 }}></div>
                            Fund Details
                        </h2>
                        <div style={{ display: 'grid', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Investment Thesis / Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Describe the fund's strategy, focus areas, and key selling points for investors..."
                                    rows={5}
                                    style={{ width: '100%', padding: '12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 12 }}>Offering Documents</label>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                                    <div style={{
                                        border: '2px dashed #E2E8F0', borderRadius: 8, padding: 20,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        cursor: 'pointer', backgroundColor: '#F8FAFC', transition: 'all 0.2s'
                                    }}>
                                        <FileText color="#94A3B8" size={24} />
                                        <span style={{ fontSize: 13, fontWeight: 500, color: '#64748B' }}>Upload Prospectus (PDF)</span>
                                    </div>
                                    <div style={{
                                        border: '2px dashed #E2E8F0', borderRadius: 8, padding: 20,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        cursor: 'pointer', backgroundColor: '#F8FAFC', transition: 'all 0.2s'
                                    }}>
                                        <FileText color="#94A3B8" size={24} />
                                        <span style={{ fontSize: 13, fontWeight: 500, color: '#64748B' }}>Upload Term Sheet (PDF)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            style={{
                                padding: '10px 20px', borderRadius: 8, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF',
                                color: '#64748B', fontSize: 14, fontWeight: 500, cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                padding: '10px 24px', borderRadius: 8, border: 'none', backgroundColor: '#1E3A5F',
                                color: '#FFFFFF', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8,
                                opacity: isSubmitting ? 0.7 : 1
                            }}
                        >
                            {isSubmitting ? (
                                <>Creating Fund...</>
                            ) : (
                                <>
                                    <Save size={16} /> Create Fund
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
