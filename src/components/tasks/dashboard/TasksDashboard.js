import React, { useState, useEffect } from 'react'
import { useTaskManagement } from '../../contexts/TaskManagementContext'
import TaskCard from '../tasks/TaskCard'

const TasksDashboard = () => {
  const { 
    userProfile, 
    getTasks, 
    getDashboardStats,
    notifications,
    markNotificationAsRead,
    fetchNotifications
  } = useTaskManagement()
  
  const [stats, setStats] = useState({
    pending_count: 0,
    in_progress_count: 0,
    submitted_count: 0,
    approved_count: 0,
    rejected_count: 0,
    cancelled_count: 0,
    overdue_count: 0
  })
  
  const [recentTasks, setRecentTasks] = useState([])
  const [overdueTasks, setOverdueTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userProfile) {
      loadDashboardData()
      const interval = setInterval(() => fetchNotifications(), 30000) // Refresh notifications every 30 seconds
      return () => clearInterval(interval)
    }
  }, [userProfile, fetchNotifications, loadDashboardData])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load dashboard stats
      const statsData = await getDashboardStats()
      setStats(statsData)

      // Load recent tasks
      const tasks = await getTasks()
      setRecentTasks(tasks.slice(0, 5)) // Get 5 most recent
      
      // Load overdue tasks
      const overdue = tasks.filter(task => {
        return new Date(task.due_date) < new Date() && 
               !['approved', 'rejected', 'cancelled'].includes(task.status)
      })
      setOverdueTasks(overdue)
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskClick = (task) => {
    // Handle task click - could open task details modal
    console.log('Task clicked:', task)
  }

  const handleTaskUpdate = (updatedTask) => {
    // Update local state when task is modified
    setRecentTasks(prev => 
      prev.map(task => 
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      )
    )
    loadDashboardData() // Refresh dashboard
  }

  const handleNotificationClick = async (notification) => {
    try {
      await markNotificationAsRead(notification.id)
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getStatsCards = () => {
    const cards = [
      { 
        title: 'Pending', 
        count: stats.pending_count, 
        color: 'secondary',
        icon: '⏳'
      },
      { 
        title: 'In Progress', 
        count: stats.in_progress_count, 
        color: 'info',
        icon: '🔄'
      },
      { 
        title: 'Submitted', 
        count: stats.submitted_count, 
        color: 'warning',
        icon: '📤'
      },
      { 
        title: 'Approved', 
        count: stats.approved_count, 
        color: 'success',
        icon: '✅'
      },
      { 
        title: 'Rejected', 
        count: stats.rejected_count, 
        color: 'danger',
        icon: '❌'
      },
      { 
        title: 'Overdue', 
        count: stats.overdue_count, 
        color: 'danger',
        icon: '🚨'
      }
    ]

    return cards
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
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Task Management Dashboard</h2>
              <p className="text-muted mb-0">
                Welcome back, {userProfile?.name}! Here's your task overview.
              </p>
            </div>
            
            {/* Notifications Bell */}
            <div className="position-relative">
              <button
                className="btn btn-outline-primary position-relative"
                onClick={() => {/* Toggle notifications dropdown */}}
              >
                🔔
                {notifications.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        {getStatsCards().map((card, index) => (
          <div key={index} className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-3">
            <div className={`card border-${card.color}`}>
              <div className="card-body text-center">
                <div className="fs-1 mb-2">{card.icon}</div>
                <h3 className={`text-${card.color} mb-1`}>{card.count}</h3>
                <p className="card-text text-muted mb-0">{card.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        {/* Recent Tasks */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Tasks</h5>
              <a href="/tasks" className="btn btn-sm btn-outline-primary">
                View All
              </a>
            </div>
            <div className="card-body">
              {recentTasks.length === 0 ? (
                <p className="text-muted text-center mb-0">No recent tasks</p>
              ) : (
                <div>
                  {recentTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={handleTaskClick}
                      onUpdate={handleTaskUpdate}
                      currentUser={userProfile}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="card mb-4 border-danger">
              <div className="card-header bg-danger text-white">
                <h6 className="mb-0">🚨 Overdue Tasks</h6>
              </div>
              <div className="card-body">
                {overdueTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="mb-3 pb-3 border-bottom">
                    <h6 className="mb-1">{task.title}</h6>
                    <small className="text-danger">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </small>
                  </div>
                ))}
                {overdueTasks.length > 3 && (
                  <small className="text-muted">
                    +{overdueTasks.length - 3} more overdue tasks
                  </small>
                )}
              </div>
            </div>
          )}

          {/* Recent Notifications */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">Recent Notifications</h6>
            </div>
            <div className="card-body">
              {notifications.length === 0 ? (
                <p className="text-muted text-center mb-0">No new notifications</p>
              ) : (
                <div>
                  {notifications.slice(0, 5).map(notification => (
                    <div 
                      key={notification.id} 
                      className={`mb-3 pb-3 border-bottom ${!notification.read ? 'bg-light rounded p-2' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <h6 className="mb-1">
                        {notification.type === 'task_assigned' && '📋 New Task Assigned'}
                        {notification.type === 'task_due_soon' && '⏰ Task Due Soon'}
                        {notification.type === 'submission_received' && '📨 New Submission'}
                        {notification.type === 'task_approved' && '✅ Task Approved'}
                        {notification.type === 'task_rejected' && '❌ Task Rejected'}
                        {notification.type === 'revision_requested' && '🔄 Revision Requested'}
                      </h6>
                      <p className="mb-1 text-muted">{notification.tasks?.title}</p>
                      <small className="text-muted">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Quick Actions</h6>
            </div>
            <div className="card-body">
              {(userProfile?.year === '2nd' || userProfile?.year === '3rd') && (
                <a href="/tasks/create" className="btn btn-primary w-100 mb-2">
                  ➕ Create New Task
                </a>
              )}
              {userProfile?.year === '1st' && (
                <a href="/tasks/my-tasks" className="btn btn-success w-100 mb-2">
                  📋 My Tasks
                </a>
              )}
              {(userProfile?.year === '2nd' || userProfile?.year === '3rd') && (
                <a href="/tasks/reviews" className="btn btn-warning w-100 mb-2">
                  👀 Review Queue
                </a>
              )}
              <a href="/tasks" className="btn btn-outline-secondary w-100">
                📋 All Tasks
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TasksDashboard