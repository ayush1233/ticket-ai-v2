import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/tickets'

export function useTickets(params = {}) {
    return useQuery({
        queryKey: ['tickets', params],
        queryFn: () => api.fetchTickets(params),
        keepPreviousData: true,
    })
}

export function useTicket(id) {
    return useQuery({
        queryKey: ['ticket', id],
        queryFn: () => api.fetchTicket(id),
        enabled: !!id,
    })
}

export function useTicketStats() {
    return useQuery({
        queryKey: ['ticketStats'],
        queryFn: api.fetchStats,
        refetchInterval: 30000,
    })
}

export function useCreateTicket() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: api.createTicket,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
            queryClient.invalidateQueries({ queryKey: ['ticketStats'] })
        },
    })
}

export function useUpdateTicket() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: api.updateTicket,
        onMutate: async (updatedTicket) => {
            await queryClient.cancelQueries({ queryKey: ['tickets'] })
            const prev = queryClient.getQueriesData({ queryKey: ['tickets'] })
            // Optimistic update
            queryClient.setQueriesData({ queryKey: ['tickets'] }, (old) => {
                if (!old?.results) return old
                return {
                    ...old,
                    results: old.results.map((t) =>
                        t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t
                    ),
                }
            })
            return { prev }
        },
        onError: (err, vars, context) => {
            if (context?.prev) {
                context.prev.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data)
                })
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
            queryClient.invalidateQueries({ queryKey: ['ticketStats'] })
        },
    })
}

export function useDeleteTicket() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: api.deleteTicket,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
            queryClient.invalidateQueries({ queryKey: ['ticketStats'] })
        },
    })
}

export function useClassify() {
    return useMutation({
        mutationFn: api.classifyTicket,
    })
}
