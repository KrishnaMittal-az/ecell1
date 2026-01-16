"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useTaskManagement } from '@/components/providers/task-management-provider'
import TaskCard from '@/components/tasks/TaskCard'
import TaskFilters from '@/components/tasks/TaskFilters'
import { Task, TaskFilters as TaskFiltersType } from '@/lib/types'
import Link from 'next/link'
import { Plus, RefreshCw } from 'lucide-react'

export default function TasksPage() {
    const { userProfile, getTasks, deleteTask, loading: providerLoading } = useTaskManagement()
    const [tasks, setTasks] = useState<Task[]>([])
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filters, setFilters] = useState<TaskFiltersType>({})
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)

    const loadTasks = useCallback(async () => {
        try {
            setLoading(true)
            setError('')
            const data = await getTasks(filters)
            setTasks(data)
            setFilteredTasks(data)
        } catch (err: any) {
            console.error('Error loading tasks:', err)
            setError(err.message || 'Failed to load tasks')
        } finally {
            setLoading(false)
        }
    }, [getTasks, filters])

    useEffect(() => {
        if (!providerLoading && userProfile) {
            loadTasks()
        } else if (!providerLoading && !userProfile) {
            setLoading(false)
        }
    }, [providerLoading, userProfile, loadTasks])

    // Apply client-side filters
    useEffect(() => {
        let filtered = [...tasks]

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase()
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(searchTerm) ||
                (task.description && task.description.toLowerCase().includes(searchTerm))
            )
        }

        // Sort by due date (overdue first)
        filtered.sort((a, b) => {
            const aOverdue = new Date(a.due_date) < new Date() && !['approved', 'rejected', 'cancelled'].includes(a.status)
            const bOverdue = new Date(b.due_date) < new Date() && !['approved', 'rejected', 'cancelled'].includes(b.status)

            if (aOverdue && !bOverdue) return -1
            if (!aOverdue && bOverdue) return 1

            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        })

        setFilteredTasks(filtered)
    }, [tasks, filters])

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return

        try {
            await deleteTask(taskId)
            setTasks(prev => prev.filter(t => t.id !== taskId))
        } catch (err: any) {
            setError(err.message || 'Failed to delete task')
        }
    }

    const handleFiltersChange = (newFilters: TaskFiltersType) => {
        setFilters(newFilters)
    }

    const canCreateTask = userProfile?.year === '2nd' || userProfile?.year === '3rd'

    if (providerLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-gray-600">Loading tasks...</p>
                </div>
            </div>
        )
    }

    if (!userProfile) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
                <p className="text-gray-600 mb-4">You need to be signed in to view tasks</p>
                <Link href="/login" className="btn btn-primary">
                    Go to Login
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                    <p className="text-gray-600 mt-1">
                        {filteredTasks.length} of {tasks.length} tasks
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadTasks}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                    {canCreateTask && (
                        <Link
                            href="/council/tasks/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Task
                        </Link>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                    <TaskFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                    />
                </div>

                {/* Tasks List */}
                <div className="lg:col-span-3">
                    {filteredTasks.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                            <div className="text-5xl mb-4">📋</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                            <p className="text-gray-600 mb-4">
                                {tasks.length === 0
                                    ? 'No tasks have been created yet.'
                                    : 'No tasks match your current filters.'}
                            </p>
                            {canCreateTask && tasks.length === 0 && (
                                <Link
                                    href="/council/tasks/create"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Create Your First Task
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    currentUser={userProfile}
                                    onDelete={() => handleDeleteTask(task.id)}
                                    onClick={() => setSelectedTask(task)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Task Details Modal */}
            {selectedTask && (
                <TaskDetailsModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    currentUser={userProfile}
                />
            )}
        </div>
    )
}

// Simple Task Details Modal
function TaskDetailsModal({
    task,
    onClose,
    currentUser
}: {
    task: Task
    onClose: () => void
    currentUser: any
}) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                ${task.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    task.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        task.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                {task.status.replace('_', ' ')}
                            </span>
                            <span className={`ml-2 inline-flex px-2 py-1 rounded-full text-xs font-medium
                ${task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                    task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                        task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'}`}>
                                {task.priority}
                            </span>
                        </div>

                        {task.description && (
                            <div>
                                <h3 className="font-medium text-gray-700 mb-1">Description</h3>
                                <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium text-gray-700">Assigned To</h3>
                                <p className="text-gray-600">{task.assignee?.name || 'Unknown'}</p>
                                {task.assignee?.year && (
                                    <p className="text-sm text-gray-500">{task.assignee.year} Year</p>
                                )}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Created By</h3>
                                <p className="text-gray-600">{task.creator?.name || 'Unknown'}</p>
                                {task.creator?.year && (
                                    <p className="text-sm text-gray-500">{task.creator.year} Year</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium text-gray-700">Due Date</h3>
                                <p className={`${new Date(task.due_date) < new Date() && !['approved', 'rejected', 'cancelled'].includes(task.status) ? 'text-red-600' : 'text-gray-600'}`}>
                                    {new Date(task.due_date).toLocaleDateString()}
                                </p>
                            </div>
                            {task.category && (
                                <div>
                                    <h3 className="font-medium text-gray-700">Category</h3>
                                    <p className="text-gray-600 capitalize">{task.category}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Close
                        </button>
                        <Link
                            href={`/council/tasks/${task.id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            View Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
