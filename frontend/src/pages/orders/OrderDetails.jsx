import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../../services/api'
import { Package, Truck, CheckCircle2, XCircle, Calendar, MapPin, CreditCard, Download, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '../../components/common/Button'
import toast from 'react-hot-toast'

export default function OrderDetails() {
    const { id } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrder()
    }, [id])

    const fetchOrder = async () => {
        try {
            const { data } = await API.get(`/orders/${id}`)
            setOrder(data)
        } catch (error) {
            toast.error('Failed to load order details')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadInvoice = async () => {
        try {
            const response = await API.get(`/orders/${id}/invoice`, { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `invoice-${id}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (error) {
            toast.error('Failed to download invoice')
        }
    }

    if (loading) return <div className="p-20 text-center animate-pulse">Loading order details...</div>
    if (!order) return <div className="p-20 text-center font-bold">Order not found</div>

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-20">
            <Link to="/orders" className="flex items-center text-gray-500 hover:text-primary-600 mb-8 font-bold transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" /> Back to My Orders
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-3xl font-black text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                                order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                                    'bg-orange-100 text-orange-700'
                            }`}>
                            {order.orderStatus}
                        </span>
                    </div>
                    <p className="text-gray-500 flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2" /> Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={handleDownloadInvoice} variant="secondary" className="rounded-xl">
                        <Download className="h-5 w-5 mr-2" /> Invoice
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Items */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-sm">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h2 className="font-bold text-gray-900">Order Items</h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="p-6 flex items-center gap-6">
                                    <div className="h-16 w-16 bg-gray-50 rounded-xl flex-shrink-0 p-1 border border-gray-100">
                                        <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                                        <p className="text-xs text-gray-400">Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-black text-gray-900">${item.totalProductPrice.toFixed(2)}</p>
                                        <p className="text-[10px] text-gray-400 mb-2">${item.price} ea</p>
                                        {order.orderStatus === 'delivered' && (
                                            <Link
                                                to={`/orders/${order._id}/return/${item.product._id || item.product}`}
                                                className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 bg-orange-50 px-2 py-1 rounded transition-all"
                                            >
                                                <RefreshCw className="h-3 w-3 mr-1" /> Return
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                        <h2 className="font-bold text-gray-900 mb-8">Tracking Details</h2>
                        <div className="space-y-8">
                            {['processing', 'shipped', 'delivered'].map((step, i) => {
                                const steps = ['processing', 'shipped', 'delivered']
                                const isCompleted = steps.indexOf(order.orderStatus) >= i
                                    || order.orderStatus === 'delivered'
                                return (
                                    <div key={step} className="flex items-start">
                                        <div className="flex flex-col items-center mr-6">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center border-4 ${isCompleted ? 'bg-primary-600 border-primary-100' : 'bg-gray-100 border-gray-50'
                                                }`}>
                                                {isCompleted && <CheckCircle2 className="h-4 w-4 text-white" />}
                                            </div>
                                            {i < 2 && <div className={`w-1 h-12 ${isCompleted ? 'bg-primary-600' : 'bg-gray-100'}`} />}
                                        </div>
                                        <div className="pt-1">
                                            <h4 className={`font-bold capitalize text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step}</h4>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-0.5">
                                                {isCompleted ? 'Confirmed' : 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Shipping */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-sm">
                        <h2 className="font-bold text-gray-900 mb-6 flex items-center">
                            <MapPin className="h-5 w-5 mr-2 text-primary-600" /> Delivery To
                        </h2>
                        <div className="text-gray-600 space-y-1">
                            <p className="font-bold text-gray-900">{order.shippingAddress?.name}</p>
                            <p>{order.shippingAddress?.addressLine}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                            <p className="pt-4 text-xs font-bold text-gray-400">{order.shippingAddress?.phoneNumber}</p>
                        </div>
                    </div>

                    {/* Financials */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-sm">
                        <h2 className="font-bold text-gray-900 mb-6 flex items-center">
                            <CreditCard className="h-5 w-5 mr-2 text-primary-600" /> Payment
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Method</span>
                                <span className="font-black text-gray-900 uppercase">{order.paymentMethod}</span>
                            </div>
                            <div className="space-y-2 px-1 pt-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="font-bold text-gray-900">${order.subTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Shipping</span>
                                    <span className="font-bold text-gray-900">${order.shippingFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Tax</span>
                                    <span className="font-bold text-gray-900">${order.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg pt-4 border-t border-gray-50 mt-4">
                                    <span className="font-black text-gray-900">Total</span>
                                    <span className="font-black text-primary-600">${order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className={`mt-4 text-center py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                Payment {order.paymentStatus}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
