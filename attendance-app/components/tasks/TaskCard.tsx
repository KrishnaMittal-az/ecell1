"use client"

import React from 'react'
import { Task, TaskUserProfile } from '@/lib/types'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import { Calendar, User, MessageSquare, Trash2, Edit, Send } from 'lucide-react'
import Link from 'next/link'

interface TaskCardProps {
  task: Task
  currentUser: TaskUserProfile | null
  onClick?: () => void
  onDelete?: () => void
  onEdit?: () => void
}

export default function TaskCard({
  task,
  currentUser,
  onClick,
  onDelete,
  onEdit
}: TaskCardProps) {
  const {
    id,
    title,
    description,
    status,
    priority,
    due_date,
    creator,
    assignee,
    comments = []
  } = task

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-200 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-slate-100 text-slate-700'
      case 'medium':
        return 'bg-blue-100 text-blue-700'
      case 'high':
        return 'bg-orange-100 text-orange-700'
      case 'urgent':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-blue-100 text-blue-700'
    }
  }

  const isOverdue = isPast(new Date(due_date)) && !['approved', 'rejected', 'cancelled'].includes(status)
  const canEdit = currentUser && (currentUser.id === creator?.id || currentUser.year === '3rd')
  const canDelete = currentUser && (currentUser.id === creator?.id || currentUser.year === '3rd')
  const canSubmit = currentUser?.year === '1st' && currentUser?.id === assignee?.id && status === 'pending'

  const commentCount = Array.isArray(comments)
    ? (comments[0] as any)?.count || 0
    : 0

  return (
    <div
      className={`bg-white rounded-lg border ${isOverdue ? 'border-red-300' : 'border-gray-200'} p-4 hover:shadow-md transition-shadow cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Title and badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityStyles(priority)}`}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(status)}`}>
              {status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          </div>

          {/* Description */}
          {description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{assignee?.name || 'Unassigned'}</span>
              {assignee?.year && (
                <span className="text-gray-400">({assignee.year} Year)</span>
              )}
            </div>
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(due_date), 'MMM dd, yyyy')}</span>
              {isOverdue && <span className="text-xs">(Overdue)</span>}
            </div>
            {commentCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{commentCount}</span>
              </div>
            )}
          </div>

          {/* Created by */}
          <div className="mt-2 text-xs text-gray-400">
            Created by {creator?.name || 'Unknown'} • {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {canSubmit && (
            <Link
              href={`/council/tasks/${id}/submit`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
            >
              <Send className="w-3 h-3 mr-1" />
              Submit
            </Link>
          )}
          {canEdit && (
            <Link
              href={`/council/tasks/${id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Link>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.()
              }}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
