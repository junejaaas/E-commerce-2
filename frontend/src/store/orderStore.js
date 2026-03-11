import { create } from 'zustand'
import API from '../services/api'
import toast from 'react-hot-toast'

export const useOrderStore = create((set, get) => ({
    orders: [],
    selectedOrder: null,
    loading: false,

    fetchOrders: async () => {
        set({ loading: true })
        try {
            const { data } = await API.get('/orders')
            set({ orders: data.orders || data, loading: false })
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to fetch order history')
        }
    },

    fetchOrderDetails: async (orderId) => {
        set({ loading: true, selectedOrder: null })
        try {
            const { data } = await API.get(`/orders/${orderId}`)
            set({ selectedOrder: data.order || data, loading: false })
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to load order details')
        }
    },

    cancelOrder: async (orderId) => {
        set({ loading: true })
        try {
            await API.post(`/orders/${orderId}/cancel`)
            toast.success('Order cancelled successfully')
            get().fetchOrders()
            // If viewing the details of the cancelled order, refresh it
            if (get().selectedOrder?._id === orderId) {
                get().fetchOrderDetails(orderId)
            }
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to cancel order')
        }
    },

    reOrder: async (orderId) => {
        set({ loading: true })
        try {
            const { data } = await API.post(`/orders/${orderId}/reorder`)
            toast.success('Items added to cart from previous order')
            set({ loading: false })
            return data
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to reorder')
            return null
        }
    },

    downloadInvoice: async (orderId) => {
        try {
            const response = await API.get(`/orders/${orderId}/invoice`, {
                responseType: 'blob'
            })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `invoice-${orderId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (error) {
            toast.error(error.message || 'Failed to download invoice')
        }
    },

    placeOrder: async (orderData) => {
        set({ loading: true })
        try {
            const { data } = await API.post('/orders', orderData)
            set({ loading: false })
            return data.order || data
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to place order')
            return null
        }
    },

    verifyPayment: async (paymentData) => {
        set({ loading: true })
        try {
            await API.post('/payments/verify', paymentData)
            toast.success('Payment verified successfully!')
            set({ loading: false })
            return true
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Payment verification failed')
            return false
        }
    }
}))
