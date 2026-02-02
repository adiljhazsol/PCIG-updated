import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Info, DollarSign } from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CreateShareListingAdmin() {
    const isMobile = useIsMobile();
    const navigate = useNavigate();

    const [property, setProperty] = useState('');
    const [shares, setShares] = useState('');
    const [price, setPrice] = useState('');
    const [notes, setNotes] = useState('');
    const [sellerId, setSellerId] = useState<string | null>(null);
    const [investors, setInvestors] = useState<any[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [properties, setProperties] = useState<any[]>([]);

    // Load investors for dropdown
    useEffect(() => {
        const fetchInvestors = async () => {
            try {
                const response = await api.get('/admin/shares/search-users');
                if (response.data && response.data.success) {
                    setInvestors(response.data.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch investors', err);
            }
        };
        fetchInvestors();
    }, []);

    useEffect(() => {
        // Fetch properties for dropdown
        const fetchProperties = async () => {
            try {
                const response = await api.get('/admin/properties/dropdown');
                if (response.data) {
                    const props = Array.isArray(response.data) ? response.data : (response.data.data || []);
                    setProperties(props);
                }
            } catch (err) {
                console.error('Failed to fetch properties', err);
            }
        };
        fetchProperties();
    }, []);

    const handleSellerSelect = (id: string) => {
        setSellerId(id);
        setErrors(prev => ({ ...prev, seller: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Client-side validation
        const newErrors: Record<string, string> = {};
        if (!sellerId) newErrors.seller = 'Please select an investor.';
        if (!property) newErrors.property = 'Please select a property.';
        if (!shares || parseInt(shares) < 1) newErrors.shares = 'Number of shares must be at least 1.';
        if (!price || parseFloat(price) < 0) newErrors.price = 'Price must be a positive number.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }
        
        try {
            await api.post('/admin/shares/create', { 
                property_id: property, 
                shares: parseInt(shares), 
                price_per_share: parseFloat(price), 
                seller_id: sellerId,
                status: 'active',
                notes: notes
            });
            setSubmitted(true);
            setTimeout(() => {
                navigate('/admin/operations/shares');
            }, 2000);
        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.errors) {
                // Map backend errors to frontend fields
                const backendErrors = err.response.data.errors;
                const mappedErrors: Record<string, string> = {};
                if (backendErrors.seller_id) mappedErrors.seller = backendErrors.seller_id[0];
                if (backendErrors.property_id) mappedErrors.property = backendErrors.property_id[0];
                if (backendErrors.shares) mappedErrors.shares = backendErrors.shares[0];
                if (backendErrors.price_per_share) mappedErrors.price = backendErrors.price_per_share[0];
                setErrors(mappedErrors);
            } else {
                alert(err.response?.data?.message || 'Failed to create listing. Please check all fields.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100%' }}>
                <AdminNav />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                    <CheckCircle size={48} color="#10B981" style={{ marginBottom: 16 }} />
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Listing Created!</h2>
                    <p style={{ color: '#64748B' }}>The share listing has been successfully created.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100%' }}>
            <AdminNav />
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
                <button onClick={() => navigate('/admin/operations/shares')} style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'none', cursor: 'pointer', color: '#64748B', marginBottom: 24 }}>
                    <ArrowLeft size={16} /> Back to Share Admin
                </button>
                
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>List Share (Admin)</h1>
                <p style={{ color: '#64748B', marginBottom: 32 }}>Create a new share listing on behalf of an investor or the fund.</p>

                <div style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        
                        {/* Seller Selection */}
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#475569' }}>Seller (Investor)</label>
                            <select 
                                value={sellerId ?? ''} 
                                onChange={(e) => handleSellerSelect(e.target.value)}
                                required
                                style={{ 
                                    width: '100%', 
                                    padding: 12, 
                                    borderRadius: 6, 
                                    border: errors.seller ? '1px solid #EF4444' : '1px solid #CBD5E1', 
                                    fontSize: 15 
                                }}
                            >
                                <option value="">Select an investor...</option>
                                {investors.map((u: any) => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                            {errors.seller && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 4 }}>{errors.seller}</p>}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#475569' }}>Property</label>
                            <select 
                                value={property} 
                                onChange={(e) => setProperty(e.target.value)}
                                required
                                style={{ 
                                    width: '100%', 
                                    padding: 12, 
                                    borderRadius: 6, 
                                    border: errors.property ? '1px solid #EF4444' : '1px solid #CBD5E1', 
                                    fontSize: 15 
                                }}
                            >
                                <option value="">Select a property...</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>{p.address}, {p.city || ''} {p.state || ''}</option>
                                ))}
                            </select>
                            {errors.property && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 4 }}>{errors.property}</p>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#475569' }}>Number of Shares</label>
                                <input 
                                    type="number" 
                                    value={shares}
                                    onChange={(e) => setShares(e.target.value)}
                                    placeholder="0"
                                    required
                                    style={{ 
                                        width: '100%', 
                                        padding: 12, 
                                        borderRadius: 6, 
                                        border: errors.shares ? '1px solid #EF4444' : '1px solid #CBD5E1', 
                                        fontSize: 15 
                                    }}
                                />
                                {errors.shares && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 4 }}>{errors.shares}</p>}
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#475569' }}>Price Per Share</label>
                                <div style={{ position: 'relative' }}>
                                    <DollarSign size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 14 }} />
                                    <input 
                                        type="number" 
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        required
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px 12px 12px 36px', 
                                            borderRadius: 6, 
                                            border: errors.price ? '1px solid #EF4444' : '1px solid #CBD5E1', 
                                            fontSize: 15 
                                        }}
                                    />
                                </div>
                                {errors.price && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 4 }}>{errors.price}</p>}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#475569' }}>Admin Notes (Optional)</label>
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Internal notes about this listing..."
                                rows={3}
                                style={{ 
                                    width: '100%', 
                                    padding: 12, 
                                    borderRadius: 6, 
                                    border: '1px solid #CBD5E1', 
                                    fontSize: 15,
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div style={{ backgroundColor: '#F1F5F9', padding: 16, borderRadius: 8, display: 'flex', gap: 12 }}>
                            <Info size={20} color="#64748B" />
                            <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                                Admin Listing Note: Ensure you have authorization to list shares on behalf of the selected investor.
                            </p>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            style={{ 
                                backgroundColor: '#0F172A', 
                                color: 'white', 
                                padding: 14, 
                                borderRadius: 8, 
                                border: 'none', 
                                fontSize: 16, 
                                fontWeight: 600, 
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                marginTop: 8
                            }}
                        >
                            {loading ? 'Creating Listing...' : 'Create Listing'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
