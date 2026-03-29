import { motion } from 'framer-motion'

export function Skeleton({ className = '', ...props }) {
    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
            className={`skeleton-loading rounded-xl ${className}`}
            {...props}
        />
    )
}

export function CardSkeleton() {
    return (
        <div className="glass-card p-6 space-y-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-16 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
        </div>
    )
}

export function StatSkeleton() {
    return (
        <div className="glass-card p-6 space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
        </div>
    )
}

export function ChartSkeleton() {
    return (
        <div className="glass-card p-6 space-y-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-48 w-full" />
        </div>
    )
}
