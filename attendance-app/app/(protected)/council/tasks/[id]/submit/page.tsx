"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTaskManagement } from '@/components/providers/task-management-provider'
import { Task } from '@/lib/types'
import { ArrowLeft, Upload, X, FileText, Image } from 'lucide-react'
import Link from 'next/link'

const MAX_FILES = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]

export default function SubmitTaskPage() {
    const params = useParams()
    const router = useRouter()
    const taskId = params.id as string

    const { userProfile, getTaskById, submitTask, loading: providerLoading } = useTaskManagement()

    const [task, setTask] = useState<Task | null>(null)
    const [notes, setNotes] = useState('')
    const [files, setFiles] = useState<File[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

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

    useEffect(() => {
        if (!providerLoading && userProfile) {
            loadTask()
        }
    }, [providerLoading, userProfile, loadTask])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || [])

        // Validate number of files
        if (files.length + selectedFiles.length > MAX_FILES) {
            setError(`Maximum ${MAX_FILES} files allowed`)
            return
        }

        // Validate each file
        for (const file of selectedFiles) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                setError(`File type not allowed: ${file.name}`)
                return
            }
            if (file.size > MAX_FILE_SIZE) {
                setError(`File too large: ${file.name} (max 10MB)`)
                return
            }
        }

        setFiles(prev => [...prev, ...selectedFiles])
        setError('')
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        try {
            if (files.length === 0) {
                throw new Error('Please upload at least one proof file')
            }

            await submitTask(taskId, { notes }, files)
            router.push(`/council/tasks/${taskId}`)
        } catch (err: any) {
            setError(err.message || 'Failed to submit task')
        } finally {
            setSubmitting(false)
        }
    }

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) {
            return <Image className="w-5 h-5 text-blue-500" />
        }
        return <FileText className="w-5 h-5 text-gray-500" />
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
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

    // Permission checks
    const canSubmit = userProfile?.year === '1st' &&
        userProfile?.id === task?.assignee?.id &&
        task?.status === 'pending'

    if (!canSubmit) {
        return (
            <div className="text-center py-12">
                <div className="text-5xl mb-4">🚫</div>
                <h2 className="text-xl font-semibold mb-2">Cannot Submit</h2>
                <p className="text-gray-600 mb-4">
                    {userProfile?.year !== '1st'
                        ? 'Only 1st year students can submit tasks'
                        : task?.status !== 'pending'
                            ? 'This task has already been submitted or completed'
                            : 'This task is not assigned to you'}
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
                <h1 className="text-2xl font-bold text-gray-900">Submit Task</h1>
                <p className="text-gray-600 mt-1">{task?.title}</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                {/* Task Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Task Details</h3>
                    <p className="text-gray-600 text-sm">{task?.description || 'No description provided.'}</p>
                </div>

                {/* Submission Notes */}
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        Submission Notes
                    </label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes about your submission..."
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Proof Files <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                        Upload proof of your completed work (PDF, images, or documents). Max {MAX_FILES} files, 10MB each.
                    </p>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <input
                            type="file"
                            multiple
                            accept={ALLOWED_TYPES.join(',')}
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer"
                        >
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">Click to upload or drag and drop</p>
                            <p className="text-sm text-gray-500">PDF, JPG, PNG, DOC, DOCX, XLS, XLSX</p>
                        </label>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        {getFileIcon(file.type)}
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="p-1 text-gray-400 hover:text-red-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
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
                        disabled={submitting || files.length === 0}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Submit Task
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
