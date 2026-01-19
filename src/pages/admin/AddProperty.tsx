import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building, MapPin, DollarSign, FileText, Upload } from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

// Mock options
const PROPERTY_TYPES = ['Single Family', 'Multi-Family', 'Condo', 'Townhouse', 'Commercial', 'Land'];
const STATUSES = ['Active', 'Pending', 'Sold', 'Archived'];
const STAGES = ['Research', 'FIFA Processing', 'Auction', 'Redemption', 'Barment', 'Quiet Title', 'REO', 'Surplus'];

export default function AddProperty() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Core Info
        address: '',
        city: '',
        state: 'FL',
        zip: '',
        county: '',
        parcelId: '',
        type: 'Single Family',

        // Financials
        estimatedArv: '',
        taxValue: '',
        bidAmount: '',
        interestRate: '12%',

        // Workflow
        status: 'Active',
        stage: 'Research',
        redemptionDeadline: '',
        auctionDate: '',

        // Description
        notes: ''
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            navigate('/admin/properties'); // Redirect to properties list
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
                        <h1 style={{ fontSize: `clamp(20px, 2.5vw, 24px)`, fontWeight: 700, color: '#0F172A', margin: 0 }}>Add New Property</h1>
                        <p style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, color: '#64748B', margin: '4px 0 0 0' }}>Enter property details to initialize workflow.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>

                    {/* Section 1: Core Information */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 16, backgroundColor: '#1E3A5F', borderRadius: 2 }}></div>
                            <MapPin size={18} color="#64748B" /> Core Information
                        </h2>
                        <div style={{ display: 'grid', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Street Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder="e.g. 1240 Oak Street"
                                    required
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => handleChange('city', e.target.value)}
                                        placeholder="City"
                                        required
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>State</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => handleChange('state', e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Zip Code</label>
                                    <input
                                        type="text"
                                        value={formData.zip}
                                        onChange={(e) => handleChange('zip', e.target.value)}
                                        placeholder="Zip"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>County</label>
                                    <input
                                        type="text"
                                        value={formData.county}
                                        onChange={(e) => handleChange('county', e.target.value)}
                                        placeholder="County Name"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Parcel ID / APN</label>
                                    <input
                                        type="text"
                                        value={formData.parcelId}
                                        onChange={(e) => handleChange('parcelId', e.target.value)}
                                        placeholder="XX-XX-XX-XX"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Property Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => handleChange('type', e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}
                                    >
                                        {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Financials */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 16, backgroundColor: '#1E3A5F', borderRadius: 2 }}></div>
                            <DollarSign size={18} color="#64748B" /> Financials
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Estimated ARV</label>
                                <input
                                    type="text"
                                    value={formData.estimatedArv}
                                    onChange={(e) => handleChange('estimatedArv', e.target.value)}
                                    placeholder="$0.00"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Assessed Tax Value</label>
                                <input
                                    type="text"
                                    value={formData.taxValue}
                                    onChange={(e) => handleChange('taxValue', e.target.value)}
                                    placeholder="$0.00"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Bid / Purchase Amount</label>
                                <input
                                    type="text"
                                    value={formData.bidAmount}
                                    onChange={(e) => handleChange('bidAmount', e.target.value)}
                                    placeholder="$0.00"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Interest Rate</label>
                                <input
                                    type="text"
                                    value={formData.interestRate}
                                    onChange={(e) => handleChange('interestRate', e.target.value)}
                                    placeholder="%"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Legal & Workflow */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 16, backgroundColor: '#1E3A5F', borderRadius: 2 }}></div>
                            <Building size={18} color="#64748B" /> Workflow & Legal
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
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
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Workflow Stage</label>
                                <select
                                    value={formData.stage}
                                    onChange={(e) => handleChange('stage', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}
                                >
                                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Auction Date</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="date"
                                        value={formData.auctionDate}
                                        onChange={(e) => handleChange('auctionDate', e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Redemption Deadline</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="date"
                                        value={formData.redemptionDeadline}
                                        onChange={(e) => handleChange('redemptionDeadline', e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Media & Notes */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 16, backgroundColor: '#1E3A5F', borderRadius: 2 }}></div>
                            <FileText size={18} color="#64748B" /> Media & Notes
                        </h2>
                        <div style={{ display: 'grid', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 12 }}>Property Photos</label>
                                <div style={{
                                    border: '2px dashed #E2E8F0', borderRadius: 8, padding: 32,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
                                    cursor: 'pointer', backgroundColor: '#F8FAFC', transition: 'all 0.2s'
                                }}>
                                    <Upload color="#94A3B8" size={32} />
                                    <div style={{ textAlign: 'center' }}>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: '#1E3A5F' }}>Click to upload</span>
                                        <span style={{ fontSize: 14, color: '#64748B' }}> or drag and drop</span>
                                    </div>
                                    <span style={{ fontSize: 12, color: '#94A3B8' }}>JPG, PNG up to 10MB</span>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Internal Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    placeholder="Add any initial notes, access codes, or important details..."
                                    rows={4}
                                    style={{ width: '100%', padding: '12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                                />
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
                                <>Saving...</>
                            ) : (
                                <>
                                    <Save size={16} /> Save Property
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
