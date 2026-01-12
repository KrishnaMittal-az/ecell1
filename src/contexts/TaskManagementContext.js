import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const TaskManagementContext = createContext()

export const useTaskManagement = () => {
  const context = useContext(TaskManagementContext)
  if (!context) {
    throw new Error('useTaskManagement must be used within a TaskManagementProvider')
  }
  return context
}

export const TaskManagementProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUserProfile(data)
      
      // Fetch notifications
      fetchNotifications()
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchNotifications = async () => {
    if (!userProfile) return

    try {
      const { data, error } = await supabase
        .from('task_notifications')
        .select(`
          *,
          tasks (
            id,
            title,
            created_by,
            assigned_to
          )
        `)
        .eq('user_id', userProfile.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    }
  }

  const signUp = async (email, password, name, year) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            year
          }
        }
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setUserProfile(null)
      setNotifications([])
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Task Management Functions
  const createTask = async (taskData) => {
    if (!userProfile) throw new Error('User not authenticated')

    // Check permissions
    if (!['2nd', '3rd'].includes(userProfile.year)) {
      throw new Error('Only 2nd and 3rd year students can create tasks')
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          created_by: userProfile.id
        }])
        .select()
        .single()

      if (error) throw error

      // Create notification for assigned user
      await createNotification({
        user_id: taskData.assigned_to,
        task_id: data.id,
        type: 'task_assigned'
      })

      // Add to history
      await addToHistory(data.id, 'created', userProfile.id, null, taskData.title)

      return data
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  const getTasks = async (filters = {}) => {
    if (!userProfile) throw new Error('User not authenticated')

    let query = supabase
      .from('tasks')
      .select(`
        *,
        creator:users!tasks_created_by_fkey(id, name, year),
        assignee:users!tasks_assigned_to_fkey(id, name, year),
        submissions:task_submissions(*),
        comments:task_comments(count)
      `)

    // Apply role-based filters
    if (userProfile.year === '1st') {
      // 1st year can only see their assigned tasks
      query = query.eq('assigned_to', userProfile.id)
    } else if (userProfile.year === '2nd') {
      // 2nd year can see their created tasks and 1st year tasks
      query = query.or(`created_by.eq.${userProfile.id},assigned_to.in.(select id from users where year='1st')`)
    }
    // 3rd year can see all tasks

    // Apply additional filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  const updateTask = async (taskId, updates) => {
    if (!userProfile) throw new Error('User not authenticated')

    try {
      // Get current task to check permissions
      const { data: currentTask, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()

      if (fetchError) throw fetchError

      // Check permissions
      if (currentTask.created_by !== userProfile.id && userProfile.year !== '3rd') {
        throw new Error('Insufficient permissions to update this task')
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error

      // Add to history for significant changes
      if (updates.status && updates.status !== currentTask.status) {
        await addToHistory(taskId, 'status_changed', userProfile.id, currentTask.status, updates.status)
      }
      if (updates.priority && updates.priority !== currentTask.priority) {
        await addToHistory(taskId, 'priority_changed', userProfile.id, currentTask.priority, updates.priority)
      }
      if (updates.due_date && updates.due_date !== currentTask.due_date) {
        await addToHistory(taskId, 'due_date_changed', userProfile.id, currentTask.due_date, updates.due_date)
      }

      return data
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  const deleteTask = async (taskId) => {
    if (!userProfile) throw new Error('User not authenticated')

    try {
      // Get current task to check permissions
      const { data: currentTask, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()

      if (fetchError) throw fetchError

      // Check permissions
      if (currentTask.created_by !== userProfile.id && userProfile.year !== '3rd') {
        throw new Error('Insufficient permissions to delete this task')
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  const submitTask = async (taskId, submissionData, files = []) => {
    if (!userProfile) throw new Error('User not authenticated')

    // Check if user can submit (1st year only)
    if (userProfile.year !== '1st') {
      throw new Error('Only 1st year students can submit tasks')
    }

    try {
      // Create or update submission
      const { data: submission, error: submissionError } = await supabase
        .from('task_submissions')
        .upsert({
          task_id: taskId,
          submitted_by: userProfile.id,
          submission_notes: submissionData.notes || '',
          status: 'pending'
        })
        .select()
        .single()

      if (submissionError) throw submissionError

      // Upload files
      const uploadedFiles = []
      for (const file of files) {
        const fileData = await uploadProofFile(submission.id, file)
        uploadedFiles.push(fileData)
      }

      // Update task status
      await updateTask(taskId, { status: 'submitted' })

      // Notify reviewers
      await notifyReviewers(taskId, submission.id)

      // Add to history
      await addToHistory(taskId, 'file_uploaded', userProfile.id, null, `Submitted ${files.length} file(s)`)

      return { submission, files: uploadedFiles }
    } catch (error) {
      console.error('Error submitting task:', error)
      throw error
    }
  }

  const uploadProofFile = async (submissionId, file) => {
    try {
      const fileName = `${submissionId}/${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('task-proofs')
        .upload(fileName, file)

      if (error) throw error

      // Save file metadata
      const { data: fileData, error: fileError } = await supabase
        .from('proof_files')
        .insert([{
          submission_id: submissionId,
          file_name: file.name,
          file_url: fileName,
          file_type: file.type,
          file_size: file.size
        }])
        .select()
        .single()

      if (fileError) throw fileError

      return fileData
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  const reviewSubmission = async (submissionId, reviewData) => {
    if (!userProfile) throw new Error('User not authenticated')

    // Check permissions
    if (!['2nd', '3rd'].includes(userProfile.year)) {
      throw new Error('Only 2nd and 3rd year students can review submissions')
    }

    try {
      // Verify user can review this submission
      const { data: canReview, error: checkError } = await supabase
        .rpc('can_review_submission', {
          reviewer_id: userProfile.id,
          submission_id: submissionId
        })

      if (checkError) throw checkError
      if (!canReview) {
        throw new Error('You do not have permission to review this submission')
      }

      // Create review
      const { data: review, error: reviewError } = await supabase
        .from('task_reviews')
        .insert([{
          submission_id: submissionId,
          reviewed_by: userProfile.id,
          status: reviewData.status,
          review_notes: reviewData.notes || ''
        }])
        .select()
        .single()

      if (reviewError) throw reviewError

      // Update submission status
      const { error: updateError } = await supabase
        .from('task_submissions')
        .update({
          status: reviewData.status,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId)

      if (updateError) throw updateError

      // Update task status if approved/rejected
      if (reviewData.status === 'approved' || reviewData.status === 'rejected') {
        const { data: submission } = await supabase
          .from('task_submissions')
          .select('task_id')
          .eq('id', submissionId)
          .single()

        await updateTask(submission.task_id, {
          status: reviewData.status === 'approved' ? 'approved' : 'rejected'
        })
      }

      // Add to history
      await addToHistory(
        submissionId.split('-')[0], // Get task ID from submission ID
        reviewData.status,
        userProfile.id,
        null,
        reviewData.notes || ''
      )

      return review
    } catch (error) {
      console.error('Error reviewing submission:', error)
      throw error
    }
  }

  const createNotification = async (notificationData) => {
    try {
      const { error } = await supabase
        .from('task_notifications')
        .insert([notificationData])

      if (error) throw error
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  const notifyReviewers = async (taskId, submissionId) => {
    try {
      // Get task and submission details
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('created_by, assigned_to')
        .eq('id', taskId)
        .single()

      if (taskError) throw taskError

      // Notify task creator and assigned user (if different)
      const reviewerIds = [task.created_by]
      if (task.assigned_to !== task.created_by) {
        reviewerIds.push(task.assigned_to)
      }

      // Filter to only 2nd and 3rd year users
      const { data: reviewers } = await supabase
        .from('users')
        .select('id')
        .in('id', reviewerIds)
        .in('year', ['2nd', '3rd'])

      // Create notifications
      for (const reviewer of reviewers || []) {
        await createNotification({
          user_id: reviewer.id,
          task_id: taskId,
          type: 'submission_received'
        })
      }
    } catch (error) {
      console.error('Error notifying reviewers:', error)
    }
  }

  const addToHistory = async (taskId, action, performedBy, oldValue, newValue) => {
    try {
      await supabase
        .from('task_history')
        .insert([{
          task_id: taskId,
          action,
          performed_by: performedBy,
          old_value: oldValue,
          new_value: newValue
        }])
    } catch (error) {
      console.error('Error adding to history:', error)
    }
  }

  const getTaskComments = async (taskId) => {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          *,
          commenter:users(id, name, year)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching comments:', error)
      throw error
    }
  }

  const addComment = async (taskId, comment) => {
    if (!userProfile) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert([{
          task_id: taskId,
          commented_by: userProfile.id,
          comment
        }])
        .select()
        .single()

      if (error) throw error

      // Add to history
      await addToHistory(taskId, 'comment_added', userProfile.id, null, comment.substring(0, 50))

      return data
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  }

  const getTaskHistory = async (taskId) => {
    try {
      const { data, error } = await supabase
        .from('task_history')
        .select(`
          *,
          performer:users(id, name, year)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching task history:', error)
      throw error
    }
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('task_notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getDashboardStats = async () => {
    if (!userProfile) throw new Error('User not authenticated')

    try {
      let baseQuery = supabase.from('tasks')
      let filterCondition = ''

      // Apply role-based filters
      if (userProfile.year === '1st') {
        filterCondition = `assigned_to=eq.${userProfile.id}`
      } else if (userProfile.year === '2nd') {
        filterCondition = `or=(created_by.eq.${userProfile.id},assigned_to.in.(select id from users where year='1st'))`
      }
      // 3rd year sees all

      const stats = {}

      // Get counts for different statuses
      const statuses = ['pending', 'in_progress', 'submitted', 'approved', 'rejected', 'cancelled']
      for (const status of statuses) {
        let query = supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })

        if (filterCondition) {
          query = query.or(filterCondition)
        }
        query = query.eq('status', status)

        const { count } = await query
        stats[`${status}_count`] = count || 0
      }

      // Get overdue tasks
      let overdueQuery = supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .lt('due_date', new Date().toISOString())
        .not('status', 'in', '("approved", "rejected", "cancelled")')

      if (filterCondition) {
        overdueQuery = overdueQuery.or(filterCondition)
      }

      const { count: overdueCount } = await overdueQuery
      stats.overdue_count = overdueCount || 0

      return stats
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }

  const value = {
    // Auth state
    user,
    userProfile,
    loading,
    notifications,
    
    // Auth methods
    signIn,
    signUp,
    signOut,
    fetchNotifications,
    
    // Task methods
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    submitTask,
    reviewSubmission,
    getTaskComments,
    addComment,
    getTaskHistory,
    
    // Notification methods
    markNotificationAsRead,
    
    // Dashboard methods
    getDashboardStats
  }

  return (
    <TaskManagementContext.Provider value={value}>
      {children}
    </TaskManagementContext.Provider>
  )
}

export default TaskManagementContext