import React, { CSSProperties, useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Building2,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Download,
  Plus,
  Building2,
  DollarSign,
  TrendingUp,
  Calendar
};

export default function REOLeased() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  interface Header {
    title: string;
    subtitle: string;
  }

  interface ActionButton {
    label: string;
    icon: string;
  }

  interface ActionButtons {
    exportRentRoll: ActionButton;
    addLease: ActionButton;
  }

  interface AlertBanner {
    message: string;
    buttonLabel: string;
  }

  interface SummaryCard {
    label: string;
    value: string;
    icon: string;
    subtext: string;
    subtextColor?: string;
  }

  interface FilterOption {
    label: string;
    selected: string;
    options: string[];
  }

  interface LeaseDetails {
    tenant: string;
    contact: string;
    leaseStart: string;
    leaseEnd: string;
    baseRent: string;
    securityDep: string;
  }

  interface RentStatusDetail {
    period: string;
    status: string;
    statusColor: string;
    amountDue: string;
    balance: string;
    balanceColor: string;
  }

  interface Activity {
    date: string;
    type: string;
    amount: string;
    amountColor?: string;
  }

  interface PerformanceYTD {
    grossIncome: string;
    expenses: string;
    netOperatingIncome: string;
    cashYield: string;
    cashYieldColor: string;
  }

  interface Lease {
    id: string;
    property: string;
    name: string;
    address: string;
    location: string;
    image: string;
    status: string;
    statusColor: string;
    tenant: string;
    tenantType: string;
    rent: string;
    rentStatusLabel: string;
    rentStatusColor: string;
    opex: string;
    noi: string;
    noiColor: string;
    yield: string;
    leaseEnd: string;
    leaseEndDetail: string;
    tabs: string[];
    leaseDetails: LeaseDetails;
    rentStatus: RentStatusDetail;
    recentActivity: Activity[];
    performanceYTD: PerformanceYTD;
  }

  interface ReoLeasedData {
    header: Header;
    actionButtons: ActionButtons;
    alertBanner: AlertBanner;
    summaryCards: SummaryCard[];
    searchPlaceholder: string;
    filters: FilterOption[];
    tableHeaders: string[];
    leases: Lease[];
  }

  const [data, setData] = useState<ReoLeasedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLeaseId, setSelectedLeaseId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('details');

  const [showAddLeaseModal, setShowAddLeaseModal] = useState(false);
  const [availableProperties, setAvailableProperties] = useState<any[]>([]);
  const [newLease, setNewLease] = useState({
      property_id: '',
      tenant_name: '',
      monthly_rent: '',
      security_deposit: '',
      lease_start: '',
      lease_end: '',
      notes: ''
  });

  const fetchData = async () => {
      try {
          const response = await api.get('/admin/reo/lease/dashboard-data');
          const result = response.data;
          setData(result);
          
          if (result.leases && result.leases.length > 0) {
              // Only set selected lease if none selected or current selection not in new list
              if (!selectedLeaseId || !result.leases.find((l: Lease) => l.id === selectedLeaseId)) {
                   setSelectedLeaseId(result.leases[0].id);
              }
          }
      } catch (err) {
          console.error('Error fetching dashboard data:', err);
          setError('Failed to load dashboard data');
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchAvailableProperties = async () => {
      try {
          const response = await api.get('/admin/reo/lease/available-properties');
          setAvailableProperties(response.data);
      } catch (err) {
          console.error('Error fetching available properties:', err);
      }
  };

  const handleSaveLease = async () => {
      try {
          await api.post(`/admin/reo/${newLease.property_id}/lease`, newLease);
          setShowAddLeaseModal(false);
          setNewLease({
              property_id: '',
              tenant_name: '',
              monthly_rent: '',
              security_deposit: '',
              lease_start: '',
              lease_end: '',
              notes: ''
          });
          fetchData(); // Refresh data
      } catch (err) {
          console.error('Error creating lease:', err);
          alert('Failed to create lease');
      }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return null;

  // Extract data from fetched result
  const header = data?.header || { title: '', subtitle: '' };
  const actionButtons = data?.actionButtons || { exportRentRoll: { label: '', icon: '' }, addLease: { label: '', icon: '' } };
  const alertBanner = data?.alertBanner || { message: '', buttonLabel: '' };
  const summaryCards = data?.summaryCards || [];
  const searchPlaceholder = data?.searchPlaceholder || '';
  const filters = data?.filters || [];
  const tableHeaders = data?.tableHeaders || [];
  const leases = data?.leases || [];
  
  const selectedProperty = leases.find((l: Lease) => l.id === selectedLeaseId) || (leases.length > 0 ? leases[0] : null);

  if (!selectedProperty && leases.length > 0) return <div>Loading selection...</div>;
  if (!selectedProperty && leases.length === 0) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <AdminNav />
      <h3>No leases found</h3>
      <p>There are currently no active leases in the system.</p>
    </div>
  );

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
          {/* Left Column - Lease List */}
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
                    fontSize: isMobile ? 'clamp(18px, 3vw, 24px)' : '24px',
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
                      fontSize: 'clamp(11px, 1.5vw, 13px)',
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
                marginBottom: 16
              }}
            >
              <button
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
                {React.createElement(iconMap[actionButtons.exportRentRoll.icon], { style: { width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` } })}
                {actionButtons.exportRentRoll.label}
              </button>
              <button
                onClick={() => {
                  setShowAddLeaseModal(true);
                  fetchAvailableProperties();
                }}
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
              >
                {React.createElement(iconMap[actionButtons.addLease.icon], { style: { width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` } })}
                {actionButtons.addLease.label}
              </button>
            </div>

            {/* Alert Banner */}
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 8,
                padding: isMobile ? '10px 12px' : '12px 16px',
                marginBottom: 24,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? 8 : 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <AlertCircle style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)`, color: '#DC2626', flexShrink: 0 }} />
                <span style={{ fontSize: `clamp(11px, 1.5vw, 13px)`, color: '#991B1B', fontWeight: 500 }}>
                  {alertBanner.message}
                </span>
              </div>
              <button
                style={{
                  padding: `clamp(6px, 1vh, 8px) clamp(10px, 1.5vw, 12px)`,
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: `clamp(11px, 1.5vw, 12px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  flexShrink: 0,
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                {alertBanner.buttonLabel}
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
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  {card.icon && iconMap[card.icon] && React.createElement(iconMap[card.icon], {
                    style: {
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      width: `clamp(18px, 2.5vw, 20px)`,
                      height: `clamp(18px, 2.5vw, 20px)`,
                      color: '#CBD5E1'
                    }
                  })}
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
                  flex: 1,
                  minWidth: isMobile ? '100%' : '200px'
                }}
              >
                <Search
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: `clamp(14px, 2vw, 16px)`,
                    height: `clamp(14px, 2vw, 16px)`,
                    color: '#64748B'
                  }}
                />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  style={{
                    width: '100%',
                    padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px) clamp(8px, 1vh, 10px) ${isMobileOrTablet ? 'clamp(36px, 5vw, 40px)' : '36px'}`,
                    fontSize: `clamp(12px, 1.5vw, 13px)`,
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A'
                  }}
                />
              </div>
              {filters.map((filter: FilterOption, idx: number) => (
                <select
                  key={idx}
                  style={{
                    padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px)`,
                    fontSize: `clamp(12px, 1.5vw, 13px)`,
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    cursor: 'pointer',
                    minWidth: isMobile ? '100%' : '120px',
                    width: isMobile ? '100%' : 'auto'
                  }}
                  defaultValue={`${filter.selected}`}
                >
                  <option value={filter.selected}>{filter.label}: {filter.selected}</option>
                  {filter.options.filter((opt: string) => opt !== filter.selected).map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ))}
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px)`,
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                <Filter style={{ width: `clamp(12px, 2vw, 14px)`, height: `clamp(12px, 2vw, 14px)` }} />
                More Filters
              </button>
            </div>

            {/* Lease Table */}
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
                    {tableHeaders.map((header: string, idx: number) => (
                      <th
                        key={header || `header-${idx}`}
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
                  {leases.map((lease: Lease) => {
                    const isSelected = lease.id === selectedLeaseId;
                    return (
                      <tr
                        key={lease.id}
                        onClick={() => setSelectedLeaseId(lease.id)}
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
                        <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => setSelectedLeaseId(lease.id)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: `clamp(14px, 2vw, 16px)`,
                              height: `clamp(14px, 2vw, 16px)`,
                              cursor: 'pointer'
                            }}
                          />
                        </td>
                        <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, fontWeight: 500, color: '#0F172A' }}>
                          <div>
                            <div style={{ fontSize: `clamp(11px, 1.5vw, 13px)`, wordBreak: 'break-word' }}>{lease.property}</div>
                            <div style={{ fontSize: `clamp(10px, 1.3vw, 11px)`, color: '#64748B', marginTop: 2 }}>
                              {lease.id}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                          <span
                            style={{
                              fontSize: `clamp(11px, 1.5vw, 12px)`,
                              fontWeight: 500,
                              color: lease.statusColor,
                              backgroundColor: lease.statusColor === '#10B981' ? '#ECFDF5' :
                                              lease.statusColor === '#1D4ED8' ? '#EFF6FF' :
                                              '#FFFBEB',
                              padding: '4px 8px',
                              borderRadius: 4
                            }}
                          >
                            {lease.status}
                          </span>
                        </td>
                        <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                          <div>
                            <div style={{ fontSize: `clamp(11px, 1.5vw, 13px)`, color: '#0F172A' }}>{lease.tenant}</div>
                            <div style={{ fontSize: `clamp(10px, 1.3vw, 11px)`, color: '#64748B', marginTop: 2 }}>
                              {lease.tenantType}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: '#0F172A', fontWeight: 500 }}>
                          {lease.rent}
                        </td>
                        <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                          {lease.rentStatusLabel !== '--' ? (
                            <span
                              style={{
                                fontSize: `clamp(11px, 1.5vw, 12px)`,
                                fontWeight: 500,
                                color: lease.rentStatusColor
                              }}
                            >
                              {lease.rentStatusLabel}
                            </span>
                          ) : (
                            <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>--</span>
                          )}
                        </td>
                        <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: '#64748B' }}>
                          {lease.opex}
                        </td>
                        <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                          <span style={{ 
                            color: lease.noiColor || '#0F172A',
                            fontWeight: 500
                          }}>
                            {lease.noi}
                          </span>
                        </td>
                        <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)` }}>
                          {lease.yield !== '--' ? (
                            <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#F59E0B', fontWeight: 500 }}>
                              {lease.yield}
                            </span>
                          ) : (
                            <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>--</span>
                          )}
                        </td>
                        <td style={{ padding: `clamp(10px, 1.5vh, 12px) clamp(12px, 2vw, 16px)`, color: '#64748B' }}>
                          <div>
                            <div style={{ fontSize: `clamp(11px, 1.5vw, 12px)` }}>{lease.leaseEnd}</div>
                            {lease.leaseEndDetail && (
                              <div style={{ fontSize: `clamp(10px, 1.3vw, 11px)`, marginTop: 2 }}>{lease.leaseEndDetail}</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Property Details */}
          <div style={{ order: isMobileOrTablet ? -1 : 0 }}>
            {/* Property Header */}
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
                  {selectedProperty?.name}
                </div>
                <div
                  style={{
                    fontSize: `clamp(11px, 1.5vw, 12px)`,
                    color: '#64748B',
                    marginBottom: 8
                  }}
                >
                  {selectedProperty?.id} • {selectedProperty?.location}
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: selectedProperty?.statusColor,
                    backgroundColor: '#ECFDF5',
                    padding: '4px 8px',
                    borderRadius: 4
                  }}
                >
                  {selectedProperty?.status}
                </span>
              </div>
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
              {selectedProperty?.tabs?.map((tab) => {
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

            {/* Lease Details Card */}
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
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0F172A'
                  }}
                >
                  Lease Details
                </div>
                <button
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#64748B',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Edit style={{ width: 14, height: 14 }} />
                  Edit
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Tenant:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {selectedProperty?.leaseDetails?.tenant}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Contact:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {selectedProperty?.leaseDetails?.contact}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Lease Start:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {selectedProperty?.leaseDetails?.leaseStart}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Lease End:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {selectedProperty?.leaseDetails?.leaseEnd}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Base Rent:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {selectedProperty?.leaseDetails?.baseRent}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Security Dep.:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {selectedProperty?.leaseDetails?.securityDep}
                  </span>
                </div>
              </div>
            </div>

            {/* Rent Status Card */}
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
                  Rent Status ({selectedProperty?.rentStatus?.period})
                </div>
                <span
                  style={{
                    fontSize: `clamp(10px, 1.3vw, 11px)`,
                    fontWeight: 600,
                    color: selectedProperty?.rentStatus?.statusColor,
                    backgroundColor: '#ECFDF5',
                    padding: `clamp(3px, 0.5vh, 4px) clamp(6px, 1vw, 8px)`,
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {selectedProperty?.rentStatus?.status}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Amount Due:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {selectedProperty?.rentStatus?.amountDue}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Balance:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: selectedProperty?.rentStatus?.balanceColor, fontWeight: 500 }}>
                    {selectedProperty?.rentStatus?.balance}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  style={{
                    padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px)`,
                    fontSize: `clamp(11px, 1.5vw, 12px)`,
                    fontWeight: 500,
                    color: '#64748B',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                >
                  View Ledger
                </button>
                <button
                  style={{
                    padding: `clamp(8px, 1vh, 10px) clamp(10px, 1.5vw, 12px)`,
                    fontSize: `clamp(11px, 1.5vw, 12px)`,
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#1D4ED8',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                >
                  Record Payment
                </button>
              </div>
            </div>

            {/* Recent Activity Card */}
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
                Recent Activity
              </div>
              <table style={{ width: '100%', fontSize: `clamp(11px, 1.5vw, 12px)` }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '8px 0', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: '11px' }}>Date</th>
                    <th style={{ padding: '8px 0', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: '11px' }}>Type</th>
                    <th style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600, color: '#64748B', fontSize: '11px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProperty?.recentActivity?.map((activity: Activity, idx: number) => (
                    <tr key={idx} style={{ borderBottom: idx < (selectedProperty?.recentActivity?.length || 0) - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <td style={{ padding: '8px 0', color: '#64748B' }}>{activity.date}</td>
                      <td style={{ padding: '8px 0', color: '#0F172A' }}>{activity.type}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', color: activity.amountColor, fontWeight: 500 }}>
                        {activity.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Performance (YTD) Card */}
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
                Performance (YTD)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Gross Income:</span>
                    <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                      {selectedProperty?.performanceYTD?.grossIncome}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#10B981' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Expenses:</span>
                    <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                      {selectedProperty?.performanceYTD?.expenses}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: '17%', height: '100%', backgroundColor: '#DC2626' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #E2E8F0', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Net Operating Income:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#0F172A', fontWeight: 500 }}>
                    {selectedProperty?.performanceYTD?.netOperatingIncome}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B' }}>Cash Yield:</span>
                  <span style={{ fontSize: `clamp(11px, 1.5vw, 12px)`, color: selectedProperty?.performanceYTD?.cashYieldColor, fontWeight: 500 }}>
                    {selectedProperty?.performanceYTD?.cashYield}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}
            >
              <button
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
                <Plus style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)` }} />
                Add Expense
              </button>
              <button
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
                Renew Lease
              </button>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 2vw, 16px)`,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: `clamp(12px, 1.5vw, 13px)`,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Lease Modal */}
      {showAddLeaseModal && (
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
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0F172A', margin: 0 }}>Add New Lease</h2>
              <button
                onClick={() => setShowAddLeaseModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                  Property
                </label>
                <select
                  value={newLease.property_id}
                  onChange={(e) => setNewLease({...newLease, property_id: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select a property...</option>
                  {availableProperties.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.address} {prop.city ? `, ${prop.city}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                  Tenant Name
                </label>
                <input
                  type="text"
                  value={newLease.tenant_name}
                  onChange={(e) => setNewLease({...newLease, tenant_name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                    Monthly Rent
                  </label>
                  <input
                    type="number"
                    value={newLease.monthly_rent}
                    onChange={(e) => setNewLease({...newLease, monthly_rent: e.target.value})}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                    Security Deposit
                  </label>
                  <input
                    type="number"
                    value={newLease.security_deposit}
                    onChange={(e) => setNewLease({...newLease, security_deposit: e.target.value})}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                    Lease Start
                  </label>
                  <input
                    type="date"
                    value={newLease.lease_start}
                    onChange={(e) => setNewLease({...newLease, lease_start: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                    Lease End
                  </label>
                  <input
                    type="date"
                    value={newLease.lease_end}
                    onChange={(e) => setNewLease({...newLease, lease_end: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                  Notes
                </label>
                <textarea
                  value={newLease.notes}
                  onChange={(e) => setNewLease({...newLease, notes: e.target.value})}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    fontSize: '14px',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => setShowAddLeaseModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLease}
                  disabled={!newLease.property_id || !newLease.tenant_name}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: (!newLease.property_id || !newLease.tenant_name) ? '#94A3B8' : '#1D4ED8',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: (!newLease.property_id || !newLease.tenant_name) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Save Lease
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

