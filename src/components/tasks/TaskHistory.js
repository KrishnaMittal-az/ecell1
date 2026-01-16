import React from 'react'
import { formatDistanceToNow } from 'date-fns'

const TaskHistory = ({ history }) => {
  const getActionIcon = (action) => {
    switch (action) {
      case 'created':
        return '🆕'
      case 'assigned':
        return '👤'
      case 'status_changed':
        return '📊'
      case 'file_uploaded':
        return '📎'
      case 'approved':
        return '✅'
      case 'rejected':
        return '❌'
      case 'comment_added':
        return '💬'
      case 'due_date_changed':
        return '📅'
      case 'priority_changed':
        return '🔥'
      default:
        return '📝'
    }
  }

  const getActionText = (action, oldValue, newValue) => {
    switch (action) {
      case 'created':
        return 'Task created'
      case 'assigned':
        return 'Task assigned'
      case 'status_changed':
        return `Status changed from "${oldValue}" to "${newValue}"`
      case 'file_uploaded':
        return newValue || 'Files uploaded'
      case 'approved':
        return 'Task approved'
      case 'rejected':
        return `Task rejected: ${newValue || ''}`
      case 'comment_added':
        return `Added comment: "${newValue}"`
      case 'due_date_changed':
        return `Due date changed from "${new Date(oldValue).toLocaleDateString()}" to "${new Date(newValue).toLocaleDateString()}"`
      case 'priority_changed':
        return `Priority changed from "${oldValue}" to "${newValue}"`
      default:
        return action.replace('_', ' ').charAt(0).toUpperCase() + action.replace('_', ' ').slice(1)
    }
  }

  if (!history || history.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h6 className="mb-0">History</h6>
        </div>
        <div className="card-body">
          <p className="text-muted text-center mb-0">No history available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="mb-0">History ({history.length})</h6>
      </div>
      <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <div className="timeline">
          {history.map((entry, index) => (
            <div key={entry.id} className={`timeline-item ${index === 0 ? 'timeline-item-current' : ''}`}>
              <div className="timeline-marker">
                <span className="timeline-icon">{getActionIcon(entry.action)}</span>
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-user">
                    {entry.performer.name} ({entry.performer.year} Year)
                  </span>
                  <span className="timeline-time">
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="timeline-text mb-0">
                  {getActionText(entry.action, entry.old_value, entry.new_value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TaskHistory