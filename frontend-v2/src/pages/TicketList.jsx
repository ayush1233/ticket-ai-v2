import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Filter, X, Inbox, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useTickets } from '../hooks/useTickets'
import TicketCard from '../components/TicketCard'
import TicketModal from '../components/TicketModal'
import { CardSkeleton } from '../components/Skeleton'

const categories = ['', 'billing', 'technical', 'account', 'general']
const priorities = ['', 'low', 'medium', 'high', 'critical']
const statuses = ['', 'open', 'in_progress', 'resolved', 'closed']

function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])
    return debounced
}

export default function TicketList() {
    const [filters, setFilters] = useState({
        category: '',
        priority: '',
        status: '',
        search: '',
        page: 1,
    })
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [showFilters, setShowFilters] = useState(false)

    const debouncedSearch = useDebounce(filters.search, 400)

    const params = {
        ...(filters.category && { category: filters.category }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.status && { status: filters.status }),
        ...(debouncedSearch && { search: debouncedSearch }),
        page: filters.page,
    }

    const { data, isLoading, isFetching } = useTickets(params)
    const tickets = data?.results || []
    const totalPages = data?.count ? Math.ceil(data.count / 20) : 1

    const updateFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
    }

    const activeFilterCount = [filters.category, filters.priority, filters.status].filter(Boolean).length

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Tickets
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {data?.count ?? 0} total tickets
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            placeholder="Search tickets..."
                            className="input-field pl-10 py-2.5 text-sm"
                        />
                        {filters.search && (
                            <button
                                onClick={() => updateFilter('search', '')}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>

                    {/* Filter toggle */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowFilters(!showFilters)}
                        className={`relative btn-secondary py-2.5 ${showFilters ? 'ring-2 ring-brand-500/30' : ''}`}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </motion.button>
                </div>
            </motion.div>

            {/* Filter Bar */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mb-6"
                    >
                        <div className="glass-card p-4 flex flex-wrap gap-3">
                            <select
                                value={filters.category}
                                onChange={(e) => updateFilter('category', e.target.value)}
                                className="input-field py-2 text-sm w-auto"
                            >
                                <option value="">All Categories</option>
                                {categories.filter(Boolean).map((c) => (
                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                ))}
                            </select>
                            <select
                                value={filters.priority}
                                onChange={(e) => updateFilter('priority', e.target.value)}
                                className="input-field py-2 text-sm w-auto"
                            >
                                <option value="">All Priorities</option>
                                {priorities.filter(Boolean).map((p) => (
                                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                ))}
                            </select>
                            <select
                                value={filters.status}
                                onChange={(e) => updateFilter('status', e.target.value)}
                                className="input-field py-2 text-sm w-auto"
                            >
                                <option value="">All Statuses</option>
                                {statuses.filter(Boolean).map((s) => (
                                    <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>
                                ))}
                            </select>
                            {activeFilterCount > 0 && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setFilters({ category: '', priority: '', status: '', search: '', page: 1 })}
                                    className="text-xs text-red-500 hover:text-red-600 font-medium"
                                >
                                    Clear all
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading indicator bar */}
            <AnimatePresence>
                {isFetching && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-0.5 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500 rounded-full mb-4 animate-shimmer"
                        style={{ backgroundSize: '200% 100%' }}
                    />
                )}
            </AnimatePresence>

            {/* Ticket Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : tickets.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-16 text-center"
                >
                    <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                        No tickets found
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                        {debouncedSearch || activeFilterCount > 0
                            ? 'Try adjusting your filters'
                            : 'Create your first ticket to get started'}
                    </p>
                </motion.div>
            ) : (
                <>
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                    >
                        <AnimatePresence>
                            {tickets.map((ticket, i) => (
                                <TicketCard
                                    key={ticket.id}
                                    ticket={ticket}
                                    index={i}
                                    onClick={setSelectedTicket}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-center gap-2 mt-8"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilters(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                                disabled={filters.page === 1}
                                className="btn-secondary py-2 px-3 disabled:opacity-40"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </motion.button>
                            <span className="text-sm text-gray-500 dark:text-gray-400 px-4">
                                Page {filters.page} of {totalPages}
                            </span>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilters(p => ({ ...p, page: Math.min(totalPages, p.page + 1) }))}
                                disabled={filters.page === totalPages}
                                className="btn-secondary py-2 px-3 disabled:opacity-40"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </motion.button>
                        </motion.div>
                    )}
                </>
            )}

            {/* Ticket Detail Modal */}
            <AnimatePresence>
                {selectedTicket && (
                    <TicketModal
                        ticket={selectedTicket}
                        onClose={() => setSelectedTicket(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    )
}
