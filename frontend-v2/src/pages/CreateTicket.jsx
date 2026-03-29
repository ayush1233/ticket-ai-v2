import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    Sparkles, Send, Loader2, CheckCircle,
    Type, AlignLeft, Tag, Zap,
} from 'lucide-react'
import { useCreateTicket, useClassify } from '../hooks/useTickets'
import { useToast } from '../components/Toast'

const categories = ['billing', 'technical', 'account', 'general']
const priorities = ['low', 'medium', 'high', 'critical']

function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])
    return debounced
}

export default function CreateTicket() {
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium',
    })
    const [aiSuggestion, setAiSuggestion] = useState(null)
    const [submitted, setSubmitted] = useState(false)

    const navigate = useNavigate()
    const createTicket = useCreateTicket()
    const classify = useClassify()
    const { addToast } = useToast()

    const debouncedDescription = useDebounce(form.description, 800)

    // Auto-classify when description changes
    useEffect(() => {
        if (debouncedDescription.length >= 15) {
            classify.mutate(debouncedDescription, {
                onSuccess: (data) => {
                    if (data) {
                        setAiSuggestion(data)
                        // Only auto-fill if not a fallback/error response
                        if (!data.error) {
                            setForm((prev) => ({
                                ...prev,
                                category: data.suggested_category,
                                priority: data.suggested_priority,
                            }))
                        }
                    }
                },
            })
        }
    }, [debouncedDescription])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.title.trim() || !form.description.trim()) {
            addToast('Please fill in all required fields', 'warning')
            return
        }

        try {
            await createTicket.mutateAsync(form)
            setSubmitted(true)
            addToast('Ticket created successfully!', 'success')
            setTimeout(() => {
                setSubmitted(false)
                setForm({ title: '', description: '', category: 'general', priority: 'medium' })
                setAiSuggestion(null)
                navigate('/tickets')
            }, 1500)
        } catch (err) {
            addToast('Failed to create ticket', 'error')
        }
    }

    const update = (field, value) => setForm((p) => ({ ...p, [field]: value }))

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
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Create Ticket
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Describe your issue and let AI classify it automatically
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    onSubmit={handleSubmit}
                    className="lg:col-span-2 glass-card p-6 space-y-6"
                >
                    <AnimatePresence mode="wait">
                        {submitted ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex flex-col items-center justify-center py-16"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                                >
                                    <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Ticket Created!
                                </h3>
                                <p className="text-gray-500 mt-1">Redirecting to ticket list...</p>
                            </motion.div>
                        ) : (
                            <motion.div key="form" className="space-y-6">
                                {/* Title */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <Type className="w-4 h-4 text-brand-500" />
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => update('title', e.target.value)}
                                        placeholder="Brief summary of the issue"
                                        className="input-field"
                                        required
                                    />
                                </motion.div>

                                {/* Description */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 }}
                                >
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <AlignLeft className="w-4 h-4 text-brand-500" />
                                        Description
                                    </label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => update('description', e.target.value)}
                                        placeholder="Describe the issue in detail (min 15 chars for AI classification)..."
                                        rows={5}
                                        className="input-field resize-none"
                                        required
                                    />
                                </motion.div>

                                {/* Category & Priority */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            <Tag className="w-4 h-4 text-brand-500" />
                                            Category
                                        </label>
                                        <select
                                            value={form.category}
                                            onChange={(e) => update('category', e.target.value)}
                                            className="input-field"
                                        >
                                            {categories.map((c) => (
                                                <option key={c} value={c}>
                                                    {c.charAt(0).toUpperCase() + c.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            <Zap className="w-4 h-4 text-brand-500" />
                                            Priority
                                        </label>
                                        <select
                                            value={form.priority}
                                            onChange={(e) => update('priority', e.target.value)}
                                            className="input-field"
                                        >
                                            {priorities.map((p) => (
                                                <option key={p} value={p}>
                                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </motion.div>
                                </div>

                                {/* Submit */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={createTicket.isPending}
                                    className="btn-primary w-full text-base py-3"
                                >
                                    {createTicket.isPending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                    {createTicket.isPending ? 'Creating...' : 'Create Ticket'}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.form>

                {/* AI Classification Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 h-fit"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                AI Classification
                            </h3>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                                Powered by Gemini
                            </p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {classify.isPending ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center py-8"
                            >
                                <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
                                <p className="text-sm text-gray-500">Analyzing ticket...</p>
                            </motion.div>
                        ) : aiSuggestion ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200/50 dark:border-brand-800/30">
                                    <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-1">
                                        Suggested Category
                                    </p>
                                    <p className="text-sm font-bold text-brand-700 dark:text-brand-300 capitalize">
                                        {aiSuggestion.suggested_category}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-800/30">
                                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                                        Suggested Priority
                                    </p>
                                    <p className="text-sm font-bold text-purple-700 dark:text-purple-300 capitalize">
                                        {aiSuggestion.suggested_priority}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30">
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                                        Confidence
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 rounded-full bg-emerald-200/50 dark:bg-emerald-800/30 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(aiSuggestion.confidence_score || 0) * 100}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                            {Math.round((aiSuggestion.confidence_score || 0) * 100)}%
                                        </span>
                                    </div>
                                </div>
                                {aiSuggestion.error ? (
                                    <p className="text-[11px] text-amber-500 text-center mt-2">
                                        ⚠ AI temporarily unavailable — using defaults. You can set category & priority manually.
                                    </p>
                                ) : (
                                    <p className="text-[11px] text-gray-400 text-center mt-2">
                                        You can override the AI suggestions above
                                    </p>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-8"
                            >
                                <Sparkles className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    Start typing a description (15+ chars) to get AI suggestions
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    )
}
