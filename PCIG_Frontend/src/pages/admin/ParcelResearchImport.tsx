import React, { CSSProperties, useState } from 'react';
import {
  ArrowLeft,
  Upload,
  FileText,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

export default function ParcelResearchImport() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const navigate = useNavigate();

  const [batchName, setBatchName] = useState('');
  const [importDate, setImportDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please select at least one file to upload.');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('batch_name', batchName);
      formData.append('import_date', importDate);
      formData.append('notes', notes);
      
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
      
      await api.post('/admin/parcel/import', formData);
      
      navigate('/admin/properties/parcel-research');
    } catch (err) {
      console.error('Import failed', err);
      alert('Failed to import files. Please try again.');
    } finally {
      setUploading(false);
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

  const cardStyle: CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E2E8F0',
    padding: isMobile ? 16 : isTablet ? 20 : 24,
    boxSizing: 'border-box',
    marginBottom: 24
  };

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
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => navigate('/admin/properties/parcel-research')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                marginBottom: 16,
                padding: 0
              }}
            >
              <ArrowLeft size={16} />
              Back to Parcel Research
            </button>
            <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
              Import Parcels
            </h1>
            <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
              Bulk upload parcel data for research
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Configuration Card */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', margin: '0 0 16px 0' }}>
                Import Configuration
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                    Batch Name
                  </label>
                  <input
                    type="text"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="e.g., Miami_Dade_Auctions_Jan26"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                    Import Date
                  </label>
                  <input
                    type="date"
                    value={importDate}
                    onChange={(e) => setImportDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any specific notes about this import batch..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      fontSize: 14,
                      minHeight: 80,
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', margin: '0 0 4px 0' }}>
                Upload Files
              </h2>
              <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 20px 0' }}>
                Support for Excel/CSV (data lists)
              </p>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                  border: '2px dashed #E2E8F0',
                  borderRadius: 12,
                  padding: 40,
                  textAlign: 'center',
                  backgroundColor: '#F8FAFC',
                  cursor: 'pointer',
                  marginBottom: 20
                }}
              >
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  backgroundColor: '#EFF6FF', 
                  color: '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}>
                  <Upload size={24} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: '0 0 4px 0' }}>
                  Click to upload or drag and drop
                </h3>
                <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                  XLSX, CSV (max. 50MB)
                </p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  style={{
                    display: 'inline-block',
                    marginTop: 16,
                    padding: '8px 16px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#0F172A',
                    cursor: 'pointer'
                  }}
                >
                  Browse Files
                </label>
              </div>

              {files.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: 12,
                        backgroundColor: '#F8FAFC',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      <div style={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: 8, 
                        backgroundColor: '#EFF6FF', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginRight: 12
                      }}>
                        {file.name.endsWith('.pdf') ? (
                          <FileText size={18} color="#3B82F6" />
                        ) : (
                          <FileSpreadsheet size={18} color="#10B981" />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: 14, 
                          fontWeight: 500, 
                          color: '#0F172A', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis' 
                        }}>
                          {file.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 4,
                          color: '#94A3B8'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                onClick={() => navigate('/admin/properties/parcel-research')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
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
                type="submit"
                disabled={uploading}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  opacity: uploading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                {uploading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Upload size={16} />
                    Start Import
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
