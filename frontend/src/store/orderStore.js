import { create } from 'zustand'
import API from '../services/api'
import { toast } from 'react-hot-toast'

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
    },

    // Admin Actions
    fetchAllOrdersAdmin: async () => {
        set({ loading: true })
        try {
            const { data } = await API.get('/orders/admin')
            set({ orders: data.orders || data, loading: false })
        } catch (error) {
            set({ loading: false })
            toast.error(error.response?.data?.message || 'Failed to fetch all orders')
        }
    },

    updateOrderStatusAdmin: async (orderId, status, paymentStatus, deliveryAgent, collectedAmount, isSettled) => {
        try {
            const { data } = await API.patch(`/orders/admin/${orderId}`, { 
                status, 
                paymentStatus, 
                deliveryAgent,
                collectedAmount,
                isSettled 
            })
            set((state) => ({
                orders: state.orders.map(o => {
                    if (o._id !== orderId) return o;
                    
                    const newStatus = status || o.orderStatus;
                    const isCOD = o.paymentMethod?.toLowerCase().includes('cod') || o.paymentMethod?.toLowerCase().includes('cash');
                    const newPaymentStatus = (newStatus === 'delivered' && isCOD) ? 'paid' : (paymentStatus || o.paymentStatus);

                    return { 
                        ...o, 
                        orderStatus: newStatus,
                        paymentStatus: newPaymentStatus,
                        deliveryAgent: deliveryAgent || o.deliveryAgent,
                        collectedAmount: collectedAmount !== undefined ? collectedAmount : o.collectedAmount,
                        isSettled: isSettled !== undefined ? isSettled : o.isSettled
                    };
                })
            }))
            if (status) toast.success(`Order status updated to ${status}`)
            if (paymentStatus) toast.success(`Payment status updated to ${paymentStatus}`)
            if (deliveryAgent) toast.success(`Delivery agent assigned`)
            if (isSettled) toast.success(`Cash settlement completed`)
            return data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update order')
            return null
        }
    },

    refundOrderAdmin: async (orderId) => {
        try {
            const { data } = await API.patch(`/orders/admin/${orderId}/refund`)
            set((state) => ({
                orders: state.orders.map(o => o._id === orderId ? { ...o, paymentStatus: 'refunded', orderStatus: 'cancelled' } : o)
            }))
            toast.success('Order refunded and cancelled')
            return data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to refund order')
            return null
        }
    }
}))
