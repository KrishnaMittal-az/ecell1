import React from 'react'
import { format, formatDistanceToNow } from 'date-fns'

const TaskCard = ({ task, onClick, onStatusChange, onDelete, currentUser }) => {
  const {
    title,
    description,
    status,
    priority,
    due_date,
    creator,
    assignee,
    comments = []
  } = task

  const getStatusBadgeClass = (status) => {
    const baseClass = 'badge'
    switch (status) {
      case 'pending':
        return `${baseClass} bg-secondary`
      case 'in_progress':
        return `${baseClass} bg-info`
      case 'submitted':
        return `${baseClass} bg-warning`
      case 'approved':
        return `${baseClass} bg-success`
      case 'rejected':
        return `${baseClass} bg-danger`
      case 'cancelled':
        return `${baseClass} bg-dark`
      default:
        return `${baseClass} bg-secondary`
    }
  }

  const getPriorityBadgeClass = (priority) => {
    const baseClass = 'badge'
    switch (priority) {
      case 'low':
        return `${baseClass} bg-light text-dark`
      case 'medium':
        return `${baseClass} bg-info`
      case 'high':
        return `${baseClass} bg-warning`
      case 'urgent':
        return `${baseClass} bg-danger`
      default:
        return `${baseClass} bg-info`
    }
  }

  const isOverdue = () => {
    return new Date(due_date) < new Date() && !['approved', 'rejected', 'cancelled'].includes(status)
  }

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy')
  }

  const canEdit = () => {
    if (!currentUser) return false
    return currentUser.id === creator.id || currentUser.year === '3rd'
  }

  const canDelete = () => {
    if (!currentUser) return false
    return currentUser.id === creator.id || currentUser.year === '3rd'
  }

  const canSubmit = () => {
    if (!currentUser) return false
    return currentUser.year === '1st' && currentUser.id === assignee.id && status === 'pending'
  }

  return (
    <div className={`card mb-3 ${isOverdue() ? 'border-danger' : ''}`} style={{ cursor: 'pointer' }} onClick={() => onClick(task)}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title mb-0">{title}</h5>
          <div className="d-flex gap-2">
            <span className={getPriorityBadgeClass(priority)}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
            <span className={getStatusBadgeClass(status)}>
              {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
            </span>
          </div>
        </div>

        {description && (
          <p className="card-text text-muted mb-2">
            {description.length > 100 ? `${description.substring(0, 100)}...` : description}
          </p>
        )}

        <div className="row g-2 mb-2">
          <div className="col-6">
            <small className="text-muted">Assigned to:</small>
            <div className="fw-bold">{assignee?.name || 'Unknown'}</div>
            <small className="text-muted">{assignee?.year} Year</small>
          </div>
          <div className="col-6">
            <small className="text-muted">Created by:</small>
            <div className="fw-bold">{creator?.name || 'Unknown'}</div>
            <small className="text-muted">{creator?.year} Year</small>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div>
              <small className="text-muted">Due:</small>
              <div className={`fw-bold ${isOverdue() ? 'text-danger' : ''}`}>
                {formatDate(due_date)}
              </div>
              {isOverdue() && (
                <small className="text-danger">Overdue</small>
              )}
            </div>
            <div>
              <small className="text-muted">Created:</small>
              <div className="text-muted">
                {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>

          <div className="d-flex gap-2">
            {canSubmit() && (
              <button
                className="btn btn-sm btn-success"
                onClick={(e) => {
                  e.stopPropagation()
                  onClick({ ...task, action: 'submit' })
                }}
              >
                Submit
              </button>
            )}
            
            {canEdit() && (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  onClick({ ...task, action: 'edit' })
                }}
              >
                Edit
              </button>
            )}
            
            {canDelete() && (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={(e) => {
                  e.stopPropagation()
                  if (window.confirm('Are you sure you want to delete this task?')) {
                    onDelete(task.id)
                  }
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {comments.length > 0 && (
          <div className="mt-2">
            <small className="text-muted">
              💬 {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </small>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskCard