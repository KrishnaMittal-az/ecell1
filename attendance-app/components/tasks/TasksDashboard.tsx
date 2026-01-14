"use client"
import React, { useEffect, useState, useCallback } from 'react'
import { useTaskManagement } from '@/components/providers/task-management-provider'
import TaskCard from './TaskCard'

const TasksDashboard = () => {
  const {
    userProfile,
    getTasks,
    getDashboardStats,
    notifications,
    markNotificationAsRead,
    fetchNotifications,
    loading: providerLoading
  } = useTaskManagement()

  const [stats, setStats] = useState<any>({
    pending_count: 0,
    in_progress_count: 0,
    submitted_count: 0,
    approved_count: 0,
    rejected_count: 0,
    cancelled_count: 0,
    overdue_count: 0
  })

  const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [overdueTasks, setOverdueTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const statsData = await getDashboardStats()
      setStats(statsData)

      const tasks = await getTasks()
      setRecentTasks((tasks || []).slice(0, 5))

      const overdue = (tasks || []).filter((task: any) => {
        return new Date(task.due_date) < new Date() &&
          !['approved', 'rejected', 'cancelled'].includes(task.status)
      })
      setOverdueTasks(overdue)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [getDashboardStats, getTasks])

  useEffect(() => {
    if (providerLoading) return
    if (userProfile) {
      loadDashboardData()
      const interval = setInterval(() => fetchNotifications(), 30000)
      return () => clearInterval(interval)
    }
  }, [userProfile, fetchNotifications, loadDashboardData, providerLoading])

  const handleTaskClick = (task: any) => console.log('Task clicked:', task)
  const handleTaskUpdate = (updatedTask: any) => loadDashboardData()

  const handleNotificationClick = async (notification: any) => {
    try {
      await markNotificationAsRead(notification.id)
      fetchNotifications()
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  if (providerLoading || loading) return <div className="container-fluid mt-4">Loading...</div>
  if (!userProfile) return (
    <div className="container-fluid mt-4 text-center py-5">
      <h4>Please sign in to view the dashboard</h4>
      <a href="/login" className="btn btn-primary mt-3">Login</a>
    </div>
  )
  if (error) return <div className="container-fluid mt-4">{error}</div>

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Task Management Dashboard</h2>
              <p className="text-muted mb-0">Welcome back, {userProfile?.name}! Here's your task overview.</p>
            </div>
            <div className="position-relative">
              <button className="btn btn-outline-primary position-relative">🔔{notifications.length > 0 && (<span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{notifications.length}</span>)}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-3">
          <div className="card border-secondary"><div className="card-body text-center"><div className="fs-1 mb-2">⏳</div><h3 className="text-secondary mb-1">{stats.pending_count}</h3><p className="card-text text-muted mb-0">Pending</p></div></div>
        </div>
        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-3">
          <div className="card border-info"><div className="card-body text-center"><div className="fs-1 mb-2">🔄</div><h3 className="text-info mb-1">{stats.in_progress_count}</h3><p className="card-text text-muted mb-0">In Progress</p></div></div>
        </div>
        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-3">
          <div className="card border-warning"><div className="card-body text-center"><div className="fs-1 mb-2">📤</div><h3 className="text-warning mb-1">{stats.submitted_count}</h3><p className="card-text text-muted mb-0">Submitted</p></div></div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Tasks</h5>
              <a href="/tasks" className="btn btn-sm btn-outline-primary">View All</a>
            </div>
            <div className="card-body">
              {recentTasks.length === 0 ? <p className="text-muted text-center mb-0">No recent tasks</p> : (
                recentTasks.map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} onDelete={() => handleTaskUpdate(task)} currentUser={userProfile} />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {overdueTasks.length > 0 && (
            <div className="card mb-4 border-danger">
              <div className="card-header bg-danger text-white"><h6 className="mb-0">🚨 Overdue Tasks</h6></div>
              <div className="card-body">
                {overdueTasks.slice(0, 3).map((task: any) => (
                  <div key={task.id} className="mb-3 pb-3 border-bottom"><h6 className="mb-1">{task.title}</h6><small className="text-danger">Due: {new Date(task.due_date).toLocaleDateString()}</small></div>
                ))}
              </div>
            </div>
          )}

          <div className="card mb-4">
            <div className="card-header"><h6 className="mb-0">Recent Notifications</h6></div>
            <div className="card-body">
              {notifications.length === 0 ? <p className="text-muted text-center mb-0">No new notifications</p> : (
                notifications.slice(0, 5).map((notification: any) => (
                  <div key={notification.id} className={`mb-3 pb-3 border-bottom ${!notification.read ? 'bg-light rounded p-2' : ''}`} style={{ cursor: 'pointer' }} onClick={() => handleNotificationClick(notification)}>
                    <h6 className="mb-1">{notification.type}</h6>
                    <p className="mb-1 text-muted">{notification.tasks?.title}</p>
                    <small className="text-muted">{new Date(notification.created_at).toLocaleDateString()}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TasksDashboard
