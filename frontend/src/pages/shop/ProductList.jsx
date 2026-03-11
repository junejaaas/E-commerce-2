import { useEffect } from 'react'
import { useProductStore } from '../../store/productStore'
import ProductCard from '../../components/product/ProductCard'
import { Filter, Search } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { ProductCardSkeleton } from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'

export default function ProductList() {
    const {
        products,
        categories,
        loading,
        filters,
        fetchProducts,
        fetchCategories,
        setFilters,
        clearFilters
    } = useProductStore()

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        fetchProducts()
    }, [filters])

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
                            placeholder="Search..."
                            className="w-full md:w-64 pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                            onKeyUp={(e) => e.key === 'Enter' && handleFilterChange('search', e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>

                    {/* Sort */}
                    <select
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 border-r-8 border-transparent"
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                        value={filters.sort}
                    >
                        <option value="">Sort By</option>
                        <option value="price">Price: Low to High</option>
                        <option value="-price">Price: High to Low</option>
                        <option value="-ratings">Top Rated</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-64 space-y-8">
                    <div>
                        <h3 className="font-bold text-lg mb-4 flex items-center">
                            <Filter className="h-4 w-4 mr-2" /> Categories
                        </h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleFilterChange('category', '')}
                                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.category ? 'bg-primary-100 text-primary-700 font-bold' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                                All Categories
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat._id || cat}
                                    onClick={() => handleFilterChange('category', cat.name || cat)}
                                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === (cat.name || cat) ? 'bg-primary-100 text-primary-700 font-bold' : 'hover:bg-gray-100 text-gray-600'}`}
                                >
                                    {cat.name || cat}
                                </button>
                            ))}
                        </div>
                    </div>
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
                                    actionPath="#"
                                    // Handle clearFilters separately since actionPath is for navigation
                                />
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {products.map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
