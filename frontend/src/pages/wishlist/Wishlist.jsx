import { useEffect } from 'react'
import ProductCard from '../../components/product/ProductCard'
import { Heart, Trash2 } from 'lucide-react'
import { useWishlistStore } from '../../store/wishlistStore'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'

export default function Wishlist() {
    const { items, loading, fetchWishlist, removeFromWishlist, moveToCart } = useWishlistStore()

    useEffect(() => {
        fetchWishlist()
    }, [])

    if (loading) return <div className="p-20"><LoadingSpinner size="lg" /></div>

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20">
                <EmptyState
                    icon={Heart}
                    title="Wishlist is empty"
                    description="Save items you love to find them easily later."
                    actionLabel="Explore Products"
                    actionPath="/products"
                />
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
            <div className="flex items-center space-x-4 mb-10">
                <h1 className="text-4xl font-black text-gray-900">My Wishlist</h1>
                <span className="bg-primary-100 text-primary-700 font-bold px-3 py-1 rounded-full text-sm">
                    {items.length} Items
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {items.map(product => (
                    <div key={product._id} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                        <Link to={`/products/${product._id}`} className="block h-64 bg-gray-50 p-8 relative overflow-hidden">
                            <img
                                src={product.images?.[0]?.url}
                                alt={product.name}
                                className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-700"
                            />
                        </Link>
                        <div className="p-6">
                            <h3 className="font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
                            <p className="text-primary-600 font-black mb-6">${product.price}</p>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => moveToCart(product._id)}
                                    className="flex-1 rounded-xl text-xs py-2"
                                >
                                    Move to Cart
                                </Button>
                                <button
                                    onClick={() => removeFromWishlist(product._id)}
                                    className="p-2 border border-red-100 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
