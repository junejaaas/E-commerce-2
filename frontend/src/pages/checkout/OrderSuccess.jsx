import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Package, ArrowLeft, Download } from 'lucide-react'
import API from '../../services/api'
import { Button } from '../../components/common/Button'

export default function OrderSuccess() {
    const { id } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await API.get(`/orders/${id}`)
                setOrder(data.order || data)
            } catch (error) {
                console.error('Failed to fetch order', error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [id])

    if (loading) return <div className="p-20 text-center font-bold">Processing your order...</div>

    return (
        <div className="max-w-3xl mx-auto px-4 py-20">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-primary-600 p-12 text-center text-white">
                    <CheckCircle className="h-16 w-16 mx-auto mb-6 text-primary-200 animate-bounce" />
                    <h1 className="text-3xl font-black mb-2">Order Confirmed!</h1>
                    <p className="text-primary-100">Thank you for your purchase. We've received your order.</p>
                </div>

                <div className="p-10 space-y-10">
                    <div className="grid grid-cols-2 gap-8 text-sm">
                        <div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest mb-1">Order ID</p>
                            <p className="text-gray-900 font-bold">#{order?._id}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest mb-1">Date</p>
                            <p className="text-gray-900 font-bold">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="border-t border-b border-gray-100 py-8">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center">
                            <Package className="h-5 w-5 mr-2 text-primary-600" /> Order Items
                        </h3>
                        <div className="space-y-4">
                            {order?.orderItems?.map(item => (
                                <div key={item.product._id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                    <div className="flex items-center space-x-4">
                                        <img src={item.product.images[0]?.url} className="h-12 w-12 object-contain bg-white rounded-lg p-1 border" />
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm line-clamp-1">{item.product.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-black text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-bold text-gray-900">${order?.itemsPrice}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="font-bold text-gray-900">${order?.shippingPrice}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black pt-4 border-t border-gray-100">
                                <span className="text-gray-900">Total Paid</span>
                                <span className="text-primary-600">${order?.totalPrice}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link to="/orders" className="flex-1">
                            <Button variant="secondary" className="w-full py-4 rounded-xl font-bold">
                                View My Orders
                            </Button>
                        </Link>
                        <Link to="/" className="flex-1">
                            <Button className="w-full py-4 rounded-xl font-bold">
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
