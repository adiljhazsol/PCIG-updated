import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText, User, DollarSign } from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

export default function CreateTransaction() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const navigate = useNavigate();

    // Mock Data for Dropdowns
    const TRANSACTION_TYPES = ['Buy', 'Sell', 'Lease'];
    const STATUS_OPTIONS = ['Draft', 'Under Contract', 'Closed', 'Terminated'];
    const ASSETS = [
        { id: 'PCIG-2024-001', address: '1240 Oak Street' },
        { id: 'PCIG-2024-014', address: '532 Lakeview Ave' },
        { id: 'PCIG-2024-032', address: '88 Pinecrest Dr' },
        { id: 'PCIG-2024-041', address: '19 Coral Way' }
    ];

    const [formData, setFormData] = useState({
        type: 'Sell',
        status: 'Draft',
        assetId: '',
        counterpartyName: '',
        counterpartyRole: 'Buyer',
        counterpartyEmail: '',
        counterpartyPhone: '',
        price: '',
        earnestMoney: '',
        netProceeds: '',
        contractDate: '',
        closingDate: '',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting Transaction:', formData);
        // Simulate API call
        setTimeout(() => {
            navigate('/admin/asset-transactions');
        }, 500);
    };

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
            <AdminNav />
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
                padding: isMobile ? '16px 16px' : isTablet ? '24px 32px' : '32px 40px',
                boxSizing: 'border-box'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
                    >
                        <ArrowLeft size={20} color="#64748B" />
                    </button>
                    <div>
                        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                            Create Transaction
                        </h1>
                        <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
                            Record a new property acquisition, sale, or lease agreement
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>
                    {/* 1. Transaction Type & Asset */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <FileText size={18} color="#1E3A5F" />
                            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: 0 }}>Transaction Details</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 20 }}>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Transaction Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    style={{ padding: '10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: isMobile ? 16 : 14 }}
                                >
                                    {TRANSACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    style={{ padding: '10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: isMobile ? 16 : 14 }}
                                >
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gap: 6, gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Select Property / Asset</label>
                                <select
                                    name="assetId"
                                    value={formData.assetId}
                                    onChange={handleChange}
                                    style={{ padding: '10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: isMobile ? 16 : 14 }}
                                    required
                                >
                                    <option value="">Select a property...</option>
                                    {ASSETS.map(asset => (
                                        <option key={asset.id} value={asset.id}>{asset.address} ({asset.id})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 2. Counterparty Information */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <User size={18} color="#1E3A5F" />
                            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: 0 }}>Counterparty Info</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 20 }}>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Name (Person or Entity)</label>
                                <input
                                    type="text"
                                    name="counterpartyName"
                                    value={formData.counterpartyName}
                                    onChange={handleChange}
                                    placeholder="e.g. John Smith or Sunshine Homes LLC"
                                    style={{ padding: '10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: isMobile ? 16 : 14 }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Role</label>
                                <select
                                    name="counterpartyRole"
                                    value={formData.counterpartyRole}
                                    onChange={handleChange}
                                    style={{ padding: '10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: isMobile ? 16 : 14 }}
                                >
                                    <option value="Buyer">Buyer</option>
                                    <option value="Seller">Seller</option>
                                    <option value="Tenant">Tenant</option>
                                    <option value="Agent">Agent</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Email</label>
                                <input
                                    type="email"
                                    name="counterpartyEmail"
                                    value={formData.counterpartyEmail}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    style={{ padding: '10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: isMobile ? 16 : 14 }}
                                />
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Phone</label>
                                <input
                                    type="tel"
                                    name="counterpartyPhone"
                                    value={formData.counterpartyPhone}
                                    onChange={handleChange}
                                    placeholder="(555) 123-4567"
                                    style={{ padding: '10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: isMobile ? 16 : 14 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. Financials & Dates */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <DollarSign size={18} color="#1E3A5F" />
                            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: 0 }}>Financials & Key Dates</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Transaction Price</label>
                                <input
                                    type="text"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="$0.00"
                                    style={{ padding: '10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: isMobile ? 16 : 14 }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Earnest Money</label>
                                <input
                                    type="text"
                                    name="earnestMoney"
                                    value={formData.earnestMoney}
                                    onChange={handleChange}
                                    placeholder="$0.00"
                                    style={{ padding: '10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: isMobile ? 16 : 14 }}
                                />
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Est. Net Proceeds</label>
                                <input
                                    type="text"
                                    name="netProceeds"
                                    value={formData.netProceeds}
                                    onChange={handleChange}
                                    placeholder="$0.00"
                                    style={{ padding: '10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: isMobile ? 16 : 14 }}
                                />
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Effective / Contract Date</label>
                                <input
                                    type="date"
                                    name="contractDate"
                                    value={formData.contractDate}
                                    onChange={handleChange}
                                    style={{ padding: '10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: isMobile ? 16 : 14 }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Closing Date</label>
                                <input
                                    type="date"
                                    name="closingDate"
                                    value={formData.closingDate}
                                    onChange={handleChange}
                                    style={{ padding: '10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: isMobile ? 16 : 14 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                        display: 'flex',
                        justifyContent: isMobile ? 'stretch' : 'flex-end',
                        flexDirection: isMobile ? 'column-reverse' : 'row',
                        gap: 12,
                        marginTop: 12
                    }}>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: 8,
                                border: '1px solid #CBD5E1',
                                backgroundColor: '#FFFFFF',
                                color: '#475569',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer',
                                width: isMobile ? '100%' : 'auto',
                                justifyContent: 'center',
                                display: 'flex'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 24px',
                                borderRadius: 8,
                                border: 'none',
                                backgroundColor: '#1E3A5F',
                                color: '#FFFFFF',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: '0 1px 2px rgba(30, 58, 95, 0.2)',
                                width: isMobile ? '100%' : 'auto',
                                justifyContent: 'center'
                            }}
                        >
                            <Save size={18} />
                            Create Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
