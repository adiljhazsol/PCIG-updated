import React, { CSSProperties, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Plus,
  Edit,
  FileDown,
  Share2,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  FileText,
  Plus,
  Edit,
  FileDown,
  Share2
};

export default function FundAdmin() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const navigate = useNavigate();
  const isMobileOrTablet = isMobile || isTablet;

  // Define interfaces for type safety
  interface Fund {
    id: string;
    db_id?: number;
    name: string;
    strategy: string;
    strategyColor: string;
    status: string;
    statusColor: string;
    targetIRR: string;
    lockUp: string;
    aum: string;
    cap: string;
    aumPercent: number;
    capacity: string;
    activeTab?: string;
    investors?: string;
    performance?: string;
    performanceColor?: string;
  }

  interface Filter {
    label: string;
    selected: string;
    options: string[];
  }

  interface SummaryCard {
    label: string;
    value: string;
    subtext: string;
  }

  const [fundData, setFundData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFundId, setSelectedFundId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [strategyFilter, setStrategyFilter] = useState('All');

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    performance_metric: ''
  });

  const handleEditClick = () => {
    // Map display status to backend status
    let statusValue = 'coming_soon';
    if (fundDetails.status === 'Active' || fundDetails.status === 'Open') statusValue = 'open';
    else if (fundDetails.status === 'Closed') statusValue = 'closed';
    else if (fundDetails.status === 'Coming_soon' || fundDetails.status === 'Coming Soon') statusValue = 'coming_soon';
    
    // Parse performance metric (remove % and +)
    let perfValue = '';
    if (fundDetails.fundPerformance && fundDetails.fundPerformance.currentIRR) {
        const raw = fundDetails.fundPerformance.currentIRR.replace('%', '').replace('+', '').replace('N/A', '');
        perfValue = raw.trim();
    }

    setEditForm({
      status: statusValue,
      performance_metric: perfValue
    });
    setEditModalOpen(true);
  };

  const handleSaveFund = async () => {
    try {
      setLoading(true);
      const idToUpdate = fundDetails.db_id || selectedFundId;
      await api.put(`/admin/funds/${idToUpdate}`, {
        status: editForm.status,
        performance_metric: editForm.performance_metric
      });
      
      await fetchData();
      setEditModalOpen(false);
    } catch (err) {
      console.error('Error updating fund:', err);
      alert('Failed to update fund. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/funds/dashboard-data');
      const data = response.data.data;
      setFundData(data);
      
      if (data.selectedFund) {
          setSelectedFundId(data.selectedFund.id);
          setActiveTab(data.selectedFund.activeTab || 'overview');
      } else if (data.funds && data.funds.length > 0) {
          setSelectedFundId(data.funds[0].id);
          setActiveTab('overview');
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching fund data:', err);
      setError('Failed to load fund data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const header = fundData?.header || { title: '', subtitle: '' };
  const actionButtons = fundData?.actionButtons || {
    createFund: { label: 'Create Fund', icon: 'Plus' },
    export: { label: 'Export', icon: 'FileDown' },
    share: { label: 'Share', icon: 'Share2' }
  };
  const summaryCards = fundData?.summaryCards || [];
  const searchPlaceholder = fundData?.searchPlaceholder || '';
  const filters = fundData?.filters || [];
  const tableHeaders = fundData?.tableHeaders || [];
  const funds = fundData?.funds || [];

  const handleGenerateReports = async () => {
    try {
      const response = await api.post('/admin/funds/reports');
      alert(response.data.message);
    } catch (error) {
      console.error('Error generating reports:', error);
      alert('Failed to generate reports');
    }
  };

  const handleRecordContribution = async () => {
    if (!selectedFundId) return;
    const amount = prompt('Enter contribution amount:');
    if (!amount) return;
    
    // Default date to today
    const date = new Date().toISOString().split('T')[0];
    
    try {
      const response = await api.post(`/admin/funds/${selectedFundId}/contributions`, {
        amount: parseFloat(amount),
        date: date
      });
      alert(response.data.message);
      fetchData();
    } catch (error) {
      console.error('Error recording contribution:', error);
      alert('Failed to record contribution');
    }
  };

  const handleDistributeProfits = async () => {
    if (!selectedFundId) return;
    const amount = prompt('Enter distribution amount:');
    if (!amount) return;
    
    const type = prompt('Enter distribution type (dividend, interest, etc.):', 'dividend');
    if (!type) return;

    const date = new Date().toISOString().split('T')[0];

    try {
      const response = await api.post(`/admin/funds/${selectedFundId}/distributions`, {
        amount: parseFloat(amount),
        type,
        date
      });
      alert(response.data.message);
      fetchData();
    } catch (error) {
      console.error('Error distributing profits:', error);
      alert('Failed to distribute profits');
    }
  };

  const handleDownloadK1 = async () => {
    if (!selectedFundId) return;
    try {
      const response = await api.get(`/admin/funds/${selectedFundId}/k1-package`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `k1-package-${selectedFundId}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading K-1 package:', error);
      alert('Failed to download K-1 package');
    }
  };

  // Find the selected fund from the funds list
  const fundDetails = React.useMemo(() => {
    const found = funds.find((f: any) => f.id === selectedFundId) || funds[0];
    if (found) return found;
    
    // Default safe object if no funds exist to prevent crashes
    return {
      name: '',
      id: '',
      status: '',
      statusColor: '#64748B',
      tabs: [],
      fundPerformance: {
        status: '',
        statusColor: '',
        statusBg: '',
        currentIRR: '',
        currentIRRColor: '',
        aum: '',
        targetIRR: '',
        distributionsYTD: ''
      },
      investmentMetrics: {
        hardCap: '',
        minInvestment: '',
        lockUp: '',
        strategy: ''
      },
      taxDocuments: {
        year: '',
        k1sGenerated: 0,
        k1sTotal: 0,
        status: '',
        statusColor: ''
      },
      accountingSnapshot: {
        totalAssets: '',
        cashOnHand: '',
        netIncomeYTD: '',
        netIncomeColor: ''
      },
      depreciationAllocation: {
        annualDepreciation: '',
        method: '',
        note: ''
      }
    };
  }, [funds, selectedFundId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading fund data...</p>
        </div>
      </div>
    );
  }

  if (error || !fundData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border border-slate-200">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Data</h3>
          <p className="text-slate-600 mb-6">{error || 'Something went wrong'}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pageWrapperStyle: CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
    overflowX: 'hidden'
  };

  return (
    <div style={pageWrapperStyle}>
      <AdminNav />

      <div
        style={{
          padding: isMobile ? '16px 16px 24px' : isTablet ? '20px 24px 32px' : '24px 40px',
          maxWidth: '100%',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Main 2-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet
              ? 'minmax(0, 1fr)'
              : 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: isMobile ? 16 : 24,
            alignItems: 'flex-start'
          }}
        >
          {/* Left Column - Fund List */}
          <div>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 24
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: `clamp(18px, 3vw, 24px)`,
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: 4,
                    margin: 0
                  }}
                >
                  {header.title}
                </h1>
                {!isMobile && (
                  <p
                    style={{
                      fontSize: `clamp(11px, 1.5vw, 13px)`,
                      color: '#64748B',
                      margin: 0,
                      marginTop: 4
                    }}
                  >
                    {header.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobileOrTablet ? 'column' : 'row',
                gap: 12,
                marginBottom: 24
              }}
            >
              <button
                onClick={handleGenerateReports}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: `clamp(8px, 1vh, 10px) clamp(12px, 2vw, 16px)`,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: isMobileOrTablet ? '100%' : 'auto'
                }}
              >
                {React.createElement(iconMap[actionButtons.reports.icon], { style: { width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` } })}
                {actionButtons.reports.label}
              </button>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: `clamp(8px, 1vh, 10px) clamp(12px, 2vw, 16px)`,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#1D4ED8',
                  color: '#FFFFFF',
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: isMobileOrTablet ? '100%' : 'auto'
                }}
                onClick={() => navigate('/admin/funds/create')}
              >
                {React.createElement(iconMap[actionButtons.createFund.icon], { style: { width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` } })}
                {actionButtons.createFund.label}
              </button>
            </div>

            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? 'repeat(1, minmax(0, 1fr))'
                  : isTablet
                    ? 'repeat(2, minmax(0, 1fr))'
                    : 'repeat(4, minmax(0, 1fr))',
                gap: isMobile ? 12 : 16,
                marginBottom: 24
              }}
            >
              {summaryCards.map((card: SummaryCard, idx: number) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div
                    style={{
                      fontSize: `clamp(10px, 1.3vw, 11px)`,
                      fontWeight: 500,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: 8
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      fontSize: `clamp(18px, 4.5vw, 20px)`,
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: 4
                    }}
                  >
                    {card.value}
                  </div>
                  <div
                    style={{
                      fontSize: `clamp(11px, 1.5vw, 12px)`,
                      color: '#64748B'
                    }}
                  >
                    {card.subtext}
                  </div>
                </div>
              ))}
            </div>

            {/* Search and Filters */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 12,
                marginBottom: 16,
                flexWrap: isMobile ? 'nowrap' : 'wrap'
              }}
            >
              <div
                style={{
                  position: 'relative',
                  flex: 1
                }}
              >
                <Search
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 16,
                    height: 16,
                    color: '#64748B'
                  }}
                />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px) clamp(8px, 1vh, 10px) ${isMobileOrTablet ? 'clamp(36px, 5vw, 40px)' : '36px'}`,
                    fontSize: `clamp(12px, 1.5vw, 13px)`,
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                />
              </div>
              {filters.map((filter: Filter, idx: number) => (
                <select
                  key={`${filter.label}-${idx}`}
                  style={{
                    padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px)`,
                    fontSize: `clamp(12px, 1.5vw, 13px)`,
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    cursor: 'pointer',
                    minWidth: isMobile ? '100%' : '120px',
                    width: isMobile ? '100%' : 'auto',
                    outline: 'none'
                  }}
                  defaultValue={filter.selected}
                  onChange={(e) => {
                    if (filter.label === 'Status') {
                      setStatusFilter(e.target.value);
                    } else if (filter.label === 'Strategy') {
                      setStrategyFilter(e.target.value);
                    }
                  }}
                >
                  <option value={filter.selected}>{filter.label}: {filter.selected}</option>
                  {filter.options.filter(opt => opt !== filter.selected).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ))}
            </div>

            {/* Fund Table */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                overflow: isMobileOrTablet ? 'auto' : 'hidden',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div style={{ minWidth: isMobileOrTablet ? '800px' : 'auto', overflowX: isMobileOrTablet ? 'auto' : 'visible' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: `clamp(11px, 1.5vw, 13px)`,
                    minWidth: isMobileOrTablet ? '800px' : 'auto'
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderBottom: '1px solid #E2E8F0'
                      }}
                    >
                      {tableHeaders.map((header: string) => (
                        <th
                          key={header}
                          style={{
                            padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`,
                            textAlign: 'left',
                            fontSize: `clamp(10px, 1.3vw, 11px)`,
                            fontWeight: 600,
                            color: '#64748B',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {funds.filter((fund: Fund) => {
                      const matchesSearch = fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        fund.id.toLowerCase().includes(searchTerm.toLowerCase());
                      // Basic mapping for "All Statuses" or specific status
                      const matchesStatus = statusFilter === 'All Statuses' || statusFilter === 'All' || fund.status === statusFilter;
                      
                      // Strategy filter
                      const matchesStrategy = strategyFilter === 'All Strategies' || strategyFilter === 'All' || fund.strategy === strategyFilter;

                      return matchesSearch && matchesStatus && matchesStrategy;
                    }).map((fund: Fund) => {
                      const isSelected = fund.id === selectedFundId;
                      return (
                        <tr
                          key={fund.id}
                          onClick={() => setSelectedFundId(fund.id)}
                          style={{
                            backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                            borderBottom: '1px solid #E2E8F0',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#F8FAFC';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#FFFFFF';
                            }
                          }}
                        >
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, fontWeight: 500, color: '#0F172A' }}>
                            <div>
                              <div style={{ fontSize: `clamp(11px, 1.5vw, 13px)`, wordBreak: 'break-word' }}>{fund.name}</div>
                              <div style={{ fontSize: `clamp(10px, 1.3vw, 11px)`, color: '#64748B', marginTop: 2 }}>
                                ID: {fund.id}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 500,
                                color: fund.strategyColor,
                                backgroundColor: fund.strategyColor === '#1D4ED8' ? '#EFF6FF' :
                                  fund.strategyColor === '#B45309' ? '#FFF7ED' :
                                    fund.strategyColor === '#6B21A8' ? '#F3E8FF' :
                                      '#ECFDF5',
                                padding: '4px 8px',
                                borderRadius: 4
                              }}
                            >
                              {fund.strategy}
                            </span>
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                            <span
                              style={{
                                fontSize: `clamp(11px, 1.5vw, 12px)`,
                                fontWeight: 500,
                                color: fund.statusColor,
                                backgroundColor: fund.statusColor === '#047857' ? '#ECFDF5' :
                                  fund.statusColor === '#757575' ? '#F1F5F9' :
                                    '#FFFBEB',
                                padding: '4px 8px',
                                borderRadius: 4
                              }}
                            >
                              {fund.status}
                            </span>
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: '#64748B' }}>
                            {fund.targetIRR}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: '#64748B' }}>
                            {fund.lockUp}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                            <div style={{ marginBottom: 4 }}>
                              <span style={{ color: '#0F172A', fontWeight: 500 }}>{fund.aum}</span>
                              <span style={{ color: '#64748B' }}> / {fund.cap}</span>
                            </div>
                            <div
                              style={{
                                width: '100%',
                                height: 4,
                                backgroundColor: '#E2E8F0',
                                borderRadius: 2,
                                overflow: 'hidden'
                              }}
                            >
                              <div
                                style={{
                                  width: `${fund.aumPercent}%`,
                                  height: '100%',
                                  backgroundColor: fund.aumPercent === 100 ? '#10B981' : '#1D4ED8',
                                  transition: 'width 0.3s'
                                }}
                              />
                            </div>
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: '#64748B' }}>
                            {fund.capacity}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: '#64748B' }}>
                            {fund.investors}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                            <span
                              style={{
                                fontSize: `clamp(11px, 1.5vw, 13px)`,
                                fontWeight: 500,
                                color: fund.performanceColor
                              }}
                            >
                              {fund.performance}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Fund Details */}
          <div style={{ order: isMobileOrTablet ? -1 : 0 }}>
            {/* Fund Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 20
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: `clamp(16px, 2.5vw, 18px)`,
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: 4,
                    wordBreak: 'break-word'
                  }}
                >
                  {fundDetails.name}
                </div>
                <div
                  style={{
                    fontSize: `clamp(11px, 1.5vw, 12px)`,
                    color: '#64748B',
                    marginBottom: 8
                  }}
                >
                  ID: {fundDetails.id}
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: fundDetails.statusColor,
                    backgroundColor: '#ECFDF5',
                    padding: '4px 8px',
                    borderRadius: 4
                  }}
                >
                  {fundDetails.status}
                </span>
              </div>
              <button
                onClick={handleEditClick}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: `clamp(6px, 1vh, 8px) clamp(10px, 1.5vw, 12px)`,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: `clamp(11px, 1.5vw, 12px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Edit style={{ width: `clamp(12px, 2vw, 14px)`, height: `clamp(12px, 2vw, 14px)` }} />
                Edit Fund
              </button>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                borderBottom: '1px solid #E2E8F0',
                marginBottom: 20,
                overflowX: isMobileOrTablet ? 'auto' : 'visible',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {fundDetails.tabs.map((tab: string) => {
                const isActive = tab === activeTab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: `clamp(8px, 1.2vh, 10px) clamp(10px, 1.5vw, 12px)`,
                      fontSize: `clamp(12px, 1.5vw, 13px)`,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#1E3A5F' : '#64748B',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: isActive ? '2px solid #1D4ED8' : '2px solid transparent',
                      cursor: 'pointer',
                      marginBottom: -1,
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Fund Performance Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: 16
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}
              >
                <div
                  style={{
                    fontSize: `clamp(13px, 2vw, 14px)`,
                    fontWeight: 600,
                    color: '#0F172A'
                  }}
                >
                  Fund Performance
                </div>
                <span
                  style={{
                    fontSize: `clamp(10px, 1.3vw, 11px)`,
                    fontWeight: 600,
                    color: fundDetails.fundPerformance.statusColor,
                    backgroundColor: fundDetails.fundPerformance.statusBg,
                    padding: `clamp(3px, 0.5vh, 4px) clamp(6px, 1vw, 8px)`,
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {fundDetails.fundPerformance.status}
                </span>
              </div>
              <div
                style={{
                  fontSize: `clamp(20px, 5vw, 24px)`,
                  fontWeight: 700,
                  color: fundDetails.fundPerformance.currentIRRColor,
                  marginBottom: 8
                }}
              >
                {fundDetails.fundPerformance.currentIRR}
              </div>
              <div
                style={{
                  fontSize: `clamp(11px, 1.5vw, 12px)`,
                  color: '#64748B',
                  marginBottom: 4
                }}
              >
                AUM: {fundDetails.fundPerformance.aum}
              </div>
              <div
                style={{
                  fontSize: `clamp(11px, 1.5vw, 12px)`,
                  color: '#64748B',
                  marginBottom: 4
                }}
              >
                Target IRR: {fundDetails.fundPerformance.targetIRR}
              </div>
              <div
                style={{
                  fontSize: `clamp(11px, 1.5vw, 12px)`,
                  color: '#64748B'
                }}
              >
                Distributions (YTD): {fundDetails.fundPerformance.distributionsYTD}
              </div>
            </div>

            {/* Investment Metrics Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: 16
              }}
            >
              <div
                style={{
                  fontSize: `clamp(13px, 2vw, 14px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: 12
                }}
              >
                Investment Metrics
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Hard Cap:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {fundDetails.investmentMetrics.hardCap}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Min Investment:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {fundDetails.investmentMetrics.minInvestment}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Lock-Up:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {fundDetails.investmentMetrics.lockUp}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Strategy:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {fundDetails.investmentMetrics.strategy}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                marginBottom: 16
              }}
            >
              <button
                onClick={handleRecordContribution}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 2vw, 16px)`,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#1D4ED8',
                  color: '#FFFFFF',
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                <FileText style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` }} />
                Record Contribution
              </button>
              <button
                onClick={handleDistributeProfits}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 2vw, 16px)`,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                <Share2 style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` }} />
                Distribute Profits
              </button>
            </div>

            {/* Tax Documents Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: 16
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}
              >
                <div
                  style={{
                    fontSize: `clamp(13px, 2vw, 14px)`,
                    fontWeight: 600,
                    color: '#0F172A'
                  }}
                >
                  Tax Documents ({fundDetails.taxDocuments.year})
                </div>
                <button
                  style={{
                    padding: `clamp(4px, 0.5vh, 6px) clamp(6px, 1vw, 8px)`,
                    fontSize: `clamp(10px, 1.3vw, 11px)`,
                    fontWeight: 500,
                    color: '#64748B',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  View All
                </button>
              </div>
              <div
                style={{
                  fontSize: `clamp(11px, 1.5vw, 12px)`,
                  color: '#64748B',
                  marginBottom: 8
                }}
              >
                K-1s Generated: {fundDetails.taxDocuments.k1sGenerated} / {fundDetails.taxDocuments.k1sTotal}
              </div>
              <div
                style={{
                  fontSize: `clamp(11px, 1.5vw, 12px)`,
                  fontWeight: 500,
                  color: fundDetails.taxDocuments.statusColor,
                  marginBottom: 12
                }}
              >
                Status: {fundDetails.taxDocuments.status}
              </div>
              <button
                onClick={handleDownloadK1}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px)`,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: `clamp(11px, 1.5vw, 12px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                <FileDown style={{ width: `clamp(12px, 2vw, 14px)`, height: `clamp(12px, 2vw, 14px)` }} />
                Download K-1 Package
              </button>
            </div>

            {/* Accounting Snapshot Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: 16
              }}
            >
              <div
                style={{
                  fontSize: `clamp(13px, 2vw, 14px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: 12
                }}
              >
                Accounting Snapshot
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Total Assets:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {fundDetails.accountingSnapshot.totalAssets}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Cash on Hand:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {fundDetails.accountingSnapshot.cashOnHand}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Net Income (YTD):</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: fundDetails.accountingSnapshot.netIncomeColor, fontWeight: 500 }}>
                    {fundDetails.accountingSnapshot.netIncomeYTD}
                  </span>
                </div>
              </div>
            </div>

            {/* Depreciation Allocation Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px'
              }}
            >
              <div
                style={{
                  fontSize: `clamp(13px, 2vw, 14px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: 12
                }}
              >
                Depreciation Allocation
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Annual Depreciation:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {fundDetails.depreciationAllocation.annualDepreciation}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Method:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {fundDetails.depreciationAllocation.method}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: `clamp(10px, 1.3vw, 11px)`,
                    color: '#64748B',
                    fontStyle: 'italic',
                    marginTop: 4
                  }}
                >
                  {fundDetails.depreciationAllocation.note}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Edit Fund Modal */}
      {editModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', margin: 0 }}>Edit Fund</h3>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    fontSize: 14,
                    color: '#0F172A',
                    outline: 'none'
                  }}
                >
                  <option value="coming_soon">Coming Soon</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="fully_subscribed">Fully Subscribed</option>
                  <option value="liquidating">Liquidating</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Performance Metric (%)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 12.5"
                  value={editForm.performance_metric}
                  onChange={(e) => setEditForm({ ...editForm, performance_metric: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    fontSize: 14,
                    color: '#0F172A',
                    outline: 'none'
                  }}
                />
                <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Set value to fix N/A in table.</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => setEditModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFund}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: '#1D4ED8',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

