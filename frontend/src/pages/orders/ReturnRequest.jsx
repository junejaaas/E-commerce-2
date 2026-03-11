import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../../services/api'
import { ArrowLeft, RefreshCw, HelpCircle, ShieldAlert } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import toast from 'react-hot-toast'

export default function ReturnRequest() {
    const { orderId, productId } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        reason: '',
        type: 'Refund',
        quantity: 1
    })

    useEffect(() => {
        fetchOrder()
    }, [orderId])

    const fetchOrder = async () => {
        try {
            const { data } = await API.get(`/orders/${orderId}`)
            setOrder(data)
        } catch (error) {
            toast.error('Failed to load order')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await API.post('/returns', {
                orderId,
                productId,
                ...formData
            })
            toast.success('Return request submitted!')
            navigate('/orders')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit request')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-20 text-center animate-pulse">Preparing return request...</div>
    if (!order) return <div className="p-20 text-center font-bold">Order not found</div>

    const product = order.items.find(i => i.product._id === productId || i.product === productId)

    return (
        <div className="max-w-2xl mx-auto px-4 py-10 md:py-20">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-primary-600 mb-8 font-bold transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" /> Back
            </button>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-12">
                <div className="text-center mb-10">
                    <div className="h-16 w-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-4">
                        <RefreshCw className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">Return Request</h1>
                    <p className="text-gray-500 mt-2">Tell us why you'd like to return this item</p>
                </div>

                {product && (
                    <div className="flex items-center space-x-6 p-4 bg-gray-50 rounded-2xl mb-10 border border-gray-100">
                        <div className="h-16 w-16 bg-white rounded-xl p-1 shrink-0 border border-gray-100">
                            <img src={product.image} className="h-full w-full object-contain" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">{product.name}</h4>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Order #{orderId.slice(-6).toUpperCase()}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                            <HelpCircle className="h-4 w-4 mr-2 text-primary-600" /> What is the reason for return?
                        </label>
                        <select
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            required
                        >
                            <option value="">Select a reason</option>
                            <option value="Damaged product">Damaged product</option>
                            <option value="Wrong item received">Wrong item received</option>
                            <option value="Quality not as expected">Quality not as expected</option>
                            <option value="Missing parts">Missing parts</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Return Type</label>
                            <div className="flex space-x-2">
                                {['Refund', 'Replacement'].map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: t })}
                                        className={`flex-1 py-3 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${formData.type === t ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-50 bg-gray-50 text-gray-400'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                max={product?.quantity || 1}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-50 flex items-start space-x-4">
                        <ShieldAlert className="h-6 w-6 text-blue-500 shrink-0" />
                        <div className="text-xs text-blue-700 leading-relaxed font-medium">
                            <p className="font-bold mb-1">Return Policy</p>
                            Orders are eligible for return within 30 days of delivery. Keep all original packaging and tags for a faster refund process.
                        </div>
                    </div>

                    <Button type="submit" className="w-full py-5 rounded-2xl shadow-xl shadow-primary-200 font-black text-lg" isLoading={submitting}>
                        Submit Request
                    </Button>
                </form>
            </div>
        </div>
    )
}
