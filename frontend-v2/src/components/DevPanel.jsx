import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, X, History, Clock, FileJson, CheckCircle, AlertCircle } from 'lucide-react'
import axios from 'axios'

export default function DevPanel() {
    const [isOpen, setIsOpen] = useState(false)
    const [logs, setLogs] = useState([])

    useEffect(() => {
        // Intercept all axios responses to populate our logs
        const responseInterceptor = axios.interceptors.response.use(
            (response) => {
                if (response.config.url?.startsWith('/api/v2')) {
                    const logEntry = {
                        id: Date.now() + Math.random(),
                        url: response.config.url,
                        method: response.config.method?.toUpperCase(),
                        status: response.status,
                        time: response.data?.processing_time_ms || 'N/A',
                        timestamp: response.data?.timestamp || new Date().toISOString(),
                        data: response.data?.data || response.data,
                        type: 'success'
                    }
                    setLogs(prev => [logEntry, ...prev].slice(0, 50)) // Keep last 50
                }
                return response
            },
            (error) => {
                if (error.config?.url?.startsWith('/api/v2')) {
                    const logEntry = {
                        id: Date.now() + Math.random(),
                        url: error.config?.url || 'Unknown',
                        method: error.config?.method?.toUpperCase() || 'UNKNOWN',
                        status: error.response?.status || 500,
                        time: error.response?.data?.processing_time_ms || 'N/A',
                        timestamp: error.response?.data?.timestamp || new Date().toISOString(),
                        data: error.response?.data || error.message,
                        type: 'error'
                    }
                    setLogs(prev => [logEntry, ...prev].slice(0, 50))
                }
                return Promise.reject(error)
            }
        )

        return () => {
            axios.interceptors.response.eject(responseInterceptor)
        }
    }, [])

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full shadow-2xl flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
                <Terminal className="w-5 h-5" />
            </motion.button>

            {/* Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 w-[400px] max-w-[100vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl border-l border-gray-200/50 dark:border-gray-800/50 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-500/10 rounded-lg">
                                    <Terminal className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Dev Panel</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">V2 Shadow Mode Logs</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Logs List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {logs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 space-y-3">
                                    <History className="w-10 h-10 opacity-50" />
                                    <p className="text-sm">No API requests yet</p>
                                </div>
                            ) : (
                                logs.map(log => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={log.id}
                                        className={`p-4 rounded-xl border ${log.type === 'error'
                                                ? 'bg-red-50/50 border-red-200/50 dark:bg-red-900/10 dark:border-red-800/30'
                                                : 'bg-white dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50'
                                            } shadow-sm`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${log.method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        log.method === 'POST' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            log.method === 'PATCH' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {log.method}
                                                </span>
                                                <span className="text-xs font-mono text-gray-600 dark:text-gray-400 truncate max-w-[150px]" title={log.url}>
                                                    {log.url.split('?')[0]}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-medium">
                                                {log.type === 'error' ? (
                                                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                                ) : (
                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                )}
                                                <span className={log.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
                                                    {log.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                                                <Clock className="w-3 h-3" />
                                                <span>{log.time}{log.time !== 'N/A' ? 'ms' : ''}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                                                <History className="w-3 h-3" />
                                                <span className="truncate">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                        </div>

                                        <div className="mt-2 bg-gray-900 dark:bg-black/50 rounded-lg p-3 overflow-hidden">
                                            <div className="flex items-center gap-1.5 mb-2 disabled">
                                                <FileJson className="w-3.5 h-3.5 text-brand-400" />
                                                <span className="text-[10px] uppercase font-semibold text-brand-400 tracking-wider">Response Data</span>
                                            </div>
                                            <pre className="text-[10px] font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-32 custom-scrollbar">
                                                {JSON.stringify(log.data, null, 2)}
                                            </pre>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
