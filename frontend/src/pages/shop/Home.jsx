import { useEffect, useState } from 'react'
import { useProductStore } from '../../store/productStore'
import ProductCard from '../../components/product/ProductCard'
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductCardSkeleton } from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import { Star } from 'lucide-react'
import { Button } from '../../components/common/Button'

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


    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        fetchCategories()
        fetchProducts()
    }, [])

    useEffect(() => {
        fetchProducts()
    }, [filters.category, filters.sort, filters.minPrice, filters.maxPrice, filters.ratingsAverage, filters.page, filters.search])

    const handleFilterChange = (key, value) => {
        setFilters({ [key]: value, page: 1 })
        if (key === 'category') {
            setTimeout(() => {
                document.getElementById('all-products')?.scrollIntoView({ behavior: 'smooth' })
            }, 50)
        }
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Category Nav Strip */}
            <div className="border-b border-gray-200 bg-white sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide py-3">
                        <button
                            onClick={() => handleFilterChange('category', '')}
                            className={`whitespace-nowrap px-4 py-1.5 text-sm font-semibold transition-all rounded-none border-b-2 ${
                                !filters.category
                                    ? 'border-black text-black'
                                    : 'border-transparent text-gray-600 hover:text-black hover:border-gray-300'
                            }`}
                        >
                            All Products
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat._id || cat}
                                onClick={() => handleFilterChange('category', cat.name || cat)}
                                className={`whitespace-nowrap px-4 py-1.5 text-sm font-semibold transition-all rounded-none border-b-2 ${
                                    filters.category === (cat.name || cat)
                                        ? 'border-black text-black'
                                        : 'border-transparent text-gray-600 hover:text-black hover:border-gray-300'
                                }`}
                            >
                                {cat.name || cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hero Banner */}
            <div className="relative w-full overflow-hidden" style={{ height: '480px' }}>
                <img
                    src="/hero-banner.png"
                    alt="Summer Collection"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                        // fallback to a gradient if image fails
                        e.target.style.display = 'none'
                    }}
                />
                {/* Overlay text for fallback */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black"
                    style={{ display: 'none' }}
                    id="hero-fallback"
                >
                    <div className="text-center px-4">
                        <div className="text-[12vw] font-black leading-none text-white tracking-tighter uppercase mb-4">
                            NEW<br /><span className="text-[#ff1cf7]">ARRIVALS</span>
                        </div>
                        <p className="text-gray-300 text-xl font-medium tracking-widest uppercase mb-8">Shop the latest collection</p>
                        <button
                            onClick={() => document.getElementById('all-products')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-white text-black font-black px-10 py-4 text-sm tracking-widest uppercase hover:bg-gray-100 transition-colors"
                        >
                            Shop Now
                        </button>
                    </div>
                </div>
                {/* Shop Now CTA overlay */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <button
                        onClick={() => document.getElementById('all-products')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-black text-white font-black px-10 py-3.5 text-sm tracking-widest uppercase hover:bg-gray-800 transition-colors shadow-xl"
                    >
                        SHOP NOW
                    </button>
                </div>
            </div>

            {/* Products Section */}
            <section id="all-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-black uppercase tracking-tight">
                            {filters.category || 'All Products'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">{products.length} items</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            className="px-4 py-2.5 bg-white border border-gray-300 text-sm font-semibold focus:outline-none focus:border-black transition-colors"
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                            value={filters.sort}
                        >
                            <option value="">Sort: Featured</option>
                            <option value="price">Price: Low to High</option>
                            <option value="-price">Price: High to Low</option>
                            <option value="-ratingsAverage">Top Rated</option>
                            <option value="-createdAt">Newest First</option>
                        </select>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold border transition-all ${
                                showFilters
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-black border-gray-300 hover:border-black'
                            }`}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <aside className="w-64 flex-shrink-0">
                            <div className="sticky top-20 space-y-8">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-black text-sm uppercase tracking-widest">Filters</h3>
                                    <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Categories */}
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Category</h4>
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => handleFilterChange('category', '')}
                                            className={`w-full text-left px-0 py-1.5 text-sm font-medium border-b border-transparent transition-all ${
                                                !filters.category ? 'text-black font-bold' : 'text-gray-500 hover:text-black'
                                            }`}
                                        >
                                            All
                                        </button>
                                        {categories.map(cat => (
                                            <button
                                                key={cat._id || cat}
                                                onClick={() => handleFilterChange('category', cat.name || cat)}
                                                className={`w-full text-left px-0 py-1.5 text-sm font-medium transition-all ${
                                                    filters.category === (cat.name || cat)
                                                        ? 'text-black font-bold'
                                                        : 'text-gray-500 hover:text-black'
                                                }`}
                                            >
                                                {cat.name || cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Price Range</h4>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                                            value={filters.minPrice}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        />
                                        <span className="text-gray-400">—</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                                            value={filters.maxPrice}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Rating */}
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Min Rating</h4>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => handleFilterChange('ratingsAverage', star)}
                                                className={`p-1 transition-all ${filters.ratingsAverage >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                            >
                                                <Star className={`h-5 w-5 ${filters.ratingsAverage >= star ? 'fill-current' : ''}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={clearFilters}
                                    className="w-full py-2 text-xs font-black uppercase tracking-widest text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </aside>
                    )}

                    {/* Products Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[...Array(8)].map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {products.length === 0 ? (
                                    <EmptyState
                                        title="No products found"
                                        description="Try adjusting your filters to find what you're looking for."
                                        actionLabel="Clear all filters"
                                        onAction={clearFilters}
                                    />
                                ) : (
                                    <>
                                        <div className={`grid gap-4 ${showFilters ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
                                            {products.map(product => (
                                                <ProductCard key={product._id} product={product} />
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="flex justify-center items-center gap-2 pt-10 border-t border-gray-100">
                                                <button
                                                    disabled={filters.page === 1}
                                                    onClick={() => setFilters({ page: filters.page - 1 })}
                                                    className="p-2.5 border border-gray-300 disabled:opacity-40 hover:border-black transition-colors"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>

                                                {[...Array(totalPages)].map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setFilters({ page: i + 1 })}
                                                        className={`w-10 h-10 text-sm font-bold transition-all ${
                                                            filters.page === i + 1
                                                                ? 'bg-black text-white'
                                                                : 'bg-white text-gray-600 border border-gray-200 hover:border-black'
                                                        }`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}

                                                <button
                                                    disabled={filters.page === totalPages}
                                                    onClick={() => setFilters({ page: filters.page + 1 })}
                                                    className="p-2.5 border border-gray-300 disabled:opacity-40 hover:border-black transition-colors"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
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
