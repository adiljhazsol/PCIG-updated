import React, { CSSProperties, useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  FileText,
  Edit,
  X,
  Image as ImageIcon,
  Eye
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Download,
  Plus,
  Edit,
  Eye
};

export default function REODisposition() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const [selectedTab, setSelectedTab] = useState<'for-sale' | 'for-lease' | 'all'>('for-sale');
  const [selectedProperty, setSelectedProperty] = useState<string | null>('1240 Oak Street');
  
  // Extract data from JSON
  const reoData = adminData.reoDisposition;
  const header = reoData.header;
  const actionButtons = reoData.actionButtons;
  const summaryCards = reoData.summaryCards;
  const tabs = reoData.tabs;
  const searchPlaceholder = reoData.searchPlaceholder;
  const filters = reoData.filters;
  const tableHeaders = reoData.tableHeaders;
  const properties = reoData.properties;
  const selectedPropertyData = reoData.selectedProperty;

  const pageWrapperStyle: CSSProperties = {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
          maxWidth: isMobile ? '100%' : '100%',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Page Header */}
        <div style={{ marginBottom: isMobile ? 16 : 24 }}>
          <h1
            style={{
              fontSize: isMobile ? 'clamp(20px, 5vw, 24px)' : '24px',
              fontWeight: 700,
              color: '#0F172A',
              marginBottom: 4
            }}
          >
            {header.title}
          </h1>
          {!isMobile && (
            <p
              style={{
                fontSize: 'clamp(11px, 1.5vw, 13px)',
                color: '#64748B'
              }}
            >
              {header.subtitle}
            </p>
          )}
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
            marginBottom: isMobile ? 16 : 24
          }}
        >
          {summaryCards.map((card, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 16
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#64748B',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 8,
                  marginBottom: 4
                }}
              >
                <span
                  style={{
                    fontSize: isMobile ? 'clamp(20px, 5vw, 24px)' : '24px',
                    fontWeight: 700,
                    color: '#0F172A'
                  }}
                >
                  {card.value}
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#64748B'
                }}
              >
                {card.subtext}
              </div>
            </div>
          ))}
        </div>

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
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Filter Tabs */}
            <div
              style={{
                display: 'flex',
                gap: isMobile ? 4 : 8,
                borderBottom: '1px solid #E2E8F0',
                overflowX: isMobile ? 'auto' : 'visible',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin'
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  style={{
                    padding: isMobile ? '8px 12px' : '10px 16px',
                    fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                    fontWeight: selectedTab === tab.key ? 600 : 500,
                    color: selectedTab === tab.key ? '#1E3A5F' : '#64748B',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: selectedTab === tab.key ? '2px solid #1E3A5F' : '2px solid transparent',
                    cursor: 'pointer',
                    marginBottom: -1,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search and Filter Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 8 : 12,
                flexWrap: isMobile ? 'wrap' : 'nowrap'
              }}
            >
              <div
                style={{
                  flexGrow: 1,
                  flexShrink: 1,
                  flexBasis: 0,
                  position: 'relative'
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
                  placeholder={isMobile ? searchPlaceholder.mobile : searchPlaceholder.desktop}
                  style={{
                    width: '100%',
                    padding: isMobile ? '8px 10px 8px 32px' : '8px 12px 8px 36px',
                    fontSize: isMobile ? 'clamp(12px, 3vw, 13px)' : '13px',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    minWidth: 0
                  }}
                />
              </div>
              <select
                style={{
                  padding: isMobile ? '8px 10px' : '8px 12px',
                  fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  cursor: 'pointer',
                  width: isMobile ? 'calc(50% - 4px)' : 'auto',
                  minWidth: isMobile ? 0 : 120
                }}
              >
                {filters.status.options.map((option) => (
                  <option key={option}>{option === 'All' ? filters.status.label : option}</option>
                ))}
              </select>
              <select
                style={{
                  padding: isMobile ? '8px 10px' : '8px 12px',
                  fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  cursor: 'pointer',
                  width: isMobile ? 'calc(50% - 4px)' : 'auto',
                  minWidth: isMobile ? 0 : 120
                }}
              >
                {filters.type.options.map((option) => (
                  <option key={option}>{option === 'All' ? filters.type.label : option}</option>
                ))}
              </select>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: isMobile ? '8px 10px' : '8px 12px',
                  fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: isMobile ? 'center' : 'flex-start',
                  whiteSpace: 'nowrap'
                }}
              >
                <Filter style={{ width: 14, height: 14, flexShrink: 0 }} />
                <span>{filters.moreFilters}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: isMobile ? 'stretch' : 'flex-end',
                gap: isMobile ? 8 : 12,
                flexDirection: isMobile ? 'column' : 'row'
              }}
            >
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: isMobile ? '10px 14px' : '8px 14px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  fontSize: isMobile ? 'clamp(12px, 3vw, 13px)' : '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center'
                }}
              >
                {React.createElement(iconMap[actionButtons.export.icon], { style: { width: 16, height: 16, flexShrink: 0 } })}
                {actionButtons.export.label}
              </button>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: isMobile ? '10px 16px' : '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#1E3A5F',
                  color: '#FFFFFF',
                  fontSize: isMobile ? 'clamp(12px, 3vw, 13px)' : '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.15)',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center'
                }}
              >
                {React.createElement(iconMap[actionButtons.createListing.icon], { style: { width: 16, height: 16, flexShrink: 0 } })}
                {actionButtons.createListing.label}
              </button>
            </div>

            {/* Properties Table */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                overflow: isMobileOrTablet ? 'auto' : 'hidden',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: isMobileOrTablet ? 800 : 'auto'
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderBottom: '1px solid #E2E8F0'
                    }}
                  >
                    {tableHeaders.map((header, idx) => (
                      <th
                        key={header + idx}
                        style={{
                          padding: isMobile ? '10px 12px' : '12px 16px',
                          textAlign: idx === 0 ? 'center' : 'left',
                          fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px',
                          fontWeight: 600,
                          color: '#64748B',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          minWidth: isMobile 
                            ? (idx === 0 ? 40 : idx === 1 ? 100 : idx === 2 ? 150 : idx === 3 ? 100 : idx === 4 ? 80 : idx === 5 ? 100 : idx === 6 ? 90 : 60)
                            : 'auto'
                        }}
                      >
                        {header === '' ? <input type="checkbox" /> : header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedProperty(property.address)}
                      style={{
                        borderBottom: idx < properties.length - 1 ? '1px solid #E2E8F0' : 'none',
                        cursor: 'pointer',
                        backgroundColor: selectedProperty === property.address ? '#F8FAFC' : '#FFFFFF',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      <td style={{ padding: isMobile ? '12px' : '16px' }}>
                        <input type="checkbox" />
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '16px' }}>
                        <div
                          style={{
                            fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                            fontWeight: 600,
                            color: '#0F172A',
                            marginBottom: 2,
                            wordBreak: 'break-word'
                          }}
                        >
                          {property.id}
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '16px' }}>
                        <div
                          style={{
                            fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                            fontWeight: 500,
                            color: '#0F172A',
                            marginBottom: 2,
                            wordBreak: 'break-word'
                          }}
                        >
                          {property.address}
                        </div>
                        <div
                          style={{
                            fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px',
                            color: '#64748B'
                          }}
                        >
                          {property.city}
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '16px' }}>
                        <div
                          style={{
                            fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                            color: '#0F172A',
                            wordBreak: 'break-word'
                          }}
                        >
                          {property.type}
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px',
                            fontWeight: 600,
                            borderRadius: 4,
                            backgroundColor: `${property.statusColor}15`,
                            color: property.statusColor,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {property.status}
                        </span>
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '16px' }}>
                        <div
                          style={{
                            fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                            fontWeight: 600,
                            color: '#0F172A',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {property.price}
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '16px' }}>
                        <div
                          style={{
                            fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                            color: '#64748B'
                          }}
                        >
                          {property.daysListed}
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '16px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          style={{
                            padding: '4px 8px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            color: '#64748B'
                          }}
                        >
                          <MoreHorizontal style={{ width: 16, height: 16 }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar */}
          {selectedProperty && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: isMobile ? 16 : 20,
                position: isMobileOrTablet ? 'relative' : 'sticky',
                top: isMobileOrTablet ? 0 : 24,
                marginTop: isMobileOrTablet ? (isMobile ? 16 : 20) : 0
              }}
            >
              {/* Property Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 16
                }}
              >
                <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 8
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 4,
                        backgroundColor: selectedPropertyData.statusBg,
                        color: selectedPropertyData.statusColor
                      }}
                    >
                      {selectedPropertyData.status}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#64748B'
                      }}
                    >
                      {selectedPropertyData.listingType}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: isMobile ? 'clamp(16px, 4vw, 18px)' : '18px',
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: 4,
                      wordBreak: 'break-word'
                    }}
                  >
                    {selectedPropertyData.address}
                  </h3>
                  <p
                    style={{
                      fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px',
                      color: '#64748B',
                      marginBottom: 4
                    }}
                  >
                    {selectedPropertyData.id}
                  </p>
                  <p
                    style={{
                      fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px',
                      color: '#64748B'
                    }}
                  >
                    {selectedPropertyData.city}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProperty(null)}
                  style={{
                    padding: 4,
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: '#64748B'
                  }}
                >
                  <X style={{ width: 18, height: 18 }} />
                </button>
              </div>

              {/* Property Image Gallery */}
              <div
                style={{
                  width: '100%',
                  height: isMobile ? 150 : 200,
                  backgroundColor: '#F1F5F9',
                  borderRadius: 8,
                  marginBottom: isMobile ? 12 : 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <ImageIcon style={{ width: 48, height: 48, color: '#CBD5E1' }} />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: '#FFFFFF',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 500
                }}
              >
                {selectedPropertyData.images} photos
              </div>
              </div>

              {/* Property Details */}
              <div style={{ marginBottom: isMobile ? 16 : 20 }}>
                <h4
                  style={{
                    fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: isMobile ? 10 : 12
                  }}
                >
                  Property Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 10 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Type</span>
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A' }}>
                      {selectedPropertyData.propertyInfo.type}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Status</span>
                    <span
                      style={{
                        fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: selectedPropertyData.statusBg,
                        color: selectedPropertyData.statusColor
                      }}
                    >
                      {selectedPropertyData.propertyInfo.status}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>List Price</span>
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 600, color: '#0F172A' }}>
                      {selectedPropertyData.propertyInfo.listPrice}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Days Listed</span>
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A' }}>{selectedPropertyData.propertyInfo.daysListed}</span>
                  </div>
                </div>
              </div>

              {/* Listing Details */}
              <div style={{ marginBottom: isMobile ? 16 : 20 }}>
                <h4
                  style={{
                    fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: isMobile ? 10 : 12
                  }}
                >
                  Listing Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 10 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Listed Date</span>
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A' }}>
                      {selectedPropertyData.listingDetails.listedDate}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Views</span>
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A' }}>{selectedPropertyData.listingDetails.views}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', color: '#64748B' }}>Inquiries</span>
                    <span style={{ fontSize: isMobile ? 'clamp(10px, 2.5vw, 12px)' : '12px', fontWeight: 500, color: '#0F172A' }}>{selectedPropertyData.listingDetails.inquiries}</span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div style={{ marginBottom: isMobile ? 16 : 20 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: isMobile ? 10 : 12
                  }}
                >
                  <h4
                    style={{
                      fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                      fontWeight: 600,
                      color: '#0F172A'
                    }}
                  >
                    Documents
                  </h4>
                  <button
                    style={{
                      padding: '4px 8px',
                      fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px',
                      fontWeight: 500,
                      color: '#1E3A5F',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Upload
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedPropertyData.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: 8,
                        backgroundColor: '#F8FAFC',
                        borderRadius: 6
                      }}
                    >
                      <FileText style={{ width: 16, height: 16, color: '#64748B' }} />
                      <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: '#0F172A' }}>
                          {doc.name}
                        </div>
                        <div style={{ fontSize: 10, color: '#64748B' }}>{doc.size} • {doc.date}</div>
                      </div>
                      <Download style={{ width: 14, height: 14, color: '#64748B', cursor: 'pointer' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Log */}
              <div>
                <h4
                  style={{
                    fontSize: isMobile ? 'clamp(11px, 2.5vw, 13px)' : '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: isMobile ? 10 : 12
                  }}
                >
                  Activity Log
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12 }}>
                  {selectedPropertyData.activityLog.map((activity, idx) => (
                    <div key={idx}>
                      <div
                        style={{
                          fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px',
                          fontWeight: 600,
                          color: '#0F172A',
                          marginBottom: 4
                        }}
                      >
                        {activity.author}
                      </div>
                      <div style={{ fontSize: isMobile ? 'clamp(8px, 1.8vw, 10px)' : '10px', color: '#64748B', marginBottom: 4 }}>
                        {activity.date}
                      </div>
                      <div style={{ fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px', color: '#64748B', wordBreak: 'break-word' }}>
                        {activity.action}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: isMobile ? 10 : 12,
                    display: 'flex',
                    gap: isMobile ? 6 : 8
                  }}
                >
                  <input
                    type="text"
                    placeholder="Add note..."
                    style={{
                      flexGrow: 1,
                      flexShrink: 1,
                      flexBasis: 0,
                      padding: isMobile ? '6px 8px' : '6px 10px',
                      fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px',
                      border: '1px solid #E2E8F0',
                      borderRadius: 6,
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                      minWidth: 0
                    }}
                  />
                  <button
                    style={{
                      padding: isMobile ? '6px 10px' : '6px 12px',
                      fontSize: isMobile ? 'clamp(9px, 2vw, 11px)' : '11px',
                      fontWeight: 500,
                      color: '#FFFFFF',
                      backgroundColor: '#1E3A5F',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  marginTop: isMobile ? 16 : 20,
                  paddingTop: isMobile ? 16 : 20,
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? 8 : 8
                }}
              >
                <button
                  style={{
                    width: '100%',
                    padding: isMobile ? '10px 14px' : '10px 16px',
                    fontSize: isMobile ? 'clamp(12px, 3vw, 13px)' : '13px',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#1E3A5F',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  {React.createElement(iconMap[selectedPropertyData.actionButtons.edit.icon], { style: { width: 16, height: 16, flexShrink: 0 } })}
                  {selectedPropertyData.actionButtons.edit.label}
                </button>
                <button
                  style={{
                    width: '100%',
                    padding: isMobile ? '10px 14px' : '10px 16px',
                    fontSize: isMobile ? 'clamp(12px, 3vw, 13px)' : '13px',
                    fontWeight: 500,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  {React.createElement(iconMap[selectedPropertyData.actionButtons.viewPublic.icon], { style: { width: 16, height: 16, flexShrink: 0 } })}
                  {selectedPropertyData.actionButtons.viewPublic.label}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

