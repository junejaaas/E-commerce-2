import { create } from 'zustand'
import API from '../services/api'
import toast from 'react-hot-toast'

export const useAddressStore = create((set, get) => ({
    addresses: [],
    loading: false,

    fetchAddresses: async () => {
        set({ loading: true })
        try {
            const { data } = await API.get('/addresses')
            set({ addresses: data.addresses || data, loading: false })
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to load addresses')
        }
    },

    addAddress: async (addressData) => {
        set({ loading: true })
        try {
            await API.post('/addresses', addressData)
            toast.success('Address added successfully')
            get().fetchAddresses()
            return true
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to add address')
            return false
        }
    },

    updateAddress: async (id, addressData) => {
        set({ loading: true })
        try {
            await API.patch(`/addresses/${id}`, addressData)
            toast.success('Address updated successfully')
            get().fetchAddresses()
            return true
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to update address')
            return false
        }
    },

    deleteAddress: async (id) => {
        try {
            await API.delete(`/addresses/${id}`)
            toast.success('Address deleted')
            get().fetchAddresses()
        } catch (error) {
            toast.error(error.message || 'Failed to delete address')
        }
    },

    setDefaultAddress: async (id) => {
        try {
            await API.patch(`/addresses/${id}`, { isDefault: true })
            toast.success('Default address set')
            get().fetchAddresses()
        } catch (error) {
            toast.error(error.message || 'Failed to set default address')
        }
    }
}))
