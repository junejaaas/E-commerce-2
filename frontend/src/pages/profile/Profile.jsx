import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { User, Mail, Shield, Camera, Package, MapPin, HelpCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import API from '../../services/api'
import toast from 'react-hot-toast'

export default function Profile() {
    const { user, fetchMe } = useAuthStore()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: user?.name,
            email: user?.email
        }
    })

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            await API.patch('/users/me', data)
            await fetchMe()
            toast.success('Profile updated successfully')
        } catch (error) {
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <h1 className="text-4xl font-black text-gray-900 mb-10">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                        <div className="relative inline-block mb-4">
                            <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-black text-primary-600 uppercase border-4 border-white shadow-lg">
                                {user?.name?.charAt(0)}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg border-2 border-white hover:bg-primary-700 transition-colors">
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                        <div className="mt-4 inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider">
                            <Shield className="h-3 w-3 mr-1" /> {user?.role}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                        <Link to="/orders" className="flex items-center p-4 hover:bg-gray-50 transition-colors text-gray-600 font-bold text-sm">
                            <Package className="h-5 w-5 mr-3 text-gray-400" /> My Orders
                        </Link>
                        <Link to="/addresses" className="flex items-center p-4 hover:bg-gray-50 transition-colors text-gray-600 font-bold text-sm">
                            <MapPin className="h-5 w-5 mr-3 text-gray-400" /> Addresses
                        </Link>
                        <Link to="/support/tickets" className="flex items-center p-4 hover:bg-gray-50 transition-colors text-gray-600 font-bold text-sm">
                            <HelpCircle className="h-5 w-5 mr-3 text-gray-400" /> Support Tickets
                        </Link>
                    </div>
                </div>

                {/* Form */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Personal Information</h4>

                        <Input
                            label="Full Name"
                            placeholder="Your Name"
                            error={errors.name?.message}
                            {...register('name', { required: 'Name is required' })}
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="your@email.com"
                            disabled
                            {...register('email')}
                        />

                        <div className="pt-6 border-t border-gray-100">
                            <Button type="submit" isLoading={loading} className="w-full sm:w-auto px-10 rounded-xl font-bold">
                                Update Profile
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
