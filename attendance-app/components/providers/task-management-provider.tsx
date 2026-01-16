"use client"
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from './auth-provider'
import {
  Task,
  TaskSubmission,
  TaskNotification,
  TaskComment,
  TaskHistory,
  TaskDashboardStats,
  TaskUserProfile,
  CreateTaskFormData,
  TaskFilters,
  UserYear
} from '@/lib/types'

interface TaskManagementContextType {
  // State
  userProfile: TaskUserProfile | null
  loading: boolean
  notifications: TaskNotification[]
  // Task methods
  createTask: (taskData: CreateTaskFormData) => Promise<Task>
  getTasks: (filters?: TaskFilters) => Promise<Task[]>
  getTaskById: (taskId: string) => Promise<Task | null>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task>
  deleteTask: (taskId: string) => Promise<boolean>
  // Submission methods
  submitTask: (taskId: string, submissionData: { notes?: string }, files?: File[]) => Promise<TaskSubmission>
  reviewSubmission: (submissionId: string, reviewData: { status: string; notes?: string }) => Promise<void>
  // Comment methods
  getTaskComments: (taskId: string) => Promise<TaskComment[]>
  addComment: (taskId: string, comment: string) => Promise<TaskComment>
  // History methods
  getTaskHistory: (taskId: string) => Promise<TaskHistory[]>
  // Notification methods
  fetchNotifications: () => Promise<void>
  markNotificationAsRead: (notificationId: string) => Promise<void>
  // Dashboard
  getDashboardStats: () => Promise<TaskDashboardStats>
  // User methods
  getAssignableUsers: () => Promise<TaskUserProfile[]>
}

const TaskManagementContext = createContext<TaskManagementContextType | null>(null)

export const useTaskManagement = () => {
  const context = useContext(TaskManagementContext)
  if (!context) {
    throw new Error('useTaskManagement must be used within a TaskManagementProvider')
  }
  return context
}

export const TaskManagementProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth()
  const [userProfile, setUserProfile] = useState<TaskUserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [notifications, setNotifications] = useState<TaskNotification[]>([])

  // Create supabase client - cast to any to bypass strict typing for task tables
  let supabase: ReturnType<typeof createSupabaseClient> | null = null
  if (typeof window !== 'undefined') {
    try {
      supabase = createSupabaseClient()
    } catch (err) {
      console.error('Failed to create Supabase client:', err)
    }
  }

  // Helper to get supabase with any type for task tables
  const db = () => supabase as any

  // Fetch user profile with year field - using direct fetch to avoid AbortError
  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!supabase) return

    try {
      // Get the session token for authorization
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('No session available for fetchUserProfile')
        setUserProfile(null)
        setProfileLoading(false)
        return
      }

      // Use direct fetch API to bypass Supabase client lock mechanism
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const response = await fetch(
        `${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=id,email,name,role,approved,year`,
        {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        console.error('Error fetching user profile:', response.status)
        setUserProfile(null)
      } else {
        const users = await response.json()
        if (users && users.length > 0) {
          setUserProfile(users[0] as TaskUserProfile)
        } else {
          setUserProfile(null)
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setUserProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  // Initialize user profile when auth user changes
  useEffect(() => {
    if (authLoading) return

    if (user?.id) {
      fetchUserProfile(user.id)
    } else {
      setUserProfile(null)
      setProfileLoading(false)
    }
  }, [user, authLoading, fetchUserProfile])

  // Fetch notifications when profile is loaded
  useEffect(() => {
    if (userProfile?.id) {
      fetchNotifications()
    }
  }, [userProfile?.id])

  const fetchNotifications = useCallback(async () => {
    if (!userProfile || !supabase) return

    try {
      const { data, error } = await db()
        .from('task_notifications')
        .select(`
          *,
          task:tasks(id, title)
        `)
        .eq('user_id', userProfile.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setNotifications((data || []) as TaskNotification[])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [userProfile?.id])

  // Task Management Functions
  const createTask = async (taskData: CreateTaskFormData): Promise<Task> => {
    if (!userProfile) throw new Error('User not authenticated')
    if (!supabase) throw new Error('Supabase client not available')

    // Admin can always create tasks, or 2nd/3rd year students
    const userYear = userProfile.year as UserYear
    const canCreate = userProfile.role === 'admin' || ['2nd', '3rd'].includes(userYear || '')

    if (!canCreate) {
      throw new Error('Only admin or 2nd/3rd year students can create tasks')
    }

    const { data, error } = await db()
      .from('tasks')
      .insert([{
        ...taskData,
        created_by: userProfile.id,
        due_date: new Date(taskData.due_date).toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    // Create notification for assignee
    await createNotification({
      user_id: taskData.assigned_to,
      task_id: data.id,
      type: 'task_assigned'
    })

    // Add to history
    await addToHistory(data.id, 'created', userProfile.id, null, taskData.title)

    return data as Task
  }

  const getTasks = async (filters: TaskFilters = {}): Promise<Task[]> => {
    if (!userProfile) throw new Error('User not authenticated')
    if (!supabase) throw new Error('Supabase client not available')

    let query = db()
      .from('tasks')
      .select(`
        *,
        creator:users!tasks_created_by_fkey(id, name, year),
        assignee:users!tasks_assigned_to_fkey(id, name, year),
        submissions:task_submissions(*),
        comments:task_comments(count)
      `)

    // Role-based filtering
    const userYear = userProfile.year as UserYear
    if (userYear === '1st') {
      query = query.eq('assigned_to', userProfile.id)
    }
    // 2nd and 3rd year can see all tasks they created or are assigned

    // Apply filters
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.priority) query = query.eq('priority', filters.priority)
    if (filters.category) query = query.eq('category', filters.category)
    if (filters.assigned_to) query = query.eq('assigned_to', filters.assigned_to)
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Task[]
  }

  const getTaskById = async (taskId: string): Promise<Task | null> => {
    if (!supabase) throw new Error('Supabase client not available')

    const { data, error } = await db()
      .from('tasks')
      .select(`
        *,
        creator:users!tasks_created_by_fkey(id, name, year, email),
        assignee:users!tasks_assigned_to_fkey(id, name, year, email),
        submissions:task_submissions(
          *,
          submitter:users!task_submissions_submitted_by_fkey(id, name, year),
          proof_files(*)
        )
      `)
      .eq('id', taskId)
      .single()

    if (error) {
      console.error('Error fetching task:', error)
      return null
    }
    return data as Task
  }

  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    if (!userProfile) throw new Error('User not authenticated')
    if (!supabase) throw new Error('Supabase client not available')

    // Fetch current task to check permissions
    const { data: currentTask, error: fetchError } = await db()
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (fetchError) throw fetchError

    const userYear = userProfile.year as UserYear
    if (currentTask.created_by !== userProfile.id && userYear !== '3rd') {
      throw new Error('Insufficient permissions to update this task')
    }

    const { data, error } = await db()
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error

    // Add to history for status/priority/due date changes
    if (updates.status && updates.status !== currentTask.status) {
      await addToHistory(taskId, 'status_changed', userProfile.id, currentTask.status, updates.status)
    }
    if (updates.priority && updates.priority !== currentTask.priority) {
      await addToHistory(taskId, 'priority_changed', userProfile.id, currentTask.priority, updates.priority)
    }
    if (updates.due_date && updates.due_date !== currentTask.due_date) {
      await addToHistory(taskId, 'due_date_changed', userProfile.id, currentTask.due_date, updates.due_date)
    }

    return data as Task
  }

  const deleteTask = async (taskId: string): Promise<boolean> => {
    if (!userProfile) throw new Error('User not authenticated')
    if (!supabase) throw new Error('Supabase client not available')

    const { data: currentTask, error: fetchError } = await db()
      .from('tasks')
      .select('created_by')
      .eq('id', taskId)
      .single()

    if (fetchError) throw fetchError

    const userYear = userProfile.year as UserYear
    if (currentTask.created_by !== userProfile.id && userYear !== '3rd') {
      throw new Error('Insufficient permissions to delete this task')
    }

    const { error } = await db()
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) throw error
    return true
  }

  const submitTask = async (
    taskId: string,
    submissionData: { notes?: string },
    files: File[] = []
  ): Promise<TaskSubmission> => {
    if (!userProfile) throw new Error('User not authenticated')
    if (!supabase) throw new Error('Supabase client not available')

    const userYear = userProfile.year as UserYear
    if (userYear !== '1st') {
      throw new Error('Only 1st year students can submit tasks')
    }

    // Create or update submission
    const { data: submission, error: submissionError } = await db()
      .from('task_submissions')
      .upsert({
        task_id: taskId,
        submitted_by: userProfile.id,
        submission_notes: submissionData.notes || '',
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (submissionError) throw submissionError

    // Upload proof files
    for (const file of files) {
      const fileName = `${submission.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('task-proofs')
        .upload(fileName, file)

      if (uploadError) {
        console.error('File upload error:', uploadError)
        continue
      }

      // Store file record
      await db().from('proof_files').insert({
        submission_id: submission.id,
        file_name: file.name,
        file_url: fileName,
        file_type: file.type,
        file_size: file.size
      })
    }

    // Update task status
    await updateTask(taskId, { status: 'submitted' })

    // Notify task creator
    const { data: task } = await db()
      .from('tasks')
      .select('created_by')
      .eq('id', taskId)
      .single()

    if (task) {
      await createNotification({
        user_id: task.created_by,
        task_id: taskId,
        type: 'submission_received'
      })
    }

    await addToHistory(taskId, 'file_uploaded', userProfile.id, null, `Submitted ${files.length} file(s)`)

    return submission as TaskSubmission
  }

  const reviewSubmission = async (
    submissionId: string,
    reviewData: { status: string; notes?: string }
  ): Promise<void> => {
    if (!userProfile) throw new Error('User not authenticated')
    if (!supabase) throw new Error('Supabase client not available')

    const userYear = userProfile.year as UserYear
    if (!['2nd', '3rd'].includes(userYear || '')) {
      throw new Error('Only 2nd and 3rd year students can review submissions')
    }

    // Create review record
    await db().from('task_reviews').insert({
      submission_id: submissionId,
      reviewed_by: userProfile.id,
      status: reviewData.status,
      review_notes: reviewData.notes || ''
    })

    // Update submission status
    await db()
      .from('task_submissions')
      .update({
        status: reviewData.status,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', submissionId)

    // Get task ID and update task status
    const { data: submission } = await db()
      .from('task_submissions')
      .select('task_id, submitted_by')
      .eq('id', submissionId)
      .single()

    if (submission) {
      const taskStatus = reviewData.status === 'approved' ? 'approved' :
        reviewData.status === 'rejected' ? 'rejected' : 'pending'

      await db()
        .from('tasks')
        .update({ status: taskStatus })
        .eq('id', submission.task_id)

      // Notify submitter
      const notifType = reviewData.status === 'approved' ? 'task_approved' :
        reviewData.status === 'rejected' ? 'task_rejected' : 'revision_requested'

      await createNotification({
        user_id: submission.submitted_by,
        task_id: submission.task_id,
        type: notifType
      })

      await addToHistory(submission.task_id, reviewData.status, userProfile.id, null, reviewData.notes || '')
    }
  }

  const getTaskComments = async (taskId: string): Promise<TaskComment[]> => {
    if (!supabase) throw new Error('Supabase client not available')

    const { data, error } = await db()
      .from('task_comments')
      .select('*, commenter:users(id, name, year)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data || []) as TaskComment[]
  }

  const addComment = async (taskId: string, comment: string): Promise<TaskComment> => {
    if (!userProfile) throw new Error('User not authenticated')
    if (!supabase) throw new Error('Supabase client not available')

    const { data, error } = await db()
      .from('task_comments')
      .insert({
        task_id: taskId,
        commented_by: userProfile.id,
        comment
      })
      .select('*, commenter:users(id, name, year)')
      .single()

    if (error) throw error
    await addToHistory(taskId, 'comment_added', userProfile.id, null, comment.substring(0, 50))
    return data as TaskComment
  }

  const getTaskHistory = async (taskId: string): Promise<TaskHistory[]> => {
    if (!supabase) throw new Error('Supabase client not available')

    const { data, error } = await db()
      .from('task_history')
      .select('*, performer:users(id, name, year)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as TaskHistory[]
  }

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    if (!supabase) return

    await db()
      .from('task_notifications')
      .update({ read: true })
      .eq('id', notificationId)

    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const getDashboardStats = async (): Promise<TaskDashboardStats> => {
    if (!userProfile) throw new Error('User not authenticated')
    if (!supabase) throw new Error('Supabase client not available')

    const stats: TaskDashboardStats = {
      pending_count: 0,
      in_progress_count: 0,
      submitted_count: 0,
      approved_count: 0,
      rejected_count: 0,
      cancelled_count: 0,
      overdue_count: 0
    }

    const statuses = ['pending', 'in_progress', 'submitted', 'approved', 'rejected', 'cancelled'] as const

    for (const status of statuses) {
      let query = db()
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', status)

      // Apply role-based filtering
      const userYear = userProfile.year as UserYear
      if (userYear === '1st') {
        query = query.eq('assigned_to', userProfile.id)
      } else if (userYear === '2nd') {
        query = query.or(`created_by.eq.${userProfile.id},assigned_to.eq.${userProfile.id}`)
      }

      const { count } = await query
      stats[`${status}_count` as keyof TaskDashboardStats] = count || 0
    }

    // Overdue count
    let overdueQuery = db()
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .lt('due_date', new Date().toISOString())
      .not('status', 'in', '("approved","rejected","cancelled")')

    const userYear = userProfile.year as UserYear
    if (userYear === '1st') {
      overdueQuery = overdueQuery.eq('assigned_to', userProfile.id)
    }

    const { count: overdueCount } = await overdueQuery
    stats.overdue_count = overdueCount || 0

    return stats
  }

  const getAssignableUsers = async (): Promise<TaskUserProfile[]> => {
    if (!userProfile) throw new Error('User not authenticated')
    if (!supabase) throw new Error('Supabase client not available')

    let query = db()
      .from('users')
      .select('id, email, name, role, approved, year')
      .eq('approved', true)

    // Admin can assign to anyone
    // 2nd year can only assign to 1st year
    // 3rd year can assign to anyone
    const userYear = userProfile.year as UserYear
    if (userProfile.role !== 'admin' && userYear === '2nd') {
      query = query.eq('year', '1st')
    }
    // Admin and 3rd year can assign to anyone - no filter

    const { data, error } = await query.order('name')
    if (error) throw error
    return (data || []) as TaskUserProfile[]
  }

  // Helper functions
  const createNotification = async (notificationData: {
    user_id: string
    task_id: string
    type: string
  }) => {
    if (!supabase) return
    await db().from('task_notifications').insert([notificationData])
  }

  const addToHistory = async (
    taskId: string,
    action: string,
    performedBy: string,
    oldValue: string | null,
    newValue: string | null
  ) => {
    if (!supabase) return
    await db().from('task_history').insert({
      task_id: taskId,
      action,
      performed_by: performedBy,
      old_value: oldValue,
      new_value: newValue
    })
  }

  const loading = authLoading || profileLoading

  const value: TaskManagementContextType = {
    userProfile,
    loading,
    notifications,
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    submitTask,
    reviewSubmission,
    getTaskComments,
    addComment,
    getTaskHistory,
    fetchNotifications,
    markNotificationAsRead,
    getDashboardStats,
    getAssignableUsers
  }

  return (
    <TaskManagementContext.Provider value={value}>
      {children}
    </TaskManagementContext.Provider>
  )
}

export default TaskManagementContext
