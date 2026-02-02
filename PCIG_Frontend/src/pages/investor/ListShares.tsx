import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Info, DollarSign } from 'lucide-react';
import InvestorNav from '../../components/investor/InvestorNav';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ListShares() {
    const isMobile = useIsMobile();
    const navigate = useNavigate();

    const [property, setProperty] = useState('');
    const [shares, setShares] = useState('');
    const [price, setPrice] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [ownedProperties, setOwnedProperties] = useState<any[]>([]);
    const [isLoadingProperties, setIsLoadingProperties] = useState(false);

    useEffect(() => {
        const fetchOwnedProperties = async () => {
            setIsLoadingProperties(true);
            try {
                const response = await api.get('/investor/shares/portfolio');
                if (response.data.success) {
                    // Filter properties where user has shares > 0
                    const validProperties = response.data.data.filter((item: any) => parseFloat(item.shares) > 0);
                    setOwnedProperties(validProperties);
                }
            } catch (error) {
                console.error('Failed to fetch properties', error);
            } finally {
                setIsLoadingProperties(false);
            }
        };
        fetchOwnedProperties();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await api.post('/investor/shares/list', {
                property_id: property,
                shares: parseInt(shares),
                price_per_share: parseFloat(price)
            });

            if (response.data.success) {
                setSubmitted(true);
                setTimeout(() => {
                    navigate('/investor/share-marketplace');
                }, 2000);
            }
        } catch (err: any) {
            console.error('Failed to list shares:', err);
            setError(err.response?.data?.message || 'Failed to list shares. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100%' }}>
                <InvestorNav />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                    <CheckCircle size={48} color="#10B981" style={{ marginBottom: 16 }} />
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Listing Created!</h2>
                    <p style={{ color: '#64748B' }}>Your shares are now listed on the marketplace.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100%' }}>
            <InvestorNav />
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
                <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'none', cursor: 'pointer', color: '#64748B', marginBottom: 24 }}>
                    <ArrowLeft size={16} /> Back to Marketplace
                </button>
                
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>List Shares for Sale</h1>
                <p style={{ color: '#64748B', marginBottom: 32 }}>Sell your property shares to other investors.</p>

                <div style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                    {error && (
                        <div style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', padding: '12px', borderRadius: '6px', marginBottom: '24px', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#475569' }}>Property</label>
                            <select 
                                value={property} 
                                onChange={(e) => setProperty(e.target.value)}
                                required
                                disabled={isLoadingProperties}
                                style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 15 }}
                            >
                                <option value="">Select a property...</option>
                                {ownedProperties.map((item) => (
                                    <option key={item.id} value={item.property?.id}>
                                        {item.property?.address} ({item.shares} shares available)
                                    </option>
                                ))}
                            </select>
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
                                    style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 15 }}
                                />
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
                                        style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 15 }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#F1F5F9', padding: 16, borderRadius: 8, display: 'flex', gap: 12 }}>
                            <Info size={20} color="#64748B" />
                            <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                                Listing fee is 1% of the total sale price. This will be deducted upon successful sale.
                            </p>
                        </div>

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            style={{ 
                                backgroundColor: isSubmitting ? '#94A3B8' : '#1E3A5F', 
                                color: '#fff', 
                                padding: 14, 
                                borderRadius: 6, 
                                border: 'none', 
                                fontWeight: 600, 
                                fontSize: 16, 
                                cursor: isSubmitting ? 'not-allowed' : 'pointer' 
                            }}
                        >
                            {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
