import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart, Bar, PieChart, Pie, Cell,
    ResponsiveContainer, Tooltip, Legend, XAxis, YAxis,
} from 'recharts'
import {
    Ticket, CheckCircle, Clock, TrendingUp,
    AlertTriangle, Layers,
} from 'lucide-react'
import { useTicketStats } from '../hooks/useTickets'
import { StatSkeleton, ChartSkeleton } from '../components/Skeleton'

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
const BAR_COLORS = ['#8b5cf6', '#6366f1', '#06b6d4', '#6b7280']

function AnimatedCounter({ value, duration = 1500 }) {
    const [display, setDisplay] = useState(0)
    const ref = useRef(null)

    useEffect(() => {
        let start = 0
        const end = typeof value === 'number' ? value : 0
        if (start === end) { setDisplay(end); return }

        const startTime = Date.now()
        const tick = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(Math.floor(eased * end))
            if (progress < 1) ref.current = requestAnimationFrame(tick)
        }
        ref.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(ref.current)
    }, [value, duration])

    return <span>{display}</span>
}

const statCards = [
    { key: 'total_tickets', label: 'Total Tickets', icon: Ticket, gradient: 'from-brand-500 to-purple-600', shadow: 'shadow-brand-500/20' },
    { key: 'open_tickets', label: 'Open', icon: Clock, gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
    { key: 'resolved_tickets', label: 'Resolved', icon: CheckCircle, gradient: 'from-emerald-500 to-green-500', shadow: 'shadow-emerald-500/20' },
    { key: 'avg_tickets_per_day', label: 'Avg / Day', icon: TrendingUp, gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
]

export default function Dashboard() {
    const { data: stats, isLoading } = useTicketStats()

    const priorityData = stats?.priority_breakdown
        ? Object.entries(stats.priority_breakdown).map(([name, value]) => ({ name, value }))
        : []

    const categoryData = stats?.category_breakdown
        ? Object.entries(stats.category_breakdown).map(([name, value]) => ({ name, value }))
        : []

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Overview of your support ticket system
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {isLoading
                    ? Array(4).fill(0).map((_, i) => <StatSkeleton key={i} />)
                    : statCards.map((card, i) => {
                        const Icon = card.icon
                        const val = stats?.[card.key] ?? 0
                        return (
                            <motion.div
                                key={card.key}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 300 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                className={`glass-card p-5 relative overflow-hidden group`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                        {card.label}
                                    </p>
                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow}`}>
                                        <Icon className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    <AnimatedCounter value={val} />
                                </p>
                                {/* Hover glow */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 rounded-2xl`} />
                            </motion.div>
                        )
                    })
                }
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoading ? (
                    <>
                        <ChartSkeleton />
                        <ChartSkeleton />
                    </>
                ) : (
                    <>
                        {/* Priority Pie Chart */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Priority Breakdown
                                </h3>
                            </div>
                            {priorityData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={priorityData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={4}
                                            dataKey="value"
                                            animationBegin={0}
                                            animationDuration={1200}
                                        >
                                            {priorityData.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(17,24,39,0.9)',
                                                border: 'none',
                                                borderRadius: '12px',
                                                color: '#fff',
                                                fontSize: '12px',
                                            }}
                                        />
                                        <Legend
                                            wrapperStyle={{ fontSize: '12px' }}
                                            formatter={(value) => (
                                                <span className="text-gray-600 dark:text-gray-400 capitalize">{value}</span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-sm text-gray-400">
                                    No data available
                                </div>
                            )}
                        </motion.div>

                        {/* Category Bar Chart */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Layers className="w-4 h-4 text-indigo-500" />
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Category Breakdown
                                </h3>
                            </div>
                            {categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={categoryData} barSize={40}>
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                                            axisLine={false}
                                            tickLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(17,24,39,0.9)',
                                                border: 'none',
                                                borderRadius: '12px',
                                                color: '#fff',
                                                fontSize: '12px',
                                            }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            radius={[8, 8, 0, 0]}
                                            animationBegin={0}
                                            animationDuration={1200}
                                        >
                                            {categoryData.map((_, i) => (
                                                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-sm text-gray-400">
                                    No data available
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </div>
        </motion.div>
    )
}
