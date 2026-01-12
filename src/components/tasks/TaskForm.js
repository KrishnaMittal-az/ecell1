import React, { useState, useEffect } from 'react'
import { useTaskManagement } from '../../contexts/TaskManagementContext'
import { supabase } from '../../supabase'

const TaskForm = ({ task, onSave, onCancel }) => {
  const { userProfile, createTask, updateTask } = useTaskManagement()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium',
    category: ''
  })
  
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assigned_to: task.assigned_to || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        priority: task.priority || 'medium',
        category: task.category || ''
      })
    }
    fetchUsers()
  }, [task, fetchUsers])

  const fetchUsers = async () => {
    try {
      let query = supabase
        .from('users')
        .select('id, name, year')
        .eq('approved', true)

      // Filter users based on creator's year
      if (userProfile?.year === '2nd') {
        // 2nd year can only assign to 1st year
        query = query.eq('year', '1st')
      }
      // 3rd year can assign to anyone
      // 1st year shouldn't be able to create tasks anyway

      const { data, error } = await query.order('name')

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Title is required')
      }
      if (!formData.assigned_to) {
        throw new Error('Please assign the task to someone')
      }
      if (!formData.due_date) {
        throw new Error('Due date is required')
      }

      const taskData = {
        ...formData,
        due_date: new Date(formData.due_date).toISOString(),
        assigned_to: formData.assigned_to
      }

      if (task) {
        // Update existing task
        const updatedTask = await updateTask(task.id, taskData)
        onSave(updatedTask)
      } else {
        // Create new task
        const newTask = await createTask(taskData)
        onSave(newTask)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!userProfile) {
    return <div>Loading...</div>
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          {task ? 'Edit Task' : 'Create New Task'}
        </h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              Task Title *
            </label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
              maxLength={200}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the task requirements..."
              maxLength={5000}
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="assigned_to" className="form-label">
                Assign To *
              </label>
              <select
                className="form-select"
                id="assigned_to"
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                required
              >
                <option value="">Select assignee</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.year} Year)
                  </option>
                ))}
              </select>
              {userProfile.year === '2nd' && (
                <small className="text-muted">
                  2nd year can only assign to 1st year students
                </small>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="due_date" className="form-label">
                Due Date *
              </label>
              <input
                type="date"
                className="form-control"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="priority" className="form-label">
                Priority
              </label>
              <select
                className="form-select"
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <select
                className="form-select"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
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
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskForm