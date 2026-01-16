import React, { useState, useEffect } from 'react'
import { useTaskManagement } from '../../contexts/TaskManagementContext'
import TaskComments from './TaskComments'
import TaskHistory from './TaskHistory'
import SubmissionForm from './submissions/SubmissionForm'
import ReviewForm from './reviews/ReviewForm'
import ProofFilePreview from './submissions/ProofFilePreview'

const TaskDetails = ({ taskId, onClose, onUpdate }) => {
  const { 
    userProfile, 
    getTaskComments, 
    getTaskHistory, 
    updateTask, 
    submitTask,
    reviewSubmission,
    getTasks
  } = useTaskManagement()
  
  const [task, setTask] = useState(null)
  const [comments, setComments] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails()
      fetchComments()
      fetchHistory()
    }
  }, [taskId, getTaskComments, getTaskHistory, getTasks])

  const fetchTaskDetails = async () => {
    try {
      // Since we don't have a direct getTaskById function in context,
      // we'll get all tasks and filter
      const tasks = await getTasks()
      const foundTask = tasks.find(t => t.id === taskId)
      
      if (!foundTask) {
        throw new Error('Task not found')
      }
      
      setTask(foundTask)
    } catch (error) {
      console.error('Error fetching task:', error)
      setError('Failed to load task details')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const commentsData = await getTaskComments(taskId)
      setComments(commentsData)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const fetchHistory = async () => {
    try {
      const historyData = await getTaskHistory(taskId)
      setHistory(historyData)
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const updatedTask = await updateTask(taskId, { status: newStatus })
      setTask(updatedTask)
      onUpdate(updatedTask)
      await fetchHistory()
    } catch (error) {
      setError(error.message)
    }
  }

  const handleSubmissionSubmit = async (submissionData, files) => {
    try {
      await submitTask(taskId, submissionData, files)
      await fetchTaskDetails() // Refresh to get updated submission
      setShowSubmissionForm(false)
    } catch (error) {
      setError(error.message)
    }
  }

  const handleReviewSubmit = async (reviewData) => {
    try {
      await reviewSubmission(selectedSubmission.id, reviewData)
      await fetchTaskDetails() // Refresh to get updated submission
      setShowReviewForm(false)
      setSelectedSubmission(null)
    } catch (error) {
      setError(error.message)
    }
  }

  const getStatusBadgeClass = (status) => {
    const baseClass = 'badge'
    switch (status) {
      case 'pending':
        return `${baseClass} bg-secondary`
      case 'in_progress':
        return `${baseClass} bg-info`
      case 'submitted':
        return `${baseClass} bg-warning`
      case 'approved':
        return `${baseClass} bg-success`
      case 'rejected':
        return `${baseClass} bg-danger`
      case 'cancelled':
        return `${baseClass} bg-dark`
      default:
        return `${baseClass} bg-secondary`
    }
  }

  const getPriorityBadgeClass = (priority) => {
    const baseClass = 'badge'
    switch (priority) {
      case 'low':
        return `${baseClass} bg-light text-dark`
      case 'medium':
        return `${baseClass} bg-info`
      case 'high':
        return `${baseClass} bg-warning`
      case 'urgent':
        return `${baseClass} bg-danger`
      default:
        return `${baseClass} bg-info`
    }
  }

  const canEdit = () => {
    if (!userProfile || !task) return false
    return userProfile.id === task.creator.id || userProfile.year === '3rd'
  }

  const canReview = () => {
    if (!userProfile) return false
    return ['2nd', '3rd'].includes(userProfile.year)
  }

  const canSubmit = () => {
    if (!userProfile || !task) return false
    return userProfile.year === '1st' && userProfile.id === task.assignee.id && task.status === 'pending'
  }

  const hasSubmission = () => {
    return task?.submissions && task.submissions.length > 0
  }

  if (loading) {
    return (
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-body text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-body text-center">
              <p>Task not found.</p>
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{task.title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="row">
              <div className="col-md-8">
                <div className="mb-4">
                  <h6>Description</h6>
                  <p>{task.description || 'No description provided'}</p>
                </div>

                {hasSubmission() && (
                  <div className="mb-4">
                    <h6>Submission</h6>
                    {task.submissions.map(submission => (
                      <div key={submission.id} className="card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <span className={`badge ${getStatusBadgeClass(submission.status)}`}>
                                {submission.status.replace('_', ' ').charAt(0).toUpperCase() + submission.status.replace('_', ' ').slice(1)}
                              </span>
                              {submission.reviewed_at && (
                                <small className="text-muted ms-2">
                                  Reviewed: {new Date(submission.reviewed_at).toLocaleDateString()}
                                </small>
                              )}
                            </div>
                            {canReview() && submission.status === 'pending' && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  setSelectedSubmission(submission)
                                  setShowReviewForm(true)
                                }}
                              >
                                Review
                              </button>
                            )}
                          </div>
                          
                          {submission.submission_notes && (
                            <p className="mb-2">{submission.submission_notes}</p>
                          )}
                          
                          {submission.proof_files && submission.proof_files.length > 0 && (
                            <div>
                              <small className="text-muted">Proof Files:</small>
                              <div className="mt-2">
                                {submission.proof_files.map(file => (
                                  <ProofFilePreview key={file.id} file={file} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {canSubmit() && !hasSubmission() && (
                  <div className="mb-4">
                    <button
                      className="btn btn-success"
                      onClick={() => setShowSubmissionForm(true)}
                    >
                      Submit Task
                    </button>
                  </div>
                )}
              </div>

              <div className="col-md-4">
                <div className="card mb-3">
                  <div className="card-body">
                    <h6>Task Details</h6>
                    <div className="mb-2">
                      <small className="text-muted">Status:</small><br />
                      <span className={getStatusBadgeClass(task.status)}>
                        {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted">Priority:</small><br />
                      <span className={getPriorityBadgeClass(task.priority)}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted">Category:</small><br />
                      {task.category || 'Not specified'}
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted">Due Date:</small><br />
                      {new Date(task.due_date).toLocaleDateString()}
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted">Assigned to:</small><br />
                      {task.assignee.name} ({task.assignee.year} Year)
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted">Created by:</small><br />
                      {task.creator.name} ({task.creator.year} Year)
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted">Created:</small><br />
                      {new Date(task.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {canEdit() && (
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6>Actions</h6>
                      {task.status === 'pending' && (
                        <button
                          className="btn btn-sm btn-outline-info w-100 mb-2"
                          onClick={() => handleStatusChange('in_progress')}
                        >
                          Mark as In Progress
                        </button>
                      )}
                      {['pending', 'in_progress'].includes(task.status) && (
                        <button
                          className="btn btn-sm btn-outline-danger w-100 mb-2"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this task?')) {
                              handleStatusChange('cancelled')
                            }
                          }}
                        >
                          Cancel Task
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr />

            <div className="row">
              <div className="col-md-6">
                <TaskComments 
                  taskId={taskId} 
                  comments={comments} 
                  onCommentAdded={fetchComments}
                />
              </div>
              <div className="col-md-6">
                <TaskHistory history={history} />
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      {showSubmissionForm && (
        <SubmissionForm
          task={task}
          onSubmit={handleSubmissionSubmit}
          onCancel={() => setShowSubmissionForm(false)}
        />
      )}

      {showReviewForm && selectedSubmission && (
        <ReviewForm
          submission={selectedSubmission}
          onSubmit={handleReviewSubmit}
          onCancel={() => {
            setShowReviewForm(false)
            setSelectedSubmission(null)
          }}
        />
      )}
    </div>
  )
}

export default TaskDetails