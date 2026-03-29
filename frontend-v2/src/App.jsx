import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import CreateTicket from './pages/CreateTicket'
import TicketList from './pages/TicketList'

export default function App() {
    return (
        <AnimatePresence mode="wait">
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/create" element={<CreateTicket />} />
                    <Route path="/tickets" element={<TicketList />} />
                </Route>
            </Routes>
        </AnimatePresence>
    )
}
