import { NavLink, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import {
    LayoutDashboard,
    PlusCircle,
    List,
    Sun,
    Moon,
    Sparkles,
    Ticket,
} from 'lucide-react'
import DevPanel from './DevPanel'

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/create', icon: PlusCircle, label: 'New Ticket' },
    { to: '/tickets', icon: List, label: 'All Tickets' },
]

export default function Layout() {
    const { dark, toggle } = useTheme()

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Animated background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 via-purple-50/30 to-pink-50/50 dark:from-gray-950 dark:via-brand-950/20 dark:to-gray-950" />
                <motion.div
                    animate={{
                        x: [0, 60, 0],
                        y: [0, -40, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-20 left-20 w-96 h-96 bg-brand-400/10 dark:bg-brand-500/5 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -50, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-20 right-20 w-80 h-80 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, 30, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-400/10 dark:bg-pink-500/5 rounded-full blur-3xl"
                />
            </div>

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-64 h-screen sticky top-0 glass border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col z-20"
            >
                {/* Logo */}
                <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
                    <motion.div
                        className="flex items-center gap-3"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold gradient-text">TicketAI</h1>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 uppercase tracking-widest border border-purple-200/50 dark:border-purple-800/50">v2</span>
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1 uppercase tracking-widest font-medium mt-0.5">
                                <span>🧪</span> Experimental
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: 'spring', stiffness: 400 }}
                                    >
                                        <item.icon
                                            className={`w-5 h-5 ${isActive
                                                ? 'text-brand-500'
                                                : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                                }`}
                                        />
                                    </motion.div>
                                    {item.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500"
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Theme Toggle */}
                <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={toggle}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-300"
                    >
                        <motion.div
                            key={dark ? 'moon' : 'sun'}
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {dark ? (
                                <Moon className="w-5 h-5 text-brand-400" />
                            ) : (
                                <Sun className="w-5 h-5 text-amber-500" />
                            )}
                        </motion.div>
                        {dark ? 'Dark Mode' : 'Light Mode'}
                    </motion.button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen">
                <div className="max-w-7xl mx-auto p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
            <DevPanel />
        </div>
    )
}
