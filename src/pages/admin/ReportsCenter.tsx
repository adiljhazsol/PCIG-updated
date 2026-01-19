import { CSSProperties, useState } from 'react';
import {
  Search,
  FileText,
  Clock,
  TrendingUp,
  Settings,
  RefreshCw,
  ClipboardList,
  Percent,
  Book,
  Plus
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  FileText,
  Clock,
  TrendingUp,
  Settings,
  RefreshCw,
  Clipboard: ClipboardList,
  Percent,
  Book
};

export default function ReportsCenter() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  // Extract data from JSON
  const reportsData = adminData.reportsCenter;
  const header = reportsData.header;
  const searchPlaceholder = reportsData.searchPlaceholder;
  const taxSeasonBanner = reportsData.taxSeasonBanner;
  const tabs = reportsData.tabs;
  const reportCategories = reportsData.reportCategories;
  const sidebar = reportsData.sidebar;

  const [activeTab, setActiveTab] = useState<string>(reportsData.activeTab);

  const pageWrapperStyle: CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
    overflowX: 'hidden'
  };

  const ReviewAllocationsIcon = iconMap[taxSeasonBanner.buttons.reviewAllocations.icon] || Settings;
  const GenerateK1Icon = iconMap[taxSeasonBanner.buttons.generateK1.icon] || FileText;

  return (
    <div style={pageWrapperStyle}>
      <style>{`
        .tabs-scroll::-webkit-scrollbar {
          display: none;
        }
        .tabs-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <AdminNav />

      <div
        style={{
          padding: isMobile ? '20px 16px' : isTablet ? '24px 24px' : '32px 48px',
          width: '100%',
          maxWidth: '100vw',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {/* Header Section - Full Width */}
        <div style={{ minWidth: 0, width: '100%', overflowX: 'hidden', marginBottom: isMobile ? 24 : 32 }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'flex-start',
              marginBottom: isMobile ? 24 : 32,
              gap: isMobile ? 16 : 0,
              width: '100%',
              minWidth: 0
            }}
          >
            <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
              <h1
                style={{
                  fontSize: isMobile ? 'clamp(24px, 5vw, 32px)' : '32px',
                  fontWeight: 700,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 8,
                  marginLeft: 0,
                  lineHeight: 1.2,
                  wordBreak: 'break-word'
                }}
              >
                {header.title}
              </h1>
              {!isMobile && (
                <p
                  style={{
                    fontSize: `clamp(14px, 2vw, 16px)`,
                    color: '#64748B',
                    margin: 0
                  }}
                >
                  {header.subtitle}
                </p>
              )}
            </div>
            <div style={{ position: 'relative', width: isMobile ? '100%' : '320px', minWidth: 0, maxWidth: '100%' }}>
              <Search
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: `clamp(16px, 2.2vw, 18px)`,
                  height: `clamp(16px, 2.2vw, 18px)`,
                  color: '#94A3B8',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                style={{
                  width: '100%',
                  padding: `clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px) clamp(10px, 1.2vh, 12px) clamp(40px, 5vw, 44px)`,
                  fontSize: `clamp(13px, 1.8vw, 14px)`,
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  boxSizing: 'border-box',
                  maxWidth: '100%'
                }}
              />
            </div>
          </div>

          {/* Tax Season Banner */}
          <div
            style={{
              backgroundColor: '#1E3A5F',
              borderRadius: 12,
              padding: isMobile ? '20px' : '24px',
              marginBottom: isMobile ? 24 : 32,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? 16 : 0
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  fontSize: `clamp(16px, 2.2vw, 18px)`,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 8,
                  marginLeft: 0,
                  lineHeight: 1.3,
                  wordBreak: 'break-word'
                }}
              >
                {taxSeasonBanner.title}
              </h3>
              <p
                style={{
                  fontSize: `clamp(13px, 1.8vw, 14px)`,
                  color: '#E2E8F0',
                  margin: 0,
                  lineHeight: 1.5,
                  wordBreak: 'break-word'
                }}
              >
                {taxSeasonBanner.description}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: isMobile ? 'wrap' : 'nowrap', width: isMobile ? '100%' : 'auto', marginTop: isMobile ? 8 : 0, minWidth: 0 }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: `clamp(10px, 1.2vh, 12px) clamp(14px, 2vw, 16px)`,
                  fontSize: `clamp(13px, 1.8vw, 14px)`,
                  fontWeight: 500,
                  color: '#1E3A5F',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  flex: isMobile ? 1 : 'none',
                  boxSizing: 'border-box',
                  justifyContent: 'center',
                  minWidth: 0,
                  whiteSpace: isMobile ? 'normal' : 'nowrap'
                }}
              >
                <ReviewAllocationsIcon style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)`, flexShrink: 0 }} />
                <span style={{ wordBreak: 'break-word' }}>{taxSeasonBanner.buttons.reviewAllocations.label}</span>
              </button>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: `clamp(10px, 1.2vh, 12px) clamp(14px, 2vw, 16px)`,
                  fontSize: `clamp(13px, 1.8vw, 14px)`,
                  fontWeight: 500,
                  color: '#1E3A5F',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  flex: isMobile ? 1 : 'none',
                  boxSizing: 'border-box',
                  justifyContent: 'center',
                  minWidth: 0,
                  whiteSpace: isMobile ? 'normal' : 'nowrap'
                }}
              >
                <GenerateK1Icon style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)`, flexShrink: 0 }} />
                <span style={{ wordBreak: 'break-word' }}>{taxSeasonBanner.buttons.generateK1.label}</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: isMobile ? 16 : isTablet ? 24 : 32,
              marginBottom: isMobile ? 24 : 32,
              borderBottom: '1px solid #E2E8F0',
              overflowX: isMobileOrTablet ? 'auto' : 'visible',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              width: '100%',
              minWidth: 0
            }}
            className="tabs-scroll"
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: `clamp(10px, 1.2vh, 12px) 0`,
                  fontSize: `clamp(13px, 1.8vw, 14px)`,
                  fontWeight: 500,
                  color: activeTab === tab ? '#1E3A5F' : '#64748B',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #1E3A5F' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: '-1px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Report Cards and Sidebar - Side by Side */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '2fr 1fr',
            gap: isMobile ? 20 : 24,
            alignItems: 'flex-start',
            width: '100%',
            minWidth: 0
          }}
        >
          {/* Report Categories - Left Column */}
          <div style={{ minWidth: 0, width: '100%', overflowX: 'hidden' }}>
            {reportCategories.map((category, categoryIdx) => (
              <div key={categoryIdx} style={{ marginBottom: categoryIdx < reportCategories.length - 1 ? (isMobile ? 32 : 48) : 0, width: '100%', minWidth: 0 }}>
                <h2
                  style={{
                    fontSize: `clamp(16px, 2.2vw, 18px)`,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: isMobile ? 16 : 20,
                    marginLeft: 0
                  }}
                >
                  {category.title}
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                    gap: isMobile ? 16 : 20,
                    width: '100%',
                    minWidth: 0
                  }}
                >
                  {category.reports.map((report) => {
                    const ReportIcon = iconMap[report.icon] || FileText;
                    return (
                      <div
                        key={report.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 12,
                          border: '1px solid #E2E8F0',
                          padding: isMobile ? '16px' : '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          minWidth: 0,
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div
                          style={{
                            width: `clamp(36px, 4.5vw, 40px)`,
                            height: `clamp(36px, 4.5vw, 40px)`,
                            borderRadius: 8,
                            backgroundColor: '#F8FAFC',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: isMobile ? 12 : 16,
                            flexShrink: 0
                          }}
                        >
                          <ReportIcon style={{ width: `clamp(18px, 2.2vw, 20px)`, height: `clamp(18px, 2.2vw, 20px)`, color: '#1E3A5F' }} />
                        </div>
                        <h3
                          style={{
                            fontSize: `clamp(14px, 1.8vw, 16px)`,
                            fontWeight: 600,
                            color: '#0F172A',
                            marginTop: 0,
                            marginRight: 0,
                            marginBottom: 8,
                            marginLeft: 0,
                            lineHeight: 1.3,
                            wordBreak: 'break-word'
                          }}
                        >
                          {report.title}
                        </h3>
                        <p
                          style={{
                            fontSize: `clamp(12px, 1.6vw, 13px)`,
                            color: '#64748B',
                            lineHeight: 1.5,
                            marginTop: 0,
                            marginRight: 0,
                            marginBottom: isMobile ? 12 : 16,
                            marginLeft: 0,
                            wordBreak: 'break-word'
                          }}
                        >
                          {report.description}
                        </p>
                        <div style={{ marginBottom: isMobile ? 12 : 16, flex: 1 }}>
                          <p
                            style={{
                              fontSize: `clamp(11px, 1.5vw, 12px)`,
                              fontWeight: 600,
                              color: '#64748B',
                              marginTop: 0,
                              marginRight: 0,
                              marginBottom: 8,
                              marginLeft: 0
                            }}
                          >
                            Includes:
                          </p>
                          <ul style={{ margin: 0, paddingLeft: 16, fontSize: `clamp(11px, 1.5vw, 12px)`, color: '#64748B', lineHeight: 1.6, wordBreak: 'break-word' }}>
                            {report.includes.map((item, itemIdx) => (
                              <li key={itemIdx} style={{ wordBreak: 'break-word' }}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <button
                          style={{
                            width: '100%',
                            padding: `clamp(10px, 1.2vh, 12px) clamp(14px, 2vw, 16px)`,
                            fontSize: `clamp(13px, 1.8vw, 14px)`,
                            fontWeight: 500,
                            color: '#FFFFFF',
                            backgroundColor: '#1E3A5F',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            marginTop: 'auto',
                            boxSizing: 'border-box',
                            minWidth: 0,
                            wordBreak: 'break-word'
                          }}
                        >
                          Generate Report
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar - Right Column */}
          <div style={{ minWidth: 0, width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
            {/* Recent Reports */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: isMobile ? '20px' : '24px',
                marginBottom: isMobile ? 20 : 24
              }}
            >
              <h3
                style={{
                  fontSize: `clamp(14px, 1.8vw, 16px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: isMobile ? 12 : 16,
                  marginLeft: 0
                }}
              >
                Recent Reports
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
                {sidebar.recentReports.map((report, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      paddingBottom: idx < sidebar.recentReports.length - 1 ? (isMobile ? 12 : 16) : 0,
                      borderBottom: idx < sidebar.recentReports.length - 1 ? '1px solid #E2E8F0' : 'none'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: `clamp(13px, 1.8vw, 14px)`,
                          fontWeight: 500,
                          color: '#0F172A',
                          marginBottom: 4,
                          wordBreak: 'break-word'
                        }}
                      >
                        {report.title}
                      </div>
                      <div
                        style={{
                          fontSize: `clamp(11px, 1.5vw, 12px)`,
                          color: '#64748B'
                        }}
                      >
                        {report.generated} • {report.format}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduled Reports */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: isMobile ? '20px' : '24px',
                marginBottom: isMobile ? 20 : 24
              }}
            >
              <h3
                style={{
                  fontSize: `clamp(14px, 1.8vw, 16px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: isMobile ? 12 : 16,
                  marginLeft: 0
                }}
              >
                Scheduled Reports
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
                {sidebar.scheduledReports.map((report, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      paddingBottom: idx < sidebar.scheduledReports.length - 1 ? (isMobile ? 12 : 16) : 0,
                      borderBottom: idx < sidebar.scheduledReports.length - 1 ? '1px solid #E2E8F0' : 'none'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: `clamp(13px, 1.8vw, 14px)`,
                          fontWeight: 500,
                          color: '#0F172A',
                          marginBottom: 4,
                          wordBreak: 'break-word'
                        }}
                      >
                        {report.title}
                      </div>
                      <div
                        style={{
                          fontSize: `clamp(11px, 1.5vw, 12px)`,
                          color: '#64748B'
                        }}
                      >
                        Next run: {report.nextRun}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(14px, 2vw, 16px)`,
                    fontSize: `clamp(13px, 1.8vw, 14px)`,
                    fontWeight: 500,
                    color: '#1E3A5F',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 8,
                    boxSizing: 'border-box',
                    minWidth: 0
                  }}
                >
                  <Plus style={{ width: `clamp(14px, 2vw, 16px)`, height: `clamp(14px, 2vw, 16px)`, flexShrink: 0 }} />
                  <span>Schedule New</span>
                </button>
              </div>
            </div>

            {/* Favorites */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: isMobile ? '20px' : '24px'
              }}
            >
              <h3
                style={{
                  fontSize: `clamp(14px, 1.8vw, 16px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: isMobile ? 12 : 16,
                  marginLeft: 0
                }}
              >
                Favorites
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 6 : 8, width: '100%', minWidth: 0 }}>
                {sidebar.favorites.map((favorite, idx) => (
                  <button
                    key={idx}
                    style={{
                      padding: `clamp(6px, 0.8vh, 8px) clamp(10px, 1.5vw, 12px)`,
                      fontSize: `clamp(12px, 1.6vw, 13px)`,
                      fontWeight: 500,
                      color: '#1E3A5F',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 6,
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      minWidth: 0,
                      wordBreak: 'break-word',
                      whiteSpace: 'normal'
                    }}
                  >
                    {favorite}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
