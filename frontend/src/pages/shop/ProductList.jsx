import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProductStore } from '../../store/productStore'
import ProductCard from '../../components/product/ProductCard'
import { Filter, Search, X, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { ProductCardSkeleton } from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import { Button } from '../../components/common/Button'

export default function ProductList() {
    const [searchParams, setSearchParams] = useSearchParams()
    const {
        products,
        categories,
        loading,
        filters,
        totalPages,
        fetchProducts,
        fetchCategories,
        setFilters,
        clearFilters
    } = useProductStore()

    const [searchTerm, setSearchTerm] = useState(filters.search || '')
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    // Initial load and URL sync
    useEffect(() => {
        fetchCategories()
        
        // Initialize filters from URL or reset if empty
        const urlFilters = {
            category: searchParams.get('category') || '',
            search: searchParams.get('keyword') || '',
            sort: searchParams.get('sort') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            ratingsAverage: searchParams.get('rating') || '',
            availability: searchParams.get('availability') || '',
            brand: searchParams.get('brand') || '',
            page: parseInt(searchParams.get('page')) || 1
        }
        
        setFilters(urlFilters)
    }, [])

    // Sync filters to URL and fetch
    useEffect(() => {
        const params = {}
        if (filters.category) params.category = filters.category
        if (filters.search) params.keyword = filters.search
        if (filters.sort) params.sort = filters.sort
        if (filters.minPrice) params.minPrice = filters.minPrice
        if (filters.maxPrice) params.maxPrice = filters.maxPrice
        if (filters.ratingsAverage) params.rating = filters.ratingsAverage
        if (filters.brand) params.brand = filters.brand
        if (filters.page > 1) params.page = filters.page
        
        setSearchParams(params)
        fetchProducts()
    }, [filters])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== filters.search) {
                setFilters({ search: searchTerm, page: 1 })
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const handleFilterChange = (key, value) => {
        setFilters({ [key]: value, page: 1 })
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">All Products</h1>
                    <p className="text-gray-500 mt-1">Found {products.length} products</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-grow md:flex-grow-0">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full md:w-72 pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Sort */}
                    <select
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 shadow-sm outline-none"
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                        value={filters.sort}
                    >
                        <option value="">Sort By: Default</option>
                        <option value="price">Price: Low to High</option>
                        <option value="-price">Price: High to Low</option>
                        <option value="-ratingsAverage">Top Rated</option>
                        <option value="-createdAt">Newest Arrival</option>
                        <option value="-sold">Popularity</option>
                    </select>

                    {/* Mobile Filter Toggle */}
                    <button 
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="lg:hidden p-2.5 bg-white border border-gray-200 rounded-2xl text-gray-600"
                    >
                        <Filter className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className={`lg:block ${showMobileFilters ? 'block' : 'hidden'} w-full lg:w-72 space-y-8 bg-white lg:bg-transparent p-6 lg:p-0 rounded-3xl border border-gray-100 lg:border-none shadow-xl lg:shadow-none absolute lg:relative z-20`}>
                    <div className="flex justify-between items-center lg:hidden mb-6">
                        <h3 className="font-bold text-xl">Filters</h3>
                        <button onClick={() => setShowMobileFilters(false)}><X /></button>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Categories</h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => handleFilterChange('category', '')}
                                className={`block w-full text-left px-4 py-2 rounded-xl text-sm transition-all ${!filters.category ? 'bg-primary-600 text-white font-bold shadow-md shadow-primary-200' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                                All Categories
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat._id || cat}
                                    onClick={() => handleFilterChange('category', cat.name || cat)}
                                    className={`block w-full text-left px-4 py-2 rounded-xl text-sm transition-all ${filters.category === (cat.name || cat) ? 'bg-primary-600 text-white font-bold shadow-md shadow-primary-200' : 'hover:bg-gray-100 text-gray-600'}`}
                                >
                                    {cat.name || cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Price Range</h3>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                placeholder="Min"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            />
                            <span className="text-gray-400">-</span>
                            <input 
                                type="number" 
                                placeholder="Max"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Ratings */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Min Rating</h3>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => handleFilterChange('ratingsAverage', star)}
                                    className={`p-1.5 rounded-lg transition-all ${filters.ratingsAverage >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                    <Star className={`h-5 w-5 ${filters.ratingsAverage >= star ? 'fill-current' : ''}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Availability */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Availability</h3>
                        <label className="flex items-center cursor-pointer group">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="sr-only"
                                    checked={filters.availability === 'true'}
                                    onChange={(e) => handleFilterChange('availability', e.target.checked ? 'true' : '')}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${filters.availability === 'true' ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.availability === 'true' ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">In Stock Only</span>
                        </label>
                    </div>

                    <Button 
                        variant="secondary" 
                        className="w-full rounded-2xl"
                        onClick={clearFilters}
                    >
                        Clear All Filters
                    </Button>
                </aside>

                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <>
                            {products.length === 0 ? (
                                <EmptyState
                                    title="No products found"
                                    description="Try adjusting your filters or search terms to find what you're looking for."
                                    actionLabel="Clear all filters"
                                    onAction={clearFilters}
                                />
                            ) : (
                                <div className="space-y-12">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                        {products.map(product => (
                                            <ProductCard key={product._id} product={product} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-2 pt-8 border-t border-gray-100">
                                            <button
                                                disabled={filters.page === 1}
                                                onClick={() => setFilters({ page: filters.page - 1 })}
                                                className="p-2 rounded-xl border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setFilters({ page: i + 1 })}
                                                    className={`w-10 h-10 rounded-xl font-bold transition-all ${filters.page === i + 1 ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'hover:bg-gray-100 text-gray-600'}`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}

                                            <button
                                                disabled={filters.page === totalPages}
                                                onClick={() => setFilters({ page: filters.page + 1 })}
                                                className="p-2 rounded-xl border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
