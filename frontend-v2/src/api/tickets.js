import axios from 'axios'

const API_BASE = '/api/v2'

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
})

// Tickets CRUD
export const fetchTickets = async (params = {}) => {
    const { data } = await api.get('/tickets/', { params })
    return data.data
}

export const fetchTicket = async (id) => {
    const { data } = await api.get(`/tickets/${id}/`)
    return data.data
}

export const createTicket = async (ticket) => {
    const { data } = await api.post('/tickets/', ticket)
    return data.data
}

export const updateTicket = async ({ id, ...updates }) => {
    const { data } = await api.patch(`/tickets/${id}/`, updates)
    return data.data
}

export const deleteTicket = async (id) => {
    await api.delete(`/tickets/${id}/`)
    return id
}

// Stats
export const fetchStats = async () => {
    const { data } = await api.get('/tickets/stats/')
    return data.data
}

// AI Classification
export const classifyTicket = async (description) => {
    const { data } = await api.post('/tickets/classify/', { description })
    return data.data
}
