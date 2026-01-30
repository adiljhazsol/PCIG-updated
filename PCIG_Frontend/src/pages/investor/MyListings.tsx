import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import InvestorNav from '../../components/investor/InvestorNav';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import investorsData from '../../data/investors.json';

export default function MyListings() {
    const isMobile = useIsMobile();
    const navigate = useNavigate();

    // Mock data - in real app would filter by user ID
    const myListings = investorsData.shareMarketplace.items.slice(0, 2); 

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100%' }}>
            <InvestorNav />
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
                <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'none', cursor: 'pointer', color: '#64748B', marginBottom: 24 }}>
                    <ArrowLeft size={16} /> Back to Marketplace
                </button>
                
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>My Listings</h1>
                <p style={{ color: '#64748B', marginBottom: 32 }}>Manage your active share listings.</p>

                <div style={{ display: 'grid', gap: 16 }}>
                    {myListings.map((item, idx) => (
                        <div key={idx} style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 16 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>{item.propertyAddress}</h3>
                                    <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 12, backgroundColor: '#DCFCE7', color: '#10B981' }}>Active</span>
                                </div>
                                <p style={{ color: '#64748B', margin: 0 }}>{item.location}</p>
                                <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#64748B' }}>Shares</div>
                                        <div style={{ fontWeight: 600 }}>{item.sharesAvailable}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#64748B' }}>Price</div>
                                        <div style={{ fontWeight: 600 }}>{item.pricePerShare}/share</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#64748B' }}>Total</div>
                                        <div style={{ fontWeight: 600 }}>{item.totalPrice}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto' }}>
                                <button style={{ flex: 1, padding: '10px 16px', border: '1px solid #E2E8F0', borderRadius: 6, backgroundColor: '#fff', color: '#0F172A', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <Edit2 size={16} /> Edit
                                </button>
                                <button style={{ flex: 1, padding: '10px 16px', border: '1px solid #FEE2E2', borderRadius: 6, backgroundColor: '#FEF2F2', color: '#EF4444', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <Trash2 size={16} /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
