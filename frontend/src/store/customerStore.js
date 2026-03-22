import { create } from 'zustand'
import api from '../services/api'
import toast from 'react-hot-toast'

export const useCustomerStore = create((set, get) => ({
    customers: [],
    selectedCustomer: null,
    selectedCustomerOrders: [],
    loading: false,
    error: null,
    total: 0,
    totalPages: 1,
    currentPage: 1,

    fetchCustomers: async ({ search = '', page = 1 } = {}) => {
        set({ loading: true, error: null })
        try {
            const res = await api.get('/admin/customers', { params: { search, page, limit: 20 } })
            set({
                customers: res.data.data.customers,
                total: res.data.total,
                totalPages: res.data.totalPages,
                currentPage: res.data.currentPage,
                loading: false,
            })
        } catch (err) {
            set({ loading: false, error: err.response?.data?.message || 'Failed to load customers' })
        }
    },

    fetchCustomerById: async (id) => {
        set({ loading: true, error: null, selectedCustomer: null })
        try {
            const res = await api.get(`/admin/customers/${id}`)
            set({
                selectedCustomer: res.data.data.customer,
                selectedCustomerOrders: res.data.data.orders,
                loading: false,
            })
        } catch (err) {
            set({ loading: false, error: err.response?.data?.message || 'Failed to load customer' })
        }
    },

    toggleBlock: async (id) => {
        try {
            const res = await api.patch(`/admin/customers/${id}/status`)
            const { isBlocked } = res.data.data
            set((state) => ({
                customers: state.customers.map((c) =>
                    c._id === id ? { ...c, isBlocked } : c
                ),
                selectedCustomer: state.selectedCustomer?._id === id
                    ? { ...state.selectedCustomer, isBlocked }
                    : state.selectedCustomer,
            }))
            toast.success(res.data.message)
            return isBlocked
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed')
        }
    },

    resetPassword: async (id) => {
        try {
            const res = await api.patch(`/admin/customers/${id}/reset-password`)
            return res.data.data.temporaryPassword
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed')
            return null
        }
    },
}))
