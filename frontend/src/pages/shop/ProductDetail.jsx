import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useProductStore } from '../../store/productStore'
import { Star, ShoppingCart, Heart, Shield, RefreshCcw, Truck, Minus, Plus, MessageSquare } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useCartStore } from '../../store/cartStore'

const reviewSchema = z.object({
    rating: z.number().min(1, 'Please select a rating').max(5),
    comment: z.string().min(10, 'Comment must be at least 10 characters')
})

export default function ProductDetail() {
    const { id } = useParams()
    const { product, loading, fetchProductDetails, addReview } = useProductStore()
    const [quantity, setQuantity] = useState(1)
    const [activeImage, setActiveImage] = useState(0)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const { addToCart } = useCartStore()

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: 5, comment: '' }
    })

    const selectedRating = watch('rating')

    useEffect(() => {
        fetchProductDetails(id)
    }, [id])

    const onSubmitReview = async (data) => {
        const success = await addReview(id, data)
        if (success) {
            setShowReviewForm(false)
            reset()
            fetchProductDetails(id)
        }
    }

    if (loading && !product) return (
        <div className="max-w-7xl mx-auto px-4 py-20"><LoadingSpinner size="lg" fullPage /></div>
    )

    if (!product) return <div className="text-center py-20 font-bold text-2xl">Product not found</div>

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Images */}
                <div className="space-y-4">
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm overflow-hidden h-[500px] flex items-center justify-center">
                        <img
                            src={product.images?.[activeImage]?.url || 'https://via.placeholder.com/600'}
                            className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-500"
                            alt={product.name}
                        />
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {product.images?.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImage(i)}
                                className={`h-20 w-20 flex-shrink-0 rounded-xl border-2 p-2 transition-all ${activeImage === i ? 'border-primary-600 bg-primary-50' : 'border-gray-100 hover:border-primary-200'}`}
                            >
                                <img src={img.url} className="h-full w-full object-contain" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-8">
                    <div>
                        <span className="text-primary-600 font-bold uppercase tracking-widest text-sm">{product.category?.name || product.category}</span>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 leading-tight">{product.name}</h1>

                        <div className="flex items-center mt-4 space-x-4">
                            <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                                <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                                <span className="font-bold text-yellow-700">{product.ratings}</span>
                            </div>
                            <span className="text-gray-500 border-l border-gray-200 pl-4">{product.numOfReviews} Reviews</span>
                            {product.stock > 0 ? (
                                <span className="text-green-600 font-bold flex items-center bg-green-50 px-3 py-1 rounded-full text-xs">
                                    <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" /> In Stock
                                </span>
                            ) : (
                                <span className="text-red-600 font-bold px-3 py-1 bg-red-50 rounded-full text-xs">Out of Stock</span>
                            )}
                        </div>
                    </div>

                    <div className="text-3xl font-black text-gray-900">
                        ${product.price}
                    </div>

                    <p className="text-gray-600 leading-relaxed text-lg">
                        {product.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-center pt-4">
                        <div className="flex items-center border border-gray-200 rounded-xl p-1 bg-white">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Minus className="h-5 w-5" />
                            </button>
                            <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={quantity >= product.stock}
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>

                        <Button
                            className="flex-1 py-4 text-lg font-bold rounded-xl shadow-lg shadow-primary-200"
                            onClick={() => addToCart(product._id, quantity)}
                            disabled={product.stock === 0}
                        >
                            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                        </Button>

                        <button className="p-4 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-100 transition-colors group">
                            <Heart className="h-6 w-6 text-gray-400 group-hover:text-red-500" />
                        </button>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-8 border-t border-gray-100">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Truck className="h-5 w-5 text-primary-500" />
                            <span>Free Shipping</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Shield className="h-5 w-5 text-primary-500" />
                            <span>Secure Checkout</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <RefreshCcw className="h-5 w-5 text-primary-500" />
                            <span>Easy Returns</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <section className="mt-32">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900">Customer Reviews</h2>
                        <p className="text-gray-500 mt-1">Share your experience with this product.</p>
                    </div>
                    {!showReviewForm && (
                        <Button variant="secondary" onClick={() => setShowReviewForm(true)}>Write a Review</Button>
                    )}
                </div>

                {showReviewForm && (
                    <div className="mb-12 bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-inner animate-in fade-in slide-in-from-top-4 duration-300">
                        <h3 className="text-xl font-bold mb-6">Write a Review</h3>
                        <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setValue('rating', star)}
                                            className="focus:outline-none"
                                        >
                                            <Star className={`h-8 w-8 ${star <= selectedRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                        </button>
                                    ))}
                                </div>
                                {errors.rating && <p className="text-red-500 text-xs mt-1 font-bold">{errors.rating.message}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Your Comment</label>
                                <textarea
                                    className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-500 min-h-[150px]"
                                    placeholder="Tell others what you think about this product..."
                                    {...register('comment')}
                                />
                                {errors.comment && <p className="text-red-500 text-xs mt-1 font-bold">{errors.comment.message}</p>}
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="secondary" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                                <Button type="submit" isLoading={loading}>Submit Review</Button>
                            </div>
                        </form>
                    </div>
                )}

                {reviews.length === 0 ? (
                    <div className="bg-gray-50 p-12 text-center rounded-3xl border border-dashed border-gray-300">
                        <p className="text-gray-500 italic">No reviews yet. Be the first to leave one!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {reviews.map(review => (
                            <div key={review._id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{review.name}</h4>
                                        <div className="flex text-yellow-400 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">Verified Purchase</span>
                                </div>
                                <p className="text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
