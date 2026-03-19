import { create } from 'zustand'
import API from '../services/api'
import { toast } from 'react-hot-toast'

export const useCartStore = create((set, get) => ({
    cart: null,
    loading: false,

    fetchCart: async () => {
        set({ loading: true })
        try {
            const { data } = await API.get('/cart')
            set({ cart: data, loading: false })
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to fetch cart')
        }
    },

    addToCart: async (productId, quantity = 1) => {
        try {
            await API.post('/cart', { productId, quantity })
            get().fetchCart()
            toast.success('Added to cart')
        } catch (error) {
            toast.error(error.message || 'Failed to add to cart')
        }
    },

    updateQuantity: async (productId, quantity) => {
        try {
            await API.patch(`/cart/${productId}`, { quantity })
            get().fetchCart()
        } catch (error) {
            toast.error(error.message || 'Failed to update quantity')
        }
    },

    removeFromCart: async (productId) => {
        try {
            await API.delete(`/cart/${productId}`)
            get().fetchCart()
            toast.success('Removed from cart')
        } catch (error) {
            toast.error(error.message || 'Failed to remove item')
        }
    },

    clearCart: async () => {
        try {
            await API.delete('/cart')
            set({ cart: { items: [] } })
            toast.success('Cart cleared')
        } catch (error) {
            toast.error(error.message || 'Failed to clear cart')
        }
    }
}))
