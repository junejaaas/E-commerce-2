import { create } from 'zustand'
import API from '../services/api'
import toast from 'react-hot-toast'

export const useCheckoutStore = create((set, get) => ({
    summary: null,
    shippingMethods: [],
    loading: false,
    error: null,

    fetchShippingMethods: async () => {
        set({ loading: true, error: null })
        try {
            const { data } = await API.get('/shipping-methods')
            set({ shippingMethods: data.data || data, loading: false })
            return data.data || data
        } catch (error) {
            const msg = error.message || 'Failed to fetch shipping methods'
            set({ error: msg, loading: false })
            toast.error(msg)
        }
    },

    fetchSummary: async (params) => {
        set({ loading: true, error: null })
        try {
            const { data } = await API.get('/checkout', { params })
            set({ summary: data.data, loading: false })
        } catch (error) {
            const msg = error.message || 'Failed to update summary'
            set({ error: msg, loading: false })
        }
    },

    applyCoupon: async (couponCode, subtotal) => {
        set({ loading: true, error: null })
        try {
            const { data } = await API.post('/checkout/apply-coupon', { couponCode, subtotal })
            toast.success('Coupon applied successfully!')
            set({ loading: false })
            return data.data.discount
        } catch (error) {
            const msg = error.message || 'Invalid coupon'
            set({ error: msg, loading: false })
            toast.error(msg)
            return 0
        }
    }
}))
