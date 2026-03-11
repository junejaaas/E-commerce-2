import { ShoppingCart, Heart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../common/Button'

export default function ProductCard({ product }) {
    const { addToCart } = useCartStore()

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
                <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="h-5 w-5" />
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
