import { motion } from 'framer-motion'
import {
    Clock,
    AlertTriangle,
    CheckCircle,
    Circle,
    ChevronRight,
} from 'lucide-react'

const priorityConfig = {
    low: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
    medium: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dot: 'bg-blue-500' },
    high: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
    critical: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' },
}

const statusConfig = {
    open: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Circle },
    in_progress: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    resolved: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
    closed: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400', icon: AlertTriangle },
}

const categoryConfig = {
    billing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    technical: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    account: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    general: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
}

export default function TicketCard({ ticket, onClick, index = 0 }) {
    const priority = priorityConfig[ticket.priority] || priorityConfig.medium
    const status = statusConfig[ticket.status] || statusConfig.open
    const category = categoryConfig[ticket.category] || categoryConfig.general
    const StatusIcon = status.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => onClick?.(ticket)}
            className="glass-card p-5 cursor-pointer group hover:shadow-xl hover:shadow-brand-500/5 dark:hover:shadow-brand-500/10 transition-all duration-500"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {ticket.title}
                </h3>
                <motion.div
                    whileHover={{ x: 4 }}
                    className="flex-shrink-0 text-gray-300 dark:text-gray-600"
                >
                    <ChevronRight className="w-4 h-4" />
                </motion.div>
            </div>

            {/* Description preview */}
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                {ticket.description}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
                <span className={`badge ${category}`}>{ticket.category}</span>
                <span className={`badge ${priority.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priority.dot} mr-1.5`} />
                    {ticket.priority}
                </span>
                <span className={`badge ${status.color}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {ticket.status.replace('_', ' ')}
                </span>
            </div>

            {/* Timestamp */}
            <div className="flex items-center text-[11px] text-gray-400 dark:text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(ticket.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </div>
        </motion.div>
    )
}
