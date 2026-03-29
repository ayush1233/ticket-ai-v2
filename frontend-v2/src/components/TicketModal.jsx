import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, CheckCircle, Circle, AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import { useUpdateTicket, useDeleteTicket } from '../hooks/useTickets'
import { useToast } from './Toast'

const statuses = [
    { value: 'open', label: 'Open', icon: Circle, color: 'text-blue-500' },
    { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-amber-500' },
    { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'text-emerald-500' },
    { value: 'closed', label: 'Closed', icon: AlertTriangle, color: 'text-gray-500' },
]

const priorityColors = {
    low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const categoryColors = {
    billing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    technical: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    account: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    general: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
}

export default function TicketModal({ ticket, onClose }) {
    const [currentStatus, setCurrentStatus] = useState(ticket?.status || 'open')
    const updateTicket = useUpdateTicket()
    const deleteTicket = useDeleteTicket()
    const { addToast } = useToast()

    if (!ticket) return null

    const handleStatusChange = async (newStatus) => {
        setCurrentStatus(newStatus)
        try {
            await updateTicket.mutateAsync({ id: ticket.id, status: newStatus })
            addToast(`Status updated to ${newStatus.replace('_', ' ')}`, 'success')
        } catch {
            addToast('Failed to update status', 'error')
            setCurrentStatus(ticket.status)
        }
    }

    const handleDelete = async () => {
        try {
            await deleteTicket.mutateAsync(ticket.id)
            addToast('Ticket deleted successfully', 'success')
            onClose()
        } catch {
            addToast('Failed to delete ticket', 'error')
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-lg glass-card p-0 overflow-hidden"
                >
                    {/* Header gradient */}
                    <div className="h-1.5 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500" />

                    <div className="p-6">
                        {/* Close button */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </motion.button>

                        {/* Title */}
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl font-bold text-gray-900 dark:text-white pr-10 mb-2"
                        >
                            {ticket.title}
                        </motion.h2>

                        {/* Badges */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="flex flex-wrap gap-2 mb-5"
                        >
                            <span className={`badge ${categoryColors[ticket.category]}`}>
                                {ticket.category}
                            </span>
                            <span className={`badge ${priorityColors[ticket.priority]}`}>
                                {ticket.priority}
                            </span>
                            <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                #{ticket.id}
                            </span>
                        </motion.div>

                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-6"
                        >
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                                Description
                            </h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {ticket.description}
                            </p>
                        </motion.div>

                        {/* Status Update */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="mb-6"
                        >
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                                Update Status
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {statuses.map((s) => {
                                    const Icon = s.icon
                                    const isActive = currentStatus === s.value
                                    return (
                                        <motion.button
                                            key={s.value}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => handleStatusChange(s.value)}
                                            disabled={updateTicket.isPending}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                                                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500/30'
                                                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? s.color : ''}`} />
                                            {s.label}
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </motion.div>

                        {/* Timestamps */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-4"
                        >
                            <span>
                                Created: {new Date(ticket.created_at).toLocaleString()}
                            </span>
                            <span>
                                Updated: {new Date(ticket.updated_at).toLocaleString()}
                            </span>
                        </motion.div>

                        {/* Delete button */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDelete}
                            disabled={deleteTicket.isPending}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                        >
                            {deleteTicket.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            Delete Ticket
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
