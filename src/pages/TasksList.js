import React, { useState, useEffect } from 'react'
import { useTaskManagement } from '../../contexts/TaskManagementContext'
import TaskCard from '../tasks/TaskCard'
import TaskFilters from '../tasks/TaskFilters'
import TaskForm from '../tasks/TaskForm'
import TaskDetails from '../tasks/TaskDetails'

const TasksList = () => {
  const { 
    userProfile, 
    getTasks, 
    deleteTask
  } = useTaskManagement()
  
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    assigned_to: ''
  })

  useEffect(() => {
    if (userProfile) {
      loadTasks()
    }
  }, [userProfile, getTasks])

  useEffect(() => {
    applyFilters()
  }, [tasks, filters, getTasks])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const tasksData = await getTasks()
      setTasks(tasksData)
    } catch (error) {
      console.error('Error loading tasks:', error)
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...tasks]

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description && task.description.toLowerCase().includes(searchTerm))
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status)
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority)
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(task => task.category === filters.category)
    }

    // Assigned to filter
    if (filters.assigned_to) {
      if (filters.assigned_to === '1st-year') {
        filtered = filtered.filter(task => task.assignee.year === '1st')
      } else if (filters.assigned_to === '2nd-year') {
        filtered = filtered.filter(task => task.assignee.year === '2nd')
      } else if (filters.assigned_to === '3rd-year') {
        filtered = filtered.filter(task => task.assignee.year === '3rd')
      }
    }

    // Sort by due date (overdue first)
    filtered.sort((a, b) => {
      const aOverdue = new Date(a.due_date) < new Date() && !['approved', 'rejected', 'cancelled'].includes(a.status)
      const bOverdue = new Date(b.due_date) < new Date() && !['approved', 'rejected', 'cancelled'].includes(b.status)
      
      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1
      
      return new Date(a.due_date) - new Date(b.due_date)
    })

    setFilteredTasks(filtered)
  }

  const handleTaskClick = (task) => {
    if (task.action === 'edit') {
      setSelectedTask(task)
      setShowTaskForm(true)
    } else if (task.action === 'submit') {
      // Handle submit action
      setSelectedTask(task)
      setShowTaskDetails(true)
    } else {
      // View task details
      setSelectedTask(task)
      setShowTaskDetails(true)
    }
  }

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      )
    )
    setShowTaskForm(false)
    setSelectedTask(null)
  }

  const handleTaskSave = (newTask) => {
    setTasks(prev => [newTask, ...prev])
    setShowTaskForm(false)
    setSelectedTask(null)
  }

  const handleTaskDelete = async (taskId) => {
    try {
      await deleteTask(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (error) {
      setError(error.message)
    }
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
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

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Tasks</h2>
              <p className="text-muted mb-0">
                {filteredTasks.length} of {tasks.length} tasks
              </p>
            </div>
            {(userProfile?.year === '2nd' || userProfile?.year === '3rd') && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedTask(null)
                  setShowTaskForm(true)
                }}
              >
                ➕ Create Task
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-3">
          <TaskFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            currentUser={userProfile}
          />
        </div>

        <div className="col-lg-9">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {filteredTasks.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <span className="display-1">📋</span>
              </div>
              <h4>No tasks found</h4>
              <p className="text-muted">
                {tasks.length === 0 
                  ? 'No tasks have been created yet.'
                  : 'No tasks match your current filters.'
                }
              </p>
              {(userProfile?.year === '2nd' || userProfile?.year === '3rd') && tasks.length === 0 && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedTask(null)
                    setShowTaskForm(true)
                  }}
                >
                  Create Your First Task
                </button>
              )}
            </div>
          ) : (
            <div>
              {filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={handleTaskClick}
                  onDelete={handleTaskDelete}
                  onUpdate={handleTaskUpdate}
                  currentUser={userProfile}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <TaskForm
                task={selectedTask}
                onSave={selectedTask ? handleTaskUpdate : handleTaskSave}
                onCancel={() => {
                  setShowTaskForm(false)
                  setSelectedTask(null)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {showTaskDetails && selectedTask && (
        <TaskDetails
          taskId={selectedTask.id}
          onClose={() => {
            setShowTaskDetails(false)
            setSelectedTask(null)
          }}
          onUpdate={handleTaskUpdate}
        />
      )}
    </div>
  )
}

export default TasksList