"use client"
import React, { useEffect, useState } from 'react'
import { useTaskManagement } from '@/components/providers/task-management-provider'
import TaskCard from '@/components/tasks/TaskCard'

export default function TasksPage() {
  const { userProfile, getTasks, loading: providerLoading } = useTaskManagement()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(providerLoading)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const data = await getTasks()
        if (!mounted) return
        setTasks(data || [])
      } catch (err) {
        console.error('Error loading tasks', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (providerLoading) {
      setLoading(true)
    } else if (userProfile) {
      load()
    } else {
      // provider finished loading but user not authenticated
      setLoading(false)
      setTasks([])
    }

    return () => { mounted = false }
  }, [userProfile, getTasks, providerLoading])

  if (loading) return <div className="container-fluid mt-4">Loading tasks...</div>

  if (!userProfile) {
    return (
      <div className="container-fluid mt-4">
        <div className="text-center py-5">
          <h4>Please sign in to view tasks</h4>
          <a href="/login" className="btn btn-primary mt-3">Go to Login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Tasks</h2>
        {(userProfile?.year === '2nd' || userProfile?.year === '3rd') && (
          <a href="/tasks/create" className="btn btn-primary">➕ Create Task</a>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-5">No tasks found</div>
      ) : (
        tasks.map(task => (
          <TaskCard key={task.id} task={task} currentUser={userProfile} onClick={() => {}} />
        ))
      )}
    </div>
  )
}
