import { useEffect, useState } from 'react'
import { useReviewAdminStore } from '../../store/reviewAdminStore'
import {
    Star, ThumbsUp, ThumbsDown, Trash2, Bookmark, BookmarkCheck,
    RefreshCw, MessageSquare, Loader2, FilterX
} from 'lucide-react'

const TABS = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
]

const StatusBadge = ({ status }) => {
    const styles = {
        approved: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
        pending: 'bg-amber-100 text-amber-700',
    }
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    )
}

const StarRating = ({ rating }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
        ))}
    </div>
)

export default function AdminReviews() {
    const { reviews, loading, total, totalPages, currentPage, fetchReviews, approveReview, rejectReview, deleteReview, highlightReview } = useReviewAdminStore()
    const [activeTab, setActiveTab] = useState('')
    const [actionId, setActionId] = useState(null) // {id, action}

    useEffect(() => {
        fetchReviews({ status: activeTab, page: 1 })
    }, [activeTab])

    const handleAction = async (id, action, fn) => {
        setActionId({ id, action })
        await fn(id)
        setActionId(null)
    }

    const isLoading = (id, action) => actionId?.id === id && actionId?.action === action

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <MessageSquare className="h-7 w-7 text-primary-600" />
                        Reviews & Ratings
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">{total} total reviews</p>
                </div>
                <button onClick={() => fetchReviews({ status: activeTab, page: currentPage })} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </button>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                {TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === tab.value
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="bg-gray-50">
                                {['Product', 'Customer', 'Rating', 'Comment', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(6)].map((_, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <FilterX className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No reviews found</p>
                                        {activeTab && (
                                            <button onClick={() => setActiveTab('')} className="mt-2 text-primary-600 font-semibold text-sm hover:underline">
                                                Clear filter
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review) => (
                                    <tr key={review._id} className={`hover:bg-gray-50/50 transition-colors ${review.isHighlighted ? 'bg-amber-50/30' : ''}`}>
                                        {/* Product */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2.5 max-w-[180px]">
                                                {review.product?.images?.[0] && (
                                                    <img src={review.product.images[0]} alt="" className="h-9 w-9 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                                                )}
                                                <p className="text-sm font-semibold text-gray-800 truncate">{review.product?.name || 'Unknown Product'}</p>
                                            </div>
                                        </td>

                                        {/* Customer */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 flex-shrink-0 overflow-hidden">
                                                    {review.user?.profilePicture
                                                        ? <img src={review.user.profilePicture} alt="" className="h-full w-full object-cover" />
                                                        : review.user?.name?.charAt(0)?.toUpperCase()
                                                    }
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{review.user?.name || 'Unknown'}</span>
                                            </div>
                                        </td>

                                        {/* Rating */}
                                        <td className="px-5 py-4">
                                            <div className="space-y-0.5">
                                                <StarRating rating={review.rating} />
                                                <p className="text-xs text-gray-400">{review.rating}/5</p>
                                            </div>
                                        </td>

                                        {/* Comment */}
                                        <td className="px-5 py-4 max-w-[200px]">
                                            <div>
                                                <p className="text-sm text-gray-700 line-clamp-2">{review.review}</p>
                                                {review.isHighlighted && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold mt-1">
                                                        <BookmarkCheck className="h-3 w-3" /> Highlighted
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <StatusBadge status={review.status} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1">
                                                {/* Approve */}
                                                {review.status !== 'approved' && (
                                                    <button
                                                        title="Approve"
                                                        onClick={() => handleAction(review._id, 'approve', approveReview)}
                                                        disabled={!!actionId}
                                                        className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                                                    >
                                                        {isLoading(review._id, 'approve')
                                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                                            : <ThumbsUp className="h-4 w-4" />
                                                        }
                                                    </button>
                                                )}

                                                {/* Reject */}
                                                {review.status !== 'rejected' && (
                                                    <button
                                                        title="Reject"
                                                        onClick={() => handleAction(review._id, 'reject', rejectReview)}
                                                        disabled={!!actionId}
                                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                    >
                                                        {isLoading(review._id, 'reject')
                                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                                            : <ThumbsDown className="h-4 w-4" />
                                                        }
                                                    </button>
                                                )}

                                                {/* Highlight */}
                                                <button
                                                    title={review.isHighlighted ? 'Remove Highlight' : 'Highlight'}
                                                    onClick={() => handleAction(review._id, 'highlight', highlightReview)}
                                                    disabled={!!actionId}
                                                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                                        review.isHighlighted
                                                            ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                                                            : 'text-gray-400 hover:bg-gray-100 hover:text-amber-500'
                                                    }`}
                                                >
                                                    {isLoading(review._id, 'highlight')
                                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                                        : review.isHighlighted
                                                            ? <BookmarkCheck className="h-4 w-4" />
                                                            : <Bookmark className="h-4 w-4" />
                                                    }
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    title="Delete"
                                                    onClick={() => {
                                                        if (window.confirm('Delete this review? This cannot be undone.'))
                                                            handleAction(review._id, 'delete', deleteReview)
                                                    }}
                                                    disabled={!!actionId}
                                                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                                                >
                                                    {isLoading(review._id, 'delete')
                                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                                        : <Trash2 className="h-4 w-4" />
                                                    }
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Page {currentPage} of {totalPages} &middot; {total} reviews</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchReviews({ status: activeTab, page: currentPage - 1 })}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchReviews({ status: activeTab, page: currentPage + 1 })}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
