import { create } from 'zustand'
import API from '../services/api'
import toast from 'react-hot-toast'

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,

    login: async (credentials) => {
        set({ loading: true })
        try {
            const { data } = await API.post('/auth/login', credentials)
            const token = data.tokens?.access?.token || data.token
            const refreshToken = data.tokens?.refresh?.token
            localStorage.setItem('token', token)
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
            set({ user: data.user, token: token, loading: false })
            toast.success('Login successful!')
            return true
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Login failed')
            return false
        }
    },

    register: async (userData) => {
        set({ loading: true })
        try {
            const { data } = await API.post('/auth/register', userData)
            const token = data.tokens?.access?.token || data.token
            const refreshToken = data.tokens?.refresh?.token
            localStorage.setItem('token', token)
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
            set({ user: data.user, token: token, loading: false })
            toast.success('Registration successful!')
            return true
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Registration failed')
            return false
        }
    },

    logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        set({ user: null, token: null })
        toast.success('Logged out')
    },

    fetchMe: async () => {
        if (!localStorage.getItem('token')) return
        try {
            const { data } = await API.get('/users/me')
            set({ user: data })
        } catch (error) {
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            set({ user: null, token: null })
        }
    }
}))
