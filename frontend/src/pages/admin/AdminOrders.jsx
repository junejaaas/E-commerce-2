import { useEffect, useState } from 'react'
import API from '../../services/api'
import { useOrderStore } from '../../store/orderStore'
import { 
    Package, Search, ChevronDown, CheckCircle, Clock, Truck, 
    XCircle, ChevronRight, RefreshCw, MapPin, CreditCard, 
    User, Eye, RotateCcw, Box, AlertCircle
} from 'lucide-react'
import { Button } from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AdminOrders() {
    const { orders, loading, fetchAllOrdersAdmin, updateOrderStatusAdmin, refundOrderAdmin } = useOrderStore()
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showDetails, setShowDetails] = useState(false)
    const [agents, setAgents] = useState([])

    useEffect(() => {
        fetchAllOrdersAdmin()
        fetchAgents()
    }, [])

    const fetchAgents = async () => {
        try {
            const { data } = await API.get('/admin/agents')
            setAgents(data.data || [])
        } catch (error) {
            console.error('Failed to fetch agents', error)
        }
    }

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending': return { icon: <Clock className="h-4 w-4" />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' }
            case 'processing': return { icon: <Box className="h-4 w-4" />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' }
            case 'confirmed': return { icon: <CheckCircle className="h-4 w-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' }
            case 'shipped': return { icon: <Truck className="h-4 w-4" />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' }
            case 'delivered': return { icon: <CheckCircle className="h-4 w-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' }
            case 'cancelled': return { icon: <XCircle className="h-4 w-4" />, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' }
            case 'returned': return { icon: <RotateCcw className="h-4 w-4" />, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100' }
            default: return { icon: <Clock className="h-4 w-4" />, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100' }
        }
    }

    const filteredOrders = orders.filter(o => {
        const matchesFilter = filter === 'all' || o.orderStatus === filter
        const query = searchTerm.toLowerCase()
        const matchesSearch = searchTerm === '' || 
            o._id.toLowerCase().includes(query) ||
            o.user?.name?.toLowerCase().includes(query) ||
            o.user?.email?.toLowerCase().includes(query)
        return matchesFilter && matchesSearch
    })

    const handleViewDetails = (order) => {
        setSelectedOrder(order)
        setShowDetails(true)
    }

    if (loading && orders.length === 0) return <LoadingSpinner />

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Order Fulfilment</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage customer orders and shipping statuses</p>
                </div>
                <Button 
                    variant="outline"
                    onClick={fetchAllOrdersAdmin}
                    className="rounded-2xl border-2 hover:bg-gray-50"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Orders', value: orders.length, color: 'text-gray-900' },
                    { label: 'Pending', value: orders.filter(o => o.orderStatus === 'pending').length, color: 'text-amber-600' },
                    { label: 'Processing', value: orders.filter(o => o.orderStatus === 'processing').length, color: 'text-blue-600' },
                    { label: 'Delivered', value: orders.filter(o => o.orderStatus === 'delivered').length, color: 'text-emerald-600' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Customer..."
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary-500 outline-none transition-all shadow-inner font-medium text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    filter === f 
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' 
                                    : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-100'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Order & Customer</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Items & Total</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Payment</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Status</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Delivery Agent</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOrders.map((order) => {
                                const status = getStatusConfig(order.orderStatus)
                                return (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-6 font-medium">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900 mb-1 tracking-tight">#{order._id.slice(-8).toUpperCase()}</span>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <User className="h-3 w-3 mr-1" /> {order.user?.name || 'Guest User'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900">₹{order.totalAmount}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{order.items.length} items</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-medium">
                                            <div className="relative w-max">
                                                <select
                                                    value={order.paymentStatus}
                                                    onChange={(e) => updateOrderStatusAdmin(order._id, null, e.target.value)}
                                                    className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest outline-none border transition-all cursor-pointer ${
                                                        order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        order.paymentStatus === 'refunded' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="failed">Failed</option>
                                                    <option value="refunded">Refunded</option>
                                                </select>
                                                <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 ${
                                                    order.paymentStatus === 'paid' ? 'text-emerald-700' :
                                                    order.paymentStatus === 'refunded' ? 'text-blue-700' :
                                                    'text-amber-700'
                                                }`} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="relative w-max">
                                                <select
                                                    value={order.orderStatus}
                                                    onChange={(e) => updateOrderStatusAdmin(order._id, e.target.value)}
                                                    className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest outline-none border transition-all cursor-pointer ${status.bg} ${status.color} ${status.border}`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                    <option value="returned">Returned</option>
                                                </select>
                                                <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 ${status.color}`} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-medium">
                                            <div className="relative w-max">
                                                <div className="flex flex-col gap-2">
                                                    <select 
                                                        className={`text-xs border rounded p-1 outline-none focus:ring-1 ${
                                                            order.orderStatus === 'delivered' && !order.deliveryAgent ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
                                                        }`}
                                                        value={order.deliveryAgent?._id || order.deliveryAgent || ''}
                                                        onChange={(e) => updateOrderStatusAdmin(order._id, null, null, e.target.value)}
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {agents.map(agent => (
                                                            <option key={agent._id} value={agent._id}>{agent.name}</option>
                                                        ))}
                                                    </select>
                                                    
                                                    {order.orderStatus === 'delivered' && !order.deliveryAgent && (
                                                        <div className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase">
                                                            <AlertCircle className="h-2 w-2" /> Needs Agent
                                                        </div>
                                                    )}

                                                    {order.orderStatus === 'delivered' && 
                                                     ['cod', 'Cash on Delivery'].includes(order.paymentMethod) && 
                                                     order.deliveryAgent &&
                                                     !order.isSettled && (
                                                        <button 
                                                            onClick={() => updateOrderStatusAdmin(order._id, null, null, undefined, undefined, true)}
                                                            className="text-[9px] font-black uppercase tracking-widest py-1 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 hover:bg-emerald-100 transition-colors"
                                                        >
                                                            Settle Cash (₹{order.collectedAmount || order.totalAmount})
                                                        </button>
                                                    )}
                                                    {order.isSettled && (
                                                        <span className="text-[9px] font-black uppercase text-emerald-500 text-center flex items-center justify-center gap-1">
                                                            <CheckCircle className="h-2 w-2" /> Settled
                                                        </span>
                                                    )}
                                                </div>

                                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleViewDetails(order)}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                                {order.paymentStatus === 'paid' && (
                                                    <button 
                                                        onClick={() => {
                                                            if (window.confirm('Refund this order? The status will be updated to "cancelled" and payment to "refunded".')) {
                                                                refundOrderAdmin(order._id)
                                                            }
                                                        }}
                                                        className={`p-2 rounded-xl transition-all ${
                                                            order.orderStatus === 'cancelled' 
                                                            ? 'bg-rose-50 text-rose-600 animate-pulse border border-rose-100 shadow-sm' 
                                                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                                        }`}
                                                        title={order.orderStatus === 'cancelled' ? "ACTION REQUIRED: Refund Paid Order" : "Refund Order"}
                                                    >
                                                        <RotateCcw className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {filteredOrders.length === 0 && (
                        <div className="p-20 text-center flex flex-col items-center">
                            <div className="h-20 w-20 bg-gray-50 rounded-[40px] flex items-center justify-center mb-4">
                                <Box className="h-10 w-10 text-gray-200" />
                            </div>
                            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">No orders match filters</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {showDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                    Order #{selectedOrder._id.toUpperCase()}
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusConfig(selectedOrder.orderStatus).bg} ${getStatusConfig(selectedOrder.orderStatus).color} ${getStatusConfig(selectedOrder.orderStatus).border}`}>
                                        {selectedOrder.orderStatus}
                                    </span>
                                    {selectedOrder.paymentStatus === 'paid' && selectedOrder.orderStatus === 'cancelled' && (
                                        <div className="flex items-center gap-1 text-[8px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 animate-pulse w-max">
                                            <AlertCircle className="h-2 w-2" /> Action: Refund
                                        </div>
                                    )}
                                </h3>
                                <p className="text-gray-500 font-medium text-sm mt-1">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            </div>
                            <button 
                                onClick={() => setShowDetails(false)}
                                className="p-3 bg-white border-2 border-gray-100 hover:bg-gray-50 rounded-2xl transition-all"
                            >
                                <XCircle className="h-6 w-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Items Section */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Package className="h-4 w-4" /> Ordered Items ({selectedOrder.items.length})
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item, i) => (
                                            <div key={i} className="flex items-center p-4 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                                <div className="h-16 w-16 min-w-[64px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 mr-4">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center"><Box className="h-6 w-6 text-gray-300" /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-black text-gray-900 truncate text-sm">{item.name}</h5>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty: {item.quantity} × ₹{item.price}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-gray-900">₹{item.totalProductPrice}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="p-6 bg-gray-900 rounded-[32px] text-white">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <span>Subtotal</span>
                                            <span className="text-white">₹{selectedOrder.subTotal}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <span>Shipping Fee</span>
                                            <span className="text-emerald-400">FREE</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <span>Tax (GST)</span>
                                            <span className="text-white">₹{selectedOrder.tax || 0}</span>
                                        </div>
                                        <div className="h-px bg-white/10 my-4" />
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-black text-primary-400 uppercase tracking-[0.2em]">Total Amount</span>
                                            <span className="text-3xl font-black tracking-tighter">₹{selectedOrder.totalAmount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Info */}
                            <div className="space-y-8">
                                {/* Customer Info */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <User className="h-4 w-4" /> Customer Info
                                    </h4>
                                    <div className="p-6 bg-gray-50 rounded-[32px] space-y-2 border border-blue-50">
                                        <p className="font-black text-gray-900">{selectedOrder.user?.name || 'Guest User'}</p>
                                        <p className="text-[10px] font-bold text-gray-500 underline truncate">{selectedOrder.user?.email || 'No email provided'}</p>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> Shipping Address
                                    </h4>
                                    <div className="p-6 bg-gray-50 rounded-[32px] text-xs font-bold text-gray-600 leading-relaxed border border-indigo-50">
                                        <p className="text-gray-900 font-black mb-1 text-sm">{selectedOrder.shippingAddress?.fullName}</p>
                                        <p>{selectedOrder.shippingAddress?.street}</p>
                                        <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                                        <p>{selectedOrder.shippingAddress?.postalCode}</p>
                                        <p className="mt-2 text-gray-400 flex items-center gap-1 uppercase tracking-widest text-[9px]">
                                            <CreditCard className="h-3 w-3" /> Phone: {selectedOrder.shippingAddress?.phone}
                                        </p>
                                    </div>
                                </div>

                                {/* Payment Details */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" /> Payment Details
                                    </h4>
                                    <div className="p-6 bg-gray-50 rounded-[32px] space-y-3 border border-emerald-50">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</span>
                                            <span className="text-xs font-black text-gray-900 uppercase">{selectedOrder.paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                                            <div className="relative w-max">
                                                <select
                                                    value={selectedOrder.paymentStatus}
                                                    onChange={(e) => updateOrderStatusAdmin(selectedOrder._id, null, e.target.value)}
                                                    className={`appearance-none pl-3 pr-8 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest outline-none border transition-all cursor-pointer ${
                                                        selectedOrder.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="failed">Failed</option>
                                                    <option value="refunded">Refunded</option>
                                                </select>
                                                <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 ${
                                                    selectedOrder.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                                                }`} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</span>
                                            <span className="text-[10px] font-mono text-gray-600 truncate">{selectedOrder.transactionId || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-4">
                            <Button 
                                variant="outline" 
                                className="rounded-2xl px-8 flex items-center gap-2 border-2"
                                onClick={() => window.print()}
                            >
                                <Package className="h-4 w-4" /> Print Packing Slip
                            </Button>
                            <Button 
                                className="rounded-2xl px-12 font-black shadow-xl shadow-primary-200"
                                onClick={() => setShowDetails(false)}
                            >
                                Close Details
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
