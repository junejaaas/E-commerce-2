import { create } from 'zustand'
import API from '../services/api'
import toast from 'react-hot-toast'

export const useProductStore = create((set, get) => ({
    products: [],
    categories: [],
    product: null,
    loading: false,
    filters: {
        category: '',
        sort: '',
        search: '',
        minPrice: '',
        maxPrice: '',
        ratingsAverage: '',
        availability: '',
        brand: '',
        page: 1
    },
    totalPages: 1,

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters }
        }))
    },

    clearFilters: () => {
        set({
            filters: {
                category: '',
                sort: '',
                search: '',
                minPrice: '',
                maxPrice: '',
                ratingsAverage: '',
                availability: '',
                brand: '',
                page: 1
            }
        })
    },

    fetchProducts: async () => {
        set({ loading: true })
        try {
            const { filters } = get()
            const params = new URLSearchParams()
            if (filters.category) params.append('category', filters.category)
            if (filters.sort) params.append('sort', filters.sort)
            if (filters.search) params.append('keyword', filters.search)
            if (filters.minPrice) params.append('price[gte]', filters.minPrice)
            if (filters.maxPrice) params.append('price[lte]', filters.maxPrice)
            if (filters.ratingsAverage) params.append('ratingsAverage[gte]', filters.ratingsAverage)
            if (filters.availability) params.append('availability', filters.availability)
            if (filters.brand) params.append('brand', filters.brand)
            params.append('page', filters.page)
            params.append('limit', 9) // Consistent limit for the grid

            const { data: response } = await API.get(`/products?${params.toString()}`)
            const data = response.data || response // Support both structures
            set({ 
                products: data.products || [], 
                totalPages: response.pagination?.totalPages || 1,
                loading: false 
            })
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to fetch products')
        }
    },

    fetchCategories: async () => {
        try {
            const { data } = await API.get('/products/categories')
            set({ categories: data.categories || data })
        } catch (error) {
            console.error('Failed to fetch categories', error)
        }
    },

    fetchProductDetails: async (id) => {
        set({ loading: true, product: null })
        try {
            const { data: response } = await API.get(`/products/${id}`)
            const productData = response.data?.product || response.product || response
            set({ product: productData, loading: false })
        } catch (error) {
            set({ loading: false })
            toast.error(error.message || 'Failed to load product details')
        }
    },

    // Review Actions
    addReview: async (productId, reviewData) => {
        try {
            const { data } = await API.post(`/products/${productId}/reviews`, reviewData)
            // Refresh product details if it's the current one
            const currentProduct = get().product
            if (currentProduct && currentProduct._id === productId) {
                get().fetchProductDetails(productId)
            }
            toast.success('Review added successfully')
            return true
        } catch (error) {
            toast.error(error.message || 'Failed to add review')
            return false
        }
    },

    deleteReview: async (productId, reviewId) => {
        try {
            await API.delete(`/reviews/${reviewId}`)
            const currentProduct = get().product
            if (currentProduct && currentProduct._id === productId) {
                get().fetchProductDetails(productId)
            }
            toast.success('Review deleted')
        } catch (error) {
            toast.error(error.message || 'Failed to delete review')
        }
    }
}))
