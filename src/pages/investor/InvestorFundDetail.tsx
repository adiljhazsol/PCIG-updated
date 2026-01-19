import React, { useState } from 'react';
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
    ChevronLeft
} from 'lucide-react';
import InvestorNav from '../../components/investor/InvestorNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';
import investorsData from '../../data/investors.json';

// Investor Fund Detail Screen - Read Only version of FundAdmin

export default function InvestorFundDetail() {
    const { id } = useParams();
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const isMobileOrTablet = isMobile || isTablet;

    // Use the admin data for the rich detail view, defaulting to the first one if not found
    // In a real app, this would fetch specific investor-view data
    const fundDetails = adminData.fundAdmin.selectedFund; // Fallback mock data
    const [activeTab, setActiveTab] = useState<string>('Overview');

    // Tabs for the investor view might be slightly different than admin
    const tabs = ['Overview', 'Performance', 'Portfolio', 'Documents'];

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
                            <button style={{
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
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobileOrTablet ? '1fr' : '2fr 1fr',
                    gap: 24
                }}>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* Performance Summary */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>Performance Summary</h3>
                                <span style={{ fontSize: 12, color: '#64748B' }}>Last updated: Oct 24, 2024</span>
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
                            <p style={{ fontSize: 15, lineHeight: 1.6, color: '#334155', margin: 0 }}>
                                This fund focuses on high-yield tax deed redemptions in primary markets across Florida and Texas.
                                The strategy targets shorter hold periods (12-18 months) with a focus on liquidity and capital preservation.
                                <br /><br />
                                Key Objectives:
                            </p>
                            <ul style={{ fontSize: 15, lineHeight: 1.6, color: '#334155', paddingLeft: 20, margin: '16px 0 0 0' }}>
                                <li>Acquire tax liens with high statutory interest rates.</li>
                                <li>Manage the redemption process to maximize returns.</li>
                                <li>Liquidate REO properties efficiently if redemption does not occur.</li>
                            </ul>
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
                                    <span style={{ color: '#0F172A', fontWeight: 600, fontSize: 14 }}>2.0%</span>
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
                                <button style={{ color: '#1E3A5F', fontSize: 13, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}>View All</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {['Offering Memorandum', 'Subscription Agreement', 'W-9 Form'].map((doc, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', border: '1px solid #F1F5F9', borderRadius: 8 }}>
                                        <FileText size={16} color="#64748B" />
                                        <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 500 }}>{doc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
