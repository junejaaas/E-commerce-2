import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '../common/Button'
import { useForm } from 'react-hook-form'
import API from '../../services/api'
import toast from 'react-hot-toast'

export default function ReviewForm({ productId, onSuccess }) {
    const [rating, setRating] = useState(5)
    const [loading, setLoading] = useState(false)
    const [hoverRating, setHoverRating] = useState(0)
    const { register, handleSubmit, reset, formState: { errors } } = useForm()

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            await API.post('/reviews', { ...data, rating, product: productId })
            toast.success('Review submitted')
            reset()
            onSuccess()
        } catch (error) {
            toast.error('Failed to submit review')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 text-center">How would you rate this product?</h3>

            <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className="focus:outline-none transition-transform hover:scale-125"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                    >
                        <Star
                            className={`h-10 w-10 ${star <= (hoverRating || rating) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                        />
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Tell us more about your experience</label>
                <textarea
                    {...register('comment', { required: 'Review comment is required' })}
                    className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                    placeholder="What did you like or dislike? How was the quality?"
                />
                {errors.comment && <p className="text-xs text-red-500">{errors.comment.message}</p>}
            </div>

            <Button type="submit" isLoading={loading} className="w-full py-4 rounded-xl font-bold shadow-lg shadow-primary-100">
                Submit Review
            </Button>
        </form>
    )
}
