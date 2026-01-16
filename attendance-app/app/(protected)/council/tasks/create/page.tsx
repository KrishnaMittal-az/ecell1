"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTaskManagement } from '@/components/providers/task-management-provider'
import { CreateTaskFormData, TaskPriority, TaskUserProfile } from '@/lib/types'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-700' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
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

export default function CreateTaskPage() {
    const router = useRouter()
    const { userProfile, createTask, getAssignableUsers, loading: providerLoading } = useTaskManagement()

    const [formData, setFormData] = useState<CreateTaskFormData>({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        priority: 'medium',
        category: ''
    })
    const [users, setUsers] = useState<TaskUserProfile[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await getAssignableUsers()
                setUsers(data)
            } catch (err) {
                console.error('Error loading users:', err)
            }
        }
        if (userProfile) {
            loadUsers()
        }
    }, [userProfile, getAssignableUsers])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
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

            await createTask(formData)
            router.push('/council/tasks')
        } catch (err: any) {
            setError(err.message || 'Failed to create task')
        } finally {
            setLoading(false)
        }
    }

    // Check permissions
    const canCreateTask = userProfile?.year === '2nd' || userProfile?.year === '3rd'

    if (providerLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!canCreateTask) {
        return (
            <div className="text-center py-12">
                <div className="text-5xl mb-4">🚫</div>
                <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                <p className="text-gray-600 mb-4">Only 2nd and 3rd year students can create tasks</p>
                <Link href="/council/tasks" className="text-blue-600 hover:underline">
                    Go back to tasks
                </Link>
            </div>
        )
    }

    // Get minimum date (today)
    const minDate = new Date().toISOString().split('T')[0]

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/council/tasks"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tasks
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
                <p className="text-gray-600 mt-1">
                    Assign a task to team members
                </p>
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
                    {userProfile?.year === '2nd' && (
                        <p className="text-xs text-gray-500 mt-1">
                            2nd year can only assign to 1st year students
                        </p>
                    )}
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
                            min={minDate}
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
                        href="/council/tasks"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Create Task
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
