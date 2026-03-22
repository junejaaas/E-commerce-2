import { create } from 'zustand'
import api from '../services/api'
import toast from 'react-hot-toast'

export const useReviewAdminStore = create((set) => ({
    reviews: [],
    loading: false,
    error: null,
    total: 0,
    totalPages: 1,
    currentPage: 1,

    fetchReviews: async ({ status = '', page = 1 } = {}) => {
        set({ loading: true, error: null })
        try {
            const res = await api.get('/admin/reviews', { params: { status, page, limit: 20 } })
            set({
                reviews: res.data.data.reviews,
                total: res.data.total,
                totalPages: res.data.totalPages,
                currentPage: res.data.currentPage,
                loading: false,
            })
        } catch (err) {
            set({ loading: false, error: err.response?.data?.message || 'Failed to load reviews' })
        }
    },

    approveReview: async (id) => {
        try {
            await api.patch(`/admin/reviews/${id}/approve`)
            set((state) => ({
                reviews: state.reviews.map((r) =>
                    r._id === id ? { ...r, status: 'approved' } : r
                ),
            }))
            toast.success('Review approved')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve')
        }
    },

    rejectReview: async (id) => {
        try {
            await api.patch(`/admin/reviews/${id}/reject`)
            set((state) => ({
                reviews: state.reviews.map((r) =>
                    r._id === id ? { ...r, status: 'rejected' } : r
                ),
            }))
            toast.success('Review rejected')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject')
        }
    },

    deleteReview: async (id) => {
        try {
            await api.delete(`/admin/reviews/${id}`)
            set((state) => ({
                reviews: state.reviews.filter((r) => r._id !== id),
            }))
            toast.success('Review deleted')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete')
        }
    },

    highlightReview: async (id) => {
        try {
            const res = await api.patch(`/admin/reviews/${id}/highlight`)
            const { isHighlighted } = res.data.data.review
            set((state) => ({
                reviews: state.reviews.map((r) =>
                    r._id === id ? { ...r, isHighlighted } : r
                ),
            }))
            toast.success(res.data.message)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update')
        }
    },
}))
