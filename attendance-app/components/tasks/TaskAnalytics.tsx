"use client"
import React, { useEffect, useState } from 'react'
import { useTaskManagement } from '@/components/providers/task-management-provider'

const TaskAnalytics = () => {
  const { userProfile, getTasks, loading: providerLoading } = useTaskManagement()
  const [loading, setLoading] = useState<boolean>(providerLoading)
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const tasks = await getTasks()
        if (!mounted) return
        const byPriority:any = {}
        for (const t of tasks || []) {
          byPriority[t.priority] = (byPriority[t.priority] || 0) + 1
        }
        setStats({ total: tasks.length, byPriority })
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (providerLoading) {
      setLoading(true)
    } else if (userProfile) {
      load()
    } else {
      setLoading(false)
      setStats({ total: 0, byPriority: {} })
    }
    return () => { mounted = false }
  }, [userProfile, getTasks, providerLoading])

  if (providerLoading || loading) return <div className="container-fluid mt-4">Loading analytics...</div>
  if (!userProfile) return (
    <div className="container-fluid mt-4 text-center py-5">
      <h4>Please sign in to view analytics</h4>
      <a href="/login" className="btn btn-primary mt-3">Login</a>
    </div>
  )

  return (
    <div className="container-fluid mt-4">
      <h3>Task Analytics</h3>
      <p>Total tasks: {stats.total}</p>
      <div>
        {Object.entries(stats.byPriority || {}).map(([k,v]) => (
          <div key={k}>{k}: {String(v)}</div>
        ))}
      </div>
    </div>
  )
}

export default TaskAnalytics
