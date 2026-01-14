"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTaskManagement } from '@/components/providers/task-management-provider'
import { Task, TaskComment, TaskHistory } from '@/lib/types'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import {
    ArrowLeft,
    Calendar,
    User,
    Clock,
    Edit,
    MessageSquare,
    History,
    Send,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function TaskDetailPage() {
    const params = useParams()
    const router = useRouter()
    const taskId = params.id as string

    const {
        userProfile,
        getTaskById,
        getTaskComments,
        addComment,
        getTaskHistory,
        updateTask,
        reviewSubmission,
        loading: providerLoading
    } = useTaskManagement()

    const [task, setTask] = useState<Task | null>(null)
    const [comments, setComments] = useState<TaskComment[]>([])
    const [history, setHistory] = useState<TaskHistory[]>([])
    const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [newComment, setNewComment] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const loadTask = useCallback(async () => {
        try {
            setLoading(true)
            const data = await getTaskById(taskId)
            if (!data) {
                setError('Task not found')
                return
            }
            setTask(data)
        } catch (err: any) {
            setError(err.message || 'Failed to load task')
        } finally {
            setLoading(false)
        }
    }, [taskId, getTaskById])

    const loadComments = useCallback(async () => {
        try {
            const data = await getTaskComments(taskId)
            setComments(data)
        } catch (err) {
            console.error('Error loading comments:', err)
        }
    }, [taskId, getTaskComments])

    const loadHistory = useCallback(async () => {
        try {
            const data = await getTaskHistory(taskId)
            setHistory(data)
        } catch (err) {
            console.error('Error loading history:', err)
        }
    }, [taskId, getTaskHistory])

    useEffect(() => {
        if (!providerLoading && userProfile) {
            loadTask()
            loadComments()
            loadHistory()
        }
    }, [providerLoading, userProfile, loadTask, loadComments, loadHistory])

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setSubmitting(true)
        try {
            const comment = await addComment(taskId, newComment.trim())
            setComments(prev => [...prev, comment])
            setNewComment('')
        } catch (err: any) {
            setError(err.message || 'Failed to add comment')
        } finally {
            setSubmitting(false)
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        try {
            await updateTask(taskId, { status: newStatus as any })
            loadTask()
        } catch (err: any) {
            setError(err.message || 'Failed to update status')
        }
    }

    const handleReview = async (submissionId: string, status: string) => {
        const notes = prompt(`Add review notes (optional):`)
        try {
            await reviewSubmission(submissionId, { status, notes: notes || undefined })
            loadTask()
        } catch (err: any) {
            setError(err.message || 'Failed to review submission')
        }
    }

    if (providerLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-600">Loading task...</p>
                </div>
            </div>
        )
    }

    if (error || !task) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Error</h2>
                <p className="text-gray-600 mb-4">{error || 'Task not found'}</p>
                <Link href="/council/tasks" className="text-blue-600 hover:underline">
                    Go back to tasks
                </Link>
            </div>
        )
    }

    const isOverdue = isPast(new Date(task.due_date)) && !['approved', 'rejected', 'cancelled'].includes(task.status)
    const canEdit = userProfile && (userProfile.id === task.creator?.id || userProfile.year === '3rd')
    const canReview = userProfile && ['2nd', '3rd'].includes(userProfile.year || '')
    const submissions = task.submissions || []

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <Link
                        href="/council/tasks"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Tasks
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>

                    {/* Status and Priority badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium
              ${task.status === 'approved' ? 'bg-green-100 text-green-800' :
                                task.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    task.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                            task.status === 'cancelled' ? 'bg-gray-200 text-gray-600' :
                                                'bg-gray-100 text-gray-800'}`}>
                            {task.status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium
              ${task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                    task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                        'bg-slate-100 text-slate-700'}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </span>
                        {task.category && (
                            <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                            </span>
                        )}
                    </div>
                </div>

                {canEdit && (
                    <Link
                        href={`/council/tasks/${taskId}/edit`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Link>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-8">
                    {(['details', 'comments', 'history'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab === 'details' && 'Details'}
                            {tab === 'comments' && `Comments (${comments.length})`}
                            {tab === 'history' && 'History'}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'details' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
                            <p className="text-gray-600 whitespace-pre-wrap">
                                {task.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Submissions */}
                        {submissions.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="font-semibold text-gray-900 mb-3">Submissions</h2>
                                <div className="space-y-4">
                                    {submissions.map((submission: any) => (
                                        <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="font-medium">{submission.submitter?.name || 'Unknown'}</span>
                                                    <span className="text-gray-500 text-sm ml-2">
                                                        {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-medium
                          ${submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            submission.status === 'revision_requested' ? 'bg-orange-100 text-orange-800' :
                                                                'bg-yellow-100 text-yellow-800'}`}>
                                                    {submission.status.replace('_', ' ')}
                                                </span>
                                            </div>

                                            {submission.submission_notes && (
                                                <p className="text-gray-600 text-sm mb-3">{submission.submission_notes}</p>
                                            )}

                                            {/* Proof Files */}
                                            {submission.proof_files && submission.proof_files.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</p>
                                                    <div className="space-y-1">
                                                        {submission.proof_files.map((file: any) => (
                                                            <div key={file.id} className="flex items-center text-sm text-blue-600">
                                                                📎 {file.file_name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Review Actions */}
                                            {canReview && submission.status === 'pending' && (
                                                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                                                    <button
                                                        onClick={() => handleReview(submission.id, 'approved')}
                                                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReview(submission.id, 'revision_requested')}
                                                        className="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700"
                                                    >
                                                        <AlertCircle className="w-4 h-4 mr-1" />
                                                        Request Revision
                                                    </button>
                                                    <button
                                                        onClick={() => handleReview(submission.id, 'rejected')}
                                                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Task Info */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                            <div>
                                <div className="flex items-center text-sm text-gray-500 mb-1">
                                    <User className="w-4 h-4 mr-2" />
                                    Assigned To
                                </div>
                                <p className="font-medium">{task.assignee?.name || 'Unassigned'}</p>
                                {task.assignee?.year && (
                                    <p className="text-sm text-gray-500">{task.assignee.year} Year</p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center text-sm text-gray-500 mb-1">
                                    <User className="w-4 h-4 mr-2" />
                                    Created By
                                </div>
                                <p className="font-medium">{task.creator?.name || 'Unknown'}</p>
                                {task.creator?.year && (
                                    <p className="text-sm text-gray-500">{task.creator.year} Year</p>
                                )}
                            </div>

                            <div>
                                <div className={`flex items-center text-sm mb-1 ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Due Date
                                </div>
                                <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                                    {format(new Date(task.due_date), 'MMMM dd, yyyy')}
                                </p>
                                {isOverdue && (
                                    <p className="text-sm text-red-500">Overdue</p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center text-sm text-gray-500 mb-1">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Created
                                </div>
                                <p className="font-medium">
                                    {format(new Date(task.created_at), 'MMM dd, yyyy')}
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        {canEdit && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                                <div className="space-y-2">
                                    {task.status === 'pending' && (
                                        <button
                                            onClick={() => handleStatusChange('in_progress')}
                                            className="w-full px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm"
                                        >
                                            Mark In Progress
                                        </button>
                                    )}
                                    {task.status !== 'cancelled' && !['approved', 'rejected'].includes(task.status) && (
                                        <button
                                            onClick={() => handleStatusChange('cancelled')}
                                            className="w-full px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm"
                                        >
                                            Cancel Task
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'comments' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    {/* Comment Form */}
                    <form onSubmit={handleAddComment} className="mb-6">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                        />
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No comments yet</p>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                                        {comment.commenter?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-900">{comment.commenter?.name || 'Unknown'}</span>
                                            <span className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-gray-600">{comment.comment}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="space-y-4">
                        {history.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No history available</p>
                        ) : (
                            history.map(item => (
                                <div key={item.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                        <History className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-900">
                                            <span className="font-medium">{item.performer?.name || 'Unknown'}</span>
                                            {' '}
                                            <span className="text-gray-600">{item.action.replace('_', ' ')}</span>
                                            {item.new_value && (
                                                <span className="text-gray-600">: {item.new_value}</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
