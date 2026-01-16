"use client"

import React from 'react'
import { TaskFilters as TaskFiltersType, TaskStatus, TaskPriority } from '@/lib/types'
import { Search, X } from 'lucide-react'

interface TaskFiltersProps {
    filters: TaskFiltersType
    onFiltersChange: (filters: TaskFiltersType) => void
}

const statusOptions: { value: TaskStatus | ''; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
]

const priorityOptions: { value: TaskPriority | ''; label: string }[] = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
]

const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'project', label: 'Project' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'event', label: 'Event' },
    { value: 'research', label: 'Research' },
    { value: 'design', label: 'Design' },
    { value: 'development', label: 'Development' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'other', label: 'Other' },
]

export default function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
    const updateFilter = (key: keyof TaskFiltersType, value: string) => {
        onFiltersChange({
            ...filters,
            [key]: value || undefined
        })
    }

    const clearFilters = () => {
        onFiltersChange({})
    }

    const hasActiveFilters = Object.values(filters).some(v => v)

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                        <X className="w-3 h-3" />
                        Clear
                    </button>
                )}
            </div>

            {/* Search */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={filters.search || ''}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Status */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                    value={filters.status || ''}
                    onChange={(e) => updateFilter('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Priority */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                    value={filters.priority || ''}
                    onChange={(e) => updateFilter('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {priorityOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Category */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                    value={filters.category || ''}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {categoryOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Quick Filters */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filters</label>
                <div className="space-y-2">
                    <button
                        onClick={() => onFiltersChange({ status: 'pending' })}
                        className={`w-full px-3 py-2 text-left text-sm rounded-lg border transition-colors
              ${filters.status === 'pending'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                        🕐 Pending Tasks
                    </button>
                    <button
                        onClick={() => onFiltersChange({ status: 'submitted' })}
                        className={`w-full px-3 py-2 text-left text-sm rounded-lg border transition-colors
              ${filters.status === 'submitted'
                                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                        📤 Awaiting Review
                    </button>
                    <button
                        onClick={() => onFiltersChange({ priority: 'urgent' })}
                        className={`w-full px-3 py-2 text-left text-sm rounded-lg border transition-colors
              ${filters.priority === 'urgent'
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                        🔥 Urgent Tasks
                    </button>
                </div>
            </div>
        </div>
    )
}
