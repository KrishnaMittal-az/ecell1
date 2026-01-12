import React, { useState, useRef } from 'react'

const SubmissionForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    notes: ''
  })
  
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const validFiles = []

    for (const file of selectedFiles) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]

      if (!allowedTypes.includes(file.type)) {
        setError(`File type not allowed: ${file.name}. Please upload PDF, JPG, PNG, DOC, DOCX, XLS, or XLSX files.`)
        continue
      }

      // Validate file size (10MB max per file)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File too large: ${file.name}. Maximum size is 10MB per file.`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
      setError('')
    }

    // Clear input
    e.target.value = ''
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (files.length === 0) {
      setError('Please select at least one file to upload.')
      return
    }

    // Check total file size (50MB max total)
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > 50 * 1024 * 1024) {
      setError('Total file size cannot exceed 50MB.')
      return
    }

    setUploading(true)
    setError('')
    setUploadProgress({})

    try {
      // Submit form data and files
      await onSubmit(formData, files)
    } catch (error) {
      setError(error.message)
    } finally {
      setUploading(false)
      setUploadProgress({})
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType === 'application/pdf') return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    return '📎'
  }

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Submit Task: {task.title}</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <h6>Task Details</h6>
                <div className="bg-light p-3 rounded">
                  <p className="mb-1"><strong>Description:</strong> {task.description || 'No description'}</p>
                  <p className="mb-1"><strong>Due Date:</strong> {new Date(task.due_date).toLocaleDateString()}</p>
                  <p className="mb-0"><strong>Priority:</strong> {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</p>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="notes" className="form-label">
                  Submission Notes (Optional)
                </label>
                <textarea
                  className="form-control"
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional notes about your submission..."
                  maxLength={1000}
                />
                <small className="text-muted">
                  {formData.notes.length}/1000 characters
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Proof Files *
                </label>
                
                <div className="border border-dashed rounded p-4 text-center mb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📁 Select Files
                  </button>
                  
                  <p className="text-muted mt-2 mb-0">
                    Supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX<br />
                    Max 10MB per file, 50MB total
                  </p>
                </div>

                {files.length > 0 && (
                  <div className="mb-3">
                    <h6>Selected Files ({files.length})</h6>
                    <div className="list-group">
                      {files.map((file, index) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <span className="me-2 fs-5">{getFileIcon(file.type)}</span>
                            <div>
                              <div className="fw-bold">{file.name}</div>
                              <small className="text-muted">{formatFileSize(file.size)}</small>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeFile(index)}
                            disabled={uploading}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-2">
                      <small className="text-muted">
                        Total size: {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={files.length === 0 || uploading}
              >
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Uploading...
                  </>
                ) : (
                  'Submit Task'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SubmissionForm