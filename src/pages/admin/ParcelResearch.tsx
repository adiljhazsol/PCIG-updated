import React, { CSSProperties, useState } from 'react';
import {
  Clock,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  Package,
  Grid,
  X,
  Edit
} from 'lucide-react';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import AdminNav from '../../components/admin/AdminNav';
import adminData from '../../data/admin.json';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Clock,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  Package,
  Grid,
  X,
  Edit
};

export default function ParcelResearch() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  // Extract data from JSON
  const parcelData = adminData.parcelResearch;
  const header = parcelData.header;
  const summaryCards = parcelData.summaryCards;
  const searchAndFilters = parcelData.searchAndFilters;
  const gridActions = parcelData.gridActions;
  const dataGrid = parcelData.dataGrid;
  const detailView = parcelData.detailView;
  const quickContact = parcelData.quickContact;

  const [selectedParcelId, setSelectedParcelId] = useState<string>(
    dataGrid.rows.find((r: any) => r.selected)?.id || dataGrid.rows[0].id
  );
  const [activeTab, setActiveTab] = useState<string>('Owner Contact');
  const [interactionType, setInteractionType] = useState<string>('Call (Outbound)');

  const handleRowClick = (parcelId: string) => {
    setSelectedParcelId(parcelId);
  };

  const selectedParcel = dataGrid.rows.find((r: any) => r.id === selectedParcelId) || dataGrid.rows[0];

  const pageWrapperStyle: CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
    overflowX: 'hidden'
  };

  const cardStyle: CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E2E8F0',
    padding: `clamp(16px, 2vh, 20px)`,
    boxSizing: 'border-box'
  };

  const AddParcelIcon = iconMap[header.actionButtons[0].icon] || Plus;
  const BulkImportIcon = iconMap[header.actionButtons[1].icon] || Upload;
  const ExportIcon = iconMap[header.actionButtons[2].icon] || Download;
  const ColumnsIcon = iconMap['Grid'] || Grid;

  return (
    <div style={pageWrapperStyle}>
      <AdminNav />
      <div
        style={{
          padding: isMobile ? '16px 16px 24px' : isTablet ? '20px 24px 32px' : '24px 40px',
          width: '100%',
          maxWidth: '100%',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Main Layout: Responsive Grid/Flex */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet
              ? 'minmax(0, 1fr)'
              : '1fr 380px',
            gap: isMobile ? 16 : 24,
            alignItems: 'start'
          }}
        >
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: isMobileOrTablet ? 'flex-start' : 'center',
                  flexDirection: isMobileOrTablet ? 'column' : 'row',
                  gap: `clamp(12px, 1.5vh, 16px)`,
                  marginBottom: `clamp(8px, 1vh, 12px)`
                }}
              >
                <div>
                  <h1
                    style={{
                      fontSize: `clamp(20px, 2.5vw, 28px)`,
                      fontWeight: 700,
                      color: '#0F172A',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: `clamp(4px, 0.5vh, 8px)`,
                      marginLeft: 0,
                      lineHeight: 1.2
                    }}
                  >
                    {header.title}
                  </h1>
                  <p
                    style={{
                      fontSize: `clamp(12px, 1.2vw, 14px)`,
                      color: '#64748B',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 0,
                      marginLeft: 0,
                      lineHeight: 1.4
                    }}
                  >
                    {header.subtitle}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: `clamp(8px, 1vw, 12px)`, flexWrap: 'wrap' }}>
                  {header.actionButtons.map((button: any, idx: number) => {
                    const ButtonIcon = iconMap[button.icon] || FileText;
                    return (
                      <button
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: `clamp(8px, 1vh, 10px) clamp(12px, 1.5vw, 20px)`,
                          borderRadius: 8,
                          border: button.variant === 'primary' ? 'none' : '1px solid #E2E8F0',
                          backgroundColor: button.variant === 'primary' ? '#2563EB' : '#FFFFFF',
                          color: button.variant === 'primary' ? '#FFFFFF' : '#64748B',
                          fontSize: `clamp(12px, 1.2vw, 14px)`,
                          fontWeight: 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flex: isMobile ? '1' : 'none',
                          justifyContent: 'center'
                        }}
                      >
                        <ButtonIcon style={{ width: 16, height: 16 }} />
                        {button.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: `clamp(12px, 1.5vh, 16px)`
              }}
            >
              {summaryCards.map((card: any) => {
                const CardIcon = iconMap[card.icon] || FileText;
                return (
                  <div
                    key={card.label}
                    style={{
                      ...cardStyle,
                      backgroundColor: card.bg,
                      border: `1px solid ${card.color}20`,
                      padding: `clamp(16px, 2vh, 20px)`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div
                        style={{
                          width: `clamp(36px, 4vw, 40px)`,
                          height: `clamp(36px, 4vw, 40px)`,
                          borderRadius: 10,
                          backgroundColor: card.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF'
                        }}
                      >
                        <CardIcon style={{ width: `clamp(18px, 2vw, 20px)`, height: `clamp(18px, 2vw, 20px)` }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: '#64748B',
                            marginBottom: 4
                          }}
                        >
                          {card.label}
                        </div>
                        <div
                          style={{
                            fontSize: `clamp(20px, 2.5vw, 24px)`,
                            fontWeight: 700,
                            color: card.color
                          }}
                        >
                          {card.value}
                        </div>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: `clamp(11px, 1.1vw, 12px)`,
                        color: '#64748B',
                        marginTop: 0,
                        marginRight: 0,
                        marginBottom: 0,
                        marginLeft: 0
                      }}
                    >
                      {card.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Search and Filters */}
            <div style={cardStyle}>
              <div
                style={{
                  display: 'flex',
                  gap: `clamp(8px, 1vw, 12px)`,
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '1', minWidth: isMobile ? '100%' : 200 }}>
                  <Search
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 18,
                      height: 18,
                      color: '#9CA3AF',
                      pointerEvents: 'none'
                    }}
                  />
                  <input
                    type="text"
                    placeholder={searchAndFilters.searchPlaceholder}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 40px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F9FAFB',
                      fontSize: 14,
                      color: '#111827',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                {searchAndFilters.filters.map((filter: any, idx: number) => (
                  <select
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: 13,
                      color: '#0F172A',
                      cursor: 'pointer',
                      minWidth: isMobile ? '100%' : 120,
                      flex: isMobile ? '1 1 100%' : 'none',
                      appearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%2364748B\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '36px',
                      boxSizing: 'border-box'
                    }}
                    defaultValue={filter.value}
                  >
                    <option>{filter.label}: {filter.value}</option>
                    {filter.options && filter.options.filter((opt: string) => opt !== filter.value).map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ))}
                <button
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    flex: isMobile ? '1 1 100%' : 'none',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  {searchAndFilters.clearButton}
                </button>
              </div>
            </div>

            {/* Grid Actions */}
            <div style={{ display: 'flex', gap: `clamp(8px, 1vw, 12px)`, alignItems: 'center', flexWrap: 'wrap' }}>
              {gridActions.map((action: any, idx: number) => {
                const ActionIcon = action.icon ? iconMap[action.icon] : null;
                return (
                  <button
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 20px',
                      borderRadius: 8,
                      border: action.variant === 'primary' ? 'none' : '1px solid #E2E8F0',
                      backgroundColor: action.variant === 'primary' ? '#10B981' : '#FFFFFF',
                      color: action.variant === 'primary' ? '#FFFFFF' : '#64748B',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      flex: isMobile ? '1 1 auto' : 'none',
                      justifyContent: 'center'
                    }}
                  >
                    {ActionIcon && <ActionIcon style={{ width: 16, height: 16 }} />}
                    {action.label}
                  </button>
                );
              })}
            </div>

            {/* Data Grid */}
            <div style={cardStyle}>
              <div style={{
                overflowX: isMobileOrTablet ? 'auto' : 'visible',
                minWidth: isMobileOrTablet ? '100%' : 'auto',
                WebkitOverflowScrolling: 'touch'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13,
                  minWidth: isMobileOrTablet ? '800px' : 'auto'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      {dataGrid.headers.map((header: string) => (
                        <th
                          key={header}
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: '#64748B'
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataGrid.rows.map((row: any) => (
                      <tr
                        key={row.id}
                        onClick={() => handleRowClick(row.id)}
                        style={{
                          borderBottom: '1px solid #E2E8F0',
                          cursor: 'pointer',
                          backgroundColor: selectedParcelId === row.id ? '#EFF6FF' : 'transparent',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedParcelId !== row.id) {
                            e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedParcelId !== row.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <td style={{ padding: '14px 16px', color: '#0F172A', fontWeight: 500 }}>
                          {row.fileNumber}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#0F172A' }}>
                          {row.parcelId}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#0F172A' }}>
                          {row.situsAddress}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748B' }}>
                          {row.county}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#0F172A', fontWeight: 500 }}>
                          {row.ownerName}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748B' }}>
                          {row.ownerPhone}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748B' }}>
                          {row.mailingAddress}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail View */}
            {selectedParcel && (
              <div style={cardStyle}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #E2E8F0', overflowX: 'auto' }}>
                  {detailView.tabs.map((tab: string) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 0,
                        border: 'none',
                        borderBottom: activeTab === tab ? '2px solid #2563EB' : '2px solid transparent',
                        backgroundColor: 'transparent',
                        color: activeTab === tab ? '#2563EB' : '#64748B',
                        fontSize: 14,
                        fontWeight: activeTab === tab ? 600 : 500,
                        cursor: 'pointer',
                        marginBottom: '-1px'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                {activeTab === 'Owner Contact' && (
                  <div>
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#0F172A',
                        marginTop: 0,
                        marginRight: 0,
                        marginBottom: 16,
                        marginLeft: 0
                      }}
                    >
                      {detailView.ownerContact.title}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {detailView.ownerContact.fields.map((field: any, idx: number) => {
                        const FieldIcon = field.icons && field.icons[0] ? iconMap[field.icons[0]] : null;
                        const FieldIcon2 = field.icons && field.icons[1] ? iconMap[field.icons[1]] : null;
                        return (
                          <div key={idx}>
                            <label
                              style={{
                                display: 'block',
                                fontSize: 12,
                                fontWeight: 500,
                                color: '#64748B',
                                marginBottom: 6
                              }}
                            >
                              {field.label}
                            </label>
                            <div style={{ position: 'relative' }}>
                              <input
                                type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                                defaultValue={field.value}
                                style={{
                                  width: '100%',
                                  padding: '10px 14px',
                                  paddingRight: field.icons ? '80px' : '14px',
                                  borderRadius: 8,
                                  border: '1px solid #E2E8F0',
                                  backgroundColor: '#FFFFFF',
                                  fontSize: 14,
                                  color: '#0F172A',
                                  boxSizing: 'border-box'
                                }}
                              />
                              {field.icons && (
                                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 8 }}>
                                  {field.icons.map((iconName: string, iconIdx: number) => {
                                    const Icon = iconMap[iconName];
                                    return Icon ? (
                                      <button
                                        key={iconIdx}
                                        style={{
                                          width: 28,
                                          height: 28,
                                          borderRadius: 6,
                                          border: '1px solid #E2E8F0',
                                          backgroundColor: '#FFFFFF',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        <Icon style={{ width: 14, height: 14, color: '#64748B' }} />
                                      </button>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {activeTab !== 'Owner Contact' && (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748B' }}>
                    {activeTab} content coming soon...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Quick Contact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', minWidth: 0 }}>
            <div style={cardStyle}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20
                }}
              >
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 0,
                    marginLeft: 0
                  }}
                >
                  {quickContact.title}
                </h2>
                <button
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <X style={{ width: 16, height: 16, color: '#64748B' }} />
                </button>
              </div>

              {/* Selected Parcel */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#64748B',
                    marginBottom: 12
                  }}
                >
                  SELECTED PARCEL
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#64748B',
                        marginBottom: 4
                      }}
                    >
                      Parcel ID
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#0F172A'
                      }}
                    >
                      {selectedParcel.parcelId}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#64748B',
                        marginBottom: 4
                      }}
                    >
                      Address
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#0F172A'
                      }}
                    >
                      {selectedParcel.situsAddress}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#64748B',
                        marginBottom: 4
                      }}
                    >
                      OWNER
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#0F172A'
                      }}
                    >
                      {selectedParcel.ownerName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
                  gap: 12,
                  marginBottom: 24
                }}
              >
                {quickContact.contactButtons.map((button: any, idx: number) => {
                  const ButtonIcon = iconMap[button.icon] || Phone;
                  return (
                    <button
                      key={idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        padding: '16px',
                        borderRadius: 12,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer'
                      }}
                    >
                      <div
                        style={{
                          width: `clamp(40px, 5vw, 48px)`,
                          height: `clamp(40px, 5vw, 48px)`,
                          borderRadius: 12,
                          backgroundColor: `${button.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <ButtonIcon style={{ width: `clamp(20px, 2.5vw, 24px)`, height: `clamp(20px, 2.5vw, 24px)`, color: button.color }} />
                      </div>
                      <span
                        style={{
                          fontSize: `clamp(11px, 1.2vw, 12px)`,
                          fontWeight: 500,
                          color: '#0F172A'
                        }}
                      >
                        {button.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Contact History */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#64748B',
                    marginBottom: 12
                  }}
                >
                  CONTACT HISTORY
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#0F172A'
                    }}
                  >
                    Last contact: {quickContact.contactHistory.lastContact}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#64748B'
                    }}
                  >
                    {quickContact.contactHistory.summary}
                  </div>
                </div>
              </div>

              {/* Log Interaction */}
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#64748B',
                    marginBottom: 12
                  }}
                >
                  {quickContact.logInteraction.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#64748B',
                        marginBottom: 6
                      }}
                    >
                      {quickContact.logInteraction.typeLabel}
                    </label>
                    <select
                      value={interactionType}
                      onChange={(e) => setInteractionType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        fontSize: 13,
                        color: '#0F172A',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%2364748B\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        paddingRight: '36px',
                        boxSizing: 'border-box'
                      }}
                    >
                      {quickContact.logInteraction.typeOptions.map((option: string) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#64748B',
                        marginBottom: 6
                      }}
                    >
                      {quickContact.logInteraction.notesLabel}
                    </label>
                    <textarea
                      rows={4}
                      placeholder={quickContact.logInteraction.notesLabel}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        fontSize: 14,
                        color: '#0F172A',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                        minHeight: '80px',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <button
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <MessageSquare style={{ width: 16, height: 16 }} />
                    {quickContact.logInteraction.buttonLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

