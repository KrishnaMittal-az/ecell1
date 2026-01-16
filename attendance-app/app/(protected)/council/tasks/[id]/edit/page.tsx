"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTaskManagement } from '@/components/providers/task-management-provider'
import { Task, TaskPriority, TaskUserProfile } from '@/lib/types'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

const priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
]

const categoryOptions = [
    { value: '', label: 'Select category' },
    { value: 'project', label: 'Project' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'event', label: 'Event' },
    { value: 'research', label: 'Research' },
    { value: 'design', label: 'Design' },
    { value: 'development', label: 'Development' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'other', label: 'Other' },
]

export default function EditTaskPage() {
    const params = useParams()
    const router = useRouter()
    const taskId = params.id as string

    const { userProfile, getTaskById, updateTask, getAssignableUsers, loading: providerLoading } = useTaskManagement()

    const [task, setTask] = useState<Task | null>(null)
    const [users, setUsers] = useState<TaskUserProfile[]>([])
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        priority: 'medium' as TaskPriority,
        category: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const [taskData, usersData] = await Promise.all([
                getTaskById(taskId),
                getAssignableUsers()
            ])

            if (!taskData) {
                setError('Task not found')
                return
            }

            setTask(taskData)
            setUsers(usersData)

            // Populate form with existing data
            setFormData({
                title: taskData.title,
                description: taskData.description || '',
                assigned_to: taskData.assigned_to,
                due_date: new Date(taskData.due_date).toISOString().split('T')[0],
                priority: taskData.priority,
                category: taskData.category || ''
            })
        } catch (err: any) {
            setError(err.message || 'Failed to load task')
        } finally {
            setLoading(false)
        }
    }, [taskId, getTaskById, getAssignableUsers])

    useEffect(() => {
        if (!providerLoading && userProfile) {
            loadData()
        }
    }, [providerLoading, userProfile, loadData])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        try {
            if (!formData.title.trim()) {
                throw new Error('Title is required')
            }
            if (!formData.assigned_to) {
                throw new Error('Please assign the task to someone')
            }
            if (!formData.due_date) {
                throw new Error('Due date is required')
            }

            await updateTask(taskId, {
                title: formData.title,
                description: formData.description,
                assigned_to: formData.assigned_to,
                due_date: new Date(formData.due_date).toISOString(),
                priority: formData.priority,
                category: formData.category || null
            })

            router.push(`/council/tasks/${taskId}`)
        } catch (err: any) {
            setError(err.message || 'Failed to update task')
        } finally {
            setSaving(false)
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

    // Permission check
    const canEdit = userProfile && task &&
        (userProfile.id === task.creator?.id || userProfile.year === '3rd')

    if (!canEdit) {
        return (
            <div className="text-center py-12">
                <div className="text-5xl mb-4">🚫</div>
                <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                <p className="text-gray-600 mb-4">
                    You don't have permission to edit this task
                </p>
                <Link href="/council/tasks" className="text-blue-600 hover:underline">
                    Go back to tasks
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href={`/council/tasks/${taskId}`}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Task
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter task title"
                        maxLength={200}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the task requirements..."
                        rows={4}
                        maxLength={5000}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Assign To */}
                <div>
                    <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-1">
                        Assign To <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="assigned_to"
                        name="assigned_to"
                        value={formData.assigned_to}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Select assignee</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.name} {user.year && `(${user.year} Year)`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Due Date */}
                    <div>
                        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                            Due Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="due_date"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                            Priority
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {priorityOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                    </label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {categoryOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Link
                        href={`/council/tasks/${taskId}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
