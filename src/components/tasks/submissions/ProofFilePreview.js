import React, { useState, useEffect } from 'react'
import { supabase } from '../../../supabase'

const ProofFilePreview = ({ file }) => {
  const [signedUrl, setSignedUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    generateSignedUrl()
  }, [file.file_url, generateSignedUrl])

  const generateSignedUrl = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.storage
        .from('task-proofs')
        .createSignedUrl(file.file_url, 3600) // 1 hour expiry

      if (error) throw error
      setSignedUrl(data.signedUrl)
    } catch (error) {
      console.error('Error generating signed URL:', error)
      setError('Failed to load file preview')
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType === 'application/pdf') return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    return '📎'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isImage = () => {
    return file.file_type.startsWith('image/')
  }

  const isPdf = () => {
    return file.file_type === 'application/pdf'
  }

  if (loading) {
    return (
      <div className="card mb-2">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <span className="me-2 fs-5">{getFileIcon(file.file_type)}</span>
            <div className="flex-grow-1">
              <div className="fw-bold">{file.file_name}</div>
              <small className="text-muted">{formatFileSize(file.file_size)}</small>
            </div>
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card mb-2">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <span className="me-2 fs-5">{getFileIcon(file.file_type)}</span>
            <div className="flex-grow-1">
              <div className="fw-bold">{file.file_name}</div>
              <small className="text-muted">{formatFileSize(file.file_size)}</small>
            </div>
            <span className="text-danger">{error}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card mb-2">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center">
            <span className="me-2 fs-5">{getFileIcon(file.file_type)}</span>
            <div>
              <div className="fw-bold">{file.file_name}</div>
              <small className="text-muted">
                {formatFileSize(file.file_size)} • Uploaded {new Date(file.uploaded_at).toLocaleDateString()}
              </small>
            </div>
          </div>
          <div className="btn-group">
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-primary"
            >
              View
            </a>
            <a
              href={signedUrl}
              download={file.file_name}
              className="btn btn-sm btn-outline-secondary"
            >
              Download
            </a>
          </div>
        </div>

        {/* Preview for images */}
        {isImage() && (
          <div className="mt-2">
            <img
              src={signedUrl}
              alt={file.file_name}
              className="img-fluid rounded"
              style={{ maxHeight: '300px', maxWidth: '100%' }}
              onError={() => {
                // Hide image if it fails to load
                const img = document.querySelector(`img[alt="${file.file_name}"]`)
                if (img) img.style.display = 'none'
              }}
            />
          </div>
        )}

        {/* Preview for PDFs */}
        {isPdf() && (
          <div className="mt-2">
            <div className="ratio ratio-16x9">
              <iframe
                src={signedUrl}
                title={file.file_name}
                className="rounded"
                style={{ border: '1px solid #ddd' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProofFilePreview