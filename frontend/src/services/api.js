import axios from 'axios'
import axiosRetry from 'axios-retry'

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Retry logic for network failures
axiosRetry(API, {
    retries: 2,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        // Only retry on network errors or 5xx status codes
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500
    },
})

// Request interceptor for attaching JWT token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

// Response interceptor for handling common errors and token refresh
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token
                        return API(originalRequest)
                    })
                    .catch((err) => {
                        return Promise.reject(err)
                    })
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = localStorage.getItem('refreshToken')
            if (!refreshToken) {
                isRefreshing = false
                window.location.href = '/login'
                return Promise.reject(error)
            }

            try {
                const { data } = await axios.post(`${API.defaults.baseURL}/auth/refresh-tokens`, {
                    refreshToken,
                })
                const newToken = data.tokens?.access?.token || data.token
                localStorage.setItem('token', newToken)
                API.defaults.headers.common['Authorization'] = 'Bearer ' + newToken
                processQueue(null, newToken)
                return API(originalRequest)
            } catch (err) {
                processQueue(err, null)
                localStorage.removeItem('token')
                localStorage.removeItem('refreshToken')
                window.location.href = '/login'
                return Promise.reject(err)
            } finally {
                isRefreshing = false
            }
        }

        // Standardize error message
        const message = error.response?.data?.message || error.message || 'Something went wrong'
        error.message = message
        return Promise.reject(error)
    }
)

export default API
