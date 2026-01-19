import { CSSProperties, useState } from 'react';
import {
  Plus,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Globe,
  LayoutGrid,
  Clock,
  Percent,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  Copy,
  Edit
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Plus,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Globe,
  LayoutGrid,
  Clock,
  Percent,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  Copy,
  Edit
};

export default function CityCountyStateConfig() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  // Extract data from JSON
  const configData = adminData.cityCountyStateConfig;
  const header = configData.header;
  const overviewCards = configData.overviewCards;
  const leftSidebar = configData.leftSidebar;
  const countySelector = configData.countySelector;
  const redemptionRules = configData.redemptionRules;
  const barmentRules = configData.barmentRules;
  const localFees = configData.localFees;

  const [activeSidebarItem, setActiveSidebarItem] = useState<string>(
    leftSidebar.items.find((item: any) => item.active)?.id || 'overview'
  );
  const [interestMethod, setInterestMethod] = useState<string>(
    redemptionRules.fields.interestCalculationMethod.options.find((opt: any) => opt.selected)?.value || 'simple'
  );
  const [includeExpenses, setIncludeExpenses] = useState<boolean>(
    redemptionRules.fields.includeExpenses.enabled
  );
  const [includedCategories, setIncludedCategories] = useState<{ [key: string]: boolean }>(
    redemptionRules.fields.includedCategories.options.reduce((acc: any, opt: any) => {
      acc[opt.label] = opt.checked;
      return acc;
    }, {})
  );
  const [noticeRequired, setNoticeRequired] = useState<boolean>(
    barmentRules.fields.noticeRequired.enabled
  );

  const pageWrapperStyle: CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    width: '100%',
    maxWidth: '100vw',
    margin: 0,
    padding: 0,
    overflowX: 'hidden'
  };

  const cardStyle: CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E2E8F0',
    padding: isMobile ? 12 : isTablet ? 16 : 20,
    boxSizing: 'border-box'
  };

  const AddButtonIcon = iconMap[header.addButton.icon] || Plus;
  const CloneIcon = iconMap[countySelector.cloneButton.icon] || Copy;
  const AddFeeIcon = iconMap[localFees.addButton.icon] || Plus;

  return (
    <div style={pageWrapperStyle}>
      <AdminNav />

      <div
        style={{
          padding: isMobile ? '16px 12px' : isTablet ? '20px 20px' : '32px 48px',
          width: '100%',
          maxWidth: '100vw',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {/* Main Layout: 2 columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '240px 1fr',
            gap: isMobile ? 16 : isTablet ? 20 : 24,
            alignItems: 'start',
            width: '100%',
            minWidth: 0
          }}
        >
          {/* Left Sidebar */}
          <div style={{ 
            display: isMobileOrTablet ? 'none' : 'flex', 
            flexDirection: 'column', 
            gap: 8,
            minWidth: 0,
            width: '100%'
          }}>
            <div
              style={{
                fontSize: isMobile ? 10 : 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748B',
                marginBottom: 12,
                paddingLeft: 4
              }}
            >
              {leftSidebar.title}
            </div>
            {leftSidebar.items.map((item: any) => {
              const ItemIcon = iconMap[item.icon] || LayoutGrid;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSidebarItem(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? 8 : 10,
                    padding: isMobile ? '10px 12px' : '12px 16px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: activeSidebarItem === item.id ? '#2563EB' : 'transparent',
                    color: activeSidebarItem === item.id ? '#FFFFFF' : '#64748B',
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: activeSidebarItem === item.id ? 600 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <ItemIcon style={{ width: isMobile ? 16 : 18, height: isMobile ? 16 : 18, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 20 : 24, minWidth: 0, width: '100%' }}>
            {/* Header */}
            <div style={{ width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'flex-start',
                  marginBottom: isMobile ? 12 : 16,
                  gap: isMobile ? 12 : 0
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1
                    style={{
                      fontSize: isMobile ? 22 : isTablet ? 24 : 28,
                      fontWeight: 700,
                      color: '#0F172A',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 8,
                      marginLeft: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {header.title}
                  </h1>
                  <p
                    style={{
                      fontSize: isMobile ? 13 : 14,
                      color: '#64748B',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 0,
                      marginLeft: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {header.subtitle}
                  </p>
                </div>
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: isMobile ? '8px 16px' : '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: isMobile ? 'center' : 'flex-start',
                    boxSizing: 'border-box',
                    flexShrink: 0
                  }}
                >
                  <AddButtonIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap' }}>{header.addButton.label}</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: isMobile ? 16 : isTablet ? 20 : 24, width: '100%', minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                    flexWrap: 'wrap',
                    gap: 4
                  }}
                >
                  <span
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: 500,
                      color: '#64748B'
                    }}
                  >
                    {header.completeness.label}
                  </span>
                  <span
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: 600,
                      color: '#0F172A'
                    }}
                  >
                    {header.completeness.percentage}%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: isMobile ? 6 : 8,
                    borderRadius: 4,
                    backgroundColor: '#E2E8F0',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${header.completeness.percentage}%`,
                      height: '100%',
                      backgroundColor: header.completeness.color,
                      transition: 'width 0.3s'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Overview Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: isMobile ? 12 : isTablet ? 14 : 16,
                width: '100%',
                minWidth: 0
              }}
            >
              {overviewCards.map((card: any, idx: number) => {
                const CardIcon = iconMap[card.icon] || Layers;
                const SubIcon = card.subIcon ? iconMap[card.subIcon] : null;
                return (
                  <div
                    key={idx}
                    style={{
                      ...cardStyle,
                      backgroundColor: card.bg,
                      border: `1px solid ${card.color}20`,
                      padding: isMobile ? 12 : isTablet ? 16 : 20,
                      width: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 12, marginBottom: isMobile ? 10 : 12 }}>
                      <div
                        style={{
                          width: isMobile ? 36 : isTablet ? 38 : 40,
                          height: isMobile ? 36 : isTablet ? 38 : 40,
                          borderRadius: 10,
                          backgroundColor: card.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          position: 'relative',
                          flexShrink: 0
                        }}
                      >
                        <CardIcon style={{ width: isMobile ? 18 : isTablet ? 19 : 20, height: isMobile ? 18 : isTablet ? 19 : 20 }} />
                        {SubIcon && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: -4,
                              right: -4,
                              width: isMobile ? 16 : 18,
                              height: isMobile ? 16 : 18,
                              borderRadius: '50%',
                              backgroundColor: SubIcon === CheckCircle2 ? '#10B981' : card.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid #FFFFFF'
                            }}
                          >
                            <SubIcon style={{ width: isMobile ? 9 : 10, height: isMobile ? 9 : 10, color: '#FFFFFF' }} />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: isMobile ? 10 : 11,
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
                            fontSize: isMobile ? 20 : isTablet ? 22 : 24,
                            fontWeight: 700,
                            color: card.color
                          }}
                        >
                          {card.value}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* County Selector */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  marginBottom: isMobile ? 12 : 16,
                  gap: isMobile ? 12 : 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 12, flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: isMobile ? 40 : isTablet ? 44 : 48,
                      height: isMobile ? 40 : isTablet ? 44 : 48,
                      borderRadius: '50%',
                      backgroundColor: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? 12 : isTablet ? 13 : 14,
                      fontWeight: 600,
                      color: '#0F172A',
                      flexShrink: 0
                    }}
                  >
                    {countySelector.selectedCounty.state}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: isMobile ? 14 : isTablet ? 15 : 16,
                        fontWeight: 600,
                        color: '#0F172A',
                        marginBottom: 4,
                        wordBreak: 'break-word'
                      }}
                    >
                      {countySelector.selectedCounty.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: isMobile ? 10 : 11,
                          fontWeight: 500,
                          backgroundColor: countySelector.selectedCounty.statusBg,
                          color: countySelector.selectedCounty.statusColor,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {countySelector.selectedCounty.status}
                      </span>
                      <span
                        style={{
                          fontSize: isMobile ? 11 : 12,
                          color: '#64748B',
                          wordBreak: 'break-word'
                        }}
                      >
                        Last updated: {countySelector.selectedCounty.lastUpdated}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: isMobile ? 8 : 12, alignItems: 'center', width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
                  <select
                    style={{
                      padding: isMobile ? '8px 10px' : '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      color: '#0F172A',
                      cursor: 'pointer',
                      minWidth: isMobile ? '100%' : 200,
                      width: isMobile ? '100%' : 'auto',
                      boxSizing: 'border-box'
                    }}
                    defaultValue={countySelector.selectedCounty.name}
                  >
                    <option>{countySelector.selectedCounty.name}</option>
                  </select>
                  <button
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: isMobile ? '8px 14px' : '8px 16px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: isMobile ? 'center' : 'flex-start',
                      boxSizing: 'border-box'
                    }}
                  >
                    <CloneIcon style={{ width: isMobile ? 12 : 14, height: isMobile ? 12 : 14, flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap' }}>{countySelector.cloneButton.label}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Redemption Rules */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'flex-start',
                  marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
                  gap: isMobile ? 12 : 0
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2
                    style={{
                      fontSize: isMobile ? 16 : isTablet ? 17 : 18,
                      fontWeight: 600,
                      color: '#0F172A',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 4,
                      marginLeft: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {redemptionRules.title}
                  </h2>
                  <p
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      color: '#64748B',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 0,
                      marginLeft: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {redemptionRules.subtitle}
                  </p>
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: isMobile ? 10 : 11,
                    fontWeight: 500,
                    backgroundColor: redemptionRules.status.bg,
                    color: redemptionRules.status.color,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {redemptionRules.status.label}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 18 : 20, width: '100%', minWidth: 0 }}>
                {/* Statutory Interest Rate */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 6,
                      wordBreak: 'break-word'
                    }}
                  >
                    {redemptionRules.fields.statutoryInterestRate.label}
                  </label>
                  <p
                    style={{
                      fontSize: isMobile ? 11 : 12,
                      color: '#64748B',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 8,
                      marginLeft: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {redemptionRules.fields.statutoryInterestRate.description}
                  </p>
                  <input
                    type="text"
                    defaultValue={redemptionRules.fields.statutoryInterestRate.value}
                    style={{
                      width: '100%',
                      maxWidth: isMobile ? '100%' : 200,
                      padding: isMobile ? '8px 12px' : '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      color: '#0F172A',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Interest Calculation Method */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 12,
                      wordBreak: 'break-word'
                    }}
                  >
                    {redemptionRules.fields.interestCalculationMethod.label}
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 10 }}>
                    {redemptionRules.fields.interestCalculationMethod.options.map((option: any) => (
                      <label
                        key={option.value}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: isMobile ? 8 : 10,
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="radio"
                          name="interestMethod"
                          value={option.value}
                          checked={interestMethod === option.value}
                          onChange={(e) => setInterestMethod(e.target.value)}
                          style={{
                            width: isMobile ? 16 : 18,
                            height: isMobile ? 16 : 18,
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        />
                        <span
                          style={{
                            fontSize: isMobile ? 13 : 14,
                            color: '#0F172A',
                            wordBreak: 'break-word'
                          }}
                        >
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Redemption Period */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 6,
                      wordBreak: 'break-word'
                    }}
                  >
                    {redemptionRules.fields.redemptionPeriod.label}
                  </label>
                  <p
                    style={{
                      fontSize: isMobile ? 11 : 12,
                      color: '#64748B',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 8,
                      marginLeft: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {redemptionRules.fields.redemptionPeriod.description}
                  </p>
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 8 : 12, width: '100%' }}>
                    <input
                      type="text"
                      defaultValue={redemptionRules.fields.redemptionPeriod.value}
                      style={{
                        width: isMobile ? '100%' : 'auto',
                        maxWidth: isMobile ? '100%' : 200,
                        padding: isMobile ? '8px 12px' : '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        fontSize: isMobile ? 13 : 14,
                        color: '#0F172A',
                        boxSizing: 'border-box'
                      }}
                    />
                    <span
                      style={{
                        fontSize: isMobile ? 12 : 13,
                        color: '#64748B',
                        whiteSpace: isMobile ? 'normal' : 'nowrap'
                      }}
                    >
                      {redemptionRules.fields.redemptionPeriod.fromLabel}
                    </span>
                    <input
                      type="text"
                      defaultValue={redemptionRules.fields.redemptionPeriod.auctionDate}
                      style={{
                        width: isMobile ? '100%' : 'auto',
                        maxWidth: isMobile ? '100%' : 120,
                        padding: isMobile ? '8px 12px' : '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        fontSize: isMobile ? 13 : 14,
                        color: '#0F172A',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Include Expenses */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: isMobile ? 12 : 16,
                      gap: 12
                    }}
                  >
                    <label
                      style={{
                        fontSize: isMobile ? 13 : 14,
                        fontWeight: 500,
                        color: '#0F172A',
                        cursor: 'pointer',
                        flex: 1,
                        minWidth: 0,
                        wordBreak: 'break-word'
                      }}
                    >
                      {redemptionRules.fields.includeExpenses.label}
                    </label>
                    <button
                      onClick={() => setIncludeExpenses(!includeExpenses)}
                      style={{
                        width: isMobile ? 40 : 44,
                        height: isMobile ? 22 : 24,
                        borderRadius: 12,
                        border: 'none',
                        backgroundColor: includeExpenses ? '#2563EB' : '#E2E8F0',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        padding: 0,
                        flexShrink: 0
                      }}
                    >
                      <div
                        style={{
                          width: isMobile ? 18 : 20,
                          height: isMobile ? 18 : 20,
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          position: 'absolute',
                          top: 2,
                          left: includeExpenses ? (isMobile ? 20 : 22) : 2,
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      />
                    </button>
                  </div>

                  {/* Included Categories */}
                  <div style={{ width: '100%', minWidth: 0 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: isMobile ? 12 : 13,
                        fontWeight: 500,
                        color: '#64748B',
                        marginBottom: 12,
                        wordBreak: 'break-word'
                      }}
                    >
                      {redemptionRules.fields.includedCategories.label}
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 10 }}>
                      {redemptionRules.fields.includedCategories.options.map((option: any) => (
                        <label
                          key={option.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? 8 : 10,
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={includedCategories[option.label]}
                            onChange={(e) =>
                              setIncludedCategories((prev) => ({
                                ...prev,
                                [option.label]: e.target.checked
                              }))
                            }
                            style={{
                              width: isMobile ? 16 : 18,
                              height: isMobile ? 16 : 18,
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                          />
                          <span
                            style={{
                              fontSize: isMobile ? 13 : 14,
                              color: '#0F172A',
                              wordBreak: 'break-word'
                            }}
                          >
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 12, justifyContent: 'flex-end', marginTop: 8, width: '100%' }}>
                  <button
                    style={{
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      boxSizing: 'border-box'
                    }}
                  >
                    {redemptionRules.actions.cancel}
                  </button>
                  <button
                    style={{
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      boxSizing: 'border-box'
                    }}
                  >
                    {redemptionRules.actions.save}
                  </button>
                </div>
              </div>
            </div>

            {/* Barment Rules */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'flex-start',
                  marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
                  gap: isMobile ? 12 : 0
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2
                    style={{
                      fontSize: isMobile ? 16 : isTablet ? 17 : 18,
                      fontWeight: 600,
                      color: '#0F172A',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 4,
                      marginLeft: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {barmentRules.title}
                  </h2>
                  <p
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      color: '#64748B',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 0,
                      marginLeft: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {barmentRules.subtitle}
                  </p>
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: isMobile ? 10 : 11,
                    fontWeight: 500,
                    backgroundColor: barmentRules.status.bg,
                    color: barmentRules.status.color,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {barmentRules.status.label}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 18 : 20, width: '100%', minWidth: 0 }}>
                {/* Barment Period */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 8,
                      wordBreak: 'break-word'
                    }}
                  >
                    {barmentRules.fields.barmentPeriod.label}
                  </label>
                  <input
                    type="text"
                    placeholder={barmentRules.fields.barmentPeriod.placeholder}
                    defaultValue={barmentRules.fields.barmentPeriod.value}
                    style={{
                      width: '100%',
                      maxWidth: isMobile ? '100%' : 200,
                      padding: isMobile ? '8px 12px' : '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      color: '#0F172A',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Send-By Deadline */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 8,
                      wordBreak: 'break-word'
                    }}
                  >
                    {barmentRules.fields.sendByDeadline.label}
                  </label>
                  <input
                    type="text"
                    defaultValue={barmentRules.fields.sendByDeadline.value}
                    style={{
                      width: '100%',
                      maxWidth: isMobile ? '100%' : 200,
                      padding: isMobile ? '8px 12px' : '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      color: '#0F172A',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Notice Required */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12
                    }}
                  >
                    <label
                      style={{
                        fontSize: isMobile ? 13 : 14,
                        fontWeight: 500,
                        color: '#0F172A',
                        cursor: 'pointer',
                        flex: 1,
                        minWidth: 0,
                        wordBreak: 'break-word'
                      }}
                    >
                      {barmentRules.fields.noticeRequired.label}
                    </label>
                    <button
                      onClick={() => setNoticeRequired(!noticeRequired)}
                      style={{
                        width: isMobile ? 40 : 44,
                        height: isMobile ? 22 : 24,
                        borderRadius: 12,
                        border: 'none',
                        backgroundColor: noticeRequired ? '#2563EB' : '#E2E8F0',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        padding: 0,
                        flexShrink: 0
                      }}
                    >
                      <div
                        style={{
                          width: isMobile ? 18 : 20,
                          height: isMobile ? 18 : 20,
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          position: 'absolute',
                          top: 2,
                          left: noticeRequired ? (isMobile ? 20 : 22) : 2,
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Statutory Template */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 8,
                      wordBreak: 'break-word'
                    }}
                  >
                    {barmentRules.fields.statutoryTemplate.label}
                  </label>
                  <select
                    style={{
                      width: '100%',
                      maxWidth: isMobile ? '100%' : 300,
                      padding: isMobile ? '8px 12px' : '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      color: '#64748B',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      {barmentRules.fields.statutoryTemplate.placeholder}
                    </option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 12, justifyContent: 'flex-end', marginTop: 8, width: '100%' }}>
                  <button
                    style={{
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      boxSizing: 'border-box'
                    }}
                  >
                    {barmentRules.actions.cancel}
                  </button>
                  <button
                    style={{
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      boxSizing: 'border-box'
                    }}
                  >
                    {barmentRules.actions.save}
                  </button>
                </div>
              </div>
            </div>

            {/* Local Fees */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'flex-start',
                  marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
                  gap: isMobile ? 12 : 0
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2
                    style={{
                      fontSize: isMobile ? 16 : isTablet ? 17 : 18,
                      fontWeight: 600,
                      color: '#0F172A',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 4,
                      marginLeft: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {localFees.title}
                  </h2>
                  <p
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      color: '#64748B',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 0,
                      marginLeft: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {localFees.subtitle}
                  </p>
                </div>
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: isMobile ? '8px 16px' : '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: isMobile ? 'center' : 'flex-start',
                    boxSizing: 'border-box',
                    flexShrink: 0
                  }}
                >
                  <AddFeeIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap' }}>{localFees.addButton.label}</span>
                </button>
              </div>

              {/* Fees Table */}
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 12 : 13, minWidth: isMobileOrTablet ? 600 : 'auto' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      {localFees.table.headers.map((header: string) => (
                        <th
                          key={header}
                          style={{
                            padding: isMobile ? '10px 12px' : '12px 16px',
                            textAlign: 'left',
                            fontSize: isMobile ? 10 : 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: '#64748B',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {localFees.table.rows.map((row: any) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#0F172A', fontWeight: 500, wordBreak: 'break-word' }}>
                          {row.feeType}
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#0F172A', whiteSpace: 'nowrap' }}>{row.amount}</td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>{row.category}</td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>
                          {row.effectiveDate}
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                          <button
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: isMobile ? '5px 10px' : '6px 12px',
                              borderRadius: 6,
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#FFFFFF',
                              color: '#64748B',
                              fontSize: isMobile ? 11 : 12,
                              fontWeight: 500,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Edit style={{ width: isMobile ? 12 : 14, height: isMobile ? 12 : 14, flexShrink: 0 }} />
                            {row.action}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

