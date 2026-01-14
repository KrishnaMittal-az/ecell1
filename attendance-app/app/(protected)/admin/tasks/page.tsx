"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useTaskManagement } from '@/components/providers/task-management-provider'
import TaskCard from '@/components/tasks/TaskCard'
import TaskFilters from '@/components/tasks/TaskFilters'
import { Task, TaskFilters as TaskFiltersType, TaskDashboardStats } from '@/lib/types'
import Link from 'next/link'
import { Plus, RefreshCw, BarChart3 } from 'lucide-react'

export default function AdminTasksPage() {
    const { userProfile, getTasks, deleteTask, getDashboardStats, loading: providerLoading } = useTaskManagement()
    const [tasks, setTasks] = useState<Task[]>([])
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
    const [stats, setStats] = useState<TaskDashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filters, setFilters] = useState<TaskFiltersType>({})

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            setError('')
            const [tasksData, statsData] = await Promise.all([
                getTasks(filters),
                getDashboardStats()
            ])
            setTasks(tasksData)
            setFilteredTasks(tasksData)
            setStats(statsData)
        } catch (err: any) {
            console.error('Error loading data:', err)
            setError(err.message || 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }, [getTasks, getDashboardStats, filters])

    useEffect(() => {
        if (!providerLoading && userProfile) {
            loadData()
        } else if (!providerLoading && !userProfile) {
            setLoading(false)
        }
    }, [providerLoading, userProfile, loadData])

    // Apply client-side search filter
    useEffect(() => {
        let filtered = [...tasks]
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase()
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(searchTerm) ||
                (task.description && task.description.toLowerCase().includes(searchTerm))
            )
        }
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
                    <p className="text-gray-600 mt-1">
                        {filteredTasks.length} of {tasks.length} tasks
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadData}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                    <Link
                        href="/admin/tasks/create"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Task
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <StatCard label="Pending" count={stats.pending_count} color="gray" />
                    <StatCard label="In Progress" count={stats.in_progress_count} color="blue" />
                    <StatCard label="Submitted" count={stats.submitted_count} color="yellow" />
                    <StatCard label="Approved" count={stats.approved_count} color="green" />
                    <StatCard label="Rejected" count={stats.rejected_count} color="red" />
                    <StatCard label="Cancelled" count={stats.cancelled_count} color="slate" />
                    <StatCard label="Overdue" count={stats.overdue_count} color="rose" highlight />
                </div>
            )}

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
                        onFiltersChange={setFilters}
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
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    currentUser={userProfile}
                                    onDelete={() => handleDeleteTask(task.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatCard({
    label,
    count,
    color,
    highlight = false
}: {
    label: string
    count: number
    color: string
    highlight?: boolean
}) {
    const bgColors: Record<string, string> = {
        gray: 'bg-gray-50 border-gray-200',
        blue: 'bg-blue-50 border-blue-200',
        yellow: 'bg-yellow-50 border-yellow-200',
        green: 'bg-green-50 border-green-200',
        red: 'bg-red-50 border-red-200',
        slate: 'bg-slate-50 border-slate-200',
        rose: 'bg-rose-50 border-rose-300'
    }

    const textColors: Record<string, string> = {
        gray: 'text-gray-700',
        blue: 'text-blue-700',
        yellow: 'text-yellow-700',
        green: 'text-green-700',
        red: 'text-red-700',
        slate: 'text-slate-700',
        rose: 'text-rose-700'
    }

    return (
        <div className={`rounded-lg border p-4 ${bgColors[color]} ${highlight ? 'ring-2 ring-rose-300' : ''}`}>
            <p className={`text-2xl font-bold ${textColors[color]}`}>{count}</p>
            <p className="text-sm text-gray-600">{label}</p>
        </div>
    )
}
