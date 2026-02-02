import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Search,
    FileText,
    Clock,
    Building2,
    TrendingUp,
    DollarSign,
    PieChart,
    Calendar,
    ChevronLeft,
    Loader2,
    X,
    CheckCircle2
} from 'lucide-react';
import InvestorNav from '../../components/investor/InvestorNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';
import investorsData from '../../data/investors.json';
import api from '../../services/api';

// Investor Fund Detail Screen - Read Only version of FundAdmin

export default function InvestorFundDetail() {
    const { id } = useParams();
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const isMobileOrTablet = isMobile || isTablet;

    const [fundDetails, setFundDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('Overview');
    
    // Investment Modal State
    const [investmentModalOpen, setInvestmentModalOpen] = useState(false);
    const [investmentStep, setInvestmentStep] = useState(1);
    const [investmentAmount, setInvestmentAmount] = useState('');
    const [isInvesting, setIsInvesting] = useState(false);
    const [investmentError, setInvestmentError] = useState('');

    const handleInvest = async () => {
        if (!investmentAmount || isNaN(parseFloat(investmentAmount))) {
            setInvestmentError('Please enter a valid amount');
            return;
        }

        setIsInvesting(true);
        setInvestmentError('');
        
        try {
            const response = await api.post('/investor/funds/invest', {
                fund_id: fundDetails.id,
                amount: parseFloat(investmentAmount)
            });
            
            if (response.data && response.data.success) {
                setInvestmentStep(2); // Success step
            } else {
                setInvestmentError(response.data.message || 'Investment failed');
            }
        } catch (error: any) {
            console.error('Investment error:', error);
            setInvestmentError(error.response?.data?.message || 'Investment failed. Please try again.');
        } finally {
            setIsInvesting(false);
        }
    };

    useEffect(() => {
        const fetchFundDetails = async () => {
            if (!id) {
                // Fallback to mock if no ID
                setFundDetails(adminData.fundAdmin.selectedFund);
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/investor/funds/${id}`);
                if (response.data && response.data.success) {
                    const apiFund = response.data.data;
                    
                    // Map API response to the structure expected by the UI
                    // We preserve the mock structure but populate with real data where available
                    setFundDetails({
                        id: apiFund.id,
                        name: apiFund.name,
                        status: apiFund.status.charAt(0).toUpperCase() + apiFund.status.slice(1),
                        description: apiFund.description,
                        imageUrl: apiFund.image_url,
                        investmentMetrics: {
                            strategy: apiFund.strategy || 'General Strategy',
                            minInvestment: `$${Number(apiFund.min_investment).toLocaleString()}`,
                            lockUp: apiFund.lock_up_period || 'N/A',
                            hardCap: apiFund.cap ? `$${Number(apiFund.cap).toLocaleString()}` : 'Uncapped',
                            managementFee: apiFund.management_fee ? `${apiFund.management_fee}%` : 'N/A',
                        },
                        fundPerformance: {
                            targetIRR: apiFund.target_irr || 'N/A',
                            currentIRR: apiFund.performance_metric ? `${apiFund.performance_metric}%` : 'N/A',
                            distributionsYTD: '$0', // This would come from distributions table
                            aum: `$${Number(apiFund.total_assets).toLocaleString()}`
                        },
                        documents: {
                            prospectus: apiFund.prospectus_url,
                            termSheet: apiFund.term_sheet_url
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching fund details:', error);
                // On error, fallback to mock data to prevent blank screen during demo/dev
                setFundDetails(adminData.fundAdmin.selectedFund);
            } finally {
                setLoading(false);
            }
        };

        fetchFundDetails();
    }, [id]);

    // Tabs for the investor view might be slightly different than admin
    const tabs = ['Overview', 'Performance', 'Portfolio', 'Documents'];

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#F8FAFC'
            }}>
                <Loader2 className="animate-spin" size={48} color="#1E3A5F" />
            </div>
        );
    }

    if (!fundDetails) {
        return <div>Fund not found</div>;
    }

    return (
        <div style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            backgroundColor: '#F8FAFC',
            minHeight: '100vh',
            width: '100%',
            margin: 0,
            padding: 0,
            overflowX: 'hidden'
        }}>
            <InvestorNav />

            <div
                style={{
                    padding: isMobile ? '16px 16px 24px' : isTablet ? '20px 24px 32px' : '24px 40px',
                    maxWidth: 1600,
                    margin: '0 auto',
                    boxSizing: 'border-box'
                }}
            >
                {/* Back Button (optional, but good for UX) */}
                {/* <div style={{ marginBottom: 16 }}>
            <Link to="/investor/funds" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#64748B', fontSize: 13, fontWeight: 500 }}>
                <ChevronLeft size={16} /> Back to Funds Marketplace
            </Link>
        </div> */}

                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                                    {fundDetails.name}
                                </h1>
                                <span style={{
                                    backgroundColor: '#1E3A5F',
                                    color: '#fff',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    padding: '4px 12px',
                                    borderRadius: 16
                                }}>
                                    {fundDetails.investmentMetrics.strategy}
                                </span>
                            </div>
                            <div style={{ fontSize: 14, color: '#64748B' }}>
                                Fund ID: {id || fundDetails.id} • {fundDetails.status === 'Open' ? 'Open for Investment' : fundDetails.status}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            {fundDetails.status !== 'Coming Soon' && (
                            <button 
                                onClick={() => setInvestmentModalOpen(true)}
                                style={{
                                backgroundColor: '#1E3A5F',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: 'pointer'
                            }}>
                                Invest Now
                            </button>
                            )}
                            {fundDetails.status === 'Coming Soon' && (
                                <button 
                                    disabled
                                    style={{
                                    backgroundColor: '#94a3b8',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    cursor: 'not-allowed'
                                }}>
                                    Coming Soon
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: 24,
                    borderBottom: '1px solid #E2E8F0',
                    marginBottom: 32,
                    overflowX: 'auto'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0 0 12px 0',
                                fontSize: 14,
                                fontWeight: activeTab === tab ? 600 : 500,
                                color: activeTab === tab ? '#1E3A5F' : '#64748B',
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab ? '2px solid #1E3A5F' : '2px solid transparent',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Main Content Grid */}
                {activeTab === 'Overview' && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobileOrTablet ? '1fr' : '2fr 1fr',
                        gap: 24
                    }}>
                        {/* Left Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                            {/* Fund Image */}
                            {fundDetails.imageUrl && (
                                <div style={{ 
                                    width: '100%', 
                                    height: '300px', 
                                    borderRadius: 12, 
                                    overflow: 'hidden', 
                                    border: '1px solid #E2E8F0',
                                    backgroundColor: '#f1f5f9'
                                }}>
                                    <img 
                                        src={fundDetails.imageUrl} 
                                        alt={fundDetails.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                </div>
                            )}

                            {/* Performance Summary */}
                            <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>Performance Summary</h3>
                                    <span style={{ fontSize: 12, color: '#64748B' }}>Last updated: {new Date().toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 24 }}>
                                    <div>
                                        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Target IRR</div>
                                        <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A' }}>{fundDetails.fundPerformance.targetIRR}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Current IRR</div>
                                        <div style={{ fontSize: 28, fontWeight: 700, color: '#10B981' }}>{fundDetails.fundPerformance.currentIRR}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Distributions (YTD)</div>
                                        <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A' }}>{fundDetails.fundPerformance.distributionsYTD}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Fund Strategy/Description */}
                            <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: 24 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginTop: 0, marginBottom: 16 }}>Fund Strategy</h3>
                                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#334155', margin: 0, whiteSpace: 'pre-line' }}>
                                    {fundDetails.description || "No description available."}
                                </p>
                            </div>

                        </div>

                        {/* Right Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                            {/* Investment Terms */}
                            <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: 24 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginTop: 0, marginBottom: 20 }}>Investment Terms</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 12 }}>
                                        <span style={{ color: '#64748B', fontSize: 14 }}>Minimum Investment</span>
                                        <span style={{ color: '#0F172A', fontWeight: 600, fontSize: 14 }}>{fundDetails.investmentMetrics.minInvestment}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 12 }}>
                                        <span style={{ color: '#64748B', fontSize: 14 }}>Lock-Up Period</span>
                                        <span style={{ color: '#0F172A', fontWeight: 600, fontSize: 14 }}>{fundDetails.investmentMetrics.lockUp}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 12 }}>
                                        <span style={{ color: '#64748B', fontSize: 14 }}>Management Fee</span>
                                        <span style={{ color: '#0F172A', fontWeight: 600, fontSize: 14 }}>{fundDetails.investmentMetrics.managementFee}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 0 }}>
                                        <span style={{ color: '#64748B', fontSize: 14 }}>Fund Size</span>
                                        <span style={{ color: '#0F172A', fontWeight: 600, fontSize: 14 }}>{fundDetails.investmentMetrics.hardCap}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Documents Preview */}
                            <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Key Documents</h3>
                                    <button 
                                        onClick={() => setActiveTab('Documents')}
                                        style={{ color: '#1E3A5F', fontSize: 13, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}
                                    >
                                        View All
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[
                                        { name: 'Prospectus', url: fundDetails.documents?.prospectus },
                                        { name: 'Term Sheet', url: fundDetails.documents?.termSheet }
                                    ].filter(doc => doc.url).length > 0 ? (
                                        [
                                            { name: 'Prospectus', url: fundDetails.documents?.prospectus },
                                            { name: 'Term Sheet', url: fundDetails.documents?.termSheet }
                                        ].filter(doc => doc.url).map((doc, idx) => (
                                            <a 
                                                key={idx} 
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '12px', border: '1px solid #F1F5F9', borderRadius: 8, color: 'inherit' }}
                                            >
                                                <FileText size={16} color="#64748B" />
                                                <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 500 }}>{doc.name}</span>
                                            </a>
                                        ))
                                    ) : (
                                        <div style={{ padding: '12px', textAlign: 'center', color: '#64748B', fontSize: 13 }}>
                                            No documents available
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {activeTab === 'Performance' && (
                    <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: 32, textAlign: 'center' }}>
                         <div style={{ marginBottom: 16 }}>
                            <TrendingUp size={48} color="#94A3B8" style={{ opacity: 0.5 }} />
                         </div>
                         <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>Performance Data</h3>
                         <p style={{ color: '#64748B' }}>Detailed historical performance charts and monthly reports will appear here.</p>
                    </div>
                )}

                {activeTab === 'Portfolio' && (
                    <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: 32, textAlign: 'center' }}>
                         <div style={{ marginBottom: 16 }}>
                            <Building2 size={48} color="#94A3B8" style={{ opacity: 0.5 }} />
                         </div>
                         <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>Portfolio Holdings</h3>
                         <p style={{ color: '#64748B' }}>A list of properties and assets currently held by the fund.</p>
                    </div>
                )}

                {activeTab === 'Documents' && (
                    <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: 24 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 24px 0' }}>Fund Documents</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                            {/* Render Actual Documents */}
                            {fundDetails.documents?.prospectus && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #E2E8F0', borderRadius: 8, backgroundColor: '#fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ backgroundColor: '#F1F5F9', padding: 10, borderRadius: 8 }}>
                                            <FileText size={20} color="#1E3A5F" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>Prospectus</div>
                                            <div style={{ fontSize: 12, color: '#64748B' }}>PDF Document</div>
                                        </div>
                                    </div>
                                    <a 
                                        href={fundDetails.documents.prospectus} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ color: '#1E3A5F', border: '1px solid #E2E8F0', backgroundColor: '#fff', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}
                                    >
                                        Download
                                    </a>
                                </div>
                            )}

                            {fundDetails.documents?.termSheet && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #E2E8F0', borderRadius: 8, backgroundColor: '#fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ backgroundColor: '#F1F5F9', padding: 10, borderRadius: 8 }}>
                                            <FileText size={20} color="#1E3A5F" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>Term Sheet</div>
                                            <div style={{ fontSize: 12, color: '#64748B' }}>PDF Document</div>
                                        </div>
                                    </div>
                                    <a 
                                        href={fundDetails.documents.termSheet} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ color: '#1E3A5F', border: '1px solid #E2E8F0', backgroundColor: '#fff', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}
                                    >
                                        Download
                                    </a>
                                </div>
                            )}

                            {/* Render Mock Documents if no actual documents (or as example) - Optional: Remove if not needed */}
                            {/* Only show mock if no real documents to avoid empty state, or keep them as "Sample Documents" */}
                            {!fundDetails.documents?.prospectus && !fundDetails.documents?.termSheet && ['Offering Memorandum', 'Subscription Agreement', 'W-9 Form'].map((doc, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #E2E8F0', borderRadius: 8, backgroundColor: '#fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ backgroundColor: '#F1F5F9', padding: 10, borderRadius: 8 }}>
                                            <FileText size={20} color="#1E3A5F" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>{doc} (Sample)</div>
                                            <div style={{ fontSize: 12, color: '#64748B' }}>PDF • Sample</div>
                                        </div>
                                    </div>
                                    <button style={{ color: '#94A3B8', border: '1px solid #E2E8F0', backgroundColor: '#fff', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'not-allowed' }} disabled>
                                        Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Investment Modal */}
            {investmentModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    padding: 20
                }} onClick={() => setInvestmentModalOpen(false)}>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 12,
                            width: '100%',
                            maxWidth: 500,
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid #E2E8F0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
                                {investmentStep === 1 ? 'Invest in Fund' : 'Investment Submitted'}
                            </h3>
                            <button
                                onClick={() => setInvestmentModalOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                            >
                                <X size={20} color="#64748B" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: 24 }}>
                            {investmentStep === 1 ? (
                                <>
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 14, color: '#64748B', marginBottom: 4 }}>Fund Name</div>
                                        <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>{fundDetails?.name}</div>
                                    </div>

                                    <div style={{ marginBottom: 24 }}>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 8 }}>
                                            Investment Amount ($)
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>$</div>
                                            <input
                                                type="number"
                                                value={investmentAmount}
                                                onChange={(e) => setInvestmentAmount(e.target.value)}
                                                placeholder="50,000"
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px 10px 28px',
                                                    borderRadius: 8,
                                                    border: '1px solid #CBD5E1',
                                                    fontSize: 15,
                                                    outline: 'none',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                        {investmentError && (
                                            <div style={{ marginTop: 8, fontSize: 13, color: '#EF4444' }}>
                                                {investmentError}
                                            </div>
                                        )}
                                        <div style={{ marginTop: 8, fontSize: 13, color: '#64748B' }}>
                                            Minimum investment: {fundDetails?.investmentMetrics?.minInvestment}
                                        </div>
                                    </div>

                                    <div style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 24 }}>
                                        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Summary</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <span style={{ fontSize: 13, color: '#64748B' }}>Processing Fee (0%)</span>
                                            <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 500 }}>$0.00</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: 8, marginTop: 8 }}>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Total</span>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                                                ${investmentAmount ? Number(investmentAmount).toLocaleString() : '0'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleInvest}
                                        disabled={isInvesting || !investmentAmount}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#1E3A5F',
                                            color: '#FFFFFF',
                                            border: 'none',
                                            padding: '12px',
                                            borderRadius: 8,
                                            fontWeight: 600,
                                            fontSize: 15,
                                            cursor: isInvesting || !investmentAmount ? 'not-allowed' : 'pointer',
                                            opacity: isInvesting || !investmentAmount ? 0.7 : 1,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: 8
                                        }}
                                    >
                                        {isInvesting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} />
                                                Processing...
                                            </>
                                        ) : (
                                            'Confirm Investment'
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', backgroundColor: '#ECFDF5', marginBottom: 16 }}>
                                        <CheckCircle2 size={48} color="#10B981" />
                                    </div>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Investment Submitted!</h4>
                                    <p style={{ margin: '0 0 24px 0', fontSize: 15, color: '#64748B', lineHeight: 1.5 }}>
                                        Your request to invest <strong>${Number(investmentAmount).toLocaleString()}</strong> in <strong>{fundDetails?.name}</strong> has been received. Our team will review the details and contact you shortly with next steps.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setInvestmentModalOpen(false);
                                            setInvestmentStep(1);
                                            setInvestmentAmount('');
                                        }}
                                        style={{
                                            backgroundColor: '#1E3A5F',
                                            color: '#FFFFFF',
                                            border: 'none',
                                            padding: '12px 32px',
                                            borderRadius: 8,
                                            fontWeight: 600,
                                            fontSize: 15,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
