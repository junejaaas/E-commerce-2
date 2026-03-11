import { useEffect } from 'react'
import { useOrderStore } from '../../store/orderStore'
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { OrdersSkeleton } from '../../components/common/Skeleton'

export default function Orders() {
    const { orders, loading, fetchOrders, downloadInvoice } = useOrderStore()

    useEffect(() => {
        fetchOrders()
    }, [])

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'text-green-600 bg-green-50'
            case 'Processing': return 'text-primary-600 bg-primary-50'
            case 'Shipped': return 'text-blue-600 bg-blue-50'
            case 'Cancelled': return 'text-red-600 bg-red-50'
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle className="h-4 w-4 mr-1.5" />
            case 'Processing': return <Clock className="h-4 w-4 mr-1.5" />
            case 'Shipped': return <Truck className="h-4 w-4 mr-1.5" />
            case 'Cancelled': return <XCircle className="h-4 w-4 mr-1.5" />
            default: return <Package className="h-4 w-4 mr-1.5" />
        }
    }

    if (loading && orders.length === 0) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-20">
                <h1 className="text-4xl font-black text-gray-900 mb-10">Order History</h1>
                <div className="space-y-6">
                    {[...Array(3)].map((_, i) => <OrdersSkeleton key={i} />)}
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-20">
            <div className="flex items-center justify-between mb-10">
                <h1 className="text-4xl font-black text-gray-900">Order History</h1>
                <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                    <Package className="h-5 w-5" />
                </div>
            </div>

            {orders.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No orders found"
                    description="You haven't placed any orders yet."
                    actionLabel="Start Shopping"
                    actionPath="/products"
                />
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Order ID: #{order._id}</p>
                                    <div className="flex items-center space-x-4">
                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                                            {getStatusIcon(order.orderStatus)} {order.orderStatus}
                                        </span>
                                        <span className="text-sm text-gray-400 font-medium">Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end md:space-x-8">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total</p>
                                        <p className="text-2xl font-black text-gray-900">${order.totalAmount}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        {order.orderStatus === 'Delivered' && (
                                            <button 
                                                onClick={() => downloadInvoice(order._id)}
                                                className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                                                title="Download Invoice"
                                            >
                                                <FileText className="h-6 w-6" />
                                            </button>
                                        )}
                                        <Link to={`/orders/${order._id}`}>
                                            <button className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all group">
                                                <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Items Preview */}
                            <div className="bg-gray-50/50 px-8 py-4 flex gap-4 overflow-x-auto border-t border-gray-50">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="h-12 w-12 rounded-lg bg-white border border-gray-100 p-1 flex-shrink-0">
                                        <img src={item.image || item.product?.images?.[0]?.url} className="h-full w-full object-contain" title={item.name} />
                                    </div>
                                ))}
                                {order.items.length > 5 && (
                                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                        +{order.items.length - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
