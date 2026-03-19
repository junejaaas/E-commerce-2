import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Calendar, Target, DollarSign, Percent, MoreVertical, X, Check, Power } from 'lucide-react'
import { useCouponStore } from '../../store/couponStore'
import { Button } from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AdminCoupons() {
    const { coupons, loading, fetchCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } = useCouponStore()
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountAmount: '',
        minOrderAmount: '',
        expiryDate: '',
        usageLimit: '',
        isActive: true
    })

    useEffect(() => {
        fetchCoupons()
    }, [])

    const filteredCoupons = coupons.filter(c => 
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon)
        setFormData({
            code: coupon.code,
            discountType: coupon.discountType,
            discountAmount: coupon.discountAmount,
            minOrderAmount: coupon.minOrderAmount || 0,
            expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
            usageLimit: coupon.usageLimit || '',
            isActive: coupon.isActive
        })
        setShowAddModal(true)
    }

    const resetForm = () => {
        setFormData({
            code: '',
            discountType: 'percentage',
            discountAmount: '',
            minOrderAmount: '',
            expiryDate: '',
            usageLimit: '',
            isActive: true
        })
        setEditingCoupon(null)
        setShowAddModal(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        
        const payload = {
            ...formData,
            discountAmount: Number(formData.discountAmount),
            minOrderAmount: Number(formData.minOrderAmount),
            usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
            code: formData.code.toUpperCase()
        }

        let success
        if (editingCoupon) {
            success = await updateCoupon(editingCoupon._id, payload)
        } else {
            success = await createCoupon(payload)
        }

        setIsSubmitting(false)
        if (success) resetForm()
    }

    if (loading && coupons.length === 0) return <LoadingSpinner />

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Coupon Management</h1>
                    <p className="text-gray-500 mt-2 font-medium">Create and manage discount codes for your customers</p>
                </div>
                <Button 
                    onClick={() => setShowAddModal(true)} 
                    className="rounded-2xl px-6 py-6 shadow-xl shadow-primary-200 hover:scale-105 transition-transform"
                >
                    <Plus className="h-5 w-5 mr-2" /> Create New Coupon
                </Button>
            </div>

            {/* Filters & Grid */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search code..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary-500 outline-none transition-all shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Coupon Details</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-center">Discount</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-center">Usage</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-center">Status</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCoupons.map((coupon) => (
                                <tr key={coupon._id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 border border-primary-100">
                                                <Target className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="text-lg font-black text-gray-900 leading-none">{coupon.code}</div>
                                                <div className="text-xs text-gray-400 mt-1.5 flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" /> Exp: {new Date(coupon.expiryDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-black text-sm border border-emerald-100">
                                            {coupon.discountType === 'percentage' ? (
                                                <><Percent className="h-3 w-3 mr-1" /> {coupon.discountAmount}%</>
                                            ) : (
                                                <><DollarSign className="h-3 w-3 mr-1" /> ₹{coupon.discountAmount}</>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-tight">
                                            Min: ₹{coupon.minOrderAmount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="text-sm font-black text-gray-900">{coupon.usedCount} <span className="text-gray-400 font-medium">used</span></div>
                                        <div className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-tight">
                                            Limit: {coupon.usageLimit || '∞'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <button 
                                            onClick={() => toggleCouponStatus(coupon._id, !coupon.isActive)}
                                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                                                coupon.isActive 
                                                ? 'bg-green-100 text-green-700 border-green-200' 
                                                : 'bg-gray-100 text-gray-500 border-gray-200 opacity-60'
                                            }`}
                                        >
                                            {coupon.isActive ? 'Active' : 'Draft'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleEdit(coupon)}
                                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                                            >
                                                <Edit2 className="h-5 w-5" />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if (window.confirm('Delete this coupon?')) {
                                                        deleteCoupon(coupon._id)
                                                    }
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl p-10 relative animate-in zoom-in-95 duration-200 border border-gray-100">
                        <button 
                            onClick={resetForm}
                            className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-2xl transition-colors"
                        >
                            <X className="h-6 w-6 text-gray-400" />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                {editingCoupon ? 'Update Coupon' : 'New Discount Code'}
                            </h2>
                            <p className="text-gray-500 font-medium mt-1">Configure your promotional offer settings</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Coupon Code</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-primary-500 focus:bg-white outline-none transition-all font-black text-lg placeholder-gray-300"
                                        placeholder="SALE2024"
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Discount Type</label>
                                    <select
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-primary-500 outline-none transition-all font-bold"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="flat">Flat Amount (₹)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Value</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="number"
                                            className="w-full pl-5 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-primary-500 outline-none transition-all font-bold"
                                            value={formData.discountAmount}
                                            onChange={(e) => setFormData({...formData, discountAmount: e.target.value})}
                                        />
                                        <span className="absolute right-4 top-4 text-gray-400 font-black">
                                            {formData.discountType === 'percentage' ? '%' : '₹'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Min Order (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-primary-500 outline-none transition-all font-bold"
                                        value={formData.minOrderAmount}
                                        onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Usage Limit</label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-primary-500 outline-none transition-all font-bold"
                                        placeholder="Unlimited"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Expiry Date</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-primary-500 outline-none transition-all font-bold"
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <Button 
                                    type="button" 
                                    variant="secondary" 
                                    className="flex-1 py-4 rounded-2xl border-2 border-gray-100 font-black"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    className="flex-1 py-4 rounded-2xl shadow-xl shadow-primary-200 font-black"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
