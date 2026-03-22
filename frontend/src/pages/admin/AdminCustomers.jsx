import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomerStore } from '../../store/customerStore'
import {
    Users, Search, Eye, ShieldOff, ShieldCheck, KeyRound, Mail,
    ChevronLeft, ChevronRight, Loader2, UserX, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

const StatusBadge = ({ isBlocked }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
    }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isBlocked ? 'bg-red-500' : 'bg-green-500'}`} />
        {isBlocked ? 'Blocked' : 'Active'}
    </span>
)

export default function AdminCustomers() {
    const navigate = useNavigate()
    const { customers, loading, total, totalPages, currentPage, fetchCustomers, toggleBlock, resetPassword } = useCustomerStore()
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [resetModal, setResetModal] = useState(null) // { name, tempPassword }
    const [blockingId, setBlockingId] = useState(null)
    const [resettingId, setResettingId] = useState(null)

    useEffect(() => {
        fetchCustomers({ search, page: currentPage })
    }, [search, currentPage])

    const handleSearch = (e) => {
        e.preventDefault()
        setSearch(searchInput)
    }

    const handleBlock = async (id, name) => {
        setBlockingId(id)
        const isBlocked = await toggleBlock(id)
        setBlockingId(null)
    }

    const handleResetPassword = async (id, name) => {
        if (!window.confirm(`Reset password for ${name}? A temporary password will be generated.`)) return
        setResettingId(id)
        const temp = await resetPassword(id)
        setResettingId(null)
        if (temp) {
            setResetModal({ name, tempPassword: temp })
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Users className="h-7 w-7 text-primary-600" />
                        Customer Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">{total} total customers</p>
                </div>
                <button onClick={() => fetchCustomers({ search, page: currentPage })} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
                <button type="submit" className="px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                    Search
                </button>
                {search && (
                    <button type="button" onClick={() => { setSearch(''); setSearchInput('') }} className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
                        Clear
                    </button>
                )}
            </form>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="bg-gray-50">
                                {['Customer', 'Email', 'Phone', 'Orders', 'Total Spent', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(7)].map((_, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <UserX className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No customers found</p>
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 text-sm flex-shrink-0 overflow-hidden">
                                                    {customer.profilePicture ? (
                                                        <img src={customer.profilePicture} alt={customer.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        customer.name?.charAt(0)?.toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{customer.name}</p>
                                                    <p className="text-xs text-gray-400">{new Date(customer.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{customer.email}</td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{customer.phoneNumber || <span className="text-gray-300">—</span>}</td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                                                {customer.totalOrders}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                                            ₹{customer.totalSpending?.toLocaleString('en-IN') || '0'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge isBlocked={customer.isBlocked} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    title="View Details"
                                                    onClick={() => navigate(`/admin/customers/${customer._id}`)}
                                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    title={customer.isBlocked ? 'Unblock' : 'Block'}
                                                    onClick={() => handleBlock(customer._id, customer.name)}
                                                    disabled={blockingId === customer._id}
                                                    className={`p-2 rounded-lg transition-colors ${customer.isBlocked
                                                        ? 'text-green-600 hover:bg-green-50'
                                                        : 'text-red-500 hover:bg-red-50'
                                                    } disabled:opacity-50`}
                                                >
                                                    {blockingId === customer._id
                                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                                        : customer.isBlocked
                                                            ? <ShieldCheck className="h-4 w-4" />
                                                            : <ShieldOff className="h-4 w-4" />
                                                    }
                                                </button>
                                                <button
                                                    title="Reset Password"
                                                    onClick={() => handleResetPassword(customer._id, customer.name)}
                                                    disabled={resettingId === customer._id}
                                                    className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-50"
                                                >
                                                    {resettingId === customer._id
                                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                                        : <KeyRound className="h-4 w-4" />
                                                    }
                                                </button>
                                                <a
                                                    href={`mailto:${customer.email}`}
                                                    title="Send Email"
                                                    className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                                                >
                                                    <Mail className="h-4 w-4" />
                                                </a>
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
                        <p className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages} &middot; {total} customers
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchCustomers({ search, page: currentPage - 1 })}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => fetchCustomers({ search, page: currentPage + 1 })}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Reset Password Modal */}
            {resetModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <KeyRound className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Password Reset</h3>
                                <p className="text-sm text-gray-500">for {resetModal.name}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Share this temporary password with the customer:</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-lg font-bold text-gray-900 text-center tracking-wider mb-4">
                            {resetModal.tempPassword}
                        </div>
                        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2.5 mb-4">
                            ⚠ This password is shown only once. Please copy it now.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { navigator.clipboard.writeText(resetModal.tempPassword); toast.success('Copied!') }}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                            >
                                Copy
                            </button>
                            <button
                                onClick={() => setResetModal(null)}
                                className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-sm"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
