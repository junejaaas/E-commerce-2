import { create } from 'zustand'
import API from '../services/api'
import toast from 'react-hot-toast'

export const useSupportStore = create((set, get) => ({
    tickets: [],
    selectedTicket: null,
    loading: false,

    fetchTickets: async () => {
        set({ loading: true })
        try {
            const { data } = await API.get('/support/tickets')
            set({ tickets: data.tickets || data, loading: false })
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to load tickets')
        }
    },

    createTicket: async (ticketData) => {
        set({ loading: true })
        try {
            await API.post('/support/tickets', ticketData)
            toast.success('Ticket created successfully')
            get().fetchTickets()
            set({ loading: false })
            return true
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to create ticket')
            return false
        }
    },

    fetchTicketDetails: async (ticketId) => {
        set({ loading: true, selectedTicket: null })
        try {
            const { data } = await API.get(`/support/tickets/${ticketId}`)
            set({ selectedTicket: data.ticket || data, loading: false })
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to load ticket details')
        }
    },

    sendMessage: async (ticketId, message) => {
        try {
            await API.post(`/support/tickets/${ticketId}/messages`, { message })
            // Refresh conversation
            get().fetchTicketDetails(ticketId)
        } catch (error) {
            toast.error(error.message || 'Failed to send message')
        }
    }
}))
