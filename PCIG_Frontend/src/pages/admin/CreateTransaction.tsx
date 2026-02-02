import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get('http://127.0.0.1:8000/api/admin/reo/all-properties', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                setAssets(response.data);
            } catch (error) {
                console.error('Error fetching properties:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [navigate]);

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

    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [generalError, setGeneralError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const getInputStyle = (fieldName: string) => ({
        padding: '10px',
        borderRadius: 6,
        border: `1px solid ${errors[fieldName] ? '#EF4444' : '#CBD5E1'}`,
        fontSize: isMobile ? 16 : 14,
        width: '100%',
        boxSizing: 'border-box' as 'border-box'
    });

    const renderError = (fieldName: string) => {
        if (!errors[fieldName]) return null;
        return (
            <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                {errors[fieldName][0]}
            </div>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);
        setErrors({});
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Map frontend types to backend types
            let backendType = 'sale';
            if (formData.type === 'Buy') backendType = 'purchase';
            else if (formData.type === 'Sell') backendType = 'sale';
            else if (formData.type === 'Lease') backendType = 'sale'; // Fallback for Lease

            // Map status
            let backendStatus = 'pending';
            if (formData.status === 'Closed') backendStatus = 'completed';
            else if (formData.status === 'Terminated') backendStatus = 'cancelled';
            else backendStatus = 'pending'; // Draft/Under Contract

            const payload = {
                type: backendType,
                status: backendStatus,
                amount: parseFloat(formData.price.replace(/[^0-9.-]+/g, "")) || 0,
                property_id: formData.assetId || null,
                description: `Transaction: ${formData.type} - ${formData.notes || ''}`,
                metadata: {
                    original_type: formData.type,
                    original_status: formData.status,
                    counterparty: {
                        name: formData.counterpartyName,
                        role: formData.counterpartyRole,
                        email: formData.counterpartyEmail,
                        phone: formData.counterpartyPhone
                    },
                    financials: {
                        earnest_money: formData.earnestMoney,
                        net_proceeds: formData.netProceeds
                    },
                    dates: {
                        contract_date: formData.contractDate,
                        closing_date: formData.closingDate
                    }
                }
            };

            await axios.post('http://127.0.0.1:8000/api/admin/transactions', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            navigate('/admin/asset-transactions');
        } catch (error: any) {
            console.error('Error creating transaction:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                const backendErrors = error.response.data.errors;
                const frontendErrors: Record<string, string[]> = {};
                
                // Map backend fields to frontend fields
                const fieldMap: Record<string, string> = {
                    'amount': 'price',
                    'property_id': 'assetId',
                    'description': 'notes',
                    // Add other mappings if necessary
                };

                Object.keys(backendErrors).forEach(key => {
                    const frontendKey = fieldMap[key] || key;
                    frontendErrors[frontendKey] = backendErrors[key];
                });
                
                setErrors(frontendErrors);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setGeneralError(`Failed to create transaction: ${error.response?.data?.message || error.message || 'Unknown error'}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
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

                {generalError && (
                    <div style={{ padding: '12px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, color: '#B91C1C', marginBottom: 24, fontSize: 14 }}>
                        {generalError}
                    </div>
                )}

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
                                    style={getInputStyle('type')}
                                >
                                    {TRANSACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                {renderError('type')}
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    style={getInputStyle('status')}
                                >
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {renderError('status')}
                            </div>
                            <div style={{ display: 'grid', gap: 6, gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Select Property / Asset</label>
                                <select
                                    name="assetId"
                                    value={formData.assetId}
                                    onChange={handleChange}
                                    style={getInputStyle('assetId')}
                                    required
                                >
                                    <option value="">Select a property...</option>
                                    {loading ? (
                                        <option disabled>Loading properties...</option>
                                    ) : (
                                        assets.map(asset => (
                                            <option key={asset.id} value={asset.id}>{asset.address}</option>
                                        ))
                                    )}
                                </select>
                                {renderError('assetId')}
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
                                    style={getInputStyle('counterpartyName')}
                                    required
                                />
                                {renderError('counterpartyName')}
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Role</label>
                                <select
                                    name="counterpartyRole"
                                    value={formData.counterpartyRole}
                                    onChange={handleChange}
                                    style={getInputStyle('counterpartyRole')}
                                >
                                    <option value="Buyer">Buyer</option>
                                    <option value="Seller">Seller</option>
                                    <option value="Tenant">Tenant</option>
                                    <option value="Agent">Agent</option>
                                </select>
                                {renderError('counterpartyRole')}
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Email</label>
                                <input
                                    type="email"
                                    name="counterpartyEmail"
                                    value={formData.counterpartyEmail}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    style={getInputStyle('counterpartyEmail')}
                                />
                                {renderError('counterpartyEmail')}
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Phone</label>
                                <input
                                    type="tel"
                                    name="counterpartyPhone"
                                    value={formData.counterpartyPhone}
                                    onChange={handleChange}
                                    placeholder="(555) 123-4567"
                                    style={getInputStyle('counterpartyPhone')}
                                />
                                {renderError('counterpartyPhone')}
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
                                    style={getInputStyle('price')}
                                    required
                                />
                                {renderError('price')}
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Earnest Money</label>
                                <input
                                    type="text"
                                    name="earnestMoney"
                                    value={formData.earnestMoney}
                                    onChange={handleChange}
                                    placeholder="$0.00"
                                    style={getInputStyle('earnestMoney')}
                                />
                                {renderError('earnestMoney')}
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Est. Net Proceeds</label>
                                <input
                                    type="text"
                                    name="netProceeds"
                                    value={formData.netProceeds}
                                    onChange={handleChange}
                                    placeholder="$0.00"
                                    style={getInputStyle('netProceeds')}
                                />
                                {renderError('netProceeds')}
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Effective / Contract Date</label>
                                <input
                                    type="date"
                                    name="contractDate"
                                    value={formData.contractDate}
                                    onChange={handleChange}
                                    style={getInputStyle('contractDate')}
                                    required
                                />
                                {renderError('contractDate')}
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Closing Date</label>
                                <input
                                    type="date"
                                    name="closingDate"
                                    value={formData.closingDate}
                                    onChange={handleChange}
                                    style={getInputStyle('closingDate')}
                                />
                                {renderError('closingDate')}
                            </div>
                        </div>
                        
                        <div style={{ marginTop: 20 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Additional transaction details..."
                                style={{ 
                                    ...getInputStyle('notes'),
                                    minHeight: '80px'
                                }}
                            />
                            {renderError('notes')}
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
