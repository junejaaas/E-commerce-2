import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useProductStore } from '../../store/productStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { Star, Minus, Plus, ChevronDown, ChevronUp, Truck, RotateCcw, Heart } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useCartStore } from '../../store/cartStore'
import API from '../../services/api'

const reviewSchema = z.object({
    rating: z.number().min(1, 'Please select a rating').max(5),
    review: z.string().min(10, 'Review must be at least 10 characters')
})

const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/600'
    const url = typeof image === 'string' ? image : image.url
    if (!url) return 'https://via.placeholder.com/600'
    if (url.startsWith('http')) return url
    const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')
    return `${baseURL.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function ProductDetail() {
    const { id } = useParams()
    const { product, loading, fetchProductDetails, addReview } = useProductStore()
    const { items, addToWishlist, removeFromWishlist } = useWishlistStore()
    const isInWishlist = items.some(item => item._id === id)

    const [reviews, setReviews] = useState([])
    const [quantity, setQuantity] = useState(1)
    const [activeImage, setActiveImage] = useState(0)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [showSizeGuide, setShowSizeGuide] = useState(false)
    const [selectedSize, setSelectedSize] = useState(null)
    const { addToCart } = useCartStore()

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: 5, review: '' }
    })

    const selectedRating = watch('rating')

    useEffect(() => {
        fetchProductDetails(id)
        fetchReviews()
    }, [id])

    const fetchReviews = async () => {
        try {
            const { data } = await API.get(`/products/${id}/reviews`)
            setReviews(data)
        } catch (e) {
            console.error('Failed to fetch reviews', e)
        }
    }

    const onSubmitReview = async (data) => {
        const success = await addReview(id, data)
        if (success) {
            setShowReviewForm(false)
            reset()
            fetchReviews()
        }
    }

    const handleWishlistToggle = () => {
        if (isInWishlist) removeFromWishlist(id)
        else addToWishlist(id)
    }

    // Parse sizes from product (could be array of strings or comma-separated)
    const sizes = product?.sizes?.length
        ? product.sizes
        : product?.size
            ? String(product.size).split(',').map(s => s.trim()).filter(Boolean)
            : []

    if (loading && !product) return (
        <div className="max-w-7xl mx-auto px-4 py-20"><LoadingSpinner size="lg" fullPage /></div>
    )
    if (!product) return <div className="text-center py-20 font-bold text-2xl">Product not found</div>

    const displayPrice = product.discountedPrice > 0 ? product.discountedPrice : (product.originalPrice || product.price)
    const originalPrice = product.originalPrice || product.price

    const avgRating = product.ratingsAverage || 0
    const ratingCount = product.ratingsQuantity || 0

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Breadcrumb */}
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-8">
                    Home / {product.category?.name || product.category} / <span className="text-black">{product.name}</span>
                </p>

                {/* Main Layout: Info Left, Image Right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* ── LEFT: Product Info ── */}
                    <div className="space-y-6">

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-black text-black leading-tight">
                            {product.name}
                        </h1>

                        {/* Rating row */}
                        {ratingCount > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex">
                                    {[1,2,3,4,5].map(s => (
                                        <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'}`} />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500 font-medium">{ratingCount} review{ratingCount !== 1 ? 's' : ''}</span>
                            </div>
                        )}

                        {/* Price */}
                        <div>
                            {product.discountedPrice > 0 ? (
                                <div className="flex items-baseline gap-3">
                                    <span className="text-2xl font-black text-black">₹ {product.discountedPrice.toLocaleString()}.00</span>
                                    <span className="text-base text-gray-400 line-through font-medium">₹ {originalPrice.toLocaleString()}.00</span>
                                    <span className="text-xs font-black text-white bg-red-500 px-2 py-0.5 uppercase tracking-wider">
                                        {product.discountPercentage}% OFF
                                    </span>
                                </div>
                            ) : (
                                <span className="text-2xl font-black text-black">₹ {displayPrice?.toLocaleString()}.00</span>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Tax included. <span className="underline cursor-pointer">Shipping</span> calculated at checkout.</p>
                        </div>

                        {/* Stock badge */}
                        {product.stock === 0 && (
                            <span className="inline-block text-xs font-black text-red-600 bg-red-50 px-3 py-1 border border-red-200">
                                OUT OF STOCK
                            </span>
                        )}

                        {/* Size selector */}
                        {sizes.length > 0 && (
                            <div>
                                <p className="text-sm font-bold text-gray-700 mb-3">Size</p>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`min-w-[48px] h-11 px-4 rounded-full border-2 text-sm font-bold transition-all ${
                                                selectedSize === size
                                                    ? 'bg-black border-black text-white'
                                                    : 'bg-white border-gray-300 text-black hover:border-black'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Guide accordion */}
                        <div className="border-t border-b border-gray-200">
                            <button
                                onClick={() => setShowSizeGuide(!showSizeGuide)}
                                className="w-full flex items-center justify-between py-3 text-sm font-bold text-black"
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9-3 9 3v2l-9 3-9-3V6zM3 12l9 3 9-3M3 18l9 3 9-3" />
                                    </svg>
                                    Size Guide
                                </span>
                                {showSizeGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            {showSizeGuide && (
                                <div className="pb-4 text-sm text-gray-600 leading-relaxed">
                                    <table className="w-full text-center text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="border border-gray-200 px-3 py-2 font-bold">Size</th>
                                                <th className="border border-gray-200 px-3 py-2 font-bold">Chest (in)</th>
                                                <th className="border border-gray-200 px-3 py-2 font-bold">Length (in)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[['S','36-38','27'],['M','38-40','28'],['L','40-42','29'],['XL','42-44','30'],['XXL','44-46','31']].map(([s,c,l]) => (
                                                <tr key={s}>
                                                    <td className="border border-gray-200 px-3 py-1.5">{s}</td>
                                                    <td className="border border-gray-200 px-3 py-1.5">{c}</td>
                                                    <td className="border border-gray-200 px-3 py-1.5">{l}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Quantity */}
                        <div>
                            <p className="text-sm font-bold text-gray-700 mb-3">Quantity</p>
                            <div className="flex items-center border border-gray-300 w-32">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-10 h-10 flex items-center justify-center text-black hover:bg-gray-100 transition-colors text-lg font-bold"
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="flex-1 text-center text-sm font-bold">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                                    disabled={quantity >= (product.stock || 99)}
                                    className="w-10 h-10 flex items-center justify-center text-black hover:bg-gray-100 transition-colors disabled:opacity-40"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={() => addToCart(product._id, quantity)}
                                disabled={product.stock === 0}
                                className="w-full py-3.5 border-2 border-black text-black text-sm font-black uppercase tracking-wider hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Add to cart
                            </button>
                            <button
                                onClick={() => addToCart(product._id, quantity)}
                                disabled={product.stock === 0}
                                className="w-full py-3.5 bg-black text-white text-sm font-black uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Buy it now
                            </button>
                            <button
                                onClick={handleWishlistToggle}
                                className={`w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold transition-colors border ${
                                    isInWishlist
                                        ? 'border-red-200 text-red-500 bg-red-50'
                                        : 'border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50'
                                }`}
                            >
                                <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
                                {isInWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
                            </button>
                        </div>

                        {/* Shipping info */}
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Truck className="h-4 w-4 flex-shrink-0" />
                                <span>Free shipping on orders over ₹999</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <RotateCcw className="h-4 w-4 flex-shrink-0" />
                                <span>Easy 7-day returns</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="pt-2 border-t border-gray-100">
                            <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{product.description}</p>
                        </div>
                    </div>

                    {/* ── RIGHT: Images ── */}
                    <div className="space-y-3">
                        {/* Main Image */}
                        <div className="bg-gray-50 overflow-hidden aspect-[4/5] flex items-center justify-center">
                            <img
                                src={getImageUrl(product.images?.[activeImage])}
                                alt={product.name}
                                className="w-full h-full object-cover object-center"
                            />
                        </div>

                        {/* Thumbnails */}
                        {product.images?.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {product.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`flex-shrink-0 w-16 h-20 border-2 overflow-hidden transition-all ${
                                            activeImage === i ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={getImageUrl(img)}
                                            alt={`View ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Customer Reviews ── */}
                <section className="mt-20 border-t border-gray-100 pt-12">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-black">Customer Reviews</h2>
                    </div>

                    {/* Summary row */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="flex gap-1">
                                {[1,2,3,4,5].map(s => (
                                    <Star key={s} className={`h-5 w-5 ${s <= Math.round(avgRating) ? 'text-teal-600 fill-current' : 'text-gray-200 fill-current'}`} />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">
                                {ratingCount === 0 ? 'Be the first to write a review' : `${avgRating.toFixed(1)} out of 5 (${ratingCount} reviews)`}
                            </span>
                        </div>
                        {!showReviewForm && (
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="px-6 py-2.5 bg-teal-700 text-white text-sm font-bold hover:bg-teal-800 transition-colors"
                            >
                                Write a review
                            </button>
                        )}
                    </div>

                    {/* Review form */}
                    {showReviewForm && (
                        <div className="my-8 bg-gray-50 border border-gray-200 p-8">
                            <h3 className="text-lg font-black mb-6">Write a Review</h3>
                            <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Rating</label>
                                    <div className="flex gap-1">
                                        {[1,2,3,4,5].map(star => (
                                            <button key={star} type="button" onClick={() => setValue('rating', star)}>
                                                <Star className={`h-7 w-7 ${star <= selectedRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                            </button>
                                        ))}
                                    </div>
                                    {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
                                    <textarea
                                        className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black min-h-[120px] resize-none"
                                        placeholder="Tell others what you think about this product..."
                                        {...register('review')}
                                    />
                                    {errors.review && <p className="text-red-500 text-xs mt-1">{errors.review.message}</p>}
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowReviewForm(false)}
                                        className="px-5 py-2.5 border border-gray-300 text-sm font-bold hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2.5 bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors"
                                    >
                                        {loading ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Reviews list */}
                    {reviews.length > 0 && (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {reviews.map(review => (
                                <div key={review._id} className="border border-gray-100 p-6 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-sm text-black">{review.name}</p>
                                            <div className="flex gap-0.5 mt-1">
                                                {[1,2,3,4,5].map(s => (
                                                    <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Verified</span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">"{review.review}"</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
