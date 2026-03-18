import { useEffect, useState } from 'react'
import API from '../../services/api'
import toast from 'react-hot-toast'
import { Package, Search, ChevronDown, CheckCircle, Clock, Truck, XCircle, ChevronRight, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const { data } = await API.get('/orders/admin')
            setOrders(Array.isArray(data) ? data : (data.orders || []))
        } catch (error) {
            console.error('Fetch orders error:', error)
            toast.error('Failed to fetch orders')
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId, status) => {
        try {
            await API.patch(`/orders/admin/${orderId}`, { status })
            toast.success(`Order status updated to ${status}`)
            // Update locally for instant feedback
            setOrders(prev => prev.map(o => 
                o._id === orderId ? { ...o, orderStatus: status } : o
            ))
        } catch (error) {
            console.error('Update status error:', error)
            toast.error(error.response?.data?.message || 'Failed to update status')
        }
    }

    const filteredOrders = orders.filter(o => {
        const matchesFilter = filter === 'all' || o.orderStatus === filter
        const matchesSearch = searchTerm === '' || 
            o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const getStatusConfig = (status) => {
        switch (status) {
            case 'processing': return { icon: <Package className="h-4 w-4" />, color: 'text-blue-600', bg: 'bg-blue-50' }
            case 'shipped': return { icon: <Truck className="h-4 w-4" />, color: 'text-purple-600', bg: 'bg-purple-50' }
            case 'delivered': return { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600', bg: 'bg-green-50' }
            case 'cancelled': return { icon: <XCircle className="h-4 w-4" />, color: 'text-red-600', bg: 'bg-red-50' }
            default: return { icon: <Clock className="h-4 w-4" />, color: 'text-gray-600', bg: 'bg-gray-50' }
        }
    }

    // Count orders by status for filter badges
    const statusCounts = orders.reduce((acc, o) => {
        acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1
        return acc
    }, {})

    if (loading) return <div className="p-20 text-center animate-pulse font-bold text-gray-500">Loading orders...</div>

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 flex items-center">
                        Order Management
                        <span className="ml-3 text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full">{orders.length} Orders</span>
                    </h1>
                    <p className="text-gray-500 mt-1">View and update customer orders</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className="h-4 w-4" /> Refresh
                </button>
            </div>

            {/* Search + Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by order ID, customer name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm flex-wrap">
                    {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filter === f ? 'bg-primary-600 text-white shadow-lg shadow-primary-100' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {f} {f !== 'all' && statusCounts[f] ? `(${statusCounts[f]})` : f === 'all' ? `(${orders.length})` : ''}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Items</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Total</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Payment</th>
                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                        <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">No orders found</p>
                                    </td>
                                </tr>
                            )}
                            {filteredOrders.map(order => {
                                const config = getStatusConfig(order.orderStatus)
                                return (
                                    <tr key={order._id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <span className="font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-semibold text-gray-900">{order.user?.name || 'Unknown User'}</div>
                                            <div className="text-xs text-gray-500">{order.user?.email || ''}</div>
                                        </td>
                                        <td className="px-8 py-6 text-gray-600 font-medium">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-gray-700">{order.items?.length || 0} items</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-black text-gray-900">${order.totalAmount}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                order.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' :
                                                order.paymentStatus === 'failed' ? 'bg-red-50 text-red-600' :
                                                'bg-yellow-50 text-yellow-600'
                                            }`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <select
                                                value={order.orderStatus}
                                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider outline-none border-none cursor-pointer appearance-none pr-8 ${config.bg} ${config.color}`}
                                                style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto' }}
                                            >
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
