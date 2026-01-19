import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  FileText,
  Inbox,
  UploadCloud,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import AdminNav from '../../components/admin/AdminNav';
import adminData from '../../data/admin.json';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  UploadCloud,
  Inbox,
  FileText
};

export default function PropertiesWorkflowHub() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;
  const navigate = useNavigate();

  // State for Search and Filter
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStage, setFilterStage] = React.useState('All');

  // Extract data from JSON
  const workflowData = adminData.propertiesWorkflow;
  const header = workflowData.header;
  const workflowPath = workflowData.workflowPath;
  const lifecycleWorkflow = workflowData.lifecycleWorkflow;
  const stagePanels = workflowData.stagePanels;
  const stagePanelItems = workflowData.stagePanelItems;
  const exportsLettersUploads = workflowData.exportsLettersUploads;
  const propertiesTable = workflowData.propertiesTable;
  const actionItemsSummary = workflowData.actionItemsSummary;

  // NOTE: Layout is optimized for desktop; mobile/tablet will gracefully stack but
  // is not yet fully polished.

  return (
    <div
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        padding: 0,
        overflowX: 'hidden',
      }}
    >
      <AdminNav />

      {/* Main Content - desktop-focused, full width */}
      <div
        style={{
          padding: `clamp(16px, 2vh, 24px) clamp(16px, 4vw, 48px)`,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Page header */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobileOrTablet ? 'column' : 'row',
            alignItems: isMobileOrTablet ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            marginBottom: `clamp(16px, 2vh, 24px)`,
            gap: `clamp(12px, 2vh, 16px)`,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: `clamp(20px, 2.5vw, 28px)`,
                fontWeight: 700,
                color: '#0F172A',
                marginBottom: `clamp(4px, 0.5vh, 6px)`,
                lineHeight: 1.2,
              }}
            >
              {header.title}
            </h1>
            <p
              style={{
                fontSize: `clamp(11px, 1.2vw, 14px)`,
                color: '#64748B',
                lineHeight: 1.4,
              }}
            >
              {header.subtitle}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: `clamp(6px, 1vw, 8px)`,
              flexWrap: 'wrap',
              width: isMobileOrTablet ? '100%' : 'auto',
            }}
          >
            <button
              style={{
                fontSize: `clamp(11px, 1.2vw, 14px)`,
                color: '#64748B',
                backgroundColor: '#F1F5F9',
                padding: `clamp(6px, 1vh, 8px) clamp(12px, 1.5vw, 16px)`,
                borderRadius: `clamp(4px, 0.5vw, 6px)`,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              {isMobile ? 'View All' : 'View All Properties'}
            </button>
            <button
              style={{
                fontSize: `clamp(11px, 1.2vw, 14px)`,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                padding: `clamp(6px, 1vh, 8px) clamp(12px, 1.5vw, 16px)`,
                borderRadius: `clamp(4px, 0.5vw, 6px)`,
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(4px, 0.5vw, 6px)`,
                width: isMobile ? '100%' : 'auto',
              }}
            >
              <UploadCloud style={{ width: `clamp(12px, 1.2vw, 16px)`, height: `clamp(12px, 1.2vw, 16px)` }} />
              {isMobile ? 'Import FIFA' : 'Bulk Import FIFA'}
            </button>
            <button
              onClick={() => navigate('/admin/properties/add')}
              style={{
                fontSize: `clamp(11px, 1.2vw, 14px)`,
                color: '#FFFFFF',
                backgroundColor: '#1E3A5F',
                padding: `clamp(6px, 1vh, 8px) clamp(12px, 1.5vw, 16px)`,
                borderRadius: `clamp(4px, 0.5vw, 6px)`,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(4px, 0.5vw, 6px)`,
                width: isMobile ? '100%' : 'auto',
              }}
            >
              +
              {isMobile ? 'Add' : 'Add Property'}
            </button>
          </div>
        </div>

        {/* Property lifecycle workflow row */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: `clamp(6px, 0.8vw, 8px)`,
            border: '1px solid #E2E8F0',
            padding: `clamp(14px, 1.8vw, 20px)`,
            marginBottom: `clamp(12px, 2vw, 24px)`,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: `clamp(8px, 1.2vw, 12px)`,
              flexWrap: 'wrap',
              gap: `clamp(8px, 1vw, 12px)`,
            }}
          >
            <div
              style={{
                fontSize: `clamp(13px, 1.5vw, 15px)`,
                fontWeight: 600,
                color: '#0F172A',
                flexShrink: 0,
              }}
            >
              {lifecycleWorkflow.title}
            </div>
            <button
              style={{
                fontSize: `clamp(11px, 1.2vw, 13px)`,
                color: '#64748B',
                backgroundColor: '#F1F5F9',
                padding: `clamp(5px, 0.8vh, 6px) clamp(10px, 1.3vw, 12px)`,
                borderRadius: `clamp(4px, 0.5vw, 6px)`,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {lifecycleWorkflow.buttonText}
            </button>
          </div>
          <div
            style={{
              fontSize: `clamp(11px, 1.2vw, 13px)`,
              color: '#64748B',
              marginBottom: `clamp(12px, 1.5vw, 16px)`,
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: `clamp(2px, 0.3vw, 4px)`,
              overflowX: isMobile ? 'auto' : 'visible',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {workflowPath.map((stage, idx) => (
              <React.Fragment key={idx}>
                <span>{stage}</span>
                {idx < workflowPath.length - 1 && (
                  <ChevronRight size={10} style={{ margin: '0 4px' }} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobileOrTablet ? `clamp(12px, 2vw, 16px)` : `clamp(16px, 3vw, 28px)`,
              overflowX: isMobileOrTablet ? 'auto' : 'hidden',
              overflowY: 'hidden',
              paddingBottom: `clamp(6px, 1vh, 8px)`,
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: isMobile ? 'thin' : 'auto',
            }}
          >
            {lifecycleWorkflow.stages.map((stage) => (
              <div
                key={stage.label}
                style={{
                  backgroundColor: stage.bg,
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  border: '1px solid #E2E8F0',
                  padding: `clamp(10px, 1.3vw, 14px)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: `clamp(5px, 0.8vh, 7px)`,
                  minWidth: isMobileOrTablet ? `clamp(140px, 40vw, 180px)` : `clamp(130px, 16vw, 180px)`,
                  flex: isMobileOrTablet ? '0 0 auto' : '1 1 0',
                  flexShrink: 0,
                  textAlign: 'center',
                  maxWidth: isMobileOrTablet ? 'none' : '100%',
                }}
              >
                <div
                  style={{
                    fontSize: `clamp(13px, 1.5vw, 15px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                  }}
                >
                  {stage.label}
                </div>
                <div
                  style={{
                    fontSize: `clamp(12px, 1.3vw, 14px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                  }}
                >
                  {stage.value}
                </div>
                <div
                  style={{
                    fontSize: `clamp(10px, 1.1vw, 12px)`,
                    color: stage.statusColor,
                    fontWeight: 500,
                  }}
                >
                  {stage.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage panels grid (2 columns) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            gap: `clamp(12px, 2vw, 24px)`,
            marginBottom: `clamp(12px, 2vw, 24px)`,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Stage Panels */}
          {stagePanels.map((stagePanel) => {
            // Calculate dynamic count based on actual table rows
            const dynamicCount = propertiesTable.rows.filter(r => r.stage === stagePanel.name).length;
            return (
              <div
                key={stagePanel.name}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  border: '1px solid #E2E8F0',
                  padding: `clamp(14px, 1.8vw, 20px)`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `clamp(10px, 1.5vw, 12px)`,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: `clamp(10px, 1.1vw, 11px)`,
                        color: '#64748B',
                        marginBottom: `clamp(2px, 0.3vh, 3px)`,
                        lineHeight: 1.3,
                      }}
                    >
                      {dynamicCount} items
                    </div>
                    <div
                      style={{
                        fontSize: `clamp(12px, 1.3vw, 13px)`,
                        fontWeight: 600,
                        color: '#16A34A',
                        lineHeight: 1.3,
                        wordBreak: 'break-word',
                      }}
                    >
                      {stagePanel.name}
                    </div>
                  </div>
                  <Search
                    style={{
                      width: `clamp(14px, 1.5vw, 16px)`,
                      height: `clamp(14px, 1.5vw, 16px)`,
                      color: '#94A3B8',
                      flexShrink: 0,
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `clamp(2px, 0.3vh, 3px)`,
                    fontSize: `clamp(10px, 1.1vw, 11px)`,
                    color: '#64748B',
                  }}
                >
                  {stagePanelItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: `clamp(8px, 1vw, 12px)`,
                        alignItems: 'center',
                        padding: `clamp(6px, 0.8vh, 8px) clamp(8px, 1vw, 10px)`,
                        borderRadius: `clamp(3px, 0.4vw, 4px)`,
                        backgroundColor: idx % 2 === 0 ? '#F8FAFC' : 'transparent',
                        lineHeight: 1.3,
                      }}
                    >
                      <div style={{ minWidth: 0, wordBreak: 'break-word' }}>{item.label}</div>
                      <div style={{ textAlign: 'right', fontWeight: 500, flexShrink: 0 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <button
                  style={{
                    marginTop: `clamp(6px, 1vh, 8px)`,
                    width: '100%',
                    backgroundColor: '#1E3A5F',
                    color: '#FFFFFF',
                    borderRadius: `clamp(4px, 0.5vw, 6px)`,
                    padding: `clamp(8px, 1.2vh, 10px) clamp(12px, 1.5vw, 16px)`,
                    border: 'none',
                    fontSize: `clamp(11px, 1.2vw, 13px)`,
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    textDecoration: 'none',
                    display: 'block',
                    textAlign: 'center'
                  }}
                >
                  <Link
                    to={(() => {
                      const name = stagePanel.name.toLowerCase();
                      if (name.includes('research')) return '/admin/properties/parcel-research';
                      if (name.includes('fifa')) return '/admin/properties/fifa-processing';
                      if (name.includes('auction')) return '/admin/properties/auction';
                      if (name.includes('redemption')) return '/admin/properties/redemption-tracking';
                      if (name.includes('barment')) return '/admin/properties/barment';
                      if (name.includes('quiet')) return '/admin/properties/quiet-title';
                      if (name.includes('reo')) return '/admin/properties/reo-disposition';
                      if (name.includes('surplus')) return '/admin/operations/surplus-funds-research';
                      return '/admin/properties';
                    })()}
                    style={{ color: 'inherit', textDecoration: 'none', display: 'block', width: '100%', height: '100%' }}
                  >
                    View {stagePanel.name} Module
                  </Link>
                </button>
              </div>
            );
          })}
        </div>

        {/* Exports / Letters / Uploads row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))',
            gap: `clamp(12px, 2vw, 24px)`,
            marginBottom: `clamp(12px, 2vw, 24px)`,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {exportsLettersUploads.map((card) => {
            const CardIcon = iconMap[card.icon];
            return (
              <div
                key={card.title}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  border: '1px solid #E2E8F0',
                  padding: `clamp(14px, 1.8vw, 20px)`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `clamp(6px, 1vh, 8px)`,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: `clamp(4px, 0.5vh, 6px)`,
                    flexWrap: 'wrap',
                    gap: `clamp(4px, 0.5vw, 6px)`,
                  }}
                >
                  <div
                    style={{
                      fontSize: `clamp(10px, 1.1vw, 11px)`,
                      color: '#64748B',
                      lineHeight: 1.3,
                      flexGrow: 1,
                      flexShrink: 1,
                      flexBasis: 0,
                      minWidth: 0,
                    }}
                  >
                    {card.title}
                  </div>
                  {CardIcon && React.createElement(CardIcon, {
                    style: {
                      width: `clamp(14px, 1.5vw, 16px)`,
                      height: `clamp(14px, 1.5vw, 16px)`,
                      color: '#64748B',
                      flexShrink: 0,
                    }
                  })}
                </div>
                <div
                  style={{
                    fontSize: `clamp(12px, 1.3vw, 13px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                    lineHeight: 1.2,
                    marginBottom: `clamp(4px, 0.5vh, 6px)`,
                  }}
                >
                  {card.value}
                </div>
                <button
                  style={{
                    marginTop: `clamp(4px, 0.5vh, 6px)`,
                    fontSize: `clamp(11px, 1.2vw, 13px)`,
                    color: '#1E3A5F',
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: `clamp(4px, 0.5vw, 6px)`,
                    cursor: 'pointer',
                    fontWeight: 500,
                    alignSelf: 'flex-start',
                  }}
                >
                  View Details
                  <ArrowRight style={{ width: `clamp(12px, 1.3vw, 14px)`, height: `clamp(12px, 1.3vw, 14px)` }} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Properties by Workflow Stage table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: `clamp(6px, 0.8vw, 8px)`,
            border: '1px solid #E2E8F0',
            padding: `clamp(14px, 1.8vw, 20px)`,
            marginBottom: `clamp(12px, 2vw, 24px)`,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              marginBottom: `clamp(12px, 1.5vw, 16px)`,
              gap: `clamp(12px, 1.5vw, 16px)`,
            }}
          >
            <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
              <div
                style={{
                  fontSize: `clamp(13px, 1.5vw, 15px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: `clamp(3px, 0.5vh, 4px)`,
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                }}
              >
                {propertiesTable.title}
              </div>
              <div
                style={{
                  fontSize: `clamp(11px, 1.2vw, 13px)`,
                  color: '#64748B',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                }}
              >
                {propertiesTable.subtitle}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(6px, 1vw, 8px)`,
                flexWrap: 'wrap',
                width: isMobile ? '100%' : 'auto',
                flexShrink: 0,
              }}
            >
              <button
                style={{
                  fontSize: `clamp(11px, 1.2vw, 13px)`,
                  color: '#64748B',
                  backgroundColor: '#F1F5F9',
                  padding: `clamp(5px, 0.8vh, 6px) clamp(10px, 1.3vw, 12px)`,
                  borderRadius: `clamp(4px, 0.5vw, 6px)`,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: `clamp(4px, 0.5vw, 6px)`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  minWidth: 0,
                }}
              >
                <Filter style={{
                  width: `clamp(12px, 1.3vw, 14px)`,
                  height: `clamp(12px, 1.3vw, 14px)`,
                  flexShrink: 0,
                }} />
                {/* Simple dropdown for filter mockup since we don't have a UI library */}
                <select
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontWeight: 500,
                    color: '#64748B',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="All">All Stages</option>
                  <option value="Parcel Research">Parcel Research</option>
                  <option value="FIFA Processing">FIFA Processing</option>
                  <option value="Auction Research">Auction Research</option>
                  <option value="Redemption Tracking">Redemption Tracking</option>
                </select>
              </button>
              <div
                style={{
                  position: 'relative',
                  width: isMobile ? '100%' : `clamp(160px, 20vw, 180px)`,
                  fontSize: `clamp(11px, 1.2vw, 13px)`,
                  color: '#64748B',
                  flex: isMobile ? '1 1 100%' : '0 0 auto',
                  minWidth: 0,
                  flexShrink: isMobile ? 1 : 0,
                }}
              >
                <Search
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: `clamp(8px, 1vw, 10px)`,
                    transform: 'translateY(-50%)',
                    width: `clamp(14px, 1.5vw, 16px)`,
                    height: `clamp(14px, 1.5vw, 16px)`,
                    color: '#94A3B8',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  placeholder={propertiesTable.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `clamp(6px, 1vh, 8px) clamp(8px, 1vw, 10px) clamp(6px, 1vh, 8px) clamp(26px, 3vw, 32px)`,
                    borderRadius: `clamp(4px, 0.5vw, 6px)`,
                    border: '1px solid #E2E8F0',
                    fontSize: `clamp(11px, 1.2vw, 13px)`,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            width: '100%',
          }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: `clamp(11px, 1.2vw, 13px)`,
                minWidth: isMobile ? '600px' : 'auto',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                  }}
                >
                  {propertiesTable.headers.map((header) => (
                    <th
                      key={header}
                      style={{
                        textAlign: 'left',
                        padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                        fontWeight: 600,
                        color: '#64748B',
                        whiteSpace: 'nowrap',
                        fontSize: `clamp(10px, 1.2vw, 12px)`,
                        minWidth: header === 'Property Address' || header === 'Next Action' ? `clamp(120px, 15vw, 180px)` : 'auto',
                      }}
                    >
                      {header === 'Deadline' ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: `clamp(4px, 0.5vw, 6px)`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span>{header}</span>
                          <ArrowUpDown style={{
                            width: `clamp(12px, 1.3vw, 14px)`,
                            height: `clamp(12px, 1.3vw, 14px)`,
                            flexShrink: 0,
                          }} />
                        </span>
                      ) : (
                        header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {propertiesTable.rows.filter(row => {
                  const matchesSearch =
                    row.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    row.id.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesFilter = filterStage === 'All' || row.stage === filterStage;
                  return matchesSearch && matchesFilter;
                }).map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => navigate(`/admin/properties/${row.id}`)}
                    style={{
                      borderBottom: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{
                      padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                      whiteSpace: 'nowrap',
                      fontSize: `clamp(11px, 1.2vw, 13px)`,
                    }}>
                      {row.id}
                    </td>
                    <td style={{
                      padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                      fontSize: `clamp(11px, 1.2vw, 13px)`,
                      wordBreak: 'break-word',
                    }}>{row.address}</td>
                    <td style={{
                      padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                      whiteSpace: 'nowrap',
                      fontSize: `clamp(11px, 1.2vw, 13px)`,
                    }}>
                      {row.stage}
                    </td>
                    <td style={{
                      padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                      whiteSpace: 'nowrap',
                      fontSize: `clamp(11px, 1.2vw, 13px)`,
                    }}>
                      {row.days}
                    </td>
                    <td style={{
                      padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                      whiteSpace: 'nowrap',
                      fontSize: `clamp(11px, 1.2vw, 13px)`,
                    }}>
                      {row.assigned}
                    </td>
                    <td style={{
                      padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                      fontSize: `clamp(11px, 1.2vw, 13px)`,
                      wordBreak: 'break-word',
                    }}>{row.action}</td>
                    <td style={{
                      padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                      whiteSpace: 'nowrap',
                      fontSize: `clamp(11px, 1.2vw, 13px)`,
                    }}>
                      {row.deadline}
                    </td>
                    <td style={{
                      padding: `clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)`,
                      whiteSpace: 'nowrap',
                    }}>
                      <button
                        style={{
                          fontSize: `clamp(11px, 1.2vw, 13px)`,
                          color: '#1E3A5F',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          fontWeight: 500,
                        }}
                      >
                        <Link
                          to={`/admin/properties/${row.id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          {isMobile ? 'View' : 'View Property'}
                        </Link>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action items summary */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: `clamp(6px, 0.8vw, 8px)`,
            border: '1px solid #E2E8F0',
            padding: `clamp(14px, 1.8vw, 20px)`,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              marginBottom: `clamp(12px, 1.5vw, 16px)`,
              gap: `clamp(10px, 1.5vw, 12px)`,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: `clamp(13px, 1.5vw, 15px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: `clamp(3px, 0.5vh, 4px)`,
                  lineHeight: 1.2,
                }}
              >
                {actionItemsSummary.title}
              </div>
              <div
                style={{
                  fontSize: `clamp(11px, 1.2vw, 13px)`,
                  color: '#64748B',
                  lineHeight: 1.4,
                }}
              >
                {actionItemsSummary.subtitle}
              </div>
            </div>
            <button
              style={{
                fontSize: `clamp(11px, 1.2vw, 13px)`,
                color: '#1E3A5F',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {actionItemsSummary.buttonText}
            </button>
          </div>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
              gap: `clamp(8px, 1.5vw, 12px)`,
              fontSize: `clamp(11px, 1.2vw, 13px)`,
              color: '#0F172A',
              lineHeight: 1.4,
            }}
          >
            {actionItemsSummary.actionItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div >
  );
}



