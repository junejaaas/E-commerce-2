import { useState, useEffect } from 'react'
import { useAddressStore } from '../../store/addressStore'
import { Plus, Trash2, Home, Briefcase, MapPin, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/common/Button'
import AddressForm from '../../components/checkout/AddressForm'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'

export default function Addresses() {
    const { addresses, loading, fetchAddresses, deleteAddress, setDefaultAddress } = useAddressStore()
    const [showForm, setShowForm] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)

    useEffect(() => {
        fetchAddresses()
    }, [])

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            await deleteAddress(id)
        }
    }

    if (loading && addresses.length === 0) return <div className="p-20"><LoadingSpinner size="lg" /></div>

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-20">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">My Addresses</h1>
                    <p className="text-gray-500 mt-1">Manage your saved delivery locations</p>
                </div>
                <Button onClick={() => { setEditingAddress(null); setShowForm(true); }} className="rounded-xl px-6">
                    <Plus className="h-5 w-5 mr-2" /> Add New
                </Button>
            </div>

            {showForm && (
                <div className="mb-12 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold mb-6">{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                    <AddressForm
                        initialData={editingAddress}
                        onSuccess={() => { setShowForm(false); }}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.length === 0 && !showForm && (
                    <div className="col-span-full py-10">
                        <EmptyState
                            icon={MapPin}
                            title="No addresses saved"
                            description="You haven't added any delivery addresses yet."
                        />
                    </div>
                )}

                {addresses.map((address) => (
                    <div key={address._id} className={`bg-white p-6 rounded-3xl border-2 transition-all relative ${address.isDefault ? 'border-primary-600 ring-4 ring-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        {address.isDefault && (
                            <div className="absolute top-4 right-4 flex items-center bg-primary-100 text-primary-700 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Default
                            </div>
                        )}

                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-gray-50 rounded-xl text-gray-600">
                                {address.addressType === 'Home' ? <Home className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{address.fullName}</h3>
                                <p className="text-sm text-gray-500">{address.phoneNumber}</p>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 leading-relaxed mb-6">
                            {address.street}<br />
                            {address.city}, {address.state} - {address.postalCode}<br />
                            {address.country}<br />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => { setEditingAddress(address); setShowForm(true); }}
                                    className="text-sm font-bold text-primary-600 hover:underline"
                                >
                                    Edit
                                </button>
                                {!address.isDefault && (
                                    <button
                                        onClick={() => setDefaultAddress(address._id)}
                                        className="text-sm font-bold text-gray-500 hover:text-gray-700"
                                    >
                                        Set Default
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => handleDelete(address._id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
