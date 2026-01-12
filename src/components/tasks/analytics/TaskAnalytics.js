import React, { useState, useEffect } from 'react'
import { useTaskManagement } from '../../../contexts/TaskManagementContext'

const TaskAnalytics = () => {
  const { userProfile } = useTaskManagement()
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completionRate: 0,
    averageSubmissionTime: 0,
    topPerformers: [],
    rejectionRate: 0,
    taskDistribution: {},
    priorityDistribution: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userProfile && userProfile.year === '3rd') {
      loadAnalytics()
    }
  }, [userProfile])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      // In a real implementation, this would call an analytics API
      // For now, we'll simulate some analytics data
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setAnalytics({
        totalTasks: 45,
        completionRate: 78.5,
        averageSubmissionTime: 3.2,
        topPerformers: [
          { name: 'John Doe', tasksCompleted: 12, completionRate: 92.3 },
          { name: 'Jane Smith', tasksCompleted: 10, completionRate: 87.1 },
          { name: 'Mike Johnson', tasksCompleted: 8, completionRate: 85.7 }
        ],
        rejectionRate: 12.4,
        taskDistribution: {
          'Project': 15,
          'Documentation': 12,
          'Event': 8,
          'Research': 6,
          'Design': 4
        },
        priorityDistribution: {
          'Low': 8,
          'Medium': 25,
          'High': 10,
          'Urgent': 2
        }
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`
  }

  const formatDays = (days) => {
    return `${days.toFixed(1)} days`
  }

  if (!userProfile || userProfile.year !== '3rd') {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-warning">
          <h4>Access Restricted</h4>
          <p>Task analytics are only available to 3rd year students.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container-fluid mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2>Task Analytics Dashboard</h2>
          <p className="text-muted">Comprehensive insights into task management performance</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-primary">
            <div className="card-body text-center">
              <div className="fs-1 mb-2">📋</div>
              <h3 className="text-primary">{analytics.totalTasks}</h3>
              <p className="card-text text-muted">Total Tasks Created</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-success">
            <div className="card-body text-center">
              <div className="fs-1 mb-2">✅</div>
              <h3 className="text-success">{formatPercentage(analytics.completionRate)}</h3>
              <p className="card-text text-muted">Completion Rate</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-info">
            <div className="card-body text-center">
              <div className="fs-1 mb-2">⏱️</div>
              <h3 className="text-info">{formatDays(analytics.averageSubmissionTime)}</h3>
              <p className="card-text text-muted">Avg. Submission Time</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-warning">
            <div className="card-body text-center">
              <div className="fs-1 mb-2">❌</div>
              <h3 className="text-warning">{formatPercentage(analytics.rejectionRate)}</h3>
              <p className="card-text text-muted">Rejection Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Top Performers */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">🏆 Top Performers</h5>
            </div>
            <div className="card-body">
              {analytics.topPerformers.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Student</th>
                        <th>Tasks Completed</th>
                        <th>Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topPerformers.map((performer, index) => (
                        <tr key={index}>
                          <td>
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index + 1}
                          </td>
                          <td>
                            <strong>{performer.name}</strong>
                          </td>
                          <td>{performer.tasksCompleted}</td>
                          <td>
                            <span className="badge bg-success">
                              {formatPercentage(performer.completionRate)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center">No performance data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Task Distribution by Category */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">📊 Task Distribution by Category</h5>
            </div>
            <div className="card-body">
              {Object.keys(analytics.taskDistribution).length > 0 ? (
                <div>
                  {Object.entries(analytics.taskDistribution).map(([category, count]) => {
                    const percentage = (count / analytics.totalTasks) * 100
                    return (
                      <div key={category} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{category}</span>
                          <span className="text-muted">{count} tasks ({formatPercentage(percentage)})</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${percentage}%` }}
                            aria-valuenow={percentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted text-center">No task distribution data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">🔥 Priority Distribution</h5>
            </div>
            <div className="card-body">
              {Object.keys(analytics.priorityDistribution).length > 0 ? (
                <div>
                  {Object.entries(analytics.priorityDistribution).map(([priority, count]) => {
                    const percentage = (count / analytics.totalTasks) * 100
                    const priorityColors = {
                      'Low': 'bg-light text-dark',
                      'Medium': 'bg-info',
                      'High': 'bg-warning',
                      'Urgent': 'bg-danger'
                    }
                    return (
                      <div key={priority} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{priority}</span>
                          <span className="text-muted">{count} tasks ({formatPercentage(percentage)})</span>
                        </div>
                        <div className="progress">
                          <div
                            className={`progress-bar ${priorityColors[priority] || 'bg-secondary'}`}
                            role="progressbar"
                            style={{ width: `${percentage}%` }}
                            aria-valuenow={percentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted text-center">No priority distribution data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">📥 Export & Reports</h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">
                Download detailed analytics reports and export data for further analysis.
              </p>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">
                  📊 Download Analytics Report (PDF)
                </button>
                <button className="btn btn-outline-success">
                  📈 Export Task Data (CSV)
                </button>
                <button className="btn btn-outline-info">
                  📋 Export Performance Report (Excel)
                </button>
                <button className="btn btn-outline-secondary">
                  📧 Email Weekly Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskAnalytics