import { useEffect, useState, useCallback } from 'react'
import { useProductStore } from '../../store/productStore'
import ProductCard from '../../components/product/ProductCard'
import { ArrowRight, Truck, ShieldCheck, Clock, Search, Filter, X, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import { ProductCardSkeleton } from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import { useAnalytics } from '../../hooks/useAnalytics'

export default function Home() {
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

    useAnalytics('home')

    const [searchTerm, setSearchTerm] = useState(filters.search || '')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        fetchCategories()
        fetchProducts()
    }, [])

    // Sync products when filters change (except search which is debounced)
    useEffect(() => {
        fetchProducts()
    }, [filters.category, filters.sort, filters.minPrice, filters.maxPrice, filters.ratingsAverage, filters.availability, filters.brand, filters.page])

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

    const scrollToProducts = () => {
        document.getElementById('all-products')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="space-y-16 pb-20">
            {/* Hero Section */}
            <section className="relative bg-primary-900 h-[600px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-950 to-transparent z-10" />
                <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2426&q=80"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                    alt="Banner"
                />
                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center text-white">
                    <h1 className="text-5xl md:text-7xl font-black max-w-2xl leading-tight mb-6">
                        Future of Tech <br />
                        <span className="text-primary-400">Right Now.</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-xl mb-10">
                        Discover the most innovative products designed to elevate your lifestyle. Quality guaranteed.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search for products..."
                                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && scrollToProducts()}
                            />
                            <Search className="absolute left-4 top-4.5 h-6 w-6 text-white/60" />
                        </div>
                        <Button 
                            className="h-14 px-8 rounded-2xl font-bold text-lg"
                            onClick={scrollToProducts}
                        >
                            Search
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
                        <div className="bg-primary-100 p-3 rounded-xl text-primary-600">
                            <Truck className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Fast Delivery</h3>
                            <p className="text-gray-500 text-sm">Free shipping on all orders over $100</p>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
                        <div className="bg-primary-100 p-3 rounded-xl text-primary-600">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Secure Payments</h3>
                            <p className="text-gray-500 text-sm">100% secure payment methods</p>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
                        <div className="bg-primary-100 p-3 rounded-xl text-primary-600">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">24/7 Support</h3>
                            <p className="text-gray-500 text-sm">Dedicated support for all customers</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* All Products Section */}
            <section id="all-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 mb-2">Our Collection</h2>
                        <div className="h-1.5 w-24 bg-primary-600 rounded-full" />
                        <p className="text-gray-500 mt-4 font-medium">Showing {products.length} stunning products</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <select
                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 shadow-sm outline-none text-sm font-semibold"
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                            value={filters.sort}
                        >
                            <option value="">Sort By: Default</option>
                            <option value="price">Price: Low to High</option>
                            <option value="-price">Price: High to Low</option>
                            <option value="-ratingsAverage">Top Rated</option>
                            <option value="-createdAt">Newest Arrival</option>
                        </select>
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border transition-all font-bold text-sm ${showFilters ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Filter className="h-4 w-4" />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <aside className="w-full lg:w-72 space-y-8 animate-in slide-in-from-left-5 duration-300">
                            {/* Categories */}
                            <div>
                                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Categories</h3>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleFilterChange('category', '')}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!filters.category ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        All
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat._id || cat}
                                            onClick={() => handleFilterChange('category', cat.name || cat)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filters.category === (cat.name || cat) ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {cat.name || cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Price Range</h3>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        placeholder="Min"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Max"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Rating */}
                            <div>
                                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Min Rating</h3>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => handleFilterChange('ratingsAverage', star)}
                                            className={`p-2 rounded-lg transition-all ${filters.ratingsAverage >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                        >
                                            <Star className={`h-6 w-6 ${filters.ratingsAverage >= star ? 'fill-current' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button 
                                variant="ghost" 
                                className="w-full rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={clearFilters}
                            >
                                Reset All Filters
                            </Button>
                        </aside>
                    )}

                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {products.length === 0 ? (
                                    <EmptyState
                                        title="No products found"
                                        description="Try adjusting your filters or search terms to find what you're looking for."
                                        actionLabel="Clear all filters"
                                        onAction={clearFilters}
                                    />
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {products.map(product => (
                                                <ProductCard key={product._id} product={product} />
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="flex justify-center items-center gap-3 pt-10 border-t border-gray-100">
                                                <button
                                                    disabled={filters.page === 1}
                                                    onClick={() => setFilters({ page: filters.page - 1 })}
                                                    className="p-3 rounded-2xl border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </button>
                                                
                                                {[...Array(totalPages)].map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setFilters({ page: i + 1 })}
                                                        className={`w-12 h-12 rounded-2xl font-black transition-all ${filters.page === i + 1 ? 'bg-primary-600 text-white shadow-xl shadow-primary-200 scale-110' : 'bg-white text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}

                                                <button
                                                    disabled={filters.page === totalPages}
                                                    onClick={() => setFilters({ page: filters.page + 1 })}
                                                    className="p-3 rounded-2xl border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
