import React, { useState } from 'react'
import { useTaskManagement } from '../../contexts/TaskManagementContext'
import { formatDistanceToNow } from 'date-fns'

const TaskComments = ({ taskId, comments, onCommentAdded }) => {
  const { userProfile, addComment } = useTaskManagement()
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    setError('')

    try {
      await addComment(taskId, newComment.trim())
      setNewComment('')
      onCommentAdded()
    } catch (error) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!userProfile) {
    return <div>Loading...</div>
  }

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="mb-0">
          Comments ({comments.length})
        </h6>
      </div>
      <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {comments.length === 0 ? (
          <p className="text-muted text-center mb-0">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="mb-3">
            {comments.map((comment) => (
              <div key={comment.id} className="mb-3 pb-3 border-bottom">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div className="fw-bold">
                    {comment.commenter.name}
                    <small className="text-muted ms-2">
                      ({comment.commenter.year} Year)
                    </small>
                  </div>
                  <small className="text-muted">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </small>
                </div>
                <p className="mb-0">{comment.comment}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}
          
          <div className="mb-2">
            <textarea
              className="form-control"
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              maxLength={1000}
            />
          </div>
          
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              {newComment.length}/1000 characters
            </small>
            <button
              type="submit"
              className="btn btn-sm btn-primary"
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? 'Adding...' : 'Add Comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskComments