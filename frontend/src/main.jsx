import React, { Component } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Something went wrong.</h1>
                    <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
                        {this.state.error?.message}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Reload Page
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
            <Toaster position="top-right" />
        </ErrorBoundary>
    </React.StrictMode>,
)
