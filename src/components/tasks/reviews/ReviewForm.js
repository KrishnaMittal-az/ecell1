import React, { useState } from 'react'
import { useTaskManagement } from '../../../contexts/TaskManagementContext'

const ReviewForm = ({ submission, onSubmit, onCancel }) => {
  const { userProfile } = useTaskManagement()
  const [formData, setFormData] = useState({
    status: 'approved',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Validation
      if (!formData.status) {
        throw new Error('Please select a review status')
      }
      if (!formData.notes.trim()) {
        throw new Error('Please provide review notes')
      }

      await onSubmit(formData)
    } catch (error) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Review Submission</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <h6>Submission Details</h6>
                <div className="bg-light p-3 rounded">
                  <p className="mb-1"><strong>Status:</strong> 
                    <span className="badge bg-warning ms-2">
                      {submission.status.replace('_', ' ').charAt(0).toUpperCase() + submission.status.replace('_', ' ').slice(1)}
                    </span>
                  </p>
                  <p className="mb-1"><strong>Submitted:</strong> {new Date(submission.submitted_at).toLocaleDateString()}</p>
                  {submission.submission_notes && (
                    <p className="mb-0"><strong>Notes:</strong> {submission.submission_notes}</p>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="status" className="form-label">
                  Review Decision *
                </label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="approved">✅ Approve</option>
                  <option value="rejected">❌ Reject</option>
                  <option value="revision_requested">🔄 Request Revision</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="notes" className="form-label">
                  Review Notes *
                </label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Provide detailed feedback about the submission..."
                  required
                  maxLength={2000}
                />
                <small className="text-muted">
                  {formData.notes.length}/2000 characters
                </small>
              </div>

              <div className="alert alert-info">
                <strong>Reviewer:</strong> {userProfile?.name} ({userProfile?.year} Year)
              </div>

              {formData.status === 'approved' && (
                <div className="alert alert-success">
                  ✅ <strong>Approve:</strong> The submission meets all requirements and the task will be marked as completed.
                </div>
              )}

              {formData.status === 'rejected' && (
                <div className="alert alert-danger">
                  ❌ <strong>Reject:</strong> The submission does not meet requirements and the task will be marked as failed.
                </div>
              )}

              {formData.status === 'revision_requested' && (
                <div className="alert alert-warning">
                  🔄 <strong>Request Revision:</strong> The submission needs improvements. The assignee can resubmit with changes.
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${
                  formData.status === 'approved' ? 'btn-success' :
                  formData.status === 'rejected' ? 'btn-danger' :
                  'btn-warning'
                }`}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 
                 formData.status === 'approved' ? 'Approve Submission' :
                 formData.status === 'rejected' ? 'Reject Submission' :
                 'Request Revision'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReviewForm