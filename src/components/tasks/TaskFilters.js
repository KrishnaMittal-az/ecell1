import React, { useState } from 'react'

const TaskFilters = ({ filters, onFiltersChange, currentUser }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      priority: '',
      category: '',
      assigned_to: ''
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = () => {
    return localFilters.search || localFilters.status || localFilters.priority || 
           localFilters.category || localFilters.assigned_to
  }

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Filters & Search</h6>
        {hasActiveFilters() && (
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={clearFilters}
          >
            Clear All
          </button>
        )}
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Search Tasks</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by title or description..."
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <div className="col-md-6">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={localFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={localFilters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={localFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="project">Project</option>
              <option value="documentation">Documentation</option>
              <option value="event">Event</option>
              <option value="research">Research</option>
              <option value="design">Design</option>
              <option value="development">Development</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>

          {(currentUser?.year === '2nd' || currentUser?.year === '3rd') && (
            <div className="col-12">
              <label className="form-label">Assigned To</label>
              <select
                className="form-select"
                value={localFilters.assigned_to}
                onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
              >
                <option value="">All Assignees</option>
                {/* This would be populated with actual users in a real app */}
                <option value="1st-year">1st Year Students</option>
                <option value="2nd-year">2nd Year Students</option>
                <option value="3rd-year">3rd Year Students</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskFilters