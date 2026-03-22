import { create } from 'zustand'
import API from '../services/api'
import { toast } from 'react-hot-toast'

export const useDeliveryStore = create((set, get) => ({
    orders: [],
    deliveryHistory: [],
    historyStats: { totalCash: 0, pendingSettlement: 0, count: 0 },
    loading: false,

    fetchAvailableOrders: async () => {
        set({ loading: true })
        try {
            const { data } = await API.get('/delivery/orders')
            set({ orders: data.data || data, loading: false })
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to fetch orders')
        }
    },

    fetchDeliveryHistory: async (range = 'today') => {
        set({ loading: true })
        try {
            const { data } = await API.get(`/delivery/history?range=${range}`)
            set({ 
                deliveryHistory: data.data.orders, 
                historyStats: data.data.stats,
                loading: false 
            })
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to fetch history')
        }
    },

    updateDeliveryStatus: async (orderId, status, paymentStatus, collectedAmount) => {
        try {
            const { data } = await API.patch(`/delivery/orders/${orderId}/status`, { status, paymentStatus, collectedAmount })
            
            // Remove from list if delivered
            if (status === 'delivered') {
                set((state) => ({
                    orders: state.orders.filter(o => o._id !== orderId)
                }))
                toast.success('Order marked as Delivered! Payment updated.')
            } else {
                set((state) => ({
                    orders: state.orders.map(o => o._id === orderId ? { ...o, orderStatus: status } : o)
                }))
                toast.success(`Order status updated to ${status}`)
            }
            return data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update delivery status')
            return null
        }
    }
}))
