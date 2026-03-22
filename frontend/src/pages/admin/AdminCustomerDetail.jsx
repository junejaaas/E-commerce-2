import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCustomerStore } from '../../store/customerStore'
import {
    ArrowLeft, Mail, Phone, Calendar, ShieldOff, ShieldCheck,
    KeyRound, Package, ShoppingBag, IndianRupee, Loader2, UserCircle2
} from 'lucide-react'
import toast from 'react-hot-toast'

const StatusBadge = ({ status }) => {
    const styles = {
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
        processing: 'bg-blue-100 text-blue-700',
        pending: 'bg-amber-100 text-amber-700',
        shipped: 'bg-purple-100 text-purple-700',
        confirmed: 'bg-cyan-100 text-cyan-700',
        returned: 'bg-gray-100 text-gray-600',
    }
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    )
}

export default function AdminCustomerDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { selectedCustomer: customer, selectedCustomerOrders: orders, loading, fetchCustomerById, toggleBlock, resetPassword } = useCustomerStore()
    const [blockingId, setBlockingId] = useState(null)
    const [resettingId, setResettingId] = useState(null)
    const [resetModal, setResetModal] = useState(null)

    useEffect(() => {
        fetchCustomerById(id)
    }, [id])

    const handleBlock = async () => {
        setBlockingId(id)
        await toggleBlock(id)
        setBlockingId(null)
        fetchCustomerById(id)
    }

    const handleResetPassword = async () => {
        if (!window.confirm('Reset this customer\'s password?')) return
        setResettingId(id)
        const temp = await resetPassword(id)
        setResettingId(null)
        if (temp) setResetModal(temp)
    }

    if (loading && !customer) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        )
    }

    if (!loading && !customer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96 text-gray-500">
                <UserCircle2 className="h-12 w-12 text-gray-300 mb-3" />
                <p className="font-medium">Customer not found</p>
                <button onClick={() => navigate('/admin/customers')} className="mt-3 text-primary-600 font-semibold text-sm hover:underline">
                    Back to Customers
                </button>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            {/* Back */}
            <button
                onClick={() => navigate('/admin/customers')}
                className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Customers
            </button>

            {customer && (
                <>
                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div className="h-20 w-20 rounded-2xl bg-primary-100 flex items-center justify-center font-bold text-primary-700 text-2xl flex-shrink-0 overflow-hidden">
                                {customer.profilePicture ? (
                                    <img src={customer.profilePicture} alt={customer.name} className="h-full w-full object-cover" />
                                ) : (
                                    customer.name?.charAt(0)?.toUpperCase()
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3 mb-1">
                                    <h2 className="text-xl font-black text-gray-900">{customer.name}</h2>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${customer.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {customer.isBlocked ? 'Blocked' : 'Active'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{customer.email}</span>
                                    {customer.phoneNumber && <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" />{customer.phoneNumber}</span>}
                                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={handleBlock}
                                    disabled={!!blockingId}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                                        customer.isBlocked
                                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                                    }`}
                                >
                                    {blockingId
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : customer.isBlocked
                                            ? <ShieldCheck className="h-4 w-4" />
                                            : <ShieldOff className="h-4 w-4" />
                                    }
                                    {customer.isBlocked ? 'Unblock' : 'Block'}
                                </button>
                                <button
                                    onClick={handleResetPassword}
                                    disabled={!!resettingId}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                                >
                                    {resettingId ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                                    Reset Password
                                </button>
                                <a
                                    href={`mailto:${customer.email}`}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                >
                                    <Mail className="h-4 w-4" /> Email
                                </a>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                    <ShoppingBag className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
                                </div>
                                <p className="text-2xl font-black text-gray-900">{customer.totalOrders}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                    <IndianRupee className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Total Spent</span>
                                </div>
                                <p className="text-2xl font-black text-gray-900">₹{customer.totalSpending?.toLocaleString('en-IN') || '0'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Member Since</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">{new Date(customer.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                            <Package className="h-5 w-5 text-gray-400" />
                            <h3 className="font-bold text-gray-900">Order History</h3>
                            <span className="ml-auto text-sm text-gray-400">{orders.length} orders</span>
                        </div>

                        {orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <ShoppingBag className="h-10 w-10 mb-3" />
                                <p className="font-medium">No orders yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-50">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            {['Order ID', 'Items', 'Amount', 'Payment', 'Status', 'Date'].map(h => (
                                                <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {orders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-5 py-4">
                                                    <span className="font-mono text-xs text-gray-500">#{order._id.slice(-8).toUpperCase()}</span>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                                                <td className="px-5 py-4 text-sm font-semibold text-gray-900">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                                                <td className="px-5 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                                        order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {order.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4"><StatusBadge status={order.orderStatus} /></td>
                                                <td className="px-5 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Reset Password Modal */}
            {resetModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <KeyRound className="h-5 w-5 text-amber-600" />
                            </div>
                            <h3 className="font-bold text-gray-900">Password Reset</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Temporary password for {customer.name}:</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-lg font-bold text-gray-900 text-center tracking-wider mb-4">
                            {resetModal}
                        </div>
                        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2.5 mb-4">⚠ Shown only once. Copy it now.</p>
                        <div className="flex gap-3">
                            <button onClick={() => { navigator.clipboard.writeText(resetModal); toast.success('Copied!') }} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 text-sm">Copy</button>
                            <button onClick={() => setResetModal(null)} className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 text-sm">Done</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
