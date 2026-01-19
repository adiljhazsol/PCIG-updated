import { CSSProperties, useRef, useState } from 'react';
import { Edit3, Trash2, ToggleRight } from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import adminData from '../../data/admin.json';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

export default function SettingsAdmin() {
  const settings = (adminData as any).settingsAdmin;

  const sidebar = settings.sidebar;
  const countyState = settings.countyState;
  const interestModels = settings.interestModels;
  const workflowConfig = settings.workflowConfig;
  const templatesLibrary = settings.templatesLibrary;
  const apiIntegrations = settings.apiIntegrations;
  const systemSettings = settings.systemSettings;

  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  const [activeItem, setActiveItem] = useState<string>(sidebar.activeItem);

  const countyRef = useRef<HTMLDivElement | null>(null);
  const interestRef = useRef<HTMLDivElement | null>(null);
  const workflowRef = useRef<HTMLDivElement | null>(null);
  const templatesRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<HTMLDivElement | null>(null);
  const systemRef = useRef<HTMLDivElement | null>(null);

  const scrollToSection = (item: string) => {
    setActiveItem(item);

    const refMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      'County/State Config': countyRef,
      'Interest Rates & Models': interestRef,
      'Workflow Configuration': workflowRef,
      'Templates Library': templatesRef,
      'API Integrations': apiRef,
      'Share & Allocations': templatesRef,
      'Depreciation Settings': systemRef,
      'System Settings': systemRef
    };

    const ref = refMap[item];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

  const mainContainerStyle: CSSProperties = {
    padding: isMobile ? '20px 16px' : isTablet ? '24px 24px' : '32px 48px',
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    boxSizing: 'border-box'
  };

  const cardStyle: CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E2E8F0',
    padding: 20,
    boxSizing: 'border-box'
  };

  return (
    <div style={pageWrapperStyle}>
      <AdminNav />

      <div style={mainContainerStyle}>
        {/* Main layout: sidebar + content */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '260px 1fr',
            gap: isMobileOrTablet ? 16 : 24,
            alignItems: 'flex-start',
            boxSizing: 'border-box'
          }}
        >
          {/* Left sidebar */}
          {!isMobileOrTablet && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 16,
                position: 'sticky',
                top: 24,
                alignSelf: 'flex-start'
              }}
            >
              {sidebar.sections.map((section: any) => (
                <div key={section.title} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#94A3B8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: 8
                    }}
                  >
                    {section.title}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {section.items.map((item: string) => {
                      const isActive = item === activeItem;
                      return (
                        <button
                          key={item}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 10px',
                            borderRadius: 8,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#1E3A5F' : '#64748B',
                            backgroundColor: isActive ? '#EFF6FF' : 'transparent'
                          }}
                          onClick={() => scrollToSection(item)}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Right content column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobileOrTablet ? 16 : 24,
              height: '100%',
              overflowY: isMobileOrTablet ? 'visible' : 'auto',
              paddingRight: isMobileOrTablet ? 0 : 4,
              minWidth: 0,
              boxSizing: 'border-box'
            }}
          >
            {/* County / State Configuration */}
            <div ref={countyRef} style={cardStyle}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#0F172A',
                      marginBottom: 4
                    }}
                  >
                    {countyState.header.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#64748B'
                    }}
                  >
                    {countyState.header.subtitle}
                  </div>
                </div>
                <button
                  style={{
                    padding: '9px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#1E3A5F',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  + {countyState.addButton}
                </button>
              </div>

              {/* County table */}
              <div
                style={{
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  marginTop: 8,
                  marginBottom: 16
                }}
              >
                <div
                  style={{
                    width: '100%',
                    overflowX: isMobileOrTablet ? 'auto' : 'visible',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 13,
                      minWidth: isMobileOrTablet ? 600 : undefined
                    }}
                  >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB'
                      }}
                    >
                      {countyState.tableHeaders.map((h: string) => (
                        <th
                          key={h}
                          style={{
                            padding: '10px 14px',
                            textAlign: 'left',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: '#64748B',
                            fontWeight: 600
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {countyState.rows.map((row: any, idx: number) => (
                      <tr
                        key={row.id}
                        style={{
                          borderBottom:
                            idx === countyState.rows.length - 1
                              ? 'none'
                              : '1px solid #E5E7EB',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        <td style={{ padding: '10px 14px' }}>{row.county}</td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>{row.state}</td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>
                          {row.redemptionRate}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>
                          {row.barmentPeriod}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 10px',
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 500,
                              backgroundColor: row.status.bg,
                              color: row.status.color
                            }}
                          >
                            {row.status.label}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 6,
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit3 style={{ width: 14, height: 14, color: '#64748B' }} />
                            </button>
                            <button
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 6,
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 style={{ width: 14, height: 14, color: '#64748B' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>

              {/* Edit configuration panel */}
              <div
                style={{
                  marginTop: 8,
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F9FAFB',
                  padding: 20
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0F172A'
                    }}
                  >
                    {countyState.editPanel.title}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: '#64748B'
                    }}
                  >
                    <span>{countyState.editPanel.toggleLabel}</span>
                    <ToggleRight style={{ width: 32, height: 32, color: '#15803D' }} />
                  </div>
                </div>

                {/* 2-column form layout */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1.2fr',
                    gap: 16,
                    marginBottom: 16
                  }}
                >
                  {/* Redemption rate */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#475569',
                        marginBottom: 4
                      }}
                    >
                      {countyState.editPanel.fields.redemptionInterestRate.label}
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          padding: '9px 10px',
                          fontSize: 13,
                          color: '#0F172A',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        {countyState.editPanel.fields.redemptionInterestRate.value}
                      </div>
                      <div
                        style={{
                          padding: '9px 12px',
                          fontSize: 12,
                          color: '#64748B',
                          backgroundColor: '#F9FAFB',
                          borderLeft: '1px solid #E2E8F0'
                        }}
                      >
                        {countyState.editPanel.fields.redemptionInterestRate.suffix}
                      </div>
                    </div>
                  </div>

                  {/* Calculation method */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#475569',
                        marginBottom: 4
                      }}
                    >
                      {countyState.editPanel.fields.calculationMethod.label}
                    </label>
                    <div
                      style={{
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        padding: '9px 10px',
                        fontSize: 13,
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      {countyState.editPanel.fields.calculationMethod.options[0]}
                    </div>
                  </div>

                  {/* Barment period */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#475569',
                        marginBottom: 4
                      }}
                    >
                      {countyState.editPanel.fields.barmentPeriod.label}
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          padding: '9px 10px',
                          fontSize: 13,
                          color: '#0F172A',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        {countyState.editPanel.fields.barmentPeriod.value}
                      </div>
                      <div
                        style={{
                          padding: '9px 12px',
                          fontSize: 12,
                          color: '#64748B',
                          backgroundColor: '#F9FAFB',
                          borderLeft: '1px solid #E2E8F0'
                        }}
                      >
                        {countyState.editPanel.fields.barmentPeriod.suffix}
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                        color: '#94A3B8'
                      }}
                    >
                      Statutory penalty/interest rate per annum.
                    </div>
                  </div>

                  {/* Barment notice timing */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#475569',
                        marginBottom: 4
                      }}
                    >
                      {countyState.editPanel.fields.barmentNotice.label}
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          padding: '9px 10px',
                          fontSize: 13,
                          color: '#0F172A',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        {countyState.editPanel.fields.barmentNotice.value}
                      </div>
                      <div
                        style={{
                          padding: '9px 12px',
                          fontSize: 12,
                          color: '#64748B',
                          backgroundColor: '#F9FAFB',
                          borderLeft: '1px solid #E2E8F0'
                        }}
                      >
                        {countyState.editPanel.fields.barmentNotice.suffix}
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                        color: '#94A3B8'
                      }}
                    >
                      Days notice required before barment filing.
                    </div>
                  </div>

                  {/* QT deadline */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#475569',
                        marginBottom: 4
                      }}
                    >
                      {countyState.editPanel.fields.quietTitleDeadline.label}
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          padding: '9px 10px',
                          fontSize: 13,
                          color: '#0F172A',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        {countyState.editPanel.fields.quietTitleDeadline.value}
                      </div>
                      <div
                        style={{
                          padding: '9px 12px',
                          fontSize: 12,
                          color: '#64748B',
                          backgroundColor: '#F9FAFB',
                          borderLeft: '1px solid #E2E8F0'
                        }}
                      >
                        {countyState.editPanel.fields.quietTitleDeadline.suffix}
                      </div>
                    </div>
                  </div>

                  {/* Default attorney */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#475569',
                        marginBottom: 4
                      }}
                    >
                      {countyState.editPanel.fields.defaultAttorney.label}
                    </label>
                    <div
                      style={{
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        padding: '9px 10px',
                        fontSize: 13,
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      {countyState.editPanel.fields.defaultAttorney.value}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 10
                  }}
                >
                  <button
                    style={{
                      padding: '9px 14px',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#64748B',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {countyState.editPanel.actions.cancel}
                  </button>
                  <button
                    style={{
                      padding: '9px 18px',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#FFFFFF',
                      backgroundColor: '#1E3A5F',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {countyState.editPanel.actions.save}
                  </button>
                </div>
              </div>
            </div>

            {/* Interest Rates & Models */}
            <div ref={interestRef} style={cardStyle}>
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: 4
                  }}
                >
                  {interestModels.header.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#64748B'
                  }}
                >
                  {interestModels.header.subtitle}
                </div>
              </div>

              {/* Method row */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#475569',
                    marginBottom: 6
                  }}
                >
                  {interestModels.methodLabel}
                </div>
                <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                  {interestModels.methods.map((method: string, idx: number) => (
                    <div key={method} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          border: idx === 0 ? '4px solid #2563EB' : '1px solid #CBD5F5',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box'
                        }}
                      />
                      <span
                        style={{
                          fontWeight: idx === 0 ? 600 : 500,
                          color: idx === 0 ? '#0F172A' : '#64748B'
                        }}
                      >
                        {method}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1.2fr',
                  gap: 16,
                  marginBottom: 16
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 4
                    }}
                  >
                    {interestModels.globalRate.label}
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        padding: '9px 10px',
                        fontSize: 13,
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      {interestModels.globalRate.value}
                    </div>
                    <div
                      style={{
                        padding: '9px 12px',
                        fontSize: 12,
                        color: '#64748B',
                        backgroundColor: '#F9FAFB',
                        borderLeft: '1px solid #E2E8F0'
                      }}
                    >
                      {interestModels.globalRate.suffix}
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 4
                    }}
                  >
                    {interestModels.accrualBasis.label}
                  </label>
                  <div
                    style={{
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      padding: '9px 10px',
                      fontSize: 13,
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {interestModels.accrualBasis.value}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  style={{
                    padding: '9px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#1E3A5F',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {interestModels.saveButton}
                </button>
              </div>
            </div>

            {/* Workflow Configuration */}
            <div ref={workflowRef} style={cardStyle}>
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: 4
                  }}
                >
                  {workflowConfig.header.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#64748B'
                  }}
                >
                  {workflowConfig.header.subtitle}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  padding: 16,
                  backgroundColor: '#F9FAFB',
                  marginBottom: 8
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
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0F172A'
                    }}
                  >
                    {workflowConfig.fifaStages.title}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      style={{
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer'
                      }}
                    >
                      {workflowConfig.fifaStages.addStageButton}
                    </button>
                    <button
                      style={{
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#FFFFFF',
                        backgroundColor: '#1E3A5F',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {workflowConfig.fifaStages.startButton}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 8,
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  {workflowConfig.fifaStages.stages.map((stage: string, idx: number) => (
                    <div
                      key={stage}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderBottom:
                          idx === workflowConfig.fifaStages.stages.length - 1
                            ? 'none'
                            : '1px solid #E5E7EB'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 2,
                            border: '1px solid #CDD4E0',
                            backgroundColor: '#F9FAFB'
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            color: '#0F172A'
                          }}
                        >
                          {stage}
                        </span>
                      </div>
                      {idx === 2 && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: '#15803D',
                            backgroundColor: '#F0FDF4',
                            borderRadius: 999,
                            padding: '3px 9px'
                          }}
                        >
                          {workflowConfig.fifaStages.autoTriggerLabel}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Templates Library */}
            <div ref={templatesRef} style={cardStyle}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#0F172A',
                      marginBottom: 4
                    }}
                  >
                    {templatesLibrary.header.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#64748B'
                    }}
                  >
                    {templatesLibrary.header.subtitle}
                  </div>
                </div>
                <button
                  style={{
                    padding: '9px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#1E3A5F',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {templatesLibrary.createButton}
                </button>
              </div>

              {/* Tabs row */}
              <div
                style={{
                  display: 'inline-flex',
                  borderRadius: 999,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F9FAFB',
                  marginBottom: 12,
                  overflow: 'hidden'
                }}
              >
                {templatesLibrary.tabs.map((tab: string, idx: number) => (
                  <button
                    key={tab}
                    style={{
                      padding: '7px 14px',
                      fontSize: 12,
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: idx === 0 ? '#FFFFFF' : 'transparent',
                      color: idx === 0 ? '#1E3A5F' : '#64748B'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Templates table */}
              <div
                style={{
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    overflowX: isMobileOrTablet ? 'auto' : 'visible',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 13,
                      minWidth: isMobileOrTablet ? 600 : undefined
                    }}
                  >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB'
                      }}
                    >
                      {templatesLibrary.tableHeaders.map((h: string) => (
                        <th
                          key={h}
                          style={{
                            padding: '10px 14px',
                            textAlign: 'left',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: '#64748B',
                            fontWeight: 600
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {templatesLibrary.rows.map((row: any, idx: number) => (
                      <tr
                        key={row.id}
                        style={{
                          borderBottom:
                            idx === templatesLibrary.rows.length - 1
                              ? 'none'
                              : '1px solid #E5E7EB',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        <td style={{ padding: '10px 14px', color: '#0F172A' }}>{row.name}</td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>{row.type}</td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>{row.county}</td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>{row.updated}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 6,
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit3 style={{ width: 14, height: 14, color: '#64748B' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>

            {/* API Integrations */}
            <div ref={apiRef} style={cardStyle}>
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: 4
                  }}
                >
                  {apiIntegrations.header.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#64748B'
                  }}
                >
                  {apiIntegrations.header.subtitle}
                </div>
              </div>

              {apiIntegrations.providers.map((provider: any) => (
                <div
                  key={provider.id}
                  style={{
                    borderRadius: 10,
                    border: '1px solid #E2E8F0',
                    padding: 16,
                    marginBottom: 12,
                    backgroundColor: '#F9FAFB'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#0F172A',
                          marginBottom: 2
                        }}
                      >
                        {provider.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#64748B'
                        }}
                      >
                        {provider.description}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        padding: '4px 10px',
                        borderRadius: 999,
                        backgroundColor: provider.statusBg,
                        color: provider.statusColor
                      }}
                    >
                      {provider.statusLabel}
                    </span>
                  </div>

                  {provider.id === 'letterstream' && (
                    <>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1.2fr',
                          gap: 12,
                          marginBottom: 12
                        }}
                      >
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: 12,
                              fontWeight: 500,
                              color: '#475569',
                              marginBottom: 4
                            }}
                          >
                            {provider.apiKeyLabel}
                          </label>
                          <div
                            style={{
                              borderRadius: 8,
                              border: '1px solid #E2E8F0',
                              padding: '9px 10px',
                              fontSize: 13,
                              color: '#0F172A',
                              backgroundColor: '#FFFFFF'
                            }}
                          >
                            {provider.apiKeyValue}
                          </div>
                        </div>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: 12,
                              fontWeight: 500,
                              color: '#475569',
                              marginBottom: 4
                            }}
                          >
                            {provider.environmentLabel}
                          </label>
                          <div
                            style={{
                              borderRadius: 8,
                              border: '1px solid #E2E8F0',
                              padding: '9px 10px',
                              fontSize: 13,
                              color: '#0F172A',
                              backgroundColor: '#FFFFFF'
                            }}
                          >
                            {provider.environmentValue}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              marginTop: 8,
                              fontSize: 12,
                              color: '#475569'
                            }}
                          >
                            <span>{provider.enableLabel}</span>
                            <ToggleRight style={{ width: 28, height: 28, color: '#15803D' }} />
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 4
                        }}
                      >
                        <button
                          style={{
                            padding: '8px 12px',
                            fontSize: 12,
                            fontWeight: 500,
                            color: '#0F172A',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 8,
                            border: '1px solid #E2E8F0',
                            cursor: 'pointer'
                          }}
                        >
                          {provider.testButton}
                        </button>
                        <button
                          style={{
                            padding: '8px 14px',
                            fontSize: 12,
                            fontWeight: 500,
                            color: '#FFFFFF',
                            backgroundColor: '#1E3A5F',
                            borderRadius: 8,
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {provider.saveButton}
                        </button>
                      </div>
                    </>
                  )}

                  {provider.id === 'gscca' && (
                    <div
                      style={{
                        marginTop: 8,
                        display: 'flex',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <button
                        style={{
                          padding: '8px 14px',
                          fontSize: 12,
                          fontWeight: 500,
                          color: '#0F172A',
                          backgroundColor: '#FFFFFF',
                          borderRadius: 8,
                          border: '1px solid #E2E8F0',
                          cursor: 'pointer'
                        }}
                      >
                        {provider.configureButton}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* System Settings */}
            <div ref={systemRef} style={cardStyle}>
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginBottom: 4
                  }}
                >
                  {systemSettings.header.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#64748B'
                  }}
                >
                  {systemSettings.header.subtitle}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1.2fr',
                  gap: 16,
                  marginBottom: 16
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 4
                    }}
                  >
                    {systemSettings.fields.platformName.label}
                  </label>
                  <div
                    style={{
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      padding: '9px 10px',
                      fontSize: 13,
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {systemSettings.fields.platformName.value}
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 4
                    }}
                  >
                    {systemSettings.fields.supportEmail.label}
                  </label>
                  <div
                    style={{
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      padding: '9px 10px',
                      fontSize: 13,
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {systemSettings.fields.supportEmail.value}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 4
                    }}
                  >
                    {systemSettings.fields.timeZone.label}
                  </label>
                  <div
                    style={{
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      padding: '9px 10px',
                      fontSize: 13,
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {systemSettings.fields.timeZone.value}
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 4
                    }}
                  >
                    {systemSettings.fields.currency.label}
                  </label>
                  <div
                    style={{
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      padding: '9px 10px',
                      fontSize: 13,
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {systemSettings.fields.currency.value}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 4
                    }}
                  >
                    {systemSettings.fields.sessionTimeout.label}
                  </label>
                  <div
                    style={{
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      padding: '9px 10px',
                      fontSize: 13,
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {systemSettings.fields.sessionTimeout.value}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 4
                    }}
                  >
                    {systemSettings.twoFactor.label}
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      fontSize: 13,
                      color: '#334155'
                    }}
                  >
                    {systemSettings.twoFactor.options.map((opt: string, idx: number) => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="checkbox" defaultChecked={idx === 0} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  style={{
                    padding: '9px 18px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#1E3A5F',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {systemSettings.saveButton}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


