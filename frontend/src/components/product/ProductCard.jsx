import { ShoppingCart, Heart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { Button } from '../common/Button'

export default function ProductCard({ product }) {
    const { addToCart } = useCartStore()
    const { items, addToWishlist, removeFromWishlist } = useWishlistStore()

    const isInWishlist = items.some(item => item._id === product._id)

    const handleWishlistClick = (e) => {
        e.preventDefault()
        if (isInWishlist) {
            removeFromWishlist(product._id)
        } else {
            addToWishlist(product._id)
        }
    }

    const {
        _id,
        name,
        price,
        images = [],
        ratings = 0,
        numOfReviews = 0,
        category
    } = product

    return (
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <Link to={`/products/${_id}`} className="relative block h-64 overflow-hidden">
                <img
                    src={images[0]?.url || 'https://via.placeholder.com/300'}
                    alt={name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-4"
                />
                <button 
                    onClick={handleWishlistClick}
                    className={`absolute top-4 right-4 p-2 backdrop-blur-sm rounded-full transition-all duration-300 z-10 ${isInWishlist ? 'bg-red-50 text-red-500 shadow-lg shadow-red-100' : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'}`}
                >
                    <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
            </Link>

            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-xs text-primary-600 font-bold uppercase tracking-wider mb-1">{category?.name || category}</p>
                        <Link to={`/products/${_id}`} className="text-lg font-bold text-gray-900 line-clamp-1 hover:text-primary-600 transition-colors">
                            {name}
                        </Link>
                    </div>
                </div>

                <div className="flex items-center space-x-1 mb-4">
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < ratings ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                    </div>
                    <span className="text-xs text-gray-500">({numOfReviews})</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-gray-900">${price}</span>
                    <Button
                        size="sm"
                        className="rounded-full h-10 w-10 p-0"
                        onClick={() => addToCart(_id)}
                    >
                        <ShoppingCart className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
