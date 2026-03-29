import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext()

const ICONS = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
}

const COLORS = {
    success: 'from-emerald-500 to-green-500 border-emerald-400/30',
    error: 'from-red-500 to-rose-500 border-red-400/30',
    info: 'from-blue-500 to-indigo-500 border-blue-400/30',
    warning: 'from-amber-500 to-orange-500 border-amber-400/30',
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm">
                <AnimatePresence mode="popLayout">
                    {toasts.map(toast => {
                        const Icon = ICONS[toast.type]
                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, x: 80, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 80, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                className={`flex items-start gap-3 px-4 py-3 rounded-xl border bg-gradient-to-r ${COLORS[toast.type]} text-white shadow-2xl backdrop-blur-lg`}
                            >
                                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <p className="text-sm font-medium flex-1">{toast.message}</p>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="p-0.5 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used within ToastProvider')
    return ctx
}
