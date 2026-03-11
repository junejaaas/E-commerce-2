import { create } from 'zustand'
import API from '../services/api'
import toast from 'react-hot-toast'
import { useCartStore } from './cartStore'

export const useWishlistStore = create((set, get) => ({
    items: [],
    loading: false,

    fetchWishlist: async () => {
        set({ loading: true })
        try {
            const { data } = await API.get('/wishlist')
            set({ items: data.products || [], loading: false })
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to fetch wishlist')
        }
    },

    addToWishlist: async (productId) => {
        try {
            await API.post('/wishlist', { productId })
            toast.success('Added to wishlist')
            get().fetchWishlist()
        } catch (error) {
            toast.error(error.message || 'Failed to add to wishlist')
        }
    },

    removeFromWishlist: async (productId) => {
        try {
            await API.delete(`/wishlist/${productId}`)
            toast.success('Removed from wishlist')
            get().fetchWishlist()
        } catch (error) {
            toast.error(error.message || 'Failed to remove item')
        }
    },

    moveToCart: async (productId) => {
        try {
            // First try the specialized backend endpoint if it exists
            await API.post(`/wishlist/${productId}/move`)
            toast.success('Moved to cart')
            get().fetchWishlist()
            // Also refresh cart store
            useCartStore.getState().fetchCart()
        } catch (error) {
            // Fallback: Add to cart then remove from wishlist
            try {
                await useCartStore.getState().addToCart(productId)
                await get().removeFromWishlist(productId)
            } catch (fallbackError) {
                toast.error(fallbackError.message || 'Failed to move item to cart')
            }
        }
    }
}))
